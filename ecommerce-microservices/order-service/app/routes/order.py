from fastapi import APIRouter, HTTPException, Depends, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.order import OrderCreate, OrderResponse
from app.db import get_database
from bson import ObjectId
from datetime import datetime, timezone
import os, base64, hmac, hashlib, json, httpx

order_router = APIRouter(prefix="/orders", tags=["orders"])
security = HTTPBearer()

PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://product-service:8002")
NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://notification-service:8004")

def verify_jwt(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    secret = os.getenv("JWT_SECRET", "supersecretkey_please_change_in_prod")
    try:
        parts = token.split('.')
        if len(parts) != 3:
            raise Exception("Invalid token format")
            
        header_b64, payload_b64, signature_b64 = parts
        message = f"{header_b64}.{payload_b64}".encode('utf-8')
        
        def _pad(s): return s + '=' * (4 - len(s) % 4) if len(s) % 4 != 0 else s
        
        sig = base64.urlsafe_b64decode(_pad(signature_b64))
        expected_sig = hmac.new(secret.encode('utf-8'), message, hashlib.sha256).digest()
        
        if not hmac.compare_digest(sig, expected_sig):
            raise Exception("Invalid signature")
            
        payload = json.loads(base64.urlsafe_b64decode(_pad(payload_b64)).decode('utf-8'))
        
        if 'exp' in payload:
            exp = payload['exp']
            if datetime.now(timezone.utc).timestamp() > exp:
                raise Exception("Token expired")
                
        return {"user_id": payload.get("sub"), "token": token}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@order_router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate, user_info: dict = Depends(verify_jwt)):
    user_id = user_info["user_id"]
    token = user_info["token"]
    
    total = 0.0
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Verify stock and prepare updates
        for item in order.items:
            # check product stock
            res = await client.get(f"{PRODUCT_SERVICE_URL}/products/{item.product_id}")
            if res.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found or error")
            prod = res.json()
            if prod["stock"] < item.qty:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for product {item.product_id}")
            
            total += item.qty * item.price
            
            # Reduce stock via PUT
            new_stock = prod["stock"] - item.qty
            update_res = await client.put(
                f"{PRODUCT_SERVICE_URL}/products/{item.product_id}", 
                json={"stock": new_stock}
            )
            if update_res.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Failed to update stock for {item.product_id}")

    # Create order
    db = get_database()
    order_dict = order.model_dump()
    order_dict["user_id"] = user_id
    order_dict["total"] = total
    order_dict["status"] = "created"
    order_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await db.orders.insert_one(order_dict)
    
    # Notify
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            await client.post(
                f"{NOTIFICATION_SERVICE_URL}/notify",
                json={
                    "user_id": user_id,
                    "type": "ORDER_CONFIRMATION",
                    "message": f"Order {str(result.inserted_id)} created successfully"
                }
            )
        except Exception as e:
            print(f"Failed to send notification: {e}")
            
    created_order = await db.orders.find_one({"_id": result.inserted_id})
    created_order["id"] = str(created_order.pop("_id"))
    return created_order

@order_router.get("", response_model=list[OrderResponse])
async def list_orders(user_info: dict = Depends(verify_jwt)):
    db = get_database()
    cursor = db.orders.find({"user_id": user_info["user_id"]})
    orders = await cursor.to_list(length=100)
    for o in orders:
        o["id"] = str(o.pop("_id"))
    return orders

@order_router.get("/{id}", response_model=OrderResponse)
async def get_order(id: str, user_info: dict = Depends(verify_jwt)):
    db = get_database()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    order = await db.orders.find_one({"_id": ObjectId(id), "user_id": user_info["user_id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order["id"] = str(order.pop("_id"))
    return order

@order_router.put("/{id}/cancel", response_model=OrderResponse)
async def cancel_order(id: str, user_info: dict = Depends(verify_jwt)):
    db = get_database()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    order = await db.orders.find_one({"_id": ObjectId(id), "user_id": user_info["user_id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.get("status") == "cancelled":
        raise HTTPException(status_code=400, detail="Order already cancelled")
        
    # Restore stock
    async with httpx.AsyncClient(timeout=10.0) as client:
        for item in order["items"]:
            try:
                res = await client.get(f"{PRODUCT_SERVICE_URL}/products/{item['product_id']}")
                if res.status_code == 200:
                    prod = res.json()
                    new_stock = prod["stock"] + item["qty"]
                    await client.put(
                        f"{PRODUCT_SERVICE_URL}/products/{item['product_id']}", 
                        json={"stock": new_stock}
                    )
            except Exception as e:
                print(f"Failed to restore stock for {item['product_id']}: {e}")
                
    result = await db.orders.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": "cancelled"}}
    )
    
    updated_order = await db.orders.find_one({"_id": ObjectId(id)})
    updated_order["id"] = str(updated_order.pop("_id"))
    return updated_order

import os
import httpx
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from jose import JWTError, jwt

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "orders_db"
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtkey_123")
ALGORITHM = "HS256"

PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8002")
NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://localhost:8004")

app = FastAPI(title="Order Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client: AsyncIOMotorClient = None
db = None

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    price: float
    name: str

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_amount: float

class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total_amount: float
    status: str
    created_at: str

@app.on_event("startup")
async def startup_db_client():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

def get_current_user_id(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Unauthorized")

def parse_order(order) -> OrderResponse:
    return OrderResponse(
        id=str(order["_id"]),
        user_id=order["user_id"],
        items=order["items"],
        total_amount=order["total_amount"],
        status=order["status"],
        created_at=order["created_at"].isoformat() if isinstance(order["created_at"], datetime) else order["created_at"]
    )

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "order-service"}

@app.post("/orders", response_model=OrderResponse)
async def create_order(order: OrderCreate, user_id: str = Depends(get_current_user_id)):
    async with httpx.AsyncClient(timeout=10.0) as http:
        # Verify Product Stocks
        for item in order.items:
            try:
                res = await http.get(f"{PRODUCT_SERVICE_URL}/products/{item.product_id}")
                if res.status_code != 200:
                    raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
                prod = res.json()
                if prod["stock"] < item.quantity:
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for {prod['name']}")
            except httpx.RequestError as e:
                print(f"Error checking stock: {e}")
                raise HTTPException(status_code=503, detail="Product Service unavailable")
        
        # Decrement Stocks
        for item in order.items:
            try:
                # Need to read stock, subtract, output
                res = await http.get(f"{PRODUCT_SERVICE_URL}/products/{item.product_id}")
                prod = res.json()
                new_stock = prod["stock"] - item.quantity
                await http.put(f"{PRODUCT_SERVICE_URL}/products/{item.product_id}", json={"stock": new_stock})
            except Exception as e:
                print(f"Error updating stock: {e}")

        # Create Order
        order_dict = order.model_dump()
        order_dict["user_id"] = user_id
        order_dict["status"] = "confirmed"
        order_dict["created_at"] = datetime.utcnow()
        
        inserted = await db.orders.insert_one(order_dict)
        order_dict["_id"] = inserted.inserted_id
        
        # Notify user (fire and forget / gracefully handle failure)
        try:
            await http.post(f"{NOTIFICATION_SERVICE_URL}/notify", json={
                "user_id": user_id,
                "message": f"Your order {str(inserted.inserted_id)} has been placed for ${order_dict['total_amount']}.",
                "type": "order_placed"
            })
        except httpx.RequestError as e:
            print(f"Notification service unavailable: {e}, continuing...")

        return parse_order(order_dict)

@app.get("/orders", response_model=List[OrderResponse])
async def list_orders(user_id: str = Depends(get_current_user_id)):
    cursor = db.orders.find({"user_id": user_id}).sort("created_at", -1)
    orders = await cursor.to_list(length=100)
    return [parse_order(o) for o in orders]

@app.get("/orders/{id}", response_model=OrderResponse)
async def get_order(id: str, user_id: str = Depends(get_current_user_id)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    order = await db.orders.find_one({"_id": ObjectId(id), "user_id": user_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return parse_order(order)

@app.put("/orders/{id}/cancel", response_model=OrderResponse)
async def cancel_order(id: str, user_id: str = Depends(get_current_user_id)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    order = await db.orders.find_one({"_id": ObjectId(id), "user_id": user_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Order already cancelled")
        
    # Restore stock
    async with httpx.AsyncClient(timeout=10.0) as http:
        for item in order["items"]:
            try:
                res = await http.get(f"{PRODUCT_SERVICE_URL}/products/{item['product_id']}")
                if res.status_code == 200:
                    prod = res.json()
                    new_stock = prod["stock"] + item["quantity"]
                    await http.put(f"{PRODUCT_SERVICE_URL}/products/{item['product_id']}", json={"stock": new_stock})
            except Exception as e:
                print(f"Failed to restore stock: {e}")
                
    await db.orders.update_one({"_id": ObjectId(id)}, {"$set": {"status": "cancelled"}})
    order["status"] = "cancelled"
    return parse_order(order)

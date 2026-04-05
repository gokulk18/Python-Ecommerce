from fastapi import APIRouter, Header, HTTPException
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import httpx
import logging
from app.models.order import OrderModel, OrderCreate, OrderItem
from app.db import orders_collection
from app.config import settings

router = APIRouter(prefix="/orders", tags=["orders"])
logger = logging.getLogger(__name__)

def map_order(doc) -> OrderModel:
    return OrderModel(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        items=doc["items"],
        total=doc["total"],
        status=doc.get("status", "pending"),
        created_at=doc.get("created_at", datetime.utcnow())
    )

@router.post("", response_model=OrderModel)
async def create_order(order: OrderCreate):
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Verify stock and calculate total
        total = 0.0
        final_items = []
        for item in order.items:
            try:
                resp = await client.get(f"{settings.PRODUCT_SERVICE_URL}/products/{item.product_id}")
                if resp.status_code != 200:
                    raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found or error")
                
                prod_data = resp.json()
                if prod_data.get("stock", 0) < item.qty:
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for product {item.product_id}")
                    
                total += prod_data.get("price", 0) * item.qty
                final_items.append(
                    OrderItem(
                        product_id=item.product_id,
                        price=prod_data.get("price", 0),
                        name=prod_data.get("name", "Unknown"),
                        qty=item.qty
                    )
                )
            except httpx.RequestError:
                 raise HTTPException(status_code=503, detail="Product service unavailable")

        # Place order
        order_dict = {
            "user_id": order.user_id,
            "items": [i.model_dump() for i in final_items],
            "total": total,
            "status": "confirmed",
            "created_at": datetime.utcnow()
        }
        result = await orders_collection.insert_one(order_dict)
        
        # Decrement stock
        for item in final_items:
            try:
                curr_resp = await client.get(f"{settings.PRODUCT_SERVICE_URL}/products/{item.product_id}")
                if curr_resp.status_code == 200:
                    curr_stock = curr_resp.json().get("stock", 0)
                    await client.put(
                        f"{settings.PRODUCT_SERVICE_URL}/products/{item.product_id}",
                        json={"stock": curr_stock - item.qty}
                    )
            except Exception as e:
                logger.error(f"Failed to decrement stock for {item.product_id}: {e}")

        # Send notification
        try:
            await client.post(
                f"{settings.NOTIFICATION_SERVICE_URL}/notify",
                json={
                    "user_id": order.user_id,
                    "message": f"Order {result.inserted_id} confirmed for total ${total:.2f}"
                }
            )
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            
    created = await orders_collection.find_one({"_id": result.inserted_id})
    return map_order(created)

@router.get("", response_model=List[OrderModel])
async def list_orders(x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing X-User-Id")
    cursor = orders_collection.find({"user_id": x_user_id}).sort("created_at", -1)
    orders = await cursor.to_list(length=100)
    return [map_order(o) for o in orders]

@router.get("/all", response_model=List[OrderModel])
async def list_all_orders():
    cursor = orders_collection.find().sort("created_at", -1)
    orders = await cursor.to_list(length=1000)
    return [map_order(o) for o in orders]

@router.get("/{id}", response_model=OrderModel)
async def get_order(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    order = await orders_collection.find_one({"_id": ObjectId(id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return map_order(order)

from pydantic import BaseModel
class OrderStatusUpdate(BaseModel):
    status: str

@router.put("/{id}/status", response_model=OrderModel)
async def update_order_status(id: str, status_update: OrderStatusUpdate):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
        
    result = await orders_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": status_update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
        
    updated = await orders_collection.find_one({"_id": ObjectId(id)})
    return map_order(updated)

@router.put("/{id}/cancel", response_model=OrderModel)
async def cancel_order(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
        
    order = await orders_collection.find_one({"_id": ObjectId(id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.get("status") == "cancelled":
        raise HTTPException(status_code=400, detail="Order already cancelled")
        
    await orders_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": "cancelled"}}
    )
    
    # Restore stock
    async with httpx.AsyncClient(timeout=10.0) as client:
        for item in order.get("items", []):
            try:
                curr_resp = await client.get(f"{settings.PRODUCT_SERVICE_URL}/products/{item['product_id']}")
                if curr_resp.status_code == 200:
                    curr_stock = curr_resp.json().get("stock", 0)
                    await client.put(
                        f"{settings.PRODUCT_SERVICE_URL}/products/{item['product_id']}",
                        json={"stock": curr_stock + item['qty']}
                    )
            except Exception as e:
                logger.error(f"Failed to restore stock for {item['product_id']}: {e}")

        # Notification
        try:
            await client.post(
                f"{settings.NOTIFICATION_SERVICE_URL}/notify",
                json={
                    "user_id": order["user_id"],
                    "message": f"Order {id} cancelled"
                }
            )
        except Exception as e:
            logger.error(f"Failed to send cancellation notification: {e}")
            
    updated = await orders_collection.find_one({"_id": ObjectId(id)})
    return map_order(updated)

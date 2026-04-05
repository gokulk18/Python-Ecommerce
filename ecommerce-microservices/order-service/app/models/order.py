from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItem(BaseModel):
    product_id: str
    price: float
    name: str # snapshotted name
    qty: int

class OrderItemRequest(BaseModel):
    product_id: str
    qty: int

class OrderCreate(BaseModel):
    user_id: str
    items: List[OrderItemRequest]

class OrderModel(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total: float
    status: str # pending, confirmed, cancelled
    created_at: datetime

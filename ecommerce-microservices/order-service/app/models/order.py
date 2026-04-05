from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List, Optional

class OrderItem(BaseModel):
    product_id: str
    qty: int = Field(..., gt=0)
    price: float = Field(..., gt=0)

class OrderCreate(BaseModel):
    items: List[OrderItem] = Field(..., min_length=1)

class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total: float
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ProductModel(BaseModel):
    id: str
    name: str
    description: str
    price: float
    stock: int
    category: str
    image_url: str
    is_deleted: bool
    created_at: datetime
    
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str
    image_url: str

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None

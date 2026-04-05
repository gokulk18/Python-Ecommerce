from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List, Optional

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2)
    description: str
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    category: str
    images: List[str] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    category: Optional[str] = None
    images: Optional[List[str]] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    stock: int
    category: str
    images: List[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

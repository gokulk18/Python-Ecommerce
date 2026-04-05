from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from app.models.product import ProductModel, ProductCreate, ProductUpdate
from app.db import products_collection

router = APIRouter(prefix="/products", tags=["products"])

def map_product(doc) -> ProductModel:
    return ProductModel(
        id=str(doc["_id"]),
        name=doc["name"],
        description=doc["description"],
        price=doc["price"],
        stock=doc["stock"],
        category=doc["category"],
        image_url=doc.get("image_url", ""),
        is_deleted=doc.get("is_deleted", False),
        created_at=doc.get("created_at", datetime.utcnow())
    )

@router.get("", response_model=List[ProductModel])
async def list_products(skip: int = 0, limit: int = 20, category: Optional[str] = None):
    query = {"is_deleted": {"$ne": True}}
    if category:
        query["category"] = category
        
    cursor = products_collection.find(query).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    return [map_product(p) for p in products]

@router.get("/all", response_model=List[ProductModel])
async def list_all_products(skip: int = 0, limit: int = 1000):
    cursor = products_collection.find().skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    return [map_product(p) for p in products]

@router.get("/{id}", response_model=ProductModel)
async def get_product(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    product = await products_collection.find_one({"_id": ObjectId(id), "is_deleted": {"$ne": True}})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return map_product(product)

@router.post("", response_model=ProductModel)
async def create_product(product: ProductCreate):
    product_dict = product.model_dump()
    product_dict["is_deleted"] = False
    product_dict["created_at"] = datetime.utcnow()
    
    result = await products_collection.insert_one(product_dict)
    created = await products_collection.find_one({"_id": result.inserted_id})
    return map_product(created)

@router.put("/{id}", response_model=ProductModel)
async def update_product(id: str, product_update: ProductUpdate):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    update_data = {k: v for k, v in product_update.model_dump().items() if v is not None}
    if not update_data:
        existing = await products_collection.find_one({"_id": ObjectId(id)})
        return map_product(existing)
        
    result = await products_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
        
    updated = await products_collection.find_one({"_id": ObjectId(id)})
    return map_product(updated)

@router.delete("/{id}")
async def delete_product(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
        
    result = await products_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"is_deleted": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return {"message": "Product soft deleted"}

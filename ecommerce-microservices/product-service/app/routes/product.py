from fastapi import APIRouter, HTTPException, Depends, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.product import ProductCreate, ProductUpdate, ProductResponse
from app.db import get_database
from bson import ObjectId
from datetime import datetime, timezone
import os, base64, hmac, hashlib, json

product_router = APIRouter(prefix="/products", tags=["products"])
security = HTTPBearer()

def verify_jwt(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    secret = os.getenv("JWT_SECRET", "supersecretkey_please_change_in_prod")
    try:
        parts = token.split('.')
        if len(parts) != 3:
            raise Exception("Invalid token format")
            
        header_b64, payload_b64, signature_b64 = parts
        message = f"{header_b64}.{payload_b64}".encode('utf-8')
        
        # pad base64
        def _pad(s): return s + '=' * (4 - len(s) % 4) if len(s) % 4 != 0 else s
        
        sig = base64.urlsafe_b64decode(_pad(signature_b64))
        expected_sig = hmac.new(secret.encode('utf-8'), message, hashlib.sha256).digest()
        
        if not hmac.compare_digest(sig, expected_sig):
            raise Exception("Invalid signature")
            
        payload = json.loads(base64.urlsafe_b64decode(_pad(payload_b64)).decode('utf-8'))
        
        # Check exp
        if 'exp' in payload:
            exp = payload['exp']
            if datetime.now(timezone.utc).timestamp() > exp:
                raise Exception("Token expired")
                
        return payload.get("sub")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@product_router.get("", response_model=list[ProductResponse])
async def list_products(skip: int = 0, limit: int = 20):
    db = get_database()
    cursor = db.products.find({"deleted_at": {"$exists": False}}).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    for p in products:
        p["id"] = str(p.pop("_id"))
    return products

@product_router.get("/{id}", response_model=ProductResponse)
async def get_product(id: str):
    db = get_database()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    product = await db.products.find_one({"_id": ObjectId(id), "deleted_at": {"$exists": False}})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product["id"] = str(product.pop("_id"))
    return product

@product_router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, user_id: str = Depends(verify_jwt)):
    db = get_database()
    prod_dict = product.model_dump()
    prod_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await db.products.insert_one(prod_dict)
    created_prod = await db.products.find_one({"_id": result.inserted_id})
    created_prod["id"] = str(created_prod.pop("_id"))
    return created_prod

@product_router.put("/{id}", response_model=ProductResponse)
async def update_product(id: str, update_data: ProductUpdate):
    db = get_database()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields provided")
        
    result = await db.products.update_one(
        {"_id": ObjectId(id), "deleted_at": {"$exists": False}}, {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
        
    updated_prod = await db.products.find_one({"_id": ObjectId(id)})
    updated_prod["id"] = str(updated_prod.pop("_id"))
    return updated_prod

@product_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(id: str):
    db = get_database()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.products.update_one(
        {"_id": ObjectId(id), "deleted_at": {"$exists": False}},
        {"$set": {"deleted_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return

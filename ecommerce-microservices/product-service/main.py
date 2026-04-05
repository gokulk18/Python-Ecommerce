import os
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "products_db"
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtkey_123")

app = FastAPI(title="Product Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client: AsyncIOMotorClient = None
db = None

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

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    stock: int
    category: str
    image_url: str
    is_deleted: bool
    created_at: str

# Example seeds
SEED_PRODUCTS = [
    {"name": "Nexus Quantum Pro", "description": "Next-gen computing.", "price": 1999.99, "stock": 50, "category": "Laptops", "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80"},
    {"name": "Void Goggles", "description": "Immersive VR headset.", "price": 499.00, "stock": 120, "category": "Gaming", "image_url": "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=80"},
    {"name": "Singularity Watch", "description": "Time. Reimagined.", "price": 299.50, "stock": 200, "category": "Wearables", "image_url": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80"},
    {"name": "Neural Link Headphones", "description": "Listen to your thoughts.", "price": 349.99, "stock": 80, "category": "Audio", "image_url": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80"},
    {"name": "Neon Mechanical Keyboard", "description": "Tactile response. RGB lit.", "price": 149.99, "stock": 150, "category": "Accessories", "image_url": "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80"},
    {"name": "Titanium Mobile Core", "description": "Indestructible phone.", "price": 899.00, "stock": 60, "category": "Phones", "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"},
    {"name": "Holo-Display Monitor", "description": "32-inch 8K holographic display.", "price": 1299.00, "stock": 30, "category": "Displays", "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80"},
    {"name": "Cyberspace Router", "description": "Zero latency routing.", "price": 199.99, "stock": 300, "category": "Networking", "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"},
    {"name": "Plasma Mouse", "description": "Ultra lightweight esports mouse.", "price": 89.99, "stock": 250, "category": "Accessories", "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80"},
    {"name": "Zero-G Chair", "description": "Ergonomic levitating seat.", "price": 599.00, "stock": 20, "category": "Furniture", "image_url": "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80"}
]

@app.on_event("startup")
async def startup_db_client():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    count = await db.products.count_documents({})
    if count == 0:
        for p in SEED_PRODUCTS:
            p["is_deleted"] = False
            p["created_at"] = datetime.utcnow()
        await db.products.insert_many(SEED_PRODUCTS)
        print("Seeded database with 10 products")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

def parse_product(prod) -> ProductResponse:
    return ProductResponse(
        id=str(prod["_id"]),
        name=prod["name"],
        description=prod["description"],
        price=prod["price"],
        stock=prod["stock"],
        category=prod["category"],
        image_url=prod["image_url"],
        is_deleted=prod.get("is_deleted", False),
        created_at=prod["created_at"].isoformat() if isinstance(prod["created_at"], datetime) else prod["created_at"]
    )

def verify_jwt(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    # A bit naive check since we are simulating admin access, 
    # normally we would check roles in the parsed token.
    return True

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "product-service"}

@app.get("/products", response_model=List[ProductResponse])
async def list_products(skip: int = 0, limit: int = 20, category: Optional[str] = None):
    query = {"is_deleted": {"$ne": True}}
    if category:
        query["category"] = category
        
    cursor = db.products.find(query).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    return [parse_product(p) for p in products]

@app.get("/products/{id}", response_model=ProductResponse)
async def get_product(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    prod = await db.products.find_one({"_id": ObjectId(id)})
    if not prod or prod.get("is_deleted"):
        raise HTTPException(status_code=404, detail="Product not found")
    return parse_product(prod)

@app.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate, _: bool = Depends(verify_jwt)):
    prod_dict = product.model_dump()
    prod_dict["is_deleted"] = False
    prod_dict["created_at"] = datetime.utcnow()
    
    res = await db.products.insert_one(prod_dict)
    prod_dict["_id"] = res.inserted_id
    return parse_product(prod_dict)

@app.put("/products/{id}", response_model=ProductResponse)
async def update_product(id: str, product: ProductUpdate):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    if not update_data:
        return await get_product(id)
        
    await db.products.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )
    return await get_product(id)

@app.delete("/products/{id}")
async def delete_product(id: str, _: bool = Depends(verify_jwt)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    res = await db.products.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"is_deleted": True}}
    )
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "deleted"}

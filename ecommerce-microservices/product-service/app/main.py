from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import products
from app.db import products_collection
from datetime import datetime
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed products
    count = await products_collection.count_documents({})
    if count == 0:
        names = [
            "Quantum Laptop Pro", "Neon Mechanical Keyboard", "Holographic Smartwatch", 
            "Noise-Canceling Wireless Earbuds", "Ultra-Wide Gaming Monitor", "Ergonomic Mesh Chair",
            "Smart Home Hub Controller", "Portable Power Station", "VR Headset Kit",
            "4K Action Camera", "Smart Thermostat", "Drone with 8K Camera"
        ]
        categories = ["Electronics", "Electronics", "Wearables", "Electronics", "Electronics", "Furniture", "Smart Home", "Electronics", "Electronics", "Electronics", "Smart Home", "Electronics"]
        desc = [
            "Experience the future with our next-gen quantum processor.",
            "Clicky switches with full RGB backlighting.",
            "Project your notifications right onto your wrist.",
            "Silence the world and hear pure, crisp audio.",
            "Immersive 34-inch curved display for intense gaming.",
            "Support your posture during long working hours.",
            "Control all your smart home devices from one center.",
            "Power your gear anywhere with 500Wh capacity.",
            "Dive into virtual worlds with ultra-low latency.",
            "Capture your adventures in stunning 4K 60fps.",
            "Save energy with AI-powered temperature control.",
            "Aerial photography taken to the next level."
        ]
        prices = [1999.99, 129.99, 299.99, 149.99, 499.99, 259.99, 89.99, 399.99, 599.99, 249.99, 119.99, 899.99]
        
        sample_products = [
            {
                "name": names[i],
                "description": desc[i],
                "price": prices[i],
                "stock": 50 + (i * 10),
                "category": categories[i],
                "image_url": f"https://picsum.photos/seed/{names[i].replace(' ', '')}/400/400",
                "is_deleted": False,
                "created_at": datetime.utcnow()
            }
            for i in range(12)
        ]
        await products_collection.insert_many(sample_products)
        print("Database seeded with 12 sample products.")
    yield

app = FastAPI(title="Product Service", description="Nexus Store Product Microservice", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "product-service"}

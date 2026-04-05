from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, users
from app.db import users_collection
from passlib.context import CryptContext
from contextlib import asynccontextmanager

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed default admin user
    admin_email = "admin@nexus.com"
    existing = await users_collection.find_one({"email": admin_email})
    if not existing:
        admin_user = {
            "name": "Admin User",
            "email": admin_email,
            "password": pwd_context.hash("admin123"),
            "is_admin": True
        }
        await users_collection.insert_one(admin_user)
        print(f"Default admin seeded: {admin_email}")
    yield

app = FastAPI(title="User Service", description="Nexus Store User Microservice", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "user-service"}

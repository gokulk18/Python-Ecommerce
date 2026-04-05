import os
from typing import List
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "notifications_db"

app = FastAPI(title="Notification Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client: AsyncIOMotorClient = None
db = None

class NotificationCreate(BaseModel):
    user_id: str
    message: str
    type: str

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    message: str
    type: str
    created_at: str

@app.on_event("startup")
async def startup_db_client():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

def parse_notification(n) -> NotificationResponse:
    return NotificationResponse(
        id=str(n["_id"]),
        user_id=n["user_id"],
        message=n["message"],
        type=n["type"],
        created_at=n["created_at"].isoformat() if isinstance(n["created_at"], datetime) else n["created_at"]
    )

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "notification-service"}

@app.post("/notify", response_model=NotificationResponse)
async def fetch_notify(notif: NotificationCreate):
    # Simulate email logging
    print(f"---- SENDING NOTIFICATION TO USER {notif.user_id} ----")
    print(f"TYPE: {notif.type}")
    print(f"MESSAGE: {notif.message}")
    print(f"---------------------------------------------------")
    
    doc = notif.model_dump()
    doc["created_at"] = datetime.utcnow()
    res = await db.notifications.insert_one(doc)
    doc["_id"] = res.inserted_id
    
    return parse_notification(doc)

@app.get("/notifications/{user_id}", response_model=List[NotificationResponse])
async def list_notifications(user_id: str):
    cursor = db.notifications.find({"user_id": user_id}).sort("created_at", -1)
    notifs = await cursor.to_list(length=50)
    return [parse_notification(n) for n in notifs]

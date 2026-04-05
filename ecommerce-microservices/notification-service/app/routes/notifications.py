from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from app.models.notification import NotificationModel, NotificationCreate
from app.db import notifications_collection

router = APIRouter(prefix="", tags=["notifications"])

def map_notification(doc) -> NotificationModel:
    return NotificationModel(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        message=doc["message"],
        created_at=doc.get("created_at", datetime.utcnow())
    )

@router.post("/notify", response_model=NotificationModel)
async def create_notification(notification: NotificationCreate):
    notification_dict = notification.model_dump()
    notification_dict["created_at"] = datetime.utcnow()
    
    # Simulate email by logging to console
    print(f"[{datetime.utcnow().isoformat()}] NOTIFICATION for user_id={notification.user_id}: {notification.message}")
    
    result = await notifications_collection.insert_one(notification_dict)
    created = await notifications_collection.find_one({"_id": result.inserted_id})
    return map_notification(created)

@router.get("/notifications", response_model=List[NotificationModel])
async def get_all_notifications():
    cursor = notifications_collection.find().sort("created_at", -1)
    notifications = await cursor.to_list(length=1000)
    return [map_notification(n) for n in notifications]

@router.get("/notifications/{user_id}", response_model=List[NotificationModel])
async def get_user_notifications(user_id: str):
    cursor = notifications_collection.find({"user_id": user_id}).sort("created_at", -1)
    notifications = await cursor.to_list(length=100)
    return [map_notification(n) for n in notifications]

from fastapi import APIRouter, HTTPException, status
from app.models.notification import NotificationCreate, NotificationResponse
from app.db import get_database
from bson import ObjectId
from datetime import datetime, timezone

notification_router = APIRouter(tags=["notifications"])

@notification_router.post("/notify", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(notification: NotificationCreate):
    db = get_database()
    notif_dict = notification.model_dump()
    notif_dict["sent_at"] = datetime.now(timezone.utc)
    notif_dict["status"] = "sent"
    
    # Simulate email
    print(f"SIMULATING EMAIL SEND to user {notification.user_id}: [{notification.type}] {notification.message}")
    
    result = await db.notifications.insert_one(notif_dict)
    
    created_notif = await db.notifications.find_one({"_id": result.inserted_id})
    created_notif["id"] = str(created_notif.pop("_id"))
    return created_notif

@notification_router.get("/notifications/{user_id}", response_model=list[NotificationResponse])
async def list_notifications(user_id: str):
    db = get_database()
    cursor = db.notifications.find({"user_id": user_id})
    notifications = await cursor.to_list(length=100)
    for n in notifications:
        n["id"] = str(n.pop("_id"))
    return notifications

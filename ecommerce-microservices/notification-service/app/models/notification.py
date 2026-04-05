from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationModel(BaseModel):
    id: str
    user_id: str
    message: str
    created_at: datetime
    
class NotificationCreate(BaseModel):
    user_id: str
    message: str

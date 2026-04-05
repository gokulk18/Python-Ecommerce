from pydantic import BaseModel, ConfigDict
from datetime import datetime

class NotificationCreate(BaseModel):
    user_id: str
    type: str
    message: str

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    message: str
    sent_at: datetime
    status: str
    
    model_config = ConfigDict(from_attributes=True)

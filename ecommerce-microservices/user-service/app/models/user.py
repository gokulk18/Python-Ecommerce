from pydantic import BaseModel, EmailStr
from typing import Optional

class UserModelResponse(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    is_admin: bool

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

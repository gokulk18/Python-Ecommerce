from fastapi import APIRouter, Header, HTTPException
from typing import Optional, List
from bson import ObjectId
from app.models.user import UserModelResponse, UserUpdate
from app.db import users_collection

router = APIRouter(prefix="/users", tags=["users"])

async def get_user_by_id(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("", response_model=List[UserModelResponse])
async def list_users():
    cursor = users_collection.find()
    users = await cursor.to_list(length=1000)
    return [
        UserModelResponse(
            user_id=str(u["_id"]),
            name=u.get("name", ""),
            email=u.get("email", ""),
            is_admin=u.get("is_admin", False)
        ) for u in users
    ]

@router.get("/me", response_model=UserModelResponse)
async def get_me(x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id header missing")
    
    user = await get_user_by_id(x_user_id)
    return UserModelResponse(
        user_id=str(user["_id"]),
        name=user.get("name", ""),
        email=user.get("email", ""),
        is_admin=user.get("is_admin", False)
    )

@router.put("/me", response_model=UserModelResponse)
async def update_me(update_data: UserUpdate, x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id header missing")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await users_collection.update_one(
            {"_id": ObjectId(x_user_id)},
            {"$set": update_dict}
        )
    
    user = await get_user_by_id(x_user_id)
    return UserModelResponse(
        user_id=str(user["_id"]),
        name=user.get("name", ""),
        email=user.get("email", ""),
        is_admin=user.get("is_admin", False)
    )

@router.put("/{id}/admin", response_model=UserModelResponse)
async def toggle_admin(id: str):
    user = await get_user_by_id(id)
    current_status = user.get("is_admin", False)
    
    await users_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"is_admin": not current_status}}
    )
    
    user = await get_user_by_id(id)
    return UserModelResponse(
        user_id=str(user["_id"]),
        name=user.get("name", ""),
        email=user.get("email", ""),
        is_admin=user.get("is_admin", False)
    )

from fastapi import APIRouter, HTTPException, Depends, status
from app.models.user import UserCreate, UserLogin, UserResponse, UserUpdate, Token
from app.auth import get_password_hash, verify_password, create_access_token, verify_token
from app.db import get_database
from bson import ObjectId
from datetime import datetime, timezone

auth_router = APIRouter(prefix="/auth", tags=["auth"])
user_router = APIRouter(prefix="/users", tags=["users"])

@auth_router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    db = get_database()
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_dict = user.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user.pop("_id"))
    return created_user

@auth_router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db = get_database()
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": str(db_user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@user_router.get("/me", response_model=UserResponse)
async def read_users_me(user_id: str = Depends(verify_token)):
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user["id"] = str(user.pop("_id"))
    return user

@user_router.put("/me", response_model=UserResponse)
async def update_users_me(update_data: UserUpdate, user_id: str = Depends(verify_token)):
    db = get_database()
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    result = await db.users.update_one(
        {"_id": ObjectId(user_id)}, {"$set": update_dict}
    )
    
    if result.modified_count == 0 and result.matched_count == 0:
         raise HTTPException(status_code=404, detail="User not found")
         
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    user["id"] = str(user.pop("_id"))
    return user

from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from app.models.user import UserRegister, UserLogin, UserModelResponse
from app.db import users_collection

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register", response_model=UserModelResponse)
async def register_user(user_data: UserRegister):
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user_data.password)
    user_dict = user_data.model_dump()
    user_dict["password"] = hashed_password
    user_dict["is_admin"] = False
    
    result = await users_collection.insert_one(user_dict)
    
    return UserModelResponse(
        user_id=str(result.inserted_id),
        name=user_data.name,
        email=user_data.email,
        is_admin=False
    )

@router.post("/login", response_model=UserModelResponse)
async def login_user(user_data: UserLogin):
    user = await users_collection.find_one({"email": user_data.email})
    if not user or not pwd_context.verify(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return UserModelResponse(
        user_id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        is_admin=user.get("is_admin", False)
    )

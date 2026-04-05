from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import notifications

app = FastAPI(title="Notification Service", description="Nexus Store Notification Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notifications.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "notification-service"}

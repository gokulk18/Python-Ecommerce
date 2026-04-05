from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import admin

app = FastAPI(title="Admin Service", description="Nexus Store Admin Data Aggregator Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "admin-service"}

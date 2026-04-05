from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import orders

app = FastAPI(title="Order Service", description="Nexus Store Order Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "order-service"}

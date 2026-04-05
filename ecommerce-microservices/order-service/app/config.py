import os

class Settings:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27019")
    PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8002")
    NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://localhost:8004")

settings = Settings()

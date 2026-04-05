import os

class Settings:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27020")

settings = Settings()

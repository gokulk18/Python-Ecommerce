import os

class Settings:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27018")

settings = Settings()

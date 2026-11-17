import os
from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "ecuview-secret-key-change-in-production-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
# Single upload limit (DAT/MDF files)
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", str(50 * 1024 * 1024)))  # 50MB
# Total storage per user
MAX_USER_STORAGE = int(os.getenv("MAX_USER_STORAGE", str(100 * 1024 * 1024)))  # 100MB

os.makedirs(UPLOAD_DIR, exist_ok=True)


def format_bytes(num: int) -> str:
    if num < 1024:
        return f"{num} B"
    if num < 1024 * 1024:
        return f"{num / 1024:.1f} KB"
    return f"{num / (1024 * 1024):.1f} MB"

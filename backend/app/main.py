"""Khởi tạo FastAPI app."""
from fastapi import FastAPI

from app.api.router import router
from app.config import settings

app = FastAPI(title=settings.app_name, version="0.1.0")
app.include_router(router)

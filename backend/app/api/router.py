from fastapi import APIRouter

from app.api.health import router as health_router
from app.api.chemicals import router as chemicals_router
from app.api.videos import router as videos_router

router = APIRouter()
router.include_router(health_router)
router.include_router(chemicals_router)
router.include_router(videos_router)

#from celery import Celery

from app.config import settings

celery_app = Celery("chemistry_video", broker=settings.redis_url)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    task_ignore_result=True, 
    worker_prefetch_multiplier=1,
)


@celery_app.task(name="generate_video")
def generate_video_task(job_id: str) -> None:
    pass

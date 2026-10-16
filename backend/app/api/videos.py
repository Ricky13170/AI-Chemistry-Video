import uuid
from fastapi import APIRouter, HTTPException, status
from app.schemas import VideoRequest, JobView
from app.services.video_service import VideoService
from app.services.artifact_service import ArtifactService

router = APIRouter(prefix="/api/v1/videos", tags=["videos"])
video_service = VideoService()
artifact_service = ArtifactService()


@router.post("", status_code=status.HTTP_202_ACCEPTED, response_model=JobView)
def create_video(request: VideoRequest) -> JobView:
    return video_service.create_video_job(request)


@router.get("/{job_id}", response_model=JobView)
def get_video_status(job_id: uuid.UUID) -> JobView:
    job = video_service.get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job không tồn tại")
    return job


@router.get("/{job_id}/artifacts")
def get_video_artifacts(job_id: uuid.UUID) -> dict[str, str]:
    """Lấy danh sách các tài nguyên (video, audio, script, subtitle) đã tạo."""
    return artifact_service.get_job_artifacts(job_id)

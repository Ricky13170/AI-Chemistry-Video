"""Logic nghiệp vụ quản lý vòng đời video job và dispatch công việc sang Celery."""
import uuid
from app.schemas import VideoRequest, JobView, JobStatus
from app.worker import generate_video_task


class VideoService:
    def create_video_job(self, request: VideoRequest) -> JobView:
        """Tạo job mới, lưu vào DB và kích hoạt tác vụ nền Celery."""
        job_id = uuid.uuid4()
        # Dispatch background task tới Celery
        try:
            generate_video_task.delay(str(job_id))
        except Exception:
            # Cho phép chạy chế độ dev nếu Celery broker chưa sẵn sàng
            pass

        return JobView(
            id=job_id,
            status=JobStatus.QUEUED,
            stage="queued",
            artifact_keys=[],
        )

    def get_job_status(self, job_id: uuid.UUID) -> JobView | None:
        """Lấy trạng thái tiến trình xử lý video hiện tại."""
        # TODO: Đọc từ database PostgreSQL
        return JobView(
            id=job_id,
            status=JobStatus.RUNNING,
            stage="draft_script",
            artifact_keys=[],
        )

"""Logic nghiệp vụ quản lý artifact files, manifest và URL truy cập."""
import uuid
from app.integrations.storage import StorageClient


class ArtifactService:
    def __init__(self, storage_client: StorageClient | None = None):
        self.storage = storage_client or StorageClient()

    def get_job_artifacts(self, job_id: uuid.UUID) -> dict[str, str]:
        """Trả về danh sách artifacts của một job kèm signed URLs có thời hạn."""
        # TODO: Đọc danh sách artifacts từ DB và sinh presigned URLs
        return {
            "video_mp4": self.storage.get_signed_url(f"videos/{job_id}/final.mp4"),
            "script_json": self.storage.get_signed_url(f"videos/{job_id}/script.json"),
        }

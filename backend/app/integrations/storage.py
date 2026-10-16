"""Adapter lưu trữ đối tượng (Object Storage): hỗ trợ Local Filesystem và S3-compatible storage."""
import os
from app.config import settings


class StorageClient:
    def __init__(self, backend: str = settings.storage_backend):
        self.backend = backend
        self.local_dir = settings.local_storage_dir

    def upload(self, local_path: str, object_key: str, content_type: str) -> str:
        """Upload file lên storage và trả về khóa định danh."""
        # TODO: Triển khai upload S3 hoặc lưu local directory
        return object_key

    def get_signed_url(self, object_key: str, expires_seconds: int = 900) -> str:
        """Sinh URL có chữ ký bảo mật và giới hạn thời gian truy cập cho artifact."""
        # TODO: Triển khai sinh pre-signed URL hoặc route download local
        return f"/artifacts/{object_key}"

"""Adapter kết nối Text-to-Speech (TTS) để tổng hợp giọng đọc và timing cho từng cảnh."""


class TTSClient:
    def __init__(self, provider: str = "default"):
        self.provider = provider

    def synthesize(self, text: str, voice_id: str | None, output_path: str) -> dict:
        """Tổng hợp giọng đọc từ văn bản và trả về đường dẫn file cùng độ dài thời gian thực tế."""
        # TODO: Triển khai gọi TTS API và đo thời lượng audio chính xác
        return {"audio_path": output_path, "duration_seconds": 0.0}

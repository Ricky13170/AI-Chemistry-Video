# API dự kiến — chỉ /health đã triển khai

| Method | Path | Kết quả |
|---|---|---|
| GET | /health | Liveness của process |
| GET | /api/v1/chemicals/resolve?q=... | Danh sách candidate để xác nhận |
| POST | /api/v1/videos | 202 + job_id + status_url sau khi ghi job/dispatch |
| GET | /api/v1/videos/{id} | Trạng thái, stage, kết quả hoặc lỗi |
| GET | /api/v1/videos/{id}/artifacts | Danh sách artifacts và URL có hạn |
| GET | /api/v1/voices | Voice được provider hỗ trợ |
| GET | /api/v1/videos/{id}/events | SSE tùy chọn, bổ sung sau polling |

POST body: chemical_cid đã xác nhận, language, voice_id tùy chọn,
narration_enabled, target_duration_seconds. Lưu `Idempotency-Key` cùng hash
request; trả lỗi nếu tái sử dụng key với payload khác.

Artifact kinds: video_mp4, script_json, script_txt, storyboard_json,
audio_wav/mp3, subtitles_srt/vtt, sources_json. Nếu không narration, không cần
audio artifact. Thời lượng cảnh cần khớp audio thật, không chỉ số giây LLM dự đoán.

Chưa có auth/authorization/rate limiting trong skeleton. Bổ sung trước khi mở
dịch vụ công khai, gồm kiểm tra ownership job khi trả artifacts.

# Các lát cắt triển khai

1. Chemistry: PubChem resolver, phân biệt formula/name, xử lý không tìm thấy và
   nhiều kết quả. Cache truy vấn và tôn trọng rate limit của nguồn.
2. Content: source snapshots + claims -> script JSON -> source-based checks.
   Bắt đầu bộ đánh giá bằng vài chất quen thuộc và các input dễ nhầm.
3. Media: template cảnh + cấu trúc đúng nguồn + một TTS -> FFmpeg -> MP4.
   Không voice vẫn phải render được video kèm chữ/phụ đề phù hợp.
4. Persistence: SQLAlchemy models + Alembic migrations, job service + repositories.
5. Orchestration: node implementations + graph + PostgreSQL checkpoint, worker
   task, retry/lease/idempotency/outbox hoặc recovery tối thiểu được ghi rõ.
6. UI: resolve/confirm -> options -> progress -> video/script/sources.
7. Kiểm tra: ambiguous entities, claim/source alignment, provider timeouts,
   redelivery không nhân side effects, MP4 probe, voice/duration/subtitle alignment.
8. Sau MVP: chỉnh script, voice mới, image API, RAG, SSE, reaction lookup.

Các file Python chỉ có docstring là vị trí triển khai có chủ ý. Skeleton hiện
chưa import chúng vào route hoặc worker để tránh nhận job mà không xử lý được.

# Kiến trúc và ranh giới

## Luồng ứng dụng

Web gửi query -> FastAPI gọi resolver -> trả candidate list -> người dùng chọn CID.
Web gửi CID và tùy chọn -> API ghi job -> Celery/Redis chuyển job ID sang worker.
Worker nạp job -> LangGraph chạy pipeline -> artifacts lên object storage -> job
chuyển completed. Web poll trạng thái rồi tải video/script/audio/sources bằng API.

API và worker cùng một codebase Python, không cần microservice cho từng node.
LLM, TTS, storage và render nằm sau provider interfaces để có thể thay đổi.

## Nội dung và nguồn

PUG REST để tra cứu định danh, thuộc tính và cấu trúc; PUG View để lấy annotations
và các tham chiếu tương ứng. Giữ URL, thời điểm truy xuất, section/passage và đơn
vị/điều kiện của giá trị. Một công thức có thể ra nhiều đồng phân/candidate. Nếu
input là hỗn hợp hoặc mô tả thành phần, yêu cầu làm rõ thay vì tự gán một CID.

Các số liệu đi từ dữ liệu có nguồn vào script. Mỗi claim nối source_ids; narrator
chỉ đọc script sau khi kiểm tra. Kiểm tra lại script sau khi LLM viết, không chỉ
kiểm tra dữ liệu trước bước viết. Một LLM thứ hai không phải bằng chứng độc lập.
Nếu thiếu nguồn, bỏ claim hoặc hỏi thêm. Danh sách link cuối video không thay thế
việc truy vết từng claim.

## Lưu trữ

PostgreSQL: chemicals, jobs, job_events, sources, claims, scripts, scenes,
artifacts; thêm bảng checkpoints của LangGraph riêng với business tables.
Redis: broker và cache có TTL; không là nguồn trạng thái job duy nhất.
Object storage: ảnh/audio/MP4/scripts JSON, manifests; DB lưu object key + metadata.
Không lưu presigned URL ngắn hạn làm định danh artifact lâu dài.

## Độ tin cậy

- Có timeout từng provider và giới hạn vòng sửa script/chi phí mỗi job.
- Retry lỗi tạm thời ở provider; giới hạn retry toàn job để tránh nhân số lần gọi.
- Claim job bằng DB lease để giảm chạy trùng khi redelivery; heartbeat và recovery.
- Stage key gồm job ID, stage, phiên bản input/prompt/model và các tùy chọn liên quan.
- Ghi artifact manifest cho từng stage; tận dụng provider idempotency khi có.
  Lưu checkpoint không tạo ra bảo đảm exactly-once cho side effect bên ngoài.
- Nếu DB ghi xong nhưng enqueue thất bại: dùng transactional outbox khi triển khai
  cơ chế tin cậy; MVP ít nhất có reconciler cho job queued chưa được dispatch.
- Đặt broker visibility timeout theo thực tế job, với worker lease/recovery tương ứng.
- Render ở thư mục tạm riêng theo job; kiểm tra ffprobe trước khi completed.
- Log job_id, stage, attempt, latency, model và chi phí; tránh log secret.

## Phạm vi phản ứng tùy chọn

Đặt dưới `features/reactions/`, tắt mặc định. Hai chất không xác định duy nhất sản
phẩm. Thiết kế chế độ tra cứu/giải thích phản ứng có nguồn, thể hiện điều kiện,
có thể trả nhiều khả năng, không phản ứng hoặc không đủ thông tin. MVP giới hạn
vào tập phản ứng giáo dục đã kiểm tra. Không dùng RDKit như công cụ dự đoán phản
ứng tổng quát và không dùng LLM để tự xác nhận sản phẩm.

## Chưa cần trong MVP

Vector DB riêng, Kubernetes, multi-agent tự do, model tự host hoặc pipeline text-
to-video toàn bộ. Nếu mở RAG từ tài liệu dài, bổ sung pgvector trong PostgreSQL
sau khi đã có bài toán retrieval và bộ đánh giá. Frontend dùng polling trước.

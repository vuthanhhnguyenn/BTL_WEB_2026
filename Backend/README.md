Luồng cơ bản:

User/Frontend gọi URL API
Controller nhận request đúng route (@GetMapping, @PostMapping...)
Controller gọi Service để xử lý nghiệp vụ
Service cần dữ liệu thì gọi Repository
Repository dùng JPA/Hibernate để query DB
Kết quả trả ngược lại: Repository -> Service -> Controller -> Frontend
Về JPA + Repository (cơ bản):

JPA là chuẩn ORM trong Java: map bảng DB thành class Java (Entity).

Ví dụ bảng rooms <-> class Room
Bạn thao tác object Java, Hibernate lo SQL phía dưới.
Repository là lớp truy cập dữ liệu.

Khi extends JpaRepository<Room, Long>, bạn có sẵn:
findById, findAll, save, deleteById...
Bạn cũng có thể tự tạo method query theo tên:
findTop12ByOrderByIdAsc()
Spring Data tự hiểu và sinh SQL tương ứng.
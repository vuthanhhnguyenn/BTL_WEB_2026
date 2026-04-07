không push trực tiếp lên main
mỗi task tạo 1 branch
frontend chỉ sửa frontend/
backend chỉ sửa backend/
trước khi merge thì pull/rebase từ main

Bắt đầu task cần tách branch:

git checkout main
git pull origin main
git checkout -b feature/frontend-login #ví dụ làm frontend (đây là ước tạo branch mới để ko bị conflict)

Làm xong thì: 

git add .
git commit -m "Viết commit rõ ràng"
git checkout main
git pull origin main
git checkout feature/frontend-login #ví dụ backend là git checkout feature/backend-api 
git rebase main
git push -u origin feature/frontend-login #brach mới

Luồng cơ bản

JavaScript frontend -> gọi /api/users
Spring Boot Controller -> nhận request
Service -> xử lý nghiệp vụ
Repository (JPA) -> query database
Database -> trả dữ liệu
Spring Boot -> trả JSON về frontend
Frontend JS -> hiển thị dữ liệu

Về DB:
1. Nhóm dữ liệu cốt lõi

users: tài khoản người dùng/chủ trọ/admin.
rooms: thông tin phòng cho thuê.
room_images: danh sách ảnh theo từng phòng.
room_contacts: thông tin liên hệ hiển thị ở chi tiết phòng.
refresh_tokens (khuyến nghị): quản lý đăng nhập an toàn.
provinces, districts, wards (khuyến nghị): chuẩn hóa địa chỉ nếu muốn lọc tốt hơn.
2. Quan hệ chính

users (1) - (N) rooms
rooms (1) - (N) room_images
rooms (1) - (1) room_contacts
3. Chuẩn thiết kế

Chuẩn hóa đến mức 3NF cho dữ liệu nghiệp vụ.
Dùng khóa chính BIGINT AUTO_INCREMENT.
Có created_at, updated_at, deleted_at (soft delete nếu cần).
Dùng DECIMAL cho giá (price_from, price_to), tránh FLOAT.
4. Tối ưu truy vấn tìm phòng

Index bắt buộc: district, city, price_from, price_to, created_at, owner_id.
Index kết hợp gợi ý: (city, district, price_from, price_to).
Nếu tìm theo từ khóa nhiều: thêm FULLTEXT(title, address, description).
5. Luồng dữ liệu từ backend

Frontend không nối trực tiếp MySQL.
Luồng đúng: Frontend -> Spring Boot API -> JPA/Hibernate -> MySQL.
API trả DTO đúng format frontend đang dùng: room, images[], contact.

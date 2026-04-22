# 🏠 BTL_WEB_2026 - Room Management System (Backend)

Hệ thống quản lý tin đăng cho thuê phòng trọ được xây dựng trên nền tảng Spring Boot. Dự án tập trung vào việc cung cấp các API xử lý nghiệp vụ tìm kiếm, đăng tin và xác thực người dùng.

---

## 🛠 Tech Stack (Công nghệ sử dụng)

- **Language:** Java 17
- **Framework:** Spring Boot 3.3.5
- **Database:** MySQL / TiDB Cloud
- **Security:** Spring Security + JWT (jjwt 0.12.5) + BCrypt hashing
- **ORM:** Spring Data JPA (Hibernate)
- **Dependency Management:** Maven

---

## 🏗 Kiến trúc hệ thống (Architecture Overview)

Dự án áp dụng mô hình **Layered Architecture (Kiến trúc phân lớp)** nhằm đảm bảo tính bảo trì và mở rộng:

| Package | Vai trò |
| :--- | :--- |
| `controller/` | Tiếp nhận request từ Client, điều hướng luồng và trả về Response. |
| `service/` | Chứa logic nghiệp vụ (Business Logic). Đây là trái tim của ứng dụng. |
| `repository/` | Tương tác trực tiếp với Database thông qua Spring Data JPA. |
| `entity/` | Định nghĩa cấu trúc bảng trong Database (User, Room, Image, v.v.). |
| `dto/` | Các đối tượng vận chuyển dữ liệu giữa Client và Server. |
| `config/` | Cấu hình hệ thống (CORS, Security, Seeder dữ liệu). |

**Luồng giao tiếp:** `Client` ↔ `Controller` ↔ `Service` ↔ `Repository` ↔ `Database (JPA)`

---

## 🔄 Luồng dữ liệu chính (Data Flow)

### 1. Luồng Xác thực (Authentication)
Dùng để đăng ký tài khoản mới hoặc đăng nhập lấy Token:
`Client` → `AuthController` → `AuthService` → `UserRepository` → `BCrypt` (Mã hóa/Kiểm tra) → `JwtService` (Tạo Token) → `Response`.

### 2. Luồng Quản lý Phòng (CRUD Room)
Xử lý các thao tác tạo, sửa, xóa phòng:
- **Tạo:** Kiểm tra logic giá (`priceFrom` ≤ `priceTo`) → Lấy `userId` từ Token → Lưu Entity → Lưu Files ảnh (Uploads) → Lưu thông tin liên hệ.
- **Xóa:** Kiểm tra quyền (Owner/Admin) → Xóa bản ghi ảnh & Files vật lý → Xóa Contact → Xóa Room.

### 3. Luồng Tìm kiếm (Advanced Search)
`GET /api/v1/rooms/search`
Sử dụng các tham số dynamic: `keyword`, `district`, `minPrice`, `maxPrice`.
- `RoomQueryService` sẽ chuẩn hóa dữ liệu.
- `RoomRepository` thực hiện truy vấn JPQL tùy biến để lấy dữ liệu tối ưu.

---

## 🚀 Tính năng cốt lõi

### 🔐 Authentication Flow
- **Register:** Kiểm tra email trùng lặp (không phân biệt hoa thường) -> Hash password bằng BCrypt -> Lưu User.
- **Login:** Tìm user theo email -> Kiểm tra `isActive` -> Verify password -> Trả về JWT.

### 📝 Room Management
- **Quyền hạn:** Chỉ chủ sở hữu (Owner) của tin đăng hoặc Admin mới có quyền chỉnh sửa/xóa.
- **Xử lý ảnh:** Hỗ trợ Multipart file, tự động dọn dẹp file cũ khi cập nhật hoặc xóa tin.

### 🔍 Search & Filter
- Tìm kiếm theo khu vực (District).
- Lọc theo khoảng giá linh hoạt.
- Tự động đính kèm thông tin liên hệ và danh sách ảnh khi trả về kết quả.

---

## ⚙️ Cài đặt & Chạy thử

1. **Yêu cầu:** Java 17+, MySQL 8.0+.
2. **Cấu hình DB:** Thay đổi thông tin kết nối trong `src/main/resources/application.properties`.
3. **Chạy ứng dụng:**
   ```bash
   mvn clean install
   mvn spring-boot:run
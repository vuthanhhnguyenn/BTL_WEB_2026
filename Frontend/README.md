# Frontend TroXinh (HTML/CSS/JS)

## Cấu trúc chính
- `index.html`: Trang chủ + khung tìm kiếm.
- `rooms.html`: Danh sách phòng trọ + bộ lọc.
- `room-detail.html?id=<id>`: Trang chi tiết phòng.
- `login.html`: Đăng nhập.
- `register.html`: Đăng ký.
- `post-room.html`: Đăng tin cho thuê.
- `about.html`: Giới thiệu.

## Kết nối backend Spring Boot/JPA/MySQL
Tất cả logic gọi API nằm ở `assets/js/api.js`.

### Bật API thật
1. Mở `assets/js/config.js`.
2. Sửa:
```js
USE_MOCK: false
```
3. Giữ `API_BASE_URL` trỏ đúng backend, ví dụ:
```js
API_BASE_URL: 'http://localhost:8080/api/v1'
```

### Endpoint frontend đang chờ backend
- `POST /auth/login`
- `POST /auth/register`
- `GET /rooms/search?keyword=&district=&minPrice=&maxPrice=`
- `GET /rooms/{id}`
- `POST /rooms` (multipart/form-data)

## Gợi ý DTO backend tương ứng
### LoginRequest
- `email`
- `password`

### RegisterRequest
- `fullName`
- `email`
- `phone`
- `password`

### RoomRequest (phần JSON trong multipart key `data`)
- `title`
- `address`
- `district`
- `city`
- `mapAddress`
- `priceFrom`
- `priceTo`
- `area`
- `direction`
- `bedrooms`
- `bathrooms`
- `description`
- `contact.name`
- `contact.phone`
- `contact.email`

### Image files
- multipart key: `images` (nhiều file)

## Dữ liệu demo
- Có sẵn 10 phòng trong `assets/js/mock-data.js`.
- Tin đăng mới (khi mock) lưu tạm vào `localStorage` để bạn test ngay.

# Hướng Dẫn Kết Nối Backend (Spring Boot + JPA + MySQL) Với Frontend TroXinh

Tài liệu này mô tả cách nối backend với frontend hiện tại trong thư mục `Frontend`.
Mục tiêu: bạn có thể bật backend thật mà không phải sửa lớn giao diện.

## 1. Frontend hiện đang gọi API như thế nào

Frontend dùng các file sau:
- `assets/js/config.js`: cấu hình URL backend + bật/tắt mock.
- `assets/js/api.js`: toàn bộ hàm gọi API.

Cấu hình hiện tại:
```js
API_BASE_URL: 'http://localhost:8080/api/v1'
USE_MOCK: true
```

Khi backend xong:
1. Mở `Frontend/assets/js/config.js`
2. Đổi `USE_MOCK: false`
3. Đảm bảo backend chạy đúng `http://localhost:8080/api/v1`

## 2. API Contract bắt buộc backend phải đáp ứng

### 2.1 Đăng nhập
- Method: `POST`
- URL: `/api/v1/auth/login`
- Body:
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```
- Response (200):
```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

### 2.2 Đăng ký
- Method: `POST`
- URL: `/api/v1/auth/register`
- Body:
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0909122233",
  "password": "123456",
  "confirmPassword": "123456"
}
```
- Response (200/201):
```json
{
  "success": true,
  "message": "Đăng ký thành công"
}
```

### 2.3 Tìm kiếm phòng
- Method: `GET`
- URL: `/api/v1/rooms/search?keyword=&district=&minPrice=&maxPrice=`
- Response (200):
```json
{
  "content": [
    {
      "id": 1,
      "title": "Phòng studio",
      "address": "12 Nguyễn Thị Minh Khai, Quận 1, TP.HCM",
      "district": "Quận 1",
      "city": "TP.HCM",
      "mapAddress": "12 Nguyễn Thị Minh Khai, Quận 1, TP.HCM",
      "priceFrom": 5500000,
      "priceTo": 6500000,
      "area": 28,
      "direction": "Đông Nam",
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "Phòng mới",
      "images": ["https://..."] ,
      "contact": {
        "name": "Trần Hải Nam",
        "phone": "0909112233",
        "email": "nam@example.com"
      }
    }
  ],
  "totalElements": 1
}
```

### 2.4 Lấy chi tiết phòng
- Method: `GET`
- URL: `/api/v1/rooms/{id}`
- Response: cùng cấu trúc object phòng như trên.

### 2.5 Đăng tin cho thuê (có upload ảnh)
- Method: `POST`
- URL: `/api/v1/rooms`
- Header: `Authorization: Bearer <jwt>`
- Content-Type: `multipart/form-data`
- Form-data gồm:
  - `data`: JSON string (hoặc JSON blob) chứa thông tin phòng
  - `images`: nhiều file ảnh

Ví dụ `data`:
```json
{
  "title": "Phòng mới",
  "address": "90 Nguyễn Du, Cửa Nam, Hà Nội",
  "district": "Cửa Nam",
  "city": "Hà Nội",
  "mapAddress": "90 Nguyễn Du, Trần Hưng Đạo, Cửa Nam, Hà Nội",
  "priceFrom": 4500000,
  "priceTo": 5500000,
  "area": 25,
  "direction": "Đông Bắc",
  "bedrooms": 1,
  "bathrooms": 1,
  "description": "Đầy đủ nội thất",
  "contact": {
    "name": "Lê Văn B",
    "phone": "0988111222",
    "email": "levanb@example.com"
  }
}
```

## 3. Thiết kế backend gợi ý (Spring Boot)

## 3.1 Dependencies nên có
- Spring Web
- Spring Data JPA
- Spring Security
- Validation
- MySQL Driver
- Lombok
- JWT library (`jjwt`)

## 3.2 Cấu hình `application.yml`
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/troxinh_db?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
    username: root
    password: your_password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

server:
  port: 8080
```

## 3.3 CORS để frontend gọi được
```java
@Configuration
public class CorsConfig {
  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
          .allowedOrigins("http://127.0.0.1:5500", "http://localhost:5500")
          .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
          .allowedHeaders("*")
          .allowCredentials(true);
      }
    };
  }
}
```

Nếu bạn dùng Spring Security filter chain, cần bật CORS trong security config nữa.

## 3.4 DTO nên tạo
```java
@Data
public class LoginRequest {
  @Email @NotBlank
  private String email;
  @NotBlank
  private String password;
}

@Data
public class RegisterRequest {
  @NotBlank private String fullName;
  @Email @NotBlank private String email;
  @NotBlank private String phone;
  @NotBlank private String password;
  @NotBlank private String confirmPassword;
}

@Data
public class ContactDto {
  @NotBlank private String name;
  @NotBlank private String phone;
  @Email @NotBlank private String email;
}

@Data
public class RoomRequest {
  @NotBlank private String title;
  @NotBlank private String address;
  @NotBlank private String district;
  @NotBlank private String city;
  @NotBlank private String mapAddress;
  @NotNull private BigDecimal priceFrom;
  @NotNull private BigDecimal priceTo;
  @NotNull private Double area;
  @NotBlank private String direction;
  @NotNull private Integer bedrooms;
  @NotNull private Integer bathrooms;
  @NotBlank private String description;
  @Valid @NotNull private ContactDto contact;
}
```

## 3.5 Controller mẫu
```java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @PostMapping("/register")
  public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
    authService.register(request);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(Map.of("success", true, "message", "Đăng ký thành công"));
  }
}
```

```java
@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {
  private final RoomService roomService;

  @GetMapping("/search")
  public ResponseEntity<RoomSearchResponse> search(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String district,
      @RequestParam(required = false) BigDecimal minPrice,
      @RequestParam(required = false) BigDecimal maxPrice) {
    return ResponseEntity.ok(roomService.search(keyword, district, minPrice, maxPrice));
  }

  @GetMapping("/{id}")
  public ResponseEntity<RoomDto> getById(@PathVariable Long id) {
    return ResponseEntity.ok(roomService.getById(id));
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<RoomDto> create(
      @RequestPart("data") @Valid RoomRequest request,
      @RequestPart(value = "images", required = false) List<MultipartFile> images,
      Authentication authentication) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(roomService.create(request, images, authentication.getName()));
  }
}
```

## 3.6 Entity gợi ý
- `users` (id, full_name, email, phone, password_hash, role, created_at)
- `rooms` (id, title, address, district, city, map_address, price_from, price_to, area, direction, bedrooms, bathrooms, description, owner_id)
- `room_images` (id, room_id, image_url, sort_order)
- `room_contacts` (id, room_id, name, phone, email)

## 4. Mapping response đúng với frontend

Frontend đang đọc các key chính sau, backend cần trả đúng tên:
- `id`, `title`, `address`, `district`, `city`, `mapAddress`
- `priceFrom`, `priceTo`, `area`, `direction`, `bedrooms`, `bathrooms`
- `description`, `images` (array URL)
- `contact.name`, `contact.phone`, `contact.email`

Nếu backend trả khác key (vd `price_from`), bạn phải map lại ở backend DTO response, hoặc sửa `api.js`.

## 5. Chuẩn lỗi nên dùng

Nên trả lỗi JSON thống nhất:
```json
{
  "timestamp": "2026-04-07T12:34:56",
  "status": 400,
  "error": "Bad Request",
  "message": "Email đã tồn tại",
  "path": "/api/v1/auth/register"
}
```

Frontend hiện đang `throw new Error(text)` nếu status lỗi. Bạn có thể nâng cấp `api.js` để parse JSON lỗi chi tiết hơn.

## 6. Quy trình chạy end-to-end

1. Chạy MySQL, tạo DB `troxinh_db`.
2. Chạy backend ở port `8080`.
3. Mở frontend bằng Live Server (thường `http://127.0.0.1:5500`).
4. Sửa `USE_MOCK: false` trong `config.js`.
5. Test lần lượt:
   - Đăng ký
   - Đăng nhập
   - Xem danh sách phòng
   - Xem chi tiết phòng
   - Đăng tin có upload ảnh

## 7. Lỗi thường gặp và cách xử lý

- CORS block: kiểm tra `allowedOrigins` đúng domain frontend.
- 401 khi đăng tin: token JWT chưa gửi/expired.
- 415 Unsupported Media Type: chưa nhận `multipart/form-data` đúng cách.
- 400 khi parse `@RequestPart("data")`: JSON field không khớp DTO.
- 404 ảnh: backend chưa public static file URL.

## 8. Gợi ý nâng cấp tiếp theo

- Thêm phân trang thật cho `/rooms/search` (`page`, `size`, `sort`).
- Lưu ảnh lên cloud (S3/Cloudinary) thay vì ổ local.
- Thêm refresh token.
- Thêm endpoint quản lý tin của người đăng nhập.

---
Nếu bạn muốn, bước tiếp theo mình có thể tạo luôn skeleton backend package (controller/service/repository/entity/dto) theo đúng tài liệu này.

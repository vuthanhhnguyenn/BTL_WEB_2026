# BTL_WEB_2026

## 1) Cong nghe su dung
- Frontend: HTML, CSS, JavaScript
- Backend: Spring Boot, Spring Data JPA
- Database: MySQL/TiDB-compatible
- Build backend: Maven
- Deploy tham khao:
  - Frontend: GitHub Pages (deploy tu thu muc `Frontend/` qua GitHub Actions)
  - Backend: Render

## 2) Cach chay
### Chay Backend (local)
1. Cap nhat ket noi DB trong `Backend/src/main/resources/application.yml`.
2. Chay lenh:

```bash
cd Backend
mvn clean spring-boot:run
```

Mac dinh backend chay o port `4000` (theo `application.yml`).

### Chay Frontend (local)
1. Mo thu muc `Frontend` bang VS Code.
2. Chay `index.html` bang Live Server.
3. Cau hinh API trong `Frontend/assets/js/config.js`:

```js
API_BASE_URL: 'http://localhost:4000/api/v1',
```

## 3) Thong tin co ban ve du an
TroXinh la web tim va dang tin phong tro.

Chuc nang chinh hien tai:
- Xem danh sach phong
- Xem chi tiet phong (anh, gia, dia chi, thong tin lien he)
- Tim kiem theo tu khoa/khu vuc/khoang gia
- Dang nhap, dang ky, dang tin (frontend)

Huong kien truc:
- Frontend goi REST API tu backend.
- Backend dung JPA truy van DB va tra du lieu theo DTO cho frontend.

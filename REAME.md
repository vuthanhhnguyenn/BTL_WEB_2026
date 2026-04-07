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

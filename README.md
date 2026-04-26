# BTL_WEB_2026 - Room Rental Listing Management System

A full-stack web application for managing room rental listings, built with Spring Boot (Backend) and Vanilla JavaScript (Frontend). The system provides RESTful APIs for user authentication, room CRUD operations, advanced search, and favorites management.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Java 17, Spring Boot 3.3.5 |
| **Database** | MySQL / TiDB Cloud |
| **ORM** | Spring Data JPA (Hibernate 6) |
| **Security** | Spring Security + JWT (jjwt 0.12.5) + BCrypt |
| **Frontend** | HTML5, Vanilla JavaScript |
| **Build Tool** | Maven |

---

## Architecture

The project follows **Layered Architecture** pattern to ensure maintainability and scalability:

```
Client → Controller → Service → Repository → Database (JPA)
```

### Package Structure

| Package | Responsibility |
|---------|---------------|
| `controller/` | Handle HTTP requests, route to service layer |
| `service/` | Business logic implementation |
| `repository/` | Data access via Spring Data JPA |
| `entity/` | JPA entity definitions (User, Room, Favorite, etc.) |
| `dto/` | Data transfer objects for API requests/responses |
| `config/` | System configuration (CORS, Security, Seeder) |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|------------|
| POST | `/api/v1/auth/register` | Register new user account |
| POST | `/api/v1/auth/login` | Login and receive JWT token |

### Rooms
| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/api/v1/rooms/{id}` | Get room details by ID |
| GET | `/api/v1/rooms/search` | Search rooms with filters |
| GET | `/api/v1/rooms/initial` | Get initial room list |
| GET | `/api/v1/rooms/highlights` | Get featured rooms |
| POST | `/api/v1/rooms` | Create new room listing |
| PUT | `/api/v1/rooms/{id}` | Update room listing |
| DELETE | `/api/v1/rooms/{id}` | Delete room listing |

### User Features
| Method | Endpoint | Description |
|--------|----------|------------|
| POST | `/api/v1/rooms/{id}/favorite` | Add room to favorites |
| DELETE | `/api/v1/rooms/{id}/favorite` | Remove room from favorites |
| GET | `/api/v1/rooms/favorites/my` | Get user's favorite rooms |
| POST | `/api/v1/rooms/saved-searches` | Save search criteria |
| GET | `/api/v1/rooms/saved-searches/my` | Get saved searches |
| POST | `/api/v1/rooms/{id}/reports` | Report a room |

### Admin
| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/api/v1/rooms/admin/all` | Get all rooms (admin) |
| GET | `/api/v1/rooms/admin/reports` | Get all reports |
| PUT | `/api/v1/rooms/admin/reports/{id}/status` | Update report status |

---

## Key Features

### Authentication & Authorization
- JWT-based authentication with 24-hour token expiration
- BCrypt password hashing
- Role-based access control (USER, ADMIN)

### Room Management
- Create, read, update, delete room listings
- Multi-image upload support (max 10MB per file)
- Automatic cleanup of old files when updating/deleting
- Owner-only editing (except admin)

### Search & Filter
- Keyword search (title, address)
- District filtering
- Price range filtering (minPrice, maxPrice)

### Favorites & Saved Searches
- Save/remove rooms to favorites
- Save search criteria for quick access

---

## Database Schema

### Core Entities

**User**
- id, email (unique), password, fullName, phone, role, avatarUrl, isActive, createdAt

**Room**
- id, userId, title, address, district, city, mapAddress, priceFrom, priceTo, area, direction, bedrooms, bathrooms, description, status, viewCount, contactClickCount, isFeatured, createdAt, updatedAt

**RoomImage**
- id, roomId, imageUrl, sortOrder

**RoomContact**
- id, roomId, contactName, contactPhone, contactEmail

**Favorite**
- id, userId, roomId, createdAt

**SavedSearch**
- id, userId, name, keyword, district, minPrice, maxPrice, createdAt

**RoomReport**
- id, roomId, reporterId, reason, detailText, status, createdAt

---

## Setup & Run

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- MySQL 8.0+ (or TiDB Cloud account)


### Build & Run

```bash
# Build
cd Backend
mvn clean package -DskipTests

# Run
mvn spring-boot:run
```

The application runs on port **4000** by default.

### Frontend

Open `Frontend/index.html` in a browser. Configure API base URL in `Frontend/assets/js/config.js`:

```javascript
API_BASE_URL: 'http://localhost:4000/api/v1'  // Production: your deployed backend URL
```

---

## Security

- JWT tokens are signed with HS256 algorithm
- Passwords are hashed using BCrypt
- API endpoints require authentication for protected operations
- CORS is configured to allow all origins (`*`)

---

## Project Structure

```
BTL_WEB_2026/
├── Backend/
│   ├── src/main/java/com/troxinh/backend/
│   │   ├── controller/      # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access
│   │   ├── entity/        # JPA entities
│   │   ├── dto/           # Data transfer objects
│   │   └── config/        # Configuration classes
│   └── src/main/resources/
│       └── application.yml
│
├── Frontend/
│   ├── assets/
│   │   ├── css/           # Stylesheets
│   │   ├── js/            # JavaScript modules
│   │   └── img/           # Static images
│   ├── index.html        # Home page
│   ├── login.html       # Login page
│   ├── rooms.html       # Room listing page
│   └── ...
│
└── README.md
```

---

## License

This project is for educational purposes as part of BTL Web 2026 course.

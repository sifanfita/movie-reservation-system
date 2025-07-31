# 🎬 Movie Reservation System API

A Node.js + Express backend for booking movie seats. Built with PostgreSQL and JWT-based authentication.

---

## ⚙️ Tech Stack

- Node.js, Express.js
- PostgreSQL
- JWT Auth

---

## 🔑 Auth Endpoints

| Method | Endpoint           | Description     |
|--------|--------------------|-----------------|
| POST   | `/api/auth/signup` | Register user   |
| POST   | `/api/auth/login` | Login user      |

---

## 🎥 Movie (Admin Only)

| Method | Endpoint        | Description       |
|--------|------------------|-------------------|
| POST   | `/api/movies`    | Add movie         |
| PUT    | `/api/movies/:id`| Update movie      |
| DELETE | `/api/movies/:id`| Delete movie      |

---

## ⏰ Showtimes (Admin Only)

| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | `/api/showtimes`    | Create showtime      |
| PUT    | `/api/showtimes/:id`| Update showtime      |
| DELETE | `/api/showtimes/:id`| Delete showtime      |

---

## 🎟️ Reservations (User)

| Method | Endpoint                                               | Description            |
|--------|--------------------------------------------------------|------------------------|
| GET    | `/api/showtimes/:id/seats`                             | Get available seats    |
| POST   | `/api/reservations/showtimes/:id/reserve`              | Reserve seats          |
| GET    | `/api/reservations`                                    | User's reservations    |
| DELETE | `/api/reservations/:id`                                | Cancel reservation     |

---

# To run locally.
git clone https://github.com/sifanfita/movie-reservation-system.git
cd movie-reservation-system
npm install
# Add .env
npm run dev


# User Management API

A RESTful backend API for managing users, with registration, login, JWT authentication and role-based access control (USER / ADMIN).

## Features

- User registration and login
- JWT authentication (tokens expire after 1 day)
- Password hashing with bcrypt
- Role-based authorization (`USER` / `ADMIN`)
- Users can update only their own account (admins can update anyone)
- Only admins can delete users
- Request validation with express-validator
- Centralized error handling (proper 400 / 401 / 403 / 404 / 409 responses)
- PostgreSQL database with Prisma ORM

## Tech Stack

Node.js, Express 5, PostgreSQL, Prisma, JSON Web Tokens, bcrypt, express-validator

## Getting Started

### Prerequisites

- Node.js 18 or newer
- PostgreSQL

### Installation

```bash
git clone <your-repo-url>
cd user-management-api
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/user_management_db"
JWT_SECRET=change_this_to_a_long_random_string
```

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database setup

```bash
npm run prisma:push
```

### Run

```bash
npm run dev     # development (nodemon)
npm start       # production
```

The server runs on `http://localhost:5000` by default.

### Creating an admin

Every new account is created with the `USER` role. To make an admin:

1. Register a normal user.
2. Run `npm run prisma:studio`.
3. Open the `User` table, change `role` to `ADMIN`, and save.
4. Log in again to get a token that carries the new role.

## API Endpoints

Base path: `/api/users`

| Method | Endpoint           | Access               | Description              |
| ------ | ------------------ | -------------------- | ------------------------ |
| POST   | `/api/users`       | Public               | Register a new user      |
| POST   | `/api/users/login` | Public               | Log in and receive a JWT |
| GET    | `/api/users`       | Authenticated        | Get all users            |
| GET    | `/api/users/:id`   | Authenticated        | Get a user by id         |
| PUT    | `/api/users/:id`   | Own account or ADMIN | Update name and email    |
| DELETE | `/api/users/:id`   | ADMIN only           | Delete a user            |

Protected routes need this header:

```
Authorization: Bearer <token>
```

### Validation rules

- `name`: required, up to 100 characters
- `email`: valid email (stored in lowercase)
- `password`: 8 to 72 characters (registration only)

### Examples

Register:

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Ahmed", "email": "ahmed@test.com", "password": "12345678"}'
```

```json
{
  "message": "User created successfully",
  "user": { "id": 1, "name": "Ahmed", "email": "ahmed@test.com" }
}
```

Login:

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed@test.com", "password": "12345678"}'
```

```json
{
  "message": "Login successful",
  "token": "<JWT_TOKEN>"
}
```

Get all users:

```bash
curl http://localhost:5000/api/users -H "Authorization: Bearer <JWT_TOKEN>"
```

### Status codes

| Code | Meaning                                              |
| ---- | ---------------------------------------------------- |
| 200  | Success                                              |
| 201  | User created                                         |
| 400  | Validation error or invalid JSON                     |
| 401  | Missing or invalid token, or wrong login credentials |
| 403  | Not allowed (not your account / not an admin)        |
| 404  | User or route not found                              |
| 409  | Email already exists                                 |
| 500  | Unexpected server error                              |

Errors look like `{ "message": "..." }`. Validation errors look like `{ "errors": [ { "msg": "...", "path": "..." } ] }`.

## Project Structure

```
user-management-api
├── prisma
│   └── schema.prisma
├── src
│   ├── config
│   │   └── db.js
│   ├── controllers
│   │   └── userController.js
│   ├── middleware
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── validationMiddleware.js
│   ├── routes
│   │   └── userRoutes.js
│   ├── validators
│   │   └── userValidator.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm start`             | Run the server                           |
| `npm run dev`           | Run with nodemon                         |
| `npm run prisma:push`   | Sync the Prisma schema with the database |
| `npm run prisma:studio` | Open Prisma Studio                       |


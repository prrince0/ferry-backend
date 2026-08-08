#  Ferry Management System

A full-stack ferry management application built with a modern frontend and backend architecture.

The project is divided into two main parts:

*  **ferry-frontend** — User interface and client-side application
*  **ferry-backend** — REST API, authentication, business logic, database, and server-side services

---

##  Project Overview

The Ferry Management System is designed to provide a complete platform for managing ferry-related operations through a web application.

The application follows a full-stack architecture where the frontend communicates with the backend through APIs.

```text
                     FERRY MANAGEMENT SYSTEM
                              │
                ┌─────────────┴─────────────┐
                │                           │
         FERRY FRONTEND             FERRY BACKEND
                │                           │
          User Interface                 REST API
                │                           │
          React Application          Routes & Middleware
                │                           │
                └─────────────┬─────────────┘
                              │
                         API Communication
                              │
                              ▼
                          Controllers
                              │
                              ▼
                          Services
                              │
                              ▼
                           Models
                         /        \
                        ▼          ▼
                     MySQL         Redis
```

---

##  Technologies Used

### Frontend

* React
* Vite
* Redux / Redux Toolkit
* React Router
* Tailwind CSS
* Recharts

### Backend

* Node.js
* Express.js
* MySQL
* Redis
* JWT Authentication
* Passport / Passport JWT
* bcrypt
* Multer
* dotenv

## The backend dependency structure includes Express, MySQL2, Redis/ioredis, JWT, Passport, bcrypt, Multer, and dotenv.

#  Project Structure

##  Frontend

```text
ferry-frontend/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── public/
├── package.json
└── vite.config.js
```

The frontend contains separate areas for components, context, hooks, pages, and services.

---

##  Backend

```text
ferry-backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── uploads/
├── package.json
└── ...
```

The backend is organized using a layered structure:

```text
Request
   │
   ▼
Routes
   │
   ▼
Middleware
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Models
   │
   ├──────────────► MySQL
   │
   └──────────────► Redis
```

---

#  Authentication & Security

The backend includes authentication-related technologies such as:

* JWT
* Passport
* Passport JWT
* bcrypt
* dotenv

These components are used as part of the backend authentication and security architecture.

---

#  Database & Caching

### MySQL

MySQL is used as the relational database through the `mysql2` package.

### Redis

Redis is included in the backend stack for server-side data/caching-related functionality.

```text
Application
     │
     ├──────────────► MySQL
     │
     └──────────────► Redis
```

---

#  File Uploads

The backend contains an `uploads` directory and uses **Multer** for handling multipart/file-upload functionality.

```text
Client
  │
  ▼
Upload Request
  │
  ▼
Multer
  │
  ▼
uploads/
```

---

#  Application Flow

```text
   User
    │
    ▼
 Frontend
    │
    │  API Request
    ▼
 Backend
    │
    ▼
  Routes
    │
    ▼
 Middleware
    │
    ▼
 Controllers
    │
    ▼
 Services
    │
    ▼
  Models
   │
   ├──────►  MySQL
   │
   └──────►  Redis
   │
   ▼
 API Response
  │
  ▼
 Frontend
  │
  ▼
 User
```

---

#  Key Areas

###  User Management

* User authentication
* Secure password handling
* JWT-based authentication

###  Ferry / Booking System

* Ferry-related frontend pages
* Booking-related functionality
* Schedule-related functionality

###  Dashboard

* Dashboard interfaces
* Data visualization
* Charts and reporting

###  Admin

* Admin-related pages
* Management functionality
* Backend API support

###  File Management

* File upload handling
* Upload storage through the backend

#  Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/prrince0/ferry-backend
cd  ferry-frontend/ferry-backend
```

## 2. Start the Backend

```bash
cd ferry-backend
nodemon server.js
```

## 3. Start the Frontend

Open another terminal:

```bash
cd ferry-frontend
npm install
npm run dev
```

> The exact npm scripts may depend on the `package.json` configuration in your project.

---

# Environment Variables

Create an environment file for the backend and configure the required values for your local environment.



```env
PORT=5000

DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

JWT_SECRET=your_secret_key

REDIS_URL=your_redis_url
```
---

# 🧪 Project Status

```text
Frontend       ✅ Completed
Backend        ✅ Completed
Integration    ✅ Completed
Testing        ✅ Tested
Deployment     ✅ Completed
Documentation  🔄 Updating
```

---

#  What I Learned

Through this project, I worked with:

* Full-stack application architecture
* React frontend development
* REST API architecture
* Express.js backend development
* Authentication and authorization concepts
* MySQL database integration
* Redis integration
* Middleware
* Controllers and services
* API routes
* File uploads
* State management
* Git and GitHub workflow

---

#  Future Improvements

Possible future improvements include:
* improve ticket booking function
* Improve UI/UX
* Add automated testing
* Improve API documentation
* Add better error handling
* Add deployment configuration
* Improve performance and caching
* Add more analytics and reporting

---

#  Project Structure Summary

```text
 Ferry Management System
│
├──  ferry-frontend
│   ├── Components
│   ├── Pages
│   ├── Hooks
│   ├── Context
│   └── Services
│
└──  ferry-backend
    ├── Config
    ├── Routes
    ├── Middleware
    ├── Controllers
    ├── Services
    ├── Models
    ├── Utils
    └── Uploads
```
#  Live Deployment

The Ferry Management System has been successfully deployed and tested using a production deployment architecture.

## Live Application

Frontend — Vercel
https://ferry-frontend-jet.vercel.app/login

Backend API — Render
https://ferry-backend-1.onrender.com

Database — Railway
MySQL database hosted on Railway.

---

##  Deployment Architecture

```text
                          FERRY APPLICATION
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
              VERCEL                         RENDER
             Frontend                    Backend API
                    │                           │
                    │       API Requests        │
                    └───────────►───────────────┘
                                                │
                                                │
                                                ▼
                                            RAILWAY
                                            MySQL
                                                │
                                                ▼
                                             Redis
```

---

## Deployment Stack

| Component | Platform | Purpose                  |
| --------- | -------- | ------------------------ |
| Frontend  | Vercel   | React frontend hosting   |
| Backend   | Render   | Node.js / Express API    |
| Database  | Railway  | MySQL database           |
| Cache     | Redis    | Server-side caching/data |

---

##  Deployment Status

```text
Frontend (Vercel)       ✅ Live
Backend (Render)        ✅ Live
MySQL (Railway)         ✅ Connected
Frontend ↔ Backend      ✅ Connected
Backend ↔ MySQL         ✅ Connected
Project Testing         ✅ Completed
Deployment              ✅ Completed
```

---

## 🔄 Production Request Flow

```text
 User
   │
   ▼
 Vercel
 Frontend
   │
   │ HTTPS API Request
   ▼
 Render
Backend / Express API
   │
   ├──────────────►  Railway MySQL
   │
   └──────────────►  Redis
   │
   ▼
 API Response
   │
   ▼
 Vercel
Frontend
   │
   ▼
 User
```


---

##  Conclusion

The Ferry Management System demonstrates a full-stack application architecture connecting a React frontend with a structured Node.js/Express backend, database services, authentication, caching, and file-upload functionality.

---

Built with ❤️ while learning and building full-stack development.
---
 Author

 
Prince Kumar

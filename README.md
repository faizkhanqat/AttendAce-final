# AttendAce — Smart Attendance Management System

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

**A fully software-based, zero-hardware attendance management system for educational institutions.**  
Dual verification via Dynamic QR Codes + In-Browser Face Recognition, with GPS Geofencing anti-proxy enforcement.

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

## Overview

AttendAce eliminates the inefficiencies of paper-based attendance in schools and colleges. It is a **Progressive Web App (PWA)** requiring **no dedicated hardware** — just the smartphones and browsers students and teachers already own.

The system supports two roles:
- **Teachers** — create classes, activate sessions, generate QR codes, view analytics, export CSV reports, and manually override records.
- **Students** — mark attendance via QR scan or face recognition, view personal analytics, and track their attendance history.

---

## Features

### Authentication & Security
- OTP-based email verification on registration (via SendGrid)
- JWT-based session authentication (8-hour tokens)
- Role-based access control (`student` / `teacher`)
- bcrypt password hashing

### Dual Attendance Verification
- **Dynamic QR Code** — Tokens auto-expire every **10 seconds**, preventing screenshot/sharing fraud
- **Face Recognition** — Powered by `face-api.js` running entirely in-browser using pre-trained deep learning models; no cloud inference required

### GPS Geofencing (Anti-Proxy)
- Uses the **Haversine formula** to calculate real-time distance between student and classroom
- Students must be within **100 meters** of the teacher's location to mark attendance
- Location is verified server-side on every attendance submission

### Analytics & Reporting
- Student-facing attendance percentage per class
- Teacher dashboard with per-class attendance breakdowns
- **CSV export** of full attendance records per class
- Manual override capability for teachers

### Progressive Web App (PWA)
- Installable on Android and iOS
- Works across all modern browsers
- Responsive design for mobile-first usage

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MySQL (cloud-hosted, SSL) |
| **Authentication** | JWT + bcrypt |
| **Email** | SendGrid |
| **Face Recognition** | face-api.js (TensorFlow.js, in-browser) |
| **Geolocation** | Browser Geolocation API + Haversine Formula |
| **QR Generation** | UUID v4 tokens + frontend QR rendering |
| **Frontend** | Vanilla HTML, CSS, JavaScript |
| **PWA** | Web Manifest + Service Workers |
| **Data Export** | json2csv |

> **No hardware required.** No scanners, no biometric devices, no RFID — just smartphones.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (PWA)                         │
│   ┌─────────────┐   ┌──────────────┐   ┌────────────────┐  │
│   │  QR Scanner  │   │ Face Recog.  │   │  GPS Capture   │  │
│   │ (Camera API) │   │ (face-api.js)│   │ (Geolocation)  │  │
│   └──────┬──────┘   └──────┬───────┘   └───────┬────────┘  │
└──────────┼─────────────────┼───────────────────┼───────────┘
           │                 │                   │
           └─────────────────▼───────────────────┘
                             │ HTTPS / REST API
┌────────────────────────────▼────────────────────────────────┐
│                     EXPRESS.JS BACKEND                       │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐  │
│  │   Auth   │  │Attendance │  │    QR     │  │ Teacher  │  │
│  │  Routes  │  │  Routes   │  │  Routes   │  │  Routes  │  │
│  └────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬─────┘  │
│       │              │              │              │         │
│  ┌────▼──────────────▼──────────────▼──────────────▼─────┐  │
│  │            JWT Middleware + Role Guard                  │  │
│  └──────────────────────────┬──────────────────────────── ┘  │
└─────────────────────────────┼───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                   MySQL (Cloud Database)                     │
│   users │ classes │ attendance │ qr_tokens │ active_classes  │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A MySQL database (local or cloud)
- A [SendGrid](https://sendgrid.com/) account (for OTP emails)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AttendAce.git
cd AttendAce
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
# Then fill in your values (see Environment Variables section below)
```

### 4. Set Up the Database

Run the base schema and migrations:

```bash
# Apply geofencing migration
mysql -u your_user -p your_database < backend/database/migration_geofencing.sql
```

### 5. Start the Server

```bash
cd backend
node server.js
```

The app will be live at `http://localhost:3700`

---

## 🔧 Environment Variables

Create a `backend/.env` file with the following:

```env
# Server
PORT=3700

# Database
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key

# bcrypt
SALT_ROUNDS=10

# SendGrid (Email OTP)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=no-reply@yourdomain.com

# OTP Config
OTP_EXPIRY_MINUTES=10
REGISTER_OTP_ENABLED=true
```

---

## 📡 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/register` | Register new user | Public |
| `POST` | `/login` | Login and receive JWT | Public |
| `POST` | `/verify-otp` | Verify email OTP | Public |

### Attendance Routes — `/api/attendance`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/mark` | Mark attendance via QR + GPS | Student |
| `POST` | `/face-mark` | Mark attendance via Face Recognition | Student |
| `GET` | `/analytics/student` | Get student's own analytics | Student |
| `GET` | `/analytics/teacher` | Get class-wise analytics | Teacher |
| `GET` | `/analytics/class/:class_id/csv` | Export attendance as CSV | Teacher |
| `GET` | `/class/:id` | Preview class attendance | Authenticated |
| `POST` | `/manual-override` | Manually update attendance record | Teacher |

### QR Routes — `/api/qr`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/generate` | Generate a new 10-second QR token | Teacher |
| `POST` | `/verify` | Verify scanned QR token | Student |

### Teacher Routes — `/api/teacher`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/add-class` | Create a new class | Teacher |
| `GET` | `/classes` | List all teacher's classes | Teacher |
| `POST` | `/activate-class` | Activate a class session with GPS coords | Teacher |

### Student Routes — `/api/student`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/classes` | Get enrolled classes | Student |
| `POST` | `/join-class` | Join a class by code | Student |

---

## Project Structure

```
AttendAce/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MySQL pool (cloud, SSL)
│   │   └── authMode.js            # Auth mode config
│   ├── controllers/
│   │   ├── attendanceController.js # QR mark, face mark, analytics, CSV, override
│   │   ├── authController.js       # Register, login, OTP
│   │   ├── qrController.js         # Generate & verify dynamic QR tokens
│   │   ├── studentController.js    # Student class management
│   │   ├── teacherController.js    # Teacher class management
│   │   └── contactController.js   # Developer contact form
│   ├── middlewares/
│   │   ├── authMiddleware.js       # JWT verification
│   │   ├── roleMiddleware.js       # Role-based access (student/teacher)
│   │   └── verifyToken.js         # Token utility
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── qrRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── teacherRoutes.js
│   │   └── contactRoutes.js
│   ├── utils/
│   │   └── haversine.js           # GPS distance calculation
│   ├── database/
│   │   └── migration_geofencing.sql
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── login.html
    ├── student-dashboard.html
    ├── teacher-dashboard.html
    ├── scanqr.html
    ├── scanface.html
    ├── register-face.html
    ├── teacher-qrgenerator.html
    ├── activate-class.html
    ├── teacher-manual-override.html
    ├── analytics-student.html
    ├── analytics-teacher.html
    ├── settings.html
    ├── manifest.json              # PWA manifest
    └── assets/
        ├── models/                # face-api.js pre-trained model weights
        └── *.js / *.svg / *.png
```

---

## How It Works

### QR Attendance Flow
```
Teacher activates class (with GPS coords)
        ↓
Teacher opens QR Generator → server issues UUID token (expires in 10s)
        ↓
Student scans QR code on their device
        ↓
Server validates: token not expired + student GPS within 100m + enrolled + not already marked
        ↓
Attendance recorded ✅
```

### Face Recognition Flow
```
Student registers face (embeddings stored on server)
        ↓
Student opens Face Scanner → face-api.js runs in-browser
        ↓
Live face compared against registered embedding
        ↓
Match confirmed → attendance POST sent to /face-mark with GPS coords
        ↓
Server validates proximity + enrollment → Attendance recorded ✅
```

### GPS Geofencing (Haversine Formula)
```javascript
// Distance between two coordinates in meters
distance = 2 * R * arctan2(√a, √(1-a))
// where a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)

// Threshold: student must be within 100 meters
if (distance > 100) → ❌ Attendance denied
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'Add some feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request



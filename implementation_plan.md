# FitCore — Full-Fledged Gym Management System

A comprehensive gym management web application built with **React JS (frontend)**, **PHP (backend API)**, and **Firebase (database + auth)**.

---

## Architecture Overview

```
Frontend (React JS + Vite)
    ↕ REST API calls (Axios)
Backend (PHP / Laravel-style REST API)
    ↕ Firebase Admin SDK (PHP)
Firebase (Firestore DB + Firebase Auth + Firebase Storage)
```

---

## Modules & Features

### 1. 🔐 Authentication
- Login / Register (members + admin)
- Firebase Authentication (email/password + Google OAuth)
- Role-based access: Admin, Trainer, Member

### 2. 🏋️ Member Management
- Add / Edit / Delete members
- Member profiles (photo, contact, health info)
- Membership plans & expiry tracking
- Member search & filter

### 3. 💳 Membership Plans
- Create / Edit / Delete plans (Monthly, Quarterly, Yearly)
- Plan pricing, features, duration
- Assign plans to members

### 4. 📅 Attendance Tracking
- Daily check-in / check-out
- Attendance history per member
- QR code check-in support

### 5. 💰 Payments & Billing
- Record payments (cash, card, online)
- Invoice generation
- Payment history & dues tracking
- Revenue dashboard

### 6. 🧑‍🏫 Trainer Management
- Trainer profiles & specializations
- Assign trainers to members
- Trainer schedules

### 7. 🏃 Workout & Diet Plans
- Create workout plans per member
- Diet plan recommendations
- Progress tracking

### 8. 📊 Analytics Dashboard
- Revenue charts (monthly/yearly)
- Member growth charts
- Attendance heatmap
- Active vs expired memberships

### 9. 📢 Notifications
- Membership expiry alerts
- Payment due reminders
- Announcement board

### 10. ⚙️ Settings
- Gym profile (name, logo, contact)
- Working hours
- User account settings

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React JS 18 + Vite |
| Styling | Vanilla CSS (custom design system) |
| State Management | React Context + useReducer |
| HTTP Client | Axios |
| Charts | Recharts |
| Backend | PHP 8.x REST API |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| File Storage | Firebase Storage |
| Icons | Lucide React |

---

## Project Structure

```
GymManagement/
├── frontend/               # React JS App
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Auth & App context
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API & Firebase services
│   │   ├── utils/          # Helpers
│   │   └── styles/         # Global CSS
│   ├── index.html
│   └── vite.config.js
├── backend/                # PHP REST API
│   ├── api/
│   │   ├── members.php
│   │   ├── plans.php
│   │   ├── attendance.php
│   │   ├── payments.php
│   │   ├── trainers.php
│   │   └── dashboard.php
│   ├── config/
│   │   └── firebase.php    # Firebase Admin SDK config
│   ├── middleware/
│   │   └── auth.php        # JWT/Firebase token verification
│   └── index.php           # Router
└── README.md
```

---

## Proposed Changes

### Frontend (React + Vite)
- `[NEW]` frontend/ - Complete React application
- `[NEW]` src/pages/Login.jsx - Login page
- `[NEW]` src/pages/Dashboard.jsx - Admin dashboard with charts
- `[NEW]` src/pages/Members.jsx - Member management
- `[NEW]` src/pages/Plans.jsx - Membership plans
- `[NEW]` src/pages/Attendance.jsx - Attendance tracking
- `[NEW]` src/pages/Payments.jsx - Payments & billing
- `[NEW]` src/pages/Trainers.jsx - Trainer management
- `[NEW]` src/pages/Workouts.jsx - Workout plans
- `[NEW]` src/pages/Settings.jsx - Settings page
- `[NEW]` src/components/ - 20+ reusable components
- `[NEW]` src/context/AuthContext.jsx - Auth state management
- `[NEW]` src/services/firebase.js - Firebase client config
- `[NEW]` src/services/api.js - PHP API calls

### Backend (PHP)
- `[NEW]` backend/ - PHP REST API
- `[NEW]` backend/api/members.php - Member CRUD
- `[NEW]` backend/api/plans.php - Plans CRUD
- `[NEW]` backend/api/attendance.php - Attendance endpoints
- `[NEW]` backend/api/payments.php - Payment endpoints
- `[NEW]` backend/api/dashboard.php - Analytics endpoints
- `[NEW]` backend/config/firebase.php - Firebase Admin SDK
- `[NEW]` backend/middleware/auth.php - Auth middleware

### Configuration
- `[NEW]` README.md - Setup instructions

---

## Verification Plan

### Manual Verification
1. Login with email/password
2. Create a member with photo upload
3. Assign a membership plan
4. Record attendance
5. Process a payment
6. View dashboard analytics
7. Test role-based access (admin vs member)

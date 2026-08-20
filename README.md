# FitCore — Gym Management Web Application

A full-featured Gym Management Web Application built with **React JS (Vite)** on the frontend, a **PHP REST API** backend, and **Firebase (Firestore & Auth)** as the database.

---

## Features

- 🔐 **Authentication**: User logins & role-based route gates (Admin vs Trainer vs Member)
- 👥 **Members**: Profile profiles with photo upload, stats, plans tracking, and filter tabs
- 💳 **Plans**: Customizable duration tiers, pricing and featured package highlights
- 📅 **Attendance**: Instant checking via search log, active workout duration timer
- 💰 **Billing**: Record fees, generate detailed printable invoices and receipts
- 🧑‍🏫 **Trainers**: Coach directory, shifts schedules and specialization assignments
- 🏋️ **Workout Plans**: Dynamic program creator (sets, reps, weights inputs) per member
- 🥗 **Diet Plans**: Nutrition goals, calorie limits, and custom meal log schedules
- 📢 **Broadcasts**: Send global gym announcements and alerts to notifications tab
- ⚙️ **Settings**: Custom gym profiles, account update, and security password reset
- 📊 **Dashboard**: Area & bar charts summarizing monthly revenue, member growth, stats

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router, Recharts, Lucide Icons, Axios
- **Design**: Modern Dark Theme custom CSS tokens (Glassmorphism design tokens)
- **Backend**: Native PHP 8.x REST API (Dependency-free router & Curl connector)
- **Database / Auth**: Firebase Firestore DB, Client Auth SDK

---

## Installation & Setup

### 1. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named `FitCore Gym` (or similar).
3. Enable **Firebase Authentication** (Email/Password provider and Google OAuth).
4. Create a **Cloud Firestore** database.
5. Create a **Firebase Storage** bucket for uploading images.
6. Register a Web App in your Firebase project and copy the configuration credentials.

### 2. Frontend Configuration
1. Navigate to the `frontend/` directory.
2. Create a `.env` file from the `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Fill in your Firebase Web App configuration keys.
4. Install dependencies and run the client:
   ```bash
   npm install
   ```
5. Run Vite development server:
   ```bash
   npm run dev
   ```

### 3. Backend Configuration
1. Navigate to the `backend/` directory.
2. Create a `.env` file from the `.env.example` template:
   ```bash
   cp .env.example .env
   ```
3. Set your `FIREBASE_PROJECT_ID`.
4. Start local PHP development server:
   ```bash
   php -S localhost:8000
   ```

Now you are ready to manage your gym! Open `http://localhost:5173` to view the beautiful dashboard. 🚀

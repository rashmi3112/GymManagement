# FitCore Gym Management Walkthrough

We have successfully built and scaffolded the full-fledged **FitCore Gym Management System** using **React JS**, **PHP**, and **Firebase**.

---

## 📂 Project Structure Created

- **`frontend/`**: Complete React + Vite app with custom premium dark styling
  - **`src/styles/globals.css`**: Elegant premium dark theme variables, cards, glassmorphic layout, buttons, charts and timeline styling.
  - **`src/components/`**: Modular components including `Sidebar.jsx`, `Navbar.jsx`, `Avatar.jsx`, `Modal.jsx`, `Badge.jsx`, `StatCard.jsx`, `DataTable.jsx`, and `ConfirmDialog.jsx`.
  - **`src/context/`**: Auth and App-wide state providers.
  - **`src/services/`**: Firebase Client App initialization and API Axios interceptor config.
  - **`src/pages/`**: 10 UI dashboards: `Login`, `Dashboard` (with charts), `Members`, `Plans`, `Attendance`, `Payments`, `Trainers`, `Workouts`, `Diet`, `Notifications`, and `Settings`.
- **`backend/`**: Dependency-free PHP REST API
  - **`index.php`**: Central URL router routing clean requests like `/api/members` to modular scripts.
  - **`config/firebase.php`**: Hand-written Firestore Client mapping standard PHP arrays to Firestore format.
  - **`middleware/auth.php`**: Bearer token checker extraction.
  - **`api/`**: Endpoint controller files handling CRUD requests for members, plans, attendance, payments, trainers, workouts, diet, notifications, settings, and dashboard metrics.
- **`README.md`**: Configuration guide.

---

## ⚡ How to Run

### Frontend Client
```bash
cd frontend
npm install
npm run dev
```

### Backend REST API Server
```bash
cd backend
php -S localhost:8000
```
*(Make sure to copy `.env.example` to `.env` in both folders and fill in your Firebase configuration!)*

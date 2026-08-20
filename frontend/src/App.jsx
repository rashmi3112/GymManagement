// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Plans from './pages/Plans';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import Trainers from './pages/Trainers';
import Workouts from './pages/Workouts';
import Diet from './pages/Diet';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

// Components
import Sidebar from './components/Sidebar';

// CSS Styling
import './styles/globals.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader-overlay" style={{ height: '100vh', background: 'var(--color-bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Management Routes */}
            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><Layout><Members /></Layout></ProtectedRoute>} />
            <Route path="/plans" element={<ProtectedRoute><Layout><Plans /></Layout></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Layout><Attendance /></Layout></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Layout><Payments /></Layout></ProtectedRoute>} />
            <Route path="/trainers" element={<ProtectedRoute><Layout><Trainers /></Layout></ProtectedRoute>} />
            <Route path="/workouts" element={<ProtectedRoute><Layout><Workouts /></Layout></ProtectedRoute>} />
            <Route path="/diet" element={<ProtectedRoute><Layout><Diet /></Layout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--color-border-hover)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
            },
          }}
        />
      </AppProvider>
    </AuthProvider>
  );
}

// src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, CalendarCheck, DollarSign,
  Dumbbell, Salad, Bell, Settings, LogOut, ChevronLeft, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

const navItems = [
  { section: 'OVERVIEW' },
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'MANAGEMENT' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/plans', icon: CreditCard, label: 'Plans' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/payments', icon: DollarSign, label: 'Payments' },
  { section: 'TRAINING' },
  { to: '/trainers', icon: Dumbbell, label: 'Trainers' },
  { to: '/workouts', icon: Zap, label: 'Workouts' },
  { to: '/diet', icon: Salad, label: 'Diet Plans' },
  { section: 'SYSTEM' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, userProfile, logout } = useAuth();
  const { sidebarCollapsed, unreadCount } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const displayName = userProfile?.name || user?.displayName || 'User';
  const role = userProfile?.role || 'member';

  return (
    <aside className="sidebar" style={{ width: sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Dumbbell size={20} color="white" />
        </div>
        {!sidebarCollapsed && (
          <span className="sidebar-logo-text">FitCore</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item, idx) => {
          if (item.section) {
            return !sidebarCollapsed ? (
              <p key={idx} className="sidebar-section-label">{item.section}</p>
            ) : <div key={idx} className="divider" style={{ margin: '8px 12px' }} />;
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={20} className="nav-icon" />
              {!sidebarCollapsed && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
          <Avatar name={displayName} size="sm" />
          {!sidebarCollapsed && (
            <>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{displayName}</div>
                <div className="sidebar-user-role">{role.charAt(0).toUpperCase() + role.slice(1)}</div>
              </div>
              <LogOut size={16} color="var(--text-muted)" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

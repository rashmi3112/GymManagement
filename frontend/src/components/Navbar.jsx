// src/components/Navbar.jsx
import { Search, Bell, Menu, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

export default function Navbar({ title }) {
  const { toggleSidebar, unreadCount } = useApp();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="icon-btn" onClick={toggleSidebar} title="Toggle sidebar" id="sidebar-toggle-btn">
          <Menu size={18} />
        </button>
        <h1 className="navbar-title">{title}</h1>
      </div>

      <div className="navbar-right">
        <div className="navbar-search">
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search anything..." id="global-search-input" />
        </div>

        <button
          className="icon-btn"
          onClick={() => navigate('/notifications')}
          title="Notifications"
          id="notifications-btn"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="notification-dot" />}
        </button>

        <button
          className="icon-btn"
          onClick={() => navigate('/settings')}
          title="Profile settings"
          id="profile-avatar-btn"
          style={{ padding: 0, overflow: 'hidden', width: 38, height: 38 }}
        >
          <Avatar
            name={userProfile?.name || user?.displayName || 'U'}
            photoURL={userProfile?.photoURL || user?.photoURL}
            size="sm"
          />
        </button>
      </div>
    </header>
  );
}

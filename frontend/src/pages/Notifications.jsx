// src/pages/Notifications.jsx
import { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle2, Megaphone, Send, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import { notificationsApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const initialForm = {
  title: '',
  body: '',
  type: 'announcement', // announcement | alert | promotion
};

export default function Notifications() {
  const [notifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const { setNotifications: setGlobalNotifications } = useApp();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll();
      setLocalNotifications(data || []);
      setGlobalNotifications(data || []);
    } catch (e) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success('Marked as read');
      fetchNotifications();
    } catch (e) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked read');
      fetchNotifications();
    } catch (e) {
      toast.error('Failed to update notifications');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsApi.delete(id);
      setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (e) {
      toast.error('Failed to delete notification');
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSend = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await notificationsApi.create(form);
      toast.success('Gym announcement broadcasted successfully! 📢');
      setShowModal(false);
      fetchNotifications();
    } catch (e) {
      toast.error(e.message || 'Failed to send notification');
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert':
        return { icon: Bell, bg: 'var(--color-danger-subtle)', color: 'var(--color-danger)' };
      case 'announcement':
        return { icon: Megaphone, bg: 'var(--color-primary-subtle)', color: 'var(--color-primary-light)' };
      default:
        return { icon: Bell, bg: 'var(--color-bg-elevated)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <>
      <Navbar title="Notifications & Announcements" />
      <div className="page-wrapper animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Announcements & Logs</h2>
            <p className="page-subtitle">Send notifications and trace alert logs</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-ghost" onClick={handleMarkAllRead} disabled={notifications.every(n => n.read)}>
              <CheckCircle2 size={16} /> Mark All Read
            </button>
            <button className="btn btn-primary" onClick={() => { setForm(initialForm); setShowModal(true); }} id="send-announcement-btn">
              <Megaphone size={16} /> Broadcast Alert
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
            <div className="empty-state">
              <div className="empty-state-icon">
                <Bell size={32} />
              </div>
              <h3>Clear inbox!</h3>
              <p>No notifications or gym broadcasts found.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {notifications.map((n) => {
              const meta = getIcon(n.type);
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  className={`notification-item ${!n.read ? 'unread' : ''}`}
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    <div className="notification-icon" style={{ background: meta.bg }}>
                      <Icon size={18} color={meta.color} />
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{n.title}</div>
                      <div className="notification-body">{n.body}</div>
                      <div className="notification-time">
                        {n.createdAt ? format(new Date(n.createdAt), 'dd MMM yyyy hh:mm a') : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!n.read && (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleMarkRead(n.id)}>
                        Mark Read
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(n.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Broadcast Announcement"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="announcement-form" type="submit" disabled={saving}>
              {saving ? 'Sending...' : 'Send Broadcast'}
            </button>
          </>
        }
      >
        <form id="announcement-form" onSubmit={handleSend}>
          <div className="form-group">
            <label className="form-label">Alert Category *</label>
            <select className="form-input" value={form.type} onChange={set('type')}>
              <option value="announcement">Gym Announcement</option>
              <option value="alert">System / Maintenance Alert</option>
              <option value="promotion">Promo / Offers</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notification Title *</label>
            <input className="form-input" required value={form.title} onChange={set('title')} placeholder="e.g. Gym Maintenance Hours, Free Yoga Session" />
          </div>

          <div className="form-group">
            <label className="form-label">Message Body *</label>
            <textarea className="form-input" rows={4} required value={form.body} onChange={set('body')} placeholder="Provide message details..." />
          </div>
        </form>
      </Modal>
    </>
  );
}

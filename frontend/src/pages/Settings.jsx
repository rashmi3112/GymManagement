// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, User, Landmark, Save, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { settingsApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { gymSettings, setGymSettings } = useApp();
  const { userProfile, fetchUserProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('gym'); // gym | account | security
  
  // Gym state
  const [gymForm, setGymForm] = useState({ name: '', address: '', phone: '', currency: '₹', email: '' });
  const [gymSaving, setGymSaving] = useState(false);

  // Account state
  const [accForm, setAccForm] = useState({ name: '', phone: '' });
  const [accSaving, setAccSaving] = useState(false);

  // Security state
  const [secForm, setSecForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [secSaving, setSecSaving] = useState(false);

  useEffect(() => {
    fetchGymSettings();
    if (userProfile) {
      setAccForm({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
      });
    }
  }, [userProfile]);

  const fetchGymSettings = async () => {
    try {
      const data = await settingsApi.getGym();
      if (data) {
        setGymForm({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          currency: data.currency || '₹',
          email: data.email || '',
        });
        setGymSettings(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGymSave = async (e) => {
    e.preventDefault();
    setGymSaving(true);
    try {
      await settingsApi.updateGym(gymForm);
      setGymSettings(gymForm);
      toast.success('Gym settings updated!');
    } catch (e) {
      toast.error('Failed to update gym settings');
    } finally {
      setGymSaving(false);
    }
  };

  const handleAccSave = async (e) => {
    e.preventDefault();
    setAccSaving(true);
    try {
      await settingsApi.updateUser(accForm);
      if (userProfile?.uid) {
        await fetchUserProfile(userProfile.uid);
      }
      toast.success('Account profile updated!');
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setAccSaving(false);
    }
  };

  const handleSecSave = async (e) => {
    e.preventDefault();
    if (secForm.newPass !== secForm.confirmPass) {
      toast.error('Passwords do not match');
      return;
    }
    setSecSaving(true);
    try {
      await settingsApi.changePassword({
        oldPassword: secForm.oldPass,
        newPassword: secForm.newPass,
      });
      setSecForm({ oldPass: '', newPass: '', confirmPass: '' });
      toast.success('Password changed successfully!');
    } catch (e) {
      toast.error(e.message || 'Failed to change password');
    } finally {
      setSecSaving(false);
    }
  };

  return (
    <>
      <Navbar title="Settings" />
      <div className="page-wrapper animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Configuration Settings</h2>
            <p className="page-subtitle">Configure system options and user accounts</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-6)' }}>
          {/* Settings Navigation Tabs */}
          <div className="flex flex-col gap-2">
            {[
              { id: 'gym', label: 'Gym Profile', icon: Landmark },
              { id: 'account', label: 'My Account', icon: User },
              { id: 'security', label: 'Security & Password', icon: Shield },
            ].map((t) => (
              <button
                key={t.id}
                className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
                onClick={() => setActiveTab(t.id)}
                id={`settings-tab-${t.id}-btn`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Configuration Form Panels */}
          <div className="card">
            {activeTab === 'gym' && (
              <form onSubmit={handleGymSave} id="gym-settings-form">
                <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Gym Details</h3>
                
                <div className="form-group">
                  <label className="form-label">Gym / Fitness Center Name *</label>
                  <input
                    className="form-input"
                    required
                    value={gymForm.name}
                    onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      className="form-input"
                      type="email"
                      value={gymForm.email}
                      onChange={(e) => setGymForm({ ...gymForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Support</label>
                    <input
                      className="form-input"
                      value={gymForm.phone}
                      onChange={(e) => setGymForm({ ...gymForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      className="form-input"
                      value={gymForm.address}
                      onChange={(e) => setGymForm({ ...gymForm, address: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency Symbol *</label>
                    <input
                      className="form-input"
                      required
                      value={gymForm.currency}
                      onChange={(e) => setGymForm({ ...gymForm, currency: e.target.value })}
                    />
                  </div>
                </div>

                <button className="btn btn-primary" type="submit" disabled={gymSaving} id="gym-settings-submit-btn">
                  <Save size={16} /> {gymSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            )}

            {activeTab === 'account' && (
              <form onSubmit={handleAccSave} id="account-settings-form">
                <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>My Profile</h3>

                <div className="form-group">
                  <label className="form-label">Email (Immutable)</label>
                  <input className="form-input" disabled value={userProfile?.email || ''} style={{ opacity: 0.6 }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Display / Full Name *</label>
                  <input
                    className="form-input"
                    required
                    value={accForm.name}
                    onChange={(e) => setAccForm({ ...accForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    className="form-input"
                    value={accForm.phone}
                    onChange={(e) => setAccForm({ ...accForm, phone: e.target.value })}
                  />
                </div>

                <button className="btn btn-primary" type="submit" disabled={accSaving} id="account-settings-submit-btn">
                  <Save size={16} /> {accSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleSecSave} id="security-settings-form">
                <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Change Password</h3>

                <div className="form-group">
                  <label className="form-label">Current Password *</label>
                  <input
                    className="form-input"
                    type="password"
                    required
                    value={secForm.oldPass}
                    onChange={(e) => setSecForm({ ...secForm, oldPass: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password *</label>
                  <input
                    className="form-input"
                    type="password"
                    required
                    minLength={6}
                    value={secForm.newPass}
                    onChange={(e) => setSecForm({ ...secForm, newPass: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <input
                    className="form-input"
                    type="password"
                    required
                    value={secForm.confirmPass}
                    onChange={(e) => setSecForm({ ...secForm, confirmPass: e.target.value })}
                  />
                </div>

                <button className="btn btn-primary" type="submit" disabled={secSaving} id="security-settings-submit-btn">
                  <Lock size={16} /> {secSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Dumbbell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const { login, register, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back! 💪');
        navigate('/');
      } else if (mode === 'register') {
        await register(form.email, form.password, form.name, form.role);
        toast.success('Account created! Welcome to FitCore 🎉');
        navigate('/');
      } else {
        await resetPassword(form.email);
        toast.success('Password reset email sent!');
        setMode('login');
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google! 💪');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-gradient" />

      {/* Left illustration */}
      <div className="login-illustration">
        <div style={{ maxWidth: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div className="sidebar-logo-icon" style={{ width: 52, height: 52 }}>
              <Dumbbell size={28} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              FitCore
            </span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
            The Complete{' '}
            <span className="text-gradient">Gym Management</span>
            {' '}Platform
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 40 }}>
            Streamline your gym operations with smart member management, attendance tracking, payment processing, and AI-powered analytics.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['👥 Member Management', '📅 Attendance Tracking', '💰 Billing & Invoices', '📊 Analytics Dashboard', '🏋️ Workout Plans', '🔔 Smart Notifications'].map((f) => (
              <span key={f} style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                padding: '8px 16px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}>
                {f}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 48 }}>
            {[['500+', 'Happy Gyms'], ['50K+', 'Members Managed'], ['99.9%', 'Uptime']].map(([v, l]) => (
              <div key={l} style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary-light)' }}>{v}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="login-panel">
        <div className="login-logo">
          <div className="sidebar-logo-icon">
            <Dumbbell size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>FitCore</span>
        </div>

        <h2 className="login-title">
          {mode === 'login' ? 'Welcome back 👋' : mode === 'register' ? 'Create Account' : 'Reset Password'}
        </h2>
        <p className="login-subtitle">
          {mode === 'login'
            ? 'Sign in to your account to continue'
            : mode === 'register'
            ? 'Join FitCore to manage your gym efficiently'
            : 'Enter your email and we\'ll send a reset link'}
        </p>

        {/* Google Sign In */}
        {mode !== 'reset' && (
          <>
            <button
              className="btn btn-ghost w-full"
              style={{ justifyContent: 'center', marginBottom: 'var(--space-4)', height: 46 }}
              onClick={handleGoogle}
              disabled={loading}
              id="google-signin-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="login-divider">or</div>
          </>
        )}

        <form onSubmit={handleSubmit} id="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  className="form-input"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={set('name')}
                  required
                  id="register-name-input"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
                id="email-input"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-group has-right-icon">
                <Lock size={18} className="input-icon" />
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                  id="password-input"
                />
                <span className="input-icon-right" onClick={() => setShowPass((v) => !v)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select className="form-input" value={form.role} onChange={set('role')} id="role-select">
                <option value="admin">Admin / Gym Owner</option>
                <option value="trainer">Trainer</option>
                <option value="member">Member</option>
              </select>
            </div>
          )}

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: 'var(--space-4)', marginTop: '-var(--space-2)' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode('reset')} id="forgot-password-btn">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center', height: 48, fontSize: '1rem', marginTop: 'var(--space-2)' }}
            disabled={loading}
            id="auth-submit-btn"
          >
            {loading ? (
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-primary-light)' }} onClick={() => setMode('register')} id="switch-to-register-btn">
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-primary-light)' }} onClick={() => setMode('login')} id="switch-to-login-btn">
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

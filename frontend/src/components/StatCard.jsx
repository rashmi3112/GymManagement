// src/components/StatCard.jsx
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, change, changeType = 'up', accentColor, iconBg }) {
  return (
    <div
      className="stat-card animate-slide-up"
      style={{
        '--card-accent': accentColor || 'var(--color-primary)',
        '--card-icon-bg': iconBg || 'var(--color-primary-subtle)',
      }}
    >
      <div className="stat-card-header">
        <div className="stat-card-icon">
          <Icon size={22} color={accentColor || 'var(--color-primary-light)'} />
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {change !== undefined && (
        <div className={`stat-card-change ${changeType}`}>
          {changeType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}
        </div>
      )}
    </div>
  );
}

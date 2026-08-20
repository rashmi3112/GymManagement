// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Users, DollarSign, CalendarCheck, TrendingUp, Clock, UserCheck, AlertCircle, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const CHART_COLORS = ['#6c63ff', '#ff6b9d', '#00d4b1', '#ffd166', '#ff5757'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-hover)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontSize: '0.8rem',
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue')
            ? `₹${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({ members: 0, revenue: 0, attendance: 0, activeMembers: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [memberGrowth, setMemberGrowth] = useState([]);
  const [planDistribution, setPlanDistribution] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [expiringMembers, setExpiringMembers] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch members
      const membersSnap = await getDocs(collection(db, 'members'));
      const members = membersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Fetch payments
      const paymentsSnap = await getDocs(collection(db, 'payments'));
      const payments = paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Fetch attendance
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const attendanceSnap = await getDocs(
        query(collection(db, 'attendance'), where('date', '>=', Timestamp.fromDate(today)))
      );

      // Stats
      const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
      const activeMembers = members.filter((m) => m.status === 'active').length;
      const todayAttendance = attendanceSnap.docs.length;

      setStats({
        members: members.length,
        revenue: totalRevenue,
        attendance: todayAttendance,
        activeMembers,
      });

      // Revenue last 6 months
      const revenueByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const monthStart = startOfMonth(d);
        const monthEnd = endOfMonth(d);
        const monthRevenue = payments
          .filter((p) => {
            const pd = p.createdAt?.toDate?.() || new Date(p.createdAt);
            return pd >= monthStart && pd <= monthEnd;
          })
          .reduce((s, p) => s + (p.amount || 0), 0);
        revenueByMonth.push({ month: format(d, 'MMM'), Revenue: monthRevenue });
      }
      setRevenueData(revenueByMonth);

      // Member growth
      const growthByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const monthEnd = endOfMonth(d);
        const count = members.filter((m) => {
          const cd = m.createdAt?.toDate?.() || new Date(m.createdAt || 0);
          return cd <= monthEnd;
        }).length;
        growthByMonth.push({ month: format(d, 'MMM'), Members: count });
      }
      setMemberGrowth(growthByMonth);

      // Plan distribution
      const planCounts = {};
      members.forEach((m) => {
        const plan = m.plan || 'None';
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      });
      setPlanDistribution(Object.entries(planCounts).map(([name, value]) => ({ name, value })));

      // Recent members (last 5)
      const sorted = [...members].sort((a, b) => {
        const da = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const db2 = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return db2 - da;
      });
      setRecentMembers(sorted.slice(0, 5));

      // Expiring memberships (next 7 days)
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      setExpiringMembers(
        members.filter((m) => {
          if (!m.membershipExpiry) return false;
          const exp = m.membershipExpiry?.toDate?.() || new Date(m.membershipExpiry);
          return exp >= new Date() && exp <= sevenDaysLater;
        }).slice(0, 5)
      );

      // Recent attendance
      const attSnap = await getDocs(query(collection(db, 'attendance'), orderBy('checkIn', 'desc'), limit(6)));
      setRecentAttendance(attSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  return (
    <>
      <Navbar title="Dashboard" />
      <div className="page-wrapper animate-fade-in">
        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            icon={Users}
            label="Total Members"
            value={loading ? '—' : stats.members}
            change="+12% this month"
            changeType="up"
            accentColor="var(--color-primary)"
            iconBg="var(--color-primary-subtle)"
          />
          <StatCard
            icon={UserCheck}
            label="Active Members"
            value={loading ? '—' : stats.activeMembers}
            change="+5% this month"
            changeType="up"
            accentColor="var(--color-teal)"
            iconBg="var(--color-teal-subtle)"
          />
          <StatCard
            icon={CalendarCheck}
            label="Today's Attendance"
            value={loading ? '—' : stats.attendance}
            change="Live"
            changeType="up"
            accentColor="var(--color-success)"
            iconBg="var(--color-success-subtle)"
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={loading ? '—' : formatCurrency(stats.revenue)}
            change="+18% this month"
            changeType="up"
            accentColor="var(--color-amber)"
            iconBg="rgba(255,209,102,0.1)"
          />
        </div>

        {/* Charts Row */}
        <div className="content-grid">
          {/* Revenue Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Revenue Overview</div>
                <div className="card-subtitle">Last 6 months performance</div>
              </div>
              <Badge variant="success" dot>Live</Badge>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Revenue" stroke="#6c63ff" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: '#6c63ff', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Plan Distribution</div>
                <div className="card-subtitle">Members per plan</div>
              </div>
            </div>
            <div className="chart-container" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planDistribution.length ? planDistribution : [{ name: 'No Data', value: 1 }]}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={4} dataKey="value"
                  >
                    {(planDistribution.length ? planDistribution : [{ name: 'No Data', value: 1 }]).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-hover)', borderRadius: 8 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Member Growth Chart */}
        <div className="card mb-6">
          <div className="card-header">
            <div>
              <div className="card-title">Member Growth</div>
              <div className="card-subtitle">Cumulative member count over 6 months</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Members" fill="#00d4b1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="two-col-grid">
          {/* Recent Members */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Members</div>
              <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = '/members'}>View All</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 12, width: '40%' }} />
                    </div>
                  </div>
                ))
              ) : recentMembers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>No members yet</p>
              ) : (
                recentMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar name={m.name} photoURL={m.photoURL} size="md" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.plan || 'No Plan'} • {m.email}</div>
                    </div>
                    <Badge variant={m.status === 'active' ? 'success' : 'danger'} dot>
                      {m.status || 'active'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expiring Memberships */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={18} color="var(--color-warning)" />
                  Expiring Soon
                </span>
              </div>
              <Badge variant="warning">{expiringMembers.length} members</Badge>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-md)' }} />
                ))
              ) : expiringMembers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Activity size={28} />
                  </div>
                  <p>No memberships expiring in the next 7 days!</p>
                </div>
              ) : (
                expiringMembers.map((m) => {
                  const exp = m.membershipExpiry?.toDate?.() || new Date(m.membershipExpiry);
                  const daysLeft = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={m.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      background: 'var(--color-warning-subtle)',
                      border: '1px solid var(--color-warning-glow)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-3)',
                    }}>
                      <Avatar name={m.name} size="sm" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)' }}>Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</div>
                      </div>
                      <Clock size={16} color="var(--color-warning)" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

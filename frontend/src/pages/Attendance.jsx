// src/pages/Attendance.jsx
import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Clock, Calendar, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import { attendanceApi, membersApi } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [checkInSearch, setCheckInSearch] = useState('');
  const [checkInResults, setCheckInResults] = useState([]);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchTodayAttendance();
    fetchMembers();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const data = await attendanceApi.getToday();
      setAttendance(data || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load today\'s attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await membersApi.getAll({ status: 'active' });
      setMembers(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Search members to check-in
  const handleCheckInSearch = (val) => {
    setCheckInSearch(val);
    if (!val.trim()) {
      setCheckInResults([]);
      return;
    }

    const filtered = members.filter((m) =>
      m.name?.toLowerCase().includes(val.toLowerCase()) ||
      m.phone?.includes(val) ||
      m.id?.toLowerCase().includes(val.toLowerCase())
    );
    setCheckInResults(filtered.slice(0, 5));
  };

  const handleCheckIn = async (member) => {
    setCheckingIn(true);
    try {
      // Check if already checked in
      const isAlreadyCheckedIn = attendance.some((a) => a.memberId === member.id && !a.checkOut);
      if (isAlreadyCheckedIn) {
        toast.error(`${member.name} is already checked in!`);
        return;
      }

      await attendanceApi.checkIn({
        memberId: member.id,
        name: member.name,
        photoURL: member.photoURL || null,
        plan: member.plan || 'None',
      });
      
      toast.success(`${member.name} checked in! 🚪`);
      setCheckInSearch('');
      setCheckInResults([]);
      fetchTodayAttendance();
    } catch (e) {
      toast.error(e.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async (attendanceId, name) => {
    try {
      await attendanceApi.checkOut(attendanceId);
      toast.success(`${name} checked out! 👋`);
      fetchTodayAttendance();
    } catch (e) {
      toast.error(e.message || 'Check-out failed');
    }
  };

  const filteredAttendance = attendance.filter((a) =>
    a.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'Member',
      render: (v, r) => (
        <div className="flex items-center gap-3">
          <Avatar name={v} photoURL={r.photoURL} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.plan || 'No Plan'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'checkIn',
      label: 'Check In Time',
      render: (v) => v ? format(new Date(v), 'hh:mm a') : '—',
    },
    {
      key: 'checkOut',
      label: 'Check Out Time',
      render: (v, r) => v ? (
        <span style={{ color: 'var(--text-muted)' }}>{format(new Date(v), 'hh:mm a')}</span>
      ) : (
        <button
          className="btn btn-ghost btn-sm btn-teal"
          onClick={() => handleCheckOut(r.id, r.name)}
        >
          Check Out
        </button>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (_, r) => {
        if (!r.checkIn) return '—';
        const start = new Date(r.checkIn);
        const end = r.checkOut ? new Date(r.checkOut) : new Date();
        const diffMs = end - start;
        const diffMins = Math.floor(diffMs / 60000);
        const hrs = Math.floor(diffMins / 6000);
        const mins = diffMins % 60;
        return r.checkOut ? `${hrs > 0 ? `${hrs}h ` : ''}${mins}m` : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-teal)' }}>
            <span className="badge-dot" style={{ background: 'var(--color-teal)', animation: 'pulse 1.5s infinite' }} />
            Active
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, r) => r.checkOut ? (
        <Badge variant="neutral">Completed</Badge>
      ) : (
        <Badge variant="success">Checked In</Badge>
      ),
    },
  ];

  return (
    <>
      <Navbar title="Attendance" />
      <div className="page-wrapper animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Attendance Tracking</h2>
            <p className="page-subtitle">Manage today's member check-ins and check-outs</p>
          </div>
        </div>

        <div className="content-grid">
          {/* Left panel: Daily Log */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-border)', marginBottom: 0 }}>
              <div className="card-title">Today's Attendance Log</div>
              <div className="search-bar">
                <Search size={16} />
                <input
                  placeholder="Filter today's log..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  id="attendance-filter-input"
                />
              </div>
            </div>
            <DataTable columns={columns} data={filteredAttendance} loading={loading} />
          </div>

          {/* Right panel: Instant Check-In */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Member Check-In</h3>
              <div className="form-group" style={{ position: 'relative' }}>
                <div className="search-bar w-full">
                  <Search size={16} />
                  <input
                    placeholder="Search member name or phone..."
                    value={checkInSearch}
                    onChange={(e) => handleCheckInSearch(e.target.value)}
                    id="checkin-search-input"
                  />
                </div>

                {/* Instant Check-in Results dropdown */}
                {checkInResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-hover)',
                    borderRadius: 'var(--radius-md)',
                    zIndex: 20,
                    marginTop: 4,
                    overflow: 'hidden',
                  }}>
                    {checkInResults.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3"
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--color-border)',
                          transition: 'background 0.2s',
                        }}
                        onClick={() => handleCheckIn(m)}
                        hover-bg="var(--color-bg-hover)"
                      >
                        <Avatar name={m.name} photoURL={m.photoURL} size="sm" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.plan || 'No Plan'} • {m.phone || 'No Phone'}</div>
                        </div>
                        <UserCheck size={16} color="var(--color-primary-light)" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
              }}>
                <Clock size={20} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
                <p>Type member details to quickly record their check-in.</p>
              </div>
            </div>

            {/* Daily stats summary */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Today's Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div className="flex items-center justify-between" style={{ background: 'var(--color-bg-tertiary)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Check-ins</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>{attendance.length}</span>
                </div>
                <div className="flex items-center justify-between" style={{ background: 'var(--color-bg-tertiary)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Currently Active</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-teal)' }}>
                    {attendance.filter((a) => !a.checkOut).length}
                  </span>
                </div>
                <div className="flex items-center justify-between" style={{ background: 'var(--color-bg-tertiary)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Completed Workouts</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                    {attendance.filter((a) => !!a.checkOut).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

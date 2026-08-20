// src/pages/Trainers.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Shield, HeartPulse, Trophy } from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';
import { trainersApi } from '../services/api';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  specialization: 'General Fitness',
  experience: 1, // in years
  salary: 0,
  schedule: 'Morning (06:00 AM - 11:00 AM)',
  status: 'active',
};

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const data = await trainersApi.getAll();
      setTrainers(data || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name || '',
      email: t.email || '',
      phone: t.phone || '',
      specialization: t.specialization || 'General Fitness',
      experience: t.experience || 1,
      salary: t.salary || 0,
      schedule: t.schedule || 'Morning (06:00 AM - 11:00 AM)',
      status: t.status || 'active',
    });
    setShowModal(true);
  };

  const openDelete = (t) => {
    setSelected(t);
    setShowDelete(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        experience: Number(form.experience),
        salary: Number(form.salary),
      };

      if (editing) {
        await trainersApi.update(editing.id, payload);
        toast.success('Trainer details updated!');
      } else {
        await trainersApi.create(payload);
        toast.success('New trainer hired! 🏆');
      }
      setShowModal(false);
      fetchTrainers();
    } catch (e) {
      toast.error(e.message || 'Failed to save trainer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await trainersApi.delete(selected.id);
      toast.success('Trainer profile deleted');
      fetchTrainers();
    } catch (e) {
      toast.error(e.message || 'Failed to delete trainer');
    }
  };

  const filteredTrainers = trainers.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'Trainer',
      render: (v, r) => (
        <div className="flex items-center gap-3">
          <Avatar name={v} photoURL={r.photoURL} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    {
      key: 'specialization',
      label: 'Specialization',
      render: (v) => <Badge variant="primary">{v}</Badge>,
    },
    {
      key: 'experience',
      label: 'Experience',
      render: (v) => `${v} Year${v !== 1 ? 's' : ''}`,
    },
    {
      key: 'schedule',
      label: 'Shift',
      render: (v) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge variant={v === 'active' ? 'success' : 'danger'} dot>{v}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, r) => (
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(r)}>
            <Edit size={14} />
          </button>
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(r)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Navbar title="Trainers" />
      <div className="page-wrapper animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Gym Trainers</h2>
            <p className="page-subtitle">Manage coaches, fitness instructors and schedules</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} id="add-trainer-btn">
            <Plus size={16} /> Hire Trainer
          </button>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="search-bar">
            <Search size={16} />
            <input
              placeholder="Search by name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="trainer-search-input"
            />
          </div>
        </div>

        {/* Trainers List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable columns={columns} data={filteredTrainers} loading={loading} />
        </div>
      </div>

      {/* Trainer Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Trainer Profile' : 'Hire New Trainer'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="trainer-form" type="submit" disabled={saving}>
              {saving ? 'Hiring...' : editing ? 'Update Trainer' : 'Hire Trainer'}
            </button>
          </>
        }
      >
        <form id="trainer-form" onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" required value={form.name} onChange={set('name')} placeholder="e.g. Coach Carter" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input className="form-input" type="email" required value={form.email} onChange={set('email')} placeholder="coach@gym.com" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-input" required value={form.phone} onChange={set('phone')} placeholder="+91 98765 00000" />
            </div>
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <select className="form-input" value={form.specialization} onChange={set('specialization')}>
                <option value="General Fitness">General Fitness</option>
                <option value="Bodybuilding & Strength">Bodybuilding & Strength</option>
                <option value="Yoga & Meditation">Yoga & Meditation</option>
                <option value="Zumba & Cardio">Zumba & Cardio</option>
                <option value="Crossfit Coach">Crossfit Coach</option>
                <option value="Nutritionist">Nutritionist</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Experience (Years) *</label>
              <input className="form-input" type="number" min="0" required value={form.experience} onChange={set('experience')} />
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Salary (INR) *</label>
              <input className="form-input" type="number" min="0" required value={form.salary} onChange={set('salary')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Shift / Work Schedule</label>
              <select className="form-input" value={form.schedule} onChange={set('schedule')}>
                <option value="Morning (06:00 AM - 11:00 AM)">Morning (06:00 AM - 11:00 AM)</option>
                <option value="Afternoon (11:00 AM - 04:00 PM)">Afternoon (11:00 AM - 04:00 PM)</option>
                <option value="Evening (04:00 PM - 09:00 PM)">Evening (04:00 PM - 09:00 PM)</option>
                <option value="Full Time (08:00 AM - 08:00 PM)">Full Time (08:00 AM - 08:00 PM)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={set('status')}>
                <option value="active">Active / Working</option>
                <option value="inactive">Inactive / On Leave</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Remove Trainer"
        message={`Are you sure you want to terminate the profile of Coach "${selected?.name}"?`}
        danger
      />
    </>
  );
}

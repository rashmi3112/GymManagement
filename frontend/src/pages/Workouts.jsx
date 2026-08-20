// src/pages/Workouts.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Dumbbell, Trash2, Edit, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import { workoutsApi, membersApi } from '../services/api';
import toast from 'react-hot-toast';

const initialWorkout = {
  memberId: '',
  planName: 'Strength Program',
  difficulty: 'intermediate',
  notes: '',
  exercises: [
    { name: 'Squats', sets: 4, reps: 10, weight: '60kg' },
    { name: 'Bench Press', sets: 4, reps: 8, weight: '50kg' },
  ],
};

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialWorkout);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchWorkouts();
    fetchMembers();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const data = await workoutsApi.getAll();
      setWorkouts(data || []);
    } catch (e) {
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await membersApi.getAll();
      setMembers(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addExercise = () => {
    setForm((f) => ({
      ...f,
      exercises: [...f.exercises, { name: '', sets: 3, reps: 12, weight: '' }],
    }));
  };

  const removeExercise = (idx) => {
    setForm((f) => ({
      ...f,
      exercises: f.exercises.filter((_, i) => i !== idx),
    }));
  };

  const updateExercise = (idx, field, val) => {
    setForm((f) => ({
      ...f,
      exercises: f.exercises.map((ex, i) => (i === idx ? { ...ex, [field]: val } : ex)),
    }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(initialWorkout);
    setShowModal(true);
  };

  const openEdit = (w) => {
    setEditing(w);
    setForm({
      memberId: w.memberId || '',
      planName: w.planName || '',
      difficulty: w.difficulty || 'beginner',
      notes: w.notes || '',
      exercises: w.exercises || [],
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.memberId) {
      toast.error('Select a member first');
      return;
    }
    setSaving(true);
    try {
      const member = members.find((m) => m.id === form.memberId);
      const payload = {
        ...form,
        memberName: member?.name || 'Unknown',
        memberEmail: member?.email || '',
      };

      if (editing) {
        await workoutsApi.update(editing.id, payload);
        toast.success('Workout plan updated!');
      } else {
        await workoutsApi.create(payload);
        toast.success('Workout assigned to member! 🏋️');
      }
      setShowModal(false);
      fetchWorkouts();
    } catch (e) {
      toast.error(e.message || 'Failed to save workout plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    try {
      await workoutsApi.delete(id);
      toast.success('Workout plan deleted');
      fetchWorkouts();
    } catch (e) {
      toast.error('Failed to delete workout');
    }
  };

  const columns = [
    {
      key: 'memberName',
      label: 'Member',
      render: (v, r) => (
        <div className="flex items-center gap-3">
          <Avatar name={v} photoURL={r.photoURL} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.memberEmail}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      label: 'Routine',
      render: (v) => <Badge variant="primary">{v}</Badge>,
    },
    {
      key: 'difficulty',
      label: 'Level',
      render: (v) => (
        <Badge variant={v === 'beginner' ? 'teal' : v === 'intermediate' ? 'warning' : 'danger'}>
          {v?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'exercises',
      label: 'Exercises',
      render: (v) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {v?.length || 0} movement{(v?.length || 0) !== 1 ? 's' : ''} configured
        </span>
      ),
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
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(r.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Navbar title="Workout Plans" />
      <div className="page-wrapper animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Workout Routines</h2>
            <p className="page-subtitle">Assign custom strength, hypertrophy or cardio training logs</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} id="assign-workout-btn">
            <Plus size={16} /> Assign Program
          </button>
        </div>

        {/* Search */}
        <div className="filter-bar">
          <div className="search-bar">
            <Search size={16} />
            <input
              placeholder="Search assigned routines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="workout-search-input"
            />
          </div>
        </div>

        {/* Workouts Log */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            data={workouts.filter((w) => w.memberName?.toLowerCase().includes(search.toLowerCase()))}
            loading={loading}
          />
        </div>
      </div>

      {/* Program Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Assigned Program' : 'Assign Workout Program'}
        size="lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="workout-form" type="submit" disabled={saving}>
              {saving ? 'Assigning...' : editing ? 'Update Routine' : 'Assign Program'}
            </button>
          </>
        }
      >
        <form id="workout-form" onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Member *</label>
              <select className="form-input" required value={form.memberId} onChange={setField('memberId')}>
                <option value="">Select Member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Program Routine Title *</label>
              <input className="form-input" required value={form.planName} onChange={setField('planName')} placeholder="e.g. 5x5 Push Strength Routine" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Difficulty / Level</label>
              <select className="form-input" value={form.difficulty} onChange={setField('difficulty')}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Coaching Guidance Notes</label>
              <input className="form-input" value={form.notes} onChange={setField('notes')} placeholder="e.g. Focus on deep range squat form..." />
            </div>
          </div>

          {/* Exercises block */}
          <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Exercise Logs</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addExercise}>
                <Plus size={14} /> Add Movement
              </button>
            </div>

            {form.exercises.map((ex, idx) => (
              <div key={idx} className="flex gap-3 items-center" style={{ marginBottom: 'var(--space-2)' }}>
                <input
                  className="form-input"
                  style={{ flex: 2 }}
                  placeholder="Exercise Name (e.g. Bench Press)"
                  value={ex.name}
                  onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                  required
                />
                <input
                  className="form-input"
                  type="number"
                  style={{ flex: 1 }}
                  placeholder="Sets"
                  value={ex.sets}
                  onChange={(e) => updateExercise(idx, 'sets', Number(e.target.value))}
                  required
                />
                <input
                  className="form-input"
                  type="number"
                  style={{ flex: 1 }}
                  placeholder="Reps"
                  value={ex.reps}
                  onChange={(e) => updateExercise(idx, 'reps', Number(e.target.value))}
                  required
                />
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Weight (e.g. 40kg)"
                  value={ex.weight}
                  onChange={(e) => updateExercise(idx, 'weight', e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-icon"
                  style={{ padding: 10 }}
                  onClick={() => removeExercise(idx)}
                  disabled={form.exercises.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </form>
      </Modal>
    </>
  );
}

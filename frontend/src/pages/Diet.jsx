// src/pages/Diet.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Salad, Trash2, Edit } from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import { dietApi, membersApi } from '../services/api';
import toast from 'react-hot-toast';

const initialDiet = {
  memberId: '',
  planName: 'Keto Diet Plan',
  calories: 2200,
  protein: 150, // grams
  carbs: 50,
  fat: 100,
  goal: 'fat-loss', // fat-loss | muscle-gain | maintenance
  meals: [
    { title: 'Breakfast', food: '3 Scrambled Eggs with spinach, 1 Avocado' },
    { title: 'Lunch', food: '200g Grilled Chicken Breast with broccoli' },
    { title: 'Dinner', food: '150g Baked Salmon with asparagus' },
  ],
};

export default function Diet() {
  const [diets, setDiets] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialDiet);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchDiets();
    fetchMembers();
  }, []);

  const fetchDiets = async () => {
    try {
      setLoading(true);
      const data = await dietApi.getAll();
      setDiets(data || []);
    } catch (e) {
      toast.error('Failed to load diet plans');
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

  const addMeal = () => {
    setForm((f) => ({
      ...f,
      meals: [...f.meals, { title: 'Meal ' + (f.meals.length + 1), food: '' }],
    }));
  };

  const removeMeal = (idx) => {
    setForm((f) => ({
      ...f,
      meals: f.meals.filter((_, i) => i !== idx),
    }));
  };

  const updateMeal = (idx, field, val) => {
    setForm((f) => ({
      ...f,
      meals: f.meals.map((m, i) => (i === idx ? { ...m, [field]: val } : m)),
    }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(initialDiet);
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      memberId: d.memberId || '',
      planName: d.planName || '',
      calories: d.calories || 2000,
      protein: d.protein || 120,
      carbs: d.carbs || 100,
      fat: d.fat || 80,
      goal: d.goal || 'maintenance',
      meals: d.meals || [],
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.memberId) {
      toast.error('Please select a member');
      return;
    }
    setSaving(true);
    try {
      const member = members.find((m) => m.id === form.memberId);
      const payload = {
        ...form,
        memberName: member?.name || 'Unknown',
        memberEmail: member?.email || '',
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
      };

      if (editing) {
        await dietApi.update(editing.id, payload);
        toast.success('Diet plan updated!');
      } else {
        await dietApi.create(payload);
        toast.success('Diet recommendations assigned! 🥗');
      }
      setShowModal(false);
      fetchDiets();
    } catch (e) {
      toast.error(e.message || 'Failed to save diet plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this diet plan?')) return;
    try {
      await dietApi.delete(id);
      toast.success('Diet plan deleted');
      fetchDiets();
    } catch (e) {
      toast.error('Failed to delete diet plan');
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
      label: 'Diet Type',
      render: (v) => <Badge variant="primary">{v}</Badge>,
    },
    {
      key: 'goal',
      label: 'Fitness Goal',
      render: (v) => (
        <Badge variant={v === 'fat-loss' ? 'teal' : v === 'muscle-gain' ? 'success' : 'neutral'}>
          {v?.replace('-', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'calories',
      label: 'Daily Target',
      render: (v, r) => (
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
          {v} Kcal (P:{r.protein}g C:{r.carbs}g F:{r.fat}g)
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
      <Navbar title="Diet Plans" />
      <div className="page-wrapper animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Diet & Meal Recommendations</h2>
            <p className="page-subtitle">Track calorie targets and macronutrient split logs per member</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} id="assign-diet-btn">
            <Plus size={16} /> Assign Diet
          </button>
        </div>

        {/* Filter search */}
        <div className="filter-bar">
          <div className="search-bar">
            <Search size={16} />
            <input
              placeholder="Search assigned diet plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="diet-search-input"
            />
          </div>
        </div>

        {/* Diet Log */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            data={diets.filter((d) => d.memberName?.toLowerCase().includes(search.toLowerCase()))}
            loading={loading}
          />
        </div>
      </div>

      {/* Program Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Diet Plan' : 'Assign Diet Recommendation'}
        size="lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="diet-form" type="submit" disabled={saving}>
              {saving ? 'Assigning...' : editing ? 'Update Diet' : 'Assign Diet'}
            </button>
          </>
        }
      >
        <form id="diet-form" onSubmit={handleSave}>
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
              <label className="form-label">Diet Program Title *</label>
              <input className="form-input" required value={form.planName} onChange={setField('planName')} placeholder="e.g. Clean Bulking Routine" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Goal</label>
              <select className="form-input" value={form.goal} onChange={setField('goal')}>
                <option value="fat-loss">Fat Loss</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Calories (Kcal) *</label>
              <input className="form-input" type="number" required value={form.calories} onChange={setField('calories')} />
            </div>
          </div>

          {/* Macros */}
          <div className="three-col-grid">
            <div className="form-group">
              <label className="form-label">Protein Target (g) *</label>
              <input className="form-input" type="number" required value={form.protein} onChange={setField('protein')} />
            </div>
            <div className="form-group">
              <label className="form-label">Carbs Target (g) *</label>
              <input className="form-input" type="number" required value={form.carbs} onChange={setField('carbs')} />
            </div>
            <div className="form-group">
              <label className="form-label">Fats Target (g) *</label>
              <input className="form-input" type="number" required value={form.fat} onChange={setField('fat')} />
            </div>
          </div>

          {/* Meals block */}
          <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Meal Logs</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addMeal}>
                <Plus size={14} /> Add Meal
              </button>
            </div>

            {form.meals.map((meal, idx) => (
              <div key={idx} className="flex gap-3 items-start" style={{ marginBottom: 'var(--space-3)' }}>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Meal Name (e.g. Breakfast)"
                  value={meal.title}
                  onChange={(e) => updateMeal(idx, 'title', e.target.value)}
                  required
                />
                <input
                  className="form-input"
                  style={{ flex: 3 }}
                  placeholder="Food Items / Recipes"
                  value={meal.food}
                  onChange={(e) => updateMeal(idx, 'food', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-danger btn-icon"
                  style={{ padding: 10, marginTop: 2 }}
                  onClick={() => removeMeal(idx)}
                  disabled={form.meals.length <= 1}
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

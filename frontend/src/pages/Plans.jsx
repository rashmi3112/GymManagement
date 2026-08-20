// src/pages/Plans.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, CreditCard, ShieldAlert } from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import { plansApi } from '../services/api';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  duration: 1, // in months
  price: 0,
  features: '',
  status: 'active',
  isFeatured: false,
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await plansApi.getAll();
      setPlans(data || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      duration: p.duration || 1,
      price: p.price || 0,
      features: Array.isArray(p.features) ? p.features.join('\n') : p.features || '',
      status: p.status || 'active',
      isFeatured: !!p.isFeatured,
    });
    setShowModal(true);
  };

  const openDelete = (p) => {
    setSelected(p);
    setShowDelete(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Split features by newline
      const featuresArray = form.features
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        ...form,
        price: Number(form.price),
        duration: Number(form.duration),
        features: featuresArray,
      };

      if (editing) {
        await plansApi.update(editing.id, payload);
        toast.success('Membership plan updated!');
      } else {
        await plansApi.create(payload);
        toast.success('New plan created successfully! 🎉');
      }
      setShowModal(false);
      fetchPlans();
    } catch (e) {
      toast.error(e.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await plansApi.delete(selected.id);
      toast.success('Membership plan deleted');
      fetchPlans();
    } catch (e) {
      toast.error(e.message || 'Failed to delete plan');
    }
  };

  return (
    <>
      <Navbar title="Membership Plans" />
      <div className="page-wrapper animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Membership Plans</h2>
            <p className="page-subtitle">Configure subscription tiers for your gym members</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} id="add-plan-btn">
            <Plus size={16} /> Create Plan
          </button>
        </div>

        {loading ? (
          <div className="three-col-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 380, borderRadius: 'var(--radius-2xl)' }} />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
            <div className="empty-state">
              <div className="empty-state-icon">
                <CreditCard size={32} />
              </div>
              <h3>No plans configured</h3>
              <p style={{ marginBottom: 'var(--space-4)' }}>Create your first membership plan to start registering members.</p>
              <button className="btn btn-primary" onClick={openAdd}>
                Create Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="three-col-grid">
            {plans.map((p) => (
              <div key={p.id} className={`plan-card ${p.isFeatured ? 'featured' : ''}`}>
                {p.isFeatured && (
                  <span className="plan-card-badge">
                    <Badge variant="teal">Featured</Badge>
                  </span>
                )}
                <div className="plan-name">{p.name}</div>
                <div className="plan-duration">{p.duration} Month{p.duration > 1 ? 's' : ''} Access</div>
                
                <div className="plan-price">
                  <span className="plan-price-currency">₹</span>
                  <span className="plan-price-amount">{Number(p.price).toLocaleString('en-IN')}</span>
                  <span className="plan-price-period">/ total</span>
                </div>

                <div className="plan-features">
                  {p.features && p.features.map((f, i) => (
                    <div key={i} className="plan-feature">
                      <Check size={14} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-auto" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(p)}>
                    <Edit size={14} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => openDelete(p)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Plan' : 'Create New Plan'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="plan-form" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Plan' : 'Create Plan'}
            </button>
          </>
        }
      >
        <form id="plan-form" onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Plan Name *</label>
            <input className="form-input" required value={form.name} onChange={set('name')} placeholder="e.g. Standard Monthly, Gold Annual" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration (Months) *</label>
              <input className="form-input" type="number" min="1" required value={form.duration} onChange={set('duration')} />
            </div>
            <div className="form-group">
              <label className="form-label">Price (INR) *</label>
              <input className="form-input" type="number" min="0" required value={form.price} onChange={set('price')} placeholder="e.g. 1500" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Plan Features (One per line) *</label>
            <textarea
              className="form-input"
              rows={4}
              required
              value={form.features}
              onChange={set('features')}
              placeholder="e.g.&#10;Full Gym Access&#10;1 Personal Training Session&#10;Free Locker & Shower"
            />
          </div>

          <div className="form-row" style={{ alignItems: 'center', marginTop: 'var(--space-2)' }}>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 0 }}>
              <input
                type="checkbox"
                id="isFeatured"
                checked={form.isFeatured}
                onChange={set('isFeatured')}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="isFeatured" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                Featured Plan
              </label>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Plan"
        message={`Are you sure you want to delete "${selected?.name}"? Existing members on this plan will not be affected, but no new members can select it.`}
        danger
      />
    </>
  );
}

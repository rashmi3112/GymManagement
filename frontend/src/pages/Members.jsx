// src/pages/Members.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Grid, List, Edit, Trash2, Eye, UserPlus, Phone, Mail, Calendar } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const initialForm = {
  name: '', email: '', phone: '', gender: 'male', dob: '',
  address: '', plan: '', status: 'active', joinDate: '',
  membershipExpiry: '', emergencyContact: '', bloodGroup: '', notes: '',
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchPlans();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(query(collection(db, 'members'), orderBy('createdAt', 'desc')));
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { toast.error('Failed to load members'); }
    finally { setLoading(false); }
  };

  const fetchPlans = async () => {
    const snap = await getDocs(collection(db, 'plans'));
    setPlans(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm(initialForm); setPhotoFile(null); setShowModal(true); };
  const openEdit = (m) => { setEditing(m); setForm({ ...initialForm, ...m }); setPhotoFile(null); setShowModal(true); };
  const openDetail = (m) => { setSelected(m); setShowDetail(true); };
  const openDelete = (m) => { setSelected(m); setShowDelete(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let photoURL = form.photoURL || null;

      if (photoFile) {
        const storageRef = ref(storage, `members/${Date.now()}_${photoFile.name}`);
        const snap = await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(snap.ref);
      }

      const payload = { ...form, photoURL, updatedAt: serverTimestamp() };

      if (editing) {
        await updateDoc(doc(db, 'members', editing.id), payload);
        toast.success('Member updated!');
      } else {
        await addDoc(collection(db, 'members'), { ...payload, createdAt: serverTimestamp() });
        toast.success('Member added! 🎉');
      }
      setShowModal(false);
      fetchMembers();
    } catch (e) { toast.error('Failed to save member'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'members', selected.id));
      toast.success('Member deleted');
      fetchMembers();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = members.filter((m) => {
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search);
    const matchFilter = filter === 'all' || m.status === filter;
    return matchSearch && matchFilter;
  });

  const statusBadge = (s) => (
    <Badge variant={s === 'active' ? 'success' : s === 'expired' ? 'danger' : 'warning'} dot>{s || 'active'}</Badge>
  );

  const columns = [
    {
      key: 'name', label: 'Member',
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
    { key: 'plan', label: 'Plan', render: (v) => v ? <Badge variant="primary">{v}</Badge> : '—' },
    { key: 'joinDate', label: 'Join Date', render: (v) => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
    { key: 'membershipExpiry', label: 'Expires', render: (v) => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
    { key: 'status', label: 'Status', render: (v) => statusBadge(v), sortable: false },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openDetail(r)} title="View"><Eye size={15} /></button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(r)} title="Edit"><Edit size={15} /></button>
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(r)} title="Delete"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Navbar title="Members" />
      <div className="page-wrapper animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Members</h2>
            <p className="page-subtitle">{members.length} total members • {members.filter(m => m.status === 'active').length} active</p>
          </div>
          <div className="page-actions">
            <button className="icon-btn" onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')} title="Toggle view">
              {viewMode === 'table' ? <Grid size={18} /> : <List size={18} />}
            </button>
            <button className="btn btn-primary" onClick={openAdd} id="add-member-btn">
              <UserPlus size={16} /> Add Member
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="search-bar">
            <Search size={16} />
            <input placeholder="Search by name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} id="member-search-input" />
          </div>
          <div className="tabs" style={{ width: 'auto' }}>
            {['all', 'active', 'inactive', 'expired'].map((s) => (
              <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)} id={`filter-${s}-btn`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <DataTable columns={columns} data={filtered} loading={loading} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 240, borderRadius: 'var(--radius-xl)' }} />
              ))
            ) : filtered.map((m) => (
              <div key={m.id} className="member-card">
                <div className="member-card-avatar">
                  <Avatar name={m.name} photoURL={m.photoURL} size="lg" />
                  <span className="status-dot" style={{ background: m.status === 'active' ? 'var(--color-success)' : 'var(--color-danger)' }} />
                </div>
                <div className="member-card-name">{m.name}</div>
                <div className="member-card-plan">{m.plan || 'No Plan'}</div>
                <div className="member-card-info">
                  <span><Mail size={10} style={{ display: 'inline', marginRight: 4 }} />{m.email?.split('@')[0]}</span>
                  <span>{m.joinDate ? format(new Date(m.joinDate), 'MMM yy') : '—'}</span>
                </div>
                <div className="member-card-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => openDetail(m)}><Eye size={13} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}><Edit size={13} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => openDelete(m)}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Member Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Member' : 'Add New Member'}
        size="lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="member-form" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Member' : 'Add Member'}
            </button>
          </>
        }
      >
        <form id="member-form" onSubmit={handleSave}>
          {/* Photo Upload */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar name={form.name || 'M'} photoURL={photoFile ? URL.createObjectURL(photoFile) : form.photoURL} size="xl" />
              <label htmlFor="photo-upload" style={{
                position: 'absolute', bottom: 0, right: 0, width: 28, height: 28,
                background: 'var(--color-primary)', borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plus size={14} color="white" />
              </label>
              <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => setPhotoFile(e.target.files[0])} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" required value={form.name} onChange={set('name')} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" required value={form.email} onChange={set('email')} placeholder="john@example.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input" value={form.gender} onChange={set('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" value={form.dob} onChange={set('dob')} />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-input" value={form.bloodGroup} onChange={set('bloodGroup')}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Membership Plan</label>
              <select className="form-input" value={form.plan} onChange={set('plan')}>
                <option value="">No Plan</option>
                {plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Join Date</label>
              <input className="form-input" type="date" value={form.joinDate} onChange={set('joinDate')} />
            </div>
            <div className="form-group">
              <label className="form-label">Membership Expiry</label>
              <input className="form-input" type="date" value={form.membershipExpiry} onChange={set('membershipExpiry')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" value={form.address} onChange={set('address')} placeholder="123 Main St, City" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input className="form-input" value={form.emergencyContact} onChange={set('emergencyContact')} placeholder="+91 98765 00000" />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="form-input" value={form.notes} onChange={set('notes')} placeholder="Any special notes..." />
            </div>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Member Profile" size="lg">
        {selected && (
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <Avatar name={selected.name} photoURL={selected.photoURL} size="xl" style={{ margin: '0 auto var(--space-3)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 12 }}>{selected.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{selected.email}</p>
              <div style={{ marginTop: 8 }}>
                <Badge variant={selected.status === 'active' ? 'success' : 'danger'} dot>{selected.status || 'active'}</Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {[
                ['Phone', selected.phone],
                ['Gender', selected.gender],
                ['DOB', selected.dob],
                ['Blood Group', selected.bloodGroup],
                ['Plan', selected.plan || 'None'],
                ['Join Date', selected.joinDate],
                ['Expiry', selected.membershipExpiry],
                ['Emergency', selected.emergencyContact],
                ['Address', selected.address],
                ['Notes', selected.notes],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Member"
        message={`Are you sure you want to delete ${selected?.name}? This action cannot be undone.`}
        danger
      />
    </>
  );
}

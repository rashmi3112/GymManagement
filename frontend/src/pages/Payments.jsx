// src/pages/Payments.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, Download, Filter, Receipt } from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import { paymentsApi, membersApi, plansApi } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const initialForm = {
  memberId: '',
  planId: '',
  amount: 0,
  paymentMethod: 'cash',
  referenceId: '',
  notes: '',
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchMembers();
    fetchPlans();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentsApi.getAll();
      setPayments(data || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load payments');
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

  const fetchPlans = async () => {
    try {
      const data = await plansApi.getAll();
      setPlans(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleMemberChange = (e) => {
    const mId = e.target.value;
    const member = members.find((m) => m.id === mId);
    const plan = plans.find((p) => p.name === member?.plan);
    setForm((f) => ({
      ...f,
      memberId: mId,
      planId: plan?.id || '',
      amount: plan?.price || 0,
    }));
  };

  const handlePlanChange = (e) => {
    const pId = e.target.value;
    const plan = plans.find((p) => p.id === pId);
    setForm((f) => ({
      ...f,
      planId: pId,
      amount: plan?.price || 0,
    }));
  };

  const openAdd = () => {
    setForm(initialForm);
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
      const plan = plans.find((p) => p.id === form.planId);

      const payload = {
        ...form,
        memberName: member?.name || '',
        memberEmail: member?.email || '',
        planName: plan?.name || 'Custom',
        amount: Number(form.amount),
      };

      await paymentsApi.create(payload);
      toast.success('Payment recorded successfully! 💰');
      setShowModal(false);
      fetchPayments();
    } catch (e) {
      toast.error(e.message || 'Failed to save payment');
    } finally {
      setSaving(false);
    }
  };

  const openInvoice = (p) => {
    setSelectedInvoice(p);
    setShowInvoice(true);
  };

  const filteredPayments = payments.filter((p) => {
    const matchSearch = p.memberName?.toLowerCase().includes(search.toLowerCase()) ||
      p.id?.toLowerCase().includes(search.toLowerCase());
    const matchMethod = filterMethod === 'all' || p.paymentMethod === filterMethod;
    return matchSearch && matchMethod;
  });

  const columns = [
    {
      key: 'id',
      label: 'Receipt ID',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{v?.slice(0, 8).toUpperCase()}</span>,
    },
    {
      key: 'memberName',
      label: 'Member',
      render: (v, r) => (
        <div className="flex items-center gap-3">
          <Avatar name={v} photoURL={r.photoURL} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.memberEmail || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      label: 'Plan',
      render: (v) => <Badge variant="primary">{v}</Badge>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (v) => <span style={{ fontWeight: 700 }}>₹{Number(v).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (v) => <Badge variant="teal">{v.toUpperCase()}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (v) => v ? format(new Date(v), 'dd MMM yyyy hh:mm a') : '—',
    },
    {
      key: 'actions',
      label: 'Invoice',
      sortable: false,
      render: (_, r) => (
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openInvoice(r)} title="View Receipt">
          <Receipt size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <Navbar title="Billing & Payments" />
      <div className="page-wrapper animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Payments & Billing</h2>
            <p className="page-subtitle">Record and trace membership fee receipts</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} id="record-payment-btn">
            <Plus size={16} /> Record Payment
          </button>
        </div>

        {/* Stats strip */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-5)' }}>
          <div className="card flex items-center gap-4" style={{ padding: '20px 24px' }}>
            <div className="stat-card-icon" style={{ background: 'var(--color-success-subtle)', width: 48, height: 48 }}>
              <DollarSign size={24} color="var(--color-success)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Earnings</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                ₹{payments.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <div className="card flex items-center gap-4" style={{ padding: '20px 24px' }}>
            <div className="stat-card-icon" style={{ background: 'var(--color-primary-subtle)', width: 48, height: 48 }}>
              <Receipt size={24} color="var(--color-primary-light)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Invoices</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{payments.length}</div>
            </div>
          </div>
          <div className="card flex items-center gap-4" style={{ padding: '20px 24px' }}>
            <div className="stat-card-icon" style={{ background: 'rgba(255,209,102,0.1)', width: 48, height: 48 }}>
              <Filter size={24} color="var(--color-warning)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Online Payments</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {payments.filter((p) => p.paymentMethod !== 'cash').length}
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="search-bar">
            <Search size={16} />
            <input
              placeholder="Search receipts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="payment-search-input"
            />
          </div>
          <div className="tabs" style={{ width: 'auto' }}>
            {['all', 'cash', 'card', 'upi'].map((m) => (
              <button key={m} className={`tab ${filterMethod === m ? 'active' : ''}`} onClick={() => setFilterMethod(m)} id={`payment-filter-${m}-btn`}>
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable columns={columns} data={filteredPayments} loading={loading} />
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Record Member Payment"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="payment-form" type="submit" disabled={saving}>
              {saving ? 'Recording...' : 'Record Payment'}
            </button>
          </>
        }
      >
        <form id="payment-form" onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Member *</label>
            <select className="form-input" required value={form.memberId} onChange={handleMemberChange}>
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Plan *</label>
              <select className="form-input" required value={form.planId} onChange={handlePlanChange}>
                <option value="">Select Plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (INR) *</label>
              <input className="form-input" type="number" required value={form.amount} onChange={set('amount')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select className="form-input" required value={form.paymentMethod} onChange={set('paymentMethod')}>
                <option value="cash">Cash</option>
                <option value="card">Debit/Credit Card</option>
                <option value="upi">UPI / GPay / PhonePe</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Reference / Txn ID</label>
              <input className="form-input" value={form.referenceId} onChange={set('referenceId')} placeholder="e.g. TXN98765432" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={set('notes')} placeholder="Optional billing notes..." />
          </div>
        </form>
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal isOpen={showInvoice} onClose={() => setShowInvoice(false)} title="Gym Invoice / Receipt" size="md">
        {selectedInvoice && (
          <div className="animate-fade-in" style={{ padding: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>FITCORE GYM</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sector 15, Dwarka, New Delhi</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Receipt</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>#{selectedInvoice.id?.toUpperCase()}</div>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-5)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Billed To</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedInvoice.memberName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedInvoice.memberEmail}</div>
            </div>

            {/* Bill breakdown table */}
            <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', padding: '12px 16px', background: 'var(--color-bg-elevated)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <span>Description</span>
                <span style={{ textAlign: 'right' }}>Amount</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', padding: '16px', fontSize: '0.875rem' }}>
                <span>
                  <div style={{ fontWeight: 600 }}>{selectedInvoice.planName} Plan</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gym membership subscription</div>
                </span>
                <span style={{ textAlign: 'right', fontWeight: 700 }}>₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', padding: '16px', borderTop: '1px solid var(--color-border)', fontSize: '0.95rem', fontWeight: 800 }}>
                <span>Total Amount Paid</span>
                <span style={{ textAlign: 'right', color: 'var(--color-teal)' }}>₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: '0.8rem', marginBottom: 'var(--space-6)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method: </span>
                <span style={{ fontWeight: 600 }}>{selectedInvoice.paymentMethod?.toUpperCase()}</span>
              </div>
              {selectedInvoice.referenceId && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reference: </span>
                  <span style={{ fontFamily: 'monospace' }}>{selectedInvoice.referenceId}</span>
                </div>
              )}
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Date Issued: </span>
                <span style={{ fontWeight: 600 }}>{selectedInvoice.createdAt ? format(new Date(selectedInvoice.createdAt), 'dd MMM yyyy') : '—'}</span>
              </div>
            </div>

            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={() => window.print()}>
              <Download size={16} /> Print / Save PDF
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}

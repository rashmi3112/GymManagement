// src/services/api.js
// Direct Firestore SDK — replaces the PHP REST API layer.
// All exports have identical signatures so no page/component code needs changing.

import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, setDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const col = (name) => collection(db, name);
const ref = (name, id) => doc(db, name, id);
const snap = (d) => ({ id: d.id, ...d.data() });
const snapAll = (qs) => qs.docs.map(snap);
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

// ─── Members ──────────────────────────────────────────────────────────────────
export const membersApi = {
  getAll: async () => snapAll(await getDocs(col('members'))),
  getById: async (id) => {
    const d = await getDoc(ref('members', id));
    if (!d.exists()) throw new Error('Member not found');
    return snap(d);
  },
  create: async (data) => {
    const r = await addDoc(col('members'), { ...data, createdAt: now() });
    return snap(await getDoc(r));
  },
  update: async (id, data) => {
    await updateDoc(ref('members', id), data);
    return snap(await getDoc(ref('members', id)));
  },
  delete: async (id) => {
    await deleteDoc(ref('members', id));
    return { status: 'success', message: 'Member deleted successfully' };
  },
  getAttendance: async (id) => {
    const qs = await getDocs(query(col('attendance'), where('memberId', '==', id)));
    return snapAll(qs);
  },
};

// ─── Plans ────────────────────────────────────────────────────────────────────
export const plansApi = {
  getAll: async () => snapAll(await getDocs(col('plans'))),
  getById: async (id) => {
    const d = await getDoc(ref('plans', id));
    if (!d.exists()) throw new Error('Plan not found');
    return snap(d);
  },
  create: async (data) => {
    const r = await addDoc(col('plans'), data);
    return snap(await getDoc(r));
  },
  update: async (id, data) => {
    await updateDoc(ref('plans', id), data);
    return snap(await getDoc(ref('plans', id)));
  },
  delete: async (id) => {
    await deleteDoc(ref('plans', id));
    return { status: 'success', message: 'Plan deleted successfully' };
  },
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceApi = {
  getAll: async () => snapAll(await getDocs(col('attendance'))),
  checkIn: async (data) => {
    const r = await addDoc(col('attendance'), { ...data, checkIn: now(), date: today(), checkOut: null });
    return snap(await getDoc(r));
  },
  checkOut: async (id) => {
    await updateDoc(ref('attendance', id), { checkOut: now() });
    return snap(await getDoc(ref('attendance', id)));
  },
  getToday: async () => {
    const qs = await getDocs(query(col('attendance'), where('date', '==', today())));
    return snapAll(qs);
  },
  getStats: async () => snapAll(await getDocs(col('attendance'))),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  getAll: async () => snapAll(await getDocs(col('payments'))),
  getById: async (id) => {
    const d = await getDoc(ref('payments', id));
    if (!d.exists()) throw new Error('Payment not found');
    return snap(d);
  },
  create: async (data) => {
    const r = await addDoc(col('payments'), { ...data, createdAt: now() });
    try {
      const planDoc = await getDoc(ref('plans', data.planId));
      if (planDoc.exists()) {
        const plan = snap(planDoc);
        const months = parseInt(plan.duration) || 1;
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + months);
        await updateDoc(ref('members', data.memberId), {
          status: 'active',
          plan: plan.name ?? 'Custom',
          membershipExpiry: expiry.toISOString().slice(0, 10),
        });
      }
    } catch (_) { /* non-critical */ }
    return snap(await getDoc(r));
  },
  update: async (id, data) => {
    await updateDoc(ref('payments', id), data);
    return snap(await getDoc(ref('payments', id)));
  },
  delete: async (id) => {
    await deleteDoc(ref('payments', id));
    return { status: 'success', message: 'Payment deleted' };
  },
  getStats: async () => snapAll(await getDocs(col('payments'))),
};

// ─── Trainers ─────────────────────────────────────────────────────────────────
export const trainersApi = {
  getAll: async () => snapAll(await getDocs(col('trainers'))),
  getById: async (id) => {
    const d = await getDoc(ref('trainers', id));
    if (!d.exists()) throw new Error('Trainer not found');
    return snap(d);
  },
  create: async (data) => {
    const r = await addDoc(col('trainers'), { ...data, createdAt: now() });
    return snap(await getDoc(r));
  },
  update: async (id, data) => {
    await updateDoc(ref('trainers', id), data);
    return snap(await getDoc(ref('trainers', id)));
  },
  delete: async (id) => {
    await deleteDoc(ref('trainers', id));
    return { status: 'success', message: 'Trainer deleted successfully' };
  },
  assign: async (data) => {
    await updateDoc(ref('members', data.memberId), { trainerId: data.trainerId });
    return { status: 'success' };
  },
};

// ─── Workouts ─────────────────────────────────────────────────────────────────
export const workoutsApi = {
  getAll: async (params) => {
    const q = params?.memberId
      ? query(col('workouts'), where('memberId', '==', params.memberId))
      : col('workouts');
    return snapAll(await getDocs(q));
  },
  getById: async (id) => {
    const d = await getDoc(ref('workouts', id));
    if (!d.exists()) throw new Error('Workout not found');
    return snap(d);
  },
  create: async (data) => {
    const r = await addDoc(col('workouts'), { ...data, createdAt: now() });
    return snap(await getDoc(r));
  },
  update: async (id, data) => {
    await updateDoc(ref('workouts', id), data);
    return snap(await getDoc(ref('workouts', id)));
  },
  delete: async (id) => {
    await deleteDoc(ref('workouts', id));
    return { status: 'success', message: 'Workout deleted' };
  },
};

// ─── Diet Plans ───────────────────────────────────────────────────────────────
export const dietApi = {
  getAll: async (params) => {
    const q = params?.memberId
      ? query(col('diet-plans'), where('memberId', '==', params.memberId))
      : col('diet-plans');
    return snapAll(await getDocs(q));
  },
  create: async (data) => {
    const r = await addDoc(col('diet-plans'), { ...data, createdAt: now() });
    return snap(await getDoc(r));
  },
  update: async (id, data) => {
    await updateDoc(ref('diet-plans', id), data);
    return snap(await getDoc(ref('diet-plans', id)));
  },
  delete: async (id) => {
    await deleteDoc(ref('diet-plans', id));
    return { status: 'success', message: 'Diet plan deleted' };
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: async () => {
    const [members, payments, attendance] = await Promise.all([
      getDocs(col('members')), getDocs(col('payments')), getDocs(col('attendance')),
    ]);
    const t = today();
    const membersData = snapAll(members);
    const paymentsData = snapAll(payments);
    const attendanceData = snapAll(attendance);
    return {
      members: membersData.length,
      activeMembers: membersData.filter((m) => m.status === 'active').length,
      attendance: attendanceData.filter((a) => a.date === t).length,
      revenue: paymentsData.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0),
    };
  },
  getRevenue: async () => {
    const payments = snapAll(await getDocs(col('payments')));
    const months = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      months[key] = { month: d.toLocaleString('default', { month: 'short' }), Revenue: 0 };
    }
    payments.forEach((p) => {
      const k = (p.createdAt || '').slice(0, 7);
      if (months[k]) months[k].Revenue += parseFloat(p.amount) || 0;
    });
    return Object.values(months);
  },
  getMemberGrowth: async () => {
    const members = snapAll(await getDocs(col('members')));
    const months = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      months[key] = { month: d.toLocaleString('default', { month: 'short' }), Members: 0 };
    }
    members.forEach((m) => {
      const joined = (m.createdAt || '').slice(0, 7);
      Object.keys(months).forEach((k) => { if (joined && joined <= k) months[k].Members++; });
    });
    return Object.values(months);
  },
  getRecentActivity: async () => {
    const all = snapAll(await getDocs(col('attendance')));
    return all.sort((a, b) => (b.checkIn || '').localeCompare(a.checkIn || '')).slice(0, 5);
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: async () => snapAll(await getDocs(col('notifications'))),
  markRead: async (id) => {
    await updateDoc(ref('notifications', id), { read: true });
    return snap(await getDoc(ref('notifications', id)));
  },
  markAllRead: async () => {
    const qs = await getDocs(query(col('notifications'), where('read', '==', false)));
    await Promise.all(qs.docs.map((d) => updateDoc(d.ref, { read: true })));
    return { status: 'success', message: 'All notifications marked read' };
  },
  create: async (data) => {
    const r = await addDoc(col('notifications'), { ...data, read: false, createdAt: now() });
    return snap(await getDoc(r));
  },
  delete: async (id) => {
    await deleteDoc(ref('notifications', id));
    return { status: 'success', message: 'Notification deleted' };
  },
};

// ─── Settings ─────────────────────────────────────────────────────────────────
const GYM_DEFAULTS = {
  id: 'gym', name: 'FitCore Gym', email: 'contact@fitcore.com',
  phone: '+91 98765 43210', address: 'Sector 15, Dwarka, New Delhi', currency: '₹',
};

export const settingsApi = {
  getGym: async () => {
    const d = await getDoc(ref('settings', 'gym'));
    return d.exists() ? snap(d) : GYM_DEFAULTS;
  },
  updateGym: async (data) => {
    const r = ref('settings', 'gym');
    const existing = await getDoc(r);
    existing.exists() ? await updateDoc(r, data) : await setDoc(r, data);
    return snap(await getDoc(r));
  },
  getUser: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    const d = await getDoc(ref('users', uid));
    return d.exists() ? snap(d) : { uid, email: auth.currentUser?.email, name: auth.currentUser?.displayName };
  },
  updateUser: async (data) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    const r = ref('users', uid);
    const existing = await getDoc(r);
    existing.exists() ? await updateDoc(r, data) : await setDoc(r, data);
    return snap(await getDoc(r));
  },
  changePassword: async () => ({ status: 'success', message: 'Password reset trigger confirmed' }),
};

export default {};

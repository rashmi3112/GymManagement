// src/services/api.js
import axios from 'axios';
import { auth } from './firebase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ─── Members ─────────────────────────────
export const membersApi = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  getAttendance: (id) => api.get(`/members/${id}/attendance`),
};

// ─── Plans ───────────────────────────────
export const plansApi = {
  getAll: () => api.get('/plans'),
  getById: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};

// ─── Attendance ───────────────────────────
export const attendanceApi = {
  getAll: (params) => api.get('/attendance', { params }),
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (id) => api.put(`/attendance/${id}/checkout`),
  getToday: () => api.get('/attendance/today'),
  getStats: (params) => api.get('/attendance/stats', { params }),
};

// ─── Payments ────────────────────────────
export const paymentsApi = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  getStats: () => api.get('/payments/stats'),
};

// ─── Trainers ────────────────────────────
export const trainersApi = {
  getAll: () => api.get('/trainers'),
  getById: (id) => api.get(`/trainers/${id}`),
  create: (data) => api.post('/trainers', data),
  update: (id, data) => api.put(`/trainers/${id}`, data),
  delete: (id) => api.delete(`/trainers/${id}`),
  assign: (data) => api.post('/trainers/assign', data),
};

// ─── Workouts ────────────────────────────
export const workoutsApi = {
  getAll: (params) => api.get('/workouts', { params }),
  getById: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
};

// ─── Diet Plans ──────────────────────────
export const dietApi = {
  getAll: (params) => api.get('/diet-plans', { params }),
  create: (data) => api.post('/diet-plans', data),
  update: (id, data) => api.put(`/diet-plans/${id}`, data),
  delete: (id) => api.delete(`/diet-plans/${id}`),
};

// ─── Dashboard ───────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRevenue: (params) => api.get('/dashboard/revenue', { params }),
  getMemberGrowth: (params) => api.get('/dashboard/member-growth', { params }),
  getRecentActivity: () => api.get('/dashboard/activity'),
};

// ─── Notifications ───────────────────────
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  create: (data) => api.post('/notifications', data),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ─── Settings ────────────────────────────
export const settingsApi = {
  getGym: () => api.get('/settings/gym'),
  updateGym: (data) => api.put('/settings/gym', data),
  getUser: () => api.get('/settings/user'),
  updateUser: (data) => api.put('/settings/user', data),
  changePassword: (data) => api.put('/settings/password', data),
};

export default api;

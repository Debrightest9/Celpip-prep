import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('cp_token');
      localStorage.removeItem('cp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password?: string; targetScore?: number; testDate?: string }) =>
    api.post('/auth/register', data),
  login: (data: { emailOrId: string; password?: string }) =>
    api.post('/auth/login', data),
};

// Users
export const usersApi = {
  me: () => api.get('/users/me'),
  updateMe: (data: { name?: string; targetScore?: number; testDate?: string | null }) =>
    api.patch('/users/me', data),
  dashboard: () => api.get('/users/me/dashboard'),
  generateStudyPlan: () => api.post('/users/me/study-plan'),
  latestStudyPlan: () => api.get('/users/me/study-plan/latest'),
};

// Questions
export const questionsApi = {
  generate: (data: { skill: string; subType?: string; difficulty?: number }) =>
    api.post('/questions/generate', data),
  generateSection: (data: { skill: 'READING' | 'LISTENING'; difficulty?: number; part?: number }) =>
    api.post('/questions/generate-section', data),
  band9: (question: unknown) =>
    api.post('/questions/band9', { question }),
};

// Sessions
export const sessionsApi = {
  create: (data: { type: string; skill?: string }) =>
    api.post('/sessions', data),
  respond: (sessionId: string, data: {
    skill: string; subType: string; question: unknown;
    userAnswer: string; timeTaken?: number;
  }) => api.post(`/sessions/${sessionId}/respond`, data),
  respondAudio: (sessionId: string, audioBlob: Blob, question: unknown, subType: string, timeTaken?: number) => {
    const form = new FormData();
    form.append('audio', audioBlob, 'recording.webm');
    form.append('question', JSON.stringify(question));
    form.append('subType', subType);
    if (timeTaken) form.append('timeTaken', String(timeTaken));
    return api.post(`/sessions/${sessionId}/respond-audio`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  respondSection: (sessionId: string, data: {
    skill: 'READING' | 'LISTENING'; section: unknown;
    answers: Record<string, string>; timeTaken?: number;
  }) => api.post(`/sessions/${sessionId}/respond-section`, data),
  complete: (sessionId: string) => api.post(`/sessions/${sessionId}/complete`),
  get: (sessionId: string) => api.get(`/sessions/${sessionId}`),
  list: (page = 1, limit = 10) => api.get(`/sessions?page=${page}&limit=${limit}`),
};

// Progress
export const progressApi = {
  get: (skill?: string, days?: number) =>
    api.get(`/progress${skill ? `?skill=${skill}` : ''}${days ? `&days=${days}` : ''}`),
  stats: () => api.get('/progress/stats'),
};

// Auth helpers
export function saveAuth(token: string, user: unknown) {
  localStorage.setItem('cp_token', token);
  localStorage.setItem('cp_user', JSON.stringify(user));
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('cp_user');
  return u ? JSON.parse(u) : null;
}

export function clearAuth() {
  localStorage.removeItem('cp_token');
  localStorage.removeItem('cp_user');
}

export function isLoggedIn() {
  return typeof window !== 'undefined' && !!localStorage.getItem('cp_token');
}

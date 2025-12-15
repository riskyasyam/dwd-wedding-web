import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ===============================
// REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ===============================
// RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    /**
     * 🔹 CASE 1
     * /auth/user dipanggil Navbar
     * 401 = USER BELUM LOGIN (NORMAL)
     */
    if (status === 401 && url.includes('/auth/user')) {
      return Promise.reject(error);
    }

    /**
     * 🔹 CASE 2
     * Protected page (admin / customer)
     */
    if (status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      const isProtected =
        path.startsWith('/admin') || path.startsWith('/customer');

      if (isProtected) {
        localStorage.removeItem('token');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('user');

        window.location.href = '/login?expired=true';
      }
    }

    /**
     * 🔹 Log error selain 401
     */
    if (status !== 401) {
      console.error('API Error:', {
        url,
        method: error.config?.method,
        status,
        message: error.response?.data?.message || error.message,
      });
    }

    return Promise.reject(error);
  }
);

export default api;

// ===============================
// Image URL Helper
// ===============================
export const getImageUrl = (
  path: string | null | undefined
): string => {
  if (!path) return '';

  if (path.startsWith('http://localhost:8000') || path.startsWith('https://')) {
    return path;
  }

  if (path.startsWith('http://localhost/')) {
    const base =
      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
      'http://localhost:8000';
    return path.replace('http://localhost', base);
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://localhost:8000';

  return `${base}/${cleanPath}`;
};

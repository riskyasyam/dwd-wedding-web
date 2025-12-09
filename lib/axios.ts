import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isProtectedRoute = currentPath.startsWith('/admin') || currentPath.startsWith('/customer');
      
      if (isProtectedRoute && typeof window !== 'undefined') {
        // Clear token and expiration data
        localStorage.removeItem('token');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('user');
        
        // Show message if token expired
        const errorData = error.response?.data;
        if (errorData?.error === 'token_expired') {
          console.log('Token has expired. Redirecting to login...');
          // You can show a toast notification here if you have a toast library
        }
        
        // Redirect to login
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper function to get full image URL
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // If already full URL with correct port, return as is
  if (path.startsWith('http://localhost:8000') || path.startsWith('https://')) {
    return path;
  }
  
  // Fix incorrect localhost URL (without port)
  if (path.startsWith('http://localhost/')) {
    const correctBaseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return path.replace('http://localhost', correctBaseURL);
  }
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Return full URL with backend base URL
  const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return `${baseURL}/${cleanPath}`;
};

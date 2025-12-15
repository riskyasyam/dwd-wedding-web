import api from './axios';

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  email_verified_at: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_in?: number;
  message?: string;
}

export const authService = {
  // ===============================
  // Register
  // ===============================
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);

      if (response.data.expires_in) {
        const expiresAt = Date.now() + response.data.expires_in * 1000;
        localStorage.setItem('token_expires_at', expiresAt.toString());
      }
    }

    return response.data;
  },

  // ===============================
  // Login
  // ===============================
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);

      if (response.data.expires_in) {
        const expiresAt = Date.now() + response.data.expires_in * 1000;
        localStorage.setItem('token_expires_at', expiresAt.toString());
      }
    }

    return response.data;
  },

  // ===============================
  // Logout
  // ===============================
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore error
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expires_at');
      localStorage.removeItem('user');
    }
  },

  // ===============================
  // Get authenticated user
  // ===============================
  async getUser(): Promise<User> {
    const response = await api.get<User>('/auth/user');
    return response.data;
  },

  // ===============================
  // Check auth (SAFE)
  // ===============================
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('token_expires_at');

    if (!token) return false;

    if (expiresAt && Date.now() > Number(expiresAt)) {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expires_at');
      return false;
    }

    return true;
  },

  // ===============================
  // Clear token (helper)
  // ===============================
  clearToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user');
  },
};

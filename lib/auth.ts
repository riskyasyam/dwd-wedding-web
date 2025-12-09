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
  expires_in?: number; // Token expiration in seconds (e.g., 600 for 10 minutes)
  message?: string;
}

export const authService = {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      // Store token expiration time if provided by backend
      if (response.data.expires_in) {
        const expiresAt = Date.now() + (response.data.expires_in * 1000);
        localStorage.setItem('token_expires_at', expiresAt.toString());
      }
    }
    return response.data;
  },

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      // Store token expiration time if provided by backend
      if (response.data.expires_in) {
        const expiresAt = Date.now() + (response.data.expires_in * 1000);
        localStorage.setItem('token_expires_at', expiresAt.toString());
        console.log(`Token will expire at: ${new Date(expiresAt).toLocaleString()}`);
      }
    }
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user');
  },

  // Get authenticated user
  async getUser(): Promise<User> {
    const response = await api.get<User>('/auth/user');
    return response.data;
  },

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

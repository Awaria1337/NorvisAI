import { create } from 'zustand';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  registerUser: (data: { name: string; email: string; password: string }) => Promise<boolean>;
  loginUser: (data: { email: string; password: string }) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => {
    set({ token });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  login: (user, token) => {
    set({ 
      user, 
      token, 
      isAuthenticated: true,
      isLoading: false 
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
  
  logout: () => {
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      isLoading: false 
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
  
  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            set({ token });
            const response = await authAPI.me();
            if (response.success) {
              set({ 
                user: response.data.user, 
                isAuthenticated: true,
                isLoading: false 
              });
              return;
            }
          } catch (error) {
            console.warn('Token validation failed:', error);
            // Token is invalid, remove it
            localStorage.removeItem('token');
            set({ token: null });
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      // Always set loading to false
      set({ isLoading: false });
    }
  },

  registerUser: async (data) => {
    try {
      set({ isLoading: true });
      const response = await authAPI.register(data);
      
      if (response.success) {
        const { user, token } = response.data;
        get().login(user, token);
        toast.success('Account created successfully!');
        return true;
      } else {
        toast.error(response.error || 'Registration failed');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  loginUser: async (data) => {
    try {
      set({ isLoading: true });
      const response = await authAPI.login(data);
      
      if (response.success) {
        const { user, token } = response.data;
        get().login(user, token);
        toast.success('Successfully logged in!');
        return true;
      } else {
        toast.error(response.error || 'Login failed');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));
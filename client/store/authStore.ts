import { create } from 'zustand';
import { authService, LoginCredentials, RegisterData, GoogleAuthData } from '@/lib/authService';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'homeowner' | 'pro' | 'admin';
  verificationStatus?: 'unverified' | 'pending' | 'basic' | 'comprehensive';
  isEmailVerified: boolean;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  proOnboardingCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  googleAuth: (data: GoogleAuthData) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  // Initialize auth state from localStorage
  initialize: async () => {
    logger.info('Initializing auth state');
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (!accessToken) {
      logger.info('No access token found, user not authenticated');
      set({ isInitialized: true });
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      logger.authEvent('token_refresh', { userId: user._id, role: user.role });
      set({
        user,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch (error) {
      // Token is invalid or expired
      logger.warn('Token validation failed during initialization', { error });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },

  // Login
  login: async (credentials) => {
    logger.userAction('login_attempt', { email: credentials.email });
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login(credentials);
      const { user, accessToken } = response.data;

      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
      }

      logger.authEvent('login', { userId: user._id, email: user.email, role: user.role });
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast.success('Login successful!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || 'Login failed';

      logger.error('Login failed', error, {
        email: credentials.email,
        statusCode: error.response?.status,
      });

      set({
        isLoading: false,
        error: errorMessage,
      });

      toast.error(errorMessage);
      throw error;
    }
  },

  // Register
  register: async (data) => {
    logger.userAction('register_attempt', { email: data.email, role: data.role });
    set({ isLoading: true, error: null });

    try {
      const response = await authService.register(data);
      const { user, accessToken } = response.data;

      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
      }

      logger.authEvent('register', { userId: user._id, email: user.email, role: user.role });
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast.success('Registration successful!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || 'Registration failed';

      logger.error('Registration failed', error, {
        email: data.email,
        role: data.role,
        statusCode: error.response?.status,
        validationErrors: error.response?.data?.details,
      });

      set({
        isLoading: false,
        error: errorMessage,
      });

      toast.error(errorMessage);
      throw error;
    }
  },

  // Google OAuth login/signup
  googleAuth: async (data) => {
    logger.userAction('google_auth_attempt', { role: data.role });
    set({ isLoading: true, error: null });

    try {
      const response = await authService.googleAuth(data);
      const { user, accessToken } = response.data;

      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
      }

      logger.authEvent('login', { userId: user._id, email: user.email, role: user.role, method: 'google' });
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Note: toast.success is handled in GoogleSignInButton component
    } catch (error: any) {
      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || 'Google authentication failed';

      logger.error('Google auth failed', error, {
        role: data.role,
        statusCode: error.response?.status,
      });

      set({
        isLoading: false,
        error: errorMessage,
      });

      // Note: toast.error is handled in GoogleSignInButton component
      throw error;
    }
  },

  // Logout
  logout: async () => {
    logger.userAction('logout_attempt');
    try {
      await authService.logout();
      logger.authEvent('logout', { success: true });
    } catch (error) {
      logger.error('Logout error', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      toast.success('Logged out successfully');
    }
  },

  // Fetch current user
  fetchCurrentUser: async () => {
    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

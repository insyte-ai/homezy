/**
 * Authentication store for Homezy mobile app
 * Adapted from web version with SecureStore for tokens
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authService,
  LoginCredentials,
  RegisterData,
  GoogleAuthData,
  User,
} from '../services/auth';
import { tokenStorage } from '../lib/storage';
import { getErrorMessage, setAuthFailureCallback } from '../services/api';

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
  initialize: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,

      /**
       * Initialize auth state from stored tokens
       */
      initialize: async () => {
        if (__DEV__) console.log('[Auth] Initializing auth state');

        // Register callback for handling auth failures (token refresh failed)
        setAuthFailureCallback(() => {
          if (__DEV__) console.log('[Auth] Token refresh failed, logging out');
          set({
            user: null,
            isAuthenticated: false,
            error: 'Session expired. Please log in again.',
          });
        });

        const hasTokens = await tokenStorage.hasValidTokens();

        if (!hasTokens) {
          if (__DEV__) console.log('[Auth] No tokens found, user not authenticated');
          set({ isInitialized: true });
          return;
        }

        try {
          const user = await authService.getCurrentUser();
          if (__DEV__) console.log('[Auth] Token valid, user authenticated:', user.email);
          set({
            user,
            isAuthenticated: true,
            isInitialized: true,
          });
        } catch (error) {
          // Token is invalid or expired
          if (__DEV__) console.log('[Auth] Token validation failed:', error);
          await tokenStorage.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
          });
        }
      },

      /**
       * Login with email and password
       */
      login: async (credentials) => {
        if (__DEV__) console.log('[Auth] Login attempt:', credentials.email);
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(credentials);

          if (__DEV__) console.log('[Auth] Login successful:', response.user.email);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          if (__DEV__) console.log('[Auth] Login failed:', errorMessage);

          set({
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      /**
       * Register a new user
       */
      register: async (data) => {
        if (__DEV__) console.log('[Auth] Register attempt:', data.email, data.role);
        set({ isLoading: true, error: null });

        try {
          const response = await authService.register(data);

          if (__DEV__) console.log('[Auth] Registration successful:', response.user.email);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          if (__DEV__) console.log('[Auth] Registration failed:', errorMessage);

          set({
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      /**
       * Authenticate with Google
       */
      googleAuth: async (data) => {
        if (__DEV__) console.log('[Auth] Google auth attempt:', data.role);
        set({ isLoading: true, error: null });

        try {
          const response = await authService.googleAuth(data);

          if (__DEV__) console.log('[Auth] Google auth successful:', response.user.email);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          if (__DEV__) console.log('[Auth] Google auth failed:', errorMessage);

          set({
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        if (__DEV__) console.log('[Auth] Logout');
        try {
          await authService.logout();
        } catch (error) {
          if (__DEV__) console.log('[Auth] Logout API error (ignored):', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      /**
       * Fetch current user (refresh user data)
       */
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

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Set user (for external updates)
       */
      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data, not auth state or loading
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;

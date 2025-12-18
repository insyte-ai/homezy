/**
 * Authentication service for Homezy mobile app
 */

import { api, ApiResponse } from './api';
import { tokenStorage } from '../lib/storage';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'homeowner' | 'pro';
}

export interface GoogleAuthData {
  token: string;
  role: 'homeowner' | 'pro';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  role: 'homeowner' | 'pro' | 'admin';
  avatar?: string;
  profilePhoto?: string;
  isVerified: boolean;
  createdAt: string;
  homeownerProfile?: {
    onboardingCompleted?: boolean;
    primaryPropertyId?: string;
    notificationPreferences?: {
      email: boolean;
      push: boolean;
      sms: boolean;
      serviceReminders: boolean;
      seasonalReminders: boolean;
    };
  };
  proProfile?: {
    businessName?: string;
    verificationStatus?: 'unverified' | 'pending' | 'basic' | 'comprehensive' | 'rejected';
    services?: string[];
    serviceAreas?: string[];
    rating?: number;
    reviewCount?: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication API methods
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { user, accessToken, refreshToken } = response.data.data;

    // Store tokens
    await tokenStorage.setTokens(accessToken, refreshToken);

    return response.data.data;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data.data;

    // Store tokens
    await tokenStorage.setTokens(accessToken, refreshToken);

    return response.data.data;
  },

  /**
   * Authenticate with Google
   */
  async googleAuth(data: GoogleAuthData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/google', data);
    const { user, accessToken, refreshToken } = response.data.data;

    // Store tokens
    await tokenStorage.setTokens(accessToken, refreshToken);

    return response.data.data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data.user;
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken,
    });

    const tokens = response.data.data;
    await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);

    return tokens;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout API errors - we'll clear tokens anyway
      console.log('Logout API error (ignored):', error);
    } finally {
      await tokenStorage.clearTokens();
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<ApiResponse<{ user: User }>>('/users/profile', data);
    return response.data.data.user;
  },

  /**
   * Save push notification token
   */
  async savePushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
    await api.post('/users/push-token', { token, platform });
  },
};

export default authService;

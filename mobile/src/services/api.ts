/**
 * API client for Homezy mobile app
 * Configured with axios interceptors for authentication
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, TIMEOUTS } from '../constants/config';
import { tokenStorage } from '../lib/storage';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUTS.API_REQUEST,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing to prevent race conditions
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Callback to notify subscribers when token is refreshed
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Add a subscriber to wait for token refresh
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Callback for handling auth failure (set by auth store)
let onAuthFailure: (() => void) | null = null;

export const setAuthFailureCallback = (callback: () => void) => {
  onAuthFailure = callback;
};

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, wait for the refresh to complete
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const refreshToken = await tokenStorage.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          await tokenStorage.setTokens(accessToken, newRefreshToken);

          isRefreshing = false;
          onRefreshed(accessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        // Refresh failed - clear tokens and notify auth store
        await tokenStorage.clearTokens();

        // Notify auth store to update state and redirect to login
        if (onAuthFailure) {
          onAuthFailure();
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API response type helper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * API error response type
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Helper to extract error message from API errors
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    if (apiError?.message) {
      return apiError.message;
    }
    if (error.message === 'Network Error') {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export default api;

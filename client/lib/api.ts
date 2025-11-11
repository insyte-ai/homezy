import axios from 'axios';
import { logger } from './logger';

// Create axios instance
const baseURL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1'}`
  : 'http://localhost:5001/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData (remove Content-Type to let browser set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors and log API errors
api.interceptors.response.use(
  (response) => {
    // Log successful API calls in development
    logger.debug('API Success', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    // Log API error
    logger.apiError(
      error.config?.url || 'Unknown endpoint',
      error,
      error.config?.data
    );

    // Handle unauthorized errors
    if (error.response?.status === 401) {
      logger.authEvent('token_refresh', { reason: '401 Unauthorized' });

      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Only redirect if not already on auth page
        if (!window.location.pathname.startsWith('/auth')) {
          logger.info('Redirecting to login due to 401');
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

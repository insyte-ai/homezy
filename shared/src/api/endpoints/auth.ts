import { getApiClient } from '../client';
import { API_ROUTES } from '../../constants';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../../types';

export const authAPI = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest) => {
    const client = getApiClient();
    return client.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, data);
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest) => {
    const client = getApiClient();
    return client.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, data);
  },

  /**
   * Logout user
   */
  logout: async () => {
    const client = getApiClient();
    return client.post(API_ROUTES.AUTH.LOGOUT);
  },

  /**
   * Refresh access token
   */
  refresh: async () => {
    const client = getApiClient();
    return client.post<AuthResponse>(API_ROUTES.AUTH.REFRESH);
  },

  /**
   * Get current user
   */
  me: async () => {
    const client = getApiClient();
    return client.get<AuthResponse['user']>(API_ROUTES.AUTH.ME);
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email: string) => {
    const client = getApiClient();
    return client.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password
   */
  resetPassword: async (token: string, newPassword: string) => {
    const client = getApiClient();
    return client.post(API_ROUTES.AUTH.RESET_PASSWORD, { token, newPassword });
  },
};

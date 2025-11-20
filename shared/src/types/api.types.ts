import type { User } from './user.types';

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string; // Only in development
}

/**
 * Pagination helpers
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CursorPaginationMeta {
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
}

/**
 * Auth API types
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'homeowner' | 'professional';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  token: string; // Google ID token
  role?: 'homeowner' | 'pro';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string; // Only if not using httpOnly cookies
}

/**
 * Search and filter types
 */
export interface SearchFilters {
  query?: string;
  category?: string;
  emirate?: string;
  minRating?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

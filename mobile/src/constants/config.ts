/**
 * Environment configuration for Homezy mobile app
 */

// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';
export const API_VERSION = 'v1';
export const API_BASE_URL = `${API_URL}/api/${API_VERSION}`;

// Socket Configuration
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || API_URL;

// Google OAuth
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

// Stripe
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// App Configuration
export const APP_NAME = 'Homezy';
export const APP_SCHEME = 'homezy';

// Feature flags
export const FEATURES = {
  AI_CHAT: true,
  PUSH_NOTIFICATIONS: true,
  GOOGLE_AUTH: true,
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 30000,
  SOCKET_RECONNECT: 5000,
  TOKEN_REFRESH_BUFFER: 60000, // Refresh 1 minute before expiry
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MESSAGES_PAGE_SIZE: 50,
  NOTIFICATIONS_PAGE_SIZE: 20,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  GUEST_ID: 'guestId',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  LEAD_FORM_DRAFT: 'leadFormDraft',
  CHAT_PANEL_OPEN: 'chatPanelOpen',
} as const;

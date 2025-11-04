/**
 * API route constants
 * Shared between client and server for type-safe route references
 */

const API_VERSION = 'v1';
const API_BASE = `/api/${API_VERSION}`;

export const API_ROUTES = {
  // Auth routes
  AUTH: {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH: `${API_BASE}/auth/refresh`,
    ME: `${API_BASE}/auth/me`,
    GOOGLE: `${API_BASE}/auth/google`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  },

  // User routes
  USERS: {
    BASE: `${API_BASE}/users`,
    BY_ID: (id: string) => `${API_BASE}/users/${id}`,
    PROFILE: `${API_BASE}/users/profile`,
    UPDATE_PROFILE: `${API_BASE}/users/profile`,
  },

  // Lead routes
  LEADS: {
    BASE: `${API_BASE}/leads`,
    BY_ID: (id: string) => `${API_BASE}/leads/${id}`,
    CLAIM: (id: string) => `${API_BASE}/leads/${id}/claim`,
    MY_LEADS: `${API_BASE}/leads/me`,
    MARKETPLACE: `${API_BASE}/leads/marketplace`,
  },

  // Quote routes
  QUOTES: {
    BASE: `${API_BASE}/quotes`,
    BY_ID: (id: string) => `${API_BASE}/quotes/${id}`,
    BY_LEAD: (leadId: string) => `${API_BASE}/leads/${leadId}/quotes`,
    ACCEPT: (id: string) => `${API_BASE}/quotes/${id}/accept`,
    DECLINE: (id: string) => `${API_BASE}/quotes/${id}/decline`,
  },

  // Professional routes
  PROFESSIONALS: {
    BASE: `${API_BASE}/professionals`,
    BY_ID: (id: string) => `${API_BASE}/professionals/${id}`,
    SEARCH: `${API_BASE}/professionals/search`,
    VERIFICATION: `${API_BASE}/professionals/verification`,
  },

  // Project routes
  PROJECTS: {
    BASE: `${API_BASE}/projects`,
    BY_ID: (id: string) => `${API_BASE}/projects/${id}`,
    MY_PROJECTS: `${API_BASE}/projects/me`,
    MILESTONES: (id: string) => `${API_BASE}/projects/${id}/milestones`,
  },

  // Message routes
  MESSAGES: {
    BASE: `${API_BASE}/messages`,
    BY_ID: (id: string) => `${API_BASE}/messages/${id}`,
    CONVERSATION: (userId: string) => `${API_BASE}/messages/conversation/${userId}`,
    CONVERSATIONS: `${API_BASE}/messages/conversations`,
  },

  // Review routes
  REVIEWS: {
    BASE: `${API_BASE}/reviews`,
    BY_ID: (id: string) => `${API_BASE}/reviews/${id}`,
    BY_PROFESSIONAL: (professionalId: string) => `${API_BASE}/professionals/${professionalId}/reviews`,
  },

  // Credit routes
  CREDITS: {
    BALANCE: `${API_BASE}/credits/balance`,
    PACKAGES: `${API_BASE}/credits/packages`,
    PURCHASE: `${API_BASE}/credits/purchase`,
    TRANSACTIONS: `${API_BASE}/credits/transactions`,
  },

  // AI Chat routes
  AI: {
    CHAT: `${API_BASE}/ai/chat`,
    STREAM: `${API_BASE}/ai/stream`,
    HISTORY: `${API_BASE}/ai/history`,
  },

  // File upload routes
  UPLOAD: {
    IMAGE: `${API_BASE}/upload/image`,
    DOCUMENT: `${API_BASE}/upload/document`,
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: `${API_BASE}/admin/dashboard`,
    USERS: `${API_BASE}/admin/users`,
    VERIFY_PROFESSIONAL: (id: string) => `${API_BASE}/admin/professionals/${id}/verify`,
    ANALYTICS: `${API_BASE}/admin/analytics`,
  },
} as const;

export default API_ROUTES;

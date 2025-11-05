/**
 * Shared configuration constants for Homezy
 */

// UAE Emirates
export const EMIRATES = [
  { id: 'dubai', name: 'Dubai', nameAr: 'دبي' },
  { id: 'abu-dhabi', name: 'Abu Dhabi', nameAr: 'أبو ظبي' },
  { id: 'sharjah', name: 'Sharjah', nameAr: 'الشارقة' },
  { id: 'ajman', name: 'Ajman', nameAr: 'عجمان' },
  { id: 'umm-al-quwain', name: 'Umm Al Quwain', nameAr: 'أم القيوين' },
  { id: 'ras-al-khaimah', name: 'Ras Al Khaimah', nameAr: 'رأس الخيمة' },
  { id: 'fujairah', name: 'Fujairah', nameAr: 'الفجيرة' },
] as const;

export type EmirateId = typeof EMIRATES[number]['id'];

// Budget brackets for leads (in AED)
export const BUDGET_BRACKETS = [
  { id: '500-1k', min: 500, max: 1000, label: 'AED 500 - 1,000', credits: 5 },
  { id: '1k-5k', min: 1000, max: 5000, label: 'AED 1,000 - 5,000', credits: 10 },
  { id: '5k-15k', min: 5000, max: 15000, label: 'AED 5,000 - 15,000', credits: 20 },
  { id: '15k-50k', min: 15000, max: 50000, label: 'AED 15,000 - 50,000', credits: 40 },
  { id: '50k-150k', min: 50000, max: 150000, label: 'AED 50,000 - 150,000', credits: 75 },
  { id: '150k+', min: 150000, max: null, label: 'AED 150,000+', credits: 125 },
] as const;

export type BudgetBracketId = typeof BUDGET_BRACKETS[number]['id'];

// Lead urgency levels
export const URGENCY_LEVELS = [
  { id: 'emergency', label: 'Emergency (<24h)', multiplier: 1.5 },
  { id: 'urgent', label: 'Urgent (<1 week)', multiplier: 1.0 },
  { id: 'flexible', label: 'Flexible (1-4 weeks)', multiplier: 1.0 },
  { id: 'planning', label: 'Planning (>1 month)', multiplier: 1.0 },
] as const;

export type UrgencyLevel = typeof URGENCY_LEVELS[number]['id'];

// User roles
export const USER_ROLES = {
  GUEST: 'guest',
  HOMEOWNER: 'homeowner',
  PRO: 'pro',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Pro verification status (separate from role)
export const PRO_VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  BASIC: 'basic',
  COMPREHENSIVE: 'comprehensive',
  REJECTED: 'rejected',
} as const;

export type ProVerificationStatus = typeof PRO_VERIFICATION_STATUS[keyof typeof PRO_VERIFICATION_STATUS];

// Lead status
export const LEAD_STATUS = {
  OPEN: 'open',
  FULL: 'full',
  QUOTED: 'quoted',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export type LeadStatus = typeof LEAD_STATUS[keyof typeof LEAD_STATUS];

// Project status
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

// Quote status
export const QUOTE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
} as const;

export type QuoteStatus = typeof QUOTE_STATUS[keyof typeof QUOTE_STATUS];

// Credit packages
export const CREDIT_PACKAGES = [
  { id: 'starter', credits: 50, price: 250, bonus: 0, label: 'Starter' },
  { id: 'professional', credits: 150, price: 600, bonus: 10, label: 'Professional' },
  { id: 'business', credits: 400, price: 1400, bonus: 40, label: 'Business' },
  { id: 'enterprise', credits: 1000, price: 3000, bonus: 150, label: 'Enterprise' },
] as const;

// Platform constants
export const PLATFORM_CONFIG = {
  VAT_RATE: 0.05, // 5% VAT for UAE
  MAX_LEAD_CLAIMS: 5,
  LEAD_EXPIRY_DAYS: 7,
  COMPREHENSIVE_DISCOUNT: 0.15, // 15% credit discount
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PROJECT_FILES: 10,
} as const;

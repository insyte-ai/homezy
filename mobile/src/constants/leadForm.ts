/**
 * Lead Form Constants
 * UAE-specific constants for the lead creation form
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
  { id: 'under-3k', min: 0, max: 3000, label: 'Under AED 3,000', credits: 3 },
  { id: '3k-5k', min: 3000, max: 5000, label: 'AED 3,000 - 5,000', credits: 4 },
  { id: '5k-20k', min: 5000, max: 20000, label: 'AED 5,000 - 20,000', credits: 6 },
  { id: '20k-50k', min: 20000, max: 50000, label: 'AED 20,000 - 50,000', credits: 8 },
  { id: '50k-100k', min: 50000, max: 100000, label: 'AED 50,000 - 100,000', credits: 12 },
  { id: '100k-250k', min: 100000, max: 250000, label: 'AED 100,000 - 250,000', credits: 16 },
  { id: 'over-250k', min: 250000, max: null, label: 'Over AED 250,000', credits: 20 },
] as const;

export type BudgetBracketId = typeof BUDGET_BRACKETS[number]['id'];

// Lead urgency levels
export const URGENCY_LEVELS = [
  { id: 'emergency', label: 'Emergency', description: 'Within 24 hours', icon: 'flash', color: '#ef4444' },
  { id: 'urgent', label: 'Urgent', description: 'Within 1 week', icon: 'time', color: '#f59e0b' },
  { id: 'flexible', label: 'Flexible', description: '1-4 weeks', icon: 'calendar', color: '#3b82f6' },
  { id: 'planning', label: 'Planning', description: 'More than 1 month', icon: 'calendar-outline', color: '#6b7280' },
] as const;

export type UrgencyLevel = typeof URGENCY_LEVELS[number]['id'];

// Lead form steps
export const LEAD_FORM_STEPS = [
  { id: 0, title: 'Select Service', description: 'Choose the service you need' },
  { id: 1, title: 'Project Details', description: 'Tell us about your project' },
  { id: 2, title: 'Add Photos', description: 'Optional: Add photos of your project' },
  { id: 3, title: 'Review & Submit', description: 'Review your request' },
] as const;

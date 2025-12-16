/**
 * Home Management Constants
 * Service categories, default frequencies, and seasonal maintenance schedules
 */

import type { HomeServiceCategory, ReminderFrequency } from '../types/home.types';

// ============================================================================
// Service Category Configuration
// ============================================================================

export interface ServiceCategoryConfig {
  id: HomeServiceCategory;
  label: string;
  labelAr: string;
  icon: string; // Lucide icon name
  defaultFrequency: ReminderFrequency;
  defaultIntervalDays: number;
  description: string;
}

export const SERVICE_CATEGORY_CONFIG: ServiceCategoryConfig[] = [
  {
    id: 'hvac',
    label: 'HVAC / Air Conditioning',
    labelAr: 'التكييف',
    icon: 'Thermometer',
    defaultFrequency: 'biannual',
    defaultIntervalDays: 180,
    description: 'AC maintenance, duct cleaning, filter replacement',
  },
  {
    id: 'plumbing',
    label: 'Plumbing',
    labelAr: 'السباكة',
    icon: 'Droplet',
    defaultFrequency: 'annual',
    defaultIntervalDays: 365,
    description: 'Pipe maintenance, water heater service, leak repairs',
  },
  {
    id: 'electrical',
    label: 'Electrical',
    labelAr: 'الكهرباء',
    icon: 'Zap',
    defaultFrequency: 'annual',
    defaultIntervalDays: 365,
    description: 'Wiring inspection, panel maintenance, lighting',
  },
  {
    id: 'painting',
    label: 'Painting',
    labelAr: 'الدهان',
    icon: 'Paintbrush',
    defaultFrequency: 'annual',
    defaultIntervalDays: 365,
    description: 'Interior and exterior painting',
  },
  {
    id: 'flooring',
    label: 'Flooring',
    labelAr: 'الأرضيات',
    icon: 'Square',
    defaultFrequency: 'annual',
    defaultIntervalDays: 365,
    description: 'Floor maintenance, polishing, repairs',
  },
  {
    id: 'carpentry',
    label: 'Carpentry',
    labelAr: 'النجارة',
    icon: 'Hammer',
    defaultFrequency: 'annual',
    defaultIntervalDays: 365,
    description: 'Door repairs, cabinet work, woodwork',
  },
  {
    id: 'roofing',
    label: 'Roofing',
    labelAr: 'الأسقف',
    icon: 'Home',
    defaultFrequency: 'annual',
    defaultIntervalDays: 365,
    description: 'Roof inspection and repairs',
  },
  {
    id: 'landscaping',
    label: 'Landscaping',
    labelAr: 'تنسيق الحدائق',
    icon: 'Trees',
    defaultFrequency: 'monthly',
    defaultIntervalDays: 30,
    description: 'Garden maintenance, irrigation, plant care',
  },
  {
    id: 'pool',
    label: 'Pool Maintenance',
    labelAr: 'صيانة المسبح',
    icon: 'Waves',
    defaultFrequency: 'monthly',
    defaultIntervalDays: 30,
    description: 'Pool cleaning, chemical balance, equipment check',
  },
  {
    id: 'pest-control',
    label: 'Pest Control',
    labelAr: 'مكافحة الآفات',
    icon: 'Bug',
    defaultFrequency: 'quarterly',
    defaultIntervalDays: 90,
    description: 'Pest inspection and treatment',
  },
  {
    id: 'cleaning',
    label: 'Deep Cleaning',
    labelAr: 'التنظيف العميق',
    icon: 'Sparkles',
    defaultFrequency: 'quarterly',
    defaultIntervalDays: 90,
    description: 'Deep cleaning services',
  },
  {
    id: 'security',
    label: 'Security Systems',
    labelAr: 'أنظمة الأمان',
    icon: 'Shield',
    defaultFrequency: 'annual',
    defaultIntervalDays: 365,
    description: 'Alarm systems, CCTV, access control',
  },
  {
    id: 'appliance-repair',
    label: 'Appliance Repair',
    labelAr: 'إصلاح الأجهزة',
    icon: 'Wrench',
    defaultFrequency: 'annual',
    defaultIntervalDays: 365,
    description: 'Major appliance repairs and service',
  },
  {
    id: 'general-maintenance',
    label: 'General Maintenance',
    labelAr: 'الصيانة العامة',
    icon: 'Settings',
    defaultFrequency: 'quarterly',
    defaultIntervalDays: 90,
    description: 'General handyman services',
  },
  {
    id: 'renovation',
    label: 'Renovation',
    labelAr: 'التجديد',
    icon: 'HardHat',
    defaultFrequency: 'custom',
    defaultIntervalDays: 0,
    description: 'Major renovation projects',
  },
  {
    id: 'other',
    label: 'Other',
    labelAr: 'أخرى',
    icon: 'MoreHorizontal',
    defaultFrequency: 'custom',
    defaultIntervalDays: 0,
    description: 'Other home services',
  },
];

// ============================================================================
// Seasonal Maintenance (UAE-specific)
// ============================================================================

export interface SeasonalReminder {
  month: number; // 1-12
  category: HomeServiceCategory;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export const SEASONAL_MAINTENANCE: SeasonalReminder[] = [
  // Pre-summer AC preparation (April)
  {
    month: 4,
    category: 'hvac',
    title: 'Pre-Summer AC Check',
    description: 'Get your AC serviced before the summer heat. Clean filters, check refrigerant levels, and ensure optimal cooling.',
    priority: 'high',
  },
  // Post-summer AC service (October)
  {
    month: 10,
    category: 'hvac',
    title: 'Post-Summer AC Service',
    description: 'Service your AC after heavy summer usage. Clean coils, check for wear, and prepare for moderate weather.',
    priority: 'medium',
  },
  // Pre-summer pest control (May)
  {
    month: 5,
    category: 'pest-control',
    title: 'Summer Pest Prevention',
    description: 'Schedule pest control before summer when insects are most active.',
    priority: 'medium',
  },
  // Water tank cleaning (January)
  {
    month: 1,
    category: 'plumbing',
    title: 'Annual Water Tank Cleaning',
    description: 'Clean and sanitize water storage tanks for the new year.',
    priority: 'high',
  },
  // Pool preparation (March)
  {
    month: 3,
    category: 'pool',
    title: 'Pool Season Preparation',
    description: 'Prepare your pool for the swimming season. Deep clean, check equipment, and balance chemicals.',
    priority: 'medium',
  },
  // Garden preparation for cooler months (October)
  {
    month: 10,
    category: 'landscaping',
    title: 'Garden Season Preparation',
    description: 'Prepare your garden for the cooler planting season. Perfect time for new plants and lawn care.',
    priority: 'low',
  },
  // Security system check (December)
  {
    month: 12,
    category: 'security',
    title: 'Annual Security System Check',
    description: 'Test all security systems before year-end holidays.',
    priority: 'medium',
  },
  // Deep cleaning (June - before Eid season)
  {
    month: 6,
    category: 'cleaning',
    title: 'Pre-Eid Deep Cleaning',
    description: 'Schedule a thorough deep cleaning of your home before Eid celebrations.',
    priority: 'medium',
  },
];

// ============================================================================
// Reminder Lead Days Configuration
// ============================================================================

export const DEFAULT_REMINDER_LEAD_DAYS = [30, 7, 1]; // Days before due date to send reminders

export const REMINDER_LEAD_OPTIONS = [
  { days: 1, label: '1 day before' },
  { days: 3, label: '3 days before' },
  { days: 7, label: '1 week before' },
  { days: 14, label: '2 weeks before' },
  { days: 30, label: '1 month before' },
];

// ============================================================================
// Helper Functions
// ============================================================================

export const getServiceCategoryConfig = (id: HomeServiceCategory): ServiceCategoryConfig | undefined => {
  return SERVICE_CATEGORY_CONFIG.find(config => config.id === id);
};

export const getSeasonalRemindersForMonth = (month: number): SeasonalReminder[] => {
  return SEASONAL_MAINTENANCE.filter(reminder => reminder.month === month);
};

export const getDefaultIntervalDays = (category: HomeServiceCategory): number => {
  const config = getServiceCategoryConfig(category);
  return config?.defaultIntervalDays || 365;
};

// ============================================================================
// Default Service Frequencies by Category
// ============================================================================

export const DEFAULT_SERVICE_FREQUENCIES: Partial<Record<HomeServiceCategory, ReminderFrequency>> = {
  hvac: 'biannual',
  plumbing: 'annual',
  electrical: 'annual',
  landscaping: 'monthly',
  pool: 'monthly',
  'pest-control': 'quarterly',
  cleaning: 'quarterly',
  'general-maintenance': 'quarterly',
};

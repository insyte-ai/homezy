/**
 * Service Reminders API Service
 * Handles all service reminder-related API calls
 */

import { api } from './api';

// ============================================================================
// Types
// ============================================================================

export type HomeServiceCategory = 'hvac' | 'plumbing' | 'electrical' | 'painting' | 'flooring' | 'carpentry' | 'roofing' | 'landscaping' | 'pool' | 'pest-control' | 'cleaning' | 'security' | 'appliance-repair' | 'general-maintenance' | 'renovation' | 'other';
export type ReminderTriggerType = 'pattern-based' | 'seasonal' | 'custom';
export type ReminderFrequency = 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'custom';
export type ReminderStatus = 'active' | 'snoozed' | 'paused' | 'converted-to-quote';

export interface ReminderNotification {
  sentAt: string;
  channel: 'email' | 'push' | 'sms';
  daysBeforeDue: number;
}

export interface ServiceReminder {
  id: string;
  homeownerId: string;
  propertyId?: string;
  category: HomeServiceCategory;
  title: string;
  description?: string;
  triggerType: ReminderTriggerType;
  frequency: ReminderFrequency;
  customIntervalDays?: number;
  lastServiceDate?: string;
  nextDueDate: string;
  remindersSent: ReminderNotification[];
  reminderLeadDays: number[];
  status: ReminderStatus;
  snoozeUntil?: string;
  leadId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Input Types
// ============================================================================

export interface CreateServiceReminderInput {
  propertyId?: string;
  category: HomeServiceCategory;
  title: string;
  description?: string;
  triggerType?: ReminderTriggerType;
  frequency: ReminderFrequency;
  customIntervalDays?: number;
  lastServiceDate?: string;
  nextDueDate?: string;
  reminderLeadDays?: number[];
}

export interface UpdateServiceReminderInput {
  category?: HomeServiceCategory;
  title?: string;
  description?: string;
  frequency?: ReminderFrequency;
  customIntervalDays?: number;
  nextDueDate?: string;
  reminderLeadDays?: number[];
}

export interface ReminderListParams {
  propertyId?: string;
  category?: HomeServiceCategory;
  status?: ReminderStatus;
  limit?: number;
  offset?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

interface ReminderResponse {
  success: boolean;
  data: {
    reminder: ServiceReminder;
  };
}

interface ReminderListResponse {
  success: boolean;
  data: {
    reminders: ServiceReminder[];
    total: number;
    limit: number;
    offset: number;
  };
}

interface UpcomingRemindersResponse {
  success: boolean;
  data: {
    reminders: ServiceReminder[];
  };
}

interface SyncResponse {
  success: boolean;
  data: {
    created: number;
    updated: number;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new service reminder
 */
export async function createServiceReminder(
  input: CreateServiceReminderInput
): Promise<ServiceReminder> {
  const response = await api.post<ReminderResponse>('/service-reminders', input);
  return response.data.data.reminder;
}

/**
 * Get all reminders for the authenticated user
 */
export async function getMyReminders(
  params?: ReminderListParams
): Promise<{ reminders: ServiceReminder[]; total: number }> {
  const response = await api.get<ReminderListResponse>('/service-reminders', { params });
  return {
    reminders: response.data.data.reminders,
    total: response.data.data.total,
  };
}

/**
 * Get a reminder by ID
 */
export async function getReminderById(id: string): Promise<ServiceReminder> {
  const response = await api.get<ReminderResponse>(`/service-reminders/${id}`);
  return response.data.data.reminder;
}

/**
 * Get upcoming reminders
 */
export async function getUpcomingReminders(
  params?: { propertyId?: string; daysAhead?: number; limit?: number }
): Promise<ServiceReminder[]> {
  const response = await api.get<UpcomingRemindersResponse>('/service-reminders/upcoming', { params });
  return response.data.data.reminders;
}

/**
 * Get overdue reminders
 */
export async function getOverdueReminders(): Promise<ServiceReminder[]> {
  const response = await api.get<UpcomingRemindersResponse>('/service-reminders/overdue');
  return response.data.data.reminders;
}

/**
 * Update a reminder
 */
export async function updateReminder(
  id: string,
  input: UpdateServiceReminderInput
): Promise<ServiceReminder> {
  const response = await api.patch<ReminderResponse>(`/service-reminders/${id}`, input);
  return response.data.data.reminder;
}

/**
 * Snooze a reminder
 */
export async function snoozeReminder(
  id: string,
  snoozeDays: number
): Promise<ServiceReminder> {
  const response = await api.post<ReminderResponse>(`/service-reminders/${id}/snooze`, { snoozeDays });
  return response.data.data.reminder;
}

/**
 * Pause a reminder
 */
export async function pauseReminder(id: string): Promise<ServiceReminder> {
  const response = await api.post<ReminderResponse>(`/service-reminders/${id}/pause`);
  return response.data.data.reminder;
}

/**
 * Resume a paused reminder
 */
export async function resumeReminder(id: string): Promise<ServiceReminder> {
  const response = await api.post<ReminderResponse>(`/service-reminders/${id}/resume`);
  return response.data.data.reminder;
}

/**
 * Mark reminder as completed (service done)
 */
export async function completeReminder(
  id: string,
  serviceDate?: string
): Promise<ServiceReminder> {
  const response = await api.post<ReminderResponse>(`/service-reminders/${id}/complete`, { serviceDate });
  return response.data.data.reminder;
}

/**
 * Convert reminder to quote request
 */
export async function convertToQuote(
  id: string,
  leadId: string
): Promise<ServiceReminder> {
  const response = await api.post<ReminderResponse>(`/service-reminders/${id}/request-quote`, { leadId });
  return response.data.data.reminder;
}

/**
 * Delete a reminder
 */
export async function deleteReminder(id: string): Promise<void> {
  await api.delete(`/service-reminders/${id}`);
}

/**
 * Sync reminders from service history patterns
 */
export async function syncRemindersFromHistory(): Promise<{ created: number; updated: number }> {
  const response = await api.post<SyncResponse>('/service-reminders/sync');
  return response.data.data;
}

// ============================================================================
// Helper Configuration
// ============================================================================

export const frequencyConfig: Record<ReminderFrequency, { label: string; days: number }> = {
  monthly: { label: 'Monthly', days: 30 },
  quarterly: { label: 'Quarterly', days: 90 },
  biannual: { label: 'Every 6 Months', days: 180 },
  annual: { label: 'Yearly', days: 365 },
  custom: { label: 'Custom', days: 0 },
};

export const statusConfig: Record<ReminderStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Active', color: '#10B981', bgColor: '#ECFDF5' },
  snoozed: { label: 'Snoozed', color: '#F59E0B', bgColor: '#FFFBEB' },
  paused: { label: 'Paused', color: '#6B7280', bgColor: '#F3F4F6' },
  'converted-to-quote': { label: 'Quote Requested', color: '#3B82F6', bgColor: '#EFF6FF' },
};

export const triggerTypeConfig: Record<ReminderTriggerType, { label: string; description: string }> = {
  'pattern-based': { label: 'Pattern-based', description: 'Based on your service history' },
  seasonal: { label: 'Seasonal', description: 'UAE seasonal maintenance' },
  custom: { label: 'Custom', description: 'Manually created reminder' },
};

export const serviceCategoryConfig: Record<HomeServiceCategory, { label: string; icon: string; color: string; bgColor: string }> = {
  hvac: { label: 'HVAC', icon: 'thermometer', color: '#3B82F6', bgColor: '#EFF6FF' },
  plumbing: { label: 'Plumbing', icon: 'water', color: '#06B6D4', bgColor: '#ECFEFF' },
  electrical: { label: 'Electrical', icon: 'flash', color: '#F59E0B', bgColor: '#FFFBEB' },
  painting: { label: 'Painting', icon: 'color-palette', color: '#8B5CF6', bgColor: '#F5F3FF' },
  flooring: { label: 'Flooring', icon: 'grid', color: '#D97706', bgColor: '#FFFBEB' },
  carpentry: { label: 'Carpentry', icon: 'hammer', color: '#EA580C', bgColor: '#FFF7ED' },
  roofing: { label: 'Roofing', icon: 'home', color: '#475569', bgColor: '#F1F5F9' },
  landscaping: { label: 'Landscaping', icon: 'leaf', color: '#16A34A', bgColor: '#DCFCE7' },
  pool: { label: 'Pool', icon: 'water-outline', color: '#0EA5E9', bgColor: '#E0F2FE' },
  'pest-control': { label: 'Pest Control', icon: 'bug', color: '#DC2626', bgColor: '#FEF2F2' },
  cleaning: { label: 'Cleaning', icon: 'sparkles', color: '#14B8A6', bgColor: '#CCFBF1' },
  security: { label: 'Security', icon: 'shield-checkmark', color: '#6366F1', bgColor: '#EEF2FF' },
  'appliance-repair': { label: 'Appliance Repair', icon: 'construct', color: '#6B7280', bgColor: '#F3F4F6' },
  'general-maintenance': { label: 'General Maintenance', icon: 'settings', color: '#71717A', bgColor: '#F4F4F5' },
  renovation: { label: 'Renovation', icon: 'build', color: '#E11D48', bgColor: '#FFF1F2' },
  other: { label: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280', bgColor: '#F3F4F6' },
};

// Snooze options for quick actions
export const snoozeOptions = [
  { label: '1 Day', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '1 Month', days: 30 },
];

import { api } from '../api';
import type {
  ServiceReminder,
  HomeServiceCategory,
  ReminderTriggerType,
  ReminderFrequency,
  ReminderStatus,
  CreateServiceReminderInput,
  UpdateServiceReminderInput,
} from '@homezy/shared';

// Re-export types
export type {
  ServiceReminder,
  HomeServiceCategory,
  ReminderTriggerType,
  ReminderFrequency,
  ReminderStatus,
  CreateServiceReminderInput,
  UpdateServiceReminderInput,
};

// ============================================================================
// Query Types
// ============================================================================

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
  const response = await api.post<ReminderResponse>(
    '/service-reminders',
    input
  );
  return response.data.data.reminder;
}

/**
 * Get all reminders for the authenticated user
 */
export async function getMyReminders(
  params?: ReminderListParams
): Promise<{ reminders: ServiceReminder[]; total: number }> {
  const response = await api.get<ReminderListResponse>(
    '/service-reminders',
    { params }
  );
  return {
    reminders: response.data.data.reminders,
    total: response.data.data.total,
  };
}

/**
 * Get a reminder by ID
 */
export async function getReminderById(id: string): Promise<ServiceReminder> {
  const response = await api.get<ReminderResponse>(
    `/service-reminders/${id}`
  );
  return response.data.data.reminder;
}

/**
 * Get upcoming reminders
 */
export async function getUpcomingReminders(
  params?: { propertyId?: string; daysAhead?: number; limit?: number }
): Promise<ServiceReminder[]> {
  const response = await api.get<UpcomingRemindersResponse>(
    '/service-reminders/upcoming',
    { params }
  );
  return response.data.data.reminders;
}

/**
 * Get overdue reminders
 */
export async function getOverdueReminders(): Promise<ServiceReminder[]> {
  const response = await api.get<UpcomingRemindersResponse>(
    '/service-reminders/overdue'
  );
  return response.data.data.reminders;
}

/**
 * Update a reminder
 */
export async function updateReminder(
  id: string,
  input: UpdateServiceReminderInput
): Promise<ServiceReminder> {
  const response = await api.patch<ReminderResponse>(
    `/service-reminders/${id}`,
    input
  );
  return response.data.data.reminder;
}

/**
 * Snooze a reminder
 */
export async function snoozeReminder(
  id: string,
  snoozeDays: number
): Promise<ServiceReminder> {
  const response = await api.post<ReminderResponse>(
    `/service-reminders/${id}/snooze`,
    { snoozeDays }
  );
  return response.data.data.reminder;
}

/**
 * Pause a reminder
 */
export async function pauseReminder(id: string): Promise<ServiceReminder> {
  const response = await api.post<ReminderResponse>(
    `/service-reminders/${id}/pause`
  );
  return response.data.data.reminder;
}

/**
 * Resume a paused reminder
 */
export async function resumeReminder(id: string): Promise<ServiceReminder> {
  const response = await api.post<ReminderResponse>(
    `/service-reminders/${id}/resume`
  );
  return response.data.data.reminder;
}

/**
 * Mark reminder as completed (service done)
 */
export async function completeReminder(
  id: string,
  serviceDate?: Date
): Promise<ServiceReminder> {
  const response = await api.post<ReminderResponse>(
    `/service-reminders/${id}/complete`,
    { serviceDate }
  );
  return response.data.data.reminder;
}

/**
 * Convert reminder to quote request
 */
export async function convertToQuote(
  id: string,
  leadId: string
): Promise<ServiceReminder> {
  const response = await api.post<ReminderResponse>(
    `/service-reminders/${id}/request-quote`,
    { leadId }
  );
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
  const response = await api.post<SyncResponse>(
    '/service-reminders/sync'
  );
  return response.data.data;
}

// ============================================================================
// Helper Configuration
// ============================================================================

export const frequencyConfig: Record<
  ReminderFrequency,
  { label: string; days: number }
> = {
  monthly: { label: 'Monthly', days: 30 },
  quarterly: { label: 'Quarterly', days: 90 },
  biannual: { label: 'Every 6 Months', days: 180 },
  annual: { label: 'Yearly', days: 365 },
  custom: { label: 'Custom', days: 0 },
};

export const statusConfig: Record<
  ReminderStatus,
  { label: string; color: string; bgColor: string }
> = {
  active: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
  snoozed: { label: 'Snoozed', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  paused: { label: 'Paused', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'converted-to-quote': { label: 'Quote Requested', color: 'text-blue-700', bgColor: 'bg-blue-100' },
};

export const triggerTypeConfig: Record<
  ReminderTriggerType,
  { label: string; description: string }
> = {
  'pattern-based': { label: 'Pattern-based', description: 'Based on your service history' },
  seasonal: { label: 'Seasonal', description: 'UAE seasonal maintenance' },
  custom: { label: 'Custom', description: 'Manually created reminder' },
};

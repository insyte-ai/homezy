/**
 * Home Management Types
 * Types for Property, ServiceHistory, ServiceReminder, and Expense
 */

import type { EmirateId } from '../constants';

// ============================================================================
// Property Types
// ============================================================================

export const OWNERSHIP_TYPES = ['owned', 'rental'] as const;
export type OwnershipType = typeof OWNERSHIP_TYPES[number];

export const PROPERTY_TYPES = ['villa', 'townhouse', 'apartment', 'penthouse'] as const;
export type PropertyType = typeof PROPERTY_TYPES[number];

export const ROOM_TYPES = [
  'bedroom',
  'bathroom',
  'kitchen',
  'living',
  'dining',
  'office',
  'storage',
  'outdoor',
  'garage',
  'laundry',
  'other',
] as const;
export type RoomType = typeof ROOM_TYPES[number];

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  floor?: number;
  notes?: string;
}

export interface Property {
  id: string;
  homeownerId: string;
  name: string;
  country: 'UAE';
  emirate: EmirateId;
  neighborhood?: string;
  fullAddress?: string;

  ownershipType: OwnershipType;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqFt?: number;
  yearBuilt?: number;

  rooms: Room[];

  isPrimary: boolean;
  profileCompleteness: number; // 0-100

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Service History Types
// ============================================================================

export const HOME_SERVICE_CATEGORIES = [
  'hvac',
  'plumbing',
  'electrical',
  'painting',
  'flooring',
  'carpentry',
  'roofing',
  'landscaping',
  'pool',
  'pest-control',
  'cleaning',
  'security',
  'appliance-repair',
  'general-maintenance',
  'renovation',
  'other',
] as const;
export type HomeServiceCategory = typeof HOME_SERVICE_CATEGORIES[number];

export const HOME_SERVICE_TYPES = [
  'maintenance',
  'repair',
  'installation',
  'renovation',
  'inspection',
] as const;
export type HomeServiceType = typeof HOME_SERVICE_TYPES[number];

export const PROVIDER_TYPES = ['homezy', 'external'] as const;
export type ProviderType = typeof PROVIDER_TYPES[number];

export interface ServiceDocument {
  id: string;
  type: 'invoice' | 'receipt' | 'report' | 'warranty' | 'other';
  url: string;
  filename: string;
  uploadedAt: Date;
}

export interface ServiceHistory {
  id: string;
  homeownerId: string;
  propertyId: string;
  homeProjectId?: string; // Links to HomeProject when applicable

  // Link to Homezy marketplace project (if applicable)
  projectId?: string;
  quoteId?: string;

  title: string;
  description?: string;
  category: HomeServiceCategory;
  serviceType: HomeServiceType;

  providerType: ProviderType;
  providerName?: string;
  professionalId?: string; // For Homezy professionals

  cost?: number;
  currency: 'AED';
  completedAt: Date;

  documents: ServiceDocument[];
  photos: string[];
  rating?: number;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Service Reminder Types
// ============================================================================

export const REMINDER_TRIGGER_TYPES = ['pattern-based', 'seasonal', 'custom'] as const;
export type ReminderTriggerType = typeof REMINDER_TRIGGER_TYPES[number];

export const REMINDER_FREQUENCIES = [
  'monthly',
  'quarterly',
  'biannual',
  'annual',
  'custom',
] as const;
export type ReminderFrequency = typeof REMINDER_FREQUENCIES[number];

export const REMINDER_STATUSES = [
  'active',
  'snoozed',
  'paused',
  'converted-to-quote',
] as const;
export type ReminderStatus = typeof REMINDER_STATUSES[number];

export interface ReminderNotification {
  sentAt: Date;
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

  // Pattern-based scheduling
  triggerType: ReminderTriggerType;
  frequency: ReminderFrequency;
  customIntervalDays?: number;
  lastServiceDate?: Date;
  nextDueDate: Date;

  // Notification tracking
  remindersSent: ReminderNotification[];
  reminderLeadDays: number[]; // e.g., [30, 7, 1]

  // Status
  status: ReminderStatus;
  snoozeUntil?: Date;

  // Conversion to quote
  leadId?: string;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Expense Types
// ============================================================================

export const EXPENSE_CATEGORIES = [
  'renovation',
  'repair',
  'maintenance',
  'utilities',
  'appliance',
  'furniture',
  'decor',
  'cleaning',
  'security',
  'landscaping',
  'permits',
  'other',
] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface ExpenseDocument {
  id: string;
  type: 'receipt' | 'invoice' | 'contract' | 'other';
  url: string;
  filename: string;
  uploadedAt: Date;
}

export interface Expense {
  id: string;
  homeownerId: string;
  propertyId: string;
  projectId?: string; // Linked Homezy marketplace project
  homeProjectId?: string; // Linked HomeProject
  serviceHistoryId?: string;

  title: string;
  description?: string;
  category: ExpenseCategory;
  amount: number;
  currency: 'AED';
  date: Date;

  vendorType: ProviderType;
  vendorName?: string;
  professionalId?: string;

  receiptUrl?: string;
  documents: ExpenseDocument[];
  tags: string[];

  createdAt: Date;
  updatedAt: Date;
}

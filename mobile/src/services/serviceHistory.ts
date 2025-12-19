/**
 * Service History API Service
 * Handles all service history-related API calls
 */

import { api } from './api';

// ============================================================================
// Types
// ============================================================================

export type HomeServiceCategory = 'hvac' | 'plumbing' | 'electrical' | 'painting' | 'flooring' | 'carpentry' | 'roofing' | 'landscaping' | 'pool' | 'pest-control' | 'cleaning' | 'security' | 'appliance-repair' | 'general-maintenance' | 'renovation' | 'other';
export type HomeServiceType = 'maintenance' | 'repair' | 'installation' | 'renovation' | 'inspection';
export type ProviderType = 'homezy' | 'external';

export interface ServiceDocument {
  id: string;
  type: 'invoice' | 'receipt' | 'report' | 'warranty' | 'other';
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface ServiceHistory {
  id: string;
  homeownerId: string;
  propertyId: string;
  homeProjectId?: string;
  projectId?: string;
  quoteId?: string;
  title: string;
  description?: string;
  category: HomeServiceCategory;
  serviceType: HomeServiceType;
  providerType: ProviderType;
  providerName?: string;
  professionalId?: string;
  cost?: number;
  currency: 'AED';
  completedAt: string;
  documents: ServiceDocument[];
  photos: string[];
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Input Types
// ============================================================================

export interface CreateServiceHistoryInput {
  propertyId: string;
  homeProjectId?: string;
  title: string;
  description?: string;
  category: HomeServiceCategory;
  serviceType: HomeServiceType;
  providerType: ProviderType;
  providerName?: string;
  professionalId?: string;
  cost?: number;
  completedAt: string;
  documents?: Omit<ServiceDocument, 'id' | 'uploadedAt'>[];
  photos?: string[];
  rating?: number;
}

export interface UpdateServiceHistoryInput {
  title?: string;
  description?: string;
  category?: HomeServiceCategory;
  serviceType?: HomeServiceType;
  providerType?: ProviderType;
  providerName?: string;
  cost?: number;
  completedAt?: string;
  rating?: number;
}

export interface ServiceHistoryListParams {
  propertyId?: string;
  category?: HomeServiceCategory;
  serviceType?: HomeServiceType;
  providerType?: ProviderType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

interface ServiceHistoryResponse {
  success: boolean;
  data: {
    serviceHistory: ServiceHistory;
  };
}

interface ServiceHistoryListResponse {
  success: boolean;
  data: {
    services: ServiceHistory[];
    total: number;
    limit: number;
    offset: number;
  };
}

interface TimelineGroup {
  month: string;
  year: number;
  services: ServiceHistory[];
}

interface TimelineResponse {
  success: boolean;
  data: {
    timeline: TimelineGroup[];
  };
}

interface CategorySummary {
  category: string;
  count: number;
  totalCost: number;
}

interface CategorySummaryResponse {
  success: boolean;
  data: {
    categories: CategorySummary[];
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new service history entry
 */
export async function createServiceHistory(
  input: CreateServiceHistoryInput
): Promise<ServiceHistory> {
  const response = await api.post<ServiceHistoryResponse>('/service-history', input);
  return response.data.data.serviceHistory;
}

/**
 * Get all service history for the authenticated user
 */
export async function getMyServiceHistory(
  params?: ServiceHistoryListParams
): Promise<{ services: ServiceHistory[]; total: number }> {
  const response = await api.get<ServiceHistoryListResponse>('/service-history', { params });
  return {
    services: response.data.data.services,
    total: response.data.data.total,
  };
}

/**
 * Get a service history entry by ID
 */
export async function getServiceHistoryById(id: string): Promise<ServiceHistory> {
  const response = await api.get<ServiceHistoryResponse>(`/service-history/${id}`);
  return response.data.data.serviceHistory;
}

/**
 * Get service timeline grouped by month
 */
export async function getServiceTimeline(
  params?: { propertyId?: string; year?: number }
): Promise<TimelineGroup[]> {
  const response = await api.get<TimelineResponse>('/service-history/timeline', { params });
  return response.data.data.timeline;
}

/**
 * Get services grouped by category with totals
 */
export async function getServicesByCategory(
  params?: { propertyId?: string; year?: number }
): Promise<CategorySummary[]> {
  const response = await api.get<CategorySummaryResponse>('/service-history/by-category', { params });
  return response.data.data.categories;
}

/**
 * Update a service history entry
 */
export async function updateServiceHistory(
  id: string,
  input: UpdateServiceHistoryInput
): Promise<ServiceHistory> {
  const response = await api.patch<ServiceHistoryResponse>(`/service-history/${id}`, input);
  return response.data.data.serviceHistory;
}

/**
 * Delete a service history entry
 */
export async function deleteServiceHistory(id: string): Promise<void> {
  await api.delete(`/service-history/${id}`);
}

// ============================================================================
// Helper Configuration
// ============================================================================

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

export const serviceTypeConfig: Record<HomeServiceType, { label: string; color: string; bgColor: string }> = {
  maintenance: { label: 'Maintenance', color: '#3B82F6', bgColor: '#EFF6FF' },
  repair: { label: 'Repair', color: '#EA580C', bgColor: '#FFF7ED' },
  installation: { label: 'Installation', color: '#16A34A', bgColor: '#DCFCE7' },
  renovation: { label: 'Renovation', color: '#8B5CF6', bgColor: '#F5F3FF' },
  inspection: { label: 'Inspection', color: '#06B6D4', bgColor: '#ECFEFF' },
};

export const providerTypeConfig: Record<ProviderType, { label: string; icon: string }> = {
  homezy: { label: 'Homezy Pro', icon: 'shield-checkmark' },
  external: { label: 'External', icon: 'person' },
};

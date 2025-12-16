import { api } from '../api';
import type {
  ServiceHistory,
  HomeServiceCategory,
  HomeServiceType,
  ProviderType,
  ServiceDocument,
  CreateServiceHistoryInput,
  UpdateServiceHistoryInput,
} from '@homezy/shared';

// Re-export types
export type {
  ServiceHistory,
  HomeServiceCategory,
  HomeServiceType,
  ProviderType,
  ServiceDocument,
  CreateServiceHistoryInput,
  UpdateServiceHistoryInput,
};

// ============================================================================
// Query Types
// ============================================================================

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
  const response = await api.post<ServiceHistoryResponse>(
    '/service-history',
    input
  );
  return response.data.data.serviceHistory;
}

/**
 * Get all service history for the authenticated user
 */
export async function getMyServiceHistory(
  params?: ServiceHistoryListParams
): Promise<{ services: ServiceHistory[]; total: number }> {
  const response = await api.get<ServiceHistoryListResponse>(
    '/service-history',
    { params }
  );
  return {
    services: response.data.data.services,
    total: response.data.data.total,
  };
}

/**
 * Get a service history entry by ID
 */
export async function getServiceHistoryById(
  id: string
): Promise<ServiceHistory> {
  const response = await api.get<ServiceHistoryResponse>(
    `/service-history/${id}`
  );
  return response.data.data.serviceHistory;
}

/**
 * Get service timeline grouped by month
 */
export async function getServiceTimeline(
  params?: { propertyId?: string; year?: number }
): Promise<TimelineGroup[]> {
  const response = await api.get<TimelineResponse>(
    '/service-history/timeline',
    { params }
  );
  return response.data.data.timeline;
}

/**
 * Get services grouped by category with totals
 */
export async function getServicesByCategory(
  params?: { propertyId?: string; year?: number }
): Promise<CategorySummary[]> {
  const response = await api.get<CategorySummaryResponse>(
    '/service-history/by-category',
    { params }
  );
  return response.data.data.categories;
}

/**
 * Update a service history entry
 */
export async function updateServiceHistory(
  id: string,
  input: UpdateServiceHistoryInput
): Promise<ServiceHistory> {
  const response = await api.patch<ServiceHistoryResponse>(
    `/service-history/${id}`,
    input
  );
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

export const serviceCategoryConfig: Record<
  HomeServiceCategory,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  hvac: { label: 'HVAC', icon: 'Wind', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  plumbing: { label: 'Plumbing', icon: 'Droplets', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  electrical: { label: 'Electrical', icon: 'Zap', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  painting: { label: 'Painting', icon: 'Paintbrush', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  flooring: { label: 'Flooring', icon: 'Square', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  carpentry: { label: 'Carpentry', icon: 'Hammer', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  roofing: { label: 'Roofing', icon: 'Home', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  landscaping: { label: 'Landscaping', icon: 'Trees', color: 'text-green-600', bgColor: 'bg-green-100' },
  pool: { label: 'Pool', icon: 'Waves', color: 'text-sky-600', bgColor: 'bg-sky-100' },
  'pest-control': { label: 'Pest Control', icon: 'Bug', color: 'text-red-600', bgColor: 'bg-red-100' },
  cleaning: { label: 'Cleaning', icon: 'Sparkles', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  security: { label: 'Security', icon: 'Shield', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  'appliance-repair': { label: 'Appliance Repair', icon: 'Wrench', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  'general-maintenance': { label: 'General Maintenance', icon: 'Settings', color: 'text-zinc-600', bgColor: 'bg-zinc-100' },
  renovation: { label: 'Renovation', icon: 'HardHat', color: 'text-rose-600', bgColor: 'bg-rose-100' },
  other: { label: 'Other', icon: 'MoreHorizontal', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export const serviceTypeConfig: Record<
  HomeServiceType,
  { label: string; color: string }
> = {
  maintenance: { label: 'Maintenance', color: 'text-blue-600' },
  repair: { label: 'Repair', color: 'text-orange-600' },
  installation: { label: 'Installation', color: 'text-green-600' },
  renovation: { label: 'Renovation', color: 'text-purple-600' },
  inspection: { label: 'Inspection', color: 'text-cyan-600' },
};

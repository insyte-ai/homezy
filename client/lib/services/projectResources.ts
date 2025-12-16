import { api } from '../api';
import type {
  ProjectResource,
  ResourceType,
  IdeaResourceData,
  ProResourceData,
  ProductResourceData,
  VendorResourceData,
  DocumentResourceData,
  EstimateResourceData,
  LinkResourceData,
} from '@homezy/shared';

// Re-export types
export type {
  ProjectResource,
  ResourceType,
  IdeaResourceData,
  ProResourceData,
  ProductResourceData,
  VendorResourceData,
  DocumentResourceData,
  EstimateResourceData,
  LinkResourceData,
};

// ============================================================================
// Input Types
// ============================================================================

export interface CreateResourceInput {
  type: ResourceType;
  title: string;
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
  ideaData?: IdeaResourceData;
  proData?: ProResourceData;
  productData?: ProductResourceData;
  vendorData?: VendorResourceData;
  documentData?: DocumentResourceData;
  estimateData?: EstimateResourceData;
  linkData?: LinkResourceData;
}

export interface UpdateResourceInput {
  title?: string;
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
  ideaData?: Partial<IdeaResourceData>;
  proData?: Partial<ProResourceData>;
  productData?: Partial<ProductResourceData>;
  vendorData?: Partial<VendorResourceData>;
  documentData?: Partial<DocumentResourceData>;
  estimateData?: Partial<EstimateResourceData>;
  linkData?: Partial<LinkResourceData>;
}

export interface ResourceListParams {
  type?: ResourceType;
  isFavorite?: boolean;
  tags?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

interface ResourceResponse {
  success: boolean;
  data: {
    resource: ProjectResource;
  };
}

interface ResourcesListResponse {
  success: boolean;
  data: {
    resources: ProjectResource[];
    total: number;
    limit: number;
    offset: number;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new resource in a project
 */
export async function createResource(
  projectId: string,
  input: CreateResourceInput
): Promise<ProjectResource> {
  const response = await api.post<ResourceResponse>(
    `/home-projects/${projectId}/resources`,
    input
  );
  return response.data.data.resource;
}

/**
 * Get all resources for a project
 */
export async function getProjectResources(
  projectId: string,
  params?: ResourceListParams
): Promise<{ resources: ProjectResource[]; total: number }> {
  const response = await api.get<ResourcesListResponse>(
    `/home-projects/${projectId}/resources`,
    { params }
  );
  return {
    resources: response.data.data.resources,
    total: response.data.data.total,
  };
}

/**
 * Get a resource by ID
 */
export async function getResourceById(
  projectId: string,
  resourceId: string
): Promise<ProjectResource> {
  const response = await api.get<ResourceResponse>(
    `/home-projects/${projectId}/resources/${resourceId}`
  );
  return response.data.data.resource;
}

/**
 * Update a resource
 */
export async function updateResource(
  projectId: string,
  resourceId: string,
  input: UpdateResourceInput
): Promise<ProjectResource> {
  const response = await api.patch<ResourceResponse>(
    `/home-projects/${projectId}/resources/${resourceId}`,
    input
  );
  return response.data.data.resource;
}

/**
 * Delete a resource
 */
export async function deleteResource(
  projectId: string,
  resourceId: string
): Promise<void> {
  await api.delete(`/home-projects/${projectId}/resources/${resourceId}`);
}

/**
 * Toggle favorite status of a resource
 */
export async function toggleFavorite(
  projectId: string,
  resourceId: string
): Promise<ProjectResource> {
  const response = await api.post<ResourceResponse>(
    `/home-projects/${projectId}/resources/${resourceId}/favorite`
  );
  return response.data.data.resource;
}

/**
 * Move a resource to another project
 */
export async function moveResource(
  projectId: string,
  resourceId: string,
  targetProjectId: string
): Promise<ProjectResource> {
  const response = await api.post<ResourceResponse>(
    `/home-projects/${projectId}/resources/${resourceId}/move`,
    { targetProjectId }
  );
  return response.data.data.resource;
}

/**
 * Copy a resource to another project
 */
export async function copyResource(
  projectId: string,
  resourceId: string,
  targetProjectId: string
): Promise<ProjectResource> {
  const response = await api.post<ResourceResponse>(
    `/home-projects/${projectId}/resources/${resourceId}/copy`,
    { targetProjectId }
  );
  return response.data.data.resource;
}

// ============================================================================
// Resource Type Helpers
// ============================================================================

export const resourceTypeConfig: Record<
  ResourceType,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  idea: { label: 'Idea', icon: 'Lightbulb', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  pro: { label: 'Professional', icon: 'User', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  product: { label: 'Product', icon: 'Package', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  vendor: { label: 'Vendor', icon: 'Store', color: 'text-green-600', bgColor: 'bg-green-100' },
  document: { label: 'Document', icon: 'FileText', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  estimate: { label: 'Estimate', icon: 'Receipt', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  link: { label: 'Link', icon: 'Link', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
};

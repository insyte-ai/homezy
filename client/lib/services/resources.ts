import { api } from '../api';
import {
  Resource,
  ResourceFilters,
  ResourceListResponse,
  ResourceStats,
  CategoryInfo,
  TargetAudience,
} from '@/types/resource';
import { CATEGORY_INFO, getCategoryInfo } from '@/data/resources';

// Public API methods

export async function getResources(filters: ResourceFilters = {}): Promise<ResourceListResponse> {
  const params = new URLSearchParams();

  if (filters.category) params.append('category', filters.category);
  if (filters.type) params.append('type', filters.type);
  if (filters.targetAudience) params.append('targetAudience', filters.targetAudience);
  if (filters.search) params.append('search', filters.search);
  if (filters.featured) params.append('featured', 'true');
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());
  if (filters.tags?.length) {
    filters.tags.forEach(tag => params.append('tags', tag));
  }

  const response = await api.get(`/resources?${params.toString()}`);
  return response.data.data;
}

export async function getResourceBySlug(slug: string): Promise<Resource> {
  const response = await api.get(`/resources/slug/${slug}`);
  return response.data.data;
}

export async function getFeaturedResources(
  limit: number = 3,
  targetAudience?: TargetAudience
): Promise<Resource[]> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (targetAudience) params.append('targetAudience', targetAudience);

  const response = await api.get(`/resources/featured?${params.toString()}`);
  return response.data.data;
}

export async function getPopularResources(
  limit: number = 5,
  targetAudience?: TargetAudience
): Promise<Resource[]> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (targetAudience) params.append('targetAudience', targetAudience);

  const response = await api.get(`/resources/popular?${params.toString()}`);
  return response.data.data;
}

export async function getLatestResources(
  limit: number = 5,
  targetAudience?: TargetAudience
): Promise<Resource[]> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (targetAudience) params.append('targetAudience', targetAudience);

  const response = await api.get(`/resources/latest?${params.toString()}`);
  return response.data.data;
}

export async function getRelatedResources(slug: string, limit: number = 3): Promise<Resource[]> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());

  const response = await api.get(`/resources/slug/${slug}/related?${params.toString()}`);
  return response.data.data;
}

export async function getResourceStats(): Promise<ResourceStats> {
  const response = await api.get('/resources/stats');
  return response.data.data;
}

export async function searchResources(query: string, limit: number = 10): Promise<Resource[]> {
  const response = await getResources({ search: query, limit });
  return response.resources;
}

// Category helpers (client-side)

export function getCategories(): CategoryInfo[] {
  return CATEGORY_INFO;
}

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return getCategoryInfo(slug);
}

export function getCategoriesWithCounts(stats: ResourceStats): CategoryInfo[] {
  return CATEGORY_INFO.map(cat => ({
    ...cat,
    resourceCount: stats.categoryCounts[cat.slug] || 0,
  }));
}

// Admin API methods

export async function getAllResourcesAdmin(filters: ResourceFilters = {}): Promise<ResourceListResponse> {
  const params = new URLSearchParams();

  if (filters.category) params.append('category', filters.category);
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await api.get(`/resources/admin/all?${params.toString()}`);
  return response.data.data;
}

export async function getResourceById(id: string): Promise<Resource> {
  const response = await api.get(`/resources/admin/${id}`);
  return response.data.data;
}

export async function createResource(data: Partial<Resource>): Promise<Resource> {
  const response = await api.post('/resources/admin', data);
  return response.data.data;
}

export async function updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
  const response = await api.put(`/resources/admin/${id}`, data);
  return response.data.data;
}

export async function deleteResource(id: string): Promise<void> {
  await api.delete(`/resources/admin/${id}`);
}

export async function bulkUpdateResources(
  resourceIds: string[],
  updates: Partial<Resource>
): Promise<{ modifiedCount: number }> {
  const response = await api.post('/resources/admin/bulk-update', {
    resourceIds,
    updates,
  });
  return response.data.data;
}

export async function bulkDeleteResources(resourceIds: string[]): Promise<{ deletedCount: number }> {
  const response = await api.post('/resources/admin/bulk-delete', {
    resourceIds,
  });
  return response.data.data;
}

// Utility functions

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function calculateReadingTime(content: string): number {
  // Average reading speed: 200 words per minute
  const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function formatPublishedDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;

  return formatPublishedDate(date);
}

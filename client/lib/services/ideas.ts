import { api } from '../api';
import type {
  IdeasPhoto,
  RoomCategory,
  IdeasListResponse,
  PhotoDetailResponse,
  CategoryCount,
} from '@homezy/shared';

// Re-export types for convenience
export type {
  IdeasPhoto,
  RoomCategory,
  IdeasListResponse,
  PhotoDetailResponse,
  CategoryCount,
};

// ============================================================================
// Public Ideas API
// ============================================================================

export interface ListIdeasParams {
  category?: RoomCategory;
  sort?: 'newest' | 'popular';
  cursor?: string;
  limit?: number;
}

/**
 * List published photos for the Ideas page
 */
export async function listIdeas(params: ListIdeasParams = {}): Promise<IdeasListResponse> {
  const response = await api.get('/ideas', { params });
  return response.data.data;
}

/**
 * Get a single photo with related photos
 */
export async function getPhotoById(photoId: string): Promise<PhotoDetailResponse> {
  const response = await api.get(`/ideas/${photoId}`);
  return response.data.data;
}

/**
 * Get category counts for the sidebar
 */
export async function getCategoryCounts(): Promise<CategoryCount[]> {
  const response = await api.get('/ideas/categories');
  return response.data.data.categories;
}

// ============================================================================
// Save Functionality
// ============================================================================

/**
 * Check if a photo is saved by the current user
 */
export async function getSaveStatus(photoId: string): Promise<boolean> {
  const response = await api.get(`/ideas/${photoId}/save-status`);
  return response.data.data.isSaved;
}

/**
 * Save a photo to "My Ideas"
 */
export async function savePhoto(photoId: string): Promise<void> {
  await api.post(`/ideas/${photoId}/save`);
}

/**
 * Unsave a photo
 */
export async function unsavePhoto(photoId: string): Promise<void> {
  await api.delete(`/ideas/${photoId}/save`);
}

/**
 * Get user's saved photos
 */
export async function getSavedPhotos(params: { limit?: number; cursor?: string } = {}): Promise<{
  photos: IdeasPhoto[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  const response = await api.get('/ideas/saved', { params });
  return response.data.data;
}

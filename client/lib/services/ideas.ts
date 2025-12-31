import { api } from '../api';
import type {
  PortfolioPhoto,
  RoomCategory,
  IdeasListResponse,
  PhotoDetailResponse,
  CategoryCount,
  CreatePortfolioPhotoInput,
  UpdatePortfolioPhotoInput,
} from '@homezy/shared';

// Re-export types for convenience
export type {
  PortfolioPhoto,
  RoomCategory,
  IdeasListResponse,
  PhotoDetailResponse,
  CategoryCount,
  CreatePortfolioPhotoInput,
  UpdatePortfolioPhotoInput,
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
  photos: PortfolioPhoto[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  const response = await api.get('/ideas/saved', { params });
  return response.data.data;
}

// ============================================================================
// Pro Photo Management
// ============================================================================

/**
 * List professional's photos
 */
export async function listMyPhotos(params: {
  isPublished?: boolean;
  limit?: number;
  offset?: number;
} = {}): Promise<{ photos: PortfolioPhoto[]; total: number }> {
  const response = await api.get('/pros/me/photos', { params });
  return response.data.data;
}

/**
 * Create a new portfolio photo
 */
export async function createPhoto(input: CreatePortfolioPhotoInput): Promise<PortfolioPhoto> {
  const response = await api.post('/pros/me/photos', input);
  return response.data.data.photo;
}

/**
 * Update a portfolio photo
 */
export async function updatePhoto(
  photoId: string,
  input: UpdatePortfolioPhotoInput
): Promise<PortfolioPhoto> {
  const response = await api.patch(`/pros/me/photos/${photoId}`, input);
  return response.data.data.photo;
}

/**
 * Delete a portfolio photo
 */
export async function deletePhoto(photoId: string): Promise<void> {
  await api.delete(`/pros/me/photos/${photoId}`);
}

/**
 * Toggle publish status
 */
export async function togglePublish(photoId: string): Promise<PortfolioPhoto> {
  const response = await api.post(`/pros/me/photos/${photoId}/publish`);
  return response.data.data.photo;
}

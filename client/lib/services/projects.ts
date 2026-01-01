/**
 * Pro Projects Service
 * API client for the unified project portfolio management system
 */

import { api } from '../api';
import type {
  ProProject,
  ProProjectPhoto,
  CreateProProjectInput,
  UpdateProProjectInput,
  AddProjectPhotoInput,
  UpdateProjectPhotoInput,
  RoomCategory,
  PhotoType,
} from '@homezy/shared';

// Re-export types for convenience
export type {
  ProProject,
  ProProjectPhoto,
  CreateProProjectInput,
  UpdateProProjectInput,
  AddProjectPhotoInput,
  UpdateProjectPhotoInput,
};

// ============================================================================
// Types
// ============================================================================

export interface ListProjectsParams {
  limit?: number;
  offset?: number;
}

export interface ListProjectsResponse {
  projects: ProProject[];
  total: number;
}

export interface ProjectStatsResponse {
  totalProjects: number;
  totalPhotos: number;
  publishedPhotos: number;
  totalViews: number;
  totalSaves: number;
}

// ============================================================================
// Pro Project Management API
// ============================================================================

/**
 * List all projects for the authenticated professional
 */
export async function listProjects(
  params: ListProjectsParams = {}
): Promise<ListProjectsResponse> {
  const response = await api.get('/pros/me/projects', { params });
  return response.data.data;
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string): Promise<ProProject> {
  const response = await api.get(`/pros/me/projects/${projectId}`);
  return response.data.data.project;
}

/**
 * Create a new project
 */
export async function createProject(
  input: CreateProProjectInput
): Promise<ProProject> {
  const response = await api.post('/pros/me/projects', input);
  return response.data.data.project;
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  input: UpdateProProjectInput
): Promise<ProProject> {
  const response = await api.put(`/pros/me/projects/${projectId}`, input);
  return response.data.data.project;
}

/**
 * Delete a project and all its photos
 */
export async function deleteProject(projectId: string): Promise<void> {
  await api.delete(`/pros/me/projects/${projectId}`);
}

// ============================================================================
// Photo Management API
// ============================================================================

/**
 * Add photos to a project
 */
export async function addPhotos(
  projectId: string,
  photos: AddProjectPhotoInput[]
): Promise<ProProjectPhoto[]> {
  const response = await api.post(`/pros/me/projects/${projectId}/photos`, { photos });
  return response.data.data.photos;
}

/**
 * Update a photo's metadata
 */
export async function updatePhoto(
  projectId: string,
  photoId: string,
  input: UpdateProjectPhotoInput
): Promise<ProProjectPhoto> {
  const response = await api.patch(
    `/pros/me/projects/${projectId}/photos/${photoId}`,
    input
  );
  return response.data.data.photo;
}

/**
 * Delete a photo from a project
 */
export async function deletePhoto(
  projectId: string,
  photoId: string
): Promise<void> {
  await api.delete(`/pros/me/projects/${projectId}/photos/${photoId}`);
}

/**
 * Toggle Ideas publish status for a photo
 */
export async function togglePhotoPublish(
  projectId: string,
  photoId: string
): Promise<ProProjectPhoto> {
  const response = await api.post(
    `/pros/me/projects/${projectId}/photos/${photoId}/toggle-publish`
  );
  return response.data.data.photo;
}

/**
 * Reorder photos within a project
 */
export async function reorderPhotos(
  projectId: string,
  photoOrders: Array<{ photoId: string; displayOrder: number }>
): Promise<void> {
  await api.put(`/pros/me/projects/${projectId}/photos/reorder`, { photoOrders });
}

// ============================================================================
// Stats API
// ============================================================================

/**
 * Get project statistics for the current professional
 */
export async function getProjectStats(): Promise<ProjectStatsResponse> {
  const response = await api.get('/pros/me/projects/stats');
  return response.data.data.stats;
}

// ============================================================================
// Image Upload (reuse existing upload endpoint)
// ============================================================================

/**
 * Upload project images
 * Uses the existing portfolio images upload endpoint
 */
export async function uploadProjectImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post<{ success: boolean; data: { urls: string[] } }>(
    '/upload/portfolio-images',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data.urls;
}

// ============================================================================
// Default Export
// ============================================================================

const projectsService = {
  // Projects
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,

  // Photos
  addPhotos,
  updatePhoto,
  deletePhoto,
  togglePhotoPublish,
  reorderPhotos,

  // Stats
  getProjectStats,

  // Upload
  uploadProjectImages,
};

export default projectsService;

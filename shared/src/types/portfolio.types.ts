/**
 * Portfolio Photo Types
 * Types for the Ideas page and portfolio photo management
 */

import type { RoomCategory } from '../constants/roomCategories';

// ============================================================================
// Photo Types
// ============================================================================

export const PHOTO_TYPES = ['main', 'before', 'after'] as const;
export type PhotoType = (typeof PHOTO_TYPES)[number];

export const ADMIN_PHOTO_STATUSES = ['active', 'removed', 'flagged'] as const;
export type AdminPhotoStatus = (typeof ADMIN_PHOTO_STATUSES)[number];

// ============================================================================
// Ideas Photo (for Ideas page display)
// ============================================================================

export interface IdeasPhoto {
  id: string;
  projectId: string;
  professionalId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  roomCategories: RoomCategory[];
  photoType: PhotoType;
  caption?: string;
  projectTitle: string;
  projectDescription: string;
  businessName: string;
  proSlug?: string;
  proProfilePhoto?: string;
  proVerificationStatus: 'pending' | 'approved' | 'rejected';
  saveCount: number;
  viewCount: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
}

// ============================================================================
// Photo Save
// ============================================================================

export interface PhotoSave {
  id: string;
  photoId: string;
  userId: string;
  savedToProjectId: string; // HomeProject ID (usually "My Ideas")
  savedToResourceId?: string; // ProjectResource ID when saved
  createdAt: Date;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface IdeasListParams {
  category?: RoomCategory;
  sort?: 'newest' | 'popular';
  cursor?: string;
  limit?: number;
}

export interface IdeasListResponse {
  photos: IdeasPhoto[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export interface PhotoDetailResponse {
  photo: IdeasPhoto;
  relatedPhotos: IdeasPhoto[];
  projectPhotos: IdeasPhoto[];
  isSaved?: boolean;
}

export interface CategoryCount {
  category: RoomCategory;
  count: number;
}

// ============================================================================
// Pro Project Types
// ============================================================================

export interface ProProjectPhoto {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  photoType: PhotoType;
  caption?: string;
  roomCategories: RoomCategory[];
  displayOrder: number;

  // Ideas Publishing
  isPublishedToIdeas: boolean;
  publishedAt?: Date;

  // Admin Moderation
  adminStatus: AdminPhotoStatus;
  adminRemovedAt?: Date;
  adminRemovedBy?: string;
  adminRemovalReason?: string;

  // Engagement metrics
  saveCount: number;
  viewCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface ProProject {
  id: string;
  professionalId: string;

  // Project Details
  name: string;
  description: string;
  serviceCategory: string;
  completionDate: Date;

  // Denormalized pro info for Ideas page
  businessName: string;
  proSlug?: string;
  proProfilePhoto?: string;
  proVerificationStatus: 'pending' | 'approved' | 'rejected';

  // Photos
  photos: ProProjectPhoto[];

  // Computed
  photoCount?: number;
  publishedPhotoCount?: number;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Pro Project API Types
// ============================================================================

export interface CreateProProjectInput {
  name: string;
  description: string;
  serviceCategory: string;
  completionDate: Date | string;
}

export interface UpdateProProjectInput {
  name?: string;
  description?: string;
  serviceCategory?: string;
  completionDate?: Date | string;
}

export interface AddProjectPhotoInput {
  imageUrl: string;
  thumbnailUrl?: string;
  photoType?: PhotoType;
  caption?: string;
  roomCategories: RoomCategory[];
  isPublishedToIdeas?: boolean;
}

export interface UpdateProjectPhotoInput {
  photoType?: PhotoType;
  caption?: string;
  roomCategories?: RoomCategory[];
  displayOrder?: number;
  isPublishedToIdeas?: boolean;
}

export interface AdminPhotoStatusUpdate {
  adminStatus: AdminPhotoStatus;
  removalReason?: string;
}

// Admin Ideas List Response
export interface AdminIdeasPhoto {
  id: string;
  photoId: string;
  projectId: string;
  projectName: string;
  professionalId: string;
  businessName: string;
  proSlug?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  roomCategories: RoomCategory[];
  adminStatus: AdminPhotoStatus;
  isPublishedToIdeas: boolean;
  saveCount: number;
  viewCount: number;
  createdAt: Date;
}

export interface AdminIdeasListResponse {
  photos: AdminIdeasPhoto[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export interface AdminIdeasStats {
  totalPublished: number;
  totalFlagged: number;
  totalRemoved: number;
  totalProjects: number;
}

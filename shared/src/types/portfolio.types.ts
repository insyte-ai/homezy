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

// ============================================================================
// Portfolio Photo
// ============================================================================

export interface PortfolioPhoto {
  id: string;
  professionalId: string;
  portfolioItemId?: string; // Link to existing PortfolioItem

  // Image data
  imageUrl: string;
  thumbnailUrl?: string;

  // Categorization
  roomCategories: RoomCategory[];
  serviceCategory?: string; // Link to existing service category

  // Photo metadata
  photoType: PhotoType;
  caption?: string;

  // Project info
  projectTitle?: string;
  projectDescription?: string;

  // Denormalized pro info (for faster reads)
  businessName: string;
  proSlug?: string;
  proProfilePhoto?: string;
  proVerificationStatus: 'pending' | 'approved' | 'rejected';

  // Engagement metrics
  saveCount: number;
  viewCount: number;

  // Status
  isPublished: boolean;
  publishedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
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

export interface CreatePortfolioPhotoInput {
  imageUrl: string;
  thumbnailUrl?: string;
  roomCategories: RoomCategory[];
  serviceCategory?: string;
  photoType?: PhotoType;
  caption?: string;
  projectTitle?: string;
  projectDescription?: string;
  portfolioItemId?: string;
  isPublished?: boolean;
}

export interface UpdatePortfolioPhotoInput {
  roomCategories?: RoomCategory[];
  serviceCategory?: string;
  photoType?: PhotoType;
  caption?: string;
  projectTitle?: string;
  projectDescription?: string;
  isPublished?: boolean;
}

export interface IdeasListParams {
  category?: RoomCategory;
  sort?: 'newest' | 'popular';
  cursor?: string;
  limit?: number;
}

export interface IdeasListResponse {
  photos: PortfolioPhoto[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export interface PhotoDetailResponse {
  photo: PortfolioPhoto;
  relatedPhotos: PortfolioPhoto[];
  projectPhotos: PortfolioPhoto[];
  isSaved?: boolean;
}

export interface CategoryCount {
  category: RoomCategory;
  count: number;
}

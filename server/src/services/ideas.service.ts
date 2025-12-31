// @ts-nocheck - Temporary: disable type checking for initial implementation
import { PortfolioPhoto, IPortfolioPhoto } from '../models/PortfolioPhoto.model';
import { PhotoSave, IPhotoSave } from '../models/PhotoSave.model';
import { ProjectResource } from '../models/ProjectResource.model';
import * as homeProjectService from './homeProject.service';
import { transformLeanDoc, transformLeanDocs } from '../utils/mongoose.utils';
import type { RoomCategory } from '@homezy/shared';
import mongoose from 'mongoose';

// ============================================================================
// Public Ideas Queries
// ============================================================================

export interface ListIdeasParams {
  category?: RoomCategory;
  sort?: 'newest' | 'popular';
  cursor?: string;
  limit?: number;
}

export interface ListIdeasResult {
  photos: IPortfolioPhoto[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

/**
 * List published portfolio photos for the Ideas page
 */
export async function listIdeas(params: ListIdeasParams): Promise<ListIdeasResult> {
  const { category, sort = 'newest', cursor, limit = 24 } = params;

  // Build query
  const query: any = { isPublished: true };

  if (category) {
    query.roomCategories = category;
  }

  // Cursor-based pagination
  if (cursor) {
    if (sort === 'newest') {
      query.publishedAt = { $lt: new Date(cursor) };
    } else {
      // For popular, cursor is the saveCount
      query.saveCount = { $lt: parseInt(cursor) };
    }
  }

  // Get total count (only for first page)
  const total = cursor ? 0 : await PortfolioPhoto.countDocuments({ isPublished: true, ...(category ? { roomCategories: category } : {}) });

  // Build sort
  const sortOption = sort === 'newest'
    ? { publishedAt: -1 as const, _id: -1 as const }
    : { saveCount: -1 as const, _id: -1 as const };

  // Fetch photos
  const photos = await PortfolioPhoto.find(query)
    .sort(sortOption)
    .limit(limit + 1) // Fetch one extra to check if there are more
    .lean();

  const hasMore = photos.length > limit;
  const resultPhotos = hasMore ? photos.slice(0, limit) : photos;

  // Determine next cursor
  let nextCursor: string | undefined;
  if (hasMore && resultPhotos.length > 0) {
    const lastPhoto = resultPhotos[resultPhotos.length - 1];
    nextCursor = sort === 'newest'
      ? lastPhoto.publishedAt?.toISOString()
      : lastPhoto.saveCount.toString();
  }

  return {
    photos: transformLeanDocs(resultPhotos),
    nextCursor,
    hasMore,
    total,
  };
}

/**
 * Get a single photo by ID
 */
export async function getPhotoById(photoId: string) {
  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return null;
  }

  const photo = await PortfolioPhoto.findById(photoId).lean();

  // Increment view count asynchronously
  if (photo) {
    PortfolioPhoto.updateOne({ _id: photoId }, { $inc: { viewCount: 1 } }).exec();
    return transformLeanDoc(photo);
  }

  return null;
}

/**
 * Get related photos (same room category, excluding the current photo)
 */
export async function getRelatedPhotos(
  photoId: string,
  roomCategories: RoomCategory[],
  limit: number = 8
) {
  if (roomCategories.length === 0) {
    return [];
  }

  const photos = await PortfolioPhoto.find({
    _id: { $ne: photoId },
    isPublished: true,
    roomCategories: { $in: roomCategories },
  })
    .sort({ saveCount: -1, publishedAt: -1 })
    .limit(limit)
    .lean();

  return transformLeanDocs(photos);
}

/**
 * Get other photos from the same project/portfolio item
 */
export async function getProjectPhotos(
  portfolioItemId: string,
  excludePhotoId: string,
  limit: number = 8
) {
  if (!portfolioItemId) {
    return [];
  }

  const photos = await PortfolioPhoto.find({
    portfolioItemId,
    _id: { $ne: excludePhotoId },
    isPublished: true,
  })
    .sort({ photoType: 1, createdAt: 1 }) // main first, then before, then after
    .limit(limit)
    .lean();

  return transformLeanDocs(photos);
}

/**
 * Get category counts for the sidebar
 */
export async function getCategoryCounts(): Promise<{ category: RoomCategory; count: number }[]> {
  const result = await PortfolioPhoto.aggregate([
    { $match: { isPublished: true } },
    { $unwind: '$roomCategories' },
    { $group: { _id: '$roomCategories', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return result.map((r) => ({
    category: r._id as RoomCategory,
    count: r.count,
  }));
}

// ============================================================================
// Save Functionality
// ============================================================================

/**
 * Check if a user has saved a photo
 */
export async function isPhotoSaved(photoId: string, userId: string): Promise<boolean> {
  const save = await PhotoSave.findOne({
    photoId: new mongoose.Types.ObjectId(photoId),
    userId: new mongoose.Types.ObjectId(userId),
  });
  return !!save;
}

/**
 * Save a photo to the user's "My Ideas" project
 */
export async function savePhoto(photoId: string, userId: string): Promise<IPhotoSave> {
  const photoObjectId = new mongoose.Types.ObjectId(photoId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Check if already saved
  const existing = await PhotoSave.findOne({ photoId: photoObjectId, userId: userObjectId });
  if (existing) {
    return existing;
  }

  // Get the photo
  const photo = await PortfolioPhoto.findById(photoId);
  if (!photo) {
    throw new Error('Photo not found');
  }

  // Get or create user's default "My Ideas" project
  const defaultProject = await homeProjectService.getOrCreateDefaultProject(userId);

  // Create a ProjectResource for the saved idea
  const resource = new ProjectResource({
    projectId: defaultProject._id.toString(),
    type: 'idea',
    title: photo.projectTitle || photo.caption || 'Saved Idea',
    notes: photo.caption,
    tags: photo.roomCategories,
    ideaData: {
      images: [photo.imageUrl],
      sourceUrl: `/ideas/photo/${photoId}`,
      inspiration: `From ${photo.businessName}`,
    },
  });
  await resource.save();

  // Create the PhotoSave record
  const save = new PhotoSave({
    photoId: photoObjectId,
    userId: userObjectId,
    savedToProjectId: defaultProject._id.toString(),
    savedToResourceId: resource._id.toString(),
  });
  await save.save();

  // Increment save count on the photo
  await PortfolioPhoto.updateOne({ _id: photoId }, { $inc: { saveCount: 1 } });

  return save;
}

/**
 * Unsave a photo
 */
export async function unsavePhoto(photoId: string, userId: string): Promise<void> {
  const photoObjectId = new mongoose.Types.ObjectId(photoId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const save = await PhotoSave.findOne({ photoId: photoObjectId, userId: userObjectId });
  if (!save) {
    return;
  }

  // Delete the ProjectResource if it exists
  if (save.savedToResourceId) {
    await ProjectResource.deleteOne({ _id: save.savedToResourceId });
  }

  // Delete the PhotoSave record
  await PhotoSave.deleteOne({ _id: save._id });

  // Decrement save count on the photo
  await PortfolioPhoto.updateOne(
    { _id: photoId, saveCount: { $gt: 0 } },
    { $inc: { saveCount: -1 } }
  );
}

/**
 * Get user's saved photos
 */
export async function getUserSavedPhotos(
  userId: string,
  limit: number = 24,
  cursor?: string
) {
  const query: any = { userId: new mongoose.Types.ObjectId(userId) };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const saves = await PhotoSave.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = saves.length > limit;
  const resultSaves = hasMore ? saves.slice(0, limit) : saves;

  // Get the photos
  const photoIds = resultSaves.map((s) => s.photoId);
  const photos = await PortfolioPhoto.find({ _id: { $in: photoIds } }).lean();

  // Maintain order
  const photoMap = new Map(photos.map((p) => [p._id.toString(), p]));
  const orderedPhotos = resultSaves
    .map((s) => photoMap.get(s.photoId.toString()))
    .filter(Boolean);

  let nextCursor: string | undefined;
  if (hasMore && resultSaves.length > 0) {
    const lastSave = resultSaves[resultSaves.length - 1];
    nextCursor = lastSave.createdAt.toISOString();
  }

  return { photos: transformLeanDocs(orderedPhotos), nextCursor, hasMore };
}

// ============================================================================
// Pro Photo Management
// ============================================================================

export interface CreatePhotoInput {
  imageUrl: string;
  thumbnailUrl?: string;
  roomCategories: RoomCategory[];
  serviceCategory?: string;
  photoType?: 'main' | 'before' | 'after';
  caption?: string;
  projectTitle?: string;
  projectDescription?: string;
  portfolioItemId?: string;
  isPublished?: boolean;
}

/**
 * Create a new portfolio photo for a professional
 */
export async function createPhoto(
  professionalId: string,
  proProfile: {
    businessName: string;
    slug?: string;
    profilePhoto?: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
  },
  input: CreatePhotoInput
): Promise<IPortfolioPhoto> {
  const photo = new PortfolioPhoto({
    professionalId: new mongoose.Types.ObjectId(professionalId),
    portfolioItemId: input.portfolioItemId,
    imageUrl: input.imageUrl,
    thumbnailUrl: input.thumbnailUrl,
    roomCategories: input.roomCategories || [],
    serviceCategory: input.serviceCategory,
    photoType: input.photoType || 'main',
    caption: input.caption,
    projectTitle: input.projectTitle,
    projectDescription: input.projectDescription,
    businessName: proProfile.businessName,
    proSlug: proProfile.slug,
    proProfilePhoto: proProfile.profilePhoto,
    proVerificationStatus: proProfile.verificationStatus,
    isPublished: input.isPublished ?? false,
    publishedAt: input.isPublished ? new Date() : undefined,
    saveCount: 0,
    viewCount: 0,
  });

  await photo.save();
  return photo;
}

/**
 * Update a portfolio photo
 */
export async function updatePhoto(
  photoId: string,
  professionalId: string,
  updates: Partial<CreatePhotoInput>
): Promise<IPortfolioPhoto | null> {
  const photo = await PortfolioPhoto.findOne({
    _id: photoId,
    professionalId: new mongoose.Types.ObjectId(professionalId),
  });

  if (!photo) {
    return null;
  }

  // Update fields
  if (updates.roomCategories !== undefined) photo.roomCategories = updates.roomCategories;
  if (updates.serviceCategory !== undefined) photo.serviceCategory = updates.serviceCategory;
  if (updates.photoType !== undefined) photo.photoType = updates.photoType;
  if (updates.caption !== undefined) photo.caption = updates.caption;
  if (updates.projectTitle !== undefined) photo.projectTitle = updates.projectTitle;
  if (updates.projectDescription !== undefined) photo.projectDescription = updates.projectDescription;

  // Handle publish status change
  if (updates.isPublished !== undefined && updates.isPublished !== photo.isPublished) {
    photo.isPublished = updates.isPublished;
    if (updates.isPublished) {
      photo.publishedAt = new Date();
    }
  }

  await photo.save();
  return photo;
}

/**
 * Delete a portfolio photo
 */
export async function deletePhoto(photoId: string, professionalId: string): Promise<boolean> {
  const result = await PortfolioPhoto.deleteOne({
    _id: photoId,
    professionalId: new mongoose.Types.ObjectId(professionalId),
  });

  if (result.deletedCount > 0) {
    // Also delete any saves for this photo
    await PhotoSave.deleteMany({ photoId: new mongoose.Types.ObjectId(photoId) });
    return true;
  }

  return false;
}

/**
 * List a professional's photos
 */
export async function listProPhotos(
  professionalId: string,
  options: { isPublished?: boolean; limit?: number; offset?: number } = {}
) {
  const { isPublished, limit = 50, offset = 0 } = options;

  const query: any = { professionalId: new mongoose.Types.ObjectId(professionalId) };
  if (isPublished !== undefined) {
    query.isPublished = isPublished;
  }

  const [photos, total] = await Promise.all([
    PortfolioPhoto.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    PortfolioPhoto.countDocuments(query),
  ]);

  return { photos: transformLeanDocs(photos), total };
}

/**
 * Toggle publish status for a photo
 */
export async function togglePublish(
  photoId: string,
  professionalId: string
): Promise<IPortfolioPhoto | null> {
  const photo = await PortfolioPhoto.findOne({
    _id: photoId,
    professionalId: new mongoose.Types.ObjectId(professionalId),
  });

  if (!photo) {
    return null;
  }

  photo.isPublished = !photo.isPublished;
  if (photo.isPublished) {
    photo.publishedAt = new Date();
  }

  await photo.save();
  return photo;
}

/**
 * Update denormalized pro info on all photos when profile changes
 */
export async function updateProInfoOnPhotos(
  professionalId: string,
  proProfile: {
    businessName: string;
    slug?: string;
    profilePhoto?: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
  }
): Promise<void> {
  await PortfolioPhoto.updateMany(
    { professionalId: new mongoose.Types.ObjectId(professionalId) },
    {
      $set: {
        businessName: proProfile.businessName,
        proSlug: proProfile.slug,
        proProfilePhoto: proProfile.profilePhoto,
        proVerificationStatus: proProfile.verificationStatus,
      },
    }
  );
}

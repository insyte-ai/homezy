import { PhotoSave, IPhotoSave } from '../models/PhotoSave.model';
import { ProjectResource } from '../models/ProjectResource.model';
import { Project } from '../models/Project.model';
import * as homeProjectService from './homeProject.service';
import type { RoomCategory } from '@homezy/shared';
import mongoose from 'mongoose';

// ============================================================================
// Types
// ============================================================================

export interface IdeasPhoto {
  id: string;
  projectId: string;
  professionalId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  roomCategories: RoomCategory[];
  photoType: 'main' | 'before' | 'after';
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

export interface ListIdeasParams {
  category?: RoomCategory;
  sort?: 'newest' | 'popular';
  cursor?: string;
  limit?: number;
}

export interface ListIdeasResult {
  photos: IdeasPhoto[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

// ============================================================================
// Public Ideas Queries
// ============================================================================

/**
 * List published photos for the Ideas page
 */
export async function listIdeas(params: ListIdeasParams): Promise<ListIdeasResult> {
  const { category, sort = 'newest', cursor, limit = 24 } = params;

  // Build aggregation pipeline
  const pipeline: any[] = [
    // Unwind photos
    { $unwind: '$photos' },
    // Match only published and active photos
    {
      $match: {
        'photos.isPublishedToIdeas': true,
        'photos.adminStatus': 'active',
        ...(category ? { 'photos.roomCategories': category } : {}),
      },
    },
  ];

  // Cursor-based pagination
  if (cursor) {
    const [cursorValue, cursorId] = cursor.split('_');
    if (sort === 'newest') {
      pipeline.push({
        $match: {
          $or: [
            { 'photos.publishedAt': { $lt: new Date(cursorValue) } },
            {
              'photos.publishedAt': new Date(cursorValue),
              'photos._id': { $lt: new mongoose.Types.ObjectId(cursorId) },
            },
          ],
        },
      });
    } else {
      const saveCount = parseInt(cursorValue);
      pipeline.push({
        $match: {
          $or: [
            { 'photos.saveCount': { $lt: saveCount } },
            {
              'photos.saveCount': saveCount,
              'photos._id': { $lt: new mongoose.Types.ObjectId(cursorId) },
            },
          ],
        },
      });
    }
  }

  // Sort
  const sortStage = sort === 'newest'
    ? { 'photos.publishedAt': -1 as const, 'photos._id': -1 as const }
    : { 'photos.saveCount': -1 as const, 'photos._id': -1 as const };
  pipeline.push({ $sort: sortStage });

  // Limit
  pipeline.push({ $limit: limit + 1 });

  // Project to final shape
  pipeline.push({
    $project: {
      id: { $toString: '$photos._id' },
      projectId: { $toString: '$_id' },
      professionalId: { $toString: '$professionalId' },
      imageUrl: '$photos.imageUrl',
      thumbnailUrl: '$photos.thumbnailUrl',
      roomCategories: '$photos.roomCategories',
      photoType: '$photos.photoType',
      caption: '$photos.caption',
      projectTitle: '$name',
      projectDescription: '$description',
      businessName: 1,
      proSlug: 1,
      proProfilePhoto: 1,
      proVerificationStatus: 1,
      saveCount: '$photos.saveCount',
      viewCount: '$photos.viewCount',
      isPublished: '$photos.isPublishedToIdeas',
      publishedAt: '$photos.publishedAt',
      createdAt: '$photos.createdAt',
    },
  });

  const results = await Project.aggregate(pipeline);

  const hasMore = results.length > limit;
  const photos = hasMore ? results.slice(0, limit) : results;

  // Build next cursor
  let nextCursor: string | undefined;
  if (hasMore && photos.length > 0) {
    const lastPhoto = photos[photos.length - 1];
    const cursorValue = sort === 'newest'
      ? new Date(lastPhoto.publishedAt).toISOString()
      : lastPhoto.saveCount.toString();
    nextCursor = `${cursorValue}_${lastPhoto.id}`;
  }

  // Get total count (only for first page)
  let total = 0;
  if (!cursor) {
    const countPipeline: any[] = [
      { $unwind: '$photos' },
      {
        $match: {
          'photos.isPublishedToIdeas': true,
          'photos.adminStatus': 'active',
          ...(category ? { 'photos.roomCategories': category } : {}),
        },
      },
      { $count: 'total' },
    ];
    const countResult = await Project.aggregate(countPipeline);
    total = countResult[0]?.total || 0;
  }

  return { photos, nextCursor, hasMore, total };
}

/**
 * Get a single photo by ID
 */
export async function getPhotoById(photoId: string): Promise<IdeasPhoto | null> {
  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return null;
  }

  const result = await Project.aggregate([
    { $unwind: '$photos' },
    { $match: { 'photos._id': new mongoose.Types.ObjectId(photoId) } },
    {
      $project: {
        id: { $toString: '$photos._id' },
        projectId: { $toString: '$_id' },
        professionalId: { $toString: '$professionalId' },
        imageUrl: '$photos.imageUrl',
        thumbnailUrl: '$photos.thumbnailUrl',
        roomCategories: '$photos.roomCategories',
        photoType: '$photos.photoType',
        caption: '$photos.caption',
        projectTitle: '$name',
        projectDescription: '$description',
        businessName: 1,
        proSlug: 1,
        proProfilePhoto: 1,
        proVerificationStatus: 1,
        saveCount: '$photos.saveCount',
        viewCount: '$photos.viewCount',
        isPublished: '$photos.isPublishedToIdeas',
        publishedAt: '$photos.publishedAt',
        createdAt: '$photos.createdAt',
      },
    },
  ]);

  if (result.length === 0) {
    return null;
  }

  // Increment view count asynchronously
  Project.updateOne(
    { 'photos._id': new mongoose.Types.ObjectId(photoId) },
    { $inc: { 'photos.$.viewCount': 1 } }
  ).exec();

  return result[0];
}

/**
 * Get related photos (same room category, excluding the current photo)
 */
export async function getRelatedPhotos(
  photoId: string,
  roomCategories: RoomCategory[],
  limit: number = 8
): Promise<IdeasPhoto[]> {
  if (roomCategories.length === 0) {
    return [];
  }

  const result = await Project.aggregate([
    { $unwind: '$photos' },
    {
      $match: {
        'photos._id': { $ne: new mongoose.Types.ObjectId(photoId) },
        'photos.isPublishedToIdeas': true,
        'photos.adminStatus': 'active',
        'photos.roomCategories': { $in: roomCategories },
      },
    },
    { $sort: { 'photos.saveCount': -1, 'photos.publishedAt': -1 } },
    { $limit: limit },
    {
      $project: {
        id: { $toString: '$photos._id' },
        projectId: { $toString: '$_id' },
        professionalId: { $toString: '$professionalId' },
        imageUrl: '$photos.imageUrl',
        thumbnailUrl: '$photos.thumbnailUrl',
        roomCategories: '$photos.roomCategories',
        photoType: '$photos.photoType',
        caption: '$photos.caption',
        projectTitle: '$name',
        projectDescription: '$description',
        businessName: 1,
        proSlug: 1,
        proProfilePhoto: 1,
        proVerificationStatus: 1,
        saveCount: '$photos.saveCount',
        viewCount: '$photos.viewCount',
        isPublished: '$photos.isPublishedToIdeas',
        publishedAt: '$photos.publishedAt',
        createdAt: '$photos.createdAt',
      },
    },
  ]);

  return result;
}

/**
 * Get other photos from the same project
 */
export async function getProjectPhotos(
  projectId: string,
  excludePhotoId: string,
  limit: number = 8
): Promise<IdeasPhoto[]> {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return [];
  }

  const project = await Project.findById(projectId).lean();
  if (!project) {
    return [];
  }

  const photos = project.photos
    .filter(
      (p) =>
        p._id.toString() !== excludePhotoId &&
        p.isPublishedToIdeas &&
        p.adminStatus === 'active'
    )
    .slice(0, limit)
    .map((p) => ({
      id: p._id.toString(),
      projectId: project._id.toString(),
      professionalId: project.professionalId.toString(),
      imageUrl: p.imageUrl,
      thumbnailUrl: p.thumbnailUrl,
      roomCategories: p.roomCategories,
      photoType: p.photoType,
      caption: p.caption,
      projectTitle: project.name,
      projectDescription: project.description,
      businessName: project.businessName,
      proSlug: project.proSlug,
      proProfilePhoto: project.proProfilePhoto,
      proVerificationStatus: project.proVerificationStatus,
      saveCount: p.saveCount,
      viewCount: p.viewCount,
      isPublished: p.isPublishedToIdeas,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
    }));

  return photos;
}

/**
 * Get category counts for the sidebar
 */
export async function getCategoryCounts(): Promise<{ category: RoomCategory; count: number }[]> {
  const result = await Project.aggregate([
    { $unwind: '$photos' },
    {
      $match: {
        'photos.isPublishedToIdeas': true,
        'photos.adminStatus': 'active',
      },
    },
    { $unwind: '$photos.roomCategories' },
    { $group: { _id: '$photos.roomCategories', count: { $sum: 1 } } },
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

  // Get the photo from Project
  const photo = await getPhotoById(photoId);
  if (!photo) {
    throw new Error('Photo not found');
  }

  // Get or create user's default "My Ideas" project
  const defaultProject = await homeProjectService.getOrCreateDefaultProject(userId);

  // Create a ProjectResource for the saved idea
  const resource = new ProjectResource({
    homeProjectId: defaultProject._id.toString(),
    homeownerId: userId,
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

  // Increment save count on the photo in Project
  await Project.updateOne(
    { 'photos._id': photoObjectId },
    { $inc: { 'photos.$.saveCount': 1 } }
  );

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

  // Decrement save count on the photo in Project
  await Project.updateOne(
    { 'photos._id': photoObjectId, 'photos.saveCount': { $gt: 0 } },
    { $inc: { 'photos.$.saveCount': -1 } }
  );
}

/**
 * Get user's saved photos
 */
export async function getUserSavedPhotos(
  userId: string,
  limit: number = 24,
  cursor?: string
): Promise<{ photos: IdeasPhoto[]; nextCursor?: string; hasMore: boolean }> {
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

  // Get the photos from Projects
  const photos: IdeasPhoto[] = [];
  for (const save of resultSaves) {
    const photo = await getPhotoById(save.photoId.toString());
    if (photo) {
      photos.push(photo);
    }
  }

  let nextCursor: string | undefined;
  if (hasMore && resultSaves.length > 0) {
    const lastSave = resultSaves[resultSaves.length - 1] as any;
    nextCursor = lastSave.createdAt.toISOString();
  }

  return { photos, nextCursor, hasMore };
}

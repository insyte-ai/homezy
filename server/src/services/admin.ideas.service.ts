import mongoose, { Types } from 'mongoose';
import { Project, IProject, IProjectPhoto } from '../models/Project.model';
import { transformLeanDoc, transformLeanDocs } from '../utils/mongoose.utils';
import type { RoomCategory, AdminPhotoStatus } from '@homezy/shared';

// ============================================================================
// Types
// ============================================================================

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

export interface ListAdminPhotosParams {
  limit?: number;
  cursor?: string;
  professionalId?: string;
  roomCategory?: RoomCategory;
  adminStatus?: AdminPhotoStatus;
  publishedToIdeas?: boolean; // Filter by Ideas publish status
  sort?: 'newest' | 'popular' | 'mostSaved';
}

export interface ListAdminPhotosResult {
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

// ============================================================================
// Admin Ideas Queries
// ============================================================================

/**
 * List all photos for admin moderation
 */
export async function listAdminPhotos(
  params: ListAdminPhotosParams
): Promise<ListAdminPhotosResult> {
  const {
    limit = 50,
    cursor,
    professionalId,
    roomCategory,
    adminStatus,
    publishedToIdeas,
    sort = 'newest',
  } = params;

  // Build match stage
  const matchStage: any = {};

  if (professionalId) {
    matchStage.professionalId = new Types.ObjectId(professionalId);
  }

  // We need to unwind photos and filter
  const pipeline: any[] = [
    { $match: matchStage },
    { $unwind: '$photos' },
  ];

  // Photo-level filters
  const photoMatch: any = {};

  if (roomCategory) {
    photoMatch['photos.roomCategories'] = roomCategory;
  }

  if (adminStatus) {
    photoMatch['photos.adminStatus'] = adminStatus;
  }

  // Filter by Ideas publish status
  if (publishedToIdeas !== undefined) {
    photoMatch['photos.isPublishedToIdeas'] = publishedToIdeas;
  }

  if (Object.keys(photoMatch).length > 0) {
    pipeline.push({ $match: photoMatch });
  }

  // Cursor-based pagination
  if (cursor) {
    const [cursorValue, cursorId] = cursor.split('_');
    if (sort === 'newest') {
      pipeline.push({
        $match: {
          $or: [
            { 'photos.createdAt': { $lt: new Date(cursorValue) } },
            {
              'photos.createdAt': new Date(cursorValue),
              'photos._id': { $lt: new Types.ObjectId(cursorId) },
            },
          ],
        },
      });
    } else if (sort === 'popular') {
      const viewCount = parseInt(cursorValue);
      pipeline.push({
        $match: {
          $or: [
            { 'photos.viewCount': { $lt: viewCount } },
            {
              'photos.viewCount': viewCount,
              'photos._id': { $lt: new Types.ObjectId(cursorId) },
            },
          ],
        },
      });
    } else if (sort === 'mostSaved') {
      const saveCount = parseInt(cursorValue);
      pipeline.push({
        $match: {
          $or: [
            { 'photos.saveCount': { $lt: saveCount } },
            {
              'photos.saveCount': saveCount,
              'photos._id': { $lt: new Types.ObjectId(cursorId) },
            },
          ],
        },
      });
    }
  }

  // Sort
  let sortStage: any;
  switch (sort) {
    case 'popular':
      sortStage = { 'photos.viewCount': -1, 'photos._id': -1 };
      break;
    case 'mostSaved':
      sortStage = { 'photos.saveCount': -1, 'photos._id': -1 };
      break;
    case 'newest':
    default:
      sortStage = { 'photos.createdAt': -1, 'photos._id': -1 };
  }
  pipeline.push({ $sort: sortStage });

  // Limit
  pipeline.push({ $limit: limit + 1 });

  // Project to final shape
  pipeline.push({
    $project: {
      id: { $concat: [{ $toString: '$_id' }, '_', { $toString: '$photos._id' }] },
      photoId: { $toString: '$photos._id' },
      projectId: { $toString: '$_id' },
      projectName: '$name',
      professionalId: { $toString: '$professionalId' },
      businessName: 1,
      proSlug: 1,
      imageUrl: '$photos.imageUrl',
      thumbnailUrl: '$photos.thumbnailUrl',
      roomCategories: '$photos.roomCategories',
      adminStatus: '$photos.adminStatus',
      isPublishedToIdeas: '$photos.isPublishedToIdeas',
      saveCount: '$photos.saveCount',
      viewCount: '$photos.viewCount',
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
    let cursorValue: string;
    switch (sort) {
      case 'popular':
        cursorValue = lastPhoto.viewCount.toString();
        break;
      case 'mostSaved':
        cursorValue = lastPhoto.saveCount.toString();
        break;
      case 'newest':
      default:
        cursorValue = new Date(lastPhoto.createdAt).toISOString();
    }
    nextCursor = `${cursorValue}_${lastPhoto.photoId}`;
  }

  // Get total count (only for first page without cursor)
  let total = 0;
  if (!cursor) {
    const countPipeline: any[] = [
      { $match: matchStage },
      { $unwind: '$photos' },
    ];
    if (Object.keys(photoMatch).length > 0) {
      countPipeline.push({ $match: photoMatch });
    }
    countPipeline.push({ $count: 'total' });

    const countResult = await Project.aggregate(countPipeline);
    total = countResult[0]?.total || 0;
  }

  return {
    photos,
    nextCursor,
    hasMore,
    total,
  };
}

/**
 * Get moderation statistics
 */
export async function getAdminIdeasStats(): Promise<AdminIdeasStats> {
  const stats = await Project.aggregate([
    { $unwind: { path: '$photos', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: null,
        totalPublished: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$photos.isPublishedToIdeas', true] },
                  { $eq: ['$photos.adminStatus', 'active'] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalFlagged: {
          $sum: { $cond: [{ $eq: ['$photos.adminStatus', 'flagged'] }, 1, 0] },
        },
        totalRemoved: {
          $sum: { $cond: [{ $eq: ['$photos.adminStatus', 'removed'] }, 1, 0] },
        },
        projectIds: { $addToSet: '$_id' },
      },
    },
    {
      $project: {
        _id: 0,
        totalPublished: 1,
        totalFlagged: 1,
        totalRemoved: 1,
        totalProjects: { $size: '$projectIds' },
      },
    },
  ]);

  return stats[0] || {
    totalPublished: 0,
    totalFlagged: 0,
    totalRemoved: 0,
    totalProjects: 0,
  };
}

/**
 * Update admin status for a photo
 */
export async function updatePhotoAdminStatus(
  projectId: string,
  photoId: string,
  adminId: string,
  status: AdminPhotoStatus,
  removalReason?: string
): Promise<boolean> {
  const updateFields: any = {
    'photos.$.adminStatus': status,
    'photos.$.updatedAt': new Date(),
  };

  if (status === 'removed') {
    updateFields['photos.$.adminRemovedAt'] = new Date();
    updateFields['photos.$.adminRemovedBy'] = new Types.ObjectId(adminId);
    if (removalReason) {
      updateFields['photos.$.adminRemovalReason'] = removalReason;
    }
  } else if (status === 'active') {
    // Clear removal info when restoring
    updateFields['photos.$.adminRemovedAt'] = null;
    updateFields['photos.$.adminRemovedBy'] = null;
    updateFields['photos.$.adminRemovalReason'] = null;
  }

  const result = await Project.updateOne(
    {
      _id: projectId,
      'photos._id': new Types.ObjectId(photoId),
    },
    { $set: updateFields }
  );

  return result.modifiedCount > 0;
}

/**
 * Get a single photo with project info for admin view
 */
export async function getAdminPhoto(
  projectId: string,
  photoId: string
): Promise<AdminIdeasPhoto | null> {
  if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(photoId)) {
    return null;
  }

  const project = await Project.findOne({
    _id: projectId,
    'photos._id': new Types.ObjectId(photoId),
  }).lean();

  if (!project) {
    return null;
  }

  const photo = project.photos.find(
    (p) => p._id.toString() === photoId
  );

  if (!photo) {
    return null;
  }

  return {
    id: `${project._id}_${photo._id}`,
    photoId: photo._id.toString(),
    projectId: project._id.toString(),
    projectName: project.name,
    professionalId: project.professionalId.toString(),
    businessName: project.businessName,
    proSlug: project.proSlug,
    imageUrl: photo.imageUrl,
    thumbnailUrl: photo.thumbnailUrl,
    roomCategories: photo.roomCategories,
    adminStatus: photo.adminStatus,
    isPublishedToIdeas: photo.isPublishedToIdeas,
    saveCount: photo.saveCount,
    viewCount: photo.viewCount,
    createdAt: photo.createdAt,
  };
}

/**
 * Bulk update admin status for multiple photos
 */
export async function bulkUpdatePhotoStatus(
  photoIds: Array<{ projectId: string; photoId: string }>,
  adminId: string,
  status: AdminPhotoStatus,
  removalReason?: string
): Promise<number> {
  let updatedCount = 0;

  for (const { projectId, photoId } of photoIds) {
    const success = await updatePhotoAdminStatus(
      projectId,
      photoId,
      adminId,
      status,
      removalReason
    );
    if (success) {
      updatedCount++;
    }
  }

  return updatedCount;
}

/**
 * Publish or unpublish a photo to Ideas
 * This controls whether the photo appears on the public Ideas page
 */
export async function setPhotoPublishToIdeas(
  projectId: string,
  photoId: string,
  adminId: string,
  publish: boolean
): Promise<boolean> {
  const updateFields: any = {
    'photos.$.isPublishedToIdeas': publish,
    'photos.$.updatedAt': new Date(),
  };

  if (publish) {
    updateFields['photos.$.publishedAt'] = new Date();
    updateFields['photos.$.publishedBy'] = new Types.ObjectId(adminId);
  } else {
    updateFields['photos.$.publishedAt'] = null;
    updateFields['photos.$.publishedBy'] = null;
  }

  const result = await Project.updateOne(
    {
      _id: projectId,
      'photos._id': new Types.ObjectId(photoId),
    },
    { $set: updateFields }
  );

  return result.modifiedCount > 0;
}

/**
 * Bulk publish/unpublish photos to Ideas
 */
export async function bulkSetPhotoPublishToIdeas(
  photoIds: Array<{ projectId: string; photoId: string }>,
  adminId: string,
  publish: boolean
): Promise<number> {
  let updatedCount = 0;

  for (const { projectId, photoId } of photoIds) {
    const success = await setPhotoPublishToIdeas(
      projectId,
      photoId,
      adminId,
      publish
    );
    if (success) {
      updatedCount++;
    }
  }

  return updatedCount;
}

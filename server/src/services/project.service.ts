import mongoose, { Types } from 'mongoose';
import { Project, IProject, IProjectPhoto } from '../models/Project.model';
import { transformLeanDoc, transformLeanDocs } from '../utils/mongoose.utils';
import type { RoomCategory } from '@homezy/shared';

// ============================================================================
// Types
// ============================================================================

export interface CreateProjectInput {
  name: string;
  description: string;
  serviceCategory: string;
  completionDate: Date;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  serviceCategory?: string;
  completionDate?: Date;
}

export interface AddPhotoInput {
  imageUrl: string;
  thumbnailUrl?: string;
  photoType?: 'main' | 'before' | 'after';
  caption?: string;
  roomCategories: RoomCategory[];
  isPublishedToIdeas?: boolean;
}

export interface UpdatePhotoInput {
  photoType?: 'main' | 'before' | 'after';
  caption?: string;
  roomCategories?: RoomCategory[];
  displayOrder?: number;
  isPublishedToIdeas?: boolean;
}

export interface ProProfileInfo {
  businessName: string;
  slug?: string;
  profilePhoto?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

// ============================================================================
// Project CRUD
// ============================================================================

/**
 * Create a new project for a professional
 */
export async function createProject(
  professionalId: string,
  proProfile: ProProfileInfo,
  input: CreateProjectInput
): Promise<IProject> {
  const project = new Project({
    professionalId: new Types.ObjectId(professionalId),
    name: input.name,
    description: input.description,
    serviceCategory: input.serviceCategory,
    completionDate: input.completionDate,
    businessName: proProfile.businessName,
    proSlug: proProfile.slug,
    proProfilePhoto: proProfile.profilePhoto,
    proVerificationStatus: proProfile.verificationStatus,
    photos: [],
  });

  await project.save();
  return project;
}

/**
 * Get a project by ID (with ownership check)
 */
export async function getProject(
  projectId: string,
  professionalId: string
): Promise<IProject | null> {
  if (!Types.ObjectId.isValid(projectId)) {
    return null;
  }

  const project = await Project.findOne({
    _id: projectId,
    professionalId: new Types.ObjectId(professionalId),
  }).lean();

  return project ? (transformLeanDoc(project) as unknown as IProject) : null;
}

/**
 * Get a project by ID (no ownership check - for public/admin access)
 */
export async function getProjectById(projectId: string): Promise<IProject | null> {
  if (!Types.ObjectId.isValid(projectId)) {
    return null;
  }

  const project = await Project.findById(projectId).lean();
  return project ? (transformLeanDoc(project) as unknown as IProject) : null;
}

/**
 * List all projects for a professional
 */
export async function listProjects(
  professionalId: string,
  options: { limit?: number; offset?: number; serviceCategory?: string } = {}
): Promise<{ projects: IProject[]; total: number }> {
  const { limit = 50, offset = 0, serviceCategory } = options;

  const query: any = { professionalId: new Types.ObjectId(professionalId) };
  if (serviceCategory) {
    query.serviceCategory = serviceCategory;
  }

  const [projects, total] = await Promise.all([
    Project.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    Project.countDocuments(query),
  ]);

  return { projects: transformLeanDocs(projects) as unknown as IProject[], total };
}

/**
 * List public projects for a professional (for public profile page)
 * Only returns projects with active photos
 */
export async function listPublicProjects(
  professionalId: string,
  options: { limit?: number } = {}
): Promise<IProject[]> {
  const { limit = 20 } = options;

  if (!Types.ObjectId.isValid(professionalId)) {
    return [];
  }

  const projects = await Project.find({
    professionalId: new Types.ObjectId(professionalId),
    'photos.0': { $exists: true }, // Only projects with at least one photo
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Filter photos to only show active ones (not removed by admin)
  const filteredProjects = projects.map((project) => ({
    ...project,
    photos: project.photos.filter((p) => p.adminStatus === 'active'),
  }));

  // Only return projects that still have photos after filtering
  return transformLeanDocs(
    filteredProjects.filter((p) => p.photos.length > 0)
  ) as unknown as IProject[];
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  professionalId: string,
  updates: UpdateProjectInput
): Promise<IProject | null> {
  const project = await Project.findOne({
    _id: projectId,
    professionalId: new Types.ObjectId(professionalId),
  });

  if (!project) {
    return null;
  }

  if (updates.name !== undefined) project.name = updates.name;
  if (updates.description !== undefined) project.description = updates.description;
  if (updates.serviceCategory !== undefined) project.serviceCategory = updates.serviceCategory;
  if (updates.completionDate !== undefined) project.completionDate = updates.completionDate;

  await project.save();
  return project;
}

/**
 * Delete a project and all its photos
 */
export async function deleteProject(
  projectId: string,
  professionalId: string
): Promise<boolean> {
  const result = await Project.deleteOne({
    _id: projectId,
    professionalId: new Types.ObjectId(professionalId),
  });

  return result.deletedCount > 0;
}

// ============================================================================
// Photo Management
// ============================================================================

/**
 * Add photos to a project
 */
export async function addPhotos(
  projectId: string,
  professionalId: string,
  photos: AddPhotoInput[]
): Promise<IProject | null> {
  const project = await Project.findOne({
    _id: projectId,
    professionalId: new Types.ObjectId(professionalId),
  });

  if (!project) {
    return null;
  }

  // Enforce max 50 photos per project
  const currentCount = project.photos.length;
  const maxPhotos = 50;
  const availableSlots = maxPhotos - currentCount;

  if (availableSlots <= 0) {
    throw new Error('Maximum 50 photos per project allowed');
  }

  const photosToAdd = photos.slice(0, availableSlots);
  const startOrder = currentCount;

  for (let i = 0; i < photosToAdd.length; i++) {
    const input = photosToAdd[i];
    const photo = {
      _id: new Types.ObjectId(),
      imageUrl: input.imageUrl,
      thumbnailUrl: input.thumbnailUrl,
      photoType: input.photoType || 'main',
      caption: input.caption,
      roomCategories: input.roomCategories || [],
      displayOrder: startOrder + i,
      isPublishedToIdeas: false, // Default unpublished - admin must approve for Ideas
      publishedAt: undefined,
      adminStatus: 'active' as const,
      saveCount: 0,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    project.photos.push(photo as any);
  }

  await project.save();

  // Re-fetch with lean and transform for proper _id -> id conversion
  const updated = await Project.findById(project._id).lean();
  return updated ? (transformLeanDoc(updated) as unknown as IProject) : null;
}

/**
 * Update a photo in a project
 */
export async function updatePhoto(
  projectId: string,
  photoId: string,
  professionalId: string,
  updates: UpdatePhotoInput
): Promise<IProject | null> {
  const project = await Project.findOne({
    _id: projectId,
    professionalId: new Types.ObjectId(professionalId),
  });

  if (!project) {
    return null;
  }

  const photo = project.photos.find((p) => p._id.toString() === photoId);
  if (!photo) {
    return null;
  }

  if (updates.photoType !== undefined) photo.photoType = updates.photoType;
  if (updates.caption !== undefined) photo.caption = updates.caption;
  if (updates.roomCategories !== undefined) photo.roomCategories = updates.roomCategories;
  if (updates.displayOrder !== undefined) photo.displayOrder = updates.displayOrder;
  if (updates.isPublishedToIdeas !== undefined) {
    photo.isPublishedToIdeas = updates.isPublishedToIdeas;
    if (updates.isPublishedToIdeas && !photo.publishedAt) {
      photo.publishedAt = new Date();
    }
  }
  photo.updatedAt = new Date();

  await project.save();

  // Re-fetch with lean and transform for proper _id -> id conversion
  const updated = await Project.findById(project._id).lean();
  return updated ? (transformLeanDoc(updated) as unknown as IProject) : null;
}

/**
 * Delete a photo from a project
 */
export async function deletePhoto(
  projectId: string,
  photoId: string,
  professionalId: string
): Promise<boolean> {
  const result = await Project.updateOne(
    {
      _id: projectId,
      professionalId: new Types.ObjectId(professionalId),
    },
    {
      $pull: { photos: { _id: new Types.ObjectId(photoId) } },
    }
  );

  return result.modifiedCount > 0;
}

/**
 * Toggle Ideas publish status for a photo
 */
export async function togglePhotoPublish(
  projectId: string,
  photoId: string,
  professionalId: string
): Promise<IProject | null> {
  const project = await Project.findOne({
    _id: projectId,
    professionalId: new Types.ObjectId(professionalId),
  });

  if (!project) {
    return null;
  }

  const photo = project.photos.find((p) => p._id.toString() === photoId);
  if (!photo) {
    return null;
  }

  photo.isPublishedToIdeas = !photo.isPublishedToIdeas;
  if (photo.isPublishedToIdeas) {
    photo.publishedAt = new Date();
  }
  photo.updatedAt = new Date();

  await project.save();

  // Re-fetch with lean and transform for proper _id -> id conversion
  const updated = await Project.findById(project._id).lean();
  return updated ? (transformLeanDoc(updated) as unknown as IProject) : null;
}

// ============================================================================
// Denormalized Pro Info Updates
// ============================================================================

/**
 * Update denormalized pro info on all projects when profile changes
 */
export async function updateProInfoOnProjects(
  professionalId: string,
  proProfile: ProProfileInfo
): Promise<void> {
  await Project.updateMany(
    { professionalId: new Types.ObjectId(professionalId) },
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

// ============================================================================
// View/Save Count Updates
// ============================================================================

/**
 * Increment view count for a photo
 */
export async function incrementPhotoViewCount(
  projectId: string,
  photoId: string
): Promise<void> {
  await Project.updateOne(
    { _id: projectId, 'photos._id': new Types.ObjectId(photoId) },
    { $inc: { 'photos.$.viewCount': 1 } }
  );
}

/**
 * Increment save count for a photo
 */
export async function incrementPhotoSaveCount(
  projectId: string,
  photoId: string
): Promise<void> {
  await Project.updateOne(
    { _id: projectId, 'photos._id': new Types.ObjectId(photoId) },
    { $inc: { 'photos.$.saveCount': 1 } }
  );
}

/**
 * Decrement save count for a photo
 */
export async function decrementPhotoSaveCount(
  projectId: string,
  photoId: string
): Promise<void> {
  await Project.updateOne(
    {
      _id: projectId,
      'photos._id': new Types.ObjectId(photoId),
      'photos.saveCount': { $gt: 0 },
    },
    { $inc: { 'photos.$.saveCount': -1 } }
  );
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get project statistics for a professional
 */
export async function getProProjectStats(professionalId: string): Promise<{
  totalProjects: number;
  totalPhotos: number;
  publishedPhotos: number;
  totalViews: number;
  totalSaves: number;
}> {
  const result = await Project.aggregate([
    { $match: { professionalId: new Types.ObjectId(professionalId) } },
    { $unwind: { path: '$photos', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        totalProjects: { $addToSet: '$_id' },
        totalPhotos: { $sum: { $cond: [{ $ifNull: ['$photos', false] }, 1, 0] } },
        publishedPhotos: {
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
        totalViews: { $sum: { $ifNull: ['$photos.viewCount', 0] } },
        totalSaves: { $sum: { $ifNull: ['$photos.saveCount', 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        totalProjects: { $size: '$totalProjects' },
        totalPhotos: 1,
        publishedPhotos: 1,
        totalViews: 1,
        totalSaves: 1,
      },
    },
  ]);

  return result[0] || {
    totalProjects: 0,
    totalPhotos: 0,
    publishedPhotos: 0,
    totalViews: 0,
    totalSaves: 0,
  };
}

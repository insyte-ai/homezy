import { Request, Response, NextFunction } from 'express';
import * as adminIdeasService from '../services/admin.ideas.service';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler.middleware';
import {
  adminListPhotosQuerySchema,
  adminUpdatePhotoStatusSchema,
} from '../schemas/project.schema';

/**
 * List all photos for admin moderation
 * GET /api/admin/ideas/photos
 */
export async function listPhotos(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = adminListPhotosQuerySchema.parse(req.query);

    const result = await adminIdeasService.listAdminPhotos({
      limit: query.limit,
      cursor: query.cursor,
      professionalId: query.professionalId,
      roomCategory: query.roomCategory,
      adminStatus: query.adminStatus,
      publishedToIdeas: query.publishedToIdeas,
      sort: query.sort,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get moderation statistics
 * GET /api/admin/ideas/stats
 */
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await adminIdeasService.getAdminIdeasStats();

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single photo for admin view
 * GET /api/admin/ideas/photos/:projectId/:photoId
 */
export async function getPhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { projectId, photoId } = req.params;

    const photo = await adminIdeasService.getAdminPhoto(projectId, photoId);
    if (!photo) {
      throw new NotFoundError('Photo not found');
    }

    res.json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update admin status for a photo
 * PATCH /api/admin/ideas/photos/:projectId/:photoId/status
 */
export async function updatePhotoStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = req.user!.id;
    const { projectId, photoId } = req.params;

    const validated = adminUpdatePhotoStatusSchema.parse(req.body);

    const success = await adminIdeasService.updatePhotoAdminStatus(
      projectId,
      photoId,
      adminId,
      validated.adminStatus,
      validated.removalReason
    );

    if (!success) {
      throw new NotFoundError('Photo not found');
    }

    res.json({
      success: true,
      message: `Photo status updated to ${validated.adminStatus}`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Bulk update admin status for multiple photos
 * POST /api/admin/ideas/photos/bulk-status
 */
export async function bulkUpdateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = req.user!.id;
    const { photos, adminStatus, removalReason } = req.body;

    if (!Array.isArray(photos) || photos.length === 0) {
      throw new BadRequestError('photos array is required');
    }

    if (photos.length > 100) {
      throw new BadRequestError('Maximum 100 photos can be updated at once');
    }

    const validated = adminUpdatePhotoStatusSchema.parse({ adminStatus, removalReason });

    const updatedCount = await adminIdeasService.bulkUpdatePhotoStatus(
      photos,
      adminId,
      validated.adminStatus,
      validated.removalReason
    );

    res.json({
      success: true,
      data: { updatedCount },
      message: `${updatedCount} photos updated to ${validated.adminStatus}`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Publish a photo to Ideas
 * POST /api/admin/ideas/photos/:projectId/:photoId/publish
 */
export async function publishPhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = req.user!.id;
    const { projectId, photoId } = req.params;

    const success = await adminIdeasService.setPhotoPublishToIdeas(
      projectId,
      photoId,
      adminId,
      true
    );

    if (!success) {
      throw new NotFoundError('Photo not found');
    }

    res.json({
      success: true,
      message: 'Photo published to Ideas',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Unpublish a photo from Ideas
 * POST /api/admin/ideas/photos/:projectId/:photoId/unpublish
 */
export async function unpublishPhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = req.user!.id;
    const { projectId, photoId } = req.params;

    const success = await adminIdeasService.setPhotoPublishToIdeas(
      projectId,
      photoId,
      adminId,
      false
    );

    if (!success) {
      throw new NotFoundError('Photo not found');
    }

    res.json({
      success: true,
      message: 'Photo unpublished from Ideas',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Bulk publish photos to Ideas
 * POST /api/admin/ideas/photos/bulk-publish
 */
export async function bulkPublish(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = req.user!.id;
    const { photos } = req.body;

    if (!Array.isArray(photos) || photos.length === 0) {
      throw new BadRequestError('photos array is required');
    }

    if (photos.length > 100) {
      throw new BadRequestError('Maximum 100 photos can be updated at once');
    }

    const updatedCount = await adminIdeasService.bulkSetPhotoPublishToIdeas(
      photos,
      adminId,
      true
    );

    res.json({
      success: true,
      data: { updatedCount },
      message: `${updatedCount} photos published to Ideas`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Bulk unpublish photos from Ideas
 * POST /api/admin/ideas/photos/bulk-unpublish
 */
export async function bulkUnpublish(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = req.user!.id;
    const { photos } = req.body;

    if (!Array.isArray(photos) || photos.length === 0) {
      throw new BadRequestError('photos array is required');
    }

    if (photos.length > 100) {
      throw new BadRequestError('Maximum 100 photos can be updated at once');
    }

    const updatedCount = await adminIdeasService.bulkSetPhotoPublishToIdeas(
      photos,
      adminId,
      false
    );

    res.json({
      success: true,
      data: { updatedCount },
      message: `${updatedCount} photos unpublished from Ideas`,
    });
  } catch (error) {
    next(error);
  }
}

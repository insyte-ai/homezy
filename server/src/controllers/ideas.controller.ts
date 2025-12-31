import { Request, Response, NextFunction } from 'express';
import * as ideasService from '../services/ideas.service';
import { NotFoundError, UnauthorizedError } from '../middleware/errorHandler.middleware';
import type { RoomCategory } from '@homezy/shared';

// ============================================================================
// Public Endpoints
// ============================================================================

/**
 * List published photos for the Ideas page
 * GET /api/ideas
 */
export async function listIdeas(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { category, sort, cursor, limit } = req.query;

    const result = await ideasService.listIdeas({
      category: category as RoomCategory,
      sort: sort as 'newest' | 'popular',
      cursor: cursor as string,
      limit: limit ? parseInt(limit as string) : undefined,
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
 * Get a single photo by ID
 * GET /api/ideas/:photoId
 */
export async function getPhotoById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { photoId } = req.params;
    const userId = req.user?.id;

    const photo = await ideasService.getPhotoById(photoId);
    if (!photo) {
      throw new NotFoundError('Photo not found');
    }

    // Get related photos and project photos
    const [relatedPhotos, projectPhotos, isSaved] = await Promise.all([
      ideasService.getRelatedPhotos(photoId, photo.roomCategories, 8),
      photo.portfolioItemId
        ? ideasService.getProjectPhotos(photo.portfolioItemId, photoId, 8)
        : Promise.resolve([]),
      userId ? ideasService.isPhotoSaved(photoId, userId) : Promise.resolve(false),
    ]);

    res.json({
      success: true,
      data: {
        photo,
        relatedPhotos,
        projectPhotos,
        isSaved,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get category counts
 * GET /api/ideas/categories
 */
export async function getCategoryCounts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await ideasService.getCategoryCounts();

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Save Functionality (Authenticated)
// ============================================================================

/**
 * Check if a photo is saved by the current user
 * GET /api/ideas/:photoId/save-status
 */
export async function getSaveStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { photoId } = req.params;

    const isSaved = await ideasService.isPhotoSaved(photoId, userId);

    res.json({
      success: true,
      data: { isSaved },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Save a photo to the user's "My Ideas"
 * POST /api/ideas/:photoId/save
 */
export async function savePhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { photoId } = req.params;

    const save = await ideasService.savePhoto(photoId, userId);

    res.status(201).json({
      success: true,
      data: { save },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Unsave a photo
 * DELETE /api/ideas/:photoId/save
 */
export async function unsavePhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { photoId } = req.params;

    await ideasService.unsavePhoto(photoId, userId);

    res.json({
      success: true,
      message: 'Photo unsaved',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's saved photos
 * GET /api/ideas/saved
 */
export async function getSavedPhotos(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { limit, cursor } = req.query;

    const result = await ideasService.getUserSavedPhotos(
      userId,
      limit ? parseInt(limit as string) : undefined,
      cursor as string
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Pro Photo Management
// ============================================================================

/**
 * Create a new portfolio photo
 * POST /api/pros/me/photos
 */
export async function createPhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;

    if (!user.proProfile) {
      throw new UnauthorizedError('Only professionals can upload photos');
    }

    const photo = await ideasService.createPhoto(
      user.id,
      {
        businessName: user.proProfile.businessName,
        slug: user.proProfile.slug,
        profilePhoto: user.profilePhoto,
        verificationStatus: user.proProfile.verificationStatus,
      },
      req.body
    );

    res.status(201).json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List professional's photos
 * GET /api/pros/me/photos
 */
export async function listMyPhotos(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { isPublished, limit, offset } = req.query;

    const result = await ideasService.listProPhotos(userId, {
      isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
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
 * Update a portfolio photo
 * PATCH /api/pros/me/photos/:photoId
 */
export async function updatePhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { photoId } = req.params;

    const photo = await ideasService.updatePhoto(photoId, userId, req.body);
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
 * Delete a portfolio photo
 * DELETE /api/pros/me/photos/:photoId
 */
export async function deletePhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { photoId } = req.params;

    const deleted = await ideasService.deletePhoto(photoId, userId);
    if (!deleted) {
      throw new NotFoundError('Photo not found');
    }

    res.json({
      success: true,
      message: 'Photo deleted',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle publish status
 * POST /api/pros/me/photos/:photoId/publish
 */
export async function togglePublish(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { photoId } = req.params;

    const photo = await ideasService.togglePublish(photoId, userId);
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

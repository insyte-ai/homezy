import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/project.service';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../middleware/errorHandler.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  addProjectPhotosSchema,
  updateProjectPhotoSchema,
  listProjectsQuerySchema,
} from '../schemas/project.schema';
import type { CreateProjectInput, AddPhotoInput } from '../services/project.service';

// ============================================================================
// Project CRUD
// ============================================================================

/**
 * Create a new project
 * POST /api/pros/me/projects
 */
export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;

    if (!user.proProfile) {
      throw new UnauthorizedError('Only professionals can create projects');
    }

    const validated = createProjectSchema.parse(req.body) as CreateProjectInput;

    const project = await projectService.createProject(
      user.id,
      {
        businessName: user.proProfile.businessName,
        slug: user.proProfile.slug,
        profilePhoto: user.profilePhoto,
        verificationStatus: user.proProfile.verificationStatus,
      },
      validated
    );

    res.status(201).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single project
 * GET /api/pros/me/projects/:projectId
 */
export async function getProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { projectId } = req.params;

    const project = await projectService.getProject(projectId, userId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    res.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List all projects for the current pro
 * GET /api/pros/me/projects
 */
export async function listProjects(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const query = listProjectsQuerySchema.parse(req.query);

    const result = await projectService.listProjects(userId, {
      limit: query.limit,
      offset: query.offset,
      serviceCategory: query.serviceCategory,
    });

    // Get stats
    const stats = await projectService.getProProjectStats(userId);

    res.json({
      success: true,
      data: {
        ...result,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a project
 * PUT /api/pros/me/projects/:projectId
 */
export async function updateProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { projectId } = req.params;

    const validated = updateProjectSchema.parse(req.body);

    const project = await projectService.updateProject(projectId, userId, validated);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    res.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a project
 * DELETE /api/pros/me/projects/:projectId
 */
export async function deleteProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { projectId } = req.params;

    const deleted = await projectService.deleteProject(projectId, userId);
    if (!deleted) {
      throw new NotFoundError('Project not found');
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Photo Management
// ============================================================================

/**
 * Add photos to a project
 * POST /api/pros/me/projects/:projectId/photos
 */
export async function addPhotos(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { projectId } = req.params;

    const validated = addProjectPhotosSchema.parse(req.body);
    const photosToAdd = validated.photos as AddPhotoInput[];

    // Get current photo count to identify newly added photos
    const existingProject = await projectService.getProject(projectId, userId);
    const existingPhotoCount = existingProject?.photos?.length || 0;

    const project = await projectService.addPhotos(projectId, userId, photosToAdd);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Extract just the newly added photos (they're appended to the end)
    const addedPhotos = project.photos.slice(existingPhotoCount);

    res.status(201).json({
      success: true,
      data: { photos: addedPhotos },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a photo in a project
 * PATCH /api/pros/me/projects/:projectId/photos/:photoId
 */
export async function updatePhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { projectId, photoId } = req.params;

    const validated = updateProjectPhotoSchema.parse(req.body);

    const project = await projectService.updatePhoto(projectId, photoId, userId, validated);
    if (!project) {
      throw new NotFoundError('Photo not found');
    }

    // Find the updated photo (photos are transformed with id, not _id)
    const photo = project.photos.find(p => (p as any).id === photoId);

    res.json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a photo from a project
 * DELETE /api/pros/me/projects/:projectId/photos/:photoId
 */
export async function deletePhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { projectId, photoId } = req.params;

    const deleted = await projectService.deletePhoto(projectId, photoId, userId);
    if (!deleted) {
      throw new NotFoundError('Photo not found');
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle Ideas publish status for a photo
 * POST /api/pros/me/projects/:projectId/photos/:photoId/toggle-publish
 */
export async function togglePhotoPublish(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { projectId, photoId } = req.params;

    const project = await projectService.togglePhotoPublish(projectId, photoId, userId);
    if (!project) {
      throw new NotFoundError('Photo not found');
    }

    // Find the toggled photo (photos are transformed with id, not _id)
    const photo = project.photos.find(p => (p as any).id === photoId);

    res.json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get project statistics for the current pro
 * GET /api/pros/me/projects/stats
 */
export async function getProjectStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const stats = await projectService.getProProjectStats(userId);

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
}

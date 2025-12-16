import { Request, Response, NextFunction } from 'express';
import * as projectResourceService from '../services/projectResource.service';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.middleware';

/**
 * Create a new project resource
 * POST /api/home-projects/:id/resources
 */
export async function createProjectResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id: projectId } = req.params;

    const resource = await projectResourceService.createProjectResource(
      projectId,
      userId,
      req.body
    );

    if (!resource) {
      throw new NotFoundError('Project not found or access denied');
    }

    res.status(201).json({
      success: true,
      data: { resource },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all resources for a project
 * GET /api/home-projects/:id/resources
 */
export async function getProjectResources(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id: projectId } = req.params;
    const { type, isFavorite, tags, search, limit, offset } = req.query;

    const result = await projectResourceService.getProjectResources(projectId, userId, {
      type: type as any,
      isFavorite: isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined,
      tags: tags ? (tags as string).split(',') : undefined,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: {
        resources: result.resources,
        total: result.total,
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a resource by ID
 * GET /api/home-projects/:id/resources/:resourceId
 */
export async function getProjectResourceById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { resourceId } = req.params;

    const resource = await projectResourceService.getProjectResourceById(resourceId, userId);

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    res.json({
      success: true,
      data: { resource },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a resource
 * PATCH /api/home-projects/:id/resources/:resourceId
 */
export async function updateProjectResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { resourceId } = req.params;

    const resource = await projectResourceService.updateProjectResource(
      resourceId,
      userId,
      req.body
    );

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    res.json({
      success: true,
      data: { resource },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a resource
 * DELETE /api/home-projects/:id/resources/:resourceId
 */
export async function deleteProjectResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { resourceId } = req.params;

    const deleted = await projectResourceService.deleteProjectResource(resourceId, userId);

    if (!deleted) {
      throw new NotFoundError('Resource not found');
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle favorite status
 * POST /api/home-projects/:id/resources/:resourceId/favorite
 */
export async function toggleFavorite(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { resourceId } = req.params;

    const resource = await projectResourceService.toggleFavorite(resourceId, userId);

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    res.json({
      success: true,
      data: { resource },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Move resource to another project
 * POST /api/home-projects/:id/resources/:resourceId/move
 */
export async function moveResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { resourceId } = req.params;
    const { targetProjectId } = req.body;

    const resource = await projectResourceService.moveResourceToProject(
      resourceId,
      userId,
      targetProjectId
    );

    if (!resource) {
      throw new NotFoundError('Resource not found or access denied to target project');
    }

    res.json({
      success: true,
      data: { resource },
      message: 'Resource moved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Copy resource to another project
 * POST /api/home-projects/:id/resources/:resourceId/copy
 */
export async function copyResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { resourceId } = req.params;
    const { targetProjectId } = req.body;

    const resource = await projectResourceService.copyResourceToProject(
      resourceId,
      userId,
      targetProjectId
    );

    if (!resource) {
      throw new NotFoundError('Resource not found or access denied to target project');
    }

    res.status(201).json({
      success: true,
      data: { resource },
      message: 'Resource copied successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get resource counts by type
 * GET /api/home-projects/:id/resources/counts
 */
export async function getResourceCounts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id: projectId } = req.params;

    const counts = await projectResourceService.getResourcesByType(projectId, userId);

    res.json({
      success: true,
      data: { counts },
    });
  } catch (error) {
    next(error);
  }
}

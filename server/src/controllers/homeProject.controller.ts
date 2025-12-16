import { Request, Response, NextFunction } from 'express';
import * as homeProjectService from '../services/homeProject.service';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.middleware';

// ============================================================================
// Project CRUD
// ============================================================================

/**
 * Create a new home project
 * POST /api/home-projects
 */
export async function createHomeProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const project = await homeProjectService.createHomeProject(userId, req.body);

    res.status(201).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all home projects for the authenticated user
 * GET /api/home-projects
 */
export async function getMyHomeProjects(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { status, category, isDefault, includeCollaborated, limit, offset } = req.query;

    const result = await homeProjectService.getHomeownerProjects(userId, {
      status: status as any,
      category: category as string,
      isDefault: isDefault === 'true' ? true : isDefault === 'false' ? false : undefined,
      includeCollaborated: includeCollaborated !== 'false',
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: {
        projects: result.projects,
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
 * Get a home project by ID
 * GET /api/home-projects/:id
 */
export async function getHomeProjectById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await homeProjectService.getHomeProjectById(id);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check authorization (owner or accepted collaborator)
    const isOwner = project.homeownerId === userId;
    const isCollaborator = project.collaborators.some(
      c => c.userId === userId && c.status === 'accepted'
    );

    if (!isOwner && !isCollaborator) {
      throw new ForbiddenError('You do not have access to this project');
    }

    res.json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get or create the default "My Ideas" project
 * GET /api/home-projects/default
 */
export async function getDefaultProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const project = await homeProjectService.getOrCreateDefaultProject(userId);

    res.json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a home project
 * PATCH /api/home-projects/:id
 */
export async function updateHomeProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await homeProjectService.updateHomeProject(id, userId, req.body);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    res.json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a home project
 * DELETE /api/home-projects/:id
 */
export async function deleteHomeProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await homeProjectService.deleteHomeProject(id, userId);

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
// Task Management
// ============================================================================

/**
 * Add a task to a project
 * POST /api/home-projects/:id/tasks
 */
export async function addTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await homeProjectService.addTask(id, userId, req.body);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    res.status(201).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a task
 * PATCH /api/home-projects/:id/tasks/:taskId
 */
export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id, taskId } = req.params;

    const project = await homeProjectService.updateTask(id, userId, taskId, req.body);

    if (!project) {
      throw new NotFoundError('Project or task not found');
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
 * Delete a task
 * DELETE /api/home-projects/:id/tasks/:taskId
 */
export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id, taskId } = req.params;

    const project = await homeProjectService.deleteTask(id, userId, taskId);

    if (!project) {
      throw new NotFoundError('Project or task not found');
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
 * Reorder tasks (for drag-drop)
 * PATCH /api/home-projects/:id/tasks/reorder
 */
export async function reorderTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await homeProjectService.reorderTasks(id, userId, req.body.tasks);

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

// ============================================================================
// Cost Item Management
// ============================================================================

/**
 * Add a cost item to a project
 * POST /api/home-projects/:id/costs
 */
export async function addCostItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await homeProjectService.addCostItem(id, userId, req.body);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    res.status(201).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a cost item
 * PATCH /api/home-projects/:id/costs/:costId
 */
export async function updateCostItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id, costId } = req.params;

    const project = await homeProjectService.updateCostItem(id, userId, costId, req.body);

    if (!project) {
      throw new NotFoundError('Project or cost item not found');
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
 * Delete a cost item
 * DELETE /api/home-projects/:id/costs/:costId
 */
export async function deleteCostItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id, costId } = req.params;

    const project = await homeProjectService.deleteCostItem(id, userId, costId);

    if (!project) {
      throw new NotFoundError('Project or cost item not found');
    }

    res.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Milestone Management
// ============================================================================

/**
 * Add a milestone to a project
 * POST /api/home-projects/:id/milestones
 */
export async function addMilestone(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await homeProjectService.addMilestone(id, userId, req.body);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    res.status(201).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a milestone
 * PATCH /api/home-projects/:id/milestones/:milestoneId
 */
export async function updateMilestone(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id, milestoneId } = req.params;

    const project = await homeProjectService.updateMilestone(id, userId, milestoneId, req.body);

    if (!project) {
      throw new NotFoundError('Project or milestone not found');
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
 * Delete a milestone
 * DELETE /api/home-projects/:id/milestones/:milestoneId
 */
export async function deleteMilestone(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id, milestoneId } = req.params;

    const project = await homeProjectService.deleteMilestone(id, userId, milestoneId);

    if (!project) {
      throw new NotFoundError('Project or milestone not found');
    }

    res.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Collaboration
// ============================================================================

/**
 * Invite a collaborator to a project
 * POST /api/home-projects/:id/collaborators/invite
 */
export async function inviteCollaborator(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await homeProjectService.inviteCollaborator(id, userId, req.body);

    if (!result) {
      throw new NotFoundError('Project not found');
    }

    // TODO: Send invite email with token
    // For now, just return the project (token should be sent via email, not in response)

    res.status(201).json({
      success: true,
      data: { project: result.project },
      message: 'Collaborator invited successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Accept a collaboration invite
 * POST /api/home-projects/accept-invite/:token
 */
export async function acceptInvite(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const { token } = req.params;

    const project = await homeProjectService.acceptCollaboratorInvite(token, userId, userEmail);

    if (!project) {
      throw new NotFoundError('Invalid or expired invite');
    }

    res.json({
      success: true,
      data: { project },
      message: 'Successfully joined the project',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove a collaborator from a project
 * DELETE /api/home-projects/:id/collaborators/:userId
 */
export async function removeCollaborator(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const currentUserId = req.user!.id;
    const { id, userId: collaboratorUserId } = req.params;

    const project = await homeProjectService.removeCollaborator(id, currentUserId, collaboratorUserId);

    if (!project) {
      throw new NotFoundError('Project or collaborator not found');
    }

    res.json({
      success: true,
      data: { project },
      message: 'Collaborator removed successfully',
    });
  } catch (error) {
    next(error);
  }
}

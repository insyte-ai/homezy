import { Request, Response } from 'express';
import * as projectService from '../services/project.service';
import { getProjectByLeadId } from '../services/project.service';

/**
 * Get projects for the authenticated homeowner
 */
export async function getMyProjects(req: Request, res: Response) {
  try {
    const userId = req.user!._id.toString();
    const { status, limit, page } = req.query;

    const result = await projectService.getHomeownerProjects(userId, {
      status: status as projectService.ProjectStatus,
      limit: limit ? parseInt(limit as string) : 20,
      skip: page ? (parseInt(page as string) - 1) * (limit ? parseInt(limit as string) : 20) : 0,
    });

    res.json({
      success: true,
      projects: result.projects,
      pagination: {
        total: result.total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch projects',
    });
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(req: Request, res: Response) {
  try {
    const userId = req.user!._id.toString();
    const { projectId } = req.params;

    const project = await projectService.getProjectById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Verify user is part of the project
    if (project.homeownerId !== userId && project.professionalId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project',
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch project',
    });
  }
}

/**
 * Get project by lead ID
 */
export async function getProjectByLead(req: Request, res: Response) {
  try {
    const userId = req.user!._id.toString();
    const { leadId } = req.params;

    const project = await getProjectByLeadId(leadId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found for this lead',
      });
    }

    // Verify user is part of the project
    if (project.homeownerId !== userId && project.professionalId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project',
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch project',
    });
  }
}

/**
 * Update project status
 */
export async function updateStatus(req: Request, res: Response) {
  try {
    const userId = req.user!._id.toString();
    const { projectId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const validStatuses = ['planning', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const project = await projectService.updateProjectStatus(projectId, userId, {
      status,
      completedAt: status === 'completed' ? new Date() : undefined,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      project,
      message: `Project status updated to ${status}`,
    });
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('Cannot transition')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update project status',
    });
  }
}

import { Request, Response } from 'express';
import * as jobService from '../services/job.service';
import { getJobByLeadId } from '../services/job.service';

/**
 * Get jobs for the authenticated homeowner
 */
export async function getMyJobs(req: Request, res: Response) {
  try {
    const userId = req.user!._id.toString();
    const { status, limit, page } = req.query;

    const result = await jobService.getHomeownerJobs(userId, {
      status: status as jobService.JobStatus,
      limit: limit ? parseInt(limit as string) : 20,
      skip: page ? (parseInt(page as string) - 1) * (limit ? parseInt(limit as string) : 20) : 0,
    });

    res.json({
      success: true,
      jobs: result.jobs,
      pagination: {
        total: result.total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch jobs',
    });
  }
}

/**
 * Get a single job by ID
 */
export async function getJob(req: Request, res: Response) {
  try {
    const userId = req.user!._id.toString();
    const { jobId } = req.params;

    const job = await jobService.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Verify user is part of the job
    if (job.homeownerId !== userId && job.professionalId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this job',
      });
    }

    res.json({
      success: true,
      job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch job',
    });
  }
}

/**
 * Get job by lead ID
 */
export async function getJobByLead(req: Request, res: Response) {
  try {
    const userId = req.user!._id.toString();
    const { leadId } = req.params;

    const job = await getJobByLeadId(leadId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found for this lead',
      });
    }

    // Verify user is part of the job
    if (job.homeownerId !== userId && job.professionalId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this job',
      });
    }

    res.json({
      success: true,
      job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch job',
    });
  }
}

/**
 * Update job status
 */
export async function updateStatus(req: Request, res: Response) {
  try {
    const userId = req.user!._id.toString();
    const { jobId } = req.params;
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

    const job = await jobService.updateJobStatus(jobId, userId, {
      status,
      completedAt: status === 'completed' ? new Date() : undefined,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.json({
      success: true,
      job,
      message: `Job status updated to ${status}`,
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
      message: error.message || 'Failed to update job status',
    });
  }
}

import { Request, Response } from 'express';
import * as leadService from '../services/lead.service';
import { logger } from '../utils/logger';
import type {
  CreateLeadInput,
  UpdateLeadInput,
  GetLeadsInput,
  GetMyLeadsInput,
  GetMyClaimedLeadsInput,
  CancelLeadInput,
} from '../schemas/lead.schema';

/**
 * Create a new lead
 * @route POST /api/v1/leads
 * @access Private (Homeowner only)
 */
export const createLead = async (
  req: Request<{}, {}, CreateLeadInput>,
  res: Response
): Promise<void> => {
  const homeownerId = (req.user!._id as any).toString();
  const data = req.body;

  const lead = await leadService.createLead(homeownerId, data);

  res.status(201).json({
    success: true,
    message: 'Lead created successfully',
    data: {
      lead,
    },
  });
};

/**
 * Get lead by ID
 * @route GET /api/v1/leads/:id
 * @access Public (limited details) / Private (full details if claimed or owner)
 */
export const getLeadById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user ? (req.user._id as any).toString() : undefined;

  const result = await leadService.getLeadById(id, userId);

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Update lead
 * @route PATCH /api/v1/leads/:id
 * @access Private (Homeowner only - own leads)
 */
export const updateLead = async (
  req: Request<{ id: string }, {}, UpdateLeadInput>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const homeownerId = (req.user!._id as any).toString();
  const data = req.body;

  const lead = await leadService.updateLead(id, homeownerId, data);

  res.status(200).json({
    success: true,
    message: 'Lead updated successfully',
    data: {
      lead,
    },
  });
};

/**
 * Cancel lead
 * @route POST /api/v1/leads/:id/cancel
 * @access Private (Homeowner only - own leads)
 */
export const cancelLead = async (
  req: Request<{ id: string }, {}, CancelLeadInput>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const homeownerId = (req.user!._id as any).toString();
  const { reason } = req.body;

  const lead = await leadService.cancelLead(id, homeownerId, reason);

  res.status(200).json({
    success: true,
    message: 'Lead cancelled successfully. Credits have been refunded to professionals who claimed it.',
    data: {
      lead,
    },
  });
};

/**
 * Browse leads (marketplace)
 * @route GET /api/v1/leads/marketplace
 * @access Public (optionally authenticated for claim status)
 */
export const browseLeads = async (
  req: Request<{}, {}, {}, GetLeadsInput>,
  res: Response
): Promise<void> => {
  const filters = req.query;
  const professionalId = req.user ? (req.user._id as any).toString() : undefined;

  const result = await leadService.browseLeads(filters, professionalId);

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Get my leads (homeowner view)
 * @route GET /api/v1/leads/my-leads
 * @access Private (Homeowner only)
 */
export const getMyLeads = async (
  req: Request<{}, {}, {}, GetMyLeadsInput>,
  res: Response
): Promise<void> => {
  const homeownerId = (req.user!._id as any).toString();
  const options = req.query;

  const result = await leadService.getMyLeads(homeownerId, options);

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Get my claimed leads (professional view)
 * @route GET /api/v1/leads/my-claims
 * @access Private (Professional only)
 */
export const getMyClaimedLeads = async (
  req: Request<{}, {}, {}, GetMyClaimedLeadsInput>,
  res: Response
): Promise<void> => {
  const professionalId = (req.user!._id as any).toString();
  const options = req.query;

  const result = await leadService.getMyClaimedLeads(professionalId, options);

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Claim a lead
 * @route POST /api/v1/leads/:id/claim
 * @access Private (Professional only)
 */
export const claimLead = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const professionalId = (req.user!._id as any).toString();

  const result = await leadService.claimLead(id, professionalId);

  logger.info('Lead claimed successfully', {
    leadId: id,
    professionalId,
    creditsCost: result.creditsCost,
  });

  res.status(200).json({
    success: true,
    message: `Lead claimed successfully. ${result.creditsCost} credits deducted from your balance.`,
    data: result,
  });
};

/**
 * Get claims for a lead (homeowner view)
 * @route GET /api/v1/leads/:id/claims
 * @access Private (Homeowner only - own leads)
 */
export const getClaimsForLead = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const homeownerId = (req.user!._id as any).toString();

  const claims = await leadService.getClaimsForLead(id, homeownerId);

  res.status(200).json({
    success: true,
    data: {
      claims,
    },
  });
};

export default {
  createLead,
  getLeadById,
  updateLead,
  cancelLead,
  browseLeads,
  getMyLeads,
  getMyClaimedLeads,
  claimLead,
  getClaimsForLead,
};

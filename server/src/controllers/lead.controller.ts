import { Request, Response } from 'express';
import * as leadService from '../services/lead.service';
import * as directLeadService from '../services/directLead.service';
import * as guestLeadService from '../services/guestLead.service';
import { leadContentGenerator } from '../services/lead-content-generator.service';
import { logger } from '../utils/logger';
import type {
  CreateLeadInput,
  UpdateLeadInput,
  GetLeadsInput,
  GetMyLeadsInput,
  GetMyClaimedLeadsInput,
  CancelLeadInput,
  CreateDirectLeadInput,
  GetMyDirectLeadsInput,
  DeclineDirectLeadInput,
  CreateGuestLeadInput,
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
  const { photos, ...data } = req.body;

  // Convert photo URLs to attachments
  if (photos && photos.length > 0) {
    const photoAttachments = photos.map((url, index) => ({
      id: `photo-${Date.now()}-${index}`,
      type: 'image' as const,
      url,
      filename: `photo-${index + 1}.jpg`,
      size: 0, // Size not tracked for Cloudinary uploads
      uploadedAt: new Date(),
    }));

    data.attachments = [...(data.attachments || []), ...photoAttachments];
  }

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

/**
 * Create a direct lead (sent to specific professional)
 * @route POST /api/v1/leads/direct
 * @access Private (Homeowner only)
 */
export const createDirectLead = async (
  req: Request<{}, {}, CreateDirectLeadInput>,
  res: Response
): Promise<void> => {
  const homeownerId = (req.user!._id as any).toString();
  const { professionalId, photos, ...data } = req.body;

  // Convert photo URLs to attachments
  if (photos && photos.length > 0) {
    const photoAttachments = photos.map((url, index) => ({
      id: `photo-${Date.now()}-${index}`,
      type: 'image' as const,
      url,
      filename: `photo-${index + 1}.jpg`,
      size: 0,
      uploadedAt: new Date(),
    }));

    data.attachments = [...(data.attachments || []), ...photoAttachments];
  }

  const lead = await directLeadService.createDirectLead(homeownerId, professionalId, data);

  logger.info('Direct lead created', {
    leadId: lead._id,
    homeownerId,
    professionalId,
    category: data.category,
  });

  res.status(201).json({
    success: true,
    message: 'Direct lead sent successfully to the professional',
    data: {
      lead,
    },
  });
};

/**
 * Get my direct leads (professional view)
 * @route GET /api/v1/leads/my-direct-leads
 * @access Private (Professional only)
 */
export const getMyDirectLeads = async (
  req: Request<{}, {}, {}, GetMyDirectLeadsInput>,
  res: Response
): Promise<void> => {
  const professionalId = (req.user!._id as any).toString();
  const { status } = req.query;

  const leads = await directLeadService.getMyDirectLeads(professionalId, status);

  res.status(200).json({
    success: true,
    data: {
      leads,
      total: leads.length,
    },
  });
};

/**
 * Accept a direct lead
 * @route POST /api/v1/leads/:id/accept-direct
 * @access Private (Professional only - target professional)
 */
export const acceptDirectLead = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const professionalId = (req.user!._id as any).toString();

  const result = await directLeadService.acceptDirectLead(id, professionalId);

  logger.info('Direct lead accepted', {
    leadId: id,
    professionalId,
    creditCost: result.claim.creditsCost,
  });

  res.status(200).json({
    success: true,
    message: `Direct lead accepted successfully. ${result.claim.creditsCost} credits deducted from your balance.`,
    data: result,
  });
};

/**
 * Decline a direct lead
 * @route POST /api/v1/leads/:id/decline-direct
 * @access Private (Professional only - target professional)
 */
export const declineDirectLead = async (
  req: Request<{ id: string }, {}, DeclineDirectLeadInput>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const professionalId = (req.user!._id as any).toString();
  const { reason } = req.body;

  const lead = await directLeadService.declineDirectLead(id, professionalId, reason);

  logger.info('Direct lead declined', {
    leadId: id,
    professionalId,
    reason,
  });

  res.status(200).json({
    success: true,
    message: 'Direct lead declined. It has been converted to a public marketplace lead.',
    data: {
      lead,
    },
  });
};

/**
 * Generate AI-powered title and description from questionnaire answers
 * @route POST /api/v1/leads/generate-content
 * @access Public (Optional auth - works for both authenticated and guest users)
 */
export const generateLeadContent = async (
  req: Request<{}, {}, any>,
  res: Response
): Promise<void> => {
  try {
    const { serviceId, serviceName, answers, emirate } = req.body;

    logger.info('Generating lead content', {
      userId: req.user ? (req.user._id as any).toString() : 'guest',
      serviceId,
      answerCount: answers?.length || 0,
    });

    // Validate input
    if (!serviceId || !serviceName || !answers || !Array.isArray(answers)) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: serviceId, serviceName, and answers array are required',
      });
      return;
    }

    // Generate content using AI
    const generatedContent = await leadContentGenerator.generateContent({
      serviceId,
      serviceName,
      answers,
      emirate,
    });

    res.status(200).json({
      success: true,
      message: 'Content generated successfully',
      data: generatedContent,
    });
  } catch (error: any) {
    logger.error('Failed to generate lead content', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: error.message,
    });
  }
};

/**
 * Send direct leads to selected professionals
 * @route POST /api/v1/leads/send-to-pros
 * @access Private (Homeowner only)
 */
export const sendDirectLeadsToSelectedPros = async (
  req: Request<{}, {}, any>,
  res: Response
): Promise<void> => {
  try {
    const { leadId, professionalIds } = req.body;
    const homeownerId = (req.user!._id as any).toString();

    logger.info('Sending direct leads to selected pros', {
      userId: homeownerId,
      leadId,
      professionalCount: professionalIds?.length || 0,
    });

    // Validate input
    if (!leadId || !professionalIds || !Array.isArray(professionalIds) || professionalIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: leadId and professionalIds array are required',
      });
      return;
    }

    // Verify the lead belongs to the user
    const originalLead = await leadService.getLeadById(leadId, homeownerId);
    if (!originalLead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found or access denied',
      });
      return;
    }

    // Create direct leads for each selected professional
    const directLeads = [];
    for (const targetProId of professionalIds) {
      try {
        const directLead = await directLeadService.createDirectLead(
          homeownerId,
          targetProId,
          originalLead as any
        );
        directLeads.push(directLead);
      } catch (error: any) {
        logger.error(`Failed to create direct lead for pro ${targetProId}`, {
          error: error.message,
        });
        // Continue with other pros even if one fails
      }
    }

    res.status(200).json({
      success: true,
      message: `Direct leads sent to ${directLeads.length} professional(s)`,
      data: {
        sentCount: directLeads.length,
        directLeads,
      },
    });
  } catch (error: any) {
    logger.error('Failed to send direct leads', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to send direct leads',
      error: error.message,
    });
  }
};

/**
 * Create a guest lead (unauthenticated user)
 * Handles user creation + lead creation atomically
 * @route POST /api/v1/leads/guest
 * @access Public (rate limited)
 */
export const createGuestLead = async (
  req: Request<{}, {}, CreateGuestLeadInput>,
  res: Response
): Promise<void> => {
  const result = await guestLeadService.createGuestLead(req.body);

  logger.info('Guest lead created successfully', {
    leadId: result.lead._id,
    userId: result.user._id,
    isNewUser: result.isNewUser,
    isDirectLead: !!req.body.targetProfessionalId,
  });

  res.status(201).json({
    success: true,
    message: result.isNewUser
      ? 'Request created! Check your email to set up your account.'
      : 'Request created! Check your email for a login link.',
    data: {
      leadId: result.lead._id,
      isNewUser: result.isNewUser,
      email: result.user.email,
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
  createDirectLead,
  getMyDirectLeads,
  acceptDirectLead,
  declineDirectLead,
  generateLeadContent,
  sendDirectLeadsToSelectedPros,
  createGuestLead,
};

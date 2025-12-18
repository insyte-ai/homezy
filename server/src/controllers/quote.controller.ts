import { Request, Response } from 'express';
import * as quoteService from '../services/quote.service';
import { logger } from '../utils/logger';
import { notificationService } from '../services/notification.service';
import { Lead } from '../models/Lead.model';
import { User } from '../models/User.model';
import type {
  SubmitQuoteInput,
  UpdateQuoteInput,
  AcceptQuoteInput,
  DeclineQuoteInput,
  GetQuotesForLeadInput,
  GetMyQuotesInput,
} from '../schemas/quote.schema';

/**
 * Submit a quote for a lead
 * @route POST /api/v1/leads/:leadId/quotes
 * @access Private (Professional only - must have claimed lead)
 */
export const submitQuote = async (
  req: Request<{ leadId: string }, {}, SubmitQuoteInput>,
  res: Response
): Promise<void> => {
  const { leadId } = req.params;
  const professionalId = (req.user!._id as any).toString();
  const data = req.body;

  const quote = await quoteService.submitQuote(leadId, professionalId, data);

  logger.info('Quote submitted successfully', {
    quoteId: quote._id,
    leadId,
    professionalId,
    total: quote.pricing.total,
  });

  // Notify homeowner of new quote (fire and forget)
  (async () => {
    try {
      const [lead, professional] = await Promise.all([
        Lead.findById(leadId).select('homeownerId').lean(),
        User.findById(professionalId).select('firstName lastName proProfile.businessName').lean(),
      ]);

      if (lead && professional) {
        const proName = (professional as any).proProfile?.businessName
          || `${(professional as any).firstName || ''} ${(professional as any).lastName || ''}`.trim()
          || 'A professional';
        notificationService.notifyHomeownerQuoteReceived(
          (lead as any).homeownerId.toString(),
          leadId,
          proName
        );
      }
    } catch (error) {
      logger.error('Failed to send quote notification', { error, leadId, professionalId });
    }
  })();

  res.status(201).json({
    success: true,
    message: 'Quote submitted successfully',
    data: {
      quote,
    },
  });
};

/**
 * Update quote
 * @route PATCH /api/v1/quotes/:id
 * @access Private (Professional only - own quotes, before acceptance)
 */
export const updateQuote = async (
  req: Request<{ id: string }, {}, UpdateQuoteInput>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const professionalId = (req.user!._id as any).toString();
  const data = req.body;

  const quote = await quoteService.updateQuote(id, professionalId, data);

  res.status(200).json({
    success: true,
    message: 'Quote updated successfully',
    data: {
      quote,
    },
  });
};

/**
 * Get quote by ID
 * @route GET /api/v1/quotes/:id
 * @access Private (Homeowner of lead or Professional who submitted)
 */
export const getQuoteById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = (req.user!._id as any).toString();

  const quote = await quoteService.getQuoteById(id, userId);

  res.status(200).json({
    success: true,
    data: {
      quote,
    },
  });
};

/**
 * Get all quotes for a lead
 * @route GET /api/v1/leads/:leadId/quotes
 * @access Private (Homeowner only - own leads)
 */
export const getQuotesForLead = async (
  req: Request<{ leadId: string }, {}, {}, GetQuotesForLeadInput>,
  res: Response
): Promise<void> => {
  const { leadId } = req.params;
  const homeownerId = (req.user!._id as any).toString();
  const options = req.query;

  const result = await quoteService.getQuotesForLead(leadId, homeownerId, options);

  res.status(200).json({
    success: true,
    data: {
      quotes: result.quotes,
      count: result.quotes.length,
    },
  });
};

/**
 * Get my quote for a specific lead
 * @route GET /api/v1/leads/:leadId/my-quote
 * @access Private (Professional only - must have claimed lead)
 */
export const getMyQuoteForLead = async (
  req: Request<{ leadId: string }>,
  res: Response
): Promise<void> => {
  const { leadId } = req.params;
  const professionalId = (req.user!._id as any).toString();

  const quote = await quoteService.getMyQuoteForLead(leadId, professionalId);

  res.status(200).json({
    success: true,
    data: {
      quote,
    },
  });
};

/**
 * Get my quotes (professional view)
 * @route GET /api/v1/quotes/my-quotes
 * @access Private (Professional only)
 */
export const getMyQuotes = async (
  req: Request<{}, {}, {}, GetMyQuotesInput>,
  res: Response
): Promise<void> => {
  const professionalId = (req.user!._id as any).toString();
  const options = req.query;

  const result = await quoteService.getMyQuotes(professionalId, options);

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Accept quote
 * @route POST /api/v1/quotes/:id/accept
 * @access Private (Homeowner only - owner of lead)
 */
export const acceptQuote = async (
  req: Request<{ id: string }, {}, AcceptQuoteInput>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const homeownerId = (req.user!._id as any).toString();
  const { notes } = req.body;

  const quote = await quoteService.acceptQuote(id, homeownerId, notes);

  logger.info('Quote accepted', {
    quoteId: id,
    homeownerId,
    professionalId: quote.professionalId,
  });

  // Notify pro of quote acceptance (fire and forget)
  (async () => {
    try {
      const [lead, homeowner] = await Promise.all([
        Lead.findById(quote.leadId).select('title').lean(),
        User.findById(homeownerId).select('firstName lastName').lean(),
      ]);

      if (lead) {
        const homeownerName = homeowner
          ? `${(homeowner as any).firstName || ''} ${(homeowner as any).lastName || ''}`.trim() || 'A homeowner'
          : 'A homeowner';
        notificationService.notifyProQuoteAccepted(
          quote.professionalId.toString(),
          quote.leadId.toString(),
          (lead as any).title,
          homeownerName
        );
      }
    } catch (error) {
      logger.error('Failed to send quote accepted notification', { error, quoteId: id });
    }
  })();

  res.status(200).json({
    success: true,
    message: 'Quote accepted successfully. All other pending quotes have been declined.',
    data: {
      quote,
    },
  });
};

/**
 * Decline quote
 * @route POST /api/v1/quotes/:id/decline
 * @access Private (Homeowner only - owner of lead)
 */
export const declineQuote = async (
  req: Request<{ id: string }, {}, DeclineQuoteInput>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const homeownerId = (req.user!._id as any).toString();
  const { reason } = req.body;

  const quote = await quoteService.declineQuote(id, homeownerId, reason);

  // Notify pro of quote decline (fire and forget)
  (async () => {
    try {
      const lead = await Lead.findById(quote.leadId).select('title').lean();
      if (lead) {
        notificationService.notifyProQuoteRejected(
          quote.professionalId.toString(),
          quote.leadId.toString(),
          (lead as any).title,
          reason
        );
      }
    } catch (error) {
      logger.error('Failed to send quote declined notification', { error, quoteId: id });
    }
  })();

  res.status(200).json({
    success: true,
    message: 'Quote declined successfully',
    data: {
      quote,
    },
  });
};

/**
 * Delete quote
 * @route DELETE /api/v1/quotes/:id
 * @access Private (Professional only - own quotes, before acceptance)
 */
export const deleteQuote = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const professionalId = (req.user!._id as any).toString();

  await quoteService.deleteQuote(id, professionalId);

  res.status(200).json({
    success: true,
    message: 'Quote deleted successfully',
  });
};

export default {
  submitQuote,
  updateQuote,
  getQuoteById,
  getQuotesForLead,
  getMyQuoteForLead,
  getMyQuotes,
  acceptQuote,
  declineQuote,
  deleteQuote,
};

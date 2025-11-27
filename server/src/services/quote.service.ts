import { Quote, IQuote } from '../models/Quote.model';
import { Lead } from '../models/Lead.model';
import { LeadClaim } from '../models/Lead.model';
import { User } from '../models/User.model';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import type { SubmitQuoteInput, UpdateQuoteInput } from '../schemas/quote.schema';
import { createProjectFromQuote } from './project.service';

/**
 * Quote Service
 * Handles all quote-related business logic
 */

/**
 * Submit a quote for a lead
 */
export const submitQuote = async (leadId: string, professionalId: string, data: SubmitQuoteInput) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Verify lead exists
    const lead = await Lead.findById(leadId).session(session);
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Verify professional has claimed this lead
    const claim = await LeadClaim.findOne({
      leadId,
      professionalId,
    }).session(session);

    if (!claim) {
      throw new ForbiddenError('You must claim this lead before submitting a quote');
    }

    // Check if quote already exists
    const existingQuote = await Quote.findOne({
      leadId,
      professionalId,
    }).session(session);

    if (existingQuote) {
      throw new BadRequestError('You have already submitted a quote for this lead');
    }

    // Verify professional is verified
    const professional = await User.findById(professionalId).session(session);
    if (!professional || professional.role !== 'pro') {
      throw new ForbiddenError('Only professionals can submit quotes');
    }

    const verificationStatus = professional.proProfile?.verificationStatus;
    if (verificationStatus !== 'approved') {
      throw new ForbiddenError('You must be verified to submit quotes');
    }

    // Generate IDs for items if not provided
    const itemsWithIds = data.items.map(item => ({
      ...item,
      id: item.id || nanoid(10),
    }));

    // Create quote
    const quote = await Quote.create(
      [
        {
          leadId,
          professionalId,
          status: 'pending',
          estimatedStartDate: data.estimatedStartDate,
          estimatedCompletionDate: data.estimatedCompletionDate,
          estimatedDurationDays: data.estimatedDurationDays,
          items: itemsWithIds,
          subtotal: data.subtotal,
          vat: data.vat,
          total: data.total,
          approach: data.approach,
          warranty: data.warranty,
          attachments: data.attachments || [],
          questions: data.questions,
        },
      ],
      { session }
    );

    // Update claim to mark quote as submitted
    claim.quoteSubmitted = true;
    claim.quoteSubmittedAt = new Date();
    await claim.save({ session });

    // Update lead status to 'quoted' if not already
    if (lead.status !== 'quoted' && lead.status !== 'accepted') {
      lead.status = 'quoted';
      await lead.save({ session });
    }

    await session.commitTransaction();

    logger.info('Quote submitted', {
      quoteId: quote[0]._id,
      leadId,
      professionalId,
      total: data.total,
    });

    return quote[0];
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to submit quote', error, { leadId, professionalId });
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Update quote (before acceptance, professional only)
 */
export const updateQuote = async (quoteId: string, professionalId: string, data: UpdateQuoteInput) => {
  const quote = await Quote.findById(quoteId);

  if (!quote) {
    throw new NotFoundError('Quote not found');
  }

  if (quote.professionalId !== professionalId) {
    throw new ForbiddenError('You can only update your own quotes');
  }

  if (quote.status !== 'pending') {
    throw new BadRequestError('Cannot update quote after it has been accepted or declined');
  }

  // Update quote
  Object.assign(quote, data);
  await quote.save();

  logger.info('Quote updated', {
    quoteId,
    professionalId,
    updates: Object.keys(data),
  });

  return quote;
};

/**
 * Get quote by ID
 */
export const getQuoteById = async (quoteId: string, userId: string) => {
  const quote = await Quote.findById(quoteId).lean();

  if (!quote) {
    throw new NotFoundError('Quote not found');
  }

  // Verify user has access to this quote
  const lead = await Lead.findById(quote.leadId);
  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  const isHomeowner = lead.homeownerId === userId;
  const isProfessional = quote.professionalId === userId;

  if (!isHomeowner && !isProfessional) {
    throw new ForbiddenError('You do not have access to this quote');
  }

  // If homeowner, include professional details
  if (isHomeowner) {
    const professional = await User.findById(quote.professionalId)
      .select('_id email professionalProfile')
      .lean();

    return {
      ...quote,
      professional,
    };
  }

  return quote;
};

/**
 * Get all quotes for a lead (homeowner view)
 */
export const getQuotesForLead = async (leadId: string, homeownerId: string, options?: { status?: string; sortBy?: string }) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  if (lead.homeownerId !== homeownerId) {
    throw new ForbiddenError('You can only view quotes for your own leads');
  }

  const query: any = { leadId };

  if (options?.status) {
    query.status = options.status;
  }

  // Sorting
  let sort: any = {};
  switch (options?.sortBy) {
    case 'price-low':
      sort = { total: 1 };
      break;
    case 'price-high':
      sort = { total: -1 };
      break;
    case 'rating':
      // Would need to join with professional ratings
      sort = { createdAt: -1 };
      break;
    case 'newest':
    default:
      sort = { createdAt: -1 };
  }

  const quotes = await Quote.find(query).sort(sort).lean();

  // Fetch professional details for each quote
  const professionalIds = quotes.map(q => q.professionalId);
  const professionals = await User.find({
    _id: { $in: professionalIds },
    role: 'pro',
  }).select('_id email professionalProfile').lean();

  const professionalMap = new Map(professionals.map(p => [p._id.toString(), p]));

  const quotesWithProfessionals = quotes.map(quote => ({
    ...quote,
    professional: professionalMap.get(quote.professionalId),
  }));

  return quotesWithProfessionals;
};

/**
 * Get my quote for a specific lead (professional view)
 * Returns the professional's own quote for a lead, if any
 */
export const getMyQuoteForLead = async (leadId: string, professionalId: string) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  // Verify professional has access to this lead (claimed or accepted direct lead)
  const hasClaim = await LeadClaim.findOne({ leadId, professionalId });
  const isDirectLeadTarget = lead.leadType === 'direct' &&
    lead.targetProfessionalId === professionalId;

  if (!hasClaim && !isDirectLeadTarget) {
    throw new ForbiddenError('You do not have access to this lead');
  }

  // Get the professional's quote for this lead
  const quote = await Quote.findOne({ leadId, professionalId }).lean();

  return quote;
};

/**
 * Get my quotes (professional view)
 */
export const getMyQuotes = async (professionalId: string, options?: { status?: string; limit?: number; offset?: number }) => {
  const query: any = { professionalId };

  if (options?.status) {
    query.status = options.status;
  }

  const [quotes, total] = await Promise.all([
    Quote.find(query)
      .sort({ createdAt: -1 })
      .skip(options?.offset || 0)
      .limit(options?.limit || 20)
      .lean(),
    Quote.countDocuments(query),
  ]);

  // Fetch lead details for each quote
  const leadIds = quotes.map(q => q.leadId);
  const leads = await Lead.find({ _id: { $in: leadIds } })
    .select('_id title category location budgetBracket urgency status')
    .lean();

  const leadMap = new Map(leads.map(l => [l._id.toString(), l]));

  const quotesWithLeads = quotes.map(quote => ({
    ...quote,
    lead: leadMap.get(quote.leadId),
  }));

  return {
    quotes: quotesWithLeads,
    total,
    limit: options?.limit || 20,
    offset: options?.offset || 0,
  };
};

/**
 * Accept quote (homeowner only)
 */
export const acceptQuote = async (quoteId: string, homeownerId: string, notes?: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const quote = await Quote.findById(quoteId).session(session);

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    // Verify quote is pending
    if (quote.status !== 'pending') {
      throw new BadRequestError(`Cannot accept quote with status: ${quote.status}`);
    }

    // Verify homeowner owns the lead
    const lead = await Lead.findById(quote.leadId).session(session);
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    if (lead.homeownerId !== homeownerId) {
      throw new ForbiddenError('You can only accept quotes for your own leads');
    }

    // Update quote status
    quote.status = 'accepted';
    quote.acceptedAt = new Date();
    await quote.save({ session });

    // Update lead status
    lead.status = 'accepted';
    await lead.save({ session });

    // Decline all other pending quotes for this lead
    await Quote.updateMany(
      {
        leadId: quote.leadId,
        _id: { $ne: quoteId },
        status: 'pending',
      },
      {
        $set: {
          status: 'declined',
          declinedAt: new Date(),
          declineReason: 'Homeowner accepted another quote',
        },
      },
      { session }
    );

    await session.commitTransaction();

    // Create a project from the accepted quote (outside transaction to not block acceptance)
    try {
      const project = await createProjectFromQuote(quote.leadId, quoteId, homeownerId);
      logger.info('Project created from accepted quote', {
        projectId: project._id,
        quoteId,
        leadId: quote.leadId,
      });
    } catch (projectError) {
      // Log but don't fail the quote acceptance
      logger.error('Failed to create project from quote', projectError, { quoteId, leadId: quote.leadId });
    }

    logger.info('Quote accepted', {
      quoteId,
      leadId: quote.leadId,
      professionalId: quote.professionalId,
      homeownerId,
      total: quote.total,
    });

    return quote;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to accept quote', error, { quoteId, homeownerId });
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Decline quote (homeowner only)
 */
export const declineQuote = async (quoteId: string, homeownerId: string, reason?: string) => {
  const quote = await Quote.findById(quoteId);

  if (!quote) {
    throw new NotFoundError('Quote not found');
  }

  // Verify quote is pending
  if (quote.status !== 'pending') {
    throw new BadRequestError(`Cannot decline quote with status: ${quote.status}`);
  }

  // Verify homeowner owns the lead
  const lead = await Lead.findById(quote.leadId);
  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  if (lead.homeownerId !== homeownerId) {
    throw new ForbiddenError('You can only decline quotes for your own leads');
  }

  // Update quote status
  quote.status = 'declined';
  quote.declinedAt = new Date();
  quote.declineReason = reason;
  await quote.save();

  logger.info('Quote declined', {
    quoteId,
    leadId: quote.leadId,
    professionalId: quote.professionalId,
    homeownerId,
    reason,
  });

  return quote;
};

/**
 * Delete quote (professional only, before acceptance)
 */
export const deleteQuote = async (quoteId: string, professionalId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const quote = await Quote.findById(quoteId).session(session);

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    if (quote.professionalId !== professionalId) {
      throw new ForbiddenError('You can only delete your own quotes');
    }

    if (quote.status !== 'pending') {
      throw new BadRequestError('Cannot delete quote after it has been accepted or declined');
    }

    // Update claim to mark quote as not submitted
    await LeadClaim.updateOne(
      {
        leadId: quote.leadId,
        professionalId,
      },
      {
        $set: {
          quoteSubmitted: false,
          quoteSubmittedAt: undefined,
        },
      },
      { session }
    );

    // Delete quote
    await Quote.deleteOne({ _id: quoteId }, { session });

    await session.commitTransaction();

    logger.info('Quote deleted', {
      quoteId,
      leadId: quote.leadId,
      professionalId,
    });

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to delete quote', error, { quoteId, professionalId });
    throw error;
  } finally {
    session.endSession();
  }
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

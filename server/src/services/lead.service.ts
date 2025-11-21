import { Lead, LeadClaim, ILead } from '../models/Lead.model';
import { User } from '../models/User.model';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import * as creditService from './credit.service';
import type { CreateLeadInput, UpdateLeadInput, GetLeadsInput } from '../schemas/lead.schema';
import { PLATFORM_CONFIG, BUDGET_BRACKETS } from '@homezy/shared';

/**
 * Lead Service
 * Handles all lead-related business logic
 */

/**
 * Create a new lead
 */
export const createLead = async (homeownerId: string, data: CreateLeadInput) => {
  // Verify user is a homeowner
  const user = await User.findById(homeownerId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.role !== 'homeowner' && user.role !== 'admin') {
    throw new ForbiddenError('Only homeowners can create leads');
  }

  // Calculate expiry date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + PLATFORM_CONFIG.LEAD_EXPIRY_DAYS);

  // Create lead
  const lead = await Lead.create({
    homeownerId,
    ...data,
    status: 'open',
    claimCount: 0,
    maxClaims: PLATFORM_CONFIG.MAX_LEAD_CLAIMS,
    expiresAt,
  });

  logger.info('Lead created', {
    leadId: lead._id,
    homeownerId,
    category: data.category,
    budgetBracket: data.budgetBracket,
  });

  return lead;
};

/**
 * Get lead by ID
 * Returns full details if user has claimed it, otherwise limited details
 */
export const getLeadById = async (leadId: string, userId?: string) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  // Check if user has claimed this lead or is the homeowner
  let hasClaimed = false;
  let isOwner = false;

  if (userId) {
    isOwner = lead.homeownerId === userId;

    if (!isOwner) {
      const claim = await LeadClaim.findOne({
        leadId: leadId,
        professionalId: userId,
      });
      hasClaimed = !!claim;
    }
  }

  // Hide full address unless claimed or owner
  const leadData = lead.toJSON();
  if (!hasClaimed && !isOwner && leadData.location.fullAddress) {
    delete leadData.location.fullAddress;
  }

  return {
    lead: leadData,
    hasClaimed,
    isOwner,
  };
};

/**
 * Update lead (homeowner only, before claims)
 */
export const updateLead = async (leadId: string, homeownerId: string, data: UpdateLeadInput) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  // Only homeowner can update
  if (lead.homeownerId !== homeownerId) {
    throw new ForbiddenError('You can only update your own leads');
  }

  // Cannot update if already claimed
  if (lead.claimCount > 0) {
    throw new BadRequestError('Cannot update lead after it has been claimed by professionals');
  }

  // Cannot update if not in open status
  if (lead.status !== 'open') {
    throw new BadRequestError(`Cannot update lead with status: ${lead.status}`);
  }

  // Update lead
  Object.assign(lead, data);
  await lead.save();

  logger.info('Lead updated', {
    leadId,
    homeownerId,
    updates: Object.keys(data),
  });

  return lead;
};

/**
 * Cancel lead (homeowner only)
 */
export const cancelLead = async (leadId: string, homeownerId: string, reason: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const lead = await Lead.findById(leadId).session(session);

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Only homeowner can cancel
    if (lead.homeownerId !== homeownerId) {
      throw new ForbiddenError('You can only cancel your own leads');
    }

    // Cannot cancel if already accepted
    if (lead.status === 'accepted') {
      throw new BadRequestError('Cannot cancel lead that has been accepted');
    }

    // Update status
    lead.status = 'cancelled';
    await lead.save({ session });

    // Refund credits to professionals who claimed
    const claims = await LeadClaim.find({ leadId }).session(session);

    for (const claim of claims) {
      await creditService.refundCredits(
        claim.professionalId,
        claim.creditsCost,
        `Lead cancelled by homeowner: ${reason}`,
        {
          leadId,
          originalTransactionId: claim._id.toString(),
        }
      );

      logger.info('Credits refunded for cancelled lead', {
        leadId,
        professionalId: claim.professionalId,
        credits: claim.creditsCost,
      });
    }

    await session.commitTransaction();

    logger.info('Lead cancelled', {
      leadId,
      homeownerId,
      reason,
      refundedClaims: claims.length,
    });

    return lead;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to cancel lead', error, { leadId, homeownerId });
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Browse leads (marketplace for professionals)
 */
export const browseLeads = async (filters: GetLeadsInput, professionalId?: string) => {
  const query: any = {};

  // Base filters - only show open or full leads in marketplace
  query.status = { $in: ['open', 'full'] };

  // Not expired
  query.expiresAt = { $gt: new Date() };

  // Apply filters
  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.emirate) {
    query['location.emirate'] = filters.emirate;
  }

  if (filters.budgetBracket) {
    query.budgetBracket = filters.budgetBracket;
  }

  if (filters.urgency) {
    query.urgency = filters.urgency;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.hasSlots) {
    query.claimCount = { $lt: PLATFORM_CONFIG.MAX_LEAD_CLAIMS };
  }

  // Search in title and description
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  // Sorting
  let sort: any = {};
  switch (filters.sortBy) {
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'budget-high':
      // Custom sort by budget bracket order (highest first)
      // Will need to sort in application layer after query
      sort = { createdAt: -1 }; // Default for now
      break;
    case 'budget-low':
      sort = { createdAt: -1 }; // Default for now
      break;
    case 'urgency':
      // Emergency first, then urgent, then flexible, then planning
      // Custom sort needed
      sort = { urgency: 1, createdAt: -1 };
      break;
    case 'ending-soon':
      sort = { expiresAt: 1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  // Execute query
  const [leads, total] = await Promise.all([
    Lead.find(query)
      .sort(sort)
      .skip(filters.offset || 0)
      .limit(filters.limit || 20)
      .lean(),
    Lead.countDocuments(query),
  ]);

  // For each lead, check if current professional has claimed it
  let leadsWithClaimStatus = leads;
  if (professionalId) {
    const leadIds = leads.map(l => l._id.toString());
    const claims = await LeadClaim.find({
      leadId: { $in: leadIds },
      professionalId,
    }).lean();

    const claimMap = new Map(claims.map(c => [c.leadId, true]));

    leadsWithClaimStatus = leads.map(lead => {
      // Hide full address unless claimed
      const leadData = { ...lead };
      const hasClaimed = claimMap.has(lead._id.toString());

      if (!hasClaimed && leadData.location.fullAddress) {
        delete leadData.location.fullAddress;
      }

      return {
        ...leadData,
        hasClaimed,
      };
    });
  } else {
    // Hide full address for non-authenticated users
    leadsWithClaimStatus = leads.map(lead => {
      const leadData = { ...lead };
      if (leadData.location.fullAddress) {
        delete leadData.location.fullAddress;
      }
      return {
        ...leadData,
        hasClaimed: false,
      };
    });
  }

  return {
    leads: leadsWithClaimStatus,
    total,
    limit: filters.limit || 20,
    offset: filters.offset || 0,
  };
};

/**
 * Get my leads (homeowner view)
 */
export const getMyLeads = async (homeownerId: string, options?: { status?: string; limit?: number; offset?: number }) => {
  const query: any = { homeownerId };

  if (options?.status) {
    query.status = options.status;
  }

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(options?.offset || 0)
      .limit(options?.limit || 20)
      .lean(),
    Lead.countDocuments(query),
  ]);

  return {
    leads,
    total,
    limit: options?.limit || 20,
    offset: options?.offset || 0,
  };
};

/**
 * Get my claimed leads (professional view)
 */
export const getMyClaimedLeads = async (professionalId: string, options?: { quoteSubmitted?: boolean; limit?: number; offset?: number }) => {
  const query: any = { professionalId };

  if (options?.quoteSubmitted !== undefined) {
    query.quoteSubmitted = options.quoteSubmitted;
  }

  const [claims, total] = await Promise.all([
    LeadClaim.find(query)
      .sort({ claimedAt: -1 })
      .skip(options?.offset || 0)
      .limit(options?.limit || 20)
      .lean(),
    LeadClaim.countDocuments(query),
  ]);

  // Fetch full lead details for each claim
  const leadIds = claims.map(c => c.leadId);
  const leads = await Lead.find({ _id: { $in: leadIds } }).lean();

  const leadMap = new Map(leads.map(l => [l._id.toString(), l]));

  const claimsWithLeads = claims.map(claim => ({
    ...claim,
    lead: leadMap.get(claim.leadId),
  }));

  return {
    claims: claimsWithLeads,
    total,
    limit: options?.limit || 20,
    offset: options?.offset || 0,
  };
};

/**
 * Claim a lead (professional only)
 * Deducts credits and creates claim record
 */
export const claimLead = async (leadId: string, professionalId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get lead
    const lead = await Lead.findById(leadId).session(session);

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Verify lead is claimable
    if (lead.status !== 'open' && lead.status !== 'full') {
      throw new BadRequestError(`Cannot claim lead with status: ${lead.status}`);
    }

    if (lead.claimCount >= PLATFORM_CONFIG.MAX_LEAD_CLAIMS) {
      throw new BadRequestError('This lead has reached maximum claims (5 professionals)');
    }

    if (new Date() > lead.expiresAt) {
      throw new BadRequestError('This lead has expired');
    }

    // Check if already claimed
    const existingClaim = await LeadClaim.findOne({
      leadId,
      professionalId,
    }).session(session);

    if (existingClaim) {
      throw new BadRequestError('You have already claimed this lead');
    }

    // Get professional details for verification status
    const professional = await User.findById(professionalId).session(session);
    if (!professional || professional.role !== 'pro') {
      throw new ForbiddenError('Only verified professionals can claim leads');
    }

    // Check if professional is approved
    const verificationStatus = professional.proProfile?.verificationStatus || 'pending';
    if (verificationStatus !== 'approved') {
      throw new ForbiddenError('Your account must be approved by admin before claiming leads. Please complete your profile and wait for admin approval.');
    }

    // Calculate credit cost
    const budgetBracket = BUDGET_BRACKETS.find(b => b.id === lead.budgetBracket);
    if (!budgetBracket) {
      throw new BadRequestError('Invalid budget bracket');
    }

    let creditsCost: number = budgetBracket.credits;

    // Apply urgency multiplier
    if (lead.urgency === 'emergency') {
      creditsCost = Math.ceil(creditsCost * 1.5);
    }

    // Spend credits
    try {
      await creditService.spendCredits({
        professionalId,
        amount: creditsCost,
        description: `Claimed lead: ${lead.title}`,
        metadata: {
          leadId,
          budgetBracket: lead.budgetBracket,
          urgency: lead.urgency,
        },
      });
    } catch (error: any) {
      // If credit spending fails, abort transaction
      throw new BadRequestError(error.message || 'Failed to deduct credits');
    }

    // Create claim record
    const claim = await LeadClaim.create(
      [
        {
          leadId,
          professionalId,
          creditsCost,
          claimedAt: new Date(),
          quoteSubmitted: false,
        },
      ],
      { session }
    );

    // Update lead claim count and status
    lead.claimCount += 1;
    if (lead.claimCount >= PLATFORM_CONFIG.MAX_LEAD_CLAIMS) {
      lead.status = 'full';
    }
    await lead.save({ session });

    await session.commitTransaction();

    logger.info('Lead claimed', {
      leadId,
      professionalId,
      creditsCost,
      claimCount: lead.claimCount,
    });

    return {
      claim: claim[0],
      lead,
      creditsCost,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to claim lead', error, { leadId, professionalId });
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get claims for a lead (homeowner view)
 */
export const getClaimsForLead = async (leadId: string, homeownerId: string) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  if (lead.homeownerId !== homeownerId) {
    throw new ForbiddenError('You can only view claims for your own leads');
  }

  const claims = await LeadClaim.find({ leadId }).sort({ claimedAt: 1 }).lean();

  // Fetch professional details for each claim
  const professionalIds = claims.map(c => c.professionalId);
  const professionals = await User.find({
    _id: { $in: professionalIds },
    role: 'pro',
  }).select('_id email professionalProfile').lean();

  const professionalMap = new Map(professionals.map(p => [p._id.toString(), p]));

  const claimsWithProfessionals = claims.map(claim => ({
    ...claim,
    professional: professionalMap.get(claim.professionalId),
  }));

  return claimsWithProfessionals;
};

/**
 * Background job: Expire old leads
 */
export const expireOldLeads = async () => {
  const now = new Date();

  const result = await Lead.updateMany(
    {
      expiresAt: { $lte: now },
      status: { $in: ['open', 'full', 'quoted'] },
    },
    {
      $set: { status: 'expired' },
    }
  );

  logger.info('Expired old leads', {
    count: result.modifiedCount,
  });

  return result.modifiedCount;
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
  expireOldLeads,
};

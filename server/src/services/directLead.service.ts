import { Lead, LeadClaim, ILead } from '../models/Lead.model';
import { User } from '../models/User.model';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import { transformLeanDocWith } from '../utils/mongoose.utils';
import { PLATFORM_CONFIG } from '@homezy/shared';
import type { CreateLeadInput } from '../schemas/lead.schema';
import { emailService } from './email.service';
import * as creditService from './credit.service';

type BudgetBracketForCredits = 'under-5k' | '5k-20k' | '20k-50k' | '50k-100k' | 'over-100k';
type UrgencyForCredits = 'flexible' | 'within-month' | 'within-week' | 'emergency';

// Map budget brackets to credit service format
const mapBudgetBracketForCredits = (bracket: string): BudgetBracketForCredits => {
  const mapping: Record<string, BudgetBracketForCredits> = {
    '500-1k': 'under-5k',
    '1k-5k': 'under-5k',
    '5k-15k': '5k-20k',
    '15k-50k': '20k-50k',
    '50k-150k': '50k-100k',
    '150k+': 'over-100k',
  };
  return mapping[bracket] || 'under-5k';
};

// Map urgency to credit service format
const mapUrgencyForCredits = (urgency: string): UrgencyForCredits => {
  const mapping: Record<string, UrgencyForCredits> = {
    'emergency': 'emergency',
    'urgent': 'within-week',
    'flexible': 'within-month',
    'planning': 'flexible',
  };
  return mapping[urgency] || 'flexible';
};

// Calculate credit cost for display (without verification discount)
const calculateDisplayCreditCost = (lead: { budgetBracket: string; urgency: string }): number => {
  return creditService.calculateCreditCost({
    budgetBracket: mapBudgetBracketForCredits(lead.budgetBracket),
    urgency: mapUrgencyForCredits(lead.urgency),
    verificationStatus: 'pending', // Base cost without discount
  });
};

/**
 * Direct Lead Service
 * Handles business logic for direct (private) leads sent to specific professionals
 */

/**
 * Create a direct lead sent to a specific professional
 * Direct leads are private for 24 hours before converting to public
 */
export const createDirectLead = async (
  homeownerId: string,
  professionalId: string,
  data: CreateLeadInput
) => {
  // Verify homeowner exists
  const homeowner = await User.findById(homeownerId);
  if (!homeowner) {
    throw new NotFoundError('User not found');
  }

  if (homeowner.role !== 'homeowner' && homeowner.role !== 'admin') {
    throw new ForbiddenError('Only homeowners can create leads');
  }

  // Verify professional exists and is active
  const professional = await User.findById(professionalId);
  if (!professional) {
    throw new NotFoundError('Professional not found');
  }

  if (professional.role !== 'pro') {
    throw new BadRequestError('Target user is not a professional');
  }

  // Check if professional's pro profile exists and is not suspended
  if (!professional.proProfile) {
    throw new BadRequestError('Professional profile not found');
  }

  if (
    professional.proProfile.verificationStatus === 'rejected' ||
    professional.proProfile.verificationStatus === 'pending'
  ) {
    throw new BadRequestError('Professional is not verified');
  }

  // Calculate expiry dates
  const now = new Date();

  // Direct lead expires in 24 hours
  const directLeadExpiresAt = new Date(now);
  directLeadExpiresAt.setHours(directLeadExpiresAt.getHours() + 24);

  // Overall lead expires in 7 days
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + PLATFORM_CONFIG.LEAD_EXPIRY_DAYS);

  // Create direct lead
  const lead = await Lead.create({
    homeownerId,
    ...data,
    leadType: 'direct',
    targetProfessionalId: professionalId,
    directLeadExpiresAt,
    directLeadStatus: 'pending',
    status: 'open',
    claimCount: 0,
    maxClaims: 1, // Only target pro can claim while direct
    expiresAt,
    reminder1Sent: false,
    reminder2Sent: false,
  });

  logger.info('Direct lead created', {
    leadId: lead._id,
    homeownerId,
    professionalId,
    category: data.category,
  });

  // Send immediate notification to professional
  try {
    await emailService.sendDirectLeadReceived(
      professional.email,
      {
        professionalName: `${professional.firstName} ${professional.lastName}`,
        homeownerName: `${homeowner.firstName} ${homeowner.lastName}`,
        leadTitle: lead.title,
        leadCategory: lead.category,
        leadBudget: lead.budgetBracket,
        leadId: lead._id.toString(),
        expiresAt: directLeadExpiresAt,
      }
    );
  } catch (emailError: any) {
    logger.error('Failed to send direct lead notification email', {
      error: emailError.message,
      leadId: lead._id,
      professionalId,
    });
    // Don't fail the request if email fails
  }

  return lead;
};

/**
 * Convert direct lead to public marketplace lead
 * Called when:
 * 1. Direct lead expires (24 hours passed)
 * 2. Professional declines the direct lead
 */
export const convertDirectToPublic = async (leadId: string) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  if (lead.leadType !== 'direct') {
    throw new BadRequestError('Lead is not a direct lead');
  }

  if (lead.directLeadStatus !== 'pending') {
    throw new BadRequestError(`Direct lead already ${lead.directLeadStatus}`);
  }

  // Convert to public marketplace lead
  lead.leadType = 'indirect';
  lead.directLeadStatus = 'converted';
  lead.convertedToPublicAt = new Date();
  lead.maxClaims = PLATFORM_CONFIG.MAX_LEAD_CLAIMS; // Now up to 5 pros can claim
  await lead.save();

  logger.info('Direct lead converted to public', {
    leadId: lead._id,
    targetProfessionalId: lead.targetProfessionalId,
    convertedAt: lead.convertedToPublicAt,
  });

  // Notify homeowner that lead is now public
  try {
    const homeowner = await User.findById(lead.homeownerId);
    if (homeowner) {
      await emailService.sendDirectLeadConvertedToPublic(
        homeowner.email,
        {
          homeownerName: `${homeowner.firstName} ${homeowner.lastName}`,
          leadTitle: lead.title,
          leadId: lead._id.toString(),
        }
      );
    }
  } catch (emailError: any) {
    logger.error('Failed to send conversion notification email', {
      error: emailError.message,
      leadId: lead._id,
    });
  }

  return lead;
};

/**
 * Professional accepts a direct lead
 * Immediately claims the lead and deducts credits
 */
export const acceptDirectLead = async (leadId: string, professionalId: string) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  if (lead.leadType !== 'direct') {
    throw new BadRequestError('Lead is not a direct lead');
  }

  if (lead.targetProfessionalId !== professionalId) {
    throw new ForbiddenError('This lead was not sent to you');
  }

  if (lead.directLeadStatus !== 'pending') {
    throw new BadRequestError(`Direct lead already ${lead.directLeadStatus}`);
  }

  // Check if already expired
  if (lead.directLeadExpiresAt && new Date() > lead.directLeadExpiresAt) {
    throw new BadRequestError('Direct lead has expired and been converted to public');
  }

  // Get professional to calculate credit cost
  const professional = await User.findById(professionalId);
  if (!professional) {
    throw new NotFoundError('Professional not found');
  }

  // Calculate credit cost (same as marketplace claims)
  const { creditCost } = calculateLeadCreditCost(lead, professional);

  // Check if professional has enough credits
  // TODO: Implement credit balance tracking in ProProfile
  // const creditBalance = professional.proProfile?.creditBalance || 0;
  // if (creditBalance < creditCost) {
  //   throw new BadRequestError(
  //     `Insufficient credits. Required: ${creditCost}, Available: ${creditBalance}`
  //   );
  // }

  // Update lead status
  lead.directLeadStatus = 'accepted';
  lead.claimCount = 1;
  lead.status = 'full'; // Direct leads are full after acceptance
  await lead.save();

  // Create claim record
  const claim = await LeadClaim.create({
    leadId: leadId,
    professionalId,
    creditsCost: creditCost,
    claimedAt: new Date(),
    quoteSubmitted: false,
  });

  // Deduct credits from professional
  // TODO: Implement credit deduction when creditBalance is added to ProProfile
  // if (professional.proProfile) {
  //   professional.proProfile.creditBalance -= creditCost;
  //   await professional.save();
  // }

  logger.info('Direct lead accepted', {
    leadId: lead._id,
    professionalId,
    creditCost,
    // newBalance: professional.proProfile?.creditBalance,
  });

  // Notify homeowner that pro accepted
  try {
    const homeowner = await User.findById(lead.homeownerId);
    if (homeowner) {
      await emailService.sendDirectLeadAccepted(
        homeowner.email,
        {
          homeownerName: `${homeowner.firstName} ${homeowner.lastName}`,
          professionalName: `${professional.firstName} ${professional.lastName}`,
          leadTitle: lead.title,
          leadId: lead._id.toString(),
        }
      );
    }
  } catch (emailError: any) {
    logger.error('Failed to send acceptance notification email', {
      error: emailError.message,
      leadId: lead._id,
    });
  }

  return { lead, claim };
};

/**
 * Professional declines a direct lead
 * Immediately converts lead to public marketplace
 */
export const declineDirectLead = async (leadId: string, professionalId: string, reason?: string) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  if (lead.leadType !== 'direct') {
    throw new BadRequestError('Lead is not a direct lead');
  }

  if (lead.targetProfessionalId !== professionalId) {
    throw new ForbiddenError('This lead was not sent to you');
  }

  if (lead.directLeadStatus !== 'pending') {
    throw new BadRequestError(`Direct lead already ${lead.directLeadStatus}`);
  }

  // Mark as declined and immediately convert to public
  lead.directLeadStatus = 'declined';
  await lead.save();

  logger.info('Direct lead declined by professional', {
    leadId: lead._id,
    professionalId,
    reason,
  });

  // Convert to public marketplace
  await convertDirectToPublic(leadId);

  // Notify homeowner that pro declined
  try {
    const homeowner = await User.findById(lead.homeownerId);
    const professional = await User.findById(professionalId);
    if (homeowner && professional) {
      await emailService.sendDirectLeadDeclined(
        homeowner.email,
        {
          homeownerName: `${homeowner.firstName} ${homeowner.lastName}`,
          professionalName: `${professional.firstName} ${professional.lastName}`,
          leadTitle: lead.title,
          leadId: lead._id.toString(),
        }
      );
    }
  } catch (emailError: any) {
    logger.error('Failed to send decline notification email', {
      error: emailError.message,
      leadId: lead._id,
    });
  }

  return lead;
};

/**
 * Get direct leads sent to a specific professional
 */
export const getMyDirectLeads = async (professionalId: string, status?: string) => {
  const query: any = {
    leadType: 'direct',
    targetProfessionalId: professionalId,
  };

  if (status) {
    query.directLeadStatus = status;
  }

  const leads = await Lead.find(query).sort({ createdAt: -1 }).lean();

  // Add creditsRequired to each lead and transform _id to id
  const leadsWithCredits = leads.map(lead => transformLeanDocWith(lead, {
    creditsRequired: calculateDisplayCreditCost(lead),
  }));

  return leadsWithCredits;
};

/**
 * Get direct leads created by a homeowner
 */
export const getMyCreatedDirectLeads = async (homeownerId: string) => {
  const leads = await Lead.find({
    homeownerId,
    leadType: 'direct',
  }).sort({ createdAt: -1 });

  return leads;
};

/**
 * Calculate credit cost for claiming a lead
 * Based on budget bracket, urgency, and professional's verification level
 */
function calculateLeadCreditCost(lead: ILead, professional: any) {
  const BUDGET_BRACKETS: Record<string, number> = {
    '500-1k': 5,
    '1k-5k': 15,
    '5k-15k': 30,
    '15k-50k': 60,
    '50k-150k': 100,
    '150k+': 125,
  };

  let baseCost = BUDGET_BRACKETS[lead.budgetBracket] || 15;

  // Apply urgency multiplier
  if (lead.urgency === 'emergency') {
    baseCost = Math.round(baseCost * 1.5);
  }

  // Apply verification discount (15% off for comprehensive verified pros)
  const verificationLevel = professional.proProfile?.verificationStatus;
  if (verificationLevel === 'comprehensive') {
    baseCost = Math.round(baseCost * 0.85);
  }

  return {
    creditCost: baseCost,
    breakdown: {
      base: BUDGET_BRACKETS[lead.budgetBracket],
      urgencyMultiplier: lead.urgency === 'emergency' ? 1.5 : 1,
      verificationDiscount: verificationLevel === 'comprehensive' ? 0.15 : 0,
    },
  };
}

export default {
  createDirectLead,
  convertDirectToPublic,
  acceptDirectLead,
  declineDirectLead,
  getMyDirectLeads,
  getMyCreatedDirectLeads,
};

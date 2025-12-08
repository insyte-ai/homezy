import { Lead, ILead } from '../models/Lead.model';
import { User } from '../models/User.model';
import { Document } from 'mongoose';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import { emailService } from './email.service';
import { PLATFORM_CONFIG } from '@homezy/shared';
import type { CreateGuestLeadInput } from '../schemas/lead.schema';

/**
 * Guest Lead Service
 * Handles user creation + lead creation for unauthenticated users
 */

/**
 * Create a lead for a guest (unauthenticated) user
 * Creates or finds user, creates lead, sends magic link email
 */
export const createGuestLead = async (data: CreateGuestLeadInput) => {
  const { email, firstName, phone, targetProfessionalId, photos, ...leadData } = data;

  // 1. Find or create user
  let user = await User.findOne({ email: email.toLowerCase() });
  let isNewUser = false;

  if (!user) {
    // Create new guest user
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

    user = new User({
      email: email.toLowerCase(),
      password: tempPassword,
      firstName: firstName || 'Guest',
      lastName: 'User',
      phone,
      role: 'homeowner',
      isEmailVerified: false,
      isPhoneVerified: false,
      isGuestAccount: true,
      hasSetPassword: false,
    });

    await user.save();
    isNewUser = true;

    logger.info('Guest user created via lead submission', {
      userId: user._id,
      email: user.email,
    });
  } else {
    // Existing user - verify they're a homeowner (or admin)
    if (user.role === 'pro') {
      throw new BadRequestError(
        'This email is registered as a professional account. Please use a different email or login to your homeowner account.'
      );
    }
  }

  // 2. Convert photo URLs to attachments
  const attachments = leadData.attachments || [];
  if (photos && photos.length > 0) {
    const photoAttachments = photos.map((url, index) => ({
      id: `photo-${Date.now()}-${index}`,
      type: 'image' as const,
      url,
      filename: `photo-${index + 1}.jpg`,
      size: 0,
      uploadedAt: new Date(),
    }));
    attachments.push(...photoAttachments);
  }

  // 3. Calculate expiry dates
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + PLATFORM_CONFIG.LEAD_EXPIRY_DAYS);

  // 4. Create lead (indirect or direct)
  const isDirectLead = !!targetProfessionalId;

  let lead: Document<unknown, {}, ILead> & ILead;
  let professional = null;

  try {
    if (isDirectLead) {
      // Validate target professional exists and is verified
      professional = await User.findById(targetProfessionalId);

      if (!professional || professional.role !== 'pro') {
        throw new NotFoundError('Professional not found');
      }

      if (!professional.proProfile) {
        throw new BadRequestError('Professional profile not found');
      }

      if (
        professional.proProfile.verificationStatus === 'rejected' ||
        professional.proProfile.verificationStatus === 'pending'
      ) {
        throw new BadRequestError('Professional is not verified');
      }

      const directLeadExpiresAt = new Date(now);
      directLeadExpiresAt.setHours(directLeadExpiresAt.getHours() + 24);

      lead = await Lead.create({
        homeownerId: user._id.toString(),
        ...leadData,
        attachments,
        leadType: 'direct',
        targetProfessionalId,
        directLeadExpiresAt,
        directLeadStatus: 'pending',
        status: 'open',
        claimCount: 0,
        maxClaims: 1,
        expiresAt,
        reminder1Sent: false,
        reminder2Sent: false,
      });

      logger.info('Guest direct lead created', {
        leadId: lead._id,
        homeownerId: user._id,
        professionalId: targetProfessionalId,
      });
    } else {
      // Create indirect (marketplace) lead
      lead = await Lead.create({
        homeownerId: user._id.toString(),
        ...leadData,
        attachments,
        leadType: 'indirect',
        status: 'open',
        claimCount: 0,
        maxClaims: PLATFORM_CONFIG.MAX_LEAD_CLAIMS,
        expiresAt,
      });

      logger.info('Guest marketplace lead created', {
        leadId: lead._id,
        homeownerId: user._id,
        category: leadData.category,
      });
    }
  } catch (error) {
    logger.error('Guest lead creation failed', { error });
    throw error;
  }

  // 5. Send magic link email (non-blocking)
  try {
    const magicLinkToken = await user.generateMagicLinkToken();

    emailService
      .sendMagicLinkEmail(user.email, magicLinkToken, user.hasSetPassword, firstName)
      .catch((error) => {
        logger.error('Failed to send magic link email after guest lead', {
          userId: user._id,
          error: error.message,
        });
      });
  } catch (magicLinkError: any) {
    logger.error('Failed to generate magic link token', {
      userId: user._id,
      error: magicLinkError.message,
    });
    // Don't throw - lead is already created successfully
  }

  // 6. Send direct lead notification to professional (if applicable)
  if (isDirectLead && professional) {
    emailService
      .sendDirectLeadReceived(professional.email, {
        professionalName: `${professional.firstName} ${professional.lastName}`,
        homeownerName: firstName || user.email.split('@')[0],
        leadTitle: lead.title,
        leadCategory: lead.category,
        leadBudget: lead.budgetBracket,
        leadId: lead._id.toString(),
        expiresAt: lead.directLeadExpiresAt!,
      })
      .catch((error) => {
        logger.error('Failed to send direct lead notification', {
          leadId: lead._id,
          error: error.message,
        });
      });
  }

  return {
    lead,
    user,
    isNewUser,
  };
};

export default {
  createGuestLead,
};

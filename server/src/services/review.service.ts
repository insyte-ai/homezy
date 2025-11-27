import Review, { IReview } from '../models/Review.model';
import Lead from '../models/Lead.model';
import User from '../models/User.model';
import Quote from '../models/Quote.model';
import { AppError } from '../middleware/errorHandler.middleware';
import type { SubmitReviewInput } from '../schemas/review.schema';

/**
 * Check if a homeowner can review a specific lead
 */
export const canReviewLead = async (homeownerId: string, leadId: string): Promise<{
  canReview: boolean;
  reason?: string;
  lead?: any;
  professional?: any;
}> => {
  // Find the lead
  const lead = await Lead.findById(leadId);

  if (!lead) {
    return { canReview: false, reason: 'Lead not found' };
  }

  // Check ownership
  if (lead.homeownerId !== homeownerId) {
    return { canReview: false, reason: 'You do not own this lead' };
  }

  // Check lead status - must be accepted
  if (lead.status !== 'accepted') {
    return { canReview: false, reason: 'Can only review accepted projects' };
  }

  // Check if review already exists
  const existingReview = await Review.findOne({
    homeownerId,
    // Use leadId as projectId for now (we link reviews to leads until Project entity is fully implemented)
    projectId: leadId
  });

  if (existingReview) {
    return { canReview: false, reason: 'You have already reviewed this project' };
  }

  // Get professional info (from the accepted quote)
  const acceptedQuote = await Quote.findOne({
    leadId: leadId,
    status: 'accepted'
  });

  if (!acceptedQuote) {
    return { canReview: false, reason: 'No accepted quote found for this lead' };
  }

  const professional = await User.findById(acceptedQuote.professionalId)
    .select('_id proProfile.businessName profilePhoto');

  return {
    canReview: true,
    lead,
    professional: professional ? {
      _id: professional._id,
      businessName: professional.proProfile?.businessName,
      profilePhoto: professional.profilePhoto,
    } : null
  };
};

/**
 * Submit a review for a completed project
 */
export const submitReview = async (
  homeownerId: string,
  data: SubmitReviewInput
): Promise<IReview> => {
  // Verify can review
  const { canReview, reason, lead } = await canReviewLead(homeownerId, data.leadId);

  if (!canReview) {
    throw new AppError(reason || 'Cannot submit review', 400);
  }

  // Create the review
  const review = new Review({
    professionalId: data.professionalId,
    homeownerId,
    projectId: data.leadId, // Using leadId as projectId for now
    overallRating: data.overallRating,
    categoryRatings: data.categoryRatings,
    reviewText: data.reviewText,
    photos: data.photos || [],
    wouldRecommend: data.wouldRecommend,
    projectCompleted: data.projectCompleted,
    isVerified: true, // Verified because it's from an accepted quote
    helpfulCount: 0,
  });

  await review.save();

  // Update professional's average rating
  await updateProfessionalRating(data.professionalId);

  return review;
};

/**
 * Update a professional's average rating based on all their reviews
 */
export const updateProfessionalRating = async (professionalId: string): Promise<void> => {
  const reviews = await Review.find({ professionalId });

  if (reviews.length === 0) {
    return;
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.overallRating, 0);
  const averageRating = totalRating / reviews.length;

  await User.findByIdAndUpdate(professionalId, {
    'proProfile.rating': Math.round(averageRating * 10) / 10, // Round to 1 decimal
    'proProfile.reviewCount': reviews.length,
  });
};

/**
 * Get a review for a specific lead/project
 */
export const getReviewForLead = async (leadId: string): Promise<IReview | null> => {
  return Review.findOne({ projectId: leadId });
};

/**
 * Get all reviews for a professional
 */
export const getProfessionalReviews = async (
  professionalId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ professionalId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ professionalId }),
  ]);

  // Calculate stats
  const allReviews = await Review.find({ professionalId }).lean();

  let stats = {
    averageRating: 0,
    totalReviews: total,
    wouldRecommendPercent: 0,
    categoryAverages: {
      professionalism: 0,
      quality: 0,
      timeliness: 0,
      value: 0,
      communication: 0,
    },
  };

  if (allReviews.length > 0) {
    stats.averageRating = allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length;
    stats.wouldRecommendPercent = (allReviews.filter(r => r.wouldRecommend).length / allReviews.length) * 100;

    stats.categoryAverages = {
      professionalism: allReviews.reduce((sum, r) => sum + r.categoryRatings.professionalism, 0) / allReviews.length,
      quality: allReviews.reduce((sum, r) => sum + r.categoryRatings.quality, 0) / allReviews.length,
      timeliness: allReviews.reduce((sum, r) => sum + r.categoryRatings.timeliness, 0) / allReviews.length,
      value: allReviews.reduce((sum, r) => sum + r.categoryRatings.value, 0) / allReviews.length,
      communication: allReviews.reduce((sum, r) => sum + r.categoryRatings.communication, 0) / allReviews.length,
    };
  }

  return {
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats,
  };
};

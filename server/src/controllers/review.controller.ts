import { Request, Response } from 'express';
import {
  canReviewLead,
  submitReview,
  getReviewForLead,
  getProfessionalReviews,
} from '../services/review.service';
import { asyncHandler } from '../utils/asyncHandler';
import type { SubmitReviewInput } from '../schemas/review.schema';

/**
 * Check if user can review a lead
 * GET /api/v1/reviews/can-review/:leadId
 */
export const checkCanReview = asyncHandler(async (req: Request, res: Response) => {
  const { leadId } = req.params;
  const userId = req.user!._id.toString();

  const result = await canReviewLead(userId, leadId);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Submit a review
 * POST /api/v1/reviews
 */
export const submitReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const data = req.body as SubmitReviewInput;

  const review = await submitReview(userId, data);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: { review },
  });
});

/**
 * Get review for a specific lead
 * GET /api/v1/reviews/lead/:leadId
 */
export const getLeadReview = asyncHandler(async (req: Request, res: Response) => {
  const { leadId } = req.params;

  const review = await getReviewForLead(leadId);

  res.json({
    success: true,
    data: { review },
  });
});

/**
 * Get all reviews for a professional
 * GET /api/v1/reviews/professional/:professionalId
 */
export const getProfessionalReviewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { professionalId } = req.params;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  const result = await getProfessionalReviews(professionalId, page, limit);

  res.json({
    success: true,
    data: result,
  });
});

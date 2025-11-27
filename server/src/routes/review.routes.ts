import express from 'express';
import {
  checkCanReview,
  submitReviewHandler,
  getLeadReview,
  getProfessionalReviewsHandler,
} from '../controllers/review.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { submitReviewSchema } from '../schemas/review.schema';

const router = express.Router();

/**
 * Check if user can review a lead
 * GET /api/v1/reviews/can-review/:leadId
 */
router.get(
  '/can-review/:leadId',
  authenticate,
  authorize('homeowner'),
  checkCanReview
);

/**
 * Submit a review
 * POST /api/v1/reviews
 */
router.post(
  '/',
  authenticate,
  authorize('homeowner'),
  validate(submitReviewSchema),
  submitReviewHandler
);

/**
 * Get review for a specific lead
 * GET /api/v1/reviews/lead/:leadId
 */
router.get(
  '/lead/:leadId',
  optionalAuth,
  getLeadReview
);

/**
 * Get all reviews for a professional
 * GET /api/v1/reviews/professional/:professionalId
 */
router.get(
  '/professional/:professionalId',
  optionalAuth,
  getProfessionalReviewsHandler
);

export default router;

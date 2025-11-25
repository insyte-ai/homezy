import express from 'express';
import {
  submitQuote,
  updateQuote,
  getQuoteById,
  getQuotesForLead,
  getMyQuoteForLead,
  getMyQuotes,
  acceptQuote,
  declineQuote,
  deleteQuote,
} from '../controllers/quote.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  submitQuoteSchema,
  updateQuoteSchema,
  acceptQuoteSchema,
  declineQuoteSchema,
  getQuotesForLeadSchema,
  getMyQuotesSchema,
} from '../schemas/quote.schema';

const router = express.Router();

/**
 * Quote Routes
 */

// Get my quotes (professional view)
router.get(
  '/my-quotes',
  authenticate,
  authorize('pro'),
  validate(getMyQuotesSchema, 'query'),
  getMyQuotes
);

// Get quote by ID
router.get(
  '/:id',
  authenticate,
  getQuoteById
);

// Update quote (professional only, before acceptance)
router.patch(
  '/:id',
  authenticate,
  authorize('pro'),
  validate(updateQuoteSchema),
  updateQuote
);

// Delete quote (professional only, before acceptance)
router.delete(
  '/:id',
  authenticate,
  authorize('pro'),
  deleteQuote
);

// Accept quote (homeowner only)
router.post(
  '/:id/accept',
  authenticate,
  authorize('homeowner'),
  validate(acceptQuoteSchema),
  acceptQuote
);

// Decline quote (homeowner only)
router.post(
  '/:id/decline',
  authenticate,
  authorize('homeowner'),
  validate(declineQuoteSchema),
  declineQuote
);

/**
 * Lead-specific quote routes
 * These are mounted under /leads/:leadId/quotes in the main app
 */
export const leadQuoteRouter = express.Router({ mergeParams: true });

// Get my quote for a lead (professional only)
leadQuoteRouter.get(
  '/my-quote',
  authenticate,
  authorize('pro'),
  getMyQuoteForLead
);

// Submit quote for a lead (professional only)
leadQuoteRouter.post(
  '/',
  authenticate,
  authorize('pro'),
  validate(submitQuoteSchema),
  submitQuote
);

// Get all quotes for a lead (homeowner only)
leadQuoteRouter.get(
  '/',
  authenticate,
  authorize('homeowner'),
  validate(getQuotesForLeadSchema, 'query'),
  getQuotesForLead
);

export default router;

import express from 'express';
import { search } from '../controllers/search.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * Search across requests, quotes, and professionals
 * GET /api/v1/search?q=<query>&limit=5
 * Requires authentication as homeowner
 */
router.get(
  '/',
  authenticate,
  authorize('homeowner'),
  search
);

export default router;

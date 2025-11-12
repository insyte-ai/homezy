import express from 'express';
import {
  createLead,
  getLeadById,
  updateLead,
  cancelLead,
  browseLeads,
  getMyLeads,
  getMyClaimedLeads,
  claimLead,
  getClaimsForLead,
} from '../controllers/lead.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createLeadSchema,
  updateLeadSchema,
  getLeadsSchema,
  getMyLeadsSchema,
  getMyClaimedLeadsSchema,
  cancelLeadSchema,
} from '../schemas/lead.schema';

const router = express.Router();

/**
 * Homeowner Routes (must come before /:id routes to avoid conflicts)
 */

// Create lead
router.post(
  '/',
  authenticate,
  authorize('homeowner'),
  validate(createLeadSchema),
  createLead
);

// Get my leads
router.get(
  '/my-leads',
  authenticate,
  authorize('homeowner'),
  validate(getMyLeadsSchema, 'query'),
  getMyLeads
);

/**
 * Professional Routes (must come before /:id routes to avoid conflicts)
 */

// Get my claimed leads
router.get(
  '/my-claims',
  authenticate,
  authorize('pro'),
  validate(getMyClaimedLeadsSchema, 'query'),
  getMyClaimedLeads
);

/**
 * Public/Optional Auth Routes
 */

// Browse marketplace (optionally authenticated for claim status)
router.get(
  '/marketplace',
  optionalAuth,
  validate(getLeadsSchema, 'query'),
  browseLeads
);

/**
 * Parameterized Routes (must come after specific routes)
 */

// Update lead (homeowner only)
router.patch(
  '/:id',
  authenticate,
  authorize('homeowner'),
  validate(updateLeadSchema),
  updateLead
);

// Cancel lead (homeowner only)
router.post(
  '/:id/cancel',
  authenticate,
  authorize('homeowner'),
  validate(cancelLeadSchema),
  cancelLead
);

// Get claims for a lead (homeowner only)
router.get(
  '/:id/claims',
  authenticate,
  authorize('homeowner'),
  getClaimsForLead
);

// Claim lead (professional only)
router.post(
  '/:id/claim',
  authenticate,
  authorize('pro'),
  claimLead
);

// Get lead by ID (optionally authenticated for full details)
// Must be last among GET /:id routes
router.get(
  '/:id',
  optionalAuth,
  getLeadById
);

export default router;

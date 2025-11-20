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
  createDirectLead,
  getMyDirectLeads,
  acceptDirectLead,
  declineDirectLead,
  generateLeadContent,
  sendDirectLeadsToSelectedPros,
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
  createDirectLeadSchema,
  getMyDirectLeadsSchema,
  declineDirectLeadSchema,
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

// Create direct lead (sent to specific professional)
router.post(
  '/direct',
  authenticate,
  authorize('homeowner'),
  validate(createDirectLeadSchema),
  createDirectLead
);

// Generate AI-powered lead title and description
// Uses optionalAuth to allow both authenticated and guest users
router.post(
  '/generate-content',
  optionalAuth,
  generateLeadContent
);

// Send direct leads to selected professionals
router.post(
  '/send-to-pros',
  authenticate,
  authorize('homeowner'),
  sendDirectLeadsToSelectedPros
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

// Get my direct leads (leads sent directly to me)
router.get(
  '/my-direct-leads',
  authenticate,
  authorize('pro'),
  validate(getMyDirectLeadsSchema, 'query'),
  getMyDirectLeads
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

// Accept direct lead (professional only - target professional)
router.post(
  '/:id/accept-direct',
  authenticate,
  authorize('pro'),
  acceptDirectLead
);

// Decline direct lead (professional only - target professional)
router.post(
  '/:id/decline-direct',
  authenticate,
  authorize('pro'),
  validate(declineDirectLeadSchema),
  declineDirectLead
);

// Get lead by ID (optionally authenticated for full details)
// Must be last among GET /:id routes
router.get(
  '/:id',
  optionalAuth,
  getLeadById
);

export default router;

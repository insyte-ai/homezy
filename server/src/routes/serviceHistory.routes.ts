import express from 'express';
import {
  createServiceHistory,
  getMyServiceHistory,
  getServiceHistoryById,
  getServiceTimeline,
  getServicesByCategory,
  updateServiceHistory,
  deleteServiceHistory,
} from '../controllers/serviceHistory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createServiceHistorySchema,
  updateServiceHistorySchema,
  getServiceHistoryByIdSchema,
  deleteServiceHistorySchema,
  listServiceHistorySchema,
  getServiceTimelineSchema,
  getServicesByCategorySchema,
} from '../schemas/serviceHistory.schema';

const router = express.Router();

// All routes require authentication and homeowner role
router.use(authenticate);
router.use(authorize('homeowner'));

// Create service history entry
router.post(
  '/',
  validate(createServiceHistorySchema),
  createServiceHistory
);

// Get all service history for the authenticated user
router.get(
  '/',
  validate(listServiceHistorySchema, 'query'),
  getMyServiceHistory
);

// Get service timeline (must be before /:id route)
router.get(
  '/timeline',
  validate(getServiceTimelineSchema, 'query'),
  getServiceTimeline
);

// Get services grouped by category (must be before /:id route)
router.get(
  '/by-category',
  validate(getServicesByCategorySchema, 'query'),
  getServicesByCategory
);

// Get service history entry by ID
router.get(
  '/:id',
  validate(getServiceHistoryByIdSchema, 'params'),
  getServiceHistoryById
);

// Update service history entry
router.patch(
  '/:id',
  validate(updateServiceHistorySchema),
  updateServiceHistory
);

// Delete service history entry
router.delete(
  '/:id',
  validate(deleteServiceHistorySchema, 'params'),
  deleteServiceHistory
);

export default router;

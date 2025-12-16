import express from 'express';
import {
  createProjectResource,
  getProjectResources,
  getProjectResourceById,
  updateProjectResource,
  deleteProjectResource,
  toggleFavorite,
  moveResource,
  copyResource,
  getResourceCounts,
} from '../controllers/projectResource.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProjectResourceSchema,
  updateProjectResourceSchema,
  getProjectResourceByIdSchema,
  deleteProjectResourceSchema,
  listProjectResourcesSchema,
  toggleFavoriteSchema,
  moveResourceSchema,
  copyResourceSchema,
} from '../schemas/projectResource.schema';

// Use mergeParams to access :id from parent router
const router = express.Router({ mergeParams: true });

// All routes require authentication and homeowner role
router.use(authenticate);
router.use(authorize('homeowner'));

// Get resource counts by type (must be before /:resourceId routes)
router.get(
  '/counts',
  getResourceCounts
);

// Create resource
router.post(
  '/',
  validate(createProjectResourceSchema),
  createProjectResource
);

// Get all resources for project
router.get(
  '/',
  validate(listProjectResourcesSchema),
  getProjectResources
);

// Get resource by ID
router.get(
  '/:resourceId',
  validate(getProjectResourceByIdSchema, 'params'),
  getProjectResourceById
);

// Update resource
router.patch(
  '/:resourceId',
  validate(updateProjectResourceSchema),
  updateProjectResource
);

// Delete resource
router.delete(
  '/:resourceId',
  validate(deleteProjectResourceSchema, 'params'),
  deleteProjectResource
);

// Toggle favorite
router.post(
  '/:resourceId/favorite',
  validate(toggleFavoriteSchema, 'params'),
  toggleFavorite
);

// Move resource to another project
router.post(
  '/:resourceId/move',
  validate(moveResourceSchema),
  moveResource
);

// Copy resource to another project
router.post(
  '/:resourceId/copy',
  validate(copyResourceSchema),
  copyResource
);

export default router;

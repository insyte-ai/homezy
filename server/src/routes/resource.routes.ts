import { Router } from 'express';
import { resourceController } from '../controllers/resource.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes - for frontend resource center
router.get('/', resourceController.getResources);
router.get('/featured', resourceController.getFeaturedResources);
router.get('/popular', resourceController.getPopularResources);
router.get('/latest', resourceController.getLatestResources);
router.get('/stats', resourceController.getResourceStats);
router.get('/slug/:slug', resourceController.getResourceBySlug);
router.get('/slug/:slug/related', resourceController.getRelatedResources);

// Admin routes - for CMS management
router.get(
  '/admin/all',
  authenticate,
  authorize('admin'),
  resourceController.getAllResourcesAdmin
);

router.get(
  '/admin/:id',
  authenticate,
  authorize('admin'),
  resourceController.getResourceById
);

router.post(
  '/admin',
  authenticate,
  authorize('admin'),
  resourceController.createResource
);

router.put(
  '/admin/:id',
  authenticate,
  authorize('admin'),
  resourceController.updateResource
);

router.delete(
  '/admin/:id',
  authenticate,
  authorize('admin'),
  resourceController.deleteResource
);

router.post(
  '/admin/bulk-update',
  authenticate,
  authorize('admin'),
  resourceController.bulkUpdateResources
);

router.post(
  '/admin/bulk-delete',
  authenticate,
  authorize('admin'),
  resourceController.bulkDeleteResources
);

export default router;

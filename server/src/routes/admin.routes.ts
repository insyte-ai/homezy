import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getRecentActivity,
  getProfessionals,
  getProfessionalById,
  approveProfessional,
  rejectProfessional,
  updateTradeLicenseExpiry,
  getHomeowners,
  getHomeownerById,
  getLeads,
  getLeadById,
  getCreditTransactions,
  reloadKnowledgeBase,
  getKnowledgeBaseStats,
} from '../controllers/admin.controller';
import * as adminIdeasController from '../controllers/admin.ideas.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/activity', getRecentActivity);

// Professional management routes
router.get('/professionals', getProfessionals);
router.get('/professionals/:id', getProfessionalById);
router.post('/professionals/:id/approve', approveProfessional);
router.post('/professionals/:id/reject', rejectProfessional);
router.put('/professionals/:id/trade-license-expiry', updateTradeLicenseExpiry);

// Homeowner management routes
router.get('/homeowners', getHomeowners);
router.get('/homeowners/:id', getHomeownerById);

// Lead management routes
router.get('/leads', getLeads);
router.get('/leads/:id', getLeadById);

// Credit management routes
router.get('/credits', getCreditTransactions);

// Knowledge base management routes
router.get('/knowledge-base/stats', getKnowledgeBaseStats);
router.post('/knowledge-base/reload', reloadKnowledgeBase);

// ============================================================================
// Ideas Moderation Routes
// ============================================================================

// Get moderation statistics
router.get('/ideas/stats', adminIdeasController.getStats);

// List all photos for moderation
router.get('/ideas/photos', adminIdeasController.listPhotos);

// Bulk update photo status
router.post('/ideas/photos/bulk-status', adminIdeasController.bulkUpdateStatus);

// Bulk publish/unpublish to Ideas
router.post('/ideas/photos/bulk-publish', adminIdeasController.bulkPublish);
router.post('/ideas/photos/bulk-unpublish', adminIdeasController.bulkUnpublish);

// Get a single photo
router.get('/ideas/photos/:projectId/:photoId', adminIdeasController.getPhoto);

// Update photo status (remove/restore/flag)
router.patch('/ideas/photos/:projectId/:photoId/status', adminIdeasController.updatePhotoStatus);

// Publish/unpublish a photo to Ideas
router.post('/ideas/photos/:projectId/:photoId/publish', adminIdeasController.publishPhoto);
router.post('/ideas/photos/:projectId/:photoId/unpublish', adminIdeasController.unpublishPhoto);

export default router;

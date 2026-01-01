import express from 'express';
import {
  acceptAgreement,
  completeOnboarding,
  getMyProfile,
  previewMyProfile,
  getProProfile,
  updateProfile,
  uploadVerificationDocument,
  searchPros,
  getProAnalytics,
  getMatchingPros,
} from '../controllers/pro.controller';
import * as projectController from '../controllers/project.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  onboardingSchema,
  updateProProfileSchema,
  proAgreementSchema,
} from '../schemas/pro.schema';
import { uploadDocument } from '../middleware/upload.middleware';

const router = express.Router();

/**
 * Public Routes
 */

// Search pros
router.get('/search', searchPros);

// Get matching pros for a lead (category + location based)
router.get('/matching', getMatchingPros);

/**
 * Private Routes (Pro only)
 * NOTE: These must come BEFORE /:id route to avoid matching 'me' as an ID
 */

// Complete onboarding
router.post(
  '/onboarding',
  authenticate,
  authorize('pro'),
  validate(onboardingSchema),
  completeOnboarding
);

// Accept pro agreement (for mobile or existing pros)
router.post(
  '/agreement',
  authenticate,
  authorize('pro'),
  validate(proAgreementSchema),
  acceptAgreement
);

// Get current pro's profile
router.get(
  '/me',
  authenticate,
  authorize('pro'),
  getMyProfile
);

// Get analytics
router.get(
  '/me/analytics',
  authenticate,
  authorize('pro'),
  getProAnalytics
);

// Preview own profile (what public will see)
router.get(
  '/me/preview',
  authenticate,
  authorize('pro'),
  previewMyProfile
);

// Get public pro profile (must come after /me to avoid conflicts)
router.get('/:id', getProProfile);

// Update pro profile
router.put(
  '/me',
  authenticate,
  authorize('pro'),
  validate(updateProProfileSchema),
  updateProfile
);

// Upload verification document
router.post(
  '/me/verification/upload',
  authenticate,
  authorize('pro'),
  uploadDocument.single('document'),
  uploadVerificationDocument
);

// ============================================================================
// Pro Projects (Unified Portfolio System)
// ============================================================================

// Get project statistics
router.get(
  '/me/projects/stats',
  authenticate,
  authorize('pro'),
  projectController.getProjectStats
);

// List all projects
router.get(
  '/me/projects',
  authenticate,
  authorize('pro'),
  projectController.listProjects
);

// Create a new project
router.post(
  '/me/projects',
  authenticate,
  authorize('pro'),
  projectController.createProject
);

// Get a single project
router.get(
  '/me/projects/:projectId',
  authenticate,
  authorize('pro'),
  projectController.getProject
);

// Update a project
router.put(
  '/me/projects/:projectId',
  authenticate,
  authorize('pro'),
  projectController.updateProject
);

// Delete a project
router.delete(
  '/me/projects/:projectId',
  authenticate,
  authorize('pro'),
  projectController.deleteProject
);

// Add photos to a project
router.post(
  '/me/projects/:projectId/photos',
  authenticate,
  authorize('pro'),
  projectController.addPhotos
);

// Update a photo in a project
router.patch(
  '/me/projects/:projectId/photos/:photoId',
  authenticate,
  authorize('pro'),
  projectController.updatePhoto
);

// Delete a photo from a project
router.delete(
  '/me/projects/:projectId/photos/:photoId',
  authenticate,
  authorize('pro'),
  projectController.deletePhoto
);

// Toggle publish status for a photo
router.post(
  '/me/projects/:projectId/photos/:photoId/toggle-publish',
  authenticate,
  authorize('pro'),
  projectController.togglePhotoPublish
);

export default router;

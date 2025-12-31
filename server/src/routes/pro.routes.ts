import express from 'express';
import {
  acceptAgreement,
  completeOnboarding,
  getMyProfile,
  previewMyProfile,
  getProProfile,
  updateProfile,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  updateFeaturedProjects,
  uploadVerificationDocument,
  searchPros,
  getProAnalytics,
  getMatchingPros,
} from '../controllers/pro.controller';
import {
  createPhoto,
  listMyPhotos,
  updatePhoto,
  deletePhoto,
  togglePublish,
} from '../controllers/ideas.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  onboardingSchema,
  updateProProfileSchema,
  addPortfolioItemSchema,
  updatePortfolioItemSchema,
  updateFeaturedProjectsSchema,
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

// Add portfolio item
router.post(
  '/me/portfolio',
  authenticate,
  authorize('pro'),
  validate(addPortfolioItemSchema),
  addPortfolioItem
);

// Update portfolio item
router.put(
  '/me/portfolio/:itemId',
  authenticate,
  authorize('pro'),
  validate(updatePortfolioItemSchema),
  updatePortfolioItem
);

// Delete portfolio item
router.delete(
  '/me/portfolio/:itemId',
  authenticate,
  authorize('pro'),
  deletePortfolioItem
);

// Update featured projects
router.put(
  '/me/featured-projects',
  authenticate,
  authorize('pro'),
  validate(updateFeaturedProjectsSchema),
  updateFeaturedProjects
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
// Portfolio Photos (Ideas)
// ============================================================================

// List my photos
router.get(
  '/me/photos',
  authenticate,
  authorize('pro'),
  listMyPhotos
);

// Create a new photo
router.post(
  '/me/photos',
  authenticate,
  authorize('pro'),
  createPhoto
);

// Update a photo
router.patch(
  '/me/photos/:photoId',
  authenticate,
  authorize('pro'),
  updatePhoto
);

// Delete a photo
router.delete(
  '/me/photos/:photoId',
  authenticate,
  authorize('pro'),
  deletePhoto
);

// Toggle publish status
router.post(
  '/me/photos/:photoId/publish',
  authenticate,
  authorize('pro'),
  togglePublish
);

export default router;

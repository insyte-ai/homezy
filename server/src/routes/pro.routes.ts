import express from 'express';
import {
  getMyProfile,
  getProProfile,
  updateProfile,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  updateFeaturedProjects,
  uploadVerificationDocument,
  searchPros,
} from '../controllers/pro.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  updateProProfileSchema,
  addPortfolioItemSchema,
  updatePortfolioItemSchema,
  updateFeaturedProjectsSchema,
  uploadVerificationDocumentSchema,
} from '../schemas/pro.schema';

const router = express.Router();

/**
 * Public Routes
 */

// Search pros
router.get('/search', searchPros);

// Get public pro profile
router.get('/:id', getProProfile);

/**
 * Private Routes (Pro only)
 */

// Get current pro's profile
router.get(
  '/me',
  authenticate,
  authorize('pro'),
  getMyProfile
);

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
  validate(uploadVerificationDocumentSchema),
  uploadVerificationDocument
);

export default router;

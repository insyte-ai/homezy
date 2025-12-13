import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { uploadImage, uploadDocument } from '../middleware/upload.middleware';
import { asyncHandler } from '../middleware/errorHandler.middleware';
import { rateLimitUpload } from '../middleware/rateLimit.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/v1/upload/lead-image
 * @desc    Upload a lead image
 * @access  Public (rate limited)
 */
router.post(
  '/lead-image',
  rateLimitUpload,
  uploadImage.single('image'),
  asyncHandler(uploadController.uploadLeadImage)
);

/**
 * @route   POST /api/v1/upload/verification-document
 * @desc    Upload a verification document (PDF or image)
 * @access  Private (Pro only, rate limited)
 */
router.post(
  '/verification-document',
  authenticate,
  authorize('pro'),
  rateLimitUpload,
  uploadDocument.single('document'),
  asyncHandler(uploadController.uploadVerificationDoc)
);

/**
 * @route   POST /api/v1/upload/quote-document
 * @desc    Upload a quote document (PDF or image)
 * @access  Private (Pro only, rate limited)
 */
router.post(
  '/quote-document',
  authenticate,
  authorize('pro'),
  rateLimitUpload,
  uploadDocument.single('document'),
  asyncHandler(uploadController.uploadQuoteDocument)
);

/**
 * @route   POST /api/v1/upload/portfolio-images
 * @desc    Upload portfolio images (multiple)
 * @access  Private (Pro only, rate limited)
 */
router.post(
  '/portfolio-images',
  authenticate,
  authorize('pro'),
  rateLimitUpload,
  uploadImage.array('images', 10), // Max 10 images at once
  asyncHandler(uploadController.uploadPortfolioImages)
);

export default router;

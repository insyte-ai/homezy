import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { uploadImage } from '../middleware/upload.middleware';
import { asyncHandler } from '../middleware/errorHandler.middleware';
import { rateLimitUpload } from '../middleware/rateLimit.middleware';

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

export default router;

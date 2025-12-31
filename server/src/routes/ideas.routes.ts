import express from 'express';
import {
  listIdeas,
  getPhotoById,
  getCategoryCounts,
  getSaveStatus,
  savePhoto,
  unsavePhoto,
  getSavedPhotos,
} from '../controllers/ideas.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

// ============================================================================
// Public Routes
// ============================================================================

// List ideas with optional filtering
router.get('/', listIdeas);

// Get category counts for sidebar
router.get('/categories', getCategoryCounts);

// ============================================================================
// Authenticated Routes
// ============================================================================

// Get user's saved photos
router.get('/saved', authenticate, getSavedPhotos);

// Get single photo (with optional auth to check save status)
router.get('/:photoId', optionalAuth, getPhotoById);

// Check save status
router.get('/:photoId/save-status', authenticate, getSaveStatus);

// Save a photo
router.post('/:photoId/save', authenticate, savePhoto);

// Unsave a photo
router.delete('/:photoId/save', authenticate, unsavePhoto);

export default router;

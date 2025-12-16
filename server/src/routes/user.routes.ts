import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler.middleware';
import {
  updateProfileSchema,
  updateNotificationPreferencesSchema,
  changePasswordSchema,
} from '../schemas/user.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Update user profile (firstName, lastName, phone)
 * @access  Private (Homeowner, Pro, Admin)
 */
router.patch(
  '/profile',
  validate(updateProfileSchema),
  asyncHandler(userController.updateProfile)
);

/**
 * @route   GET /api/v1/users/notification-preferences
 * @desc    Get notification preferences
 * @access  Private (Homeowner, Pro, Admin)
 */
router.get(
  '/notification-preferences',
  asyncHandler(userController.getNotificationPreferences)
);

/**
 * @route   PATCH /api/v1/users/notification-preferences
 * @desc    Update notification preferences
 * @access  Private (Homeowner, Pro, Admin)
 */
router.patch(
  '/notification-preferences',
  validate(updateNotificationPreferencesSchema),
  asyncHandler(userController.updateNotificationPreferences)
);

/**
 * @route   PATCH /api/v1/users/change-password
 * @desc    Change user password
 * @access  Private (Homeowner, Pro, Admin)
 */
router.patch(
  '/change-password',
  validate(changePasswordSchema),
  asyncHandler(userController.changePassword)
);

/**
 * @route   PATCH /api/v1/users/onboarding
 * @desc    Update homeowner onboarding status
 * @access  Private (Homeowner)
 */
router.patch(
  '/onboarding',
  asyncHandler(userController.updateOnboardingStatus)
);

export default router;

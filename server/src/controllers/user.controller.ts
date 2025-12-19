import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';
import { BadRequestError, UnauthorizedError } from '../middleware/errorHandler.middleware';
import { pushService } from '../services/push.service';

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/users/profile
 * @access  Private (Homeowner, Pro, Admin)
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { firstName, lastName, phone } = req.body;

  logger.info('Updating user profile', { userId, updates: Object.keys(req.body) });

  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Update fields if provided
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;

  await user.save();

  logger.info('User profile updated successfully', { userId });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    },
  });
};

/**
 * @desc    Update notification preferences
 * @route   PATCH /api/v1/users/notification-preferences
 * @access  Private (Homeowner, Pro, Admin)
 */
export const updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const preferences = req.body;

  logger.info('Updating notification preferences', { userId });

  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Initialize homeownerProfile if it doesn't exist
  if (!user.homeownerProfile) {
    user.homeownerProfile = {
      favoritePros: [],
      savedSearches: [],
      notificationPreferences: {
        email: {
          newQuote: true,
          newMessage: true,
          projectUpdate: true,
          reviewRequest: true,
          marketing: false,
          serviceReminders: true,
          seasonalReminders: true,
          expenseAlerts: true,
        },
        push: {
          newQuote: true,
          newMessage: true,
          projectUpdate: true,
          serviceReminders: true,
        },
      },
      onboardingCompleted: false,
    };
  }

  // Initialize notificationPreferences if it doesn't exist
  if (!user.homeownerProfile.notificationPreferences) {
    user.homeownerProfile.notificationPreferences = {
      email: {
        newQuote: true,
        newMessage: true,
        projectUpdate: true,
        reviewRequest: true,
        marketing: false,
        serviceReminders: true,
        seasonalReminders: true,
        expenseAlerts: true,
      },
      push: {
        newQuote: true,
        newMessage: true,
        projectUpdate: true,
        serviceReminders: true,
      },
    };
  }

  // Update preferences (deep merge)
  if (preferences.email) {
    user.homeownerProfile.notificationPreferences.email = {
      ...user.homeownerProfile.notificationPreferences.email,
      ...preferences.email,
    };
  }

  if (preferences.push) {
    user.homeownerProfile.notificationPreferences.push = {
      ...user.homeownerProfile.notificationPreferences.push,
      ...preferences.push,
    };
  }

  if (preferences.doNotDisturbStart !== undefined) {
    user.homeownerProfile.notificationPreferences.doNotDisturbStart = preferences.doNotDisturbStart;
  }

  if (preferences.doNotDisturbEnd !== undefined) {
    user.homeownerProfile.notificationPreferences.doNotDisturbEnd = preferences.doNotDisturbEnd;
  }

  await user.save();

  logger.info('Notification preferences updated successfully', { userId });

  res.status(200).json({
    success: true,
    message: 'Notification preferences updated successfully',
    data: {
      notificationPreferences: user.homeownerProfile.notificationPreferences,
    },
  });
};

/**
 * @desc    Change user password
 * @route   PATCH /api/v1/users/change-password
 * @access  Private (Homeowner, Pro, Admin)
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  logger.info('Changing user password', { userId });

  // Find user with password field (it's excluded by default)
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Check if user is a guest account (shouldn't have password change)
  if (user.isGuestAccount && !user.hasSetPassword) {
    throw new BadRequestError('Guest accounts must use magic link to set password');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Update password (will be hashed in pre-save hook)
  user.password = newPassword;

  // Increment refresh token version to invalidate all existing sessions
  await user.incrementRefreshTokenVersion();

  await user.save();

  logger.info('Password changed successfully', { userId });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please login again with your new password.',
  });
};

/**
 * @desc    Update homeowner onboarding status
 * @route   PATCH /api/v1/users/onboarding
 * @access  Private (Homeowner)
 */
export const updateOnboardingStatus = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { completed, skipped } = req.body;

  logger.info('Updating onboarding status', { userId, completed, skipped });

  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (user.role !== 'homeowner') {
    throw new BadRequestError('Only homeowners have onboarding');
  }

  // Initialize homeownerProfile if it doesn't exist
  if (!user.homeownerProfile) {
    user.homeownerProfile = {
      favoritePros: [],
      savedSearches: [],
      notificationPreferences: {
        email: {
          newQuote: true,
          newMessage: true,
          projectUpdate: true,
          reviewRequest: true,
          marketing: false,
          serviceReminders: true,
          seasonalReminders: true,
          expenseAlerts: true,
        },
        push: {
          newQuote: true,
          newMessage: true,
          projectUpdate: true,
          serviceReminders: true,
        },
      },
      onboardingCompleted: false,
    };
  }

  if (completed) {
    user.homeownerProfile.onboardingCompleted = true;
  }

  if (skipped) {
    user.homeownerProfile.onboardingSkippedAt = new Date();
  }

  await user.save();

  logger.info('Onboarding status updated successfully', { userId, completed, skipped });

  res.status(200).json({
    success: true,
    message: 'Onboarding status updated successfully',
    data: {
      onboardingCompleted: user.homeownerProfile.onboardingCompleted,
      onboardingSkippedAt: user.homeownerProfile.onboardingSkippedAt,
    },
  });
};

/**
 * @desc    Get notification preferences
 * @route   GET /api/v1/users/notification-preferences
 * @access  Private (Homeowner, Pro, Admin)
 */
export const getNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  logger.info('Getting notification preferences', { userId });

  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Return default preferences if not set
  const defaultPreferences = {
    email: {
      newQuote: true,
      newMessage: true,
      projectUpdate: true,
      reviewRequest: true,
      marketing: false,
    },
    push: {
      newQuote: true,
      newMessage: true,
      projectUpdate: true,
    },
  };

  const preferences = user.homeownerProfile?.notificationPreferences || defaultPreferences;

  res.status(200).json({
    success: true,
    data: {
      notificationPreferences: preferences,
    },
  });
};

/**
 * @desc    Register a push token for the current user
 * @route   POST /api/v1/users/push-token
 * @access  Private (Homeowner, Pro, Admin)
 */
export const registerPushToken = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { token, platform, deviceId } = req.body;

  logger.info('Registering push token', { userId, platform, deviceId });

  if (!token) {
    throw new BadRequestError('Push token is required');
  }

  if (!platform || !['ios', 'android', 'web'].includes(platform)) {
    throw new BadRequestError('Valid platform is required (ios, android, or web)');
  }

  await pushService.registerPushToken(userId!, token, platform, deviceId);

  res.status(200).json({
    success: true,
    message: 'Push token registered successfully',
  });
};

/**
 * @desc    Remove a push token for the current user
 * @route   DELETE /api/v1/users/push-token
 * @access  Private (Homeowner, Pro, Admin)
 */
export const removePushToken = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { token } = req.body;

  logger.info('Removing push token', { userId });

  if (!token) {
    throw new BadRequestError('Push token is required');
  }

  await pushService.removePushToken(userId!, token);

  res.status(200).json({
    success: true,
    message: 'Push token removed successfully',
  });
};

/**
 * @desc    Remove all push tokens for the current user (logout from all devices)
 * @route   DELETE /api/v1/users/push-tokens
 * @access  Private (Homeowner, Pro, Admin)
 */
export const removeAllPushTokens = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  logger.info('Removing all push tokens', { userId });

  await pushService.removeAllPushTokens(userId!);

  res.status(200).json({
    success: true,
    message: 'All push tokens removed successfully',
  });
};

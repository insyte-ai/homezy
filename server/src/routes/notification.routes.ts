import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/notifications
 * @desc    Get paginated notifications for current user
 * @access  Private
 * @query   page, limit, read (boolean), category
 */
router.get('/', asyncHandler(notificationController.getNotifications));

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', asyncHandler(notificationController.getUnreadCount));

/**
 * @route   PATCH /api/v1/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/mark-all-read', asyncHandler(notificationController.markAllAsRead));

/**
 * @route   DELETE /api/v1/notifications/clear-read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete('/clear-read', asyncHandler(notificationController.deleteAllRead));

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private
 */
router.patch('/:id/read', asyncHandler(notificationController.markAsRead));

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a single notification
 * @access  Private
 */
router.delete('/:id', asyncHandler(notificationController.deleteNotification));

export default router;

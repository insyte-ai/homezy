import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { NotificationCategory } from '../models/Notification.model';
import { logger } from '../utils/logger';
import { UnauthorizedError, NotFoundError } from '../middleware/errorHandler.middleware';

/**
 * @desc    Get paginated notifications for current user
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const {
    page = '1',
    limit = '20',
    read,
    category,
  } = req.query;

  const result = await notificationService.getNotifications(userId, {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
    read: read !== undefined ? read === 'true' : undefined,
    category: category as NotificationCategory | undefined,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/v1/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const unreadCount = await notificationService.getUnreadCount(userId);

  res.status(200).json({
    success: true,
    data: { unreadCount },
  });
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const { id } = req.params;
  const notification = await notificationService.markAsRead(id, userId);

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { notification },
  });
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/v1/notifications/mark-all-read
 * @access  Private
 */
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const result = await notificationService.markAllAsRead(userId);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    data: result,
  });
};

/**
 * @desc    Delete a single notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const { id } = req.params;
  const deleted = await notificationService.deleteNotification(id, userId);

  if (!deleted) {
    throw new NotFoundError('Notification not found');
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
};

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/v1/notifications/clear-read
 * @access  Private
 */
export const deleteAllRead = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const result = await notificationService.deleteAllRead(userId);

  res.status(200).json({
    success: true,
    message: 'Read notifications deleted',
    data: result,
  });
};

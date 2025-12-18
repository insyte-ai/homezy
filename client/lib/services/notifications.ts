import { api } from '../api';
import {
  Bell,
  CheckCircle,
  FileText,
  MessageSquare,
  AlertTriangle,
  Briefcase,
} from 'lucide-react';

/**
 * Notification Service
 *
 * Handles in-app notifications for all user types.
 * Works with Socket.io for real-time updates.
 */

// Types
export type NotificationType =
  | 'verification_doc_uploaded'
  | 'new_pro_registration'
  | 'new_lead_submitted'
  | 'lead_assigned'
  | 'lead_claimed'
  | 'quote_accepted'
  | 'quote_rejected'
  | 'verification_approved'
  | 'verification_rejected'
  | 'quote_received'
  | 'pro_messaged'
  | 'lead_matched'
  | 'system_alert';

export type NotificationPriority = 'low' | 'medium' | 'high';

export type NotificationCategory =
  | 'verification'
  | 'lead'
  | 'quote'
  | 'message'
  | 'system';

export interface Notification {
  _id: string;
  recipient: string;
  recipientRole: 'admin' | 'pro' | 'homeowner';
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsPagination {
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
  limit: number;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: NotificationsPagination;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

// API Methods

/**
 * Get paginated notifications for current user
 */
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  read?: boolean;
  category?: NotificationCategory;
}): Promise<NotificationsResponse> => {
  const response = await api.get<NotificationsResponse>('/notifications', {
    params,
  });
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await api.get<UnreadCountResponse>(
    '/notifications/unread-count'
  );
  return response.data;
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (
  notificationId: string
): Promise<{ success: boolean; data: { notification: Notification } }> => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<{
  success: boolean;
  data: { modifiedCount: number };
}> => {
  const response = await api.patch('/notifications/mark-all-read');
  return response.data;
};

/**
 * Delete a single notification
 */
export const deleteNotification = async (
  notificationId: string
): Promise<{ success: boolean }> => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

/**
 * Delete all read notifications
 */
export const deleteAllRead = async (): Promise<{
  success: boolean;
  data: { deletedCount: number };
}> => {
  const response = await api.delete('/notifications/clear-read');
  return response.data;
};

// UI Helper Methods

/**
 * Get icon component for notification category
 */
export const getNotificationIcon = (category: NotificationCategory) => {
  switch (category) {
    case 'verification':
      return FileText;
    case 'lead':
      return Briefcase;
    case 'quote':
      return CheckCircle;
    case 'message':
      return MessageSquare;
    case 'system':
      return AlertTriangle;
    default:
      return Bell;
  }
};

/**
 * Get color classes for notification category
 */
export const getNotificationColor = (
  category: NotificationCategory
): string => {
  switch (category) {
    case 'verification':
      return 'bg-blue-100 text-blue-600';
    case 'lead':
      return 'bg-green-100 text-green-600';
    case 'quote':
      return 'bg-purple-100 text-purple-600';
    case 'message':
      return 'bg-yellow-100 text-yellow-600';
    case 'system':
      return 'bg-red-100 text-red-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

/**
 * Get priority badge color
 */
export const getPriorityColor = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

/**
 * Format time relative to now (e.g., "2 minutes ago")
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  } else if (diffWeek < 4) {
    return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

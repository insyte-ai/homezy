import { create } from 'zustand';
import {
  Notification,
  NotificationCategory,
  getNotifications,
  getUnreadCount,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
  deleteNotification as deleteNotificationApi,
  deleteAllRead as deleteAllReadApi,
} from '@/lib/services/notifications';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;

  // Actions
  fetchNotifications: (params?: {
    page?: number;
    limit?: number;
    read?: boolean;
    category?: NotificationCategory;
    append?: boolean;
  }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notificationId: string) => Promise<void>;
  clearRead: () => Promise<void>;
  clearNotifications: () => void;
  setError: (error: string | null) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 1,

  // Fetch notifications with pagination
  fetchNotifications: async (params = {}) => {
    const { append = false, page = 1, limit = 20, read, category } = params;

    set({ loading: true, error: null });

    try {
      // Fetch notifications and unread count in parallel
      const [notificationsResponse, unreadResponse] = await Promise.all([
        getNotifications({ page, limit, read, category }),
        page === 1 ? getUnreadCount() : Promise.resolve(null),
      ]);

      const { notifications, pagination } = notificationsResponse.data;

      set((state) => ({
        notifications: append
          ? [...state.notifications, ...notifications]
          : notifications,
        hasMore: pagination.currentPage < pagination.totalPages,
        currentPage: pagination.currentPage,
        loading: false,
        // Update unread count if we fetched it
        ...(unreadResponse ? { unreadCount: unreadResponse.data.unreadCount } : {}),
      }));
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch notifications',
      });
    }
  },

  // Fetch unread count
  fetchUnreadCount: async () => {
    try {
      const response = await getUnreadCount();
      set({ unreadCount: response.data.unreadCount });
    } catch (error: any) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  // Add a new notification (from Socket.io)
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  // Mark single notification as read
  markAsRead: async (notificationId: string) => {
    try {
      await markAsReadApi(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await markAllAsReadApi();
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read: true,
          readAt: n.readAt || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      console.error('Failed to mark all as read:', error);
    }
  },

  // Remove a notification
  removeNotification: async (notificationId: string) => {
    try {
      await deleteNotificationApi(notificationId);
      set((state) => {
        const notification = state.notifications.find((n) => n._id === notificationId);
        return {
          notifications: state.notifications.filter((n) => n._id !== notificationId),
          unreadCount: notification && !notification.read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
    }
  },

  // Clear all read notifications
  clearRead: async () => {
    try {
      await deleteAllReadApi();
      set((state) => ({
        notifications: state.notifications.filter((n) => !n.read),
      }));
    } catch (error: any) {
      console.error('Failed to clear read notifications:', error);
    }
  },

  // Clear all notifications (client-side only, e.g., on logout)
  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      hasMore: true,
      currentPage: 1,
    });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));

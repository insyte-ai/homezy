'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import {
  Notification,
  getNotificationIcon,
  getNotificationColor,
  formatTime,
} from '@/lib/services/notifications';
import { useAuthStore } from '@/store/authStore';
import {
  connectMessagingSocket,
  disconnectMessagingSocket,
} from '@/lib/services/messages';

interface NotificationBellProps {
  notificationsPath?: string; // Path to full notifications page
}

export function NotificationBell({
  notificationsPath = '/dashboard/notifications',
}: NotificationBellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, isInitialized } = useAuthStore();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  // Fetch initial data when authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchUnreadCount();
      fetchNotifications({ limit: 5 });
    }
  }, [isInitialized, isAuthenticated]);

  // Setup Socket.io listener for real-time notifications
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    const accessToken =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken) return;

    const socket = connectMessagingSocket(accessToken);

    const handleNewNotification = (notification: Notification) => {
      console.log('Received notification via socket:', notification);
      addNotification(notification);
    };

    // Listen for notification events
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [isInitialized, isAuthenticated, addNotification]);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isInitialized, isAuthenticated]);

  // Refetch on page visibility change
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInitialized, isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push(notificationsPath);
  };

  // Get recent notifications (max 5)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && recentNotifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : recentNotifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.category);
                  const colorClass = getNotificationColor(notification.category);

                  return (
                    <li
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              !notification.read
                                ? 'font-semibold text-gray-900'
                                : 'text-gray-700'
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-primary-500 rounded-full" />
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <button
              onClick={handleViewAll}
              className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

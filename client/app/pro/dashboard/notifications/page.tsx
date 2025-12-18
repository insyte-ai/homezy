'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useNotificationStore } from '@/store/notificationStore';
import {
  Notification,
  NotificationCategory,
  getNotificationIcon,
  getNotificationColor,
  formatTime,
} from '@/lib/services/notifications';

export default function ProNotificationsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [selectedReadStatus, setSelectedReadStatus] = useState<'all' | 'unread' | 'read'>('all');

  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    currentPage,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearRead,
  } = useNotificationStore();

  // Fetch notifications on mount and filter change
  useEffect(() => {
    const params: {
      page: number;
      limit: number;
      read?: boolean;
      category?: NotificationCategory;
    } = { page: 1, limit: 20 };

    if (selectedReadStatus === 'unread') params.read = false;
    if (selectedReadStatus === 'read') params.read = true;
    if (selectedCategory !== 'all') params.category = selectedCategory;

    fetchNotifications(params);
  }, [selectedCategory, selectedReadStatus, fetchNotifications]);

  const handleLoadMore = () => {
    const params: {
      page: number;
      limit: number;
      append: boolean;
      read?: boolean;
      category?: NotificationCategory;
    } = { page: currentPage + 1, limit: 20, append: true };

    if (selectedReadStatus === 'unread') params.read = false;
    if (selectedReadStatus === 'read') params.read = true;
    if (selectedCategory !== 'all') params.category = selectedCategory;

    fetchNotifications(params);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await removeNotification(notificationId);
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const categories: { value: NotificationCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'verification', label: 'Verification' },
    { value: 'lead', label: 'Leads' },
    { value: 'quote', label: 'Quotes' },
    { value: 'message', label: 'Messages' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div className="container-custom py-8">
      {/* Back Link */}
      <Link
        href="/pro/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          )}
          <button
            onClick={clearRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as NotificationCategory | 'all')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Read Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Status:</label>
          <select
            value={selectedReadStatus}
            onChange={(e) => setSelectedReadStatus(e.target.value as 'all' | 'unread' | 'read')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {loading && notifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500">You&apos;re all caught up!</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.category);
                const colorClass = getNotificationColor(notification.category);

                return (
                  <li
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-primary-50/50' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p
                              className={`text-sm ${
                                !notification.read
                                  ? 'font-semibold text-gray-900'
                                  : 'text-gray-700'
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(e, notification._id)}
                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(e, notification._id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Load More */}
            {hasMore && (
              <div className="px-6 py-4 border-t border-gray-100">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full py-2 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

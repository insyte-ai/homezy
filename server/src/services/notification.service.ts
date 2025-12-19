import Notification, {
  INotification,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  RecipientRole,
} from '../models/Notification.model';
import { User } from '../models/User.model';
import { emitToUser, emitToUsers } from '../utils/socket.utils';
import { logger } from '../utils/logger';
import { pushService } from './push.service';

interface CreateNotificationParams {
  recipient: string;
  recipientRole: RecipientRole;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
}

interface GetNotificationsParams {
  page?: number;
  limit?: number;
  read?: boolean;
  category?: NotificationCategory;
}

interface PaginatedNotifications {
  notifications: INotification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
    limit: number;
  };
}

class NotificationService {
  /**
   * Create a notification, emit via Socket.io, and send push notification
   */
  async createNotification(params: CreateNotificationParams): Promise<INotification> {
    try {
      const notification = await Notification.create({
        recipient: params.recipient,
        recipientRole: params.recipientRole,
        type: params.type,
        category: params.category,
        priority: params.priority || NotificationPriority.MEDIUM,
        title: params.title,
        message: params.message,
        data: params.data,
        actionUrl: params.actionUrl,
      });

      // Emit to user via Socket.io for real-time updates
      emitToUser(params.recipient, 'notification:new', notification);

      // Send push notification for high priority or specific types
      const shouldSendPush = this.shouldSendPushNotification(params.type, params.priority);
      if (shouldSendPush) {
        // Map category to channel
        const channelId = this.getCategoryChannelId(params.category);

        // Send push notification (non-blocking)
        pushService.sendToUser({
          userId: params.recipient,
          title: params.title,
          body: params.message,
          data: {
            type: params.type,
            notificationId: notification._id?.toString(),
            actionUrl: params.actionUrl,
            ...params.data,
          },
          channelId,
          priority: params.priority === NotificationPriority.HIGH ? 'high' : 'default',
        }).catch((error) => {
          logger.warn('Failed to send push notification', { error, notificationId: notification._id });
        });
      }

      logger.info('Notification created', {
        notificationId: notification._id,
        recipient: params.recipient,
        type: params.type,
        pushSent: shouldSendPush,
      });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification', { error, params });
      throw error;
    }
  }

  /**
   * Determine if a push notification should be sent based on type and priority
   */
  private shouldSendPushNotification(
    type: NotificationType,
    priority?: NotificationPriority
  ): boolean {
    // Always send push for high priority
    if (priority === NotificationPriority.HIGH) {
      return true;
    }

    // Send push for specific notification types
    const pushEnabledTypes: NotificationType[] = [
      NotificationType.QUOTE_RECEIVED,
      NotificationType.QUOTE_ACCEPTED,
      NotificationType.QUOTE_REJECTED,
      NotificationType.LEAD_ASSIGNED,
      NotificationType.PRO_MESSAGED,
      NotificationType.VERIFICATION_APPROVED,
      NotificationType.VERIFICATION_REJECTED,
    ];

    return pushEnabledTypes.includes(type);
  }

  /**
   * Map notification category to push notification channel ID
   */
  private getCategoryChannelId(category: NotificationCategory): string {
    const channelMap: Record<NotificationCategory, string> = {
      [NotificationCategory.QUOTE]: 'leads',
      [NotificationCategory.LEAD]: 'leads',
      [NotificationCategory.MESSAGE]: 'messages',
      [NotificationCategory.VERIFICATION]: 'default',
      [NotificationCategory.SYSTEM]: 'default',
    };

    return channelMap[category] || 'default';
  }

  /**
   * Get paginated notifications for a user
   */
  async getNotifications(
    userId: string,
    params: GetNotificationsParams = {}
  ): Promise<PaginatedNotifications> {
    const { page = 1, limit = 20, read, category } = params;

    const query: any = {
      recipient: userId,
      expiresAt: { $gt: new Date() },
    };

    if (typeof read === 'boolean') {
      query.read = read;
    }

    if (category) {
      query.category = category;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return {
      notifications: notifications as unknown as INotification[],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        limit,
      },
    };
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({
      recipient: userId,
      read: false,
      expiresAt: { $gt: new Date() },
    });
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (notification) {
      logger.debug('Notification marked as read', { notificationId, userId });
    }

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );

    logger.info('All notifications marked as read', {
      userId,
      modifiedCount: result.modifiedCount,
    });

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await Notification.deleteOne({
      _id: notificationId,
      recipient: userId,
    });

    return result.deletedCount > 0;
  }

  /**
   * Delete all read notifications for a user
   */
  async deleteAllRead(userId: string): Promise<{ deletedCount: number }> {
    const result = await Notification.deleteMany({
      recipient: userId,
      read: true,
    });

    logger.info('Read notifications deleted', {
      userId,
      deletedCount: result.deletedCount,
    });

    return { deletedCount: result.deletedCount };
  }

  // ============================================
  // Helper methods for specific notification types
  // ============================================

  /**
   * Notify all admins when a pro uploads verification documents
   */
  async notifyAdminsVerificationUploaded(
    proId: string,
    proName: string,
    documentType: string
  ): Promise<void> {
    try {
      // Get all admin users
      const admins = await User.find({ role: 'admin' }).select('_id').lean();

      if (admins.length === 0) {
        logger.warn('No admin users found to notify');
        return;
      }

      const documentLabel = documentType === 'license' ? 'Trade License' : 'VAT Certificate';

      // Create notification for each admin
      const notifications = await Promise.all(
        admins.map((admin) =>
          this.createNotification({
            recipient: admin._id.toString(),
            recipientRole: 'admin',
            type: NotificationType.VERIFICATION_DOC_UPLOADED,
            category: NotificationCategory.VERIFICATION,
            priority: NotificationPriority.HIGH,
            title: 'New Verification Document',
            message: `${proName} uploaded a ${documentLabel} for review`,
            data: { proId, documentType },
            actionUrl: `/admin/professionals/${proId}`,
          })
        )
      );

      logger.info('Admins notified of verification document upload', {
        proId,
        documentType,
        adminCount: notifications.length,
      });
    } catch (error) {
      logger.error('Failed to notify admins of verification upload', {
        error,
        proId,
        documentType,
      });
    }
  }

  /**
   * Notify a pro when their verification is approved
   */
  async notifyProVerificationApproved(proId: string): Promise<void> {
    try {
      await this.createNotification({
        recipient: proId,
        recipientRole: 'pro',
        type: NotificationType.VERIFICATION_APPROVED,
        category: NotificationCategory.VERIFICATION,
        priority: NotificationPriority.HIGH,
        title: 'Verification Approved',
        message: 'Congratulations! Your verification has been approved. You can now claim leads.',
        actionUrl: '/pro/dashboard',
      });
    } catch (error) {
      logger.error('Failed to notify pro of verification approval', { error, proId });
    }
  }

  /**
   * Notify a pro when their verification is rejected
   */
  async notifyProVerificationRejected(proId: string, reason?: string): Promise<void> {
    try {
      await this.createNotification({
        recipient: proId,
        recipientRole: 'pro',
        type: NotificationType.VERIFICATION_REJECTED,
        category: NotificationCategory.VERIFICATION,
        priority: NotificationPriority.HIGH,
        title: 'Verification Rejected',
        message: reason
          ? `Your verification was rejected: ${reason}. Please upload new documents.`
          : 'Your verification was rejected. Please upload new documents.',
        data: { reason },
        actionUrl: '/pro/dashboard/verification',
      });
    } catch (error) {
      logger.error('Failed to notify pro of verification rejection', { error, proId });
    }
  }

  /**
   * Notify a pro when they receive a direct lead
   */
  async notifyProLeadAssigned(proId: string, leadId: string, leadTitle: string): Promise<void> {
    try {
      await this.createNotification({
        recipient: proId,
        recipientRole: 'pro',
        type: NotificationType.LEAD_ASSIGNED,
        category: NotificationCategory.LEAD,
        priority: NotificationPriority.HIGH,
        title: 'New Direct Lead',
        message: `You have received a direct lead: ${leadTitle}`,
        data: { leadId },
        actionUrl: `/pro/dashboard/leads/${leadId}`,
      });
    } catch (error) {
      logger.error('Failed to notify pro of lead assignment', { error, proId, leadId });
    }
  }

  /**
   * Notify a homeowner when they receive a quote
   */
  async notifyHomeownerQuoteReceived(
    homeownerId: string,
    leadId: string,
    proName: string
  ): Promise<void> {
    try {
      await this.createNotification({
        recipient: homeownerId,
        recipientRole: 'homeowner',
        type: NotificationType.QUOTE_RECEIVED,
        category: NotificationCategory.QUOTE,
        priority: NotificationPriority.HIGH,
        title: 'New Quote Received',
        message: `${proName} has submitted a quote for your project`,
        data: { leadId, proName },
        actionUrl: `/dashboard/requests/${leadId}`,
      });
    } catch (error) {
      logger.error('Failed to notify homeowner of quote', { error, homeownerId, leadId });
    }
  }

  /**
   * Notify admins when a new pro registers
   */
  async notifyAdminsNewProRegistered(proId: string, proName: string, email: string): Promise<void> {
    try {
      const admins = await User.find({ role: 'admin' }).select('_id').lean();

      if (admins.length === 0) {
        logger.warn('No admin users found to notify');
        return;
      }

      await Promise.all(
        admins.map((admin) =>
          this.createNotification({
            recipient: admin._id.toString(),
            recipientRole: 'admin',
            type: NotificationType.NEW_PRO_REGISTRATION,
            category: NotificationCategory.VERIFICATION,
            priority: NotificationPriority.MEDIUM,
            title: 'New Professional Registered',
            message: `${proName} (${email}) has registered as a professional`,
            data: { proId, email },
            actionUrl: `/admin/professionals/${proId}`,
          })
        )
      );

      logger.info('Admins notified of new pro registration', { proId, email });
    } catch (error) {
      logger.error('Failed to notify admins of pro registration', { error, proId });
    }
  }

  /**
   * Notify admins when a new lead is submitted
   */
  async notifyAdminsLeadSubmitted(
    leadId: string,
    leadTitle: string,
    homeownerName: string
  ): Promise<void> {
    try {
      const admins = await User.find({ role: 'admin' }).select('_id').lean();

      if (admins.length === 0) {
        logger.warn('No admin users found to notify');
        return;
      }

      await Promise.all(
        admins.map((admin) =>
          this.createNotification({
            recipient: admin._id.toString(),
            recipientRole: 'admin',
            type: NotificationType.NEW_LEAD_SUBMITTED,
            category: NotificationCategory.LEAD,
            priority: NotificationPriority.MEDIUM,
            title: 'New Lead Submitted',
            message: `${homeownerName} submitted a new lead: ${leadTitle}`,
            data: { leadId },
            actionUrl: `/admin/leads/${leadId}`,
          })
        )
      );

      logger.info('Admins notified of new lead', { leadId });
    } catch (error) {
      logger.error('Failed to notify admins of new lead', { error, leadId });
    }
  }

  /**
   * Notify a pro when their quote is accepted
   */
  async notifyProQuoteAccepted(
    proId: string,
    leadId: string,
    leadTitle: string,
    homeownerName: string
  ): Promise<void> {
    try {
      await this.createNotification({
        recipient: proId,
        recipientRole: 'pro',
        type: NotificationType.QUOTE_ACCEPTED,
        category: NotificationCategory.QUOTE,
        priority: NotificationPriority.HIGH,
        title: 'Quote Accepted!',
        message: `${homeownerName} has accepted your quote for "${leadTitle}"`,
        data: { leadId },
        actionUrl: `/pro/dashboard/leads/${leadId}`,
      });
    } catch (error) {
      logger.error('Failed to notify pro of quote acceptance', { error, proId, leadId });
    }
  }

  /**
   * Notify a pro when their quote is rejected
   */
  async notifyProQuoteRejected(
    proId: string,
    leadId: string,
    leadTitle: string,
    reason?: string
  ): Promise<void> {
    try {
      await this.createNotification({
        recipient: proId,
        recipientRole: 'pro',
        type: NotificationType.QUOTE_REJECTED,
        category: NotificationCategory.QUOTE,
        priority: NotificationPriority.MEDIUM,
        title: 'Quote Declined',
        message: reason
          ? `Your quote for "${leadTitle}" was declined: ${reason}`
          : `Your quote for "${leadTitle}" was declined`,
        data: { leadId, reason },
        actionUrl: `/pro/dashboard/leads/${leadId}`,
      });
    } catch (error) {
      logger.error('Failed to notify pro of quote rejection', { error, proId, leadId });
    }
  }
}

export const notificationService = new NotificationService();

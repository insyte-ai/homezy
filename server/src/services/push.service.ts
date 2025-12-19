/**
 * Push Notification Service
 * Handles sending push notifications to mobile devices via Expo
 */

import Expo, { ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';
import { User, IUser, PushToken } from '../models/User.model';
import { logger } from '../utils/logger';

// Create a new Expo SDK client
const expo = new Expo();

export interface PushNotificationData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
  categoryId?: string;
}

export interface BulkPushNotificationData {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

class PushService {
  /**
   * Register a push token for a user
   */
  async registerPushToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceId?: string
  ): Promise<void> {
    try {
      // Validate the push token format
      if (!Expo.isExpoPushToken(token)) {
        logger.warn('Invalid Expo push token format', { userId, token });
        throw new Error('Invalid push token format');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Initialize pushTokens array if it doesn't exist
      if (!user.pushTokens) {
        user.pushTokens = [];
      }

      // Check if token already exists
      const existingTokenIndex = user.pushTokens.findIndex(
        (t) => t.token === token
      );

      if (existingTokenIndex === -1) {
        // Add new token
        user.pushTokens.push({
          token,
          platform,
          deviceId,
          createdAt: new Date(),
        });
      } else {
        // Update existing token
        user.pushTokens[existingTokenIndex] = {
          token,
          platform,
          deviceId,
          createdAt: new Date(),
        };
      }

      await user.save();

      logger.info('Push token registered', { userId, platform, deviceId });
    } catch (error) {
      logger.error('Failed to register push token', { error, userId });
      throw error;
    }
  }

  /**
   * Remove a push token for a user
   */
  async removePushToken(userId: string, token: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { pushTokens: { token } },
      });

      logger.info('Push token removed', { userId });
    } catch (error) {
      logger.error('Failed to remove push token', { error, userId });
      throw error;
    }
  }

  /**
   * Remove all push tokens for a user (e.g., on logout)
   */
  async removeAllPushTokens(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $set: { pushTokens: [] },
      });

      logger.info('All push tokens removed', { userId });
    } catch (error) {
      logger.error('Failed to remove all push tokens', { error, userId });
      throw error;
    }
  }

  /**
   * Send a push notification to a single user
   */
  async sendToUser(params: PushNotificationData): Promise<void> {
    try {
      const user = await User.findById(params.userId).select('pushTokens').lean();

      if (!user || !user.pushTokens || user.pushTokens.length === 0) {
        logger.debug('No push tokens found for user', { userId: params.userId });
        return;
      }

      const messages: ExpoPushMessage[] = user.pushTokens
        .filter((t: PushToken) => Expo.isExpoPushToken(t.token))
        .map((t: PushToken) => ({
          to: t.token,
          title: params.title,
          body: params.body,
          data: params.data,
          sound: params.sound || 'default',
          badge: params.badge,
          channelId: params.channelId || 'default',
          priority: params.priority || 'high',
          categoryId: params.categoryId,
        }));

      if (messages.length === 0) {
        logger.debug('No valid push tokens for user', { userId: params.userId });
        return;
      }

      await this.sendNotifications(messages);
    } catch (error) {
      logger.error('Failed to send push notification to user', {
        error,
        userId: params.userId,
      });
    }
  }

  /**
   * Send push notifications to multiple users
   */
  async sendToUsers(params: BulkPushNotificationData): Promise<void> {
    try {
      const users = await User.find({
        _id: { $in: params.userIds },
        'pushTokens.0': { $exists: true }, // Only users with at least one token
      })
        .select('pushTokens')
        .lean();

      const messages: ExpoPushMessage[] = [];

      for (const user of users) {
        if (user.pushTokens) {
          for (const t of user.pushTokens as PushToken[]) {
            if (Expo.isExpoPushToken(t.token)) {
              messages.push({
                to: t.token,
                title: params.title,
                body: params.body,
                data: params.data,
                sound: params.sound || 'default',
                channelId: params.channelId || 'default',
                priority: params.priority || 'high',
              });
            }
          }
        }
      }

      if (messages.length === 0) {
        logger.debug('No valid push tokens for users', {
          userCount: params.userIds.length,
        });
        return;
      }

      await this.sendNotifications(messages);
    } catch (error) {
      logger.error('Failed to send bulk push notifications', {
        error,
        userCount: params.userIds.length,
      });
    }
  }

  /**
   * Send notifications in chunks and handle receipts
   */
  private async sendNotifications(messages: ExpoPushMessage[]): Promise<void> {
    // Chunk messages (Expo recommends max 100 per request)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    // Send each chunk
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        logger.error('Error sending push notification chunk', { error });
      }
    }

    // Process receipts after a delay
    // In production, you might want to store tickets and process receipts in a background job
    setTimeout(() => {
      this.processReceipts(tickets).catch((error) => {
        logger.error('Error processing push receipts', { error });
      });
    }, 15000); // Wait 15 seconds before checking receipts

    logger.info('Push notifications sent', {
      messageCount: messages.length,
      ticketCount: tickets.length,
    });
  }

  /**
   * Process push notification receipts to handle errors
   */
  private async processReceipts(tickets: ExpoPushTicket[]): Promise<void> {
    const receiptIds: string[] = [];

    for (const ticket of tickets) {
      if (ticket.status === 'ok' && ticket.id) {
        receiptIds.push(ticket.id);
      } else if (ticket.status === 'error') {
        logger.warn('Push notification error', {
          message: ticket.message,
          details: ticket.details,
        });
      }
    }

    if (receiptIds.length === 0) return;

    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    for (const chunk of receiptIdChunks) {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

        for (const receiptId in receipts) {
          const receipt = receipts[receiptId];

          if (receipt.status === 'error') {
            logger.warn('Push notification delivery error', {
              receiptId,
              message: receipt.message,
              details: receipt.details,
            });

            // Handle specific error types
            if (receipt.details?.error === 'DeviceNotRegistered') {
              // Token is no longer valid - should remove from database
              // This would require storing the token with the ticket
              logger.info('Device not registered, token should be removed');
            }
          }
        }
      } catch (error) {
        logger.error('Error fetching push receipts', { error });
      }
    }
  }

  // ============================================
  // Convenience methods for specific notifications
  // ============================================

  /**
   * Send notification for new quote received
   */
  async notifyNewQuote(
    homeownerId: string,
    proName: string,
    leadId: string
  ): Promise<void> {
    await this.sendToUser({
      userId: homeownerId,
      title: 'New Quote Received',
      body: `${proName} has submitted a quote for your project`,
      data: {
        type: 'quote_received',
        leadId,
      },
      channelId: 'leads',
    });
  }

  /**
   * Send notification for quote accepted
   */
  async notifyQuoteAccepted(
    proId: string,
    homeownerName: string,
    leadTitle: string,
    leadId: string
  ): Promise<void> {
    await this.sendToUser({
      userId: proId,
      title: 'Quote Accepted!',
      body: `${homeownerName} accepted your quote for "${leadTitle}"`,
      data: {
        type: 'quote_accepted',
        leadId,
      },
      channelId: 'leads',
    });
  }

  /**
   * Send notification for new message
   */
  async notifyNewMessage(
    recipientId: string,
    senderName: string,
    conversationId: string,
    preview: string
  ): Promise<void> {
    await this.sendToUser({
      userId: recipientId,
      title: senderName,
      body: preview.length > 100 ? `${preview.substring(0, 100)}...` : preview,
      data: {
        type: 'new_message',
        conversationId,
      },
      channelId: 'messages',
    });
  }

  /**
   * Send notification for new lead (to pro)
   */
  async notifyNewLead(
    proId: string,
    leadTitle: string,
    leadId: string
  ): Promise<void> {
    await this.sendToUser({
      userId: proId,
      title: 'New Lead Available',
      body: leadTitle,
      data: {
        type: 'new_lead',
        leadId,
      },
      channelId: 'leads',
    });
  }

  /**
   * Send notification for service reminder
   */
  async notifyServiceReminder(
    userId: string,
    reminderTitle: string,
    reminderId: string
  ): Promise<void> {
    await this.sendToUser({
      userId,
      title: 'Service Reminder',
      body: reminderTitle,
      data: {
        type: 'service_reminder',
        reminderId,
      },
      channelId: 'default',
    });
  }

  /**
   * Send notification for verification status update
   */
  async notifyVerificationUpdate(
    proId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<void> {
    const title = status === 'approved' ? 'Verification Approved!' : 'Verification Update';
    const body =
      status === 'approved'
        ? 'Congratulations! Your account has been verified.'
        : reason || 'Your verification documents need attention.';

    await this.sendToUser({
      userId: proId,
      title,
      body,
      data: {
        type: 'verification_update',
        status,
      },
      channelId: 'default',
      priority: 'high',
    });
  }
}

export const pushService = new PushService();

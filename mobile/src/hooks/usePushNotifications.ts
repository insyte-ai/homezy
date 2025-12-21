/**
 * Push Notifications Hook
 * Manages push notification registration and handling for the mobile app
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

// Configure how notifications appear when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationData {
  type?: string;
  leadId?: string;
  conversationId?: string;
  reminderId?: string;
  notificationId?: string;
  actionUrl?: string;
}

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const { isAuthenticated, user } = useAuthStore();

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      if (__DEV__) console.log('Push notifications require a physical device');
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        if (__DEV__) console.log('Push notification permission not granted');
        return null;
      }

      // Get the Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      const token = tokenData.data;
      setExpoPushToken(token);

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await setupAndroidChannels();
      }

      return token;
    } catch (error) {
      if (__DEV__) console.error('Error registering for push notifications:', error);
      return null;
    }
  }, []);

  // Setup Android notification channels
  const setupAndroidChannels = async () => {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0066FF',
    });

    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      description: 'Notifications for new messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0066FF',
    });

    await Notifications.setNotificationChannelAsync('leads', {
      name: 'Leads & Quotes',
      description: 'Notifications for leads and quotes',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0066FF',
    });
  };

  // Save push token to backend
  const savePushTokenToBackend = useCallback(async (token: string) => {
    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      await api.post('/users/push-token', {
        token,
        platform,
        deviceId: Device.modelName || undefined,
      });

      setIsRegistered(true);
      if (__DEV__) console.log('Push token registered with backend');
    } catch (error) {
      if (__DEV__) console.error('Failed to save push token to backend:', error);
    }
  }, []);

  // Remove push token from backend
  const removePushTokenFromBackend = useCallback(async () => {
    if (!expoPushToken) return;

    try {
      await api.delete('/users/push-token', {
        data: { token: expoPushToken },
      });

      setIsRegistered(false);
      if (__DEV__) console.log('Push token removed from backend');
    } catch (error) {
      if (__DEV__) console.error('Failed to remove push token from backend:', error);
    }
  }, [expoPushToken]);

  // Handle notification tap/response
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as PushNotificationData;

    if (__DEV__) console.log('Notification tapped:', data);

    // Navigate based on notification type
    if (data.type) {
      switch (data.type) {
        case 'quote_received':
        case 'quote_accepted':
        case 'quote_rejected':
          if (data.leadId) {
            router.push(`/(homeowner)/requests/${data.leadId}`);
          }
          break;

        case 'new_lead':
        case 'lead_assigned':
          if (data.leadId) {
            router.push(`/(pro)/leads/${data.leadId}`);
          }
          break;

        case 'new_message':
          if (data.conversationId) {
            router.push(`/(homeowner)/messages/${data.conversationId}`);
          }
          break;

        case 'service_reminder':
          if (data.reminderId) {
            router.push('/(homeowner)/my-home/reminders');
          }
          break;

        case 'verification_update':
          router.push('/(pro)/profile/verification');
          break;

        default:
          // Use actionUrl if provided
          if (data.actionUrl) {
            // Convert web URL to mobile route if needed
            const mobileRoute = convertWebUrlToMobileRoute(data.actionUrl);
            if (mobileRoute) {
              router.push(mobileRoute as any);
            }
          }
          break;
      }
    }
  }, []);

  // Convert web URLs to mobile routes
  const convertWebUrlToMobileRoute = (webUrl: string): string | null => {
    // Map web paths to mobile routes
    const mappings: Record<string, string> = {
      '/dashboard/requests': '/(homeowner)/(tabs)/requests',
      '/dashboard/messages': '/(homeowner)/(tabs)/messages',
      '/pro/dashboard/leads': '/(pro)/(tabs)/marketplace',
      '/pro/dashboard/my-leads': '/(pro)/(tabs)/my-leads',
      '/pro/dashboard/quotes': '/(pro)/(tabs)/quotes',
      '/pro/dashboard/messages': '/(pro)/(tabs)/messages',
    };

    for (const [webPath, mobilePath] of Object.entries(mappings)) {
      if (webUrl.startsWith(webPath)) {
        // Handle dynamic segments (e.g., /dashboard/requests/123)
        const remainder = webUrl.slice(webPath.length);
        return mobilePath + remainder;
      }
    }

    return null;
  };

  // Initialize push notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const setup = async () => {
      const token = await registerForPushNotifications();
      if (token) {
        await savePushTokenToBackend(token);
      }
    };

    setup();

    // Listen for incoming notifications (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
        if (__DEV__) console.log('Notification received:', notification);
      }
    );

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated, user, registerForPushNotifications, savePushTokenToBackend, handleNotificationResponse]);

  // Get badge count
  const getBadgeCount = async (): Promise<number> => {
    return Notifications.getBadgeCountAsync();
  };

  // Set badge count
  const setBadgeCount = async (count: number): Promise<void> => {
    await Notifications.setBadgeCountAsync(count);
  };

  // Clear all notifications
  const clearAllNotifications = async (): Promise<void> => {
    await Notifications.dismissAllNotificationsAsync();
    await setBadgeCount(0);
  };

  return {
    expoPushToken,
    notification,
    isRegistered,
    registerForPushNotifications,
    removePushTokenFromBackend,
    getBadgeCount,
    setBadgeCount,
    clearAllNotifications,
  };
};

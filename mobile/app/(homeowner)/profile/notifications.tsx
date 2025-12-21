/**
 * Notification Settings Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useAuthStore } from '../../../src/store/authStore';
import { api } from '../../../src/services/api';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  serviceReminders: boolean;
  seasonalReminders: boolean;
  newQuotes: boolean;
  messages: boolean;
  marketing: boolean;
}

interface SettingItemProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SettingItem({ label, description, value, onValueChange }: SettingItemProps) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.neutral[200], true: colors.primary[500] }}
        thumbColor={colors.background.primary}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    sms: false,
    serviceReminders: true,
    seasonalReminders: true,
    newQuotes: true,
    messages: true,
    marketing: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // Load from user profile or API
      const userPrefs = user?.homeownerProfile?.notificationPreferences;
      if (userPrefs) {
        setPreferences({
          ...preferences,
          ...userPrefs,
        });
      }
    } catch (error) {
      // Use defaults
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    savePreferences({ ...preferences, [key]: value });
  };

  const savePreferences = async (newPrefs: NotificationPreferences) => {
    setIsSaving(true);
    try {
      await api.patch('/users/notification-preferences', newPrefs);
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          {isSaving && <ActivityIndicator size="small" color={colors.primary[500]} />}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Notification Channels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              label="Push Notifications"
              description="Receive notifications on your device"
              value={preferences.push}
              onValueChange={(value) => updatePreference('push', value)}
            />
            <SettingItem
              label="Email Notifications"
              description="Receive updates via email"
              value={preferences.email}
              onValueChange={(value) => updatePreference('email', value)}
            />
            <SettingItem
              label="SMS Notifications"
              description="Receive text messages"
              value={preferences.sms}
              onValueChange={(value) => updatePreference('sms', value)}
            />
          </View>
        </View>

        {/* Activity Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              label="New Quotes"
              description="When a professional sends you a quote"
              value={preferences.newQuotes}
              onValueChange={(value) => updatePreference('newQuotes', value)}
            />
            <SettingItem
              label="Messages"
              description="New messages from professionals"
              value={preferences.messages}
              onValueChange={(value) => updatePreference('messages', value)}
            />
          </View>
        </View>

        {/* Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              label="Service Reminders"
              description="Reminders for upcoming service appointments"
              value={preferences.serviceReminders}
              onValueChange={(value) => updatePreference('serviceReminders', value)}
            />
            <SettingItem
              label="Seasonal Reminders"
              description="Seasonal home maintenance tips"
              value={preferences.seasonalReminders}
              onValueChange={(value) => updatePreference('seasonalReminders', value)}
            />
          </View>
        </View>

        {/* Marketing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promotional</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              label="Marketing & Promotions"
              description="Special offers and new features"
              value={preferences.marketing}
              onValueChange={(value) => updatePreference('marketing', value)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  scrollContent: {
    padding: spacing[4],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[2],
    paddingHorizontal: spacing[1],
  },
  sectionContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing[3],
  },
  settingLabel: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  settingDescription: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
});

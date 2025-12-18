/**
 * Settings Screen
 * Account settings and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useAuthStore } from '../../../src/store/authStore';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ icon, title, subtitle, onPress, rightElement, danger }: SettingRowProps) {
  const content = (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? colors.error[500] : colors.primary[500]}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      ))}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Contact Support', 'Please contact support@homezy.ae to delete your account.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <Text style={styles.sectionHeader}>Account</Text>
        <Card style={styles.section}>
          <SettingRow
            icon="person-outline"
            title="Personal Information"
            subtitle={user?.email}
            onPress={() => Alert.alert('Coming Soon', 'Edit personal information will be available soon.')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="lock-closed-outline"
            title="Change Password"
            onPress={() => Alert.alert('Coming Soon', 'Change password will be available soon.')}
          />
        </Card>

        {/* Notifications */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <Card style={styles.section}>
          <SettingRow
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Get notified about new leads and messages"
            rightElement={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="mail-outline"
            title="Email Notifications"
            subtitle="Receive updates via email"
            rightElement={
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="chatbox-outline"
            title="SMS Notifications"
            subtitle="Receive important alerts via SMS"
            rightElement={
              <Switch
                value={smsEnabled}
                onValueChange={setSmsEnabled}
                trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
                thumbColor="#fff"
              />
            }
          />
        </Card>

        {/* Support */}
        <Text style={styles.sectionHeader}>Support</Text>
        <Card style={styles.section}>
          <SettingRow
            icon="help-circle-outline"
            title="Help Center"
            onPress={() => Alert.alert('Help', 'Visit help.homezy.ae for support.')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="chatbubble-ellipses-outline"
            title="Contact Support"
            subtitle="support@homezy.ae"
            onPress={() => Alert.alert('Contact', 'Email us at support@homezy.ae')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => Alert.alert('Terms', 'Visit homezy.ae/terms for full terms.')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-outline"
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Visit homezy.ae/privacy for our privacy policy.')}
          />
        </Card>

        {/* App Info */}
        <Text style={styles.sectionHeader}>App</Text>
        <Card style={styles.section}>
          <SettingRow
            icon="information-circle-outline"
            title="Version"
            rightElement={<Text style={styles.versionText}>1.0.0</Text>}
          />
        </Card>

        {/* Danger Zone */}
        <Text style={styles.sectionHeader}>Account Actions</Text>
        <Card style={styles.section}>
          <SettingRow
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
            danger
          />
          <View style={styles.divider} />
          <SettingRow
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account and data"
            onPress={handleDeleteAccount}
            danger
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  title: {
    ...textStyles.h4,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: layout.screenPadding,
    paddingBottom: spacing[8],
  },
  sectionHeader: {
    ...textStyles.label,
    color: colors.text.secondary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  section: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconDanger: {
    backgroundColor: colors.error[50],
  },
  settingContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  settingTitle: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  settingTitleDanger: {
    color: colors.error[600],
  },
  settingSubtitle: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing[4] + 36 + spacing[3],
  },
  versionText: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
});

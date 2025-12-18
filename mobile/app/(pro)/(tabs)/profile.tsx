/**
 * Profile Screen (Pro)
 * Shows profile menu and navigation to profile management screens
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Avatar } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useAuthStore } from '../../../src/store/authStore';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function MenuItem({ icon, title, subtitle, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.menuItem}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={24} color={colors.professional.primary} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      </Card>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <Avatar
            source={user?.avatar}
            name={`${user?.firstName} ${user?.lastName}`}
            size="xl"
          />
          <Text style={styles.profileName}>
            {user?.proProfile?.businessName || `${user?.firstName} ${user?.lastName}`}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </Card>

        {/* Menu Items */}
        <MenuItem
          icon="person-outline"
          title="Business Profile"
          subtitle="Edit your business information"
          onPress={() => router.push('/(pro)/profile/edit')}
        />
        <MenuItem
          icon="images-outline"
          title="Portfolio"
          subtitle="Showcase your work"
          onPress={() => router.push('/(pro)/profile/portfolio')}
        />
        <MenuItem
          icon="shield-checkmark-outline"
          title="Verification"
          subtitle="Documents & verification status"
          onPress={() => router.push('/(pro)/profile/verification')}
        />
        <MenuItem
          icon="card-outline"
          title="Credits & Billing"
          subtitle="Purchase credits, view history"
          onPress={() => router.push('/(pro)/credits')}
        />
        <MenuItem
          icon="calendar-outline"
          title="Availability"
          subtitle="Set your working hours"
          onPress={() => router.push('/(pro)/profile/settings')}
        />
        <MenuItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage notification preferences"
          onPress={() => router.push('/(pro)/profile/settings')}
        />
        <MenuItem
          icon="settings-outline"
          title="Settings"
          subtitle="Account settings"
          onPress={() => router.push('/(pro)/profile/settings')}
        />
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
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    marginBottom: spacing[2],
  },
  profileName: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginTop: spacing[3],
  },
  profileEmail: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.professional.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  menuSubtitle: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
});

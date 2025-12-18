/**
 * Homeowner Dashboard screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Avatar, Button } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useAuthStore } from '../../../src/store/authStore';

export default function HomeownerDashboard() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{user?.firstName || 'Homeowner'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Avatar
              source={user?.avatar}
              name={`${user?.firstName} ${user?.lastName}`}
              size="md"
            />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
            </View>
            <Text style={styles.quickActionText}>New Request</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.success[50] }]}>
              <Ionicons name="search" size={24} color={colors.success[500]} />
            </View>
            <Text style={styles.quickActionText}>Find Pros</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.warning[50] }]}>
              <Ionicons name="chatbubbles" size={24} color={colors.warning[500]} />
            </View>
            <Text style={styles.quickActionText}>Ask AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.info[50] }]}>
              <Ionicons name="home" size={24} color={colors.info[500]} />
            </View>
            <Text style={styles.quickActionText}>My Home</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Active Requests</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Pending Quotes</Text>
          </Card>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.emptyCard}>
          <Ionicons name="time-outline" size={32} color={colors.neutral[300]} />
          <Text style={styles.emptyText}>No recent activity</Text>
          <Text style={styles.emptySubtext}>
            Create your first service request to get started
          </Text>
        </Card>

        {/* CTA */}
        <Button
          title="Create Service Request"
          onPress={() => {}}
          fullWidth
          style={styles.ctaButton}
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
  scrollContent: {
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  greeting: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  name: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  quickAction: {
    alignItems: 'center',
    width: '23%',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  quickActionText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  statNumber: {
    ...textStyles.h2,
    color: colors.primary[500],
    marginBottom: spacing[1],
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    marginBottom: spacing[6],
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  emptySubtext: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  ctaButton: {
    marginBottom: spacing[4],
  },
});

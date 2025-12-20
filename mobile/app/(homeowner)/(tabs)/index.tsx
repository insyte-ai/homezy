/**
 * Homeowner Dashboard screen
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Avatar } from '../../../src/components/ui';
import { SearchBar } from '../../../src/components/home/SearchBar';
import { PopularServices } from '../../../src/components/home/PopularServices';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useAuthStore } from '../../../src/store/authStore';
import { useMessagingStore } from '../../../src/store/messagingStore';
import { useLeadFormStore } from '../../../src/store/leadFormStore';
import { SubService } from '../../../src/services/services';

// Quick action button for home management features
function QuickAction({
  icon,
  label,
  color,
  bgColor,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: bgColor }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeownerDashboard() {
  const { user } = useAuthStore();
  const { totalUnread, refreshUnreadCount } = useMessagingStore();
  const { setService, reset: resetLeadForm } = useLeadFormStore();

  // Refresh unread count on mount
  useEffect(() => {
    refreshUnreadCount();
  }, []);

  const handleMessagesPress = () => {
    router.push('/(homeowner)/(tabs)/messages');
  };

  const handleServiceSelect = (service: SubService | { id: string; name: string; slug: string }) => {
    resetLeadForm();
    // Convert to SubService format if needed
    const subService: SubService = {
      id: service.id,
      name: service.name,
      slug: service.slug,
    };
    setService(subService);
    router.push('/(homeowner)/create-request/' as any);
  };

  // Quick action handlers
  const handleNewProject = () => {
    router.push('/(homeowner)/my-home/projects/new');
  };

  const handleAddExpense = () => {
    router.push('/(homeowner)/my-home/expenses');
  };

  const handleSetReminder = () => {
    router.push('/(homeowner)/my-home/reminders');
  };

  const handleSaveIdea = () => {
    router.push('/(homeowner)/my-home/projects');
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
          <View style={styles.headerRight}>
            {/* Messages Icon */}
            <TouchableOpacity onPress={handleMessagesPress} style={styles.messagesButton}>
              <Ionicons name="chatbubbles-outline" size={24} color={colors.text.primary} />
              {totalUnread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(homeowner)/profile')}>
              <Avatar
                source={user?.avatar}
                name={`${user?.firstName} ${user?.lastName}`}
                size="md"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar onServiceSelect={handleServiceSelect} />
        </View>

        {/* Popular Services */}
        <View style={styles.section}>
          <PopularServices onServiceSelect={handleServiceSelect} />
        </View>

        {/* Quick Actions for Home Management */}
        <Text style={styles.sectionTitle}>Home Management</Text>
        <View style={styles.quickActionsContainer}>
          <QuickAction
            icon="construct-outline"
            label="New Project"
            color={colors.primary[600]}
            bgColor={colors.primary[50]}
            onPress={handleNewProject}
          />
          <QuickAction
            icon="wallet-outline"
            label="Add Expense"
            color={colors.success[600]}
            bgColor={colors.success[50]}
            onPress={handleAddExpense}
          />
          <QuickAction
            icon="notifications-outline"
            label="Set Reminder"
            color={colors.warning[600]}
            bgColor={colors.warning[50]}
            onPress={handleSetReminder}
          />
          <QuickAction
            icon="bulb-outline"
            label="Save Idea"
            color={colors.info[600]}
            bgColor={colors.info[50]}
            onPress={handleSaveIdea}
          />
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
            Search for a service above to get started
          </Text>
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
  scrollContent: {
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  messagesButton: {
    position: 'relative',
    padding: spacing[2],
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    ...textStyles.caption,
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  greeting: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  name: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  searchSection: {
    marginBottom: spacing[6],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  quickActionLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
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
});

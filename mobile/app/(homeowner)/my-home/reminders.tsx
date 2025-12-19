/**
 * Reminders Screen
 * Shows service reminders for the homeowner
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import {
  getMyReminders,
  snoozeReminder,
  pauseReminder,
  resumeReminder,
  completeReminder,
  deleteReminder,
  ServiceReminder,
  ReminderStatus,
  statusConfig,
  serviceCategoryConfig,
  frequencyConfig,
  snoozeOptions,
} from '../../../src/services/serviceReminders';

type FilterTab = 'all' | 'active' | 'snoozed';

function ReminderCard({
  reminder,
  onSnooze,
  onPause,
  onResume,
  onComplete,
  onDelete,
}: {
  reminder: ServiceReminder;
  onSnooze: () => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const status = statusConfig[reminder.status];
  const category = serviceCategoryConfig[reminder.category];

  const getDueDateLabel = () => {
    const now = new Date();
    const due = new Date(reminder.nextDueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    if (diffDays === 0) return { label: 'Due today', isOverdue: false };
    if (diffDays === 1) return { label: 'Due tomorrow', isOverdue: false };
    if (diffDays <= 7) return { label: `Due in ${diffDays} days`, isOverdue: false };
    return {
      label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isOverdue: false,
    };
  };

  const dueInfo = getDueDateLabel();

  return (
    <View style={styles.reminderCard}>
      {/* Header */}
      <View style={styles.reminderHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category?.bgColor || colors.primary[50] }]}>
          <Ionicons
            name={category?.icon as any || 'notifications'}
            size={20}
            color={category?.color || colors.primary[500]}
          />
        </View>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderTitle} numberOfLines={1}>{reminder.title}</Text>
          <Text style={styles.reminderCategory}>{category?.label || reminder.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Due Date */}
      <View style={styles.dueDateRow}>
        <Ionicons
          name="calendar-outline"
          size={16}
          color={dueInfo.isOverdue ? colors.error[500] : colors.text.tertiary}
        />
        <Text style={[styles.dueDateText, dueInfo.isOverdue && styles.overdueText]}>
          {dueInfo.label}
        </Text>
        <Text style={styles.frequencyText}>
          {frequencyConfig[reminder.frequency]?.label}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        {reminder.status === 'active' && (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={onComplete}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.success[500]} />
              <Text style={[styles.actionText, { color: colors.success[600] }]}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onSnooze}>
              <Ionicons name="time-outline" size={18} color={colors.warning[500]} />
              <Text style={[styles.actionText, { color: colors.warning[600] }]}>Snooze</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onPause}>
              <Ionicons name="pause-outline" size={18} color={colors.text.tertiary} />
              <Text style={styles.actionText}>Pause</Text>
            </TouchableOpacity>
          </>
        )}
        {reminder.status === 'snoozed' && (
          <TouchableOpacity style={styles.actionButton} onPress={onResume}>
            <Ionicons name="play-outline" size={18} color={colors.primary[500]} />
            <Text style={[styles.actionText, { color: colors.primary[600] }]}>Resume</Text>
          </TouchableOpacity>
        )}
        {reminder.status === 'paused' && (
          <TouchableOpacity style={styles.actionButton} onPress={onResume}>
            <Ionicons name="play-outline" size={18} color={colors.primary[500]} />
            <Text style={[styles.actionText, { color: colors.primary[600] }]}>Resume</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color={colors.error[400]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ServiceReminder | null>(null);

  const loadReminders = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      let status: ReminderStatus | undefined;
      if (activeFilter === 'active') status = 'active';
      else if (activeFilter === 'snoozed') status = 'snoozed';

      const response = await getMyReminders({ status });
      setReminders(response.reminders);
    } catch (err) {
      console.error('Error loading reminders:', err);
      setError('Failed to load reminders. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReminders(reminders.length === 0);
    }, [activeFilter])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadReminders(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSnooze = (reminder: ServiceReminder) => {
    setSelectedReminder(reminder);
    setShowSnoozeModal(true);
  };

  const confirmSnooze = async (days: number) => {
    if (!selectedReminder) return;

    try {
      await snoozeReminder(selectedReminder.id, days);
      setShowSnoozeModal(false);
      setSelectedReminder(null);
      await loadReminders(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to snooze reminder. Please try again.');
    }
  };

  const handlePause = async (reminder: ServiceReminder) => {
    try {
      await pauseReminder(reminder.id);
      await loadReminders(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to pause reminder. Please try again.');
    }
  };

  const handleResume = async (reminder: ServiceReminder) => {
    try {
      await resumeReminder(reminder.id);
      await loadReminders(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to resume reminder. Please try again.');
    }
  };

  const handleComplete = async (reminder: ServiceReminder) => {
    Alert.alert(
      'Mark as Complete',
      'This will mark the service as done and schedule the next reminder.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await completeReminder(reminder.id);
              await loadReminders(false);
            } catch (err) {
              Alert.alert('Error', 'Failed to complete reminder. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (reminder: ServiceReminder) => {
    Alert.alert(
      'Delete Reminder',
      `Delete "${reminder.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReminder(reminder.id);
              await loadReminders(false);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete reminder. Please try again.');
            }
          },
        },
      ]
    );
  };

  const overdueCount = reminders.filter(
    (r) => r.status === 'active' && new Date(r.nextDueDate) < new Date()
  ).length;

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'snoozed', label: 'Snoozed' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Reminders</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <View style={styles.overdueAlert}>
          <Ionicons name="alert-circle" size={20} color={colors.error[600]} />
          <Text style={styles.overdueAlertText}>
            {overdueCount} overdue reminder{overdueCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, activeFilter === tab.key && styles.filterTabActive]}
            onPress={() => setActiveFilter(tab.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab.key && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadReminders()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : reminders.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="No Reminders"
          description="Service reminders help you stay on top of regular home maintenance"
        />
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReminderCard
              reminder={item}
              onSnooze={() => handleSnooze(item)}
              onPause={() => handlePause(item)}
              onResume={() => handleResume(item)}
              onComplete={() => handleComplete(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
        />
      )}

      {/* Snooze Modal */}
      <Modal visible={showSnoozeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Snooze Reminder</Text>
            <Text style={styles.modalSubtitle}>How long do you want to snooze?</Text>
            <View style={styles.snoozeOptions}>
              {snoozeOptions.map((option) => (
                <TouchableOpacity
                  key={option.days}
                  style={styles.snoozeOption}
                  onPress={() => confirmSnooze(option.days)}
                >
                  <Text style={styles.snoozeOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowSnoozeModal(false);
                setSelectedReminder(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  overdueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.error[50],
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
  },
  overdueAlertText: {
    ...textStyles.body,
    color: colors.error[700],
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    gap: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterTab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
  },
  filterTabActive: {
    backgroundColor: colors.primary[500],
  },
  filterTabText: {
    ...textStyles.label,
    color: colors.text.secondary,
  },
  filterTabTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  errorText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  retryButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
  listContent: {
    padding: layout.screenPadding,
    gap: spacing[3],
  },
  reminderCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  reminderTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  reminderCategory: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  dueDateText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
  overdueText: {
    color: colors.error[600],
    fontWeight: '600',
  },
  frequencyText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actionText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: layout.screenPadding,
    paddingBottom: spacing[8],
  },
  modalTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  modalSubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  snoozeOptions: {
    gap: spacing[2],
  },
  snoozeOption: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  snoozeOptionText: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[3],
  },
  cancelButtonText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
});

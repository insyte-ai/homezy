/**
 * Project Details Screen
 * Shows project with tasks, costs, and milestones
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../../src/theme/spacing';
import { textStyles } from '../../../../src/theme/typography';
import {
  getHomeProjectById,
  updateHomeProject,
  deleteHomeProject,
  addTask,
  updateTask,
  deleteTask,
  addCostItem,
  deleteCostItem,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  HomeProject,
  Task,
  CostItem,
  Milestone,
  projectStatusConfig,
  projectCategoryConfig,
  taskStatusConfig,
  taskPriorityConfig,
  costCategoryConfig,
  HomeProjectStatus,
} from '../../../../src/services/homeProjects';

type TabKey = 'tasks' | 'costs' | 'milestones';

const PROJECT_STATUSES: HomeProjectStatus[] = ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'];

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [project, setProject] = useState<HomeProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('tasks');

  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newCostTitle, setNewCostTitle] = useState('');
  const [newCostAmount, setNewCostAmount] = useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProject = async (showLoading = true) => {
    if (!id) return;

    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const data = await getHomeProjectById(id);
      setProject(data);
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadProject(false);
    }, [id])
  );

  const handleBack = () => {
    router.back();
  };

  const handleStatusChange = async (newStatus: HomeProjectStatus) => {
    if (!project) return;

    try {
      await updateHomeProject(project.id, { status: newStatus });
      await loadProject(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const handleDelete = () => {
    if (!project) return;

    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHomeProject(project.id);
              router.back();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete project. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Task handlers
  const handleAddTask = async () => {
    if (!project || !newTaskTitle.trim()) return;

    try {
      setIsSubmitting(true);
      await addTask(project.id, { title: newTaskTitle.trim() });
      setNewTaskTitle('');
      setShowAddTaskModal(false);
      await loadProject(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to add task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    if (!project) return;

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await updateTask(project.id, task.id, { status: newStatus });
      await loadProject(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!project) return;

    Alert.alert('Delete Task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(project.id, task.id);
            await loadProject(false);
          } catch (err) {
            Alert.alert('Error', 'Failed to delete task. Please try again.');
          }
        },
      },
    ]);
  };

  // Cost handlers
  const handleAddCost = async () => {
    if (!project || !newCostTitle.trim()) return;

    try {
      setIsSubmitting(true);
      await addCostItem(project.id, {
        title: newCostTitle.trim(),
        category: 'other',
        estimatedCost: newCostAmount ? parseInt(newCostAmount, 10) : undefined,
      });
      setNewCostTitle('');
      setNewCostAmount('');
      setShowAddCostModal(false);
      await loadProject(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to add cost item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCost = async (cost: CostItem) => {
    if (!project) return;

    Alert.alert('Delete Cost Item', `Delete "${cost.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCostItem(project.id, cost.id);
            await loadProject(false);
          } catch (err) {
            Alert.alert('Error', 'Failed to delete cost item. Please try again.');
          }
        },
      },
    ]);
  };

  // Milestone handlers
  const handleAddMilestone = async () => {
    if (!project || !newMilestoneTitle.trim()) return;

    try {
      setIsSubmitting(true);
      await addMilestone(project.id, { title: newMilestoneTitle.trim() });
      setNewMilestoneTitle('');
      setShowAddMilestoneModal(false);
      await loadProject(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to add milestone. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMilestone = async (milestone: Milestone) => {
    if (!project) return;

    const newStatus = milestone.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateMilestone(project.id, milestone.id, { status: newStatus });
      await loadProject(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update milestone. Please try again.');
    }
  };

  const handleDeleteMilestone = async (milestone: Milestone) => {
    if (!project) return;

    Alert.alert('Delete Milestone', `Delete "${milestone.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMilestone(project.id, milestone.id);
            await loadProject(false);
          } catch (err) {
            Alert.alert('Error', 'Failed to delete milestone. Please try again.');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !project) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error || 'Project not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadProject()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = projectStatusConfig[project.status];
  const categoryConfig = projectCategoryConfig[project.category];
  const completedTasks = project.tasks.filter((t) => t.status === 'done').length;
  const totalCost = project.costItems.reduce((sum, c) => sum + (c.actualCost || c.estimatedCost || 0), 0);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'tasks', label: 'Tasks', count: project.tasks.length },
    { key: 'costs', label: 'Costs', count: project.costItems.length },
    { key: 'milestones', label: 'Milestones', count: project.milestones.length },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{project.name}</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            Alert.alert('Project Options', '', [
              { text: 'Delete Project', style: 'destructive', onPress: handleDelete },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Project Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.projectHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: categoryConfig?.bgColor }]}>
              <Ionicons
                name={categoryConfig?.icon as any || 'construct'}
                size={24}
                color={categoryConfig?.color || colors.primary[500]}
              />
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectCategory}>{categoryConfig?.label || project.category}</Text>
            </View>
          </View>

          {project.description && (
            <Text style={styles.projectDescription}>{project.description}</Text>
          )}

          {/* Status Selector */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.statusRow}>
                {PROJECT_STATUSES.map((status) => {
                  const config = projectStatusConfig[status];
                  const isSelected = project.status === status;
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        isSelected && { backgroundColor: config.bgColor, borderColor: config.color },
                      ]}
                      onPress={() => handleStatusChange(status)}
                    >
                      <Text
                        style={[styles.statusOptionText, isSelected && { color: config.color }]}
                      >
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{completedTasks}/{project.tasks.length}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>AED {totalCost.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Cost</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length}</Text>
              <Text style={styles.statLabel}>Milestones</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'tasks' && (
            <>
              {project.tasks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkbox-outline" size={40} color={colors.text.tertiary} />
                  <Text style={styles.emptyText}>No tasks yet</Text>
                </View>
              ) : (
                project.tasks.map((task) => (
                  <View key={task.id} style={styles.taskItem}>
                    <TouchableOpacity
                      style={styles.taskCheckbox}
                      onPress={() => handleToggleTaskStatus(task)}
                    >
                      <Ionicons
                        name={task.status === 'done' ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={task.status === 'done' ? colors.success[500] : colors.text.tertiary}
                      />
                    </TouchableOpacity>
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskTitle, task.status === 'done' && styles.taskTitleDone]}>
                        {task.title}
                      </Text>
                      <View style={styles.taskMeta}>
                        <View style={[styles.priorityBadge, { backgroundColor: taskPriorityConfig[task.priority].color + '20' }]}>
                          <Text style={[styles.priorityText, { color: taskPriorityConfig[task.priority].color }]}>
                            {taskPriorityConfig[task.priority].label}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteTask(task)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error[400]} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => setShowAddTaskModal(true)}
              >
                <Ionicons name="add-circle" size={20} color={colors.primary[500]} />
                <Text style={styles.addItemText}>Add Task</Text>
              </TouchableOpacity>
            </>
          )}

          {activeTab === 'costs' && (
            <>
              {project.costItems.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="wallet-outline" size={40} color={colors.text.tertiary} />
                  <Text style={styles.emptyText}>No cost items yet</Text>
                </View>
              ) : (
                project.costItems.map((cost) => (
                  <View key={cost.id} style={styles.costItem}>
                    <View style={styles.costContent}>
                      <Text style={styles.costTitle}>{cost.title}</Text>
                      <Text style={styles.costCategory}>
                        {costCategoryConfig[cost.category]?.label || cost.category}
                      </Text>
                    </View>
                    <View style={styles.costAmounts}>
                      {cost.estimatedCost && (
                        <Text style={styles.estimatedCost}>
                          Est: AED {cost.estimatedCost.toLocaleString()}
                        </Text>
                      )}
                      {cost.actualCost && (
                        <Text style={styles.actualCost}>
                          Actual: AED {cost.actualCost.toLocaleString()}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteCost(cost)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error[400]} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => setShowAddCostModal(true)}
              >
                <Ionicons name="add-circle" size={20} color={colors.primary[500]} />
                <Text style={styles.addItemText}>Add Cost Item</Text>
              </TouchableOpacity>
            </>
          )}

          {activeTab === 'milestones' && (
            <>
              {project.milestones.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="flag-outline" size={40} color={colors.text.tertiary} />
                  <Text style={styles.emptyText}>No milestones yet</Text>
                </View>
              ) : (
                project.milestones.map((milestone) => (
                  <View key={milestone.id} style={styles.milestoneItem}>
                    <TouchableOpacity
                      style={styles.milestoneCheckbox}
                      onPress={() => handleToggleMilestone(milestone)}
                    >
                      <Ionicons
                        name={milestone.status === 'completed' ? 'flag' : 'flag-outline'}
                        size={24}
                        color={milestone.status === 'completed' ? colors.success[500] : colors.text.tertiary}
                      />
                    </TouchableOpacity>
                    <View style={styles.milestoneContent}>
                      <Text style={[styles.milestoneTitle, milestone.status === 'completed' && styles.milestoneTitleDone]}>
                        {milestone.title}
                      </Text>
                      {milestone.dueDate && (
                        <Text style={styles.milestoneDue}>
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteMilestone(milestone)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error[400]} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => setShowAddMilestoneModal(true)}
              >
                <Ionicons name="add-circle" size={20} color={colors.primary[500]} />
                <Text style={styles.addItemText}>Add Milestone</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={showAddTaskModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Task</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Task title..."
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholderTextColor={colors.text.tertiary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddTaskModal(false);
                  setNewTaskTitle('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, isSubmitting && styles.modalSubmitDisabled]}
                onPress={handleAddTask}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Cost Modal */}
      <Modal visible={showAddCostModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Cost Item</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Cost item title..."
              value={newCostTitle}
              onChangeText={setNewCostTitle}
              placeholderTextColor={colors.text.tertiary}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Estimated amount (AED)"
              value={newCostAmount}
              onChangeText={setNewCostAmount}
              placeholderTextColor={colors.text.tertiary}
              keyboardType="number-pad"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddCostModal(false);
                  setNewCostTitle('');
                  setNewCostAmount('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, isSubmitting && styles.modalSubmitDisabled]}
                onPress={handleAddCost}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal visible={showAddMilestoneModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Milestone</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Milestone title..."
              value={newMilestoneTitle}
              onChangeText={setNewMilestoneTitle}
              placeholderTextColor={colors.text.tertiary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddMilestoneModal(false);
                  setNewMilestoneTitle('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, isSubmitting && styles.modalSubmitDisabled]}
                onPress={handleAddMilestone}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
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
  headerTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing[2],
  },
  headerRight: {
    width: 40,
  },
  menuButton: {
    padding: spacing[2],
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
  scrollView: {
    flex: 1,
  },
  infoCard: {
    margin: layout.screenPadding,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  projectName: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  projectCategory: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  projectDescription: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  statusSection: {
    marginBottom: spacing[4],
  },
  sectionLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[2],
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  statusOption: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  statusOptionText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h4,
    color: colors.primary[600],
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: layout.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
  },
  tabText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  tabContent: {
    padding: layout.screenPadding,
    paddingBottom: spacing[8],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  taskCheckbox: {
    marginRight: spacing[3],
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.text.tertiary,
  },
  taskMeta: {
    flexDirection: 'row',
    marginTop: spacing[1],
  },
  priorityBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  priorityText: {
    ...textStyles.caption,
    fontWeight: '500',
  },
  deleteButton: {
    padding: spacing[2],
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  costContent: {
    flex: 1,
  },
  costTitle: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  costCategory: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  costAmounts: {
    alignItems: 'flex-end',
    marginRight: spacing[2],
  },
  estimatedCost: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  actualCost: {
    ...textStyles.bodySmall,
    color: colors.primary[600],
    fontWeight: '600',
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  milestoneCheckbox: {
    marginRight: spacing[3],
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  milestoneTitleDone: {
    color: colors.text.tertiary,
  },
  milestoneDue: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
    marginTop: spacing[2],
  },
  addItemText: {
    ...textStyles.body,
    color: colors.primary[500],
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
    marginBottom: spacing[4],
  },
  modalInput: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...textStyles.body,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modalCancelText: {
    ...textStyles.button,
    color: colors.text.secondary,
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  modalSubmitDisabled: {
    opacity: 0.7,
  },
  modalSubmitText: {
    ...textStyles.button,
    color: '#fff',
  },
});

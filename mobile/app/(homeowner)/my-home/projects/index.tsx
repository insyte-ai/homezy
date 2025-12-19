/**
 * Projects List Screen
 * Shows homeowner's home improvement projects
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../../../src/components/ui';
import { colors } from '../../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../../src/theme/spacing';
import { textStyles } from '../../../../src/theme/typography';
import {
  getMyHomeProjects,
  deleteHomeProject,
  HomeProjectWithStats,
  projectStatusConfig,
  projectCategoryConfig,
} from '../../../../src/services/homeProjects';

type FilterTab = 'all' | 'active' | 'completed';

function ProjectCard({
  project,
  onPress,
  onDelete,
}: {
  project: HomeProjectWithStats;
  onPress: () => void;
  onDelete: () => void;
}) {
  const statusConfig = projectStatusConfig[project.status];
  const categoryConfig = projectCategoryConfig[project.category];

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  return (
    <TouchableOpacity style={styles.projectCard} onPress={onPress} activeOpacity={0.7}>
      {/* Default Badge */}
      {project.isDefault && (
        <View style={styles.defaultBadge}>
          <Ionicons name="bulb" size={12} color={colors.primary[500]} />
          <Text style={styles.defaultBadgeText}>Ideas Collection</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.projectHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: categoryConfig?.bgColor || colors.primary[50] }]}>
          <Ionicons
            name={categoryConfig?.icon as any || 'construct'}
            size={20}
            color={categoryConfig?.color || colors.primary[500]}
          />
        </View>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
          <Text style={styles.projectCategory}>{categoryConfig?.label || project.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Description */}
      {project.description && (
        <Text style={styles.projectDescription} numberOfLines={2}>
          {project.description}
        </Text>
      )}

      {/* Progress */}
      {project.tasksTotal > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${project.progress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {project.tasksCompleted}/{project.tasksTotal} tasks
          </Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        {project.budgetEstimated && project.budgetEstimated > 0 && (
          <View style={styles.statItem}>
            <Ionicons name="wallet-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.statText}>{formatCurrency(project.budgetEstimated)}</Text>
          </View>
        )}
        {project.targetEndDate && (
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.statText}>
              {new Date(project.targetEndDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        )}
        {project.milestones.length > 0 && (
          <View style={styles.statItem}>
            <Ionicons name="flag-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.statText}>{project.milestones.length} milestones</Text>
          </View>
        )}
      </View>

      {/* Menu button */}
      {!project.isDefault && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={(e) => {
            e.stopPropagation();
            Alert.alert('Project Options', '', [
              { text: 'Delete', style: 'destructive', onPress: onDelete },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<HomeProjectWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const loadProjects = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      let status: string | undefined;
      if (activeFilter === 'active') status = 'planning,in-progress,on-hold';
      else if (activeFilter === 'completed') status = 'completed';

      const response = await getMyHomeProjects({ status: status as any });
      setProjects(response.projects);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProjects(projects.length === 0);
    }, [activeFilter])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProjects(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleCreateProject = () => {
    router.push('/(homeowner)/my-home/projects/new');
  };

  const handleProjectPress = (project: HomeProjectWithStats) => {
    router.push(`/(homeowner)/my-home/projects/${project.id}`);
  };

  const handleDeleteProject = async (project: HomeProjectWithStats) => {
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
              await loadProjects(false);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete project. Please try again.');
            }
          },
        },
      ]
    );
  };

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateProject}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

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
          <TouchableOpacity style={styles.retryButton} onPress={() => loadProjects()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="construct-outline"
          title="No Projects Yet"
          description="Start tracking your home improvement projects to manage tasks, budgets, and milestones"
          actionLabel="Create Project"
          onAction={handleCreateProject}
        />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => handleProjectPress(item)}
              onDelete={() => handleDeleteProject(item)}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
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
  projectCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing[1],
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    marginBottom: spacing[3],
  },
  defaultBadgeText: {
    ...textStyles.caption,
    color: colors.primary[600],
    fontWeight: '600',
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    paddingRight: spacing[6],
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  projectName: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  projectCategory: {
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
  projectDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    minWidth: 70,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  menuButton: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    padding: spacing[1],
  },
});

/**
 * My Home screen
 * Hub for properties, projects, reminders, service history, and expenses
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getMyProperties, Property } from '../../../src/services/properties';
import { getMyHomeProjects, HomeProjectWithStats } from '../../../src/services/homeProjects';
import { getOverdueReminders, ServiceReminder } from '../../../src/services/serviceReminders';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  badge?: number;
  onPress: () => void;
}

function MenuItem({ icon, title, subtitle, badge, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.menuItem}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={24} color={colors.primary[500]} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      </Card>
    </TouchableOpacity>
  );
}

export default function MyHomeScreen() {
  const [primaryProperty, setPrimaryProperty] = useState<Property | null>(null);
  const [activeProjects, setActiveProjects] = useState<HomeProjectWithStats[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<ServiceReminder[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [propertiesResponse, projectsResponse, overdueResponse] = await Promise.all([
        getMyProperties().catch(() => ({ properties: [] })),
        getMyHomeProjects({ status: 'in-progress' as any }).catch(() => ({ projects: [] })),
        getOverdueReminders().catch(() => []),
      ]);

      const primary = propertiesResponse.properties.find((p) => p.isPrimary);
      setPrimaryProperty(primary || propertiesResponse.properties[0] || null);
      setActiveProjects(projectsResponse.projects.slice(0, 3));
      setOverdueReminders(overdueResponse);
    } catch (err) {
      console.error('Error loading my home data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Home</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Primary Property Card */}
        {primaryProperty && (
          <TouchableOpacity
            style={styles.propertyCard}
            onPress={() => router.push('/(homeowner)/my-home/properties')}
            activeOpacity={0.7}
          >
            <View style={styles.propertyHeader}>
              <View style={styles.propertyIconContainer}>
                <Ionicons name="home" size={28} color={colors.primary[500]} />
              </View>
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyName}>{primaryProperty.name}</Text>
                <Text style={styles.propertyType}>
                  {primaryProperty.propertyType} • {primaryProperty.emirate}
                </Text>
              </View>
              <View style={styles.primaryBadge}>
                <Ionicons name="star" size={12} color={colors.warning[500]} />
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
            </View>
            {(primaryProperty.bedrooms || primaryProperty.bathrooms || primaryProperty.sizeSqFt) && (
              <View style={styles.propertyStats}>
                {primaryProperty.bedrooms !== undefined && primaryProperty.bedrooms > 0 && (
                  <View style={styles.propertyStat}>
                    <Ionicons name="bed-outline" size={16} color={colors.text.tertiary} />
                    <Text style={styles.propertyStatText}>{primaryProperty.bedrooms} bed</Text>
                  </View>
                )}
                {primaryProperty.bathrooms !== undefined && primaryProperty.bathrooms > 0 && (
                  <View style={styles.propertyStat}>
                    <Ionicons name="water-outline" size={16} color={colors.text.tertiary} />
                    <Text style={styles.propertyStatText}>{primaryProperty.bathrooms} bath</Text>
                  </View>
                )}
                {primaryProperty.sizeSqFt !== undefined && primaryProperty.sizeSqFt > 0 && (
                  <View style={styles.propertyStat}>
                    <Ionicons name="resize-outline" size={16} color={colors.text.tertiary} />
                    <Text style={styles.propertyStatText}>{primaryProperty.sizeSqFt.toLocaleString()} sqft</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Overdue Reminders Alert */}
        {overdueReminders.length > 0 && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => router.push('/(homeowner)/my-home/reminders')}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle" size={24} color={colors.error[500]} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {overdueReminders.length} Overdue Reminder{overdueReminders.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.alertSubtitle}>Tap to view and manage</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.error[400]} />
          </TouchableOpacity>
        )}

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Projects</Text>
              <TouchableOpacity onPress={() => router.push('/(homeowner)/my-home/projects')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {activeProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.projectItem}
                onPress={() => router.push(`/(homeowner)/my-home/projects/${project.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
                  <View style={styles.projectProgress}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{project.progress}%</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="home-outline"
            title="Properties"
            subtitle="Manage your properties"
            onPress={() => router.push('/(homeowner)/my-home/properties')}
          />
          <MenuItem
            icon="construct-outline"
            title="Projects"
            subtitle="Track home improvement projects"
            onPress={() => router.push('/(homeowner)/my-home/projects')}
          />
          <MenuItem
            icon="time-outline"
            title="Service History"
            subtitle="View past services"
            onPress={() => router.push('/(homeowner)/my-home/service-history')}
          />
          <MenuItem
            icon="notifications-outline"
            title="Reminders"
            subtitle="Service reminders & maintenance"
            badge={overdueReminders.length}
            onPress={() => router.push('/(homeowner)/my-home/reminders')}
          />
          <MenuItem
            icon="wallet-outline"
            title="Expenses"
            subtitle="Track home-related expenses"
            onPress={() => router.push('/(homeowner)/my-home/expenses')}
          />
          <MenuItem
            icon="bulb-outline"
            title="Ideas"
            subtitle="Saved inspiration & resources"
            onPress={() => router.push('/(homeowner)/my-home/projects')}
          />
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
    paddingBottom: spacing[8],
  },
  // Property Card
  propertyCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  propertyName: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  propertyType: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.warning[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  primaryBadgeText: {
    ...textStyles.caption,
    color: colors.warning[700],
    fontWeight: '600',
  },
  propertyStats: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  propertyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  propertyStatText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  // Alert Card
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.error[100],
    gap: spacing[3],
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    ...textStyles.body,
    color: colors.error[700],
    fontWeight: '600',
  },
  alertSubtitle: {
    ...textStyles.caption,
    color: colors.error[600],
  },
  // Section
  section: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  seeAllText: {
    ...textStyles.bodySmall,
    color: colors.primary[500],
    fontWeight: '600',
  },
  // Project Item
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  projectInfo: {
    flex: 1,
    marginRight: spacing[2],
  },
  projectName: {
    ...textStyles.body,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  projectProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
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
    minWidth: 35,
  },
  // Menu Section
  menuSection: {
    gap: spacing[3],
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
    backgroundColor: colors.primary[50],
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
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.error[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[2],
    paddingHorizontal: spacing[2],
  },
  badgeText: {
    ...textStyles.caption,
    color: '#fff',
    fontWeight: '700',
  },
});

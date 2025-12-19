/**
 * Service History Screen
 * Shows past services for the homeowner
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
import { EmptyState } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import {
  getMyServiceHistory,
  deleteServiceHistory,
  ServiceHistory,
  serviceCategoryConfig,
  serviceTypeConfig,
  providerTypeConfig,
} from '../../../src/services/serviceHistory';

function ServiceHistoryCard({
  service,
  onDelete,
}: {
  service: ServiceHistory;
  onDelete: () => void;
}) {
  const category = serviceCategoryConfig[service.category];
  const serviceType = serviceTypeConfig[service.serviceType];
  const provider = providerTypeConfig[service.providerType];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  return (
    <View style={styles.serviceCard}>
      {/* Header */}
      <View style={styles.serviceHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category?.bgColor || colors.primary[50] }]}>
          <Ionicons
            name={category?.icon as any || 'construct'}
            size={20}
            color={category?.color || colors.primary[500]}
          />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle} numberOfLines={1}>{service.title}</Text>
          <Text style={styles.serviceCategory}>{category?.label || service.category}</Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            Alert.alert('Options', '', [
              { text: 'Delete', style: 'destructive', onPress: onDelete },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Description */}
      {service.description && (
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {service.description}
        </Text>
      )}

      {/* Details */}
      <View style={styles.detailsRow}>
        <View style={[styles.typeBadge, { backgroundColor: serviceType?.bgColor }]}>
          <Text style={[styles.typeText, { color: serviceType?.color }]}>
            {serviceType?.label || service.serviceType}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons
            name={provider?.icon as any || 'person'}
            size={14}
            color={colors.text.tertiary}
          />
          <Text style={styles.detailText}>
            {service.providerName || provider?.label || 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.dateText}>{formatDate(service.completedAt)}</Text>
        </View>

        {service.cost !== undefined && service.cost > 0 && (
          <Text style={styles.costText}>{formatCurrency(service.cost)}</Text>
        )}

        {service.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.warning[500]} />
            <Text style={styles.ratingText}>{service.rating}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ServiceHistoryScreen() {
  const [services, setServices] = useState<ServiceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const response = await getMyServiceHistory({ limit: 50 });
      setServices(response.services);
    } catch (err) {
      console.error('Error loading service history:', err);
      setError('Failed to load service history. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadServices(services.length === 0);
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadServices(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleDelete = async (service: ServiceHistory) => {
    Alert.alert(
      'Delete Service',
      `Delete "${service.title}" from your history? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteServiceHistory(service.id);
              await loadServices(false);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete service. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Calculate stats
  const totalSpent = services.reduce((sum, s) => sum + (s.cost || 0), 0);
  const avgRating = services.filter(s => s.rating).length > 0
    ? services.filter(s => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) / services.filter(s => s.rating).length
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Service History</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Stats Summary */}
      {services.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{services.length}</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>AED {totalSpent.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          {avgRating > 0 && (
            <View style={styles.statBox}>
              <View style={styles.ratingValue}>
                <Ionicons name="star" size={16} color={colors.warning[500]} />
                <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
              </View>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          )}
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadServices()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : services.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No Service History"
          description="Your completed services will appear here. Accept quotes and complete jobs to build your history."
        />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceHistoryCard service={item} onDelete={() => handleDelete(item)} />
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
  headerRight: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    gap: spacing[3],
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
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
  serviceCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  serviceHeader: {
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
  serviceInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  serviceTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  serviceCategory: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  menuButton: {
    padding: spacing[1],
  },
  serviceDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  typeBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  typeText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  detailText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    flex: 1,
  },
  dateText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  costText: {
    ...textStyles.body,
    color: colors.primary[600],
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  ratingText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
});

/**
 * Lead Marketplace Screen
 * Browse and claim available leads
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, Badge } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getMarketplace, Lead } from '../../../src/services/leads';
import { getBalance } from '../../../src/services/credits';
import { EMIRATES, BUDGET_BRACKETS, URGENCY_LEVELS } from '../../../src/constants/leadForm';
import { getAllServices, ServiceGroup } from '../../../src/services/services';

// Urgency badge colors
const URGENCY_CONFIG: Record<string, { color: string; bgColor: string }> = {
  emergency: { color: colors.error[700], bgColor: colors.error[50] },
  urgent: { color: colors.warning[700], bgColor: colors.warning[50] },
  flexible: { color: colors.primary[700], bgColor: colors.primary[50] },
  planning: { color: colors.neutral[600], bgColor: colors.neutral[100] },
};

// Lead card component
function MarketplaceLeadCard({
  lead,
  onPress,
  credits,
}: {
  lead: Lead;
  onPress: () => void;
  credits: number;
}) {
  const emirate = EMIRATES.find((e) => e.id === lead.location.emirate);
  const budget = BUDGET_BRACKETS.find((b) => b.id === lead.budgetBracket);
  const urgency = URGENCY_LEVELS.find((u) => u.id === lead.urgency);
  const urgencyConfig = URGENCY_CONFIG[lead.urgency] || URGENCY_CONFIG.flexible;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const canClaim = credits >= lead.creditsRequired && !lead.hasClaimed;

  return (
    <TouchableOpacity
      style={[styles.leadCard, lead.hasClaimed && styles.leadCardClaimed]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.leadHeader}>
        <View style={styles.leadTitleContainer}>
          <Text style={styles.leadTitle} numberOfLines={2}>
            {lead.title}
          </Text>
          <Text style={styles.leadCategory}>{lead.category}</Text>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: urgencyConfig.bgColor }]}>
          <Text style={[styles.urgencyText, { color: urgencyConfig.color }]}>
            {urgency?.label || lead.urgency}
          </Text>
        </View>
      </View>

      {/* Description preview */}
      <Text style={styles.leadDescription} numberOfLines={2}>
        {lead.description}
      </Text>

      {/* Details */}
      <View style={styles.leadDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.detailText}>{emirate?.name || lead.location.emirate}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.detailText}>{budget?.label || lead.budgetBracket}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.leadFooter}>
        <View style={styles.footerLeft}>
          <Text style={styles.timeText}>{formatDate(lead.createdAt)}</Text>
          <View style={styles.claimCount}>
            <Ionicons name="people-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.claimCountText}>
              {lead.claimCount ?? 0}/{lead.maxClaims ?? 5} claimed
            </Text>
          </View>
        </View>
        <View style={styles.creditsBadge}>
          <Ionicons name="flash" size={14} color={colors.professional.primary} />
          <Text style={styles.creditsText}>{lead.creditsRequired} credits</Text>
        </View>
      </View>

      {/* Claimed indicator */}
      {lead.hasClaimed && (
        <View style={styles.claimedBanner}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success[600]} />
          <Text style={styles.claimedText}>You claimed this lead</Text>
        </View>
      )}

      {/* Match score */}
      {lead.matchScore && lead.matchScore > 0 && (
        <View style={styles.matchBadge}>
          <Ionicons name="star" size={12} color={colors.warning[500]} />
          <Text style={styles.matchText}>{Math.round(lead.matchScore)}% match</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Filter modal
function FilterModal({
  visible,
  onClose,
  filters,
  onApply,
  services,
}: {
  visible: boolean;
  onClose: () => void;
  filters: {
    category?: string;
    location?: string;
    urgency?: string;
  };
  onApply: (filters: any) => void;
  services: ServiceGroup[];
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onApply({});
    onClose();
  };

  // Get all subservices flattened
  const allCategories = services.flatMap((group) =>
    group.categories.flatMap((cat) =>
      cat.subservices.map((sub) => ({ id: sub.slug, name: sub.name }))
    )
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Leads</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Location Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Location</Text>
              <View style={styles.filterOptions}>
                {EMIRATES.map((emirate) => (
                  <TouchableOpacity
                    key={emirate.id}
                    style={[
                      styles.filterChip,
                      localFilters.location === emirate.id && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        location: prev.location === emirate.id ? undefined : emirate.id,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        localFilters.location === emirate.id && styles.filterChipTextActive,
                      ]}
                    >
                      {emirate.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Urgency Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Urgency</Text>
              <View style={styles.filterOptions}>
                {URGENCY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.filterChip,
                      localFilters.urgency === level.id && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        urgency: prev.urgency === level.id ? undefined : level.id,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        localFilters.urgency === level.id && styles.filterChipTextActive,
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.filterOptions}>
                {allCategories.slice(0, 12).map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.filterChip,
                      localFilters.category === cat.id && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        category: prev.category === cat.id ? undefined : cat.id,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        localFilters.category === cat.id && styles.filterChipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function LeadsScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<ServiceGroup[]>([]);
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    category?: string;
    location?: string;
    urgency?: string;
  }>({});
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  const loadData = async (showLoading = true, page = 1) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const [leadsData, servicesData, balanceData] = await Promise.all([
        getMarketplace({
          page,
          limit: 20,
          category: filters.category,
          location: filters.location,
          urgency: filters.urgency,
        }),
        services.length === 0 ? getAllServices() : Promise.resolve(services),
        getBalance().catch(() => ({ balance: { totalBalance: 0 } })),
      ]);

      setLeads(page === 1 ? leadsData.leads : [...leads, ...leadsData.leads]);
      setPagination(leadsData.pagination || { page: 1, total: 0, pages: 0 });
      if (servicesData !== services) setServices(servicesData as ServiceGroup[]);
      setCredits(balanceData.balance.totalBalance);
    } catch (err) {
      console.error('Error loading leads:', err);
      setError('Failed to load leads. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      loadData(false);
    }, [filters])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(false);
  };

  const handleLeadPress = (lead: Lead) => {
    router.push(`/(pro)/lead/${lead.id}`);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Lead Marketplace</Text>
          <Text style={styles.subtitle}>
            {pagination?.total ?? 0} leads available
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.creditsIndicator}>
            <Ionicons name="flash" size={16} color={colors.professional.primary} />
            <Text style={styles.creditsIndicatorText}>{credits}</Text>
          </View>
          <TouchableOpacity
            style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFiltersCount > 0 ? '#fff' : colors.text.primary}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {isLoading && leads.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.professional.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : leads.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title="No Leads Available"
          description={
            activeFiltersCount > 0
              ? 'No leads match your filters. Try adjusting your criteria.'
              : 'New leads from homeowners will appear here. Check back soon!'
          }
          actionLabel={activeFiltersCount > 0 ? 'Clear Filters' : undefined}
          onAction={activeFiltersCount > 0 ? () => setFilters({}) : undefined}
        />
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MarketplaceLeadCard
              lead={item}
              onPress={() => handleLeadPress(item)}
              credits={credits}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.professional.primary]}
              tintColor={colors.professional.primary}
            />
          }
          onEndReached={() => {
            if (pagination && pagination.page < pagination.pages && !isLoading) {
              loadData(false, pagination.page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && leads.length > 0 ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.professional.primary} />
              </View>
            ) : null
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={handleApplyFilters}
        services={services}
      />
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
    padding: layout.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  subtitle: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  creditsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.professional.primary + '15',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  creditsIndicatorText: {
    ...textStyles.label,
    color: colors.professional.primary,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.professional.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error[500],
    borderRadius: borderRadius.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    ...textStyles.caption,
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
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
    backgroundColor: colors.professional.primary,
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
  loadingMore: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  leadCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
  },
  leadCardClaimed: {
    borderColor: colors.success[300],
    backgroundColor: colors.success[50],
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  leadTitleContainer: {
    flex: 1,
    marginRight: spacing[3],
  },
  leadTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  leadCategory: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  urgencyBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  urgencyText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  leadDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    lineHeight: 20,
  },
  leadDetails: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[3],
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
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  timeText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  claimCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  claimCountText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.professional.primary + '15',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  creditsText: {
    ...textStyles.caption,
    color: colors.professional.primary,
    fontWeight: '600',
  },
  claimedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.success[100],
    padding: spacing[2],
    borderRadius: borderRadius.sm,
    marginTop: spacing[3],
  },
  claimedText: {
    ...textStyles.caption,
    color: colors.success[700],
    fontWeight: '600',
  },
  matchBadge: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.warning[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  matchText: {
    ...textStyles.caption,
    color: colors.warning[700],
    fontSize: 10,
    fontWeight: '600',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: layout.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  modalBody: {
    padding: layout.screenPadding,
  },
  filterSection: {
    marginBottom: spacing[6],
  },
  filterLabel: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.professional.primary,
    borderColor: colors.professional.primary,
  },
  filterChipText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  resetButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
  },
  resetButtonText: {
    ...textStyles.button,
    color: colors.text.secondary,
  },
  applyButton: {
    flex: 2,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.professional.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
});

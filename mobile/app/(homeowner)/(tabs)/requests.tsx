/**
 * My Requests Screen
 * Shows homeowner's service requests (leads) with quotes
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, Badge } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getMyLeads, Lead, LeadStatus } from '../../../src/services/leads';
import { EMIRATES, BUDGET_BRACKETS, URGENCY_LEVELS } from '../../../src/constants/leadForm';

// Status badge colors
const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  open: { color: colors.success[700], bgColor: colors.success[50], label: 'Open' },
  full: { color: colors.warning[700], bgColor: colors.warning[50], label: 'Full' },
  accepted: { color: colors.primary[700], bgColor: colors.primary[50], label: 'Accepted' },
  expired: { color: colors.neutral[600], bgColor: colors.neutral[100], label: 'Expired' },
  cancelled: { color: colors.error[700], bgColor: colors.error[50], label: 'Cancelled' },
};

// Lead card component
function LeadCard({ lead, onPress }: { lead: Lead; onPress: () => void }) {
  const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.open;
  const emirate = EMIRATES.find((e) => e.id === lead.location.emirate);
  const budget = BUDGET_BRACKETS.find((b) => b.id === lead.budgetBracket);
  const urgency = URGENCY_LEVELS.find((u) => u.id === lead.urgency);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.leadCard} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.leadHeader}>
        <View style={styles.leadTitleContainer}>
          <Text style={styles.leadTitle} numberOfLines={2}>
            {lead.title}
          </Text>
          <Text style={styles.leadCategory}>{lead.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

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
        {urgency && (
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.detailText}>{urgency.label}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.leadFooter}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color={colors.primary[500]} />
            <Text style={styles.statText}>{lead.claimsCount} claims</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="document-text-outline" size={16} color={colors.primary[500]} />
            <Text style={styles.statText}>{lead.quotesCount} quotes</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{formatDate(lead.createdAt)}</Text>
      </View>

      {/* Quotes indicator */}
      {lead.quotesCount > 0 && lead.status === 'open' && (
        <View style={styles.quotesIndicator}>
          <Ionicons name="notifications" size={14} color={colors.primary[600]} />
          <Text style={styles.quotesIndicatorText}>
            {lead.quotesCount} new quote{lead.quotesCount > 1 ? 's' : ''} to review
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Filter tabs
type FilterTab = 'all' | 'open' | 'accepted' | 'closed';

export default function RequestsScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [total, setTotal] = useState(0);

  const loadLeads = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      // Map filter to status parameter
      let status: string | undefined;
      if (activeFilter === 'open') status = 'open,full';
      else if (activeFilter === 'accepted') status = 'accepted';
      else if (activeFilter === 'closed') status = 'expired,cancelled';

      const response = await getMyLeads({ status, limit: 50 });
      setLeads(response.leads);
      setTotal(response.total);
    } catch (err) {
      console.error('Error loading leads:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load on mount and when filter changes
  useEffect(() => {
    loadLeads();
  }, [activeFilter]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      loadLeads(false);
    }, [activeFilter])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadLeads(false);
  };

  const handleCreateRequest = () => {
    router.push('/(homeowner)/create-request/');
  };

  const handleLeadPress = (lead: Lead) => {
    router.push(`/(homeowner)/request/${lead.id}`);
  };

  const filteredLeads = leads;

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Active' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'closed', label: 'Closed' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Requests</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateRequest}>
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
          <TouchableOpacity style={styles.retryButton} onPress={() => loadLeads()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          icon="clipboard-outline"
          title="No Requests Yet"
          description="Create a service request to get quotes from qualified professionals"
          actionLabel="Create Request"
          onAction={handleCreateRequest}
        />
      ) : (
        <FlatList
          data={filteredLeads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LeadCard lead={item} onPress={() => handleLeadPress(item)} />
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
    padding: layout.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  leadCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
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
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  leadDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
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
  statsContainer: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  dateText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  quotesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary[50],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginTop: spacing[3],
  },
  quotesIndicatorText: {
    ...textStyles.bodySmall,
    color: colors.primary[700],
    fontWeight: '600',
  },
});

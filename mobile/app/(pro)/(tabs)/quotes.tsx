/**
 * My Quotes Screen
 * Shows all quotes submitted by the professional
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getMyQuotes } from '../../../src/services/quotes';
import { Quote } from '../../../src/services/leads';

// Status filter options
const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'declined', label: 'Declined' },
];

// Status badge configuration
const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string; icon: string }> = {
  pending: {
    color: colors.warning[700],
    bgColor: colors.warning[50],
    label: 'Pending',
    icon: 'hourglass',
  },
  accepted: {
    color: colors.success[700],
    bgColor: colors.success[50],
    label: 'Accepted',
    icon: 'checkmark-circle',
  },
  declined: {
    color: colors.error[700],
    bgColor: colors.error[50],
    label: 'Declined',
    icon: 'close-circle',
  },
  expired: {
    color: colors.neutral[600],
    bgColor: colors.neutral[100],
    label: 'Expired',
    icon: 'time',
  },
};

// Quote card component
function QuoteCard({ quote, onPress }: { quote: Quote; onPress: () => void }) {
  const statusConfig = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateString);
  };

  return (
    <TouchableOpacity
      style={[styles.quoteCard, quote.status === 'accepted' && styles.quoteCardAccepted]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.quoteHeader}>
        <View style={styles.quoteTitleContainer}>
          <Text style={styles.quoteTitle} numberOfLines={1}>
            Quote for Lead #{quote.leadId.slice(-6)}
          </Text>
          <Text style={styles.quoteDate}>Submitted {formatTimeAgo(quote.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Total Quote</Text>
        <Text style={styles.amountValue}>{formatCurrency(quote.pricing?.total ?? 0)}</Text>
      </View>

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.timelineText}>
            {quote.timeline?.estimatedDuration ?? 0} days
          </Text>
        </View>
        {quote.lead && (
          <View style={styles.timelineItem}>
            <Ionicons name="briefcase-outline" size={16} color={colors.text.tertiary} />
            <Text style={styles.timelineText} numberOfLines={1}>
              {quote.lead.title}
            </Text>
          </View>
        )}
      </View>

      {/* Items summary */}
      <View style={styles.itemsSummary}>
        <Text style={styles.itemsText}>
          {quote.pricing?.items?.length ?? 0} item{(quote.pricing?.items?.length ?? 0) !== 1 ? 's' : ''}
        </Text>
        {quote.warranty && (
          <View style={styles.warrantyBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.success[600]} />
            <Text style={styles.warrantyText}>Warranty</Text>
          </View>
        )}
      </View>

      {/* Response info for accepted/declined */}
      {quote.status === 'accepted' && quote.acceptedAt && (
        <View style={styles.responseInfo}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success[600]} />
          <Text style={styles.responseText}>
            Accepted on {formatDate(quote.acceptedAt)}
          </Text>
        </View>
      )}
      {quote.status === 'declined' && (
        <View style={styles.responseInfo}>
          <Ionicons name="close-circle" size={16} color={colors.error[600]} />
          <Text style={styles.responseText}>
            {quote.declineReason || 'Declined by homeowner'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function QuotesScreen() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  const loadData = async (showLoading = true, page = 1) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const data = await getMyQuotes({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      setQuotes(page === 1 ? data.quotes : [...quotes, ...data.quotes]);
      setPagination(data.pagination || { page: 1, total: 0, pages: 0 });
    } catch (err) {
      console.error('Error loading quotes:', err);
      setError('Failed to load quotes. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [statusFilter])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(false);
  };

  const handleQuotePress = (quote: Quote) => {
    router.push(`/(pro)/quote/${quote.id}`);
  };

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.pages && !isLoading) {
      loadData(false, pagination.page + 1);
    }
  };

  // Stats for header
  const pendingCount = quotes.filter((q) => q.status === 'pending').length;
  const acceptedCount = quotes.filter((q) => q.status === 'accepted').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Quotes</Text>
          <Text style={styles.subtitle}>
            {pagination?.total ?? 0} quote{(pagination?.total ?? 0) !== 1 ? 's' : ''} submitted
          </Text>
        </View>
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              statusFilter === filter.id && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === filter.id && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {isLoading && quotes.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : quotes.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No Quotes Yet"
          description={
            statusFilter !== 'all'
              ? `No ${statusFilter} quotes found. Try a different filter.`
              : 'Claim leads from the marketplace and submit quotes to see them here.'
          }
          actionLabel={statusFilter !== 'all' ? 'Show All' : 'Browse Leads'}
          onAction={
            statusFilter !== 'all'
              ? () => setStatusFilter('all')
              : () => router.push('/(pro)/(tabs)/leads')
          }
        />
      ) : (
        <FlatList
          data={quotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <QuoteCard quote={item} onPress={() => handleQuotePress(item)} />
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && quotes.length > 0 ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
              </View>
            ) : null
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
  subtitle: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterChipText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
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
  loadingMore: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  quoteCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  quoteCardAccepted: {
    borderColor: colors.success[300],
    backgroundColor: colors.success[50],
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  quoteTitleContainer: {
    flex: 1,
    marginRight: spacing[3],
  },
  quoteTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  quoteDate: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  amountContainer: {
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[3],
  },
  amountLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  amountValue: {
    ...textStyles.h3,
    color: colors.primary[600],
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  timelineText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  itemsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemsText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  warrantyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.success[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  warrantyText: {
    ...textStyles.caption,
    color: colors.success[700],
    fontSize: 10,
    fontWeight: '600',
  },
  responseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  responseText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
});

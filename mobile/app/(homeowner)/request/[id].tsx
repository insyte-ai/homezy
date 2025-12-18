/**
 * Request Details Screen
 * Shows lead details and received quotes
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getLeadById, cancelLead, Lead } from '../../../src/services/leads';
import { getQuotesForLead, acceptQuote, declineQuote } from '../../../src/services/quotes';
import { Quote } from '../../../src/services/leads';
import { EMIRATES, BUDGET_BRACKETS, URGENCY_LEVELS } from '../../../src/constants/leadForm';
import { Avatar } from '../../../src/components/ui';

// Status badge colors
const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  open: { color: colors.success[700], bgColor: colors.success[50], label: 'Open' },
  full: { color: colors.warning[700], bgColor: colors.warning[50], label: 'Full' },
  accepted: { color: colors.primary[700], bgColor: colors.primary[50], label: 'Accepted' },
  expired: { color: colors.neutral[600], bgColor: colors.neutral[100], label: 'Expired' },
  cancelled: { color: colors.error[700], bgColor: colors.error[50], label: 'Cancelled' },
};

const QUOTE_STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  pending: { color: colors.warning[700], bgColor: colors.warning[50], label: 'Pending' },
  accepted: { color: colors.success[700], bgColor: colors.success[50], label: 'Accepted' },
  declined: { color: colors.error[700], bgColor: colors.error[50], label: 'Declined' },
  expired: { color: colors.neutral[600], bgColor: colors.neutral[100], label: 'Expired' },
};

// Quote card component
function QuoteCard({
  quote,
  onAccept,
  onDecline,
  onViewDetails,
  disabled,
}: {
  quote: Quote;
  onAccept: () => void;
  onDecline: () => void;
  onViewDetails: () => void;
  disabled: boolean;
}) {
  const statusConfig = QUOTE_STATUS_CONFIG[quote.status] || QUOTE_STATUS_CONFIG.pending;
  const professional = quote.professional;

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.quoteCard}>
      {/* Header */}
      <View style={styles.quoteHeader}>
        <View style={styles.proInfo}>
          <Avatar
            name={
              professional
                ? `${professional.firstName} ${professional.lastName}`
                : 'Professional'
            }
            source={professional?.profilePhoto}
            size="md"
          />
          <View style={styles.proDetails}>
            <Text style={styles.proName}>
              {professional?.proProfile?.businessName ||
                (professional
                  ? `${professional.firstName} ${professional.lastName}`
                  : 'Professional')}
            </Text>
            {professional?.proProfile?.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={colors.warning[500]} />
                <Text style={styles.ratingText}>
                  {professional.proProfile.rating.toFixed(1)} ({professional.proProfile.reviewCount || 0} reviews)
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.quoteStatusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={[styles.quoteStatusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Quote Summary */}
      <View style={styles.quoteSummary}>
        <View style={styles.quoteAmountContainer}>
          <Text style={styles.quoteAmountLabel}>Total Quote</Text>
          <Text style={styles.quoteAmount}>{formatCurrency(quote.pricing?.total ?? 0)}</Text>
        </View>
        <View style={styles.quoteTimeline}>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Start</Text>
            <Text style={styles.timelineValue}>
              {quote.estimatedStartDate ? formatDate(quote.estimatedStartDate) : 'TBD'}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={colors.text.tertiary} />
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Complete</Text>
            <Text style={styles.timelineValue}>
              {quote.estimatedCompletionDate ? formatDate(quote.estimatedCompletionDate) : 'TBD'}
            </Text>
          </View>
        </View>
      </View>

      {/* Approach preview */}
      {quote.approach && (
        <View style={styles.approachContainer}>
          <Text style={styles.approachLabel}>Approach</Text>
          <Text style={styles.approachText} numberOfLines={3}>
            {quote.approach}
          </Text>
        </View>
      )}

      {/* Actions */}
      {quote.status === 'pending' && !disabled && (
        <View style={styles.quoteActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={onDecline}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={onAccept}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* View Details */}
      <TouchableOpacity style={styles.viewDetailsButton} onPress={onViewDetails}>
        <Text style={styles.viewDetailsText}>View Full Quote</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
      </TouchableOpacity>
    </View>
  );
}

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [lead, setLead] = useState<Lead | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async (showLoading = true) => {
    if (!id) return;

    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const [leadData, quotesData] = await Promise.all([
        getLeadById(id),
        getQuotesForLead(id).catch(() => []),
      ]);

      setLead(leadData);
      setQuotes(quotesData);
    } catch (err) {
      console.error('Error loading request:', err);
      setError('Failed to load request details. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData(false);
    }, [id])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleAcceptQuote = async (quote: Quote) => {
    Alert.alert(
      'Accept Quote',
      `Are you sure you want to accept this quote for AED ${(quote.pricing?.total ?? 0).toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setActionLoading(quote.id);
              await acceptQuote(quote.id);
              await loadData(false);
              Alert.alert('Success', 'Quote accepted! The professional will be notified.');
            } catch (err) {
              Alert.alert('Error', 'Failed to accept quote. Please try again.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleDeclineQuote = async (quote: Quote) => {
    Alert.alert(
      'Decline Quote',
      'Are you sure you want to decline this quote?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(quote.id);
              await declineQuote(quote.id);
              await loadData(false);
            } catch (err) {
              Alert.alert('Error', 'Failed to decline quote. Please try again.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleViewQuoteDetails = (quote: Quote) => {
    // TODO: Navigate to quote details screen
    router.push(`/(homeowner)/quote/${quote.id}`);
  };

  const handleCancelRequest = () => {
    if (!lead) return;

    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this request? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading('cancel');
              await cancelLead(lead.id);
              await loadData(false);
              Alert.alert('Success', 'Request cancelled successfully.');
            } catch (err) {
              Alert.alert('Error', 'Failed to cancel request. Please try again.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lead) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error || 'Request not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.open;
  const emirate = EMIRATES.find((e) => e.id === lead.location.emirate);
  const budget = BUDGET_BRACKETS.find((b) => b.id === lead.budgetBracket);
  const urgency = URGENCY_LEVELS.find((u) => u.id === lead.urgency);
  const hasAcceptedQuote = lead.status === 'accepted';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            if (lead.status === 'open' || lead.status === 'full') {
              Alert.alert('Options', '', [
                { text: 'Cancel Request', style: 'destructive', onPress: handleCancelRequest },
                { text: 'Close', style: 'cancel' },
              ]);
            }
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
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
        {/* Lead Info */}
        <View style={styles.leadInfoCard}>
          <View style={styles.leadHeader}>
            <View style={styles.leadTitleContainer}>
              <Text style={styles.leadTitle}>{lead.title}</Text>
              <Text style={styles.leadCategory}>{lead.category}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <Text style={styles.leadDescription}>{lead.description}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color={colors.text.tertiary} />
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>
                {emirate?.name || lead.location.emirate}
                {lead.location.neighborhood ? `, ${lead.location.neighborhood}` : ''}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={18} color={colors.text.tertiary} />
              <Text style={styles.detailLabel}>Budget:</Text>
              <Text style={styles.detailValue}>{budget?.label || lead.budgetBracket}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color={colors.text.tertiary} />
              <Text style={styles.detailLabel}>Urgency:</Text>
              <Text style={styles.detailValue}>
                {urgency ? `${urgency.label} - ${urgency.description}` : lead.urgency}
              </Text>
            </View>
          </View>

          {/* Photos */}
          {lead.attachments && lead.attachments.filter(a => a.type === 'image').length > 0 && (
            <View style={styles.photosSection}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosRow}
              >
                {lead.attachments.filter(a => a.type === 'image').map((attachment) => (
                  <Image
                    key={attachment.id}
                    source={{ uri: attachment.thumbnail || attachment.url }}
                    style={styles.photoThumbnail}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Quotes Section */}
        <View style={styles.quotesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Quotes ({quotes.length})
            </Text>
          </View>

          {quotes.length === 0 ? (
            <View style={styles.noQuotesContainer}>
              <Ionicons name="document-text-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.noQuotesTitle}>No quotes yet</Text>
              <Text style={styles.noQuotesText}>
                Professionals are reviewing your request. You'll be notified when quotes arrive.
              </Text>
            </View>
          ) : (
            <View style={styles.quotesList}>
              {quotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onAccept={() => handleAcceptQuote(quote)}
                  onDecline={() => handleDeclineQuote(quote)}
                  onViewDetails={() => handleViewQuoteDetails(quote)}
                  disabled={hasAcceptedQuote || actionLoading === quote.id}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  },
  headerRight: {
    width: 40,
  },
  menuButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
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
  scrollContent: {
    padding: layout.screenPadding,
  },
  leadInfoCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
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
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  leadCategory: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  leadDescription: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing[4],
  },
  detailsGrid: {
    gap: spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  detailLabel: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    width: 70,
  },
  detailValue: {
    ...textStyles.bodySmall,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '500',
  },
  photosSection: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  photosRow: {
    gap: spacing[2],
  },
  photoThumbnail: {
    width: 100,
    height: 75,
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  quotesSection: {
    marginBottom: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  noQuotesContainer: {
    alignItems: 'center',
    padding: spacing[8],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  noQuotesTitle: {
    ...textStyles.h4,
    color: colors.text.secondary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  noQuotesText: {
    ...textStyles.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  quotesList: {
    gap: spacing[3],
  },
  quoteCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  proInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  proDetails: {
    marginLeft: spacing[3],
    flex: 1,
  },
  proName: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
  },
  ratingText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  quoteStatusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  quoteStatusText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  quoteSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[3],
  },
  quoteAmountContainer: {
    flex: 1,
  },
  quoteAmountLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  quoteAmount: {
    ...textStyles.h3,
    color: colors.primary[600],
  },
  quoteTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  timelineItem: {
    alignItems: 'center',
  },
  timelineLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  timelineValue: {
    ...textStyles.label,
    color: colors.text.primary,
    marginTop: 2,
  },
  approachContainer: {
    marginBottom: spacing[3],
  },
  approachLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  approachText: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  declineButtonText: {
    ...textStyles.button,
    color: colors.error[600],
  },
  acceptButton: {
    backgroundColor: colors.success[500],
  },
  acceptButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    gap: spacing[1],
  },
  viewDetailsText: {
    ...textStyles.bodySmall,
    color: colors.primary[600],
    fontWeight: '600',
  },
});

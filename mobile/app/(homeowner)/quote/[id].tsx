/**
 * Quote Details Screen
 * Shows full quote details with breakdown
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getQuoteById, acceptQuote, declineQuote } from '../../../src/services/quotes';
import { Quote } from '../../../src/services/leads';
import { Avatar } from '../../../src/components/ui';

const QUOTE_STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  pending: { color: colors.warning[700], bgColor: colors.warning[50], label: 'Pending' },
  accepted: { color: colors.success[700], bgColor: colors.success[50], label: 'Accepted' },
  declined: { color: colors.error[700], bgColor: colors.error[50], label: 'Declined' },
  expired: { color: colors.neutral[600], bgColor: colors.neutral[100], label: 'Expired' },
};

const CATEGORY_LABELS: Record<string, string> = {
  labor: 'Labor',
  materials: 'Materials',
  permits: 'Permits & Fees',
  equipment: 'Equipment',
  other: 'Other',
};

export default function QuoteDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadQuote = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getQuoteById(id);
      setQuote(data);
    } catch (err) {
      console.error('Error loading quote:', err);
      setError('Failed to load quote details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuote();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleAccept = () => {
    if (!quote) return;

    Alert.alert(
      'Accept Quote',
      `Are you sure you want to accept this quote for AED ${(quote.pricing?.total ?? 0).toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setActionLoading(true);
              await acceptQuote(quote.id);
              await loadQuote();
              Alert.alert('Success', 'Quote accepted! The professional will be notified.');
            } catch (err) {
              Alert.alert('Error', 'Failed to accept quote. Please try again.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDecline = () => {
    if (!quote) return;

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
              setActionLoading(true);
              await declineQuote(quote.id);
              router.back();
            } catch (err) {
              Alert.alert('Error', 'Failed to decline quote. Please try again.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quote Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !quote) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quote Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error || 'Quote not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadQuote}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = QUOTE_STATUS_CONFIG[quote.status] || QUOTE_STATUS_CONFIG.pending;
  const professional = quote.professional;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quote Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Professional Info */}
        <View style={styles.proCard}>
          <Avatar
            name={
              professional
                ? `${professional.firstName} ${professional.lastName}`
                : 'Professional'
            }
            source={professional?.profilePhoto}
            size="lg"
          />
          <View style={styles.proInfo}>
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
            {professional?.proProfile?.verificationStatus && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.success[600]} />
                <Text style={styles.verifiedText}>Verified Professional</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineCard}>
            <View style={styles.timelineRow}>
              <View style={styles.timelineItem}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary[500]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Start Date</Text>
                  <Text style={styles.timelineValue}>
                    {quote.estimatedStartDate ? formatDate(quote.estimatedStartDate) : 'TBD'}
                  </Text>
                </View>
              </View>
              <View style={styles.timelineItem}>
                <Ionicons name="flag-outline" size={20} color={colors.success[500]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Completion</Text>
                  <Text style={styles.timelineValue}>
                    {quote.estimatedCompletionDate ? formatDate(quote.estimatedCompletionDate) : 'TBD'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.durationRow}>
              <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.durationText}>
                Estimated duration: {quote.timeline?.estimatedDuration ?? 0} days
              </Text>
            </View>
          </View>
        </View>

        {/* Cost Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>
          <View style={styles.breakdownCard}>
            {(quote.pricing?.items ?? []).map((item, index) => (
              <View key={item.id || index} style={styles.breakdownItem}>
                <View style={styles.breakdownItemHeader}>
                  <Text style={styles.breakdownCategory}>
                    {CATEGORY_LABELS[item.category] || item.category}
                  </Text>
                  <Text style={styles.breakdownTotal}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
                <Text style={styles.breakdownDescription}>{item.description}</Text>
                <Text style={styles.breakdownQty}>
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </Text>
                {item.notes && (
                  <Text style={styles.breakdownNotes}>{item.notes}</Text>
                )}
              </View>
            ))}

            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatCurrency(quote.pricing?.subtotal ?? 0)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>VAT (5%)</Text>
                <Text style={styles.totalValue}>{formatCurrency(quote.pricing?.vat ?? 0)}</Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(quote.pricing?.total ?? 0)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Approach */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approach</Text>
          <View style={styles.textCard}>
            <Text style={styles.approachText}>{quote.approach}</Text>
          </View>
        </View>

        {/* Warranty */}
        {quote.warranty && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Warranty</Text>
            <View style={styles.textCard}>
              <View style={styles.warrantyHeader}>
                <Ionicons name="shield-checkmark" size={20} color={colors.success[500]} />
                <Text style={styles.warrantyTitle}>Warranty Included</Text>
              </View>
              <Text style={styles.warrantyText}>{quote.warranty}</Text>
            </View>
          </View>
        )}

        {/* Questions */}
        {quote.questions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Questions from Professional</Text>
            <View style={styles.textCard}>
              <Text style={styles.questionsText}>{quote.questions}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      {quote.status === 'pending' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, styles.declineButton]}
            onPress={handleDecline}
            disabled={actionLoading}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.acceptButton]}
            onPress={handleAccept}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.acceptButtonText}>Accept Quote</Text>
            )}
          </TouchableOpacity>
        </View>
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
  headerTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
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
    paddingBottom: spacing[8],
  },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[4],
  },
  proInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  proName: {
    ...textStyles.h4,
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
  },
  verifiedText: {
    ...textStyles.caption,
    color: colors.success[600],
    fontWeight: '500',
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
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  timelineCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    flex: 1,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  timelineValue: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  durationText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  breakdownCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  breakdownItem: {
    paddingBottom: spacing[3],
    marginBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  breakdownItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  breakdownCategory: {
    ...textStyles.caption,
    color: colors.primary[600],
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  breakdownTotal: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  breakdownDescription: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  breakdownQty: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  breakdownNotes: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing[1],
  },
  totalsContainer: {
    paddingTop: spacing[3],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  totalLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  totalValue: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  grandTotalRow: {
    marginTop: spacing[2],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  grandTotalLabel: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  grandTotalValue: {
    ...textStyles.h3,
    color: colors.primary[600],
  },
  textCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  approachText: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  warrantyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  warrantyTitle: {
    ...textStyles.label,
    color: colors.success[700],
  },
  warrantyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  questionsText: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  footerButton: {
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
});

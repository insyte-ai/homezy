/**
 * Quote Details Screen (Pro View)
 * Shows details of a submitted quote
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getQuoteById, updateQuote } from '../../../src/services/quotes';
import { Quote, QuoteItem } from '../../../src/services/leads';

// Status configuration
const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string; icon: string }> = {
  pending: {
    color: colors.warning[700],
    bgColor: colors.warning[50],
    label: 'Pending Review',
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

// Item category labels
const CATEGORY_LABELS: Record<string, string> = {
  labor: 'Labor',
  materials: 'Materials',
  permits: 'Permits',
  equipment: 'Equipment',
  other: 'Other',
};

export default function QuoteDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (showLoading = true) => {
    if (!id) return;

    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const quoteData = await getQuoteById(id);
      setQuote(quoteData);
    } catch (err) {
      console.error('Error loading quote:', err);
      setError('Failed to load quote details. Please try again.');
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

  const handleViewLead = () => {
    if (quote) {
      router.push(`/(pro)/lead/${quote.leadId}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
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
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;

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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.bgColor }]}>
          <Ionicons name={statusConfig.icon as any} size={24} color={statusConfig.color} />
          <View style={styles.statusContent}>
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
            <Text style={styles.statusDate}>
              Submitted {formatDate(quote.createdAt)}
            </Text>
          </View>
        </View>

        {/* Response Info (if accepted/declined) */}
        {quote.status === 'accepted' && quote.acceptedAt && (
          <View style={styles.responseCard}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success[600]} />
            <View style={styles.responseContent}>
              <Text style={styles.responseTitle}>Quote Accepted!</Text>
              <Text style={styles.responseText}>
                The homeowner accepted your quote on {formatDate(quote.acceptedAt)}.
                You can now start the project.
              </Text>
            </View>
          </View>
        )}

        {quote.status === 'declined' && (
          <View style={styles.responseCardDeclined}>
            <Ionicons name="close-circle" size={24} color={colors.error[600]} />
            <View style={styles.responseContent}>
              <Text style={styles.responseTitle}>Quote Declined</Text>
              <Text style={styles.responseText}>
                {quote.declineReason || 'The homeowner declined this quote.'}
              </Text>
            </View>
          </View>
        )}

        {/* Total Amount */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Quote</Text>
          <Text style={styles.totalAmount}>{formatCurrency(quote.pricing?.total ?? 0)}</Text>
          <View style={styles.vatInfo}>
            <Text style={styles.vatText}>
              Including VAT ({formatCurrency(quote.pricing?.vat ?? 0)})
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Timeline</Text>
          <View style={styles.timelineCard}>
            <View style={styles.durationBadge}>
              <Ionicons name="time" size={16} color={colors.primary[600]} />
              <Text style={styles.durationText}>
                Estimated: {quote.timeline?.estimatedDuration ?? 0} day{(quote.timeline?.estimatedDuration ?? 0) !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Quote Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Breakdown</Text>
          <View style={styles.itemsCard}>
            {(quote.pricing?.items ?? []).map((item, index) => (
              <View
                key={item.id || index}
                style={[
                  styles.itemRow,
                  index < (quote.pricing?.items?.length ?? 0) - 1 && styles.itemRowBorder,
                ]}
              >
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemCategory}>
                      {CATEGORY_LABELS[item.category] || item.category}
                    </Text>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                  </View>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  {item.notes && (
                    <Text style={styles.itemNotes}>{item.notes}</Text>
                  )}
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemUnitPrice}>
                    @ {formatCurrency(item.unitPrice)}
                  </Text>
                  <Text style={styles.itemTotal}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Subtotals */}
            <View style={styles.subtotalSection}>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValue}>{formatCurrency(quote.pricing?.subtotal ?? 0)}</Text>
              </View>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>VAT (5%)</Text>
                <Text style={styles.subtotalValue}>{formatCurrency(quote.pricing?.vat ?? 0)}</Text>
              </View>
              <View style={[styles.subtotalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(quote.pricing?.total ?? 0)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Approach */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Approach</Text>
          <View style={styles.textCard}>
            <Text style={styles.textContent}>{quote.approach}</Text>
          </View>
        </View>

        {/* Warranty */}
        {quote.warranty && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Warranty</Text>
            <View style={styles.warrantyCard}>
              <Ionicons name="shield-checkmark" size={20} color={colors.success[600]} />
              <Text style={styles.warrantyText}>{quote.warranty}</Text>
            </View>
          </View>
        )}

        {/* Questions */}
        {quote.questions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Questions for Homeowner</Text>
            <View style={styles.textCard}>
              <Text style={styles.textContent}>{quote.questions}</Text>
            </View>
          </View>
        )}

        {/* View Lead Button */}
        <TouchableOpacity style={styles.viewLeadButton} onPress={handleViewLead}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary[600]} />
          <Text style={styles.viewLeadText}>View Original Lead</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary[600]} />
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={{ height: spacing[8] }} />
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    ...textStyles.label,
    marginBottom: spacing[1],
  },
  statusDate: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  responseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: colors.success[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  responseCardDeclined: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: colors.error[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  responseContent: {
    flex: 1,
  },
  responseTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  responseText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  totalCard: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  totalLabel: {
    ...textStyles.bodySmall,
    color: colors.primary[200],
    marginBottom: spacing[2],
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  vatInfo: {
    marginTop: spacing[2],
  },
  vatText: {
    ...textStyles.caption,
    color: colors.primary[200],
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
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  timelineArrow: {
    paddingHorizontal: spacing[3],
  },
  timelineLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  timelineValue: {
    ...textStyles.bodySmall,
    color: colors.text.primary,
    fontWeight: '500',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginTop: spacing[4],
  },
  durationText: {
    ...textStyles.bodySmall,
    color: colors.primary[700],
    fontWeight: '600',
  },
  itemsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    padding: spacing[4],
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing[3],
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  itemCategory: {
    ...textStyles.caption,
    color: colors.primary[600],
    fontWeight: '600',
  },
  itemQty: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  itemDescription: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  itemNotes: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
    fontStyle: 'italic',
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemUnitPrice: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  itemTotal: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  subtotalSection: {
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  subtotalLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  subtotalValue: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[3],
    marginTop: spacing[2],
    marginBottom: 0,
  },
  grandTotalLabel: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  grandTotalValue: {
    ...textStyles.h4,
    color: colors.primary[600],
  },
  textCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  textContent: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  warrantyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: colors.success[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  warrantyText: {
    ...textStyles.body,
    color: colors.success[700],
    flex: 1,
  },
  viewLeadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  viewLeadText: {
    ...textStyles.button,
    color: colors.primary[600],
    flex: 1,
    textAlign: 'center',
  },
});

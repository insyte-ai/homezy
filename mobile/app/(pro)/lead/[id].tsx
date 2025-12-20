/**
 * Pro Lead Details Screen
 * Shows full lead details with claim functionality
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getLeadById, claimLead, Lead } from '../../../src/services/leads';
import { getBalance, CreditBalance } from '../../../src/services/credits';
import { EMIRATES, BUDGET_BRACKETS, URGENCY_LEVELS } from '../../../src/constants/leadForm';

// Urgency badge colors
const URGENCY_CONFIG: Record<string, { color: string; bgColor: string; icon: string }> = {
  emergency: { color: colors.error[700], bgColor: colors.error[50], icon: 'flash' },
  urgent: { color: colors.warning[700], bgColor: colors.warning[50], icon: 'time' },
  flexible: { color: colors.primary[700], bgColor: colors.primary[50], icon: 'calendar' },
  planning: { color: colors.neutral[600], bgColor: colors.neutral[100], icon: 'hourglass' },
};

// Status badge colors
const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  open: { color: colors.success[700], bgColor: colors.success[50], label: 'Open' },
  full: { color: colors.warning[700], bgColor: colors.warning[50], label: 'Full' },
  accepted: { color: colors.primary[700], bgColor: colors.primary[50], label: 'Accepted' },
  expired: { color: colors.neutral[600], bgColor: colors.neutral[100], label: 'Expired' },
  cancelled: { color: colors.error[700], bgColor: colors.error[50], label: 'Cancelled' },
};

// Claim confirmation modal
function ClaimConfirmModal({
  visible,
  onClose,
  onConfirm,
  lead,
  credits,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lead: Lead;
  credits: number;
  isLoading: boolean;
}) {
  const canAfford = credits >= lead.creditsRequired;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIcon}>
            <Ionicons
              name={canAfford ? 'ticket' : 'alert-circle'}
              size={48}
              color={canAfford ? colors.primary[500] : colors.error[500]}
            />
          </View>

          <Text style={styles.modalTitle}>
            {canAfford ? 'Claim This Lead?' : 'Insufficient Credits'}
          </Text>

          {canAfford ? (
            <>
              <Text style={styles.modalDescription}>
                Claiming this lead will deduct credits from your balance and give you
                access to the homeowner's contact information.
              </Text>

              <View style={styles.creditBreakdown}>
                <View style={styles.creditRow}>
                  <Text style={styles.creditLabel}>Current Balance</Text>
                  <Text style={styles.creditValue}>{credits} credits</Text>
                </View>
                <View style={styles.creditRow}>
                  <Text style={styles.creditLabel}>Lead Cost</Text>
                  <Text style={[styles.creditValue, { color: colors.error[600] }]}>
                    -{lead.creditsRequired} credits
                  </Text>
                </View>
                <View style={[styles.creditRow, styles.creditRowTotal]}>
                  <Text style={styles.creditLabelTotal}>After Claim</Text>
                  <Text style={styles.creditValueTotal}>
                    {credits - lead.creditsRequired} credits
                  </Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onClose}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={onConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.confirmButtonText}>Claim Lead</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.modalDescription}>
                You need {lead.creditsRequired} credits to claim this lead, but you only
                have {credits} credits available.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.buyCreditsButton]}
                  onPress={() => {
                    onClose();
                    router.push('/(pro)/credits');
                  }}
                >
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.confirmButtonText}>Buy Credits</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function ProLeadDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [lead, setLead] = useState<Lead | null>(null);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isClaimLoading, setIsClaimLoading] = useState(false);

  const loadData = async (showLoading = true) => {
    if (!id) return;

    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const [leadData, balanceData] = await Promise.all([
        getLeadById(id),
        getBalance().catch(() => null),
      ]);

      setLead(leadData);
      if (balanceData) {
        setCreditBalance(balanceData.balance);
      }
    } catch (err) {
      console.error('Error loading lead:', err);
      setError('Failed to load lead details. Please try again.');
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

  const handleClaimLead = async () => {
    if (!lead) return;

    try {
      setIsClaimLoading(true);
      const result = await claimLead(lead.id);

      setShowClaimModal(false);

      // Update local state
      setLead(result.lead);
      if (creditBalance) {
        setCreditBalance({
          ...creditBalance,
          totalBalance: result.remainingCredits,
        });
      }

      Alert.alert(
        'Lead Claimed!',
        'You now have access to the homeowner\'s contact information. Would you like to submit a quote?',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Submit Quote',
            onPress: () => router.push(`/(pro)/quote/create?leadId=${lead.id}`),
          },
        ]
      );
    } catch (err: any) {
      setShowClaimModal(false);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to claim lead. Please try again.'
      );
    } finally {
      setIsClaimLoading(false);
    }
  };

  const handleSubmitQuote = () => {
    if (!lead) return;
    router.push(`/(pro)/quote/create?leadId=${lead.id}`);
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lead Details</Text>
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
          <Text style={styles.headerTitle}>Lead Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error || 'Lead not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.open;
  const urgencyConfig = URGENCY_CONFIG[lead.urgency] || URGENCY_CONFIG.flexible;
  const emirate = EMIRATES.find((e) => e.id === lead.location.emirate);
  const budget = BUDGET_BRACKETS.find((b) => b.id === lead.budgetBracket);
  const urgency = URGENCY_LEVELS.find((u) => u.id === lead.urgency);

  const hasClaimed = lead.hasClaimed || !!lead.claim;
  const canClaim =
    !hasClaimed &&
    lead.status === 'open' &&
    (lead.claimCount ?? 0) < (lead.maxClaims ?? 5);

  const credits = creditBalance?.totalBalance || 0;

  // Get homeowner info if claimed
  const homeowner =
    typeof lead.homeownerId === 'object' ? lead.homeownerId : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lead Details</Text>
        <View style={styles.headerCredits}>
          <Ionicons name="ticket" size={16} color={colors.primary[600]} />
          <Text style={styles.headerCreditsText}>{credits}</Text>
        </View>
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
        {/* Status & Urgency Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={[styles.badgeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: urgencyConfig.bgColor }]}>
            <Ionicons
              name={urgencyConfig.icon as any}
              size={14}
              color={urgencyConfig.color}
            />
            <Text style={[styles.badgeText, { color: urgencyConfig.color }]}>
              {urgency?.label || lead.urgency}
            </Text>
          </View>
          <View style={styles.timestampBadge}>
            <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.timestampText}>{formatTimeAgo(lead.createdAt)}</Text>
          </View>
        </View>

        {/* Lead Info Card */}
        <View style={styles.leadCard}>
          <Text style={styles.leadCategory}>{lead.category}</Text>
          <Text style={styles.leadTitle}>{lead.title}</Text>
          <Text style={styles.leadDescription}>{lead.description}</Text>

          <View style={styles.divider} />

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={20} color={colors.text.tertiary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {emirate?.name || lead.location.emirate}
                  {lead.location.neighborhood ? `\n${lead.location.neighborhood}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={20} color={colors.text.tertiary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Budget</Text>
                <Text style={styles.detailValue}>
                  {budget?.label || lead.budgetBracket}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color={colors.text.tertiary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Urgency</Text>
                <Text style={styles.detailValue}>
                  {urgency?.label || lead.urgency}
                  {urgency?.description ? `\n${urgency.description}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={20} color={colors.text.tertiary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Claims</Text>
                <Text style={styles.detailValue}>
                  {lead.claimCount ?? 0} / {lead.maxClaims ?? 5} professionals
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Photos Section */}
        {lead.attachments && lead.attachments.filter(a => a.type === 'image').length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>
              Photos ({lead.attachments.filter(a => a.type === 'image').length})
            </Text>
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

        {/* Homeowner Info (if claimed) */}
        {hasClaimed && homeowner && (
          <View style={styles.homeownerCard}>
            <Text style={styles.sectionTitle}>Homeowner Contact</Text>
            <View style={styles.contactRow}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactInitials}>
                  {homeowner.name?.charAt(0) || 'H'}
                </Text>
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{homeowner.name}</Text>
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={16} color={colors.text.tertiary} />
                  <Text style={styles.contactText}>{homeowner.email}</Text>
                </View>
                {homeowner.phone && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call-outline" size={16} color={colors.text.tertiary} />
                    <Text style={styles.contactText}>{homeowner.phone}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Credit Cost Info (if not claimed) */}
        {!hasClaimed && canClaim && (
          <View style={styles.creditCostCard}>
            <View style={styles.creditCostHeader}>
              <Ionicons name="ticket" size={24} color={colors.primary[600]} />
              <View style={styles.creditCostInfo}>
                <Text style={styles.creditCostLabel}>Credits Required</Text>
                <Text style={styles.creditCostValue}>
                  {lead.creditsRequired} credits
                </Text>
              </View>
            </View>
            <Text style={styles.creditCostDescription}>
              Claiming this lead gives you access to the homeowner's contact
              information and allows you to submit a quote.
            </Text>
          </View>
        )}

        {/* Claim Info (if already claimed) */}
        {hasClaimed && lead.claim && (
          <View style={styles.claimInfoCard}>
            <View style={styles.claimInfoHeader}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success[600]} />
              <Text style={styles.claimInfoTitle}>You've Claimed This Lead</Text>
            </View>
            <Text style={styles.claimInfoText}>
              Claimed on {formatDate(lead.claim.claimedAt)}
              {' • '}{lead.claim.creditsSpent} credits spent
            </Text>
            {!lead.claim.quoteSubmitted && (
              <Text style={styles.claimInfoReminder}>
                Don't forget to submit your quote to the homeowner!
              </Text>
            )}
          </View>
        )}

        {/* Spacer for bottom action */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        {canClaim ? (
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => setShowClaimModal(true)}
          >
            <Ionicons name="ticket" size={20} color="#fff" />
            <Text style={styles.claimButtonText}>
              Claim Lead ({lead.creditsRequired} credits)
            </Text>
          </TouchableOpacity>
        ) : hasClaimed && !lead.claim?.quoteSubmitted ? (
          <TouchableOpacity style={styles.quoteButton} onPress={handleSubmitQuote}>
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.quoteButtonText}>Submit Quote</Text>
          </TouchableOpacity>
        ) : hasClaimed && lead.claim?.quoteSubmitted ? (
          <View style={styles.quoteSentContainer}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success[600]} />
            <Text style={styles.quoteSentText}>Quote Submitted</Text>
          </View>
        ) : lead.status === 'full' ? (
          <View style={styles.leadFullContainer}>
            <Ionicons name="lock-closed" size={20} color={colors.text.tertiary} />
            <Text style={styles.leadFullText}>Lead is full</Text>
          </View>
        ) : null}
      </View>

      {/* Claim Confirmation Modal */}
      <ClaimConfirmModal
        visible={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onConfirm={handleClaimLead}
        lead={lead}
        credits={credits}
        isLoading={isClaimLoading}
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
  headerCredits: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  headerCreditsText: {
    ...textStyles.label,
    color: colors.primary[700],
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
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  timestampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginLeft: 'auto',
  },
  timestampText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  leadCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  leadCategory: {
    ...textStyles.caption,
    color: colors.primary[600],
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  leadTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  leadDescription: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[4],
  },
  detailsGrid: {
    gap: spacing[4],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  detailValue: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  photosSection: {
    marginBottom: spacing[4],
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
    width: 120,
    height: 90,
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  homeownerCard: {
    backgroundColor: colors.success[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitials: {
    ...textStyles.h4,
    color: '#fff',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  contactText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  creditCostCard: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  creditCostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  creditCostInfo: {
    flex: 1,
  },
  creditCostLabel: {
    ...textStyles.caption,
    color: colors.primary[700],
    marginBottom: spacing[1],
  },
  creditCostValue: {
    ...textStyles.h3,
    color: colors.primary[700],
  },
  creditCostDescription: {
    ...textStyles.bodySmall,
    color: colors.primary[600],
    lineHeight: 20,
  },
  claimInfoCard: {
    backgroundColor: colors.success[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  claimInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  claimInfoTitle: {
    ...textStyles.label,
    color: colors.success[700],
  },
  claimInfoText: {
    ...textStyles.bodySmall,
    color: colors.success[600],
  },
  claimInfoReminder: {
    ...textStyles.bodySmall,
    color: colors.warning[700],
    fontWeight: '600',
    marginTop: spacing[2],
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    padding: layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingBottom: spacing[6],
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
  },
  claimButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
  quoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.success[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
  },
  quoteButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
  quoteSentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    backgroundColor: colors.success[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  quoteSentText: {
    ...textStyles.button,
    color: colors.success[700],
  },
  leadFullContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
  },
  leadFullText: {
    ...textStyles.button,
    color: colors.text.tertiary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPadding,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    width: '100%',
    maxWidth: 400,
  },
  modalIcon: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  modalDescription: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[4],
  },
  creditBreakdown: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  creditRowTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[2],
    marginTop: spacing[2],
    marginBottom: 0,
  },
  creditLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  creditValue: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  creditLabelTotal: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  creditValueTotal: {
    ...textStyles.label,
    color: colors.primary[600],
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
  },
  cancelButton: {
    backgroundColor: colors.neutral[100],
  },
  cancelButtonText: {
    ...textStyles.button,
    color: colors.text.secondary,
  },
  confirmButton: {
    backgroundColor: colors.primary[500],
  },
  buyCreditsButton: {
    backgroundColor: colors.success[500],
  },
  confirmButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
});

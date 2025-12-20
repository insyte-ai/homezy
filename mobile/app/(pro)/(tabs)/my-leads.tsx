/**
 * My Leads Screen
 * Shows Direct Requests and Claimed Leads
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
import { getMyClaims, getMyDirectLeads, Lead } from '../../../src/services/leads';
import { EMIRATES, BUDGET_BRACKETS, URGENCY_LEVELS } from '../../../src/constants/leadForm';

type TabType = 'direct' | 'claimed';

// Urgency badge colors
const URGENCY_CONFIG: Record<string, { color: string; bgColor: string }> = {
  emergency: { color: colors.error[700], bgColor: colors.error[50] },
  urgent: { color: colors.warning[700], bgColor: colors.warning[50] },
  flexible: { color: colors.primary[700], bgColor: colors.primary[50] },
  planning: { color: colors.neutral[600], bgColor: colors.neutral[100] },
};

// Lead card component
function LeadCard({
  lead,
  onPress,
  type,
}: {
  lead: Lead;
  onPress: () => void;
  type: TabType;
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

  const getStatusBadge = () => {
    if (type === 'direct') {
      const status = lead.directLeadStatus || 'pending';
      const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
        pending: { color: colors.warning[700], bgColor: colors.warning[50], label: 'Pending' },
        accepted: { color: colors.success[700], bgColor: colors.success[50], label: 'Accepted' },
        declined: { color: colors.error[700], bgColor: colors.error[50], label: 'Declined' },
        converted: { color: colors.primary[700], bgColor: colors.primary[50], label: 'Converted' },
      };
      const config = statusConfig[status] || statusConfig.pending;
      return (
        <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={styles.leadCard}
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
        <View style={styles.badgeContainer}>
          {getStatusBadge()}
          <View style={[styles.urgencyBadge, { backgroundColor: urgencyConfig.bgColor }]}>
            <Text style={[styles.urgencyText, { color: urgencyConfig.color }]}>
              {urgency?.label || lead.urgency}
            </Text>
          </View>
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
        <Text style={styles.timeText}>{formatDate(lead.createdAt)}</Text>
        {type === 'direct' && lead.directLeadExpiresAt && (
          <View style={styles.expiryContainer}>
            <Ionicons name="time-outline" size={14} color={colors.warning[600]} />
            <Text style={styles.expiryText}>
              Expires {formatDate(lead.directLeadExpiresAt)}
            </Text>
          </View>
        )}
      </View>

      {/* Direct lead indicator */}
      {type === 'direct' && (
        <View style={styles.directBadge}>
          <Ionicons name="star" size={12} color={colors.professional.primary} />
          <Text style={styles.directText}>Direct Request</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function MyLeadsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('direct');
  const [directLeads, setDirectLeads] = useState<Lead[]>([]);
  const [claimedLeads, setClaimedLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const [directData, claimedData] = await Promise.all([
        getMyDirectLeads(),
        getMyClaims({ limit: 50 }),
      ]);

      setDirectLeads(directData.leads || []);
      setClaimedLeads(claimedData.leads || []);
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData(false);
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(false);
  };

  const handleLeadPress = (lead: Lead) => {
    router.push(`/(pro)/lead/${lead.id}`);
  };

  const currentLeads = activeTab === 'direct' ? directLeads : claimedLeads;
  const directCount = directLeads.filter(l => l.directLeadStatus === 'pending').length;
  const claimedCount = claimedLeads.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Leads</Text>
        <Text style={styles.subtitle}>
          {directCount} direct request{directCount !== 1 ? 's' : ''} pending
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'direct' && styles.tabActive]}
          onPress={() => setActiveTab('direct')}
        >
          <Text style={[styles.tabText, activeTab === 'direct' && styles.tabTextActive]}>
            Direct Requests
          </Text>
          {directCount > 0 && (
            <View style={[styles.tabBadge, activeTab === 'direct' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'direct' && styles.tabBadgeTextActive]}>
                {directCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'claimed' && styles.tabActive]}
          onPress={() => setActiveTab('claimed')}
        >
          <Text style={[styles.tabText, activeTab === 'claimed' && styles.tabTextActive]}>
            Claimed
          </Text>
          {claimedCount > 0 && (
            <View style={[styles.tabBadge, activeTab === 'claimed' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'claimed' && styles.tabBadgeTextActive]}>
                {claimedCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading && currentLeads.length === 0 ? (
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
      ) : currentLeads.length === 0 ? (
        <EmptyState
          icon={activeTab === 'direct' ? 'star-outline' : 'briefcase-outline'}
          title={activeTab === 'direct' ? 'No Direct Requests' : 'No Claimed Leads'}
          description={
            activeTab === 'direct'
              ? 'When homeowners send you direct requests, they will appear here.'
              : 'Leads you claim from the marketplace will appear here.'
          }
        />
      ) : (
        <FlatList
          data={currentLeads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LeadCard
              lead={item}
              onPress={() => handleLeadPress(item)}
              type={activeTab}
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    gap: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
  },
  tabActive: {
    backgroundColor: colors.professional.primary,
  },
  tabText: {
    ...textStyles.label,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: colors.neutral[300],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    ...textStyles.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  tabBadgeTextActive: {
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
  leadCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
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
  badgeContainer: {
    alignItems: 'flex-end',
    gap: spacing[1],
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
  timeText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  expiryText: {
    ...textStyles.caption,
    color: colors.warning[600],
  },
  directBadge: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.professional.primary + '15',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  directText: {
    ...textStyles.caption,
    color: colors.professional.primary,
    fontSize: 10,
    fontWeight: '600',
  },
});

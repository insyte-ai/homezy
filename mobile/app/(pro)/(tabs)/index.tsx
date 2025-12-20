/**
 * Professional Dashboard screen
 * Shows analytics, credits, and quick actions
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Avatar } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useAuthStore } from '../../../src/store/authStore';
import { useMessagingStore } from '../../../src/store/messagingStore';
import { getAnalytics, ProAnalytics } from '../../../src/services/pro';
import { getBalance, CreditBalance } from '../../../src/services/credits';

// Stat card component
function StatCard({
  icon,
  iconColor,
  value,
  label,
  onPress,
}: {
  icon: string;
  iconColor: string;
  value: number | string;
  label: string;
  onPress?: () => void;
}) {
  const content = (
    <Card style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.statCardWrapper} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.statCardWrapper}>{content}</View>;
}

// Quick action button
function QuickAction({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon as any} size={24} color={colors.professional.primary} />
        {badge != null && badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ProDashboard() {
  const { user, logout } = useAuthStore();
  const { totalUnread, refreshUnreadCount } = useMessagingStore();

  const [analytics, setAnalytics] = useState<ProAnalytics | null>(null);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const [analyticsData, balanceData] = await Promise.all([
        getAnalytics().catch(() => null),
        getBalance().catch(() => null),
      ]);

      if (analyticsData) setAnalytics(analyticsData);
      if (balanceData) setCreditBalance(balanceData.balance);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    refreshUnreadCount();
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

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleBuyCredits = () => {
    router.push('/(pro)/credits');
  };

  const handleBrowseLeads = () => {
    router.push('/(pro)/(tabs)/marketplace');
  };

  const handleViewQuotes = () => {
    router.push('/(pro)/(tabs)/quotes');
  };

  const handleViewMessages = () => {
    router.push('/(pro)/(tabs)/messages');
  };

  const handleViewProfile = () => {
    router.push('/(pro)/(tabs)/profile');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.professional.primary]}
            tintColor={colors.professional.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>
              {user?.proProfile?.businessName || user?.firstName || 'Professional'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {/* Messages Icon */}
            <TouchableOpacity onPress={handleViewMessages} style={styles.messagesButton}>
              <Ionicons name="chatbubbles-outline" size={24} color={colors.text.primary} />
              {totalUnread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleViewProfile}>
              <Avatar
                source={user?.profilePhoto}
                name={`${user?.firstName} ${user?.lastName}`}
                size="lg"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Credits Banner */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleBuyCredits}>
          <Card style={styles.creditsBanner}>
            <View style={styles.creditsContent}>
              <View>
                <Text style={styles.creditsLabel}>Available Credits</Text>
                <Text style={styles.creditsValue}>
                  {isLoading ? '...' : creditBalance?.totalBalance ?? 0}
                </Text>
              </View>
              <TouchableOpacity style={styles.buyButton} onPress={handleBuyCredits}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.buyButtonText}>Buy Credits</Text>
              </TouchableOpacity>
            </View>
            {creditBalance && creditBalance.totalBalance < 10 && (
              <View style={styles.lowCreditsWarning}>
                <Ionicons name="warning" size={14} color={colors.warning[500]} />
                <Text style={styles.lowCreditsText}>Low credits - Buy more to claim leads</Text>
              </View>
            )}
          </Card>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickAction
            icon="briefcase-outline"
            label="Browse Leads"
            onPress={handleBrowseLeads}
            badge={analytics?.overview.claimedLeads.last7Days}
          />
          <QuickAction
            icon="document-text-outline"
            label="My Quotes"
            onPress={handleViewQuotes}
            badge={analytics?.quotes.pending}
          />
          <QuickAction
            icon="mail-outline"
            label="Messages"
            onPress={handleViewMessages}
          />
          <QuickAction
            icon="person-outline"
            label="Profile"
            onPress={handleViewProfile}
          />
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Performance</Text>
        {isLoading ? (
          <View style={styles.loadingStats}>
            <ActivityIndicator size="small" color={colors.professional.primary} />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <StatCard
              icon="flash-outline"
              iconColor={colors.primary[500]}
              value={analytics?.overview.claimedLeads.last7Days ?? 0}
              label="Leads This Week"
              onPress={handleBrowseLeads}
            />
            <StatCard
              icon="checkmark-circle-outline"
              iconColor={colors.success[500]}
              value={analytics?.overview.claimedLeads.total ?? 0}
              label="Total Leads Claimed"
            />
            <StatCard
              icon="document-outline"
              iconColor={colors.warning[500]}
              value={analytics?.quotes.pending ?? 0}
              label="Pending Quotes"
              onPress={handleViewQuotes}
            />
            <StatCard
              icon="trophy-outline"
              iconColor={colors.professional.primary}
              value={analytics?.quotes.accepted ?? 0}
              label="Quotes Accepted"
            />
          </View>
        )}

        {/* Conversion Rate */}
        {analytics && analytics.quotes.acceptanceRate > 0 && (
          <Card style={styles.conversionCard}>
            <View style={styles.conversionHeader}>
              <Ionicons name="trending-up" size={20} color={colors.success[500]} />
              <Text style={styles.conversionTitle}>Conversion Rate</Text>
            </View>
            <Text style={styles.conversionValue}>
              {analytics.quotes.acceptanceRate.toFixed(0)}%
            </Text>
            <Text style={styles.conversionSubtitle}>
              {analytics.quotes.accepted} of {analytics.quotes.total} quotes accepted
            </Text>
          </Card>
        )}

        {/* Verification Status */}
        <Text style={styles.sectionTitle}>Verification Status</Text>
        <Card style={styles.verificationCard}>
          <View style={styles.verificationContent}>
            <Ionicons
              name={
                user?.proProfile?.verificationStatus === 'approved'
                  ? 'shield-checkmark'
                  : user?.proProfile?.verificationStatus === 'pending'
                  ? 'shield-half'
                  : 'shield-outline'
              }
              size={32}
              color={
                user?.proProfile?.verificationStatus === 'approved'
                  ? colors.success[500]
                  : user?.proProfile?.verificationStatus === 'pending'
                  ? colors.warning[500]
                  : colors.neutral[400]
              }
            />
            <View style={styles.verificationText}>
              <Text style={styles.verificationTitle}>
                {user?.proProfile?.verificationStatus === 'approved'
                  ? 'Verified'
                  : user?.proProfile?.verificationStatus === 'pending'
                  ? 'Verification Pending'
                  : user?.proProfile?.verificationStatus === 'rejected'
                  ? 'Verification Rejected'
                  : 'Not Verified'}
              </Text>
              <Text style={styles.verificationSubtitle}>
                {user?.proProfile?.verificationStatus === 'approved'
                  ? 'You get 15% discount on lead claims'
                  : user?.proProfile?.verificationStatus === 'pending'
                  ? 'Your documents are under review'
                  : user?.proProfile?.verificationStatus === 'rejected'
                  ? 'Please resubmit your documents'
                  : 'Complete verification to build trust'}
              </Text>
            </View>
          </View>
          {user?.proProfile?.verificationStatus !== 'approved' && (
            <TouchableOpacity style={styles.verifyButton} onPress={handleViewProfile}>
              <Text style={styles.verifyButtonText}>
                {user?.proProfile?.verificationStatus === 'rejected'
                  ? 'Resubmit Documents'
                  : user?.proProfile?.verificationStatus === 'pending'
                  ? 'View Status'
                  : 'Start Verification'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.professional.primary} />
            </TouchableOpacity>
          )}
        </Card>

        {/* Direct Leads Alert */}
        {analytics && (analytics.recentActivity.directLeadsPending ?? 0) > 0 && (
          <Card style={styles.directLeadsCard}>
            <View style={styles.directLeadsContent}>
              <View style={styles.directLeadsIcon}>
                <Ionicons name="flash" size={24} color={colors.warning[500]} />
              </View>
              <View style={styles.directLeadsText}>
                <Text style={styles.directLeadsTitle}>
                  {analytics.recentActivity.directLeadsPending} Direct Lead
                  {(analytics.recentActivity.directLeadsPending ?? 0) > 1 ? 's' : ''}
                </Text>
                <Text style={styles.directLeadsSubtitle}>
                  Homeowners sent you leads directly. Respond within 24h!
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.directLeadsButton}
              onPress={() => router.push('/(pro)/(tabs)/my-leads')}
            >
              <Text style={styles.directLeadsButtonText}>View Now</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Rating */}
        {analytics && analytics.performance.reviewCount > 0 && (
          <>
            <Text style={styles.sectionTitle}>Your Rating</Text>
            <Card style={styles.ratingCard}>
              <View style={styles.ratingContent}>
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={
                        star <= Math.floor(analytics.performance.rating)
                          ? 'star'
                          : star - 0.5 <= analytics.performance.rating
                          ? 'star-half'
                          : 'star-outline'
                      }
                      size={24}
                      color={colors.warning[500]}
                    />
                  ))}
                </View>
                <Text style={styles.ratingValue}>
                  {analytics.performance.rating.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.ratingCount}>
                Based on {analytics.performance.reviewCount} review
                {analytics.performance.reviewCount !== 1 ? 's' : ''}
              </Text>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    padding: layout.screenPadding,
    paddingBottom: spacing[8],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  messagesButton: {
    position: 'relative',
    padding: spacing[2],
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    ...textStyles.caption,
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  greeting: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  name: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  creditsBanner: {
    backgroundColor: colors.professional.primary,
    marginBottom: spacing[4],
  },
  creditsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditsLabel: {
    ...textStyles.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  creditsValue: {
    ...textStyles.h1,
    color: colors.text.inverse,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  buyButtonText: {
    ...textStyles.label,
    color: colors.text.inverse,
  },
  lowCreditsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  lowCreditsText: {
    ...textStyles.caption,
    color: colors.warning[300],
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.professional.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error[500],
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...textStyles.caption,
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  quickActionLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  loadingStats: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCardWrapper: {
    width: '48%',
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  statNumber: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  conversionCard: {
    marginBottom: spacing[6],
  },
  conversionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  conversionTitle: {
    ...textStyles.label,
    color: colors.text.secondary,
  },
  conversionValue: {
    ...textStyles.h1,
    color: colors.success[600],
  },
  conversionSubtitle: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  verificationCard: {
    marginBottom: spacing[6],
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  verificationSubtitle: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing[1],
  },
  verifyButtonText: {
    ...textStyles.label,
    color: colors.professional.primary,
  },
  directLeadsCard: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
    marginBottom: spacing[6],
  },
  directLeadsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  directLeadsIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  directLeadsText: {
    flex: 1,
  },
  directLeadsTitle: {
    ...textStyles.label,
    color: colors.warning[800],
  },
  directLeadsSubtitle: {
    ...textStyles.caption,
    color: colors.warning[600],
    marginTop: 2,
  },
  directLeadsButton: {
    marginTop: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.warning[500],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  directLeadsButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
  ratingCard: {
    marginBottom: spacing[4],
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  ratingCount: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
});

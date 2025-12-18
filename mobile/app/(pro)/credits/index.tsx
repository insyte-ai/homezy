/**
 * Credits Screen
 * View balance, purchase packages, and view transaction history
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import {
  getBalance,
  getPackages,
  getTransactions,
  createCheckout,
  CreditBalance,
  CreditPackage,
  CreditTransaction,
  ExpiringCredits,
} from '../../../src/services/credits';

// Transaction type configuration
const TRANSACTION_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  purchase: { icon: 'add-circle', color: colors.success[600], label: 'Purchase' },
  lead_claim: { icon: 'remove-circle', color: colors.error[600], label: 'Lead Claim' },
  refund: { icon: 'refresh-circle', color: colors.primary[600], label: 'Refund' },
  admin_addition: { icon: 'gift', color: colors.success[600], label: 'Bonus' },
  admin_deduction: { icon: 'remove-circle', color: colors.error[600], label: 'Adjustment' },
};

// Credit package card
function PackageCard({
  package: pkg,
  onPurchase,
  isLoading,
}: {
  package: CreditPackage;
  onPurchase: () => void;
  isLoading: boolean;
}) {
  return (
    <View style={[styles.packageCard, pkg.popular && styles.packageCardPopular]}>
      {pkg.popular && (
        <View style={styles.popularBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <Text style={styles.packageName}>{pkg.name}</Text>

      <View style={styles.creditsContainer}>
        <Text style={styles.creditsAmount}>{pkg.totalCredits}</Text>
        <Text style={styles.creditsLabel}>credits</Text>
      </View>

      {pkg.bonusCredits > 0 && (
        <View style={styles.bonusBadge}>
          <Ionicons name="gift" size={14} color={colors.success[600]} />
          <Text style={styles.bonusText}>+{pkg.bonusCredits} bonus credits</Text>
        </View>
      )}

      <Text style={styles.priceText}>AED {pkg.priceAED}</Text>
      <Text style={styles.perCreditText}>
        AED {pkg.perCreditCost.toFixed(2)} per credit
      </Text>

      <TouchableOpacity
        style={[styles.purchaseButton, pkg.popular && styles.purchaseButtonPopular]}
        onPress={onPurchase}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.purchaseButtonText}>Buy Now</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Transaction item
function TransactionItem({ transaction }: { transaction: CreditTransaction }) {
  const config = TRANSACTION_CONFIG[transaction.type] || TRANSACTION_CONFIG.purchase;
  const isPositive = transaction.amount > 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIcon, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon as any} size={20} color={config.color} />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionType}>{config.label}</Text>
        <Text style={styles.transactionDescription} numberOfLines={1}>
          {transaction.description || 'Credit transaction'}
        </Text>
        <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: isPositive ? colors.success[600] : colors.error[600] },
        ]}
      >
        {isPositive ? '+' : ''}{transaction.amount}
      </Text>
    </View>
  );
}

export default function CreditsScreen() {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [expiringCredits, setExpiringCredits] = useState<ExpiringCredits[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const [balanceData, packagesData, transactionsData] = await Promise.all([
        getBalance(),
        getPackages(),
        getTransactions({ limit: 10 }),
      ]);

      setBalance(balanceData.balance);
      setExpiringCredits(balanceData.expiringCredits || []);
      setPackages(packagesData);
      setTransactions(transactionsData.transactions);
    } catch (err) {
      console.error('Error loading credits:', err);
      setError('Failed to load credits. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handlePurchase = async (pkg: CreditPackage) => {
    try {
      setPurchaseLoading(pkg.id);

      const { checkoutUrl } = await createCheckout(pkg.id);

      // Open Stripe checkout in browser
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported) {
        await Linking.openURL(checkoutUrl);
        // Show alert about completing payment
        Alert.alert(
          'Complete Payment',
          'Please complete your payment in the browser. Your credits will be added once payment is confirmed.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Could not open payment page. Please try again.');
      }
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to start checkout. Please try again.'
      );
    } finally {
      setPurchaseLoading(null);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Credits</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Credits</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credits</Text>
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
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Ionicons name="ticket" size={32} color={colors.primary[600]} />
            <Text style={styles.balanceLabel}>Available Credits</Text>
          </View>
          <Text style={styles.balanceAmount}>{balance?.totalCredits || 0}</Text>

          <View style={styles.balanceBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Free Credits</Text>
              <Text style={styles.breakdownValue}>{balance?.freeCredits || 0}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Paid Credits</Text>
              <Text style={styles.breakdownValue}>{balance?.paidCredits || 0}</Text>
            </View>
          </View>

          {/* Expiring credits warning */}
          {expiringCredits.length > 0 && (
            <View style={styles.expiringWarning}>
              <Ionicons name="warning" size={16} color={colors.warning[600]} />
              <Text style={styles.expiringText}>
                {expiringCredits[0].credits} credits expiring in{' '}
                {expiringCredits[0].daysUntilExpiry} days
              </Text>
            </View>
          )}
        </View>

        {/* Lifetime Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color={colors.success[600]} />
            <Text style={styles.statValue}>{balance?.lifetimeEarned || 0}</Text>
            <Text style={styles.statLabel}>Lifetime Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-down" size={24} color={colors.error[600]} />
            <Text style={styles.statValue}>{balance?.lifetimeSpent || 0}</Text>
            <Text style={styles.statLabel}>Lifetime Spent</Text>
          </View>
        </View>

        {/* Packages Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buy Credits</Text>
          <Text style={styles.sectionSubtitle}>
            Choose a package to get more credits
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.packagesScroll}
          >
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onPurchase={() => handlePurchase(pkg)}
                isLoading={purchaseLoading === pkg.id}
              />
            ))}
          </ScrollView>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={40} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </View>
          )}
        </View>

        {/* Help Info */}
        <View style={styles.helpCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary[600]} />
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>How Credits Work</Text>
            <Text style={styles.helpText}>
              Credits are used to claim leads from the marketplace. Each lead costs
              a certain number of credits based on urgency and budget. Claimed leads
              give you access to homeowner contact info and the ability to submit quotes.
            </Text>
          </View>
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
  balanceCard: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  balanceLabel: {
    ...textStyles.bodySmall,
    color: colors.primary[100],
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing[4],
  },
  balanceBreakdown: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownLabel: {
    ...textStyles.caption,
    color: colors.primary[200],
    marginBottom: spacing[1],
  },
  breakdownValue: {
    ...textStyles.h4,
    color: '#fff',
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing[3],
  },
  expiringWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.warning[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginTop: spacing[4],
  },
  expiringText: {
    ...textStyles.bodySmall,
    color: colors.warning[700],
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statValue: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginTop: spacing[2],
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing[1],
    marginBottom: spacing[4],
  },
  viewAllText: {
    ...textStyles.bodySmall,
    color: colors.primary[600],
    fontWeight: '600',
  },
  packagesScroll: {
    gap: spacing[3],
    paddingRight: spacing[4],
  },
  packageCard: {
    width: 200,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
  },
  packageCardPopular: {
    borderColor: colors.primary[400],
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  popularText: {
    ...textStyles.caption,
    color: '#fff',
    fontWeight: '600',
    fontSize: 10,
  },
  packageName: {
    ...textStyles.label,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  creditsContainer: {
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  creditsAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary[600],
  },
  creditsLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    backgroundColor: colors.success[50],
    borderRadius: borderRadius.sm,
    padding: spacing[2],
    marginBottom: spacing[3],
  },
  bonusText: {
    ...textStyles.caption,
    color: colors.success[700],
    fontWeight: '600',
  },
  priceText: {
    ...textStyles.h4,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  perCreditText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  purchaseButton: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  purchaseButtonPopular: {
    backgroundColor: colors.primary[500],
  },
  purchaseButtonText: {
    ...textStyles.button,
    color: colors.primary[700],
  },
  transactionsList: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  transactionDescription: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  transactionDate: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  transactionAmount: {
    ...textStyles.label,
    fontWeight: '600',
  },
  emptyTransactions: {
    alignItems: 'center',
    padding: spacing[8],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    ...textStyles.label,
    color: colors.primary[700],
    marginBottom: spacing[2],
  },
  helpText: {
    ...textStyles.bodySmall,
    color: colors.primary[600],
    lineHeight: 20,
  },
});

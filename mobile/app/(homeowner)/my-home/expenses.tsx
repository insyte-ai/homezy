/**
 * Expenses Screen
 * Shows homeowner's home-related expenses
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import {
  getMyExpenses,
  getExpenseSummary,
  deleteExpense,
  Expense,
  ExpenseSummary,
  expenseCategoryConfig,
} from '../../../src/services/expenses';

function ExpenseCard({
  expense,
  onDelete,
}: {
  expense: Expense;
  onDelete: () => void;
}) {
  const category = expenseCategoryConfig[expense.category];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  return (
    <View style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category?.bgColor || colors.primary[50] }]}>
          <Ionicons
            name={category?.icon as any || 'wallet'}
            size={20}
            color={category?.color || colors.primary[500]}
          />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseTitle} numberOfLines={1}>{expense.title}</Text>
          <Text style={styles.expenseCategory}>{category?.label || expense.category}</Text>
        </View>
        <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
      </View>

      {/* Description */}
      {expense.description && (
        <Text style={styles.expenseDescription} numberOfLines={2}>
          {expense.description}
        </Text>
      )}

      {/* Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.detailText}>{formatDate(expense.date)}</Text>
        </View>

        {expense.vendorName && (
          <View style={styles.detailItem}>
            <Ionicons name="storefront-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.detailText}>{expense.vendorName}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error[400]} />
        </TouchableOpacity>
      </View>

      {/* Tags */}
      {expense.tags && expense.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {expense.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {expense.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{expense.tags.length - 3}</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const [expensesResponse, summaryData] = await Promise.all([
        getMyExpenses({ limit: 50 }),
        getExpenseSummary().catch(() => null),
      ]);

      setExpenses(expensesResponse.expenses);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadExpenses(expenses.length === 0);
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadExpenses(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleDelete = async (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Delete "${expense.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expense.id);
              await loadExpenses(false);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete expense. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Expenses</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Summary */}
      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryMain}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(summary.totalAmount)}</Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{summary.expenseCount}</Text>
              <Text style={styles.summaryStatLabel}>Transactions</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{formatCurrency(summary.averageExpense)}</Text>
              <Text style={styles.summaryStatLabel}>Average</Text>
            </View>
          </View>

          {/* Category Breakdown */}
          {summary.byCategory && summary.byCategory.length > 0 && (
            <View style={styles.categoryBreakdown}>
              <Text style={styles.breakdownTitle}>By Category</Text>
              <View style={styles.categoryGrid}>
                {summary.byCategory.slice(0, 4).map((cat) => {
                  const config = expenseCategoryConfig[cat.category as keyof typeof expenseCategoryConfig];
                  return (
                    <View key={cat.category} style={styles.categoryItem}>
                      <View style={[styles.categoryDot, { backgroundColor: config?.color || colors.primary[500] }]} />
                      <Text style={styles.categoryName} numberOfLines={1}>
                        {config?.label || cat.category}
                      </Text>
                      <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadExpenses()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="No Expenses Yet"
          description="Track your home-related expenses to get insights into your spending"
        />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseCard expense={item} onDelete={() => handleDelete(item)} />
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
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  summaryContainer: {
    backgroundColor: colors.primary[500],
    padding: layout.screenPadding,
  },
  summaryMain: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  summaryLabel: {
    ...textStyles.bodySmall,
    color: colors.primary[100],
    marginBottom: spacing[1],
  },
  summaryAmount: {
    ...textStyles.h2,
    color: '#fff',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[8],
    marginBottom: spacing[4],
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    ...textStyles.h4,
    color: '#fff',
  },
  summaryStatLabel: {
    ...textStyles.caption,
    color: colors.primary[100],
  },
  categoryBreakdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  breakdownTitle: {
    ...textStyles.caption,
    color: colors.primary[100],
    marginBottom: spacing[2],
  },
  categoryGrid: {
    gap: spacing[2],
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[2],
  },
  categoryName: {
    ...textStyles.bodySmall,
    color: '#fff',
    flex: 1,
  },
  categoryAmount: {
    ...textStyles.bodySmall,
    color: '#fff',
    fontWeight: '600',
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
  expenseCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  expenseTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  expenseCategory: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  expenseAmount: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  expenseDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  detailText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  deleteButton: {
    marginLeft: 'auto',
    padding: spacing[1],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  tag: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  tagText: {
    ...textStyles.caption,
    color: colors.primary[600],
  },
  moreTagsText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
});

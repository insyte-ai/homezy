/**
 * Find Pros Tab Screen
 * Browse and search for professionals
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useProsSearchStore } from '../../../src/store/prosSearchStore';
import { ProCard } from '../../../src/components/pro/ProCard';
import { ProFilters } from '../../../src/components/pro/ProFilters';
import { EmptyState } from '../../../src/components/ui';
import { useLeadFormStore } from '../../../src/store/leadFormStore';

export default function FindProsScreen() {
  const {
    searchQuery,
    selectedCategory,
    selectedEmirate,
    minRating,
    professionals,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    setSearchQuery,
    setCategory,
    setEmirate,
    setMinRating,
    fetchProfessionals,
    loadMore,
    resetFilters,
  } = useProsSearchStore();

  const { setTargetProfessionalId, reset: resetLeadForm } = useLeadFormStore();

  // Fetch on mount and when filters change
  useFocusEffect(
    useCallback(() => {
      fetchProfessionals();
    }, [selectedCategory, selectedEmirate, minRating])
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchProfessionals();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleViewProfile = (proId: string) => {
    router.push(`/(homeowner)/pro/${proId}`);
  };

  const handleRequestQuote = (proId: string) => {
    resetLeadForm();
    setTargetProfessionalId(proId);
    router.push('/(homeowner)/create-request/');
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && pagination.page < pagination.pages) {
      loadMore();
    }
  };

  const renderProCard = ({ item }: { item: (typeof professionals)[0] }) => (
    <ProCard
      professional={item}
      onViewProfile={() => handleViewProfile(item.id)}
      onRequestQuote={() => handleRequestQuote(item.id)}
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary[500]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Professionals</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or service..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ProFilters
          selectedCategory={selectedCategory}
          selectedEmirate={selectedEmirate}
          minRating={minRating}
          onCategoryChange={setCategory}
          onEmirateChange={setEmirate}
          onRatingChange={setMinRating}
          onReset={resetFilters}
          resultCount={pagination.total}
        />
      </View>

      {/* Content */}
      {isLoading && professionals.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Finding professionals...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProfessionals}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : professionals.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No Professionals Found"
          description={
            selectedCategory || selectedEmirate || minRating
              ? "Try adjusting your filters to see more results"
              : "We couldn't find any professionals at the moment"
          }
          actionLabel={(selectedCategory || selectedEmirate || minRating) ? 'Reset Filters' : undefined}
          onAction={(selectedCategory || selectedEmirate || minRating) ? resetFilters : undefined}
        />
      ) : (
        <FlatList
          data={professionals}
          keyExtractor={(item) => item.id}
          renderItem={renderProCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && professionals.length > 0}
              onRefresh={fetchProfessionals}
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
    backgroundColor: colors.background.secondary,
  },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    padding: 0,
  },
  filtersContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[2],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  listContent: {
    padding: layout.screenPadding,
    gap: spacing[3],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  loadingMore: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPadding,
    gap: spacing[3],
  },
  errorText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },
  retryText: {
    ...textStyles.button,
    color: '#fff',
  },
});

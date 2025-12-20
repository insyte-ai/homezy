/**
 * Service Selection Screen
 * Step 1 of the create request flow
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useLeadFormStore } from '../../../src/store/leadFormStore';
import {
  getAllServices,
  searchServices,
  ServiceGroup,
  SubService,
} from '../../../src/services/services';

// Progress indicator component
function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentStep + 1) / totalSteps) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );
}

// Service item component
function ServiceItem({
  service,
  isSelected,
  onSelect,
}: {
  service: SubService;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.serviceItem, isSelected && styles.serviceItemSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.serviceItemContent}>
        <View
          style={[
            styles.serviceIcon,
            isSelected && styles.serviceIconSelected,
          ]}
        >
          <Ionicons
            name="construct-outline"
            size={24}
            color={isSelected ? colors.primary[600] : colors.text.tertiary}
          />
        </View>
        <View style={styles.serviceInfo}>
          <Text
            style={[
              styles.serviceName,
              isSelected && styles.serviceNameSelected,
            ]}
          >
            {service.name}
          </Text>
          {service.category && (
            <Text style={styles.serviceCategory}>{service.category}</Text>
          )}
        </View>
      </View>
      {isSelected && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={colors.primary[500]}
        />
      )}
    </TouchableOpacity>
  );
}

export default function ServiceSelectionScreen() {
  const { selectedService, setService, reset } = useLeadFormStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<ServiceGroup[]>([]);
  const [searchResults, setSearchResults] = useState<SubService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  // If service is already selected (from dashboard), skip to questionnaire/details
  useEffect(() => {
    if (selectedService && !hasRedirected) {
      setHasRedirected(true);
      // Skip to questionnaire step (or details if no questionnaire)
      router.replace('/(homeowner)/create-request/questions');
    }
  }, [selectedService, hasRedirected]);

  // Load all services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllServices();
      setServices(data);
    } catch (err) {
      setError('Failed to load services. Please try again.');
      console.error('Error loading services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Search services with debounce
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchServices(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching services:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectService = (service: SubService) => {
    setService(service);
  };

  const handleContinue = () => {
    if (selectedService) {
      router.push('/(homeowner)/create-request/questions');
    }
  };

  const handleBack = () => {
    reset();
    router.back();
  };

  // Get all subservices flattened for display
  const allSubservices = services.flatMap((group) =>
    group.categories.flatMap((category) =>
      category.subservices.map((sub) => ({
        ...sub,
        category: category.name,
        group: group.name,
      }))
    )
  );

  // Display search results or all services
  const displayServices = searchQuery.trim().length >= 2 ? searchResults : allSubservices;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Request</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress */}
      <ProgressBar currentStep={0} totalSteps={5} />

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>What service do you need?</Text>
        <Text style={styles.subtitle}>
          Select the type of service you're looking for
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.text.tertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Services List */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadServices}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={displayServices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ServiceItem
                service={item}
                isSelected={selectedService?.id === item.id}
                onSelect={() => handleSelectService(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery.length >= 2
                    ? 'No services found. Try a different search.'
                    : 'No services available.'}
                </Text>
              </View>
            }
          />
        )}
        {isSearching && (
          <View style={styles.searchingOverlay}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedService && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedService}
        >
          <Text
            style={[
              styles.continueButtonText,
              !selectedService && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={selectedService ? '#fff' : colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>
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
  progressContainer: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing[4],
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  progressText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  titleSection: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing[4],
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  searchContainer: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing[4],
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    padding: 0,
  },
  listContainer: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing[4],
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  serviceItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  serviceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  serviceIconSelected: {
    backgroundColor: colors.primary[100],
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  serviceNameSelected: {
    color: colors.primary[700],
  },
  serviceCategory: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing[3],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  errorText: {
    ...textStyles.body,
    color: colors.error[600],
    textAlign: 'center',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing[8],
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  searchingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: spacing[4],
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
  },
  continueButtonDisabled: {
    backgroundColor: colors.neutral[200],
  },
  continueButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
  continueButtonTextDisabled: {
    color: colors.text.tertiary,
  },
});

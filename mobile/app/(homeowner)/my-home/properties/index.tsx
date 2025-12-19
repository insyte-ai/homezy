/**
 * Properties List Screen
 * Shows homeowner's properties
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
import { EmptyState } from '../../../../src/components/ui';
import { colors } from '../../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../../src/theme/spacing';
import { textStyles } from '../../../../src/theme/typography';
import {
  getMyProperties,
  deleteProperty,
  setPrimaryProperty,
  Property,
  propertyTypeConfig,
} from '../../../../src/services/properties';
import { EMIRATES } from '../../../../src/constants/leadForm';

function PropertyCard({
  property,
  onPress,
  onSetPrimary,
  onDelete,
}: {
  property: Property;
  onPress: () => void;
  onSetPrimary: () => void;
  onDelete: () => void;
}) {
  const typeConfig = propertyTypeConfig[property.propertyType];
  const emirate = EMIRATES.find((e) => e.id === property.emirate);

  return (
    <TouchableOpacity style={styles.propertyCard} onPress={onPress} activeOpacity={0.7}>
      {/* Primary Badge */}
      {property.isPrimary && (
        <View style={styles.primaryBadge}>
          <Ionicons name="star" size={12} color={colors.warning[500]} />
          <Text style={styles.primaryBadgeText}>Primary</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.propertyHeader}>
        <View style={styles.propertyIconContainer}>
          <Ionicons
            name={typeConfig?.icon as any || 'home'}
            size={24}
            color={colors.primary[500]}
          />
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <Text style={styles.propertyType}>{typeConfig?.label || property.propertyType}</Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            Alert.alert('Property Options', '', [
              ...(!property.isPrimary
                ? [{ text: 'Set as Primary', onPress: onSetPrimary }]
                : []),
              { text: 'Delete', style: 'destructive' as const, onPress: onDelete },
              { text: 'Cancel', style: 'cancel' as const },
            ]);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Details */}
      <View style={styles.propertyDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.detailText}>
            {emirate?.name || property.emirate}
            {property.neighborhood ? `, ${property.neighborhood}` : ''}
          </Text>
        </View>

        <View style={styles.statsRow}>
          {property.bedrooms !== undefined && property.bedrooms > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="bed-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>{property.bedrooms} bed</Text>
            </View>
          )}
          {property.bathrooms !== undefined && property.bathrooms > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>{property.bathrooms} bath</Text>
            </View>
          )}
          {property.sizeSqFt !== undefined && property.sizeSqFt > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="resize-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>{property.sizeSqFt.toLocaleString()} sqft</Text>
            </View>
          )}
        </View>
      </View>

      {/* Profile Completeness */}
      <View style={styles.completenessContainer}>
        <View style={styles.completenessBar}>
          <View
            style={[styles.completenessProgress, { width: `${property.profileCompleteness}%` }]}
          />
        </View>
        <Text style={styles.completenessText}>{property.profileCompleteness}% complete</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function PropertiesScreen() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const response = await getMyProperties();
      setProperties(response.properties);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProperties(properties.length === 0);
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProperties(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleCreateProperty = () => {
    router.push('/(homeowner)/my-home/properties/new');
  };

  const handlePropertyPress = (property: Property) => {
    router.push(`/(homeowner)/my-home/properties/${property.id}`);
  };

  const handleSetPrimary = async (property: Property) => {
    try {
      await setPrimaryProperty(property.id);
      await loadProperties(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to set primary property. Please try again.');
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${property.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProperty(property.id);
              await loadProperties(false);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete property. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Properties</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateProperty}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadProperties()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : properties.length === 0 ? (
        <EmptyState
          icon="home-outline"
          title="No Properties Yet"
          description="Add your first property to start tracking service history, reminders, and expenses"
          actionLabel="Add Property"
          onAction={handleCreateProperty}
        />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => handlePropertyPress(item)}
              onSetPrimary={() => handleSetPrimary(item)}
              onDelete={() => handleDeleteProperty(item)}
            />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
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
  propertyCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing[1],
    backgroundColor: colors.warning[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    marginBottom: spacing[3],
  },
  primaryBadgeText: {
    ...textStyles.caption,
    color: colors.warning[700],
    fontWeight: '600',
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  propertyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  propertyName: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  propertyType: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  menuButton: {
    padding: spacing[2],
  },
  propertyDetails: {
    marginBottom: spacing[3],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  detailText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[2],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  completenessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  completenessBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  completenessProgress: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  completenessText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
});

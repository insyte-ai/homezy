/**
 * Property Details/Edit Screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../../src/theme/spacing';
import { textStyles } from '../../../../src/theme/typography';
import {
  getPropertyById,
  updateProperty,
  deleteProperty,
  Property,
  UpdatePropertyInput,
  PropertyType,
  OwnershipType,
  propertyTypeConfig,
  ownershipTypeConfig,
} from '../../../../src/services/properties';
import { EMIRATES } from '../../../../src/constants/leadForm';

const PROPERTY_TYPES: PropertyType[] = ['villa', 'townhouse', 'apartment', 'penthouse'];
const OWNERSHIP_TYPES: OwnershipType[] = ['owned', 'rental'];

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdatePropertyInput>({});

  const loadProperty = async (showLoading = true) => {
    if (!id) return;

    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const data = await getPropertyById(id);
      setProperty(data);
      setFormData({
        name: data.name,
        emirate: data.emirate,
        neighborhood: data.neighborhood,
        propertyType: data.propertyType,
        ownershipType: data.ownershipType,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        sizeSqFt: data.sizeSqFt,
        yearBuilt: data.yearBuilt,
      });
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Failed to load property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProperty();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadProperty(false);
    }, [id])
  );

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setIsSaving(true);
      await updateProperty(id, formData);
      setIsEditing(false);
      await loadProperty(false);
    } catch (err) {
      console.error('Error updating property:', err);
      Alert.alert('Error', 'Failed to update property. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!property) return;

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
              router.back();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete property. Please try again.');
            }
          },
        },
      ]
    );
  };

  const updateField = (field: keyof UpdatePropertyInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Property</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !property) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Property</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error || 'Property not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadProperty()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const emirate = EMIRATES.find((e) => e.id === property.emirate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Edit Property' : property.name}</Text>
        {isEditing ? (
          <TouchableOpacity
            onPress={() => {
              setIsEditing(false);
              setFormData({
                name: property.name,
                emirate: property.emirate,
                neighborhood: property.neighborhood,
                propertyType: property.propertyType,
                ownershipType: property.ownershipType,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                sizeSqFt: property.sizeSqFt,
                yearBuilt: property.yearBuilt,
              });
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
          >
            <Ionicons name="pencil" size={20} color={colors.primary[500]} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isEditing ? (
          // Edit Mode
          <>
            {/* Property Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Property Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            {/* Property Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Property Type</Text>
              <View style={styles.optionsGrid}>
                {PROPERTY_TYPES.map((type) => {
                  const config = propertyTypeConfig[type];
                  const isSelected = formData.propertyType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                      onPress={() => updateField('propertyType', type)}
                    >
                      <Ionicons
                        name={config.icon as any}
                        size={24}
                        color={isSelected ? colors.primary[500] : colors.text.tertiary}
                      />
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Ownership Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ownership</Text>
              <View style={styles.toggleRow}>
                {OWNERSHIP_TYPES.map((type) => {
                  const config = ownershipTypeConfig[type];
                  const isSelected = formData.ownershipType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.toggleButton, isSelected && styles.toggleButtonSelected]}
                      onPress={() => updateField('ownershipType', type)}
                    >
                      <Text style={[styles.toggleText, isSelected && styles.toggleTextSelected]}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Emirate */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Emirate</Text>
              <View style={styles.optionsWrap}>
                {EMIRATES.map((em) => {
                  const isSelected = formData.emirate === em.id;
                  return (
                    <TouchableOpacity
                      key={em.id}
                      style={[styles.chipButton, isSelected && styles.chipButtonSelected]}
                      onPress={() => updateField('emirate', em.id)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {em.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Neighborhood */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Neighborhood</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Downtown, Marina"
                value={formData.neighborhood}
                onChangeText={(value) => updateField('neighborhood', value)}
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            {/* Property Details */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Property Details</Text>
              <View style={styles.detailsRow}>
                <View style={styles.detailInput}>
                  <Text style={styles.detailLabel}>Bedrooms</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={formData.bedrooms?.toString() || ''}
                    onChangeText={(value) =>
                      updateField('bedrooms', value ? parseInt(value, 10) : undefined)
                    }
                    keyboardType="number-pad"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>
                <View style={styles.detailInput}>
                  <Text style={styles.detailLabel}>Bathrooms</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={formData.bathrooms?.toString() || ''}
                    onChangeText={(value) =>
                      updateField('bathrooms', value ? parseInt(value, 10) : undefined)
                    }
                    keyboardType="number-pad"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>
              </View>
              <View style={styles.detailsRow}>
                <View style={styles.detailInput}>
                  <Text style={styles.detailLabel}>Size (sqft)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={formData.sizeSqFt?.toString() || ''}
                    onChangeText={(value) =>
                      updateField('sizeSqFt', value ? parseInt(value, 10) : undefined)
                    }
                    keyboardType="number-pad"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>
                <View style={styles.detailInput}>
                  <Text style={styles.detailLabel}>Year Built</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2020"
                    value={formData.yearBuilt?.toString() || ''}
                    onChangeText={(value) =>
                      updateField('yearBuilt', value ? parseInt(value, 10) : undefined)
                    }
                    keyboardType="number-pad"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>
              </View>
            </View>

            {/* Delete Button */}
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={colors.error[500]} />
              <Text style={styles.deleteButtonText}>Delete Property</Text>
            </TouchableOpacity>
          </>
        ) : (
          // View Mode
          <>
            {/* Property Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.propertyHeader}>
                <View style={styles.propertyIconContainer}>
                  <Ionicons
                    name={propertyTypeConfig[property.propertyType]?.icon as any || 'home'}
                    size={32}
                    color={colors.primary[500]}
                  />
                </View>
                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyName}>{property.name}</Text>
                  <Text style={styles.propertyType}>
                    {propertyTypeConfig[property.propertyType]?.label || property.propertyType}
                    {' • '}
                    {ownershipTypeConfig[property.ownershipType]?.label || property.ownershipType}
                  </Text>
                </View>
                {property.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Ionicons name="star" size={14} color={colors.warning[500]} />
                  </View>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={18} color={colors.text.tertiary} />
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>
                    {emirate?.name || property.emirate}
                    {property.neighborhood ? `, ${property.neighborhood}` : ''}
                  </Text>
                </View>

                {property.bedrooms !== undefined && property.bedrooms > 0 && (
                  <View style={styles.detailRow}>
                    <Ionicons name="bed-outline" size={18} color={colors.text.tertiary} />
                    <Text style={styles.detailLabel}>Bedrooms</Text>
                    <Text style={styles.detailValue}>{property.bedrooms}</Text>
                  </View>
                )}

                {property.bathrooms !== undefined && property.bathrooms > 0 && (
                  <View style={styles.detailRow}>
                    <Ionicons name="water-outline" size={18} color={colors.text.tertiary} />
                    <Text style={styles.detailLabel}>Bathrooms</Text>
                    <Text style={styles.detailValue}>{property.bathrooms}</Text>
                  </View>
                )}

                {property.sizeSqFt !== undefined && property.sizeSqFt > 0 && (
                  <View style={styles.detailRow}>
                    <Ionicons name="resize-outline" size={18} color={colors.text.tertiary} />
                    <Text style={styles.detailLabel}>Size</Text>
                    <Text style={styles.detailValue}>{property.sizeSqFt.toLocaleString()} sqft</Text>
                  </View>
                )}

                {property.yearBuilt !== undefined && property.yearBuilt > 0 && (
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={18} color={colors.text.tertiary} />
                    <Text style={styles.detailLabel}>Year Built</Text>
                    <Text style={styles.detailValue}>{property.yearBuilt}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Profile Completeness */}
            <View style={styles.completenessCard}>
              <View style={styles.completenessHeader}>
                <Text style={styles.completenessTitle}>Profile Completeness</Text>
                <Text style={styles.completenessPercent}>{property.profileCompleteness}%</Text>
              </View>
              <View style={styles.completenessBar}>
                <View
                  style={[
                    styles.completenessProgress,
                    { width: `${property.profileCompleteness}%` },
                  ]}
                />
              </View>
              {property.profileCompleteness < 100 && (
                <Text style={styles.completenessHint}>
                  Complete your property profile to get better service recommendations
                </Text>
              )}
            </View>

            {/* Rooms Section */}
            {property.rooms && property.rooms.length > 0 && (
              <View style={styles.roomsCard}>
                <Text style={styles.sectionTitle}>Rooms ({property.rooms.length})</Text>
                <View style={styles.roomsList}>
                  {property.rooms.map((room) => (
                    <View key={room.id} style={styles.roomItem}>
                      <Ionicons name="cube-outline" size={18} color={colors.text.tertiary} />
                      <Text style={styles.roomName}>{room.name}</Text>
                      <Text style={styles.roomType}>{room.type}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Save Button (Edit Mode) */}
      {isEditing && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
  title: {
    ...textStyles.h4,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  editButton: {
    padding: spacing[2],
  },
  cancelButton: {
    padding: spacing[2],
  },
  cancelButtonText: {
    ...textStyles.body,
    color: colors.text.secondary,
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
  infoCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[4],
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyIconContainer: {
    width: 56,
    height: 56,
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
    ...textStyles.h3,
    color: colors.text.primary,
  },
  propertyType: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  primaryBadge: {
    padding: spacing[2],
    backgroundColor: colors.warning[50],
    borderRadius: borderRadius.full,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[4],
  },
  detailsList: {
    gap: spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  detailLabel: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    width: 80,
  },
  detailValue: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  completenessCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[4],
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  completenessTitle: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  completenessPercent: {
    ...textStyles.h4,
    color: colors.primary[500],
  },
  completenessBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  completenessProgress: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  completenessHint: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[3],
  },
  roomsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  roomsList: {
    gap: spacing[2],
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  roomName: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  roomType: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
  },
  // Form Styles
  formGroup: {
    marginBottom: spacing[6],
  },
  label: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...textStyles.body,
    color: colors.text.primary,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  optionCard: {
    width: '47%',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    alignItems: 'center',
    gap: spacing[2],
  },
  optionCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  optionTextSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  toggleButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  toggleButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  toggleText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  toggleTextSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chipButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  chipText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  chipTextSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  detailInput: {
    flex: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    marginTop: spacing[4],
  },
  deleteButtonText: {
    ...textStyles.body,
    color: colors.error[500],
  },
  footer: {
    padding: layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
});

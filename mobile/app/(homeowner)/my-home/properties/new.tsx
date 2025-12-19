/**
 * Create Property Screen
 */

import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../../src/theme/spacing';
import { textStyles } from '../../../../src/theme/typography';
import {
  createProperty,
  CreatePropertyInput,
  PropertyType,
  OwnershipType,
  propertyTypeConfig,
  ownershipTypeConfig,
} from '../../../../src/services/properties';
import { EMIRATES } from '../../../../src/constants/leadForm';

const PROPERTY_TYPES: PropertyType[] = ['villa', 'townhouse', 'apartment', 'penthouse'];
const OWNERSHIP_TYPES: OwnershipType[] = ['owned', 'rental'];

export default function CreatePropertyScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatePropertyInput>>({
    name: '',
    emirate: '',
    neighborhood: '',
    propertyType: 'apartment',
    ownershipType: 'owned',
    bedrooms: undefined,
    bathrooms: undefined,
    sizeSqFt: undefined,
    yearBuilt: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBack = () => {
    router.back();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Property name is required';
    }
    if (!formData.emirate) {
      newErrors.emirate = 'Emirate is required';
    }
    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required';
    }
    if (!formData.ownershipType) {
      newErrors.ownershipType = 'Ownership type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await createProperty({
        name: formData.name!,
        emirate: formData.emirate!,
        neighborhood: formData.neighborhood,
        propertyType: formData.propertyType!,
        ownershipType: formData.ownershipType!,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        sizeSqFt: formData.sizeSqFt,
        yearBuilt: formData.yearBuilt,
      });

      router.back();
    } catch (err) {
      console.error('Error creating property:', err);
      Alert.alert('Error', 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof CreatePropertyInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Property</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Property Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Property Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g., My Home, Beach Villa"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholderTextColor={colors.text.tertiary}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Property Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Property Type *</Text>
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
          <Text style={styles.label}>Ownership *</Text>
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
          <Text style={styles.label}>Emirate *</Text>
          <View style={styles.optionsWrap}>
            {EMIRATES.map((emirate) => {
              const isSelected = formData.emirate === emirate.id;
              return (
                <TouchableOpacity
                  key={emirate.id}
                  style={[styles.chipButton, isSelected && styles.chipButtonSelected]}
                  onPress={() => updateField('emirate', emirate.id)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {emirate.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.emirate && <Text style={styles.errorText}>{errors.emirate}</Text>}
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
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Property</Text>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
    paddingBottom: spacing[8],
  },
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
  inputError: {
    borderColor: colors.error[500],
  },
  errorText: {
    ...textStyles.caption,
    color: colors.error[500],
    marginTop: spacing[1],
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
  detailLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  footer: {
    padding: layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
});

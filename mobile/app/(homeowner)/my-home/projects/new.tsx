/**
 * Create Project Screen
 */

import React, { useState, useEffect } from 'react';
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
  createHomeProject,
  CreateHomeProjectInput,
  ProjectCategory,
  projectCategoryConfig,
} from '../../../../src/services/homeProjects';
import { getMyProperties, Property } from '../../../../src/services/properties';

const PROJECT_CATEGORIES: ProjectCategory[] = [
  'kitchen', 'bathroom', 'bedroom', 'living-room', 'dining-room',
  'outdoor', 'garage', 'hvac', 'electrical', 'plumbing',
  'flooring', 'painting', 'roofing', 'landscaping', 'pool',
  'security', 'whole-home', 'other',
];

export default function CreateProjectScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState<Partial<CreateHomeProjectInput>>({
    name: '',
    description: '',
    category: 'other',
    propertyId: undefined,
    budgetEstimated: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await getMyProperties();
      setProperties(response.properties);
      // Auto-select primary property
      const primary = response.properties.find((p) => p.isPrimary);
      if (primary) {
        setFormData((prev) => ({ ...prev, propertyId: primary.id }));
      }
    } catch (err) {
      console.error('Error loading properties:', err);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await createHomeProject({
        name: formData.name!,
        description: formData.description,
        category: formData.category!,
        propertyId: formData.propertyId,
        budgetEstimated: formData.budgetEstimated,
        startDate: formData.startDate,
        targetEndDate: formData.targetEndDate,
      });

      router.back();
    } catch (err) {
      console.error('Error creating project:', err);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof CreateHomeProjectInput, value: any) => {
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
        <Text style={styles.title}>New Project</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Project Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g., Kitchen Renovation, Master Bath Update"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholderTextColor={colors.text.tertiary}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your project goals and vision..."
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {PROJECT_CATEGORIES.map((category) => {
              const config = projectCategoryConfig[category];
              const isSelected = formData.category === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                  onPress={() => updateField('category', category)}
                >
                  <Ionicons
                    name={config.icon as any}
                    size={20}
                    color={isSelected ? colors.primary[500] : colors.text.tertiary}
                  />
                  <Text
                    style={[styles.categoryText, isSelected && styles.categoryTextSelected]}
                    numberOfLines={1}
                  >
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Property */}
        {properties.length > 0 && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Property</Text>
            <View style={styles.optionsWrap}>
              <TouchableOpacity
                style={[styles.chipButton, !formData.propertyId && styles.chipButtonSelected]}
                onPress={() => updateField('propertyId', undefined)}
              >
                <Text style={[styles.chipText, !formData.propertyId && styles.chipTextSelected]}>
                  None
                </Text>
              </TouchableOpacity>
              {properties.map((property) => {
                const isSelected = formData.propertyId === property.id;
                return (
                  <TouchableOpacity
                    key={property.id}
                    style={[styles.chipButton, isSelected && styles.chipButtonSelected]}
                    onPress={() => updateField('propertyId', property.id)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {property.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Budget */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Estimated Budget (AED)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.budgetEstimated?.toString() || ''}
            onChangeText={(value) =>
              updateField('budgetEstimated', value ? parseInt(value, 10) : undefined)
            }
            keyboardType="number-pad"
            placeholderTextColor={colors.text.tertiary}
          />
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
            <Text style={styles.submitButtonText}>Create Project</Text>
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
  textArea: {
    minHeight: 100,
    paddingTop: spacing[3],
  },
  errorText: {
    ...textStyles.caption,
    color: colors.error[500],
    marginTop: spacing[1],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  categoryItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  categoryText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  categoryTextSelected: {
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

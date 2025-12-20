/**
 * Project Details Screen
 * Step 3 of the create request flow
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useLeadFormStore } from '../../../src/store/leadFormStore';
import { EMIRATES, BUDGET_BRACKETS, URGENCY_LEVELS } from '../../../src/constants/leadForm';
import { generateLeadContent } from '../../../src/services/leads';

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

// Selection option component
function SelectOption({
  label,
  description,
  icon,
  iconColor,
  isSelected,
  onSelect,
}: {
  label: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.optionItem, isSelected && styles.optionItemSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {icon && (
        <View
          style={[
            styles.optionIcon,
            isSelected && styles.optionIconSelected,
            iconColor ? { backgroundColor: iconColor + '20' } : {},
          ]}
        >
          <Ionicons
            name={icon as any}
            size={20}
            color={isSelected ? colors.primary[600] : iconColor || colors.text.tertiary}
          />
        </View>
      )}
      <View style={styles.optionContent}>
        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
          {label}
        </Text>
        {description && (
          <Text style={styles.optionDescription}>{description}</Text>
        )}
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary[500]} />
      )}
    </TouchableOpacity>
  );
}

export default function ProjectDetailsScreen() {
  const {
    selectedService,
    title,
    description,
    emirate,
    neighborhood,
    budgetBracket,
    urgency,
    errors,
    isGeneratingContent,
    setTitle,
    setDescription,
    setCommonField,
    setGeneratingContent,
    clearError,
  } = useLeadFormStore();

  const [showEmirateOptions, setShowEmirateOptions] = useState(false);
  const [showBudgetOptions, setShowBudgetOptions] = useState(false);
  const [showUrgencyOptions, setShowUrgencyOptions] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // Validate fields
    let isValid = true;

    if (!title || title.length < 10) {
      useLeadFormStore.getState().setError('title', 'Title must be at least 10 characters');
      isValid = false;
    }
    if (!description || description.length < 20) {
      useLeadFormStore.getState().setError('description', 'Description must be at least 20 characters');
      isValid = false;
    }
    if (!emirate) {
      useLeadFormStore.getState().setError('emirate', 'Please select a location');
      isValid = false;
    }
    if (!budgetBracket) {
      useLeadFormStore.getState().setError('budgetBracket', 'Please select a budget range');
      isValid = false;
    }
    if (!urgency) {
      useLeadFormStore.getState().setError('urgency', 'Please select urgency level');
      isValid = false;
    }

    if (isValid) {
      router.push('/(homeowner)/create-request/photos');
    }
  };

  const handleGenerateContent = async () => {
    if (!selectedService) return;

    try {
      setGeneratingContent(true);
      const content = await generateLeadContent({
        category: selectedService.slug,
        location: emirate ? { emirate } : undefined,
        urgency: urgency || undefined,
        budgetBracket: budgetBracket || undefined,
      });

      if (content.title) {
        setTitle(content.title);
      }
      if (content.description) {
        setDescription(content.description);
      }
    } catch (err) {
      console.error('Error generating content:', err);
    } finally {
      setGeneratingContent(false);
    }
  };

  const selectedEmirate = EMIRATES.find((e) => e.id === emirate);
  const selectedBudget = BUDGET_BRACKETS.find((b) => b.id === budgetBracket);
  const selectedUrgency = URGENCY_LEVELS.find((u) => u.id === urgency);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Progress */}
        <ProgressBar currentStep={2} totalSteps={5} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Service Indicator */}
          {selectedService && (
            <View style={styles.serviceIndicator}>
              <Ionicons name="construct-outline" size={16} color={colors.primary[600]} />
              <Text style={styles.serviceIndicatorText}>{selectedService.name}</Text>
            </View>
          )}

          {/* Title */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Project Title *</Text>
              <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerateContent}
                disabled={isGeneratingContent}
              >
                {isGeneratingContent ? (
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={14} color={colors.primary[500]} />
                    <Text style={styles.generateButtonText}>AI Generate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.textInput, errors.title && styles.textInputError]}
              placeholder="e.g., Fix leaking bathroom faucet"
              placeholderTextColor={colors.text.tertiary}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                clearError('title');
              }}
              maxLength={100}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.textArea,
                errors.description && styles.textInputError,
              ]}
              placeholder="Describe your project in detail. Include what work needs to be done, any specific requirements, and current condition..."
              placeholderTextColor={colors.text.tertiary}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                clearError('description');
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </View>

          {/* Location */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Location *</Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                errors.emirate && styles.selectButtonError,
              ]}
              onPress={() => setShowEmirateOptions(!showEmirateOptions)}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={selectedEmirate ? colors.text.primary : colors.text.tertiary}
              />
              <Text
                style={[
                  styles.selectButtonText,
                  !selectedEmirate && styles.selectButtonPlaceholder,
                ]}
              >
                {selectedEmirate ? selectedEmirate.name : 'Select emirate'}
              </Text>
              <Ionicons
                name={showEmirateOptions ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
            {errors.emirate && <Text style={styles.errorText}>{errors.emirate}</Text>}

            {showEmirateOptions && (
              <View style={styles.optionsContainer}>
                {EMIRATES.map((em) => (
                  <SelectOption
                    key={em.id}
                    label={em.name}
                    isSelected={emirate === em.id}
                    onSelect={() => {
                      setCommonField('emirate', em.id);
                      setShowEmirateOptions(false);
                    }}
                  />
                ))}
              </View>
            )}

            {/* Neighborhood (optional) */}
            <TextInput
              style={[styles.textInput, { marginTop: spacing[3] }]}
              placeholder="Neighborhood (optional)"
              placeholderTextColor={colors.text.tertiary}
              value={neighborhood}
              onChangeText={(text) => setCommonField('neighborhood', text)}
            />
          </View>

          {/* Budget */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Budget Range *</Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                errors.budgetBracket && styles.selectButtonError,
              ]}
              onPress={() => setShowBudgetOptions(!showBudgetOptions)}
            >
              <Ionicons
                name="cash-outline"
                size={20}
                color={selectedBudget ? colors.text.primary : colors.text.tertiary}
              />
              <Text
                style={[
                  styles.selectButtonText,
                  !selectedBudget && styles.selectButtonPlaceholder,
                ]}
              >
                {selectedBudget ? selectedBudget.label : 'Select budget range'}
              </Text>
              <Ionicons
                name={showBudgetOptions ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
            {errors.budgetBracket && (
              <Text style={styles.errorText}>{errors.budgetBracket}</Text>
            )}

            {showBudgetOptions && (
              <View style={styles.optionsContainer}>
                {BUDGET_BRACKETS.map((budget) => (
                  <SelectOption
                    key={budget.id}
                    label={budget.label}
                    icon="cash-outline"
                    isSelected={budgetBracket === budget.id}
                    onSelect={() => {
                      setCommonField('budgetBracket', budget.id);
                      setShowBudgetOptions(false);
                    }}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Urgency */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>When do you need this done? *</Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                errors.urgency && styles.selectButtonError,
              ]}
              onPress={() => setShowUrgencyOptions(!showUrgencyOptions)}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={selectedUrgency ? colors.text.primary : colors.text.tertiary}
              />
              <Text
                style={[
                  styles.selectButtonText,
                  !selectedUrgency && styles.selectButtonPlaceholder,
                ]}
              >
                {selectedUrgency
                  ? `${selectedUrgency.label} - ${selectedUrgency.description}`
                  : 'Select urgency level'}
              </Text>
              <Ionicons
                name={showUrgencyOptions ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
            {errors.urgency && <Text style={styles.errorText}>{errors.urgency}</Text>}

            {showUrgencyOptions && (
              <View style={styles.optionsContainer}>
                {URGENCY_LEVELS.map((level) => (
                  <SelectOption
                    key={level.id}
                    label={level.label}
                    description={level.description}
                    icon={level.icon}
                    iconColor={level.color}
                    isSelected={urgency === level.id}
                    onSelect={() => {
                      setCommonField('urgency', level.id);
                      setShowUrgencyOptions(false);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing[4],
  },
  serviceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  serviceIndicatorText: {
    ...textStyles.caption,
    color: colors.primary[700],
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: spacing[5],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  label: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
  },
  generateButtonText: {
    ...textStyles.caption,
    color: colors.primary[600],
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...textStyles.body,
    color: colors.text.primary,
  },
  textInputError: {
    borderColor: colors.error[500],
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing[3],
  },
  errorText: {
    ...textStyles.caption,
    color: colors.error[600],
    marginTop: spacing[1],
  },
  charCount: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing[1],
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  selectButtonError: {
    borderColor: colors.error[500],
  },
  selectButtonText: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
  },
  selectButtonPlaceholder: {
    color: colors.text.tertiary,
  },
  optionsContainer: {
    marginTop: spacing[2],
    gap: spacing[2],
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing[3],
  },
  optionItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: {
    backgroundColor: colors.primary[100],
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: colors.primary[700],
  },
  optionDescription: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
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
  continueButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
});

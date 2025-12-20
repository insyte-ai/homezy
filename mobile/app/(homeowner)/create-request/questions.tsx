/**
 * Service Questions Screen
 * Step 2 of the create request flow - service-specific questions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useLeadFormStore, ServiceQuestion, QuestionOption } from '../../../src/store/leadFormStore';
import { loadQuestionnaire } from '../../../src/services/questionnaires';

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

// Single choice question component
function SingleChoiceQuestion({
  question,
  selectedValue,
  onSelect,
}: {
  question: ServiceQuestion;
  selectedValue?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.questionContainer}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.required && <Text style={styles.requiredBadge}>Required</Text>}
      </View>
      {question.helpText && (
        <Text style={styles.helpText}>{question.helpText}</Text>
      )}
      <View style={styles.optionsGrid}>
        {question.options?.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionCard,
              selectedValue === option.value && styles.optionCardSelected,
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            {option.icon && (
              <Text style={styles.optionIcon}>{option.icon}</Text>
            )}
            <Text
              style={[
                styles.optionLabel,
                selectedValue === option.value && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
            {selectedValue === option.value && (
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Multiple choice question component
function MultipleChoiceQuestion({
  question,
  selectedValues,
  onToggle,
}: {
  question: ServiceQuestion;
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <View style={styles.questionContainer}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.required && <Text style={styles.requiredBadge}>Required</Text>}
      </View>
      {question.helpText && (
        <Text style={styles.helpText}>{question.helpText}</Text>
      )}
      <Text style={styles.multiSelectHint}>Select all that apply</Text>
      <View style={styles.optionsGrid}>
        {question.options?.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              onPress={() => onToggle(option.value)}
              activeOpacity={0.7}
            >
              {option.icon && (
                <Text style={styles.optionIcon}>{option.icon}</Text>
              )}
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              {isSelected && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Text question component
function TextQuestion({
  question,
  value,
  onChange,
}: {
  question: ServiceQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.questionContainer}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.required && <Text style={styles.requiredBadge}>Required</Text>}
      </View>
      {question.helpText && (
        <Text style={styles.helpText}>{question.helpText}</Text>
      )}
      <TextInput
        style={styles.textInput}
        placeholder={question.placeholder || 'Enter your answer...'}
        placeholderTextColor={colors.text.tertiary}
        value={value}
        onChangeText={onChange}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );
}

// Number question component
function NumberQuestion({
  question,
  value,
  onChange,
}: {
  question: ServiceQuestion;
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.questionContainer}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.required && <Text style={styles.requiredBadge}>Required</Text>}
      </View>
      {question.helpText && (
        <Text style={styles.helpText}>{question.helpText}</Text>
      )}
      <TextInput
        style={styles.numberInput}
        placeholder={question.placeholder || 'Enter a number...'}
        placeholderTextColor={colors.text.tertiary}
        value={value !== undefined ? String(value) : ''}
        onChangeText={(text) => {
          const num = parseInt(text, 10);
          if (!isNaN(num)) {
            onChange(num);
          } else if (text === '') {
            onChange(0);
          }
        }}
        keyboardType="numeric"
      />
    </View>
  );
}

export default function QuestionsScreen() {
  const {
    selectedService,
    questionnaire,
    setQuestionnaire,
    answers,
    setAnswer,
    errors,
  } = useLeadFormStore();

  const [isLoading, setIsLoading] = useState(true);

  // Load questionnaire for the selected service
  useEffect(() => {
    if (selectedService) {
      try {
        const loadedQuestionnaire = loadQuestionnaire(selectedService.slug || selectedService.id);
        setQuestionnaire(loadedQuestionnaire);
      } catch (err) {
        console.error('Error loading questionnaire:', err);
        // Load generic fallback
        const genericQuestionnaire = loadQuestionnaire('_generic');
        setQuestionnaire(genericQuestionnaire);
      }
      setIsLoading(false);
    } else {
      // No service selected, redirect back
      router.replace('/(homeowner)/create-request/');
    }
  }, [selectedService]);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // Validate required questions
    let hasErrors = false;
    if (questionnaire) {
      for (const question of questionnaire.questions) {
        if (question.required) {
          const answer = answers[question.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0)) {
            hasErrors = true;
            break;
          }
        }
      }
    }

    if (hasErrors) {
      // Show alert or set errors
      return;
    }

    router.push('/(homeowner)/create-request/details');
  };

  const handleSkip = () => {
    // Skip questions and go directly to details
    router.push('/(homeowner)/create-request/details');
  };

  const handleSingleChoiceSelect = (questionId: string, value: string) => {
    setAnswer(questionId, value);
  };

  const handleMultipleChoiceToggle = (questionId: string, value: string) => {
    const currentValues = (answers[questionId] as string[]) || [];
    if (currentValues.includes(value)) {
      setAnswer(questionId, currentValues.filter((v) => v !== value));
    } else {
      setAnswer(questionId, [...currentValues, value]);
    }
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswer(questionId, value);
  };

  const handleNumberChange = (questionId: string, value: number) => {
    setAnswer(questionId, value);
  };

  const renderQuestion = (question: ServiceQuestion) => {
    switch (question.type) {
      case 'single-choice':
        return (
          <SingleChoiceQuestion
            key={question.id}
            question={question}
            selectedValue={answers[question.id] as string}
            onSelect={(value) => handleSingleChoiceSelect(question.id, value)}
          />
        );
      case 'multiple-choice':
        return (
          <MultipleChoiceQuestion
            key={question.id}
            question={question}
            selectedValues={(answers[question.id] as string[]) || []}
            onToggle={(value) => handleMultipleChoiceToggle(question.id, value)}
          />
        );
      case 'text':
        return (
          <TextQuestion
            key={question.id}
            question={question}
            value={(answers[question.id] as string) || ''}
            onChange={(value) => handleTextChange(question.id, value)}
          />
        );
      case 'number':
        return (
          <NumberQuestion
            key={question.id}
            question={question}
            value={answers[question.id] as number | undefined}
            onChange={(value) => handleNumberChange(question.id, value)}
          />
        );
      default:
        return null;
    }
  };

  // Count required questions that are answered
  const requiredQuestions = questionnaire?.questions.filter((q) => q.required) || [];
  const answeredRequired = requiredQuestions.filter((q) => {
    const answer = answers[q.id];
    return answer && (!Array.isArray(answer) || answer.length > 0);
  });
  const allRequiredAnswered = answeredRequired.length === requiredQuestions.length;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Request</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading questions...</Text>
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
        <Text style={styles.headerTitle}>Create Request</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress - Step 2 of 5 */}
      <ProgressBar currentStep={1} totalSteps={5} />

      {/* Service Info */}
      <View style={styles.serviceInfo}>
        <View style={styles.serviceIconContainer}>
          <Ionicons name="construct-outline" size={24} color={colors.primary[500]} />
        </View>
        <View style={styles.serviceDetails}>
          <Text style={styles.serviceName}>{selectedService?.name}</Text>
          <Text style={styles.serviceDescription}>
            Answer a few questions to help professionals understand your needs
          </Text>
        </View>
      </View>

      {/* Questions */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {questionnaire?.questions.map((question) => renderQuestion(question))}

        {/* Spacer for footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressInfoText}>
            {answeredRequired.length} of {requiredQuestions.length} required questions answered
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !allRequiredAnswered && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!allRequiredAnswered}
        >
          <Text
            style={[
              styles.continueButtonText,
              !allRequiredAnswered && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={allRequiredAnswered ? '#fff' : colors.text.tertiary}
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
    width: 60,
  },
  skipButton: {
    padding: spacing[2],
  },
  skipText: {
    ...textStyles.body,
    color: colors.primary[500],
    fontWeight: '600',
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
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[50],
    marginHorizontal: layout.screenPadding,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceDetails: {
    flex: 1,
    marginLeft: spacing[3],
  },
  serviceName: {
    ...textStyles.label,
    color: colors.primary[700],
    marginBottom: spacing[1],
  },
  serviceDescription: {
    ...textStyles.caption,
    color: colors.primary[600],
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
  },
  questionContainer: {
    marginBottom: spacing[6],
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  questionText: {
    ...textStyles.h4,
    color: colors.text.primary,
    flex: 1,
  },
  requiredBadge: {
    ...textStyles.caption,
    color: colors.error[600],
    backgroundColor: colors.error[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    marginLeft: spacing[2],
    fontWeight: '600',
  },
  helpText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  multiSelectHint: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[3],
    fontStyle: 'italic',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing[1],
  },
  optionCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: spacing[2],
  },
  optionLabel: {
    ...textStyles.bodySmall,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: colors.primary[700],
  },
  checkIcon: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[4],
    ...textStyles.body,
    color: colors.text.primary,
    minHeight: 120,
  },
  numberInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[4],
    ...textStyles.body,
    color: colors.text.primary,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  progressInfo: {
    marginBottom: spacing[3],
  },
  progressInfoText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
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

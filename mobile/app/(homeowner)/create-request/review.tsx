/**
 * Review & Submit Screen
 * Step 4 (final) of the create request flow
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
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
import { createLead } from '../../../src/services/leads';

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

// Review section component
function ReviewSection({
  title,
  value,
  icon,
  onEdit,
}: {
  title: string;
  value: string;
  icon: string;
  onEdit: () => void;
}) {
  return (
    <View style={styles.reviewSection}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewTitleContainer}>
          <Ionicons name={icon as any} size={18} color={colors.primary[500]} />
          <Text style={styles.reviewTitle}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Ionicons name="pencil" size={16} color={colors.primary[600]} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

export default function ReviewScreen() {
  const {
    selectedService,
    title,
    description,
    emirate,
    neighborhood,
    budgetBracket,
    urgency,
    photos,
    isSubmitting,
    setSubmitting,
    getFormData,
    reset,
  } = useLeadFormStore();

  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    const formData = getFormData();

    if (!formData) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const lead = await createLead(formData);

      // Reset form after successful submission
      reset();

      // Navigate to success screen or requests list
      Alert.alert(
        'Request Submitted!',
        'Your service request has been posted. Professionals will start sending you quotes soon.',
        [
          {
            text: 'View My Requests',
            onPress: () => router.replace('/(homeowner)/(tabs)/requests'),
          },
        ]
      );
    } catch (err: any) {
      console.error('Error creating lead:', err);
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEmirate = EMIRATES.find((e) => e.id === emirate);
  const selectedBudget = BUDGET_BRACKETS.find((b) => b.id === budgetBracket);
  const selectedUrgency = URGENCY_LEVELS.find((u) => u.id === urgency);

  const goToStep = (step: number) => {
    // Navigate back to appropriate step
    if (step === 0) {
      router.push('/(homeowner)/create-request/');
    } else if (step === 1) {
      router.push('/(homeowner)/create-request/details');
    } else if (step === 2) {
      router.push('/(homeowner)/create-request/photos');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Request</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress */}
      <ProgressBar currentStep={3} totalSteps={4} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Review your request</Text>
          <Text style={styles.pageSubtitle}>
            Make sure everything looks good before submitting
          </Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={colors.error[500]} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Service */}
        <ReviewSection
          title="Service"
          value={selectedService?.name || 'Not selected'}
          icon="construct-outline"
          onEdit={() => goToStep(0)}
        />

        {/* Title & Description */}
        <View style={styles.reviewSection}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewTitleContainer}>
              <Ionicons name="document-text-outline" size={18} color={colors.primary[500]} />
              <Text style={styles.reviewTitle}>Project Details</Text>
            </View>
            <TouchableOpacity onPress={() => goToStep(1)} style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={colors.primary[600]} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.projectTitle}>{title || 'No title'}</Text>
          <Text style={styles.projectDescription}>{description || 'No description'}</Text>
        </View>

        {/* Location */}
        <ReviewSection
          title="Location"
          value={
            selectedEmirate
              ? neighborhood
                ? `${selectedEmirate.name}, ${neighborhood}`
                : selectedEmirate.name
              : 'Not selected'
          }
          icon="location-outline"
          onEdit={() => goToStep(1)}
        />

        {/* Budget */}
        <ReviewSection
          title="Budget"
          value={selectedBudget?.label || 'Not selected'}
          icon="cash-outline"
          onEdit={() => goToStep(1)}
        />

        {/* Urgency */}
        <ReviewSection
          title="Urgency"
          value={
            selectedUrgency
              ? `${selectedUrgency.label} - ${selectedUrgency.description}`
              : 'Not selected'
          }
          icon="time-outline"
          onEdit={() => goToStep(1)}
        />

        {/* Photos */}
        <View style={styles.reviewSection}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewTitleContainer}>
              <Ionicons name="camera-outline" size={18} color={colors.primary[500]} />
              <Text style={styles.reviewTitle}>Photos ({photos.length})</Text>
            </View>
            <TouchableOpacity onPress={() => goToStep(2)} style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={colors.primary[600]} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          {photos.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosRow}
            >
              {photos.map((url, index) => (
                <Image key={url} source={{ uri: url }} style={styles.photoThumbnail} />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noPhotosText}>No photos added</Text>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={colors.primary[500]} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <Text style={styles.infoText}>
              Once you submit, your request will be visible to qualified professionals. They can
              claim your lead and send you quotes. You'll receive notifications when new quotes
              arrive.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Request</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>
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
  titleSection: {
    marginBottom: spacing[6],
  },
  pageTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  pageSubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[50],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error[700],
    flex: 1,
  },
  reviewSection: {
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  reviewTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  reviewTitle: {
    ...textStyles.label,
    color: colors.text.secondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[1],
  },
  editButtonText: {
    ...textStyles.caption,
    color: colors.primary[600],
    fontWeight: '600',
  },
  reviewValue: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  projectTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  projectDescription: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  photosRow: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingTop: spacing[2],
  },
  photoThumbnail: {
    width: 80,
    height: 60,
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  noPhotosText: {
    ...textStyles.body,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginTop: spacing[3],
    gap: spacing[3],
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...textStyles.label,
    color: colors.primary[700],
    marginBottom: spacing[1],
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.primary[600],
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
  },
  submitButtonDisabled: {
    backgroundColor: colors.success[300],
  },
  submitButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
});

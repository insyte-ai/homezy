/**
 * Pro Agreement Screen
 * Displays the pro agreement and requires acceptance before accessing the app
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { Button } from '../../../src/components/ui';
import { acceptAgreement } from '../../../src/services/pro';
import { useAuthStore } from '../../../src/store/authStore';

const PRO_AGREEMENT_VERSION = '1.0';

export default function ProAgreementScreen() {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchCurrentUser } = useAuthStore();

  const handleAccept = async () => {
    if (!isAccepted) {
      Alert.alert('Agreement Required', 'Please accept the Pro Agreement to continue.');
      return;
    }

    setIsLoading(true);
    try {
      await acceptAgreement({
        accepted: true,
        version: PRO_AGREEMENT_VERSION,
      });

      // Refresh user data to get updated agreement status
      await fetchCurrentUser();

      // Navigate to pro dashboard
      router.replace('/(pro)/(tabs)');
    } catch (error: any) {
      console.error('Failed to accept agreement:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to accept agreement. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openFullAgreement = () => {
    // Open the full agreement in a web browser
    Linking.openURL('https://homezy.co/pro/agreement');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={40} color={colors.primary[600]} />
          </View>
          <Text style={styles.title}>Pro Agreement</Text>
          <Text style={styles.subtitle}>
            Please review and accept the Homezy Professional Participation Agreement to continue.
          </Text>
        </View>

        {/* Agreement Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Key Terms</Text>

          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
            <Text style={styles.summaryText}>
              Free listing on Homezy.co - no subscription fees
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
            <Text style={styles.summaryText}>
              Credit-based lead claiming system with transparent pricing
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
            <Text style={styles.summaryText}>
              Direct communication with homeowners after lead claim
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="alert-circle" size={20} color={colors.warning[500]} />
            <Text style={styles.summaryText}>
              Credits are non-refundable once a lead is claimed
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary[500]} />
            <Text style={styles.summaryText}>
              Your data is protected under UAE data protection laws
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="business" size={20} color={colors.primary[500]} />
            <Text style={styles.summaryText}>
              Governed by UAE law, Dubai courts jurisdiction
            </Text>
          </View>
        </View>

        {/* Read Full Agreement Link */}
        <TouchableOpacity style={styles.linkButton} onPress={openFullAgreement}>
          <Ionicons name="open-outline" size={20} color={colors.primary[600]} />
          <Text style={styles.linkText}>Read Full Agreement</Text>
        </TouchableOpacity>

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsAccepted(!isAccepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isAccepted && styles.checkboxChecked]}>
            {isAccepted && (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and agree to the{' '}
            <Text style={styles.linkInline} onPress={openFullAgreement}>
              Homezy Pro Agreement
            </Text>
            {' '}(Version {PRO_AGREEMENT_VERSION})
          </Text>
        </TouchableOpacity>

        {/* Accept Button */}
        <Button
          title="Accept and Continue"
          onPress={handleAccept}
          loading={isLoading}
          disabled={!isAccepted || isLoading}
          fullWidth
          style={styles.acceptButton}
        />

        {/* Version Info */}
        <Text style={styles.versionText}>
          Agreement Version {PRO_AGREEMENT_VERSION} | Last Updated: December 2024
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[5],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  summaryTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  summaryText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    marginBottom: spacing[4],
  },
  linkText: {
    ...textStyles.body,
    color: colors.primary[600],
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[4],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  checkboxLabel: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  linkInline: {
    color: colors.primary[600],
    textDecorationLine: 'underline',
  },
  acceptButton: {
    marginBottom: spacing[4],
  },
  versionText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

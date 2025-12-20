/**
 * Verification Status Screen
 * Shows verification status and document requirements
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getMyProfile, ProProfile } from '../../../src/services/pro';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG: Record<VerificationStatus | 'unverified', {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  title: string;
  description: string;
}> = {
  unverified: {
    icon: 'shield-outline',
    color: colors.neutral[600],
    bgColor: colors.neutral[100],
    title: 'Not Verified',
    description: 'Submit your documents to get verified and build trust with homeowners.',
  },
  pending: {
    icon: 'time',
    color: colors.warning[600],
    bgColor: colors.warning[50],
    title: 'Verification Pending',
    description: 'Your documents are being reviewed. This usually takes 1-3 business days.',
  },
  approved: {
    icon: 'shield-checkmark',
    color: colors.success[600],
    bgColor: colors.success[50],
    title: 'Verified',
    description: 'Your documents have been verified. You get 15% discount on lead claims!',
  },
  rejected: {
    icon: 'close-circle',
    color: colors.error[600],
    bgColor: colors.error[50],
    title: 'Verification Rejected',
    description: 'There was an issue with your documents. Please resubmit.',
  },
};

interface DocumentItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  status: 'required' | 'pending' | 'verified' | 'missing';
  onUpload: () => void;
}

function DocumentItem({ icon, title, description, status, onUpload }: DocumentItemProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'verified':
        return { icon: 'checkmark-circle', color: colors.success[500], text: 'Verified' };
      case 'pending':
        return { icon: 'time', color: colors.warning[500], text: 'Pending' };
      case 'missing':
        return { icon: 'alert-circle', color: colors.error[500], text: 'Missing' };
      default:
        return { icon: 'add-circle', color: colors.primary[500], text: 'Upload' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <TouchableOpacity onPress={onUpload} disabled={status === 'verified' || status === 'pending'}>
      <Card style={styles.documentCard}>
        <View style={styles.documentIcon}>
          <Ionicons name={icon} size={24} color={colors.primary[500]} />
        </View>
        <View style={styles.documentContent}>
          <Text style={styles.documentTitle}>{title}</Text>
          <Text style={styles.documentDescription}>{description}</Text>
        </View>
        <View style={[styles.documentStatus, { backgroundColor: statusInfo.color + '15' }]}>
          <Ionicons name={statusInfo.icon as keyof typeof Ionicons.glyphMap} size={16} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function VerificationScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data.profile);
    } catch (error) {
      Alert.alert('Error', 'Failed to load verification status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = (docType: string) => {
    // TODO: Implement document upload
    Alert.alert('Coming Soon', `Upload ${docType} functionality will be available soon.`);
  };

  const handleStartVerification = () => {
    Alert.alert('Coming Soon', 'Document upload functionality will be available soon.');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Verification</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  const status = (profile?.verificationStatus || 'unverified') as VerificationStatus | 'unverified';
  const statusConfig = STATUS_CONFIG[status];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Verification</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <Card style={[styles.statusCard, { backgroundColor: statusConfig.bgColor }]}>
          <View style={styles.statusIconContainer}>
            <Ionicons name={statusConfig.icon} size={48} color={statusConfig.color} />
          </View>
          <Text style={[styles.statusTitle, { color: statusConfig.color }]}>
            {statusConfig.title}
          </Text>
          <Text style={styles.statusDescription}>{statusConfig.description}</Text>
        </Card>

        {/* Benefits */}
        <Card style={styles.benefitsCard}>
          <Text style={styles.sectionTitle}>Why Get Verified?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
              <Text style={styles.benefitText}>Appear higher in search results</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
              <Text style={styles.benefitText}>Display verified badge on your profile</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
              <Text style={styles.benefitText}>Build trust with homeowners</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
              <Text style={styles.benefitText}>Access to premium leads</Text>
            </View>
          </View>
        </Card>

        {/* Documents Section */}
        <Text style={styles.sectionHeader}>Required Documents</Text>

        <DocumentItem
          icon="card-outline"
          title="Emirates ID"
          description="Front and back of your Emirates ID"
          status={status === 'approved' ? 'verified' : status === 'pending' ? 'pending' : 'required'}
          onUpload={() => handleUpload('Emirates ID')}
        />

        <DocumentItem
          icon="document-text-outline"
          title="Trade License"
          description="Valid trade license for your business"
          status={status === 'approved' ? 'verified' : status === 'pending' ? 'pending' : 'required'}
          onUpload={() => handleUpload('Trade License')}
        />

        <DocumentItem
          icon="shield-checkmark-outline"
          title="Insurance Certificate"
          description="Proof of liability insurance (optional)"
          status={status === 'approved' ? 'verified' : 'missing'}
          onUpload={() => handleUpload('Insurance')}
        />

        <DocumentItem
          icon="ribbon-outline"
          title="Professional Certifications"
          description="Industry certifications (optional)"
          status="missing"
          onUpload={() => handleUpload('Certifications')}
        />

        {(status !== 'approved' && status !== 'pending') && (
          <View style={styles.buttonContainer}>
            <Button
              title="Start Verification"
              onPress={handleStartVerification}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: layout.screenPadding,
    gap: spacing[3],
    paddingBottom: spacing[8],
  },
  statusCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  statusIconContainer: {
    marginBottom: spacing[3],
  },
  statusTitle: {
    ...textStyles.h4,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  statusDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  benefitsCard: {
    padding: spacing[4],
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  benefitsList: {
    gap: spacing[2],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  benefitText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  sectionHeader: {
    ...textStyles.label,
    color: colors.text.primary,
    marginTop: spacing[2],
    marginBottom: spacing[1],
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  documentTitle: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  documentDescription: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: spacing[4],
  },
});

/**
 * Verification Status Screen
 * Shows verification status and document requirements with upload functionality
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Card, Button } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import {
  getMyProfile,
  ProProfile,
  VerificationDocument,
  getVerificationDocuments,
  uploadVerificationDocument,
  deleteVerificationDocument,
  submitVerification,
} from '../../../src/services/pro';

type VerificationStatus = 'pending' | 'approved' | 'rejected';
type DocumentType = 'emirates_id' | 'trade_license' | 'insurance' | 'certification';

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
    description: 'Your documents have been verified. Your business is now verified!',
  },
  rejected: {
    icon: 'close-circle',
    color: colors.error[600],
    bgColor: colors.error[50],
    title: 'Verification Rejected',
    description: 'There was an issue with your documents. Please resubmit.',
  },
};

const DOCUMENT_CONFIG: Record<DocumentType, {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  required: boolean;
}> = {
  emirates_id: {
    icon: 'card-outline',
    title: 'Emirates ID',
    description: 'Front and back of your Emirates ID',
    required: true,
  },
  trade_license: {
    icon: 'document-text-outline',
    title: 'Trade License',
    description: 'Valid trade license for your business',
    required: true,
  },
  insurance: {
    icon: 'shield-checkmark-outline',
    title: 'Insurance Certificate',
    description: 'Proof of liability insurance (optional)',
    required: false,
  },
  certification: {
    icon: 'ribbon-outline',
    title: 'Professional Certifications',
    description: 'Industry certifications (optional)',
    required: false,
  },
};

interface DocumentItemProps {
  type: DocumentType;
  document?: VerificationDocument;
  profileStatus: VerificationStatus | 'unverified';
  uploading: boolean;
  uploadProgress: number;
  onUpload: () => void;
  onDelete: () => void;
}

function DocumentItem({
  type,
  document,
  profileStatus,
  uploading,
  uploadProgress,
  onUpload,
  onDelete,
}: DocumentItemProps) {
  const config = DOCUMENT_CONFIG[type];

  const getStatusInfo = () => {
    if (uploading) {
      return { icon: 'cloud-upload', color: colors.primary[500], text: `${uploadProgress}%` };
    }
    if (!document) {
      return { icon: 'add-circle', color: colors.primary[500], text: 'Upload' };
    }
    switch (document.status) {
      case 'approved':
        return { icon: 'checkmark-circle', color: colors.success[500], text: 'Verified' };
      case 'pending':
        return { icon: 'time', color: colors.warning[500], text: 'Pending' };
      case 'rejected':
        return { icon: 'alert-circle', color: colors.error[500], text: 'Rejected' };
      default:
        return { icon: 'add-circle', color: colors.primary[500], text: 'Upload' };
    }
  };

  const statusInfo = getStatusInfo();
  const canUpload = !document || document.status === 'rejected';
  const canDelete = document && document.status !== 'approved' && profileStatus !== 'approved';

  return (
    <Card style={styles.documentCard}>
      <View style={styles.documentIcon}>
        <Ionicons name={config.icon} size={24} color={colors.primary[500]} />
      </View>
      <View style={styles.documentContent}>
        <View style={styles.documentHeader}>
          <Text style={styles.documentTitle}>{config.title}</Text>
          {config.required && <Text style={styles.requiredBadge}>Required</Text>}
        </View>
        <Text style={styles.documentDescription}>{config.description}</Text>
        {document?.rejectionReason && (
          <Text style={styles.rejectionReason}>{document.rejectionReason}</Text>
        )}
        {uploading && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
          </View>
        )}
      </View>
      <View style={styles.documentActions}>
        {canUpload && !uploading && (
          <TouchableOpacity
            style={[styles.documentStatus, { backgroundColor: statusInfo.color + '15' }]}
            onPress={onUpload}
          >
            <Ionicons
              name={statusInfo.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={statusInfo.color}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </TouchableOpacity>
        )}
        {uploading && (
          <View style={[styles.documentStatus, { backgroundColor: colors.primary[50] }]}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={[styles.statusText, { color: colors.primary[500] }]}>
              {uploadProgress}%
            </Text>
          </View>
        )}
        {!canUpload && !uploading && (
          <View style={[styles.documentStatus, { backgroundColor: statusInfo.color + '15' }]}>
            <Ionicons
              name={statusInfo.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={statusInfo.color}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        )}
        {canDelete && !uploading && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color={colors.error[500]} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

export default function VerificationScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProProfile | null>(null);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, docsData] = await Promise.all([
        getMyProfile(),
        getVerificationDocuments().catch(() => [] as VerificationDocument[]),
      ]);
      setProfile(profileData.profile);
      setDocuments(docsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load verification status');
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentForType = (type: DocumentType): VerificationDocument | undefined => {
    return documents.find((doc) => doc.type === type);
  };

  const handleUploadPress = (type: DocumentType) => {
    setSelectedType(type);
    setShowUploadModal(true);
  };

  const handlePickDocument = async () => {
    if (!selectedType) return;
    setShowUploadModal(false);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];
      await uploadDocument(selectedType, {
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType || 'application/octet-stream',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick document');
    }
  };

  const handleTakePhoto = async () => {
    if (!selectedType) return;
    setShowUploadModal(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const fileName = `${selectedType}_${Date.now()}.jpg`;
      await uploadDocument(selectedType, {
        uri: asset.uri,
        name: fileName,
        mimeType: 'image/jpeg',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to take photo');
    }
  };

  const handlePickImage = async () => {
    if (!selectedType) return;
    setShowUploadModal(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library permission is needed to select images.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const fileName = `${selectedType}_${Date.now()}.jpg`;
      await uploadDocument(selectedType, {
        uri: asset.uri,
        name: fileName,
        mimeType: 'image/jpeg',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const uploadDocument = async (
    type: DocumentType,
    file: { uri: string; name: string; mimeType: string }
  ) => {
    setUploadingType(type);
    setUploadProgress(0);

    try {
      const doc = await uploadVerificationDocument(type, file, (progress) => {
        setUploadProgress(progress);
      });
      setDocuments((prev) => {
        const filtered = prev.filter((d) => d.type !== type);
        return [...filtered, doc];
      });
      Alert.alert('Success', 'Document uploaded successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload document');
    } finally {
      setUploadingType(null);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = (type: DocumentType) => {
    const doc = getDocumentForType(type);
    if (!doc) return;

    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVerificationDocument(doc.id);
              setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const handleSubmitVerification = async () => {
    const hasEmiratesId = getDocumentForType('emirates_id');
    const hasTradeLicense = getDocumentForType('trade_license');

    if (!hasEmiratesId || !hasTradeLicense) {
      Alert.alert(
        'Missing Documents',
        'Please upload both Emirates ID and Trade License before submitting for verification.'
      );
      return;
    }

    Alert.alert(
      'Submit Verification',
      'Are you ready to submit your documents for verification? This usually takes 1-3 business days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setSubmitting(true);
            try {
              await submitVerification();
              await loadData();
              Alert.alert('Success', 'Your verification request has been submitted!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to submit verification');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
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
  const canSubmit = status !== 'approved' && status !== 'pending';

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

        {(['emirates_id', 'trade_license', 'insurance', 'certification'] as DocumentType[]).map(
          (type) => (
            <DocumentItem
              key={type}
              type={type}
              document={getDocumentForType(type)}
              profileStatus={status}
              uploading={uploadingType === type}
              uploadProgress={uploadProgress}
              onUpload={() => handleUploadPress(type)}
              onDelete={() => handleDeleteDocument(type)}
            />
          )
        )}

        {canSubmit && (
          <View style={styles.buttonContainer}>
            <Button
              title={submitting ? 'Submitting...' : 'Submit for Verification'}
              onPress={handleSubmitVerification}
              loading={submitting}
              fullWidth
            />
          </View>
        )}
      </ScrollView>

      {/* Upload Options Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Document</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Choose how you want to add your {selectedType && DOCUMENT_CONFIG[selectedType].title}
            </Text>
            <View style={styles.uploadOptions}>
              <TouchableOpacity style={styles.uploadOption} onPress={handleTakePhoto}>
                <View style={styles.uploadOptionIcon}>
                  <Ionicons name="camera" size={32} color={colors.primary[500]} />
                </View>
                <Text style={styles.uploadOptionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadOption} onPress={handlePickImage}>
                <View style={styles.uploadOptionIcon}>
                  <Ionicons name="images" size={32} color={colors.primary[500]} />
                </View>
                <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadOption} onPress={handlePickDocument}>
                <View style={styles.uploadOptionIcon}>
                  <Ionicons name="document" size={32} color={colors.primary[500]} />
                </View>
                <Text style={styles.uploadOptionText}>Upload PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  documentTitle: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  requiredBadge: {
    ...textStyles.caption,
    color: colors.error[500],
    fontSize: 10,
  },
  documentDescription: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  rejectionReason: {
    ...textStyles.caption,
    color: colors.error[500],
    marginTop: spacing[1],
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    marginTop: spacing[2],
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
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
  deleteButton: {
    padding: spacing[1],
  },
  buttonContainer: {
    marginTop: spacing[4],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: spacing[4],
  },
  modalSubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  uploadOptions: {
    gap: spacing[3],
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    gap: spacing[4],
  },
  uploadOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOptionText: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
});

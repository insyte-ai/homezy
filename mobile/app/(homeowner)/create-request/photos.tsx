/**
 * Photo Upload Screen
 * Step 3 of the create request flow
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
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useLeadFormStore } from '../../../src/store/leadFormStore';
import { api } from '../../../src/services/api';

const MAX_PHOTOS = 5;

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

export default function PhotosScreen() {
  const { photos, addPhoto, removePhoto } = useLeadFormStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push('/(homeowner)/create-request/review');
  };

  const handleSkip = () => {
    router.push('/(homeowner)/create-request/review');
  };

  const requestPermission = async (type: 'camera' | 'library') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      // Create form data
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      // Upload to server
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const pickImage = async (source: 'camera' | 'library') => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit Reached', `You can upload a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }

    const hasPermission = await requestPermission(source);
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        `Please grant ${source === 'camera' ? 'camera' : 'photo library'} access in settings.`
      );
      return;
    }

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      };

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);

        const uploadedUrl = await uploadImage(result.assets[0].uri);

        if (uploadedUrl) {
          addPhoto(uploadedUrl);
        } else {
          Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
        }

        setIsUploading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setIsUploading(false);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const showImagePicker = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: () => pickImage('camera') },
      { text: 'Choose from Library', onPress: () => pickImage('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemovePhoto = (url: string) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePhoto(url) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Photos</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <ProgressBar currentStep={2} totalSteps={4} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info */}
        <View style={styles.infoSection}>
          <Ionicons name="camera-outline" size={48} color={colors.primary[500]} />
          <Text style={styles.infoTitle}>Add photos of your project</Text>
          <Text style={styles.infoSubtitle}>
            Photos help professionals understand your project better and provide more accurate quotes
          </Text>
        </View>

        {/* Photos Grid */}
        <View style={styles.photosGrid}>
          {photos.map((url, index) => (
            <View key={url} style={styles.photoContainer}>
              <Image source={{ uri: url }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePhoto(url)}
              >
                <Ionicons name="close-circle" size={24} color={colors.error[500]} />
              </TouchableOpacity>
            </View>
          ))}

          {photos.length < MAX_PHOTOS && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={showImagePicker}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="large" color={colors.primary[500]} />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={40} color={colors.primary[500]} />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Photo count */}
        <Text style={styles.photoCount}>
          {photos.length} of {MAX_PHOTOS} photos added
        </Text>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for great photos:</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
            <Text style={styles.tipText}>Show the entire area that needs work</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
            <Text style={styles.tipText}>Include close-ups of any damage or issues</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
            <Text style={styles.tipText}>Take photos in good lighting</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
            <Text style={styles.tipText}>Include reference photos if you have a specific style in mind</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>
            {photos.length > 0 ? 'Continue' : 'Skip & Continue'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  skipButton: {
    padding: spacing[2],
  },
  skipButtonText: {
    ...textStyles.body,
    color: colors.primary[600],
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing[4],
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  infoTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  infoSubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  photoContainer: {
    width: '47%',
    aspectRatio: 4 / 3,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    backgroundColor: 'white',
    borderRadius: borderRadius.full,
  },
  addPhotoButton: {
    width: '47%',
    aspectRatio: 4 / 3,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    ...textStyles.label,
    color: colors.primary[600],
    marginTop: spacing[2],
  },
  photoCount: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  tipsContainer: {
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  tipsTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  tipText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
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

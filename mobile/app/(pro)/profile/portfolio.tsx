/**
 * Portfolio Screen
 * Allows professionals to manage their portfolio of work
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
  Image,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Card, Button, EmptyState, Input } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getMyProfile, deletePortfolioItem, addPortfolioItem, PortfolioItem } from '../../../src/services/pro';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - layout.screenPadding * 2 - spacing[3] * 2) / 3;

function PortfolioCard({
  item,
  onDelete,
}: {
  item: PortfolioItem;
  onDelete: () => void;
}) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Card style={styles.portfolioCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color={colors.error[500]} />
          </TouchableOpacity>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.images && item.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesScroll}
        >
          {item.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.portfolioImage}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.metaRow}>
        {item.budget && (
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.metaText}>{item.budget}</Text>
          </View>
        )}
        {item.duration && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>
        )}
        {item.completedAt && (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.metaText}>
              {new Date(item.completedAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Painting',
  'Flooring',
  'Roofing',
  'Landscaping',
  'Renovation',
  'Other',
];

export default function PortfolioScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  // Add Project Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [projectDuration, setProjectDuration] = useState('');
  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const data = await getMyProfile();
      setPortfolio(data.profile.portfolio || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deletePortfolioItem(itemId);
      setPortfolio(portfolio.filter((item) => item.id !== itemId));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete portfolio item');
    }
  };

  const handleAddProject = () => {
    resetForm();
    setShowAddModal(true);
  };

  const resetForm = () => {
    setProjectTitle('');
    setProjectCategory('');
    setProjectDescription('');
    setProjectBudget('');
    setProjectDuration('');
    setProjectImages([]);
  };

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access in settings to add images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - projectImages.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setProjectImages([...projectImages, ...newImages].slice(0, 5));
    }
  };

  const handleRemoveImage = (index: number) => {
    setProjectImages(projectImages.filter((_, i) => i !== index));
  };

  const handleSaveProject = async () => {
    if (!projectTitle.trim()) {
      Alert.alert('Error', 'Please enter a project title');
      return;
    }
    if (!projectCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setIsSaving(true);
    try {
      const newItem = await addPortfolioItem({
        title: projectTitle.trim(),
        category: projectCategory,
        description: projectDescription.trim() || undefined,
        budget: projectBudget.trim() || undefined,
        duration: projectDuration.trim() || undefined,
        images: projectImages,
      });

      setPortfolio([newItem, ...portfolio]);
      setShowAddModal(false);
      Alert.alert('Success', 'Project added to your portfolio');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Portfolio</Text>
        <TouchableOpacity onPress={handleAddProject} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : portfolio.length === 0 ? (
        <EmptyState
          icon="images-outline"
          title="No Projects Yet"
          description="Showcase your work by adding projects to your portfolio. This helps homeowners see your experience."
          actionLabel="Add Your First Project"
          onAction={handleAddProject}
        />
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
            <Text style={styles.infoText}>
              Your portfolio helps homeowners see your past work and make hiring decisions.
            </Text>
          </View>

          {portfolio.map((item) => (
            <PortfolioCard
              key={item.id}
              item={item}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </ScrollView>
      )}

      {/* Add Project Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Project</Text>
            <View style={{ width: 60 }} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentInner}>
              <Input
                label="Project Title"
                placeholder="e.g., Kitchen Renovation"
                value={projectTitle}
                onChangeText={setProjectTitle}
                required
              />

              <Text style={styles.inputLabel}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      projectCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setProjectCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        projectCategory === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Input
                label="Description"
                placeholder="Describe the project, challenges, and solutions..."
                value={projectDescription}
                onChangeText={setProjectDescription}
                multiline
                numberOfLines={3}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Budget"
                    placeholder="e.g., AED 15,000"
                    value={projectBudget}
                    onChangeText={setProjectBudget}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Duration"
                    placeholder="e.g., 2 weeks"
                    value={projectDuration}
                    onChangeText={setProjectDuration}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Project Photos</Text>
              <Text style={styles.inputHint}>Add up to 5 photos of your work</Text>

              <View style={styles.imagesGrid}>
                {projectImages.map((uri, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.error[500]} />
                    </TouchableOpacity>
                  </View>
                ))}
                {projectImages.length < 5 && (
                  <TouchableOpacity style={styles.addImageButton} onPress={handlePickImages}>
                    <Ionicons name="camera-outline" size={28} color={colors.primary[500]} />
                    <Text style={styles.addImageText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Button
                title="Save Project"
                onPress={handleSaveProject}
                loading={isSaving}
                fullWidth
                style={styles.saveButton}
              />
            </ScrollView>
          </KeyboardAvoidingView>
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
  addButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
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
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    gap: spacing[2],
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.primary[700],
    flex: 1,
  },
  portfolioCard: {
    padding: spacing[4],
  },
  cardHeader: {
    marginBottom: spacing[2],
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  cardTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing[2],
  },
  deleteButton: {
    padding: spacing[1],
  },
  categoryBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  categoryText: {
    ...textStyles.caption,
    color: colors.primary[600],
    fontWeight: '500',
  },
  description: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  imagesScroll: {
    marginBottom: spacing[3],
    marginHorizontal: -spacing[4],
    paddingHorizontal: spacing[4],
  },
  portfolioImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: borderRadius.md,
    marginRight: spacing[2],
    backgroundColor: colors.neutral[200],
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
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
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalCancel: {
    ...textStyles.body,
    color: colors.primary[600],
  },
  modalTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  modalContent: {
    flex: 1,
  },
  modalContentInner: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  inputLabel: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  inputHint: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  categoryScroll: {
    marginBottom: spacing[4],
    marginHorizontal: -spacing[4],
    paddingHorizontal: spacing[4],
  },
  categoryChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    marginRight: spacing[2],
  },
  categoryChipActive: {
    backgroundColor: colors.primary[500],
  },
  categoryChipText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  categoryChipTextActive: {
    color: colors.background.primary,
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  imagePreview: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral[200],
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    backgroundColor: colors.background.primary,
    borderRadius: 12,
  },
  addImageButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    ...textStyles.caption,
    color: colors.primary[600],
    marginTop: spacing[1],
  },
  saveButton: {
    marginTop: spacing[4],
  },
});

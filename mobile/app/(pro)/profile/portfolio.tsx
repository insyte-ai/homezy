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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, EmptyState } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getMyProfile, deletePortfolioItem, PortfolioItem } from '../../../src/services/pro';

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

export default function PortfolioScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

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
    // TODO: Navigate to add project screen
    Alert.alert('Coming Soon', 'Add project functionality will be available soon.');
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
});

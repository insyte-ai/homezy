/**
 * Pro Card Component
 * Displays a professional's summary card in the browse list
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';
import { VerificationBadges } from './VerificationBadges';
import { ProfileStats } from './ProfileStats';
import { SearchResultPro } from '../../services/pro';
import { Button } from '../ui';

interface ProCardProps {
  professional: SearchResultPro;
  onViewProfile: () => void;
  onRequestQuote: () => void;
}

export function ProCard({ professional, onViewProfile, onRequestQuote }: ProCardProps) {
  const { businessName, profilePhoto, proProfile } = professional;
  const {
    tagline,
    verificationStatus,
    rating,
    reviewCount,
    categories,
    serviceAreas,
    yearsInBusiness,
  } = proProfile;

  // Get display categories (max 2)
  const displayCategories = categories?.slice(0, 2) || [];
  const extraCategories = categories?.length > 2 ? categories.length - 2 : 0;

  // Extract emirate names from service areas
  const serviceAreaNames = serviceAreas?.map(area => area.emirate) || [];

  // Format category name for display
  const formatCategory = (category: string): string => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <View style={styles.container}>
      {/* Header: Photo + Name + Verification */}
      <View style={styles.header}>
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="business" size={24} color={colors.text.tertiary} />
          </View>
        )}
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.businessName} numberOfLines={1}>
              {businessName}
            </Text>
            <VerificationBadges
              verificationStatus={verificationStatus as 'pending' | 'approved' | 'rejected'}
              size="sm"
              showLabel={false}
            />
          </View>
          {tagline && (
            <Text style={styles.tagline} numberOfLines={2}>
              {tagline}
            </Text>
          )}
        </View>
      </View>

      {/* Stats */}
      <ProfileStats
        rating={rating}
        reviewCount={reviewCount}
        compact
      />

      {/* Years in Business */}
      {yearsInBusiness != null && yearsInBusiness > 0 && (
        <View style={styles.yearsContainer}>
          <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.yearsText}>
            {yearsInBusiness} year{yearsInBusiness !== 1 ? 's' : ''} in business
          </Text>
        </View>
      )}

      {/* Categories */}
      {displayCategories.length > 0 ? (
        <View style={styles.categoriesContainer}>
          {displayCategories.map((category, index) => (
            <View key={index} style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{formatCategory(category)}</Text>
            </View>
          ))}
          {extraCategories > 0 ? (
            <Text style={styles.extraCategories}>+{extraCategories} more</Text>
          ) : null}
        </View>
      ) : null}

      {/* Service Areas */}
      {serviceAreaNames.length > 0 ? (
        <View style={styles.areasContainer}>
          <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.areasText} numberOfLines={1}>
            {serviceAreaNames.slice(0, 3).join(', ')}
            {serviceAreaNames.length > 3 ? ` +${serviceAreaNames.length - 3}` : ''}
          </Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.viewProfileButton} onPress={onViewProfile}>
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
        <Button
          title="Request Quote"
          onPress={onRequestQuote}
          size="sm"
          style={styles.requestQuoteButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing[3],
  },
  header: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
  },
  photoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: spacing[1],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  businessName: {
    ...textStyles.h4,
    color: colors.text.primary,
    flex: 1,
  },
  tagline: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  yearsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  yearsText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    ...textStyles.caption,
    color: colors.primary[700],
    fontWeight: '500',
  },
  extraCategories: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  areasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  areasText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[1],
  },
  viewProfileButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileText: {
    ...textStyles.button,
    color: colors.text.primary,
  },
  requestQuoteButton: {
    flex: 1,
  },
});

export default ProCard;

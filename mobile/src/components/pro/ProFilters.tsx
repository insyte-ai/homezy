/**
 * Pro Filters Component
 * Filter controls for browsing professionals
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';
import { Button } from '../ui';

// UAE Emirates
const EMIRATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
];

// Common service categories
const CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'hvac', name: 'HVAC / AC' },
  { id: 'painting', name: 'Painting' },
  { id: 'carpentry', name: 'Carpentry' },
  { id: 'flooring', name: 'Flooring' },
  { id: 'home-cleaning', name: 'Home Cleaning' },
  { id: 'handyman', name: 'Handyman' },
  { id: 'landscaping', name: 'Landscaping' },
  { id: 'pest-control', name: 'Pest Control' },
  { id: 'kitchen-remodelling', name: 'Kitchen Remodeling' },
  { id: 'bathroom-remodelling', name: 'Bathroom Remodeling' },
];

// Rating options
const RATING_OPTIONS = [
  { value: null, label: 'All Ratings' },
  { value: 4.5, label: '4.5+ Stars' },
  { value: 4.0, label: '4.0+ Stars' },
  { value: 3.5, label: '3.5+ Stars' },
];

interface ProFiltersProps {
  selectedCategory: string | null;
  selectedEmirate: string | null;
  minRating: number | null;
  onCategoryChange: (category: string | null) => void;
  onEmirateChange: (emirate: string | null) => void;
  onRatingChange: (rating: number | null) => void;
  onReset: () => void;
  resultCount?: number;
}

export function ProFilters({
  selectedCategory,
  selectedEmirate,
  minRating,
  onCategoryChange,
  onEmirateChange,
  onRatingChange,
  onReset,
  resultCount,
}: ProFiltersProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEmirateModal, setShowEmirateModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const hasFilters = selectedCategory || selectedEmirate || minRating;

  const getCategoryLabel = () => {
    if (!selectedCategory) return 'Category';
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    return cat?.name || selectedCategory;
  };

  const getEmirateLabel = () => {
    return selectedEmirate || 'Location';
  };

  const getRatingLabel = () => {
    if (!minRating) return 'Rating';
    return `${minRating}+ Stars`;
  };

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {/* Category Filter */}
        <TouchableOpacity
          style={[styles.filterChip, selectedCategory && styles.filterChipActive]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Ionicons
            name="grid-outline"
            size={16}
            color={selectedCategory ? colors.primary[600] : colors.text.secondary}
          />
          <Text
            style={[
              styles.filterChipText,
              selectedCategory && styles.filterChipTextActive,
            ]}
            numberOfLines={1}
          >
            {getCategoryLabel()}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={selectedCategory ? colors.primary[600] : colors.text.tertiary}
          />
        </TouchableOpacity>

        {/* Location Filter */}
        <TouchableOpacity
          style={[styles.filterChip, selectedEmirate && styles.filterChipActive]}
          onPress={() => setShowEmirateModal(true)}
        >
          <Ionicons
            name="location-outline"
            size={16}
            color={selectedEmirate ? colors.primary[600] : colors.text.secondary}
          />
          <Text
            style={[
              styles.filterChipText,
              selectedEmirate && styles.filterChipTextActive,
            ]}
            numberOfLines={1}
          >
            {getEmirateLabel()}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={selectedEmirate ? colors.primary[600] : colors.text.tertiary}
          />
        </TouchableOpacity>

        {/* Rating Filter */}
        <TouchableOpacity
          style={[styles.filterChip, minRating !== null && styles.filterChipActive]}
          onPress={() => setShowRatingModal(true)}
        >
          <Ionicons
            name="star-outline"
            size={16}
            color={minRating !== null ? colors.primary[600] : colors.text.secondary}
          />
          <Text
            style={[
              styles.filterChipText,
              minRating !== null && styles.filterChipTextActive,
            ]}
            numberOfLines={1}
          >
            {getRatingLabel()}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={minRating !== null ? colors.primary[600] : colors.text.tertiary}
          />
        </TouchableOpacity>

        {/* Reset Button */}
        {hasFilters && (
          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Ionicons name="close-circle" size={16} color={colors.error[500]} />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Result Count */}
      {resultCount !== undefined && (
        <Text style={styles.resultCount}>
          {resultCount} professional{resultCount !== 1 ? 's' : ''} found
        </Text>
      )}

      {/* Category Modal */}
      <FilterModal
        visible={showCategoryModal}
        title="Select Category"
        onClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={[styles.modalOption, !selectedCategory && styles.modalOptionSelected]}
          onPress={() => {
            onCategoryChange(null);
            setShowCategoryModal(false);
          }}
        >
          <Text style={[styles.modalOptionText, !selectedCategory && styles.modalOptionTextSelected]}>
            All Categories
          </Text>
          {!selectedCategory && <Ionicons name="checkmark" size={20} color={colors.primary[500]} />}
        </TouchableOpacity>
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[styles.modalOption, selectedCategory === category.id && styles.modalOptionSelected]}
            onPress={() => {
              onCategoryChange(category.id);
              setShowCategoryModal(false);
            }}
          >
            <Text style={[styles.modalOptionText, selectedCategory === category.id && styles.modalOptionTextSelected]}>
              {category.name}
            </Text>
            {selectedCategory === category.id && <Ionicons name="checkmark" size={20} color={colors.primary[500]} />}
          </TouchableOpacity>
        ))}
      </FilterModal>

      {/* Emirate Modal */}
      <FilterModal
        visible={showEmirateModal}
        title="Select Location"
        onClose={() => setShowEmirateModal(false)}
      >
        <TouchableOpacity
          style={[styles.modalOption, !selectedEmirate && styles.modalOptionSelected]}
          onPress={() => {
            onEmirateChange(null);
            setShowEmirateModal(false);
          }}
        >
          <Text style={[styles.modalOptionText, !selectedEmirate && styles.modalOptionTextSelected]}>
            All Locations
          </Text>
          {!selectedEmirate && <Ionicons name="checkmark" size={20} color={colors.primary[500]} />}
        </TouchableOpacity>
        {EMIRATES.map(emirate => (
          <TouchableOpacity
            key={emirate}
            style={[styles.modalOption, selectedEmirate === emirate && styles.modalOptionSelected]}
            onPress={() => {
              onEmirateChange(emirate);
              setShowEmirateModal(false);
            }}
          >
            <Text style={[styles.modalOptionText, selectedEmirate === emirate && styles.modalOptionTextSelected]}>
              {emirate}
            </Text>
            {selectedEmirate === emirate && <Ionicons name="checkmark" size={20} color={colors.primary[500]} />}
          </TouchableOpacity>
        ))}
      </FilterModal>

      {/* Rating Modal */}
      <FilterModal
        visible={showRatingModal}
        title="Minimum Rating"
        onClose={() => setShowRatingModal(false)}
      >
        {RATING_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.label}
            style={[styles.modalOption, minRating === option.value && styles.modalOptionSelected]}
            onPress={() => {
              onRatingChange(option.value);
              setShowRatingModal(false);
            }}
          >
            <View style={styles.ratingOptionContent}>
              {option.value && (
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Ionicons
                      key={star}
                      name={star <= Math.floor(option.value!) ? 'star' : 'star-outline'}
                      size={16}
                      color={colors.warning[500]}
                    />
                  ))}
                </View>
              )}
              <Text style={[styles.modalOptionText, minRating === option.value && styles.modalOptionTextSelected]}>
                {option.label}
              </Text>
            </View>
            {minRating === option.value && <Ionicons name="checkmark" size={20} color={colors.primary[500]} />}
          </TouchableOpacity>
        ))}
      </FilterModal>
    </View>
  );
}

// Filter Modal Component
function FilterModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>{children}</ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingVertical: spacing[1],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  filterChipText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    maxWidth: 100,
  },
  filterChipTextActive: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  resetText: {
    ...textStyles.bodySmall,
    color: colors.error[500],
    fontWeight: '500',
  },
  resultCount: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  modalScroll: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalOptionSelected: {
    backgroundColor: colors.primary[50],
    marginHorizontal: -spacing[4],
    paddingHorizontal: spacing[4],
  },
  modalOptionText: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  modalOptionTextSelected: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  ratingOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  starsContainer: {
    flexDirection: 'row',
  },
});

export default ProFilters;

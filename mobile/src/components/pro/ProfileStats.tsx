/**
 * Profile Stats Component
 * Displays professional statistics (rating, response time, etc.)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

interface ProfileStatsProps {
  rating: number;
  reviewCount: number;
  responseTimeHours?: number;
  projectsCompleted?: number;
  layout?: 'horizontal' | 'vertical';
  compact?: boolean;
}

export function ProfileStats({
  rating,
  reviewCount,
  responseTimeHours,
  projectsCompleted,
  layout = 'horizontal',
  compact = false,
}: ProfileStatsProps) {
  const formatResponseTime = (hours: number): string => {
    if (hours < 1) return '< 1 hour';
    if (hours === 1) return '1 hour';
    if (hours < 24) return `${hours} hours`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day' : `${days} days`;
  };

  const isVertical = layout === 'vertical';

  return (
    <View style={[styles.container, isVertical && styles.containerVertical]}>
      {/* Rating */}
      <View style={[styles.stat, isVertical && styles.statVertical]}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={compact ? 14 : 16} color={colors.warning[500]} />
          <Text style={[styles.ratingValue, compact && styles.ratingValueCompact]}>
            {rating.toFixed(1)}
          </Text>
        </View>
        <Text style={[styles.statLabel, compact && styles.statLabelCompact]}>
          ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
        </Text>
      </View>

      {/* Response Time */}
      {responseTimeHours !== undefined && responseTimeHours > 0 && (
        <View style={[styles.stat, isVertical && styles.statVertical]}>
          <View style={styles.iconValue}>
            <Ionicons
              name="time-outline"
              size={compact ? 14 : 16}
              color={colors.text.tertiary}
            />
            <Text style={[styles.statValue, compact && styles.statValueCompact]}>
              {formatResponseTime(responseTimeHours)}
            </Text>
          </View>
          {!compact && <Text style={styles.statLabel}>response</Text>}
        </View>
      )}

      {/* Projects Completed */}
      {projectsCompleted !== undefined && projectsCompleted > 0 && (
        <View style={[styles.stat, isVertical && styles.statVertical]}>
          <View style={styles.iconValue}>
            <Ionicons
              name="briefcase-outline"
              size={compact ? 14 : 16}
              color={colors.text.tertiary}
            />
            <Text style={[styles.statValue, compact && styles.statValueCompact]}>
              {projectsCompleted}
            </Text>
          </View>
          {!compact && <Text style={styles.statLabel}>projects</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  containerVertical: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statVertical: {
    flexDirection: 'row',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingValue: {
    ...textStyles.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  ratingValueCompact: {
    ...textStyles.bodySmall,
    fontWeight: '700',
  },
  iconValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statValue: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statValueCompact: {
    ...textStyles.bodySmall,
    fontWeight: '600',
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  statLabelCompact: {
    fontSize: 11,
  },
});

export default ProfileStats;

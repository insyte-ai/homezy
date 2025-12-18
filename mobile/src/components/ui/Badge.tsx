/**
 * Badge component for status indicators and counts
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label?: string;
  count?: number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.neutral[100], text: colors.text.secondary },
  primary: { bg: colors.primary[100], text: colors.primary[700] },
  success: { bg: colors.success[100], text: colors.success[700] },
  warning: { bg: colors.warning[100], text: colors.warning[700] },
  error: { bg: colors.error[100], text: colors.error[700] },
  info: { bg: colors.info[100], text: colors.info[700] },
};

export function Badge({
  label,
  count,
  variant = 'default',
  size = 'md',
  dot = false,
  style,
}: BadgeProps) {
  const variantStyle = VARIANT_STYLES[variant];

  // Dot badge (no text)
  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          { backgroundColor: variantStyle.bg === colors.neutral[100]
              ? colors.error[500]
              : variantStyle.text
          },
          style,
        ]}
      />
    );
  }

  // Count badge
  if (count !== undefined) {
    const displayCount = count > 99 ? '99+' : count.toString();
    return (
      <View
        style={[
          styles.countBadge,
          { backgroundColor: colors.error[500] },
          style,
        ]}
      >
        <Text style={styles.countText}>{displayCount}</Text>
      </View>
    );
  }

  // Label badge
  return (
    <View
      style={[
        styles.base,
        styles[`size_${size}`],
        { backgroundColor: variantStyle.bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          styles[`textSize_${size}`],
          { color: variantStyle.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },

  // Sizes
  size_sm: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
  },
  size_md: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },

  text: {
    fontWeight: fontWeight.medium,
  },
  textSize_sm: {
    fontSize: fontSize.xs - 1,
  },
  textSize_md: {
    fontSize: fontSize.xs,
  },

  // Dot style
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Count badge
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: spacing[1.5],
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: colors.text.inverse,
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.bold,
  },
});

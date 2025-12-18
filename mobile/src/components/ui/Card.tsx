/**
 * Card component for content containers
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: TouchableOpacityProps['onPress'];
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'md',
  onPress,
}: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`padding_${padding}`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card.background,
    borderRadius: borderRadius.lg,
  },

  // Variants
  default: {
    borderWidth: 1,
    borderColor: colors.card.border,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: 'transparent',
  },
  elevated: {
    ...shadows.md,
    borderWidth: 0,
  },

  // Padding
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: spacing[3],
  },
  padding_md: {
    padding: spacing[4],
  },
  padding_lg: {
    padding: spacing[6],
  },
});

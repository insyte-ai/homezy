/**
 * Avatar component with image and initials fallback
 */

import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const SIZES: Record<AvatarSize, { container: number; text: number }> = {
  xs: { container: 24, text: 10 },
  sm: { container: 32, text: 12 },
  md: { container: 40, text: 14 },
  lg: { container: 56, text: 20 },
  xl: { container: 80, text: 28 },
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getBackgroundColor(name?: string): string {
  if (!name) return colors.neutral[300];

  const colorOptions = [
    colors.primary[500],
    colors.success[500],
    colors.warning[500],
    colors.info[500],
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
  ];

  // Simple hash based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colorOptions[Math.abs(hash) % colorOptions.length];
}

export function Avatar({ source, name, size = 'md', style }: AvatarProps) {
  const dimensions = SIZES[size];
  const initials = getInitials(name);
  const backgroundColor = getBackgroundColor(name);

  const containerStyle: ViewStyle = {
    width: dimensions.container,
    height: dimensions.container,
    borderRadius: dimensions.container / 2,
    backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  };

  if (source) {
    return (
      <View style={[containerStyle, style]}>
        <Image
          source={{ uri: source }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <Text
        style={[
          styles.initials,
          { fontSize: dimensions.text },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.text.inverse,
    fontWeight: fontWeight.semibold,
  },
});

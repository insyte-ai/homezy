/**
 * Empty state component for when there's no content
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon = 'folder-open-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={48}
          color={colors.neutral[300]}
        />
      </View>

      <Text style={styles.title}>{title}</Text>

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          variant="primary"
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },

  title: {
    ...textStyles.h4,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },

  description: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing[4],
  },

  button: {
    marginTop: spacing[2],
  },
});

/**
 * Loading spinner component
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = 'large',
  color = colors.primary[500],
  message,
  fullScreen = false,
  overlay = false,
  style,
}: LoadingSpinnerProps) {
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, overlay && styles.overlay, style]}>
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 999,
  },

  message: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[3],
    textAlign: 'center',
  },
});

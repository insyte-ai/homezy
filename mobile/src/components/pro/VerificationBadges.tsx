/**
 * Verification Badges Component
 * Displays verification status badges for professionals
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface VerificationBadgesProps {
  verificationStatus: VerificationStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const statusConfig: Record<VerificationStatus, {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}> = {
  pending: {
    label: 'Pending',
    icon: 'time-outline',
    color: colors.warning[600],
    bgColor: colors.warning[50],
  },
  approved: {
    label: 'Verified',
    icon: 'shield-checkmark',
    color: colors.success[600],
    bgColor: colors.success[50],
  },
  rejected: {
    label: 'Rejected',
    icon: 'close-circle',
    color: colors.error[600],
    bgColor: colors.error[50],
  },
};

export function VerificationBadges({
  verificationStatus,
  size = 'md',
  showLabel = true,
}: VerificationBadgesProps) {
  const config = statusConfig[verificationStatus] || statusConfig.pending;
  const iconSize = size === 'sm' ? 14 : 18;

  // Only show badge for approved or pending
  if (!verificationStatus || !config) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <Ionicons name={config.icon} size={iconSize} color={config.color} />
      {showLabel && (
        <Text
          style={[
            size === 'sm' ? styles.labelSmall : styles.label,
            { color: config.color },
          ]}
        >
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  label: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default VerificationBadges;

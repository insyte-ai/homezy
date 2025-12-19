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

type VerificationStatus = 'unverified' | 'pending' | 'basic' | 'comprehensive' | 'rejected' | 'approved';

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
  unverified: {
    label: 'Unverified',
    icon: 'shield-outline',
    color: colors.text.tertiary,
    bgColor: colors.neutral[100],
  },
  pending: {
    label: 'Pending',
    icon: 'time-outline',
    color: colors.warning[600],
    bgColor: colors.warning[50],
  },
  basic: {
    label: 'Verified',
    icon: 'shield-checkmark',
    color: colors.primary[600],
    bgColor: colors.primary[50],
  },
  comprehensive: {
    label: 'Fully Verified',
    icon: 'shield-checkmark',
    color: colors.success[600],
    bgColor: colors.success[50],
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
  const config = statusConfig[verificationStatus] || statusConfig.unverified;
  const iconSize = size === 'sm' ? 14 : 18;

  // For unverified, don't show anything
  if (verificationStatus === 'unverified') {
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
      {verificationStatus === 'comprehensive' && (
        <Ionicons name="checkmark" size={iconSize - 2} color={config.color} />
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

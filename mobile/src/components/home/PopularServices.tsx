/**
 * Popular Services Component
 * Displays popular services in a grid for quick access
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

// Popular services with icons
const POPULAR_SERVICES = [
  { id: 'plumbing', name: 'Plumbing', slug: 'plumbing', icon: 'water-outline', color: colors.info[500] },
  { id: 'electrical', name: 'Electrical', slug: 'electrical', icon: 'flash-outline', color: colors.warning[500] },
  { id: 'hvac', name: 'AC / HVAC', slug: 'hvac', icon: 'snow-outline', color: colors.primary[500] },
  { id: 'painting', name: 'Painting', slug: 'painting', icon: 'color-palette-outline', color: colors.success[500] },
  { id: 'home-cleaning', name: 'Cleaning', slug: 'home-cleaning', icon: 'sparkles-outline', color: colors.info[600] },
  { id: 'handyman', name: 'Handyman', slug: 'handyman', icon: 'hammer-outline', color: colors.neutral[600] },
  { id: 'carpentry', name: 'Carpentry', slug: 'carpentry', icon: 'build-outline', color: colors.warning[600] },
  { id: 'landscaping', name: 'Landscaping', slug: 'landscaping', icon: 'leaf-outline', color: colors.success[600] },
];

interface PopularServicesProps {
  onServiceSelect: (service: { id: string; name: string; slug: string }) => void;
}

export function PopularServices({ onServiceSelect }: PopularServicesProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Services</Text>
      <View style={styles.grid}>
        {POPULAR_SERVICES.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.serviceItem}
            onPress={() => onServiceSelect(service)}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${service.color}15` }]}>
              <Ionicons name={service.icon as any} size={24} color={service.color} />
            </View>
            <Text style={styles.serviceName} numberOfLines={1}>
              {service.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  title: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  serviceItem: {
    width: '23%',
    alignItems: 'center',
    gap: spacing[2],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default PopularServices;

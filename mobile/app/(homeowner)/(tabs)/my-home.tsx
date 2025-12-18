/**
 * My Home screen (placeholder)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function MenuItem({ icon, title, subtitle, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.menuItem}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={24} color={colors.primary[500]} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      </Card>
    </TouchableOpacity>
  );
}

export default function MyHomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Home</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MenuItem
          icon="home-outline"
          title="Properties"
          subtitle="Manage your properties"
          onPress={() => {}}
        />
        <MenuItem
          icon="construct-outline"
          title="Projects"
          subtitle="Track home improvement projects"
          onPress={() => {}}
        />
        <MenuItem
          icon="time-outline"
          title="Service History"
          subtitle="View past services"
          onPress={() => {}}
        />
        <MenuItem
          icon="notifications-outline"
          title="Reminders"
          subtitle="Service reminders & maintenance"
          onPress={() => {}}
        />
        <MenuItem
          icon="wallet-outline"
          title="Expenses"
          subtitle="Track home-related expenses"
          onPress={() => {}}
        />
        <MenuItem
          icon="bulb-outline"
          title="Ideas"
          subtitle="Saved inspiration & resources"
          onPress={() => {}}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  menuSubtitle: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
});

/**
 * HomeGPT AI Chat screen (placeholder)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={24} color={colors.primary[500]} />
        <Text style={styles.title}>HomeGPT</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubbles" size={48} color={colors.primary[300]} />
        </View>
        <Text style={styles.welcomeTitle}>Ask me anything!</Text>
        <Text style={styles.welcomeText}>
          I can help with home improvement questions, cost estimates, finding professionals, and more.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  welcomeTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  welcomeText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
});

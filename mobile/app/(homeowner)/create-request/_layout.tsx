/**
 * Create Request Flow Layout
 */

import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/colors';

export default function CreateRequestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="details" />
      <Stack.Screen name="photos" />
      <Stack.Screen name="review" />
    </Stack>
  );
}

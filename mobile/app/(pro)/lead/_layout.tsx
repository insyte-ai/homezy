/**
 * Pro Lead Stack Layout
 */

import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/colors';

export default function LeadLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
}

/**
 * Pro Credits Stack Layout
 */

import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/colors';

export default function CreditsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}

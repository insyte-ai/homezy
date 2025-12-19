/**
 * My Home Section Layout
 */

import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/colors';

export default function MyHomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    />
  );
}

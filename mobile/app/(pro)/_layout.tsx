/**
 * Professional layout with auth guard
 */

import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function ProLayout() {
  const { isAuthenticated, user } = useAuthStore();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Not a pro - redirect to homeowner
  if (user.role === 'homeowner') {
    return <Redirect href="/(homeowner)/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lead" />
      <Stack.Screen name="quote" />
      <Stack.Screen name="credits" />
    </Stack>
  );
}

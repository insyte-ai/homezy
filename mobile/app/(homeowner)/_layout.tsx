/**
 * Homeowner layout with auth guard
 */

import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function HomeownerLayout() {
  const { isAuthenticated, user } = useAuthStore();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Not a homeowner - redirect to pro
  if (user.role === 'pro') {
    return <Redirect href="/(pro)/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="create-request" />
      <Stack.Screen name="request" />
      <Stack.Screen name="quote" />
    </Stack>
  );
}

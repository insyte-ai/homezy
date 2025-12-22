/**
 * Professional layout with auth guard and agreement check
 */

import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function ProLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const segments = useSegments();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Not a pro - redirect to homeowner
  if (user.role === 'homeowner') {
    return <Redirect href="/(homeowner)/(tabs)" />;
  }

  // Check if on agreement page
  const isOnAgreementPage = segments.includes('agreement');

  // Check if agreement has been accepted
  const hasAcceptedAgreement = user.proProfile?.agreement?.accepted === true;

  // Redirect to agreement page if not accepted and not already there
  if (!hasAcceptedAgreement && !isOnAgreementPage) {
    return <Redirect href="/(pro)/agreement" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="agreement" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lead" />
      <Stack.Screen name="quote" />
      <Stack.Screen name="credits" />
    </Stack>
  );
}

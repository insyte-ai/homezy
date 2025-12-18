/**
 * Entry point - redirects based on auth state
 */

import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { isAuthenticated, user } = useAuthStore();

  // Not authenticated - go to login
  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Authenticated - redirect based on role
  if (user.role === 'pro') {
    return <Redirect href="/(pro)/(tabs)" />;
  }

  // Default: homeowner
  return <Redirect href="/(homeowner)/(tabs)" />;
}

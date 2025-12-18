/**
 * Root layout for Homezy mobile app
 * Handles auth initialization and navigation structure
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize auth state
        await initialize();
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    initializeApp();
  }, [initialize]);

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(homeowner)" />
          <Stack.Screen name="(pro)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

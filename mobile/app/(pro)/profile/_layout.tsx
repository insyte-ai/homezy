import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="edit" />
      <Stack.Screen name="portfolio" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

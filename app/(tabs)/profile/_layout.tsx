import { Stack } from 'expo-router';
export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="store-select" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

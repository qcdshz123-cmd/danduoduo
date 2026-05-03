import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="create" />
      <Stack.Screen name="edit/[id]" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="batch-edit" />
    </Stack>
  );
}

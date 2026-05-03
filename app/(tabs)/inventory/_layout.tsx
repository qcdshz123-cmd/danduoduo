import { Stack } from 'expo-router';
export default function InventoryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="stock-in" />
      <Stack.Screen name="stock-out" />
      <Stack.Screen name="transfer" />
      <Stack.Screen name="adjustments" />
      <Stack.Screen name="low-stock" />
      <Stack.Screen name="overstock" />
      <Stack.Screen name="history" />
    </Stack>
  );
}

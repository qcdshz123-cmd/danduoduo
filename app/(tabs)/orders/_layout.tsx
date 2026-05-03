import { Stack } from 'expo-router';
export default function OrdersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="create" />
      <Stack.Screen name="scan-order" />
      <Stack.Screen name="payment/[id]" />
      <Stack.Screen name="history" />
    </Stack>
  );
}

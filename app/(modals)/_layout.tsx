import { Stack } from 'expo-router';
export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}>
      <Stack.Screen name="product-picker" />
      <Stack.Screen name="customer-picker" />
      <Stack.Screen name="confirm-dialog" />
      <Stack.Screen name="record-payment" />
    </Stack>
  );
}

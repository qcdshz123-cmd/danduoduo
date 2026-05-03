import { Stack } from 'expo-router';
export default function ReportsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sales-summary" />
      <Stack.Screen name="revenue-profit" />
      <Stack.Screen name="top-products" />
      <Stack.Screen name="inventory-report" />
      <Stack.Screen name="customer-orders" />
    </Stack>
  );
}

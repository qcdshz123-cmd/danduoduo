import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button } from '../../../../components/ui';

export default function PaymentScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <View style={{ paddingTop: insets.top, paddingHorizontal: theme.space[4], paddingBottom: theme.space[2], flexDirection: 'row', alignItems: 'center', height: theme.layout.headerHeight + insets.top }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>← 返回</Text>
        </TouchableOpacity>
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>收款</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={{ flex: 1, padding: theme.space[4], gap: theme.space[4], justifyContent: 'center', alignItems: 'center' }}>
        <Card style={{ width: '100%', alignItems: 'center', gap: theme.space[3] }}>
          <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>待付金额</Text>
          <Text style={[theme.text.h1, { color: theme.colors.primary }]}>¥0.00</Text>
        </Card>
        <Button variant="primary" size="lg" fullWidth onPress={() => {}}>确认收款</Button>
      </View>
    </View>
  );
}

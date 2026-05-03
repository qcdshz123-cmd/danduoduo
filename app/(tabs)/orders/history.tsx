import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { EmptyState } from '../../../components/ui';

export default function OrderHistoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <View style={{ paddingTop: insets.top + theme.space[2], paddingHorizontal: theme.space[4], flexDirection: 'row', alignItems: 'center', height: theme.layout.headerHeight }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>← 返回</Text>
        </TouchableOpacity>
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>订单历史</Text>
        <View style={{ width: 50 }} />
      </View>
      <EmptyState title="搜索历史订单" description="输入条件搜索已完成订单" />
    </View>
  );
}

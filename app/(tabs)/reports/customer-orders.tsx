import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { reportService } from '../../../services/reportService';
import type { CustomerOrderStat } from '../../../services/reportService';
import { Card, Badge, Skeleton, EmptyState, Chip , ScreenHeader } from '../../../components/ui';
import { Period, PERIOD_OPTIONS, getDateRange } from '../../../utils/dateRanges';

function getTierLabel(orderCount: number): { label: string; variant: 'success' | 'info' | 'warning' } {
  if (orderCount >= 10) return { label: '高频', variant: 'success' };
  if (orderCount >= 5) return { label: '中频', variant: 'info' };
  return { label: '低频', variant: 'warning' };
}

export default function CustomerOrdersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('7d');
  const [data, setData] = useState<CustomerOrderStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const range = getDateRange(period);
      const result = await reportService.getCustomerOrderStats(range);
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalCustomers = data.length;
  const totalOrders = data.reduce((s, d) => s + d.orderCount, 0);
  const totalAmount = data.reduce((s, d) => s + d.totalAmount, 0);
  const maxAmount = data.length > 0 ? data[0].totalAmount : 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScreenHeader title="客户订单" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: theme.space[4], paddingBottom: theme.space[2] }}>
        {PERIOD_OPTIONS.map((p) => (
          <Chip key={p.key} label={p.label} selected={period === p.key} onPress={() => setPeriod(p.key)} style={{ marginRight: theme.space[2] }} />
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} variant="rect" height={72} />))}
        </View>
      ) : error ? (
        <EmptyState title="加载失败" description={error} action={{ label: '重试', onPress: fetch }} />
      ) : data.length === 0 ? (
        <EmptyState title="暂无客户订单" description="所选时间段内没有订单记录" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.space[4], paddingBottom: theme.space[24] }}>
          {/* 汇总卡片 */}
          <View style={{ flexDirection: 'row', gap: theme.space[3], marginBottom: theme.space[4] }}>
            <Card variant="filled" style={{ flex: 1, alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h2, { color: theme.colors.primary }]}>{totalCustomers}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>客户数</Text>
            </Card>
            <Card variant="filled" style={{ flex: 1, alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h2, { color: theme.colors.success }]}>{totalOrders}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>订单数</Text>
            </Card>
            <Card variant="filled" style={{ flex: 1, alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h2, { color: theme.colors.warning }]}>¥{totalAmount.toLocaleString()}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>总金额</Text>
            </Card>
          </View>

          {/* 客户排名列表 */}
          <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, marginBottom: theme.space[3] }]}>客户排名</Text>
          {data.map((item, index) => {
            const barWidth = maxAmount > 0 ? (item.totalAmount / maxAmount) * 100 : 0;
            const tier = getTierLabel(item.orderCount);

            return (
              <Card key={item.customerId} style={{ marginBottom: theme.space[2] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
                  {/* 排名 */}
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: index < 3 ? `${['#FFD700', '#C0C0C0', '#CD7F32'][index]}20` : theme.colors.bgSecondary,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={[theme.text.bodySmall, {
                      color: index < 3 ? ['#B8860B', '#666', '#8B6914'][index] : theme.colors.textTertiary,
                    }]}>
                      {index + 1}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
                        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>{item.customerName}</Text>
                        <Badge variant={tier.variant} size="sm">{tier.label}</Badge>
                      </View>
                      <Text style={[theme.text.bodySmall, { color: theme.colors.primary }]}>
                        ¥{item.totalAmount.toLocaleString()}
                      </Text>
                    </View>

                    {item.customerPhone ? (
                      <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>{item.customerPhone}</Text>
                    ) : null}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.space[1] }}>
                      <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>
                        {item.orderCount}单 · 均¥{item.avgOrderValue.toLocaleString()}
                      </Text>
                    </View>

                    <View style={{ height: 3, backgroundColor: theme.colors.borderLight, borderRadius: 1.5, marginTop: theme.space[1] }}>
                      <View style={{
                        height: 3, width: `${Math.max(barWidth, 0.5)}%`,
                        backgroundColor: index < 3
                          ? ['#FFD700', '#C0C0C0', '#CD7F32'][index]
                          : theme.colors.primary,
                        borderRadius: 1.5,
                      }} />
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

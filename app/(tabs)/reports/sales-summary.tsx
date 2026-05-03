import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { reportService } from '../../../services/reportService';
import { Card, Skeleton, EmptyState, Chip , ScreenHeader } from '../../../components/ui';
import type { SalesSummary } from '../../../types/models';
import { Period, PERIOD_OPTIONS, getDateRange } from '../../../utils/dateRanges';

export default function SalesSummaryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('7d');
  const [data, setData] = useState<SalesSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const range = getDateRange(period);
      const result = await reportService.getSalesSummary(range);
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalRevenue = data.reduce((s, d) => s + d.total_revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.order_count, 0);
  const totalProfit = data.reduce((s, d) => s + d.total_profit, 0);
  const maxRevenue = data.length > 0 ? Math.max(...data.map((d) => d.total_revenue)) : 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScreenHeader title="销售概览" />

      {/* 时间筛选 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: theme.space[4], paddingBottom: theme.space[2] }}>
        {PERIOD_OPTIONS.map((p) => (
          <Chip key={p.key} label={p.label} selected={period === p.key} onPress={() => setPeriod(p.key)} style={{ marginRight: theme.space[2] }} />
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          {Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} variant="rect" height={64} />))}
        </View>
      ) : error ? (
        <EmptyState title="加载失败" description={error} action={{ label: '重试', onPress: fetch }} />
      ) : data.length === 0 ? (
        <EmptyState title="暂无销售数据" description="所选时间段内没有订单记录" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.space[4], paddingBottom: theme.space[24] }}>
          {/* 汇总卡片 */}
          <View style={{ flexDirection: 'row', gap: theme.space[3], marginBottom: theme.space[4] }}>
            <Card variant="filled" style={{ flex: 1, alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h2, { color: theme.colors.primary }]}>{totalOrders}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>订单数</Text>
            </Card>
            <Card variant="filled" style={{ flex: 1, alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h2, { color: theme.colors.success }]}>¥{totalRevenue.toLocaleString()}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>销售额</Text>
            </Card>
            <Card variant="filled" style={{ flex: 1, alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h2, { color: theme.colors.warning }]}>¥{totalProfit.toLocaleString()}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>毛利</Text>
            </Card>
          </View>

          {/* 按天列表 + 简易柱状图 */}
          <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, marginBottom: theme.space[3] }]}>按天明细</Text>
          {data.map((day) => {
            const barWidth = maxRevenue > 0 ? (day.total_revenue / maxRevenue) * 100 : 0;
            return (
              <Card key={day.period} style={{ marginBottom: theme.space[2] }}>
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.space[1] }}>
                    <Text style={[theme.text.bodySmall, { color: theme.colors.textPrimary }]}>{day.period.slice(5)}</Text>
                    <Text style={[theme.text.bodySmall, { color: theme.colors.primary }]}>¥{day.total_revenue.toLocaleString()}</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: theme.colors.borderLight, borderRadius: 3 }}>
                    <View style={{
                      height: 6, width: `${Math.max(barWidth, 2)}%`,
                      backgroundColor: theme.colors.primary, borderRadius: 3,
                    }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.space[1] }}>
                    <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>{day.order_count}单 · {day.item_count}件</Text>
                    <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>
                      均¥{day.avg_order_value.toLocaleString()} · 利¥{day.total_profit.toLocaleString()}
                    </Text>
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

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { reportService } from '../../../services/reportService';
import type { RevenueProfitRow } from '../../../services/reportService';
import { Card, Skeleton, EmptyState, Chip , ScreenHeader } from '../../../components/ui';
import { Period, PERIOD_OPTIONS, getDateRange } from '../../../utils/dateRanges';

export default function RevenueProfitScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('7d');
  const [data, setData] = useState<RevenueProfitRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const range = getDateRange(period);
      const result = await reportService.getRevenueProfit(range);
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalCost = data.reduce((s, d) => s + d.cost, 0);
  const totalProfit = data.reduce((s, d) => s + d.profit, 0);
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
  const maxRevenue = data.length > 0 ? Math.max(...data.map((d) => d.revenue)) : 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScreenHeader title="营收利润" />

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
        <EmptyState title="暂无营收数据" description="所选时间段内没有订单记录" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.space[4], paddingBottom: theme.space[24] }}>
          {/* 汇总卡片 */}
          <View style={{ flexDirection: 'row', gap: theme.space[3], marginBottom: theme.space[4], flexWrap: 'wrap' }}>
            <Card variant="filled" style={{ flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h3, { color: theme.colors.success }]}>¥{totalRevenue.toLocaleString()}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>总营收</Text>
            </Card>
            <Card variant="filled" style={{ flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h3, { color: theme.colors.danger }]}>¥{totalCost.toLocaleString()}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>总成本</Text>
            </Card>
            <Card variant="filled" style={{ flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h3, { color: theme.colors.warning }]}>¥{totalProfit.toLocaleString()}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>总毛利</Text>
            </Card>
            <Card variant="filled" style={{ flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h3, { color: theme.colors.primary }]}>{profitMargin}%</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>毛利率</Text>
            </Card>
          </View>

          {/* 按天明细 */}
          <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, marginBottom: theme.space[3] }]}>按天明细</Text>
          {data.map((day) => {
            const barWidth = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
            const dayMargin = day.revenue > 0 ? ((day.profit / day.revenue) * 100).toFixed(1) : '0';
            return (
              <Card key={day.date} style={{ marginBottom: theme.space[2] }}>
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.space[1] }}>
                    <Text style={[theme.text.bodySmall, { color: theme.colors.textPrimary }]}>{day.date.slice(5)}</Text>
                    <Text style={[theme.text.bodySmall, { color: theme.colors.success }]}>¥{day.revenue.toLocaleString()}</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: theme.colors.borderLight, borderRadius: 3, overflow: 'hidden' }}>
                    {/* 成本占比（红） */}
                    <View style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${Math.max(day.revenue > 0 ? (day.cost / day.revenue) * barWidth : 0, 0)}%`,
                      backgroundColor: theme.colors.danger, borderTopLeftRadius: 3, borderBottomLeftRadius: 3,
                    }} />
                    {/* 营收占比（绿） */}
                    <View style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${Math.max(barWidth, 2)}%`,
                      backgroundColor: 'transparent',
                    }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.space[1] }}>
                    <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>
                      成本 ¥{day.cost.toLocaleString()} · 利润 ¥{day.profit.toLocaleString()}
                    </Text>
                    <Text style={[theme.text.caption, { color: theme.colors.warning }]}>{dayMargin}%</Text>
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

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { reportService } from '../../../services/reportService';
import { Card, Skeleton } from '../../../components/ui';

const REPORT_CARDS = [
  { key: 'sales', label: '销售概览', desc: '订单数、销售额、趋势', icon: '📊', route: '/(tabs)/reports/sales-summary' },
  { key: 'revenue', label: '营收利润', desc: '收入、成本、毛利', icon: '💰', route: '/(tabs)/reports/revenue-profit' },
  { key: 'top', label: '热销排行', desc: '畅销商品TOP榜', icon: '🏆', route: '/(tabs)/reports/top-products' },
  { key: 'inventory', label: '库存报告', desc: '库存状态、价值分析', icon: '📦', route: '/(tabs)/reports/inventory-report' },
  { key: 'customer', label: '客户订单', desc: '客户消费分析', icon: '👥', route: '/(tabs)/reports/customer-orders' },
];

function getTodayRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  return { startDate: dateStr, endDate: dateStr };
}

function getMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const end = now.toISOString().slice(0, 10);
  return { startDate: start, endDate: end };
}

export default function ReportsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [todayOrders, setTodayOrders] = useState<number | null>(null);
  const [todayRevenue, setTodayRevenue] = useState<number | null>(null);
  const [monthRevenue, setMonthRevenue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const todayRange = getTodayRange();
      const monthRange = getMonthRange();

      const [todayData, monthData] = await Promise.all([
        reportService.getSalesSummary(todayRange),
        reportService.getSalesSummary(monthRange),
      ]);

      const today = todayData[0];
      setTodayOrders(today?.order_count ?? 0);
      setTodayRevenue(today?.total_revenue ?? 0);

      const monthTotal = monthData.reduce((s, d) => s + d.total_revenue, 0);
      setMonthRevenue(monthTotal);
    } catch {
      setTodayOrders(0);
      setTodayRevenue(0);
      setMonthRevenue(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const now = new Date();
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <View style={{ paddingTop: insets.top + theme.space[2], paddingHorizontal: theme.space[4], backgroundColor: theme.colors.bgPrimary }}>
        <Text style={[theme.text.h2, { color: theme.colors.textPrimary, marginBottom: theme.space[1] }]}>报表</Text>
        <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary, marginBottom: theme.space[4] }]}>
          {monthLabel}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[4], gap: theme.space[3], paddingBottom: theme.space[24] }}>
        {/* Quick stats */}
        <View style={{ flexDirection: 'row', gap: theme.space[3] }}>
          <Card variant="filled" style={{ flex: 1, alignItems: 'center', padding: theme.space[4] }}>
            {isLoading ? (
              <Skeleton variant="rect" width={48} height={32} style={{ marginBottom: 4 }} />
            ) : (
              <Text style={[theme.text.h1, { color: theme.colors.primary }]}>{todayOrders ?? 0}</Text>
            )}
            <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>今日订单</Text>
          </Card>
          <Card variant="filled" style={{ flex: 1, alignItems: 'center', padding: theme.space[4] }}>
            {isLoading ? (
              <Skeleton variant="rect" width={64} height={32} style={{ marginBottom: 4 }} />
            ) : (
              <Text style={[theme.text.h1, { color: theme.colors.success }]}>
                {todayRevenue != null ? `¥${(todayRevenue / 1000).toFixed(1)}k` : '¥0'}
              </Text>
            )}
            <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>今日营收</Text>
          </Card>
        </View>

        {/* Month revenue card */}
        <Card variant="filled" style={{ alignItems: 'center', padding: theme.space[4], backgroundColor: theme.colors.primaryBg }}>
          <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>本月累计营收</Text>
          {isLoading ? (
            <Skeleton variant="rect" width={80} height={28} style={{ marginTop: 4 }} />
          ) : (
            <Text style={[theme.text.priceLg, { color: theme.colors.primary, marginTop: theme.space[1] }]}>
              ¥{monthRevenue != null ? monthRevenue.toLocaleString() : '0'}
            </Text>
          )}
        </Card>

        {/* Report cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[3] }}>
          {REPORT_CARDS.map((card) => (
            <TouchableOpacity
              key={card.key}
              onPress={() => router.push(card.route as any)}
              activeOpacity={0.8}
              style={{ width: '48%' }}
            >
              <Card style={{ height: 140 }}>
                <View style={{ flex: 1, justifyContent: 'center', gap: theme.space[2] }}>
                  <Text style={{ fontSize: 28 }}>{card.icon}</Text>
                  <View>
                    <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>{card.label}</Text>
                    <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>{card.desc}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

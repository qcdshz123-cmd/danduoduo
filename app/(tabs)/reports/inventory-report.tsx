import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { reportService } from '../../../services/reportService';
import type { InventoryReportRow } from '../../../services/reportService';
import { Card, Skeleton, EmptyState , ScreenHeader } from '../../../components/ui';

const STATUS_COLORS: Record<string, string> = {
  '正常': '#22C55E',
  '低库存': '#F59E0B',
  '缺货': '#EF4444',
  '超库存': '#3B82F6',
};

const STATUS_ICONS: Record<string, string> = {
  '正常': '✅',
  '低库存': '⚠️',
  '缺货': '❌',
  '超库存': '📊',
};

export default function InventoryReportScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<InventoryReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reportService.getInventoryReport();
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const totalSKU = data.reduce((s, d) => s + d.count, 0);
  const totalValue = data.reduce((s, d) => s + d.totalValue, 0);
  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScreenHeader title="库存报告" />

      {isLoading ? (
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} variant="rect" height={80} />))}
        </View>
      ) : error ? (
        <EmptyState title="加载失败" description={error} action={{ label: '重试', onPress: fetch }} />
      ) : data.length === 0 ? (
        <EmptyState title="暂无库存数据" description="请先添加商品和库存" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.space[4], paddingBottom: theme.space[24] }}>
          {/* 汇总卡片 */}
          <View style={{ flexDirection: 'row', gap: theme.space[3], marginBottom: theme.space[4] }}>
            <Card variant="filled" style={{ flex: 1, alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h2, { color: theme.colors.primary }]}>{totalSKU}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>总SKU</Text>
            </Card>
            <Card variant="filled" style={{ flex: 1, alignItems: 'center', paddingVertical: theme.space[3] }}>
              <Text style={[theme.text.h2, { color: theme.colors.success }]}>¥{totalValue.toLocaleString()}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>库存总值</Text>
            </Card>
          </View>

          {/* 状态分布 */}
          <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, marginBottom: theme.space[3] }]}>库存状态分布</Text>
          {data.map((row) => {
            const pct = totalSKU > 0 ? ((row.count / totalSKU) * 100).toFixed(1) : '0';
            const barWidth = maxCount > 0 ? (row.count / maxCount) * 100 : 0;
            const color = STATUS_COLORS[row.status] ?? theme.colors.primary;

            return (
              <Card key={row.status} style={{ marginBottom: theme.space[2] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: theme.radius.md,
                    backgroundColor: `${color}15`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 20 }}>{STATUS_ICONS[row.status] ?? '📦'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>{row.status}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
                        <Text style={[theme.text.bodySmall, { color }]}>{row.count} SKU</Text>
                        <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>{pct}%</Text>
                      </View>
                    </View>
                    <Text style={[theme.text.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                      库存价值: ¥{row.totalValue.toLocaleString()}
                    </Text>
                    <View style={{ height: 4, backgroundColor: theme.colors.borderLight, borderRadius: 2, marginTop: theme.space[1] }}>
                      <View style={{
                        height: 4, width: `${Math.max(barWidth, 2)}%`,
                        backgroundColor: color, borderRadius: 2,
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

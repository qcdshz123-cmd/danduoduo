import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { reportService } from '../../../services/reportService';
import { Card, Badge, Skeleton, EmptyState, Chip , ScreenHeader } from '../../../components/ui';
import type { TopProduct } from '../../../types/models';
import { Period, PERIOD_OPTIONS, getDateRange } from '../../../utils/dateRanges';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const MEDAL_EMOJI = ['🥇', '🥈', '🥉'];

export default function TopProductsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('7d');
  const [data, setData] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const range = getDateRange(period);
      const result = await reportService.getTopProducts({ ...range, limit: 20 });
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  const maxRevenue = data.length > 0 ? data[0].total_revenue : 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScreenHeader title="热销排行" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: theme.space[4], paddingBottom: theme.space[2] }}>
        {PERIOD_OPTIONS.map((p) => (
          <Chip key={p.key} label={p.label} selected={period === p.key} onPress={() => setPeriod(p.key)} style={{ marginRight: theme.space[2] }} />
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          {Array.from({ length: 8 }).map((_, i) => (<Skeleton key={i} variant="rect" height={64} />))}
        </View>
      ) : error ? (
        <EmptyState title="加载失败" description={error} action={{ label: '重试', onPress: fetch }} />
      ) : data.length === 0 ? (
        <EmptyState title="暂无销售数据" description="所选时间段内没有订单记录" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.space[4], paddingBottom: theme.space[24] }}>
          {data.map((item, index) => {
            const barWidth = maxRevenue > 0 ? (item.total_revenue / maxRevenue) * 100 : 0;
            const isTop3 = index < 3;

            return (
              <Card
                key={item.product_id}
                style={{ marginBottom: theme.space[2] }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: isTop3 ? `${MEDAL_COLORS[index]}20` : theme.colors.bgSecondary,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isTop3 ? (
                      <Text style={{ fontSize: 18 }}>{MEDAL_EMOJI[index]}</Text>
                    ) : (
                      <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary }]}>{index + 1}</Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                          {item.product_name}
                        </Text>
                        {item.product_code ? (
                          <Text style={[theme.text.mono, { color: theme.colors.textTertiary, fontSize: theme.font.size.xs }]}>
                            {item.product_code}
                          </Text>
                        ) : null}
                      </View>
                      <Badge variant="success" size="sm">{item.percentage}%</Badge>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.space[1] }}>
                      <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>
                        售出 {item.quantity_sold}件
                      </Text>
                      <Text style={[theme.text.bodySmall, { color: theme.colors.primary }]}>
                        ¥{item.total_revenue.toLocaleString()}
                      </Text>
                    </View>

                    <View style={{ height: 3, backgroundColor: theme.colors.borderLight, borderRadius: 1.5, marginTop: theme.space[1] }}>
                      <View style={{
                        height: 3, width: `${Math.max(barWidth, 0.5)}%`,
                        backgroundColor: isTop3 ? MEDAL_COLORS[index] : theme.colors.primary,
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

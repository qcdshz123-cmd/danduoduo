import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useInventoryTransactions } from '../../../hooks/useInventoryTransactions';
import { Card, Badge, Chip, Skeleton, EmptyState , ScreenHeader } from '../../../components/ui';
import type { InventoryTransaction } from '../../../types/models';
import type { InventoryTransactionType } from '../../../types/enums';

const typeLabel: Record<string, string> = {
  in: '入库', out: '出库', transfer_in: '调入', transfer_out: '调出', adjustment: '盘点', return: '退货',
};

const typeVariant: Record<string, 'success' | 'danger' | 'info' | 'warning'> = {
  in: 'success', out: 'danger', transfer_in: 'info', transfer_out: 'warning', adjustment: 'warning', return: 'info',
};

function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function TransactionHistoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { transactions, isLoading, isRefreshing, error, hasMore, total, refresh, loadMore } = useInventoryTransactions({
    productId: productId || undefined,
    type: typeFilter !== 'all' ? (typeFilter as InventoryTransactionType) : undefined,
  });

  const handleRefresh = useCallback(() => { refresh(); }, [refresh]);
  const handleLoadMore = useCallback(() => { if (hasMore) loadMore(); }, [hasMore, loadMore]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScreenHeader title="交易日志" />

      <View style={{ paddingHorizontal: theme.space[4], paddingBottom: theme.space[2] }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: '全部' },
            { key: 'in', label: '入库' },
            { key: 'out', label: '出库' },
            { key: 'adjustment', label: '盘点' },
            { key: 'transfer_in', label: '调入' },
            { key: 'transfer_out', label: '调出' },
            { key: 'return', label: '退货' },
          ].map((t) => (
            <Chip key={t.key} label={t.label} selected={typeFilter === t.key} onPress={() => setTypeFilter(t.key)} style={{ marginRight: theme.space[2] }} />
          ))}
        </ScrollView>
      </View>

      <Text style={[theme.text.caption, { color: theme.colors.textTertiary, paddingHorizontal: theme.space[4], paddingBottom: theme.space[2] }]}>
        共 {total} 条记录
      </Text>

      {isLoading ? (
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={72} />
          ))}
        </View>
      ) : error ? (
        <EmptyState title="加载失败" description={error} action={{ label: '重试', onPress: refresh }} />
      ) : transactions.length === 0 ? (
        <EmptyState title="暂无交易记录" description="进行入库/出库/盘点操作后将在此显示" />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item: InventoryTransaction) => item.id}
          contentContainerStyle={{ paddingHorizontal: theme.space[4], paddingBottom: theme.space[24] }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            hasMore ? (
              <View style={{ paddingVertical: theme.space[4], alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.colors.textTertiary} />
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const diff = item.after_qty - item.before_qty;
            const variantKey = (item.type ?? 'in') as keyof typeof typeVariant;

            return (
              <Card style={{ marginBottom: theme.space[3] }}>
                <View style={{ flexDirection: 'row', gap: theme.space[3] }}>
                  <View style={{
                    width: 4, borderRadius: 2,
                    backgroundColor: typeVariant[variantKey] === 'success' ? theme.colors.success
                      : typeVariant[variantKey] === 'danger' ? theme.colors.danger
                      : theme.colors.warning,
                  }} />
                  <View style={{ flex: 1, gap: theme.space[1] }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
                        <Badge variant={typeVariant[variantKey]} size="sm">{typeLabel[item.type] || item.type}</Badge>
                        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>{item.product_name ?? '未知商品'}</Text>
                      </View>
                      <Text style={[theme.text.price, { color: diff > 0 ? theme.colors.success : theme.colors.danger }]}>
                        {diff > 0 ? '+' : ''}{item.quantity}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>{item.before_qty} → {item.after_qty}</Text>
                      <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>{formatDateTime(item.created_at)}</Text>
                    </View>
                    {item.created_by_name ? (
                      <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>操作人: {item.created_by_name}</Text>
                    ) : null}
                    {item.notes ? (
                      <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]} numberOfLines={2}>{item.notes}</Text>
                    ) : null}
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useOrders } from '../../../hooks/useOrders';
import { useBatchSelect } from '../../../hooks/useBatchSelect';
import { orderService } from '../../../services/orderService';
import { Tabs, Card, Badge, EmptyState, Skeleton, SearchBar, FAB } from '../../../components/ui';
import type { Order } from '../../../types/models';

const STATUS_TABS = [
  { key: null, label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'confirmed', label: '已确认' },
  { key: 'shipped', label: '已发货' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const statusLabel: Record<string, string> = {
  pending: '待确认', confirmed: '已确认', shipped: '已发货', completed: '已完成', cancelled: '已取消',
};

const statusBadgeVariant: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning', confirmed: 'info', shipped: 'info', completed: 'success', cancelled: 'danger',
};

function timeAgoText(iso: string): string {
  const elapsed = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(elapsed / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

export default function OrdersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { orders, isLoading, isRefreshing, error, hasMore, refresh, loadMore } = useOrders({
    status: activeStatus ?? undefined,
    search: search || undefined,
  });
  const batch = useBatchSelect();

  const handleRefresh = useCallback(() => { refresh(); }, [refresh]);
  const handleLoadMore = useCallback(() => { if (hasMore) loadMore(); }, [hasMore, loadMore]);

  const handleItemPress = useCallback(
    (item: Order) => {
      if (batch.isBatchMode) {
        batch.toggleItem(item.id);
      } else {
        router.push(`/(tabs)/orders/${item.id}`);
      }
    },
    [batch],
  );

  const handleItemLongPress = useCallback(
    (item: Order) => {
      if (!batch.isBatchMode) {
        batch.enterBatchMode(item.id);
      }
    },
    [batch],
  );

  const handleBatchCancel = useCallback(() => {
    Alert.alert('批量取消', `确定取消 ${batch.selectedCount} 个订单吗？`, [
      { text: '返回', style: 'cancel' },
      {
        text: '确定取消',
        style: 'destructive',
        onPress: async () => {
          try {
            const ids = Array.from(batch.selectedIds);
            await Promise.all(ids.map((id) => orderService.cancel(id, '批量取消')));
            batch.clearSelection();
            refresh();
          } catch (e: unknown) {
            Alert.alert('操作失败', e instanceof Error ? e.message : '未知错误');
          }
        },
      },
    ]);
  }, [batch, refresh]);

  const orderTabs = STATUS_TABS.map((t) => ({
    key: t.key ?? '__all__',
    label: t.label,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      {/* Header — batch mode vs normal */}
      {batch.isBatchMode ? (
        <View
          style={{
            paddingTop: insets.top + theme.space[2],
            paddingHorizontal: theme.space[4],
            paddingBottom: theme.space[2],
            backgroundColor: theme.colors.primaryBg,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={batch.exitBatchMode}>
            <Text style={[theme.text.bodyMedium, { color: theme.colors.primary }]}>取消</Text>
          </TouchableOpacity>
          <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>
            已选 {batch.selectedCount} 项
          </Text>
          <TouchableOpacity onPress={() => batch.selectAll(orders.map((o) => o.id))}>
            <Text style={[theme.text.bodyMedium, { color: theme.colors.primary }]}>全选</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={{ paddingTop: insets.top + theme.space[2], paddingHorizontal: theme.space[4], paddingBottom: theme.space[2], backgroundColor: theme.colors.bgPrimary }}>
            <Text style={[theme.text.h2, { color: theme.colors.textPrimary }]}>订单</Text>
          </View>

          <View style={{ paddingBottom: theme.space[2] }}>
            <Tabs
              tabs={orderTabs}
              activeKey={activeStatus ?? '__all__'}
              onChange={(k) => setActiveStatus(k === '__all__' ? null : k)}
            />
          </View>

          <View style={{ paddingHorizontal: theme.space[4], paddingBottom: theme.space[2] }}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="搜索订单号或客户名称..."
            />
          </View>
        </>
      )}

      {isLoading ? (
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={72} />
          ))}
        </View>
      ) : error ? (
        <EmptyState title="加载失败" description="订单数据加载失败，请检查网络后重试" action={{ label: '重试', onPress: refresh }} />
      ) : orders.length === 0 ? (
        <EmptyState title="暂无订单" description="还没有此类订单" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item: Order) => item.id}
          contentContainerStyle={{
            paddingHorizontal: theme.space[4],
            paddingTop: theme.space[2],
            paddingBottom: batch.isBatchMode ? 120 : theme.space[24],
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
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
            const statusColor = theme.orderStatus[item.status] ?? { dot: theme.colors.textTertiary };
            const customerName = item.customer?.name || '散客';
            const itemCount = item.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
            const isSelected = batch.selectedIds.has(item.id);

            return (
              <TouchableOpacity
                onPress={() => handleItemPress(item)}
                onLongPress={() => handleItemLongPress(item)}
                activeOpacity={0.7}
              >
                <Card style={{ marginBottom: theme.space[3], position: 'relative' }} padding={0}>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{
                      width: 4,
                      backgroundColor: statusColor.dot,
                      borderTopLeftRadius: theme.radius['2xl'],
                      borderBottomLeftRadius: theme.radius['2xl'],
                    }} />
                    <View style={{ flex: 1, padding: theme.space[4], gap: theme.space[2] }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
                          <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>{item.order_number}</Text>
                          <Badge variant={statusBadgeVariant[item.status] || 'default'} size="sm">{statusLabel[item.status] || item.status}</Badge>
                        </View>
                        <Text style={[theme.text.priceLg, { color: theme.colors.primary }]}>¥{item.total_amount}</Text>
                      </View>
                      <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>
                        {customerName} · 共{itemCount}件商品 · {timeAgoText(item.created_at)}
                      </Text>
                    </View>
                  </View>

                  {/* Batch select checkbox */}
                  {batch.isBatchMode && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.bgPrimary,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && <Text style={{ color: '#FFF', fontSize: 14 }}>✓</Text>}
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Batch action bar */}
      {batch.isBatchMode && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: insets.bottom + theme.space[3],
            paddingHorizontal: theme.space[4],
            paddingTop: theme.space[3],
            backgroundColor: theme.colors.bgPrimary,
            borderTopWidth: 1,
            borderColor: theme.colors.borderLight,
            flexDirection: 'row',
            gap: theme.space[3],
          }}
        >
          <TouchableOpacity
            onPress={handleBatchCancel}
            disabled={batch.selectedCount === 0}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: theme.radius.md,
              backgroundColor: batch.selectedCount > 0 ? theme.colors.danger : theme.colors.bgSecondary,
              alignItems: 'center',
            }}
          >
            <Text style={[theme.text.bodyMedium, { color: batch.selectedCount > 0 ? '#FFFFFF' : theme.colors.textTertiary }]}>
              批量取消 ({batch.selectedCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FAB — hide in batch mode */}
      {!batch.isBatchMode && (
        <FAB
          icon="+"
          onPress={() => router.push('/(tabs)/orders/create')}
        />
      )}
    </View>
  );
}

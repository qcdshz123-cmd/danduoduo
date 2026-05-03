import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useInventory } from '../../../hooks/useInventory';
import { useBatchSelect } from '../../../hooks/useBatchSelect';
import { Card, Badge, SearchBar, Chip, Skeleton, EmptyState } from '../../../components/ui';
import type { Inventory } from '../../../types/models';
import { StockStatus } from '../../../types/enums';

const stockStatusLabel: Record<StockStatus, string> = {
  in_stock: '正常',
  low_stock: '低库存',
  out_of_stock: '缺货',
  overstock: '超库存',
};

const stockStatusVariant: Record<StockStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
  overstock: 'info',
};

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'all', label: '全部' },
  { key: StockStatus.IN_STOCK, label: '正常' },
  { key: StockStatus.LOW_STOCK, label: '低库存' },
  { key: StockStatus.OUT_OF_STOCK, label: '缺货' },
  { key: StockStatus.OVERSTOCK, label: '超库存' },
];

export default function InventoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    inventory,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    total,
    refresh,
    loadMore,
  } = useInventory({
    search: search || undefined,
    stockStatus: statusFilter !== 'all' ? (statusFilter as StockStatus) : null,
  });
  const batch = useBatchSelect();

  const handleLoadMore = useCallback(() => { if (hasMore) loadMore(); }, [hasMore, loadMore]);

  const handleItemPress = useCallback(
    (item: Inventory) => {
      if (batch.isBatchMode) {
        batch.toggleItem(item.id);
      } else {
        router.push(`/(tabs)/inventory/history?productId=${item.product_id}`);
      }
    },
    [batch],
  );

  const handleItemLongPress = useCallback(
    (item: Inventory) => {
      if (!batch.isBatchMode) {
        batch.enterBatchMode(item.id);
      }
    },
    [batch],
  );

  const outOfStockCount = inventory.filter((i) => i.stock_status === 'out_of_stock').length;
  const lowStockCount = inventory.filter((i) => i.stock_status === 'low_stock').length;
  const overstockCount = inventory.filter((i) => i.stock_status === 'overstock').length;

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
          <TouchableOpacity onPress={() => batch.selectAll(inventory.map((i) => i.id))}>
            <Text style={[theme.text.bodyMedium, { color: theme.colors.primary }]}>全选</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{
          paddingTop: insets.top + theme.space[2],
          paddingHorizontal: theme.space[4],
          backgroundColor: theme.colors.bgPrimary,
        }}>
          <Text style={[theme.text.h2, { color: theme.colors.textPrimary, marginBottom: theme.space[3] }]}>
            库存
          </Text>

          {/* 概览卡片 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: theme.space[3] }}
          >
            <Card variant="filled" style={{ marginRight: theme.space[3], minWidth: 120, alignItems: 'center' }}>
              <Text style={[theme.text.priceLg, { color: theme.colors.textPrimary }]}>{total}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>总SKU</Text>
            </Card>
            <Card variant="filled" style={{ marginRight: theme.space[3], minWidth: 120, alignItems: 'center', backgroundColor: theme.colors.warningBg }}>
              <Text style={[theme.text.priceLg, { color: theme.colors.warning }]}>{lowStockCount + outOfStockCount}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.warning }]}>低库存/缺货</Text>
            </Card>
            <Card variant="filled" style={{ marginRight: theme.space[3], minWidth: 120, alignItems: 'center', backgroundColor: theme.colors.infoBg }}>
              <Text style={[theme.text.priceLg, { color: theme.colors.info }]}>{overstockCount}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.info }]}>超库存</Text>
            </Card>
          </ScrollView>

          {/* 搜索栏 */}
          <View style={{ marginBottom: theme.space[2] }}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="搜索商品名称或编号..." />
          </View>

          {/* 状态筛选 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingBottom: theme.space[2] }}
          >
            {STATUS_FILTERS.map((s) => (
              <Chip
                key={s.key}
                label={s.label}
                selected={statusFilter === s.key}
                onPress={() => setStatusFilter(s.key)}
                style={{ marginRight: theme.space[2] }}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* 列表区域 */}
      {isLoading ? (
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={80} />
          ))}
        </View>
      ) : error ? (
        <EmptyState
          title="加载失败"
          description={error}
          action={{ label: '重试', onPress: refresh }}
        />
      ) : inventory.length === 0 ? (
        <EmptyState title="暂无库存" description={search ? '未找到匹配的商品' : '请先添加商品'} />
      ) : (
        <FlatList
          data={inventory}
          keyExtractor={(item: Inventory) => item.id}
          contentContainerStyle={{
            paddingHorizontal: theme.space[4],
            paddingBottom: batch.isBatchMode ? 120 : theme.space[24],
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
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
            const status = item.stock_status ?? 'in_stock';
            const maxStock = item.max_stock ?? 200;
            const fillPct = maxStock > 0 ? Math.min(item.quantity / maxStock, 1) * 100 : 50;
            const barColor =
              status === 'out_of_stock' ? theme.colors.danger :
              status === 'low_stock' ? theme.colors.warning :
              theme.colors.success;
            const isSelected = batch.selectedIds.has(item.id);

            return (
              <TouchableOpacity
                onPress={() => handleItemPress(item)}
                onLongPress={() => handleItemLongPress(item)}
                activeOpacity={0.7}
              >
                <Card style={{ marginBottom: theme.space[3], position: 'relative' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
                    <View style={{
                      width: 48, height: 48, borderRadius: theme.radius.md,
                      backgroundColor: theme.colors.bgSecondary,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 20 }}>📦</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                          {item.product_name ?? '未知商品'}
                        </Text>
                        <Badge variant={stockStatusVariant[status]} size="sm">
                          {stockStatusLabel[status]}
                        </Badge>
                      </View>

                      {item.product_code ? (
                        <Text style={[theme.text.mono, { color: theme.colors.textTertiary, fontSize: theme.font.size.xs }]}>
                          {item.product_code}
                        </Text>
                      ) : null}
                      {item.variant_spec ? (
                        <Text style={[theme.text.mono, { color: theme.colors.textTertiary, fontSize: theme.font.size.xs }]}>
                          {item.variant_spec}
                        </Text>
                      ) : null}

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.space[1] }}>
                        <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>
                          库存: {item.quantity}
                        </Text>
                        <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>
                          预警: {item.min_stock}
                        </Text>
                      </View>

                      <View style={{ height: 3, backgroundColor: theme.colors.borderLight, borderRadius: 1.5, marginTop: theme.space[1] }}>
                        <View style={{
                          height: 3, width: `${fillPct}%`,
                          backgroundColor: barColor, borderRadius: 1.5,
                        }} />
                      </View>
                    </View>
                  </View>

                  {/* Batch select checkbox */}
                  {batch.isBatchMode && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
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
            onPress={() => {
              Alert.alert('批量操作', `已选择 ${batch.selectedCount} 项库存`, [
                { text: '取消', style: 'cancel' },
                {
                  text: '批量入库',
                  onPress: () => {
                    const ids = Array.from(batch.selectedIds);
                    batch.clearSelection();
                    router.push({
                      pathname: '/(tabs)/inventory/stock-in',
                      params: { preselected: ids.join(',') },
                    });
                  },
                },
              ]);
            }}
            disabled={batch.selectedCount === 0}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: theme.radius.md,
              backgroundColor: batch.selectedCount > 0 ? theme.colors.primary : theme.colors.bgSecondary,
              alignItems: 'center',
            }}
          >
            <Text style={[theme.text.bodyMedium, { color: batch.selectedCount > 0 ? '#FFFFFF' : theme.colors.textTertiary }]}>
              批量入库 ({batch.selectedCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 快捷操作按钮 — hide in batch mode */}
      {!batch.isBatchMode && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: theme.space[4], paddingBottom: theme.space[8],
          backgroundColor: theme.colors.bgPrimary,
          borderTopWidth: 1, borderTopColor: theme.colors.borderLight,
          flexDirection: 'row', gap: theme.space[2],
        }}>
          {([
            { label: '入库', route: '/(tabs)/inventory/stock-in' },
            { label: '出库', route: '/(tabs)/inventory/stock-out' },
            { label: '调拨', route: '/(tabs)/inventory/transfer' },
            { label: '盘点', route: '/(tabs)/inventory/adjustments' },
          ] as const).map((btn) => (
            <Card
              key={btn.route}
              onPress={() => router.push(btn.route)}
              style={{ flex: 1, alignItems: 'center', paddingVertical: theme.space[2] }}
              variant="filled"
            >
              <Text style={[theme.text.bodySmall, { color: theme.colors.primary }]}>{btn.label}</Text>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

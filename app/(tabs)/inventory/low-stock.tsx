import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useInventory } from '../../../hooks/useInventory';
import { Card, Badge, Skeleton, EmptyState , ScreenHeader } from '../../../components/ui';
import type { Inventory } from '../../../types/models';

export default function LowStockScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { inventory, isLoading, isRefreshing, error, refresh, hasMore, loadMore } = useInventory({
    stockStatus: 'low_stock',
  });

  const handleRefresh = useCallback(() => { refresh(); }, [refresh]);
  const handleLoadMore = useCallback(() => { if (hasMore) loadMore(); }, [hasMore, loadMore]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScreenHeader title="低库存预警" />

      {isLoading ? (
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={80} />
          ))}
        </View>
      ) : error ? (
        <EmptyState title="加载失败" description={error} action={{ label: '重试', onPress: refresh }} />
      ) : inventory.length === 0 ? (
        <EmptyState title="暂无低库存商品" description="所有商品库存状态正常" />
      ) : (
        <FlatList
          data={inventory}
          keyExtractor={(item: Inventory) => item.id}
          contentContainerStyle={{ padding: theme.space[4], paddingBottom: theme.space[24] }}
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
            const fillPct = (item.max_stock ?? 200) > 0
              ? Math.min(item.quantity / (item.max_stock ?? 200), 1) * 100
              : 0;

            return (
              <Card
                onPress={() => router.push(`/(tabs)/inventory/history?productId=${item.product_id}`)}
                style={{ marginBottom: theme.space[3] }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
                  <View style={{
                    width: 48, height: 48, borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.warningBg,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 20 }}>⚠️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                        {item.product_name ?? '未知商品'}
                      </Text>
                      <Badge variant="warning" size="sm">低库存</Badge>
                    </View>
                    {item.product_code ? (
                      <Text style={[theme.text.mono, { color: theme.colors.textTertiary, fontSize: theme.font.size.xs }]}>{item.product_code}</Text>
                    ) : null}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.space[1] }}>
                      <Text style={[theme.text.bodySmall, { color: theme.colors.warning }]}>
                        当前库存: {item.quantity}（预警线: {item.min_stock}）
                      </Text>
                    </View>
                    <View style={{ height: 3, backgroundColor: theme.colors.borderLight, borderRadius: 1.5, marginTop: theme.space[1] }}>
                      <View style={{ height: 3, width: `${fillPct}%`, backgroundColor: theme.colors.warning, borderRadius: 1.5 }} />
                    </View>
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

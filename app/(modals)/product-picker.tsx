import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useProducts } from '../../hooks/useProducts';
import { useOrderDraftStore } from '../../stores/orderDraftStore';
import { SearchBar, Badge, Skeleton, EmptyState } from '../../components/ui';
import type { Product } from '../../types/models';

export default function ProductPickerModal() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const { products, isLoading, error, refresh } = useProducts({ search: search || undefined, limit: 50 });
  const cartItems = useOrderDraftStore((s) => s.cartItems);
  const addToCart = useOrderDraftStore((s) => s.addToCart);

  // Derive already-selected IDs from the store, refreshed every render
  const cartProductIds = useMemo(
    () => new Set(cartItems.map((entry) => entry.product.id)),
    [cartItems],
  );

  // Track local toggles (added/removed within this picker session)
  const [toggled, setToggled] = useState<Set<string>>(new Set());

  // Effective selection: cart items + local toggles
  const selectedIds = useMemo(() => {
    const ids = new Set(cartProductIds);
    toggled.forEach((id) => {
      ids.has(id) ? ids.delete(id) : ids.add(id);
    });
    return ids;
  }, [cartProductIds, toggled]);

  const handleToggle = useCallback((product: Product) => {
    setToggled((prev) => {
      const next = new Set(prev);
      next.has(product.id) ? next.delete(product.id) : next.add(product.id);
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const selected = products.filter((p) => selectedIds.has(p.id));
    if (selected.length === 0) {
      Alert.alert('提示', '请至少选择一个商品');
      return;
    }
    addToCart(selected);
    router.back();
  }, [products, selectedIds, addToCart]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <View style={{
        paddingTop: insets.top + theme.space[2],
        paddingHorizontal: theme.space[4], paddingBottom: theme.space[2],
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: theme.colors.bgPrimary,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>取消</Text>
        </TouchableOpacity>
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>
          添加商品 {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
        </Text>
        <TouchableOpacity onPress={handleConfirm}>
          <Text style={[theme.text.body, { color: selectedIds.size > 0 ? theme.colors.primary : theme.colors.textTertiary }]}>确定</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: theme.space[4], paddingBottom: theme.space[2] }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="搜索商品名称或编号..." />
      </View>

      {isLoading ? (
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={64} />
          ))}
        </View>
      ) : error ? (
        <EmptyState title="加载失败" description={error} action={{ label: '重试', onPress: refresh }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item: Product) => item.id}
          contentContainerStyle={{ paddingHorizontal: theme.space[4], paddingBottom: selectedIds.size > 0 ? theme.space[24] : theme.space[8] }}
          renderItem={({ item }) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <TouchableOpacity
                onPress={() => handleToggle(item)}
                style={{
                  flexDirection: 'row', alignItems: 'center', paddingVertical: theme.space[3],
                  borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight, gap: theme.space[3],
                }}
              >
                <View style={{
                  width: 22, height: 22, borderRadius: 6, borderWidth: 2,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.borderDefault,
                  backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2], marginTop: 2 }}>
                    <Text style={[theme.text.mono, { color: theme.colors.textTertiary, fontSize: theme.font.size.xs }]}>{item.code}</Text>
                    {item.stock_quantity !== undefined && (
                      <Badge variant={item.stock_quantity <= item.min_stock ? 'warning' : 'default'} size="sm">
                        库存 {item.stock_quantity}
                      </Badge>
                    )}
                  </View>
                </View>
                <Text style={[theme.text.price, { color: theme.colors.primary }]}>¥{item.base_price}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <EmptyState title="暂无商品" description={search ? '未找到匹配的商品' : '请先添加商品'} />
          }
        />
      )}

      {selectedIds.size > 0 && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: theme.space[4], paddingBottom: theme.space[8],
          backgroundColor: theme.colors.bgPrimary,
          borderTopWidth: 1, borderTopColor: theme.colors.borderLight,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>已选 {selectedIds.size} 件</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={[theme.text.button, { color: theme.colors.primary }]}>确认添加</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

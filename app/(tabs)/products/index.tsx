import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useProducts } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
import { useBatchSelect } from '../../../hooks/useBatchSelect';
import { productService } from '../../../services/productService';
import { SearchBar, Chip, Card, Badge, Skeleton, EmptyState, FAB } from '../../../components/ui';
import type { Product } from '../../../types/models';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function ProductsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { products, isLoading, error, refresh } = useProducts({
    search: search || undefined,
    categoryId: activeCategory ?? undefined,
  });
  const { categories } = useCategories();
  const batch = useBatchSelect();

  const stockVariant = (qty: number | undefined, min: number | undefined): 'success' | 'warning' | 'danger' => {
    const stock = qty ?? 0;
    if (stock <= 0) return 'danger';
    if (stock <= (min ?? 0)) return 'warning';
    return 'success';
  };

  const handleItemPress = useCallback(
    (item: Product) => {
      if (batch.isBatchMode) {
        batch.toggleItem(item.id);
      } else {
        router.push(`/(tabs)/products/${item.id}`);
      }
    },
    [batch],
  );

  const handleItemLongPress = useCallback(
    (item: Product) => {
      if (!batch.isBatchMode) {
        batch.enterBatchMode(item.id);
      }
    },
    [batch],
  );

  const handleBatchDelete = useCallback(() => {
    Alert.alert('批量删除', `确定删除 ${batch.selectedCount} 个商品吗？此操作不可撤销。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            const ids = Array.from(batch.selectedIds);
            await Promise.all(ids.map((id) => productService.delete(id)));
            batch.clearSelection();
            refresh();
          } catch (e: unknown) {
            Alert.alert('删除失败', e instanceof Error ? e.message : '未知错误');
          }
        },
      },
    ]);
  }, [batch, refresh]);

  const renderProductCard = useCallback(
    ({ item }: { item: Product }) => {
      const isSelected = batch.selectedIds.has(item.id);

      return (
        <TouchableOpacity
          onPress={() => handleItemPress(item)}
          onLongPress={() => handleItemLongPress(item)}
          activeOpacity={0.7}
          style={{ width: viewMode === 'grid' ? CARD_WIDTH : '100%', marginBottom: theme.space[3] }}
        >
          <Card padding={0} style={{ position: 'relative' }}>
            <View
              style={{
                width: '100%',
                height: viewMode === 'grid' ? 160 : 80,
                backgroundColor: theme.isDark ? theme.colors.bgTertiary : theme.colors.bgSecondary,
                borderTopLeftRadius: theme.radius['2xl'],
                borderTopRightRadius: theme.radius['2xl'],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 32, opacity: 0.3 }}>📦</Text>
            </View>
            <View style={{ padding: theme.space[3], gap: theme.space[1] }}>
              <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[theme.text.mono, { color: theme.colors.textTertiary }]}>
                {item.code}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[theme.text.price, { color: theme.colors.primary }]}>
                  ¥{item.base_price}
                </Text>
                <Badge
                  variant={stockVariant(item.stock_quantity, item.min_stock)}
                  size="sm"
                >
                  {(item.stock_quantity ?? 0) > 0 ? `${item.stock_quantity}件` : '售罄'}
                </Badge>
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
    },
    [theme, viewMode, batch, handleItemPress, handleItemLongPress, stockVariant],
  );

  const categoryChips = [
    { id: null, name: '全部' },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ];

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
          <TouchableOpacity
            onPress={() => batch.selectAll(products.map((p) => p.id))}
          >
            <Text style={[theme.text.bodyMedium, { color: theme.colors.primary }]}>全选</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            paddingTop: insets.top + theme.space[2],
            paddingHorizontal: theme.space[4],
            paddingBottom: theme.space[2],
            backgroundColor: theme.colors.bgPrimary,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2], marginBottom: theme.space[3] }}>
            <View style={{ flex: 1 }}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="搜索商品名称或编号..."
              />
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/products/scan')}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: theme.colors.bgSecondary,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: theme.colors.bgSecondary,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>{viewMode === 'grid' ? '☰' : '⊞'}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categoryChips}
            keyExtractor={(item) => item.id ?? '__all__'}
            contentContainerStyle={{ gap: theme.space[2] }}
            renderItem={({ item }) => (
              <Chip
                label={item.name}
                selected={activeCategory === item.id}
                onPress={() => setActiveCategory(item.id)}
              />
            )}
          />
        </View>
      )}

      {/* Product list */}
      {isLoading ? (
        <View style={{ padding: theme.space[4], flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[3] }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" width={CARD_WIDTH} height={240} />
          ))}
        </View>
      ) : error ? (
        <EmptyState
          title="加载失败"
          description={error}
          action={{ label: '重试', onPress: refresh }}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="暂无商品"
          description="点击 + 创建第一个商品"
          action={{ label: '创建商品', onPress: () => router.push('/(tabs)/products/create') }}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          columnWrapperStyle={
            viewMode === 'grid'
              ? { gap: theme.space[3], paddingHorizontal: theme.space[4] }
              : undefined
          }
          contentContainerStyle={{
            paddingTop: theme.space[3],
            paddingBottom: batch.isBatchMode ? 120 : theme.space[24],
            paddingHorizontal: viewMode === 'grid' ? 0 : theme.space[4],
          }}
          renderItem={renderProductCard}
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
            onPress={handleBatchDelete}
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
              删除 ({batch.selectedCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FAB — hide in batch mode */}
      {!batch.isBatchMode && (
        <View style={{ position: 'absolute', bottom: theme.space[4] + 34, right: theme.space[4] }}>
          <FAB
            icon={<Text style={{ color: '#FFF', fontSize: 24, lineHeight: 28 }}>+</Text>}
            onPress={() => router.push('/(tabs)/products/create')}
          />
        </View>
      )}
    </View>
  );
}

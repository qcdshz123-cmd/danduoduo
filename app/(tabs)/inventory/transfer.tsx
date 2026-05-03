import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useProducts } from '../../../hooks/useProducts';
import { inventoryService } from '../../../services/inventoryService';
import { Card, Input, Button, SearchBar, Skeleton, EmptyState } from '../../../components/ui';
import type { Product } from '../../../types/models';

export default function TransferScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { products, isLoading } = useProducts({ search: search || undefined, limit: 20 });

  const currentStock = selectedProduct?.stock_quantity ?? 0;
  const parsedQty = parseInt(quantity, 10) || 0;
  const isValid = selectedProduct && parsedQty > 0 && parsedQty <= currentStock;

  const handleSubmit = useCallback(async () => {
    if (!selectedProduct || !isValid) return;
    setSubmitting(true);
    try {
      await inventoryService.transfer({
        product_id: selectedProduct.id,
        quantity: parsedQty,
        from_location: fromLocation || null,
        to_location: toLocation || null,
        notes: notes || null,
      });
      Alert.alert('调拨成功', `${selectedProduct.name} 调拨 ${parsedQty} 件`, [
        { text: '返回', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert('调拨失败', e instanceof Error ? e.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  }, [selectedProduct, parsedQty, fromLocation, toLocation, notes, isValid]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <View style={{
        paddingTop: insets.top + theme.space[2],
        paddingHorizontal: theme.space[4],
        paddingBottom: theme.space[2],
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.colors.bgPrimary,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>← 返回</Text>
        </TouchableOpacity>
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>调拨</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[4], gap: theme.space[4], paddingBottom: theme.space[24] }}>
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>选择商品</Text>
          <SearchBar value={search} onChangeText={setSearch} placeholder="搜索商品名称或编号..." />

          {selectedProduct ? (
            <View style={{
              marginTop: theme.space[3], padding: theme.space[3],
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.primaryBg,
              borderWidth: 1, borderColor: theme.colors.primary,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>{selectedProduct.name}</Text>
                  <Text style={[theme.text.mono, { color: theme.colors.textTertiary, fontSize: theme.font.size.xs }]}>{selectedProduct.code}</Text>
                  <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>当前库存: {currentStock}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                  <Text style={[theme.text.caption, { color: theme.colors.danger }]}>更换</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : isLoading ? (
            <View style={{ marginTop: theme.space[3], gap: theme.space[2] }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rect" height={48} />
              ))}
            </View>
          ) : (
            <View style={{ marginTop: theme.space[3] }}>
              {products.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => { setSelectedProduct(p); setSearch(''); }}
                  style={{
                    paddingVertical: theme.space[2],
                    borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight,
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>{p.name}</Text>
                    <Text style={[theme.text.mono, { color: theme.colors.textTertiary, fontSize: theme.font.size.xs }]}>{p.code}</Text>
                  </View>
                  <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>库存 {p.stock_quantity ?? 0}</Text>
                </TouchableOpacity>
              ))}
              {products.length === 0 && search ? (
                <EmptyState title="无匹配商品" description="尝试更换搜索关键词" />
              ) : null}
            </View>
          )}
        </Card>

        {selectedProduct && (
          <>
            <Card>
              <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>调拨数量</Text>
              <Input value={quantity} onChangeText={setQuantity} placeholder="输入调拨数量" keyboardType="number-pad" />
              {parsedQty > 0 && parsedQty > currentStock && (
                <Text style={[theme.text.caption, { color: theme.colors.danger, marginTop: theme.space[1] }]}>
                  调拨数量不能超过当前库存 ({currentStock})
                </Text>
              )}
            </Card>
            <Card>
              <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>调出仓库（选填）</Text>
              <Input value={fromLocation} onChangeText={setFromLocation} placeholder="例如：总仓" />
            </Card>
            <Card>
              <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>调入仓库（选填）</Text>
              <Input value={toLocation} onChangeText={setToLocation} placeholder="例如：门店A" />
            </Card>
            <Card>
              <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>备注（选填）</Text>
              <Input value={notes} onChangeText={setNotes} placeholder="调拨原因..." />
            </Card>
          </>
        )}
      </ScrollView>

      {selectedProduct && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: theme.space[4], paddingBottom: theme.space[8],
          backgroundColor: theme.colors.bgPrimary,
          borderTopWidth: 1, borderTopColor: theme.colors.borderLight,
        }}>
          <Button
            variant="primary" size="lg" fullWidth
            loading={submitting} disabled={!isValid}
            onPress={handleSubmit}
          >
            确认调拨 {parsedQty > 0 ? `${parsedQty} 件` : ''}
          </Button>
        </View>
      )}
    </View>
  );
}

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useProducts } from '../../../hooks/useProducts';
import { inventoryService } from '../../../services/inventoryService';
import { Card, Input, Button, SearchBar, Skeleton, EmptyState } from '../../../components/ui';
import type { Product } from '../../../types/models';

export default function AdjustmentsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { products, isLoading } = useProducts({ search: search || undefined, limit: 20 });

  const currentStock = selectedProduct?.stock_quantity ?? 0;
  const parsedNewQty = parseInt(newQuantity, 10);
  const isValid = selectedProduct && !isNaN(parsedNewQty) && parsedNewQty >= 0 && reason.trim().length > 0;
  const diff = !isNaN(parsedNewQty) ? parsedNewQty - currentStock : 0;

  const handleSubmit = useCallback(async () => {
    if (!selectedProduct || !isValid) return;
    setSubmitting(true);
    try {
      await inventoryService.adjust({
        product_id: selectedProduct.id,
        new_quantity: parsedNewQty,
        reason: reason.trim(),
      });
      Alert.alert('盘点成功', `${selectedProduct.name} 库存已调整为 ${parsedNewQty}`, [
        { text: '返回', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert('盘点失败', e instanceof Error ? e.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  }, [selectedProduct, parsedNewQty, reason, isValid]);

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
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>盘点调整</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[4], gap: theme.space[4], paddingBottom: theme.space[24] }}>
        {/* 商品选择 */}
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
                  <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>系统库存: {currentStock}</Text>
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
                  onPress={() => { setSelectedProduct(p); setNewQuantity(String(p.stock_quantity ?? 0)); setSearch(''); }}
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

        {/* 盘点调整 */}
        {selectedProduct && (
          <>
            <Card>
              <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>实际盘点数量</Text>
              <Input
                value={newQuantity}
                onChangeText={setNewQuantity}
                placeholder="输入实际盘点数量"
                keyboardType="number-pad"
              />
              {!isNaN(parsedNewQty) && diff !== 0 && (
                <Text style={[theme.text.caption, {
                  color: diff > 0 ? theme.colors.success : theme.colors.danger,
                  marginTop: theme.space[1],
                }]}>
                  差异: {diff > 0 ? '+' : ''}{diff}（{diff > 0 ? '盘盈' : '盘亏'}）
                </Text>
              )}
            </Card>

            <Card>
              <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>调整原因</Text>
              <Input
                value={reason}
                onChangeText={setReason}
                placeholder="请填写盘点差异原因..."
                multiline
                numberOfLines={3}
              />
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
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!isValid}
            onPress={handleSubmit}
          >
            确认调整为 {!isNaN(parsedNewQty) ? parsedNewQty : '--'}
          </Button>
        </View>
      )}
    </View>
  );
}

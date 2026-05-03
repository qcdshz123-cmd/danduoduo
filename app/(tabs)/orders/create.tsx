import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useOrderDraftStore } from '../../../stores/orderDraftStore';
import { orderService, CreateOrderDto } from '../../../services/orderService';
import { Card, Input, Button, Stepper, Badge } from '../../../components/ui';

export default function CreateOrderScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const cartItems = useOrderDraftStore((s) => s.cartItems);
  const selectedCustomer = useOrderDraftStore((s) => s.selectedCustomer);
  const notes = useOrderDraftStore((s) => s.notes);
  const updateQty = useOrderDraftStore((s) => s.updateQty);
  const removeFromCart = useOrderDraftStore((s) => s.removeFromCart);
  const setNotes = useOrderDraftStore((s) => s.setNotes);
  const clearDraft = useOrderDraftStore((s) => s.clearDraft);

  const subtotal = cartItems.reduce((sum, i) => sum + i.product.base_price * i.quantity, 0);
  const total = subtotal;

  const handlePickCustomer = useCallback(() => {
    router.push('/(modals)/customer-picker');
  }, []);

  const handleAddProduct = useCallback(() => {
    router.push('/(modals)/product-picker');
  }, []);

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      Alert.alert('提示', '请至少添加一个商品');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const dto: CreateOrderDto = {
        customer_id: selectedCustomer?.id ?? null,
        notes: notes || null,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          variant_id: null,
          product_name: item.product.name,
          sku: item.product.code ?? null,
          quantity: item.quantity,
          unit: item.product.unit || '件',
          unit_price: item.product.base_price,
        })),
      };

      const order = await orderService.create(dto);
      clearDraft();
      Alert.alert('开单成功', `订单 ${order.order_number} 已创建`, [
        { text: '查看订单', onPress: () => router.replace(`/(tabs)/orders/${order.id}`) },
        { text: '继续开单', onPress: () => {} },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '创建订单失败';
      setSubmitError(msg);
      Alert.alert('开单失败', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const customerName = selectedCustomer?.name ?? null;
  const customerPhone = selectedCustomer?.phone ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <View style={{
        paddingTop: insets.top, paddingHorizontal: theme.space[4], paddingBottom: theme.space[2],
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        height: theme.layout.headerHeight + insets.top,
      }}>
        <TouchableOpacity onPress={() => {
          if (cartItems.length > 0) {
            Alert.alert('放弃开单', '当前已添加商品，确定放弃吗？', [
              { text: '继续编辑', style: 'cancel' },
              { text: '放弃', style: 'destructive', onPress: () => { clearDraft(); router.back(); } },
            ]);
          } else {
            clearDraft(); router.back();
          }
        }}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>取消</Text>
        </TouchableOpacity>
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>开单</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/orders/scan-order')}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>扫码</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[4], gap: theme.space[4], paddingBottom: theme.space[24] }}>
        {/* Customer selection */}
        <Card variant="outlined" onPress={handlePickCustomer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: selectedCustomer ? theme.colors.primaryBg : theme.colors.bgSecondary,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              {selectedCustomer ? (
                <>
                  <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>{customerName}</Text>
                  {customerPhone ? (
                    <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>{customerPhone}</Text>
                  ) : null}
                </>
              ) : (
                <>
                  <Text style={[theme.text.body, { color: theme.colors.textSecondary }]}>选择客户</Text>
                  <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary }]}>散客 (不选默认为散客)</Text>
                </>
              )}
            </View>
            <Text style={{ color: theme.colors.textTertiary }}>›</Text>
          </View>
        </Card>

        {/* Cart items */}
        <Card>
          <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, marginBottom: theme.space[3] }]}>
            商品列表 {cartItems.length > 0 ? `(${cartItems.length})` : ''}
          </Text>
          {cartItems.length === 0 ? (
            <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary, marginBottom: theme.space[2] }]}>
              暂无商品，请添加
            </Text>
          ) : (
            cartItems.map((item) => (
              <View
                key={item.product.id}
                style={{ paddingVertical: theme.space[3], borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight, gap: theme.space[2] }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>{item.product.name}</Text>
                    <Text style={[theme.text.mono, { color: theme.colors.textTertiary, marginTop: 2 }]}>{item.product.code}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.product.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ color: theme.colors.danger, fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stepper
                    value={item.quantity}
                    minValue={1}
                    maxValue={item.product.stock_quantity ?? 999}
                    onChange={(v: number) => updateQty(item.product.id, v)}
                  />
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>¥{item.product.base_price}</Text>
                    <Text style={[theme.text.price, { color: theme.colors.primary, marginTop: 2 }]}>
                      ¥{(item.product.base_price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
                {item.product.stock_quantity !== undefined && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[1] }}>
                    <Badge variant="info" size="sm">库存 {item.product.stock_quantity}</Badge>
                  </View>
                )}
              </View>
            ))
          )}

          <Button variant="ghost" size="sm" fullWidth onPress={handleAddProduct} style={{ marginTop: theme.space[3] }}>
            + 添加商品
          </Button>
        </Card>

        {/* Notes */}
        <Card>
          <Input
            placeholder="备注信息（选填）"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </Card>

        {/* Error */}
        {submitError && (
          <View style={{ padding: theme.space[3], backgroundColor: theme.colors.dangerBg, borderRadius: theme.radius.lg }}>
            <Text style={[theme.text.bodySmall, { color: theme.colors.danger }]}>{submitError}</Text>
          </View>
        )}

        {/* Summary */}
        <Card>
          <View style={{ gap: theme.space[2] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>
                小计 ({cartItems.length} 种商品)
              </Text>
              <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>¥{subtotal.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>折扣</Text>
              <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>¥0</Text>
            </View>
            <View style={{ height: 1, backgroundColor: theme.colors.borderLight }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>合计</Text>
              <Text style={[theme.text.priceLg, { color: theme.colors.primary }]}>¥{total.toFixed(2)}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom submit */}
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
          disabled={cartItems.length === 0}
          onPress={handleSubmit}
        >
          提交订单 (¥{total.toFixed(2)})
        </Button>
      </View>
    </View>
  );
}

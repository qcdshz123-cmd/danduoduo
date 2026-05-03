import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useOrder } from '../../../hooks/useOrder';
import { Card, Badge, Divider, Button, Skeleton, EmptyState } from '../../../components/ui';
import type { Order, OrderItem, Payment, OrderStatusHistory } from '../../../types/models';

const statusLabel: Record<string, string> = {
  pending: '待确认', confirmed: '已确认', shipped: '已发货', completed: '已完成', cancelled: '已取消',
};

const statusBadgeVariant: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning', confirmed: 'info', shipped: 'info', completed: 'success', cancelled: 'danger',
};

const paymentMethodLabel: Record<string, string> = {
  cash: '现金', wechat: '微信支付', alipay: '支付宝', bank_transfer: '银行转账',
};

const statusStepLabel: Record<string, string> = {
  pending: '创建订单', confirmed: '确认订单', shipped: '已发货', completed: '已完成', cancelled: '已取消',
};

function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function OrderDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id, paymentRecorded } = useLocalSearchParams<{ id: string; paymentRecorded?: string }>();
  const { order, isLoading, error, refresh, confirm, ship, complete, cancelAction, actionLoading } = useOrder(id);

  // 从收款弹窗返回后自动刷新
  const prevPaymentRecorded = useRef(paymentRecorded);
  useEffect(() => {
    if (paymentRecorded && paymentRecorded !== prevPaymentRecorded.current) {
      prevPaymentRecorded.current = paymentRecorded;
      refresh();
    }
  }, [paymentRecorded, refresh]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
        <View style={{ paddingTop: insets.top + theme.space[2], paddingHorizontal: theme.space[4], paddingBottom: theme.space[2], flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[theme.text.body, { color: theme.colors.primary }]}>← 返回</Text>
          </TouchableOpacity>
        </View>
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          <Skeleton variant="rect" height={88} />
          <Skeleton variant="rect" height={80} />
          <Skeleton variant="rect" height={200} />
          <Skeleton variant="rect" height={160} />
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
        <View style={{ paddingTop: insets.top + theme.space[2], paddingHorizontal: theme.space[4], paddingBottom: theme.space[2], flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[theme.text.body, { color: theme.colors.primary }]}>← 返回</Text>
          </TouchableOpacity>
        </View>
        <EmptyState
          title="加载失败"
          description={error ?? '订单不存在'}
          action={{ label: '重试', onPress: refresh }}
        />
      </View>
    );
  }

  const customerName = order.customer?.name ?? '散客';
  const customerPhone = order.customer?.phone;
  const customerAddress = order.customer?.address;
  const items: OrderItem[] = order.items ?? [];
  const payments: Payment[] = order.payments ?? [];
  const history: OrderStatusHistory[] = order.status_history ?? [];

  const showConfirm = order.status === 'pending';
  const showShip = order.status === 'confirmed';
  const showComplete = order.status === 'shipped';
  const showCancel = order.status === 'pending' || order.status === 'confirmed';
  const unpaidAmount = order.total_amount - order.paid_amount;
  const showRecordPayment = order.status !== 'cancelled' && unpaidAmount > 0;
  const hasBottomActions = showConfirm || showShip || showComplete || showCancel || showRecordPayment;

  const handleConfirm = async () => {
    try { await confirm(); } catch (e) {
      console.error('confirm order failed', e);
      Alert.alert('操作失败', '确认订单失败，请重试');
    }
  };

  const handleShip = async () => {
    try { await ship(); } catch (e) {
      console.error('ship order failed', e);
      Alert.alert('操作失败', '发货操作失败，请重试');
    }
  };

  const handleComplete = async () => {
    try { await complete(); } catch (e) {
      console.error('complete order failed', e);
      Alert.alert('操作失败', '完成订单失败，请重试');
    }
  };

  const handleCancel = () => {
    Alert.alert('取消订单', '确定要取消此订单吗？取消后库存将恢复。', [
      { text: '再想想', style: 'cancel' },
      {
        text: '确认取消', style: 'destructive',
        onPress: async () => {
          try { await cancelAction(); } catch (e) {
            console.error('cancel order failed', e);
            Alert.alert('操作失败', '取消订单失败，请重试');
          }
        },
      },
    ]);
  };

  const handleRecordPayment = () => {
    router.push({
      pathname: '/(modals)/record-payment',
      params: { orderId: order.id, unpaidAmount: unpaidAmount.toString() },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + theme.space[2],
        paddingHorizontal: theme.space[4],
        paddingBottom: theme.space[2],
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.colors.bgPrimary,
      }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>← 返回</Text>
        </TouchableOpacity>
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>订单详情</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: theme.space[4], gap: theme.space[4],
          paddingBottom: hasBottomActions ? 140 : theme.space[8],
        }}
      >
        {/* Order header card */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.space[2] }}>
            <Text style={[theme.text.mono, { color: theme.colors.textPrimary, fontSize: theme.font.size.sm }]}>{order.order_number}</Text>
            <Badge variant={statusBadgeVariant[order.status] || 'default'}>{statusLabel[order.status] || order.status}</Badge>
          </View>
          <Text style={[theme.text.priceLg, { color: theme.colors.primary, fontSize: 24 }]}>¥{order.total_amount}</Text>
          {order.payment_status !== 'paid' && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.space[2], paddingTop: theme.space[2], borderTopWidth: 1, borderTopColor: theme.colors.borderLight }}>
              <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>
                已收款 ¥{order.paid_amount} · 待收 ¥{order.total_amount - order.paid_amount}
              </Text>
              <Badge variant={order.payment_status === 'partial' ? 'warning' : 'default'} size="sm">
                {order.payment_status === 'unpaid' ? '未付款' : order.payment_status === 'partial' ? '部分付款' : '已付款'}
              </Badge>
            </View>
          )}
        </Card>

        {/* Customer info */}
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>客户信息</Text>
          <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>{customerName}</Text>
          {customerPhone ? (
            <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary, marginTop: theme.space[1] }]}>{customerPhone}</Text>
          ) : null}
          {customerAddress ? (
            <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary, marginTop: theme.space[1] }]}>{customerAddress}</Text>
          ) : null}
          {!customerPhone && !customerAddress && (
            <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary, marginTop: theme.space[1] }]}>散客（无客户信息）</Text>
          )}
        </Card>

        {/* Order items */}
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[3] }]}>
            商品列表（{items.length} 种）
          </Text>
          {items.length === 0 ? (
            <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary }]}>暂无商品</Text>
          ) : (
            items.map((item, i) => (
              <View key={item.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.space[2] }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>{item.product_name}</Text>
                    {item.sku ? (
                      <Text style={[theme.text.mono, { color: theme.colors.textTertiary, fontSize: theme.font.size.xs }]}>{item.sku}</Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>
                      {item.quantity} × ¥{item.unit_price}
                    </Text>
                    <Text style={[theme.text.bodySmall, { color: theme.colors.textPrimary, marginTop: 2 }]}>
                      ¥{item.total_price}
                    </Text>
                  </View>
                </View>
                {i < items.length - 1 && <Divider />}
              </View>
            ))
          )}
          <Divider style={{ marginTop: theme.space[3] }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.space[2] }}>
            <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>合计</Text>
            <Text style={[theme.text.priceLg, { color: theme.colors.primary }]}>¥{order.total_amount}</Text>
          </View>
        </Card>

        {/* Payments */}
        {payments.length > 0 && (
          <Card>
            <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[3] }]}>收款记录</Text>
            {payments.map((p, i) => (
              <View key={p.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.space[2] }}>
                  <View>
                    <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>
                      {paymentMethodLabel[p.method] || p.method}
                    </Text>
                    {p.reference ? (
                      <Text style={[theme.text.mono, { color: theme.colors.textTertiary, fontSize: theme.font.size.xs }]}>REF: {p.reference}</Text>
                    ) : null}
                  </View>
                  <Text style={[theme.text.price, { color: theme.colors.success }]}>+¥{p.amount}</Text>
                </View>
                {i < payments.length - 1 && <Divider />}
              </View>
            ))}
          </Card>
        )}

        {/* Status timeline */}
        {history.length > 0 && (
          <Card>
            <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[3] }]}>状态记录</Text>
            {history.map((h, i) => {
              const isFirst = i === 0;
              const isLast = i === history.length - 1;
              return (
                <View key={h.id} style={{ flexDirection: 'row', gap: theme.space[3] }}>
                  <View style={{ alignItems: 'center', width: 8 }}>
                    <View style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: isFirst ? theme.colors.primary : theme.colors.borderDefault,
                    }} />
                    {!isLast && (
                      <View style={{ width: 2, flex: 1, backgroundColor: theme.colors.borderLight, marginVertical: 2 }} />
                    )}
                  </View>
                  <View style={{ flex: 1, paddingBottom: isLast ? 0 : theme.space[3] }}>
                    <Text style={[theme.text.bodySmall, { color: theme.colors.textPrimary }]}>
                      {statusStepLabel[h.to_status] || h.to_status}
                    </Text>
                    <Text style={[theme.text.caption, { color: theme.colors.textTertiary, marginTop: 2 }]}>
                      {formatDateTime(h.created_at)}
                      {h.changed_by_name ? ` · ${h.changed_by_name}` : ''}
                    </Text>
                    {h.notes ? (
                      <Text style={[theme.text.caption, { color: theme.colors.textTertiary, marginTop: 2 }]}>{h.notes}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        {/* Cancelled reason */}
        {order.status === 'cancelled' && order.cancelled_reason ? (
          <Card>
            <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[1] }]}>取消原因</Text>
            <Text style={[theme.text.body, { color: theme.colors.danger }]}>{order.cancelled_reason}</Text>
          </Card>
        ) : null}

        {/* Notes */}
        {order.notes ? (
          <Card>
            <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[1] }]}>备注</Text>
            <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>{order.notes}</Text>
          </Card>
        ) : null}
      </ScrollView>

      {/* Bottom actions */}
      {hasBottomActions && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: theme.space[4], paddingBottom: theme.space[8],
          backgroundColor: theme.colors.bgPrimary,
          borderTopWidth: 1, borderTopColor: theme.colors.borderLight,
          flexDirection: 'row', gap: theme.space[3],
        }}>
          {showCancel && (
            <Button variant="outline" size="lg" style={{ flex: 1 }} onPress={handleCancel} loading={actionLoading}>
              取消订单
            </Button>
          )}
          {showConfirm && (
            <Button variant="primary" size="lg" style={{ flex: 1 }} onPress={handleConfirm} loading={actionLoading}>
              确认订单
            </Button>
          )}
          {showShip && (
            <Button variant="primary" size="lg" style={{ flex: 1 }} onPress={handleShip} loading={actionLoading}>
              发货
            </Button>
          )}
          {showComplete && (
            <Button variant="primary" size="lg" style={{ flex: 1 }} onPress={handleComplete} loading={actionLoading}>
              完成订单
            </Button>
          )}
          {showRecordPayment && !showConfirm && !showShip && !showComplete && !showCancel && (
            <Button variant="primary" size="lg" style={{ flex: 1 }} onPress={handleRecordPayment}>
              收款 ¥{unpaidAmount.toFixed(2)}
            </Button>
          )}
          {showRecordPayment && (showConfirm || showShip || showComplete || showCancel) && (
            <Button variant="primary" size="lg" style={{ flex: 1 }} onPress={handleRecordPayment}>
              收款
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

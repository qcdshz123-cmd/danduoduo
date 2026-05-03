import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { orderService } from '../../services/orderService';
import { Card, Input, Button } from '../../components/ui';
import type { PaymentMethod } from '../../types/enums';

const PAYMENT_METHODS: Array<{ key: PaymentMethod; label: string; icon: string }> = [
  { key: 'cash', label: '现金', icon: '💵' },
  { key: 'wechat', label: '微信', icon: '💚' },
  { key: 'alipay', label: '支付宝', icon: '💙' },
  { key: 'bank_transfer', label: '银行转账', icon: '🏦' },
];

export default function RecordPaymentModal() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { orderId, unpaidAmount } = useLocalSearchParams<{ orderId: string; unpaidAmount?: string }>();

  const [amount, setAmount] = useState(unpaidAmount ?? '');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const parsedAmount = parseFloat(amount) || 0;
  const remaining = unpaidAmount != null ? parseFloat(unpaidAmount) : 0;
  const isValid = parsedAmount > 0 && (remaining <= 0 || parsedAmount <= remaining);

  const handleSubmit = useCallback(async () => {
    if (!orderId || !isValid) return;

    setSubmitting(true);
    try {
      await orderService.recordPayment(orderId, {
        amount: parsedAmount,
        method,
        reference: reference || null,
        notes: notes || null,
      });

      router.back();
      setTimeout(() => {
        if (mountedRef.current) {
          router.setParams({ paymentRecorded: 'true' });
        }
      }, 100);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '收款失败';
      Alert.alert('收款失败', msg);
    } finally {
      setSubmitting(false);
    }
  }, [orderId, parsedAmount, method, reference, notes, isValid]);

  const handleQuickAmount = useCallback((pct: number) => {
    if (remaining > 0) {
      setAmount((remaining * pct).toFixed(2));
    }
  }, [remaining]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + theme.space[2],
        paddingHorizontal: theme.space[4],
        paddingBottom: theme.space[2],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.bgPrimary,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>取消</Text>
        </TouchableOpacity>
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>收款</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[4], gap: theme.space[4], paddingBottom: theme.space[8] }}>
        {/* Amount */}
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>收款金额</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[1] }}>
            <Text style={[theme.text.priceLg, { color: theme.colors.textPrimary, fontSize: 28 }]}>¥</Text>
            <Input
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
          {remaining > 0 && (
            <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary, marginTop: theme.space[2] }]}>
              待收金额：¥{remaining.toFixed(2)}
            </Text>
          )}
          {parsedAmount > 0 && remaining > 0 && parsedAmount > remaining && (
            <Text style={[theme.text.bodySmall, { color: theme.colors.danger, marginTop: theme.space[1] }]}>
              收款金额不能超过待收金额
            </Text>
          )}
          {/* Quick amount buttons */}
          {remaining > 0 && (
            <View style={{ flexDirection: 'row', gap: theme.space[2], marginTop: theme.space[3] }}>
              {[0.25, 0.5, 0.75, 1].map((pct) => (
                <TouchableOpacity
                  key={pct}
                  onPress={() => handleQuickAmount(pct)}
                  style={{
                    flex: 1,
                    paddingVertical: theme.space[1.5],
                    borderRadius: theme.radius.md,
                    borderWidth: 1,
                    borderColor: theme.colors.borderDefault,
                    alignItems: 'center',
                    backgroundColor: parseFloat(amount) === parseFloat((remaining * pct).toFixed(2)) ? theme.colors.primaryBg : 'transparent',
                  }}
                >
                  <Text style={[theme.text.bodySmall, { color: theme.colors.textPrimary }]}>
                    {pct === 1 ? '全额' : `${pct * 100}%`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Payment method */}
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[3] }]}>支付方式</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
            {PAYMENT_METHODS.map((pm) => {
              const isActive = method === pm.key;
              return (
                <TouchableOpacity
                  key={pm.key}
                  onPress={() => setMethod(pm.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.space[1.5],
                    paddingVertical: theme.space[2],
                    paddingHorizontal: theme.space[3],
                    borderRadius: theme.radius.lg,
                    borderWidth: isActive ? 2 : 1,
                    borderColor: isActive ? theme.colors.primary : theme.colors.borderDefault,
                    backgroundColor: isActive ? theme.colors.primaryBg : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{pm.icon}</Text>
                  <Text style={[theme.text.bodySmall, { color: isActive ? theme.colors.primary : theme.colors.textPrimary, fontWeight: isActive ? '600' : '400' }]}>
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Reference */}
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>流水号（选填）</Text>
          <Input
            value={reference}
            onChangeText={setReference}
            placeholder="微信/支付宝交易单号..."
          />
        </Card>

        {/* Notes */}
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>备注（选填）</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="收款备注..."
            multiline
            numberOfLines={2}
          />
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
          disabled={!isValid}
          onPress={handleSubmit}
        >
          确认收款 ¥{parsedAmount.toFixed(2)}
        </Button>
      </View>
    </View>
  );
}

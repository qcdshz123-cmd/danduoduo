import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../ui/Card';

export interface PriceTierRow {
  id: string;
  name: string;
  min_qty: string;
  price: string;
}

interface PriceTierEditorProps {
  tiers: PriceTierRow[];
  onTiersChange: (tiers: PriceTierRow[]) => void;
  readonly?: boolean;
}

export const PriceTierEditor: React.FC<PriceTierEditorProps> = ({
  tiers,
  onTiersChange,
  readonly = false,
}) => {
  const theme = useTheme();

  const addTier = () => {
    onTiersChange([
      ...tiers,
      {
        id: `new-${Date.now()}`,
        name: '',
        min_qty: '',
        price: '',
      },
    ]);
  };

  const removeTier = (index: number) => {
    onTiersChange(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof PriceTierRow, value: string) => {
    const updated = tiers.map((t, i) => (i === index ? { ...t, [field]: value } : t));
    onTiersChange(updated);
  };

  return (
    <Card>
      <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: tiers.length > 0 ? theme.space[3] : theme.space[1] }]}>
        阶梯价格
      </Text>

      {tiers.length === 0 && !readonly && (
        <TouchableOpacity
          onPress={addTier}
          style={{
            paddingVertical: theme.space[3],
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
            borderStyle: 'dashed',
            alignItems: 'center',
          }}
        >
          <Text style={[theme.text.caption, { color: theme.colors.primary }]}>+ 添加阶梯价格</Text>
        </TouchableOpacity>
      )}

      {tiers.length > 0 && (
        <View style={{ gap: theme.space[2] }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Text style={[theme.text.caption, { flex: 2, color: theme.colors.textTertiary }]}>等级名称</Text>
            <Text style={[theme.text.caption, { flex: 1.5, color: theme.colors.textTertiary, textAlign: 'right' }]}>起批量</Text>
            <Text style={[theme.text.caption, { flex: 1.5, color: theme.colors.textTertiary, textAlign: 'right' }]}>单价</Text>
            {!readonly && <View style={{ width: 32 }} />}
          </View>

          {tiers.map((t, i) => (
            <View key={t.id} style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
              <TextInput
                style={{
                  flex: 2,
                  borderWidth: 1,
                  borderColor: theme.colors.borderLight,
                  borderRadius: theme.radius.md,
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  fontSize: 13,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.bgPrimary,
                }}
                value={t.name}
                onChangeText={(val) => updateTier(i, 'name', val)}
                placeholder="批发价"
                placeholderTextColor={theme.colors.textTertiary}
                editable={!readonly}
              />
              <TextInput
                style={{
                  flex: 1.5,
                  borderWidth: 1,
                  borderColor: theme.colors.borderLight,
                  borderRadius: theme.radius.md,
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  fontSize: 13,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.bgPrimary,
                  textAlign: 'right',
                }}
                value={t.min_qty}
                onChangeText={(val) => updateTier(i, 'min_qty', val)}
                placeholder="10"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="number-pad"
                editable={!readonly}
              />
              <TextInput
                style={{
                  flex: 1.5,
                  borderWidth: 1,
                  borderColor: theme.colors.borderLight,
                  borderRadius: theme.radius.md,
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  fontSize: 13,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.bgPrimary,
                  textAlign: 'right',
                }}
                value={t.price}
                onChangeText={(val) => updateTier(i, 'price', val)}
                placeholder="0"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="decimal-pad"
                editable={!readonly}
              />
              {!readonly && (
                <TouchableOpacity onPress={() => removeTier(i)} style={{ width: 32, alignItems: 'center' }}>
                  <Text style={{ color: theme.colors.danger, fontSize: 18 }}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {!readonly && (
            <TouchableOpacity
              onPress={addTier}
              style={{
                paddingVertical: theme.space[2],
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
                borderStyle: 'dashed',
                alignItems: 'center',
              }}
            >
              <Text style={[theme.text.caption, { color: theme.colors.primary }]}>+ 添加阶梯价格</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
};

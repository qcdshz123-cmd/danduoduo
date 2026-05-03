import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../ui/Card';

export interface VariantRow {
  id: string;
  spec_name: string;
  spec_value: string;
  sku: string;
  barcode: string;
  price: string;
  cost_price: string;
}

interface VariantEditorProps {
  variants: VariantRow[];
  hasVariants: boolean;
  onHasVariantsChange: (value: boolean) => void;
  onVariantsChange: (variants: VariantRow[]) => void;
  readonly?: boolean;
}

export const VariantEditor: React.FC<VariantEditorProps> = ({
  variants,
  hasVariants,
  onHasVariantsChange,
  onVariantsChange,
  readonly = false,
}) => {
  const theme = useTheme();

  const addVariant = () => {
    onVariantsChange([
      ...variants,
      {
        id: `new-${Date.now()}`,
        spec_name: '',
        spec_value: '',
        sku: '',
        barcode: '',
        price: '',
        cost_price: '',
      },
    ]);
  };

  const removeVariant = (index: number) => {
    onVariantsChange(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantRow, value: string) => {
    const updated = variants.map((v, i) => (i === index ? { ...v, [field]: value } : v));
    onVariantsChange(updated);
  };

  const inputStyle = (flex: number): object => ({
    flex,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.md,
    paddingHorizontal: 6,
    paddingVertical: 6,
    fontSize: 12,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.bgPrimary,
  });

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.space[3] }}>
        <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary }]}>多规格</Text>
        <Switch
          value={hasVariants}
          onValueChange={onHasVariantsChange}
          disabled={readonly}
          trackColor={{ false: theme.colors.borderLight, true: theme.colors.primary + '60' }}
          thumbColor={hasVariants ? theme.colors.primary : theme.colors.textTertiary}
        />
      </View>

      {hasVariants && (
        <View style={{ gap: theme.space[2] }}>
          {/* Header row */}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Text style={[theme.text.caption, { flex: 2, color: theme.colors.textTertiary }]}>规格名</Text>
            <Text style={[theme.text.caption, { flex: 2, color: theme.colors.textTertiary }]}>规格值</Text>
            <Text style={[theme.text.caption, { flex: 2, color: theme.colors.textTertiary }]}>SKU</Text>
            <Text style={[theme.text.caption, { flex: 1.5, color: theme.colors.textTertiary, textAlign: 'right' }]}>价格</Text>
            <Text style={[theme.text.caption, { flex: 1, color: theme.colors.textTertiary, textAlign: 'right' }]}>成本</Text>
            {!readonly && <View style={{ width: 32 }} />}
          </View>

          {variants.map((v, i) => (
            <View key={v.id} style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
              <TextInput
                style={inputStyle(2)}
                value={v.spec_name}
                onChangeText={(t) => updateVariant(i, 'spec_name', t)}
                placeholder="颜色"
                placeholderTextColor={theme.colors.textTertiary}
                editable={!readonly}
              />
              <TextInput
                style={inputStyle(2)}
                value={v.spec_value}
                onChangeText={(t) => updateVariant(i, 'spec_value', t)}
                placeholder="红"
                placeholderTextColor={theme.colors.textTertiary}
                editable={!readonly}
              />
              <TextInput
                style={inputStyle(2)}
                value={v.sku}
                onChangeText={(t) => updateVariant(i, 'sku', t)}
                placeholder="SKU"
                placeholderTextColor={theme.colors.textTertiary}
                editable={!readonly}
              />
              <TextInput
                style={[inputStyle(1.5), { textAlign: 'right' }]}
                value={v.price}
                onChangeText={(t) => updateVariant(i, 'price', t)}
                placeholder="0"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="decimal-pad"
                editable={!readonly}
              />
              <TextInput
                style={[inputStyle(1), { textAlign: 'right' }]}
                value={v.cost_price}
                onChangeText={(t) => updateVariant(i, 'cost_price', t)}
                placeholder="0"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="decimal-pad"
                editable={!readonly}
              />
              {!readonly && (
                <TouchableOpacity onPress={() => removeVariant(i)} style={{ width: 32, alignItems: 'center' }}>
                  <Text style={{ color: theme.colors.danger, fontSize: 18 }}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {!readonly && (
            <TouchableOpacity
              onPress={addVariant}
              style={{
                paddingVertical: theme.space[2],
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
                borderStyle: 'dashed',
                alignItems: 'center',
              }}
            >
              <Text style={[theme.text.caption, { color: theme.colors.primary }]}>+ 添加规格</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
};

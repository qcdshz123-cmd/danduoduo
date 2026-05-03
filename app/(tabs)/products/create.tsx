import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { Card, Input, Button, Chip } from '../../../components/ui';

export default function CreateProductScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [minStock, setMinStock] = useState('10');
  const [maxStock, setMaxStock] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('提示', '请输入商品名称'); return; }
    setSaving(true);
    // Mock save
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: theme.space[4],
          paddingBottom: theme.space[2],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: theme.layout.headerHeight + insets.top,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>取消</Text>
        </TouchableOpacity>
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>新建商品</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[theme.text.bodyMedium, { color: saving ? theme.colors.textTertiary : theme.colors.primary }]}>
            {saving ? '保存中...' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[4], gap: theme.space[4], paddingBottom: theme.space[24] }}>
        {/* Image upload placeholder */}
        <TouchableOpacity
          style={{
            height: 200,
            borderRadius: theme.radius['2xl'],
            backgroundColor: theme.colors.bgSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.space[2],
            borderWidth: 2,
            borderColor: theme.colors.borderLight,
            borderStyle: 'dashed',
          }}
        >
          <Text style={{ fontSize: 40 }}>📷</Text>
          <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>添加商品图片 (最多9张)</Text>
        </TouchableOpacity>

        {/* Basic info */}
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[3] }]}>
            基本信息
          </Text>
          <View style={{ gap: theme.space[3] }}>
            <Input label="商品名称" placeholder="请输入商品名称" value={name} onChangeText={setName} />
            <Input label="商品编号" placeholder="自动生成或手动输入" value={code} onChangeText={setCode} />
          </View>
        </Card>

        {/* Pricing */}
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[3] }]}>
            价格信息
          </Text>
          <View style={{ gap: theme.space[3] }}>
            <Input label="售价 (¥)" placeholder="0.00" value={basePrice} onChangeText={setBasePrice} prefix="¥" keyboardType="decimal-pad" />
            <Input label="成本价 (¥)" placeholder="0.00" value={costPrice} onChangeText={setCostPrice} prefix="¥" keyboardType="decimal-pad" />
          </View>
        </Card>

        {/* Stock */}
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[3] }]}>
            库存设置
          </Text>
          <View style={{ gap: theme.space[3] }}>
            <Input label="库存下限" placeholder="低于此数量预警" value={minStock} onChangeText={setMinStock} keyboardType="number-pad" />
            <Input label="库存上限" placeholder="高于此数量预警" value={maxStock} onChangeText={setMaxStock} keyboardType="number-pad" />
          </View>
        </Card>

        {/* Description */}
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[3] }]}>
            描述
          </Text>
          <Input
            placeholder="请输入商品描述..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

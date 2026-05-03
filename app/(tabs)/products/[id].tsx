import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useProduct } from '../../../hooks/useProduct';
import { Card, Badge, Divider, EmptyState } from '../../../components/ui';

export default function ProductDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'detail' | 'variants' | 'pricing'>('detail');
  const { product, isLoading, error, refresh } = useProduct(id);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
        <View style={{ paddingTop: insets.top, paddingHorizontal: theme.space[4], flexDirection: 'row', alignItems: 'center', height: theme.layout.headerHeight + insets.top }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[theme.text.body, { color: theme.colors.primary }]}>← 返回</Text>
          </TouchableOpacity>
        </View>
        <EmptyState
          title="加载失败"
          description={error || '商品不存在'}
          action={{ label: '重试', onPress: refresh }}
        />
      </View>
    );
  }

  const categoryName = product.category?.name ?? '未分类';

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
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>← 返回</Text>
        </TouchableOpacity>
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>商品详情</Text>
        <TouchableOpacity onPress={() => router.push(`/(tabs)/products/edit/${product.id}`)}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>编辑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: theme.space[20] }}>
        {/* Image placeholder */}
        <View
          style={{
            height: 280,
            backgroundColor: theme.colors.bgSecondary,
            marginHorizontal: theme.space[4],
            borderRadius: theme.radius['2xl'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 64, opacity: 0.3 }}>📦</Text>
        </View>

        {/* Product info */}
        <View style={{ padding: theme.space[4], gap: theme.space[4] }}>
          <View>
            <Text style={[theme.text.h2, { color: theme.colors.textPrimary }]}>{product.name}</Text>
            <View style={{ flexDirection: 'row', gap: theme.space[2], marginTop: theme.space[2] }}>
              <Badge variant="default">{categoryName}</Badge>
              {product.tags?.map((tag) => (
                <Badge key={tag} variant="info">{tag}</Badge>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: theme.space[3] }}>
            <Card variant="filled" style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[theme.text.priceLg, { color: theme.colors.primary }]}>¥{product.base_price}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>售价</Text>
            </Card>
            <Card variant="filled" style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[theme.text.priceLg, { color: theme.colors.textPrimary }]}>{product.stock_quantity ?? 0}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>库存</Text>
            </Card>
            <Card variant="filled" style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[theme.text.priceLg, { color: theme.colors.textSecondary }]}>¥{product.cost_price ?? 0}</Text>
              <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>成本</Text>
            </Card>
          </View>

          <Divider />

          {/* Tab switcher */}
          <View style={{ flexDirection: 'row', gap: theme.space[0] }}>
            {(['detail', 'variants', 'pricing'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: theme.space[2],
                  borderBottomWidth: 2,
                  borderBottomColor: activeTab === tab ? theme.colors.primary : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={[
                    theme.text.bodySmall,
                    {
                      color: activeTab === tab ? theme.colors.primary : theme.colors.textSecondary,
                      fontWeight: activeTab === tab ? '600' : '400',
                    },
                  ]}
                >
                  {{ detail: '详情', variants: '规格', pricing: '价格' }[tab]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab content */}
          {activeTab === 'detail' && (
            <View style={{ gap: theme.space[3] }}>
              <View>
                <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: 4 }]}>
                  商品编号
                </Text>
                <Text style={[theme.text.mono, { color: theme.colors.textPrimary }]}>{product.code}</Text>
              </View>
              <View>
                <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: 4 }]}>
                  条码
                </Text>
                <Text style={[theme.text.mono, { color: theme.colors.textPrimary }]}>{product.barcode}</Text>
              </View>
              <View>
                <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: 4 }]}>
                  描述
                </Text>
                <Text style={[theme.text.body, { color: theme.colors.textPrimary }]}>{product.description}</Text>
              </View>
            </View>
          )}

          {activeTab === 'variants' && (
            <View style={{ gap: theme.space[2] }}>
              {(product.variants && product.variants.length > 0) ? (
                <>
                  <View style={{ flexDirection: 'row', paddingVertical: theme.space[1], borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
                    <Text style={[theme.text.captionMedium, { flex: 2, color: theme.colors.textSecondary }]}>规格</Text>
                    <Text style={[theme.text.captionMedium, { flex: 1, color: theme.colors.textSecondary }]}>SKU</Text>
                    <Text style={[theme.text.captionMedium, { flex: 1, color: theme.colors.textSecondary, textAlign: 'right' }]}>价格</Text>
                    <Text style={[theme.text.captionMedium, { flex: 1, color: theme.colors.textSecondary, textAlign: 'right' }]}>库存</Text>
                  </View>
                  {product.variants.map((v, i) => (
                    <View key={v.id || i} style={{ flexDirection: 'row', paddingVertical: theme.space[1] }}>
                      <Text style={[theme.text.bodySmall, { flex: 2, color: theme.colors.textPrimary }]}>
                        {v.spec_name && v.spec_value ? `${v.spec_name}/${v.spec_value}` : v.sku}
                      </Text>
                      <Text style={[theme.text.mono, { flex: 1, color: theme.colors.textSecondary }]}>{v.sku}</Text>
                      <Text style={[theme.text.bodySmall, { flex: 1, color: theme.colors.textPrimary, textAlign: 'right' }]}>¥{v.price ?? product.base_price}</Text>
                      <Text style={[theme.text.bodySmall, { flex: 1, color: theme.colors.textPrimary, textAlign: 'right' }]}>{v.stock_quantity ?? 0}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <Text style={[theme.text.body, { color: theme.colors.textTertiary, textAlign: 'center', paddingVertical: theme.space[4] }]}>暂无规格</Text>
              )}
            </View>
          )}

          {activeTab === 'pricing' && (
            <View style={{ gap: theme.space[3] }}>
              {(product.price_tiers && product.price_tiers.length > 0) ? (
                product.price_tiers.map((tier, i) => (
                  <Card key={tier.id || i} variant="outlined">
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>{tier.name}</Text>
                        <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>
                          最低 {tier.min_qty} 件起批
                        </Text>
                      </View>
                      <Text style={[theme.text.priceLg, { color: theme.colors.primary }]}>¥{tier.price}</Text>
                    </View>
                  </Card>
                ))
              ) : (
                <Text style={[theme.text.body, { color: theme.colors.textTertiary, textAlign: 'center', paddingVertical: theme.space[4] }]}>暂无阶梯价格</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

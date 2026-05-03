import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useCustomers } from '../../hooks/useCustomers';
import { SearchBar, Avatar, Skeleton, EmptyState } from '../../components/ui';
import { useOrderDraftStore } from '../../stores/orderDraftStore';
import type { Customer } from '../../types/models';

export default function CustomerPickerModal() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const { customers, isLoading, error, refresh, loadMore, hasMore } = useCustomers({ search: search || undefined });
  const setCustomer = useOrderDraftStore((s) => s.setCustomer);

  const handleSelect = useCallback((customer: Customer) => {
    setCustomer(customer);
    router.back();
  }, [setCustomer]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <View style={{
        paddingTop: insets.top + theme.space[2],
        paddingHorizontal: theme.space[4],
        paddingBottom: theme.space[2],
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: theme.colors.bgPrimary,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>取消</Text>
        </TouchableOpacity>
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>选择客户</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={{ paddingHorizontal: theme.space[4], paddingBottom: theme.space[2] }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="搜索客户名称或手机号..." />
      </View>

      {isLoading ? (
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={56} />
          ))}
        </View>
      ) : error ? (
        <EmptyState title="加载失败" description={error} action={{ label: '重试', onPress: refresh }} />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item: Customer) => item.id}
          contentContainerStyle={{ paddingHorizontal: theme.space[4], paddingBottom: theme.space[8] }}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={{
                flexDirection: 'row', alignItems: 'center', paddingVertical: theme.space[3],
                borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight, gap: theme.space[3],
              }}
            >
              <Avatar name={item.name} size="md" />
              <View style={{ flex: 1 }}>
                <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>{item.name}</Text>
                {item.phone ? (
                  <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>{item.phone}</Text>
                ) : null}
              </View>
              {item.code ? (
                <Text style={[theme.text.mono, { color: theme.colors.textTertiary, fontSize: theme.font.size.xs }]}>{item.code}</Text>
              ) : null}
              <Text style={{ color: theme.colors.textTertiary }}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState title="暂无客户" description={search ? '未找到匹配的客户' : '请先添加客户'} />
          }
        />
      )}
    </View>
  );
}

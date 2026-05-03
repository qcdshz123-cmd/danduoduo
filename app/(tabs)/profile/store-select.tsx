import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../stores/authStore';
import { supabase } from '../../../services/supabase';
import { Card, Skeleton, EmptyState, Badge , ScreenHeader } from '../../../components/ui';
import type { Store } from '../../../types/models';

export default function StoreSelectScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const currentStore = useAuthStore((s) => s.store);
  const setProfile = useAuthStore((s) => s.setProfile);
  const profile = useAuthStore((s) => s.profile);

  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setStores(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSelect = async (store: Store) => {
    if (store.id === currentStore?.id) {
      router.back();
      return;
    }

    Alert.alert('切换门店', `确定切换到「${store.name}」吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          setSwitching(store.id);
          try {
            if (profile) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ store_id: store.id })
                .eq('id', profile.id);

              if (updateError) throw updateError;
              setProfile({ ...profile, store_id: store.id }, store);
            }

            Alert.alert('切换成功', `已切换到「${store.name}」`);
            router.back();
          } catch (e: unknown) {
            Alert.alert('切换失败', e instanceof Error ? e.message : '未知错误');
          } finally {
            setSwitching(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScreenHeader title="切换门店" />

      {isLoading ? (
        <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
          {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} variant="rect" height={64} />))}
        </View>
      ) : error ? (
        <EmptyState title="加载失败" description={error} action={{ label: '重试', onPress: fetchStores }} />
      ) : stores.length === 0 ? (
        <EmptyState title="暂无门店" description="请先创建门店" />
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.space[4], paddingBottom: theme.space[24] }}
          renderItem={({ item }) => {
            const isCurrent = item.id === currentStore?.id;
            const isProcessing = switching === item.id;

            return (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                disabled={isProcessing}
                activeOpacity={0.7}
              >
                <Card
                  style={{
                    marginBottom: theme.space[3],
                    borderWidth: isCurrent ? 2 : 0,
                    borderColor: theme.colors.primary,
                    opacity: isProcessing ? 0.6 : 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
                    <View style={{
                      width: 44, height: 44, borderRadius: theme.radius.md,
                      backgroundColor: isCurrent ? theme.colors.primaryBg : theme.colors.bgSecondary,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 20 }}>{isCurrent ? '✅' : '🏪'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>
                          {item.name}
                        </Text>
                        {isCurrent && <Badge variant="success" size="sm">当前</Badge>}
                      </View>
                      {item.address ? (
                        <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>{item.address}</Text>
                      ) : null}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

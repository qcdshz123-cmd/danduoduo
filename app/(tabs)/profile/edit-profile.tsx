import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../stores/authStore';
import { supabase } from '../../../services/supabase';
import { Card, Button , ScreenHeader } from '../../../components/ui';

export default function EditProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const store = useAuthStore((s) => s.store);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = displayName !== (profile?.display_name ?? '') || phone !== (profile?.phone ?? '');

  const handleSave = useCallback(async () => {
    if (!displayName.trim()) {
      Alert.alert('提示', '请输入显示名称');
      return;
    }

    if (!profile?.id) {
      Alert.alert('错误', '用户信息未加载');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          phone: phone.trim() || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      if (!store) {
        Alert.alert('错误', '门店信息未加载');
        return;
      }

      setProfile(
        { ...profile, display_name: displayName.trim(), phone: phone.trim() || null },
        store,
      );

      Alert.alert('保存成功', '个人资料已更新', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert('保存失败', e instanceof Error ? e.message : '未知错误');
    } finally {
      setIsSaving(false);
    }
  }, [displayName, phone, profile, store, setProfile]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScreenHeader title="编辑资料" />

      <ScrollView contentContainerStyle={{ padding: theme.space[4], paddingBottom: theme.space[24], gap: theme.space[4] }}>
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[3] }]}>基本信息</Text>

          <View style={{ marginBottom: theme.space[4] }}>
            <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>显示名称</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="请输入显示名称"
              placeholderTextColor={theme.colors.textTertiary}
              style={{
                fontSize: theme.font.size.base,
                color: theme.colors.textPrimary,
                backgroundColor: theme.colors.bgSecondary,
                borderRadius: theme.radius.md,
                paddingHorizontal: theme.space[3],
                paddingVertical: theme.space[3],
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
              }}
            />
          </View>

          <View style={{ marginBottom: theme.space[2] }}>
            <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary, marginBottom: theme.space[2] }]}>手机号</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="请输入手机号"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="phone-pad"
              maxLength={11}
              style={{
                fontSize: theme.font.size.base,
                color: theme.colors.textPrimary,
                backgroundColor: theme.colors.bgSecondary,
                borderRadius: theme.radius.md,
                paddingHorizontal: theme.space[3],
                paddingVertical: theme.space[3],
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
              }}
            />
          </View>
        </Card>

        <Button
          variant="primary"
          size="md"
          fullWidth
          onPress={handleSave}
          loading={isSaving}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? '保存中...' : '保存'}
        </Button>
      </ScrollView>
    </View>
  );
}

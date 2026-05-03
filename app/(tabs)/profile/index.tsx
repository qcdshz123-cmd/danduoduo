import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { Card, Divider, Avatar, Button } from '../../../components/ui';
import { useAppStore } from '../../../stores/appStore';

const MENU_SECTIONS = [
  {
    title: '账户',
    items: [
      { icon: '👤', label: '编辑资料', route: '/(tabs)/profile/edit-profile' },
      { icon: '🏪', label: '切换门店', route: '/(tabs)/profile/store-select' },
      { icon: '🔒', label: '修改密码', route: '' },
    ],
  },
  {
    title: '设置',
    items: [
      { icon: '🎨', label: '主题设置', action: 'theme' },
      { icon: '🔔', label: '通知设置', route: '' },
      { icon: '📊', label: '数据同步', route: '' },
    ],
  },
  {
    title: '关于',
    items: [
      { icon: 'ℹ️', label: '关于速订货', route: '' },
      { icon: '📄', label: '用户协议', route: '' },
      { icon: '🔏', label: '隐私政策', route: '' },
    ],
  },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, store, signOut } = useAuth();
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  const handleThemeToggle = () => {
    const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setThemeMode(nextMode);
    Alert.alert('主题已切换', `当前: ${nextMode === 'system' ? '跟随系统' : nextMode === 'dark' ? '深色模式' : '浅色模式'}`);
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出当前账户吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: () => { signOut(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.space[24] }}>
        {/* Profile header */}
        <View
          style={{
            paddingTop: insets.top + theme.space[6],
            paddingHorizontal: theme.space[4],
            paddingBottom: theme.space[4],
            alignItems: 'center',
            gap: theme.space[3],
          }}
        >
          <Avatar name={profile?.display_name || '用户'} size="xl" />
          <View style={{ alignItems: 'center', gap: theme.space[1] }}>
            <Text style={[theme.text.h2, { color: theme.colors.textPrimary }]}>
              {profile?.display_name || '用户'}
            </Text>
            <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>
              {store?.name || '未绑定门店'}
            </Text>
          </View>
        </View>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={{ marginBottom: theme.space[4] }}>
            <Text style={[theme.text.captionMedium, { color: theme.colors.textTertiary, paddingHorizontal: theme.space[4], marginBottom: theme.space[2] }]}>
              {section.title}
            </Text>
            <Card padding={0}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  onPress={() => {
                    if (item.action === 'theme') return handleThemeToggle();
                    if (item.route) router.push(item.route as any);
                  }}
                  activeOpacity={0.6}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: theme.space[4],
                      paddingVertical: theme.space[3],
                      gap: theme.space[3],
                      borderTopWidth: ii > 0 ? 1 : 0,
                      borderTopColor: theme.colors.borderLight,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                    <Text style={[theme.text.body, { color: theme.colors.textPrimary, flex: 1 }]}>{item.label}</Text>
                    {item.action === 'theme' ? (
                      <Text style={[theme.text.caption, { color: theme.colors.textSecondary }]}>
                        {themeMode === 'system' ? '跟随系统' : themeMode === 'dark' ? '深色' : '浅色'}
                      </Text>
                    ) : (
                      <Text style={{ color: theme.colors.textTertiary }}>›</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout */}
        <View style={{ paddingHorizontal: theme.space[4] }}>
          <Button variant="danger" size="md" fullWidth onPress={handleLogout}>
            退出登录
          </Button>
        </View>

        {/* Version */}
        <Text style={[theme.text.caption, { color: theme.colors.textTertiary, textAlign: 'center', marginTop: theme.space[6] }]}>
          速订货 v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

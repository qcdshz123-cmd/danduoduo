import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui';
import { useAppStore } from '../../../stores/appStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
  const labels: Record<string, string> = { light: '浅色', dark: '深色', system: '跟随系统' };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <View style={{ paddingTop: insets.top + theme.space[2], paddingHorizontal: theme.space[4], flexDirection: 'row', alignItems: 'center', height: theme.layout.headerHeight }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>← 返回</Text>
        </TouchableOpacity>
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>设置</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={{ padding: theme.space[4], gap: theme.space[4] }}>
        <Card>
          <Text style={[theme.text.captionMedium, { color: theme.colors.textSecondary, marginBottom: theme.space[3] }]}>主题模式</Text>
          <View style={{ flexDirection: 'row', gap: theme.space[2] }}>
            {modes.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setThemeMode(m)}
                style={{
                  flex: 1,
                  paddingVertical: theme.space[3],
                  borderRadius: theme.radius.lg,
                  alignItems: 'center',
                  backgroundColor: themeMode === m ? theme.colors.primary : theme.colors.bgSecondary,
                }}
              >
                <Text style={[theme.text.bodySmall, { color: themeMode === m ? '#FFF' : theme.colors.textSecondary }]}>
                  {labels[m]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </View>
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

/**
 * 通用详情页顶部导航栏
 * 替换所有页面中重复的「← 返回 + 居中标题」模式
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightContent,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={{
      paddingTop: insets.top + theme.space[2],
      paddingHorizontal: theme.space[4],
      paddingBottom: theme.space[2],
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.bgPrimary,
    }}>
      <TouchableOpacity onPress={handleBack} hitSlop={8}>
        <Text style={[theme.text.body, { color: theme.colors.primary }]}>{'← 返回'}</Text>
      </TouchableOpacity>
      <Text
        style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {rightContent ?? <View style={{ width: 50 }} />}
    </View>
  );
};

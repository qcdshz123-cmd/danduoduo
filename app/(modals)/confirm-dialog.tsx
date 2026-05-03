import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

export default function ConfirmDialogModal() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { title, message } = useLocalSearchParams<{ title?: string; message?: string }>();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary, paddingTop: insets.top + theme.space[4], padding: theme.space[4] }}>
      <Text style={[theme.text.h3, { color: theme.colors.textPrimary }]}>{title ?? '确认'}</Text>
      {message ? (
        <Text style={[theme.text.body, { color: theme.colors.textSecondary, marginTop: theme.space[2] }]}>{message}</Text>
      ) : null}
    </View>
  );
}

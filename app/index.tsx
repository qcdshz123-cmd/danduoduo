import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
  const theme = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace('/(tabs)/products');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.bgPrimary,
        gap: theme.space[4],
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>
        加载中...
      </Text>
    </View>
  );
}

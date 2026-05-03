import React, { useEffect, useMemo } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import { ThemeContext } from '../hooks/useTheme';
import { getTheme } from '../constants/theme';
import { useAppStore } from '../stores/appStore';
import { ToastContainer } from '../components/ui/Toast';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const themeMode = useAppStore((s) => s.themeMode);
  const setResolvedTheme = useAppStore((s) => s.setResolvedTheme);

  const resolvedMode =
    themeMode === 'system'
      ? (colorScheme === 'dark' ? 'dark' : 'light')
      : themeMode;

  const theme = useMemo(() => getTheme(resolvedMode), [resolvedMode]);

  useEffect(() => {
    setResolvedTheme(resolvedMode);
  }, [resolvedMode, setResolvedTheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeContext.Provider value={theme}>
        <SafeAreaProvider>
          <StatusBar style={theme.isDark ? 'light' : 'dark'} />
          <ToastContainer />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.bgPrimary },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
          </Stack>
        </SafeAreaProvider>
      </ThemeContext.Provider>
    </GestureHandlerRootView>
  );
}

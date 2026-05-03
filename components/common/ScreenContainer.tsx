import React from 'react';
import { View, ScrollView, RefreshControl, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  noPadding?: boolean;
  style?: ViewStyle;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  refreshing,
  onRefresh,
  noPadding = false,
  style,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
    paddingHorizontal: noPadding ? 0 : theme.layout.screenPadding,
  };

  if (scrollable) {
    return (
      <ScrollView
        style={[containerStyle, style]}
        contentContainerStyle={{
          paddingTop: theme.space[4],
          paddingBottom: theme.space[8] + insets.bottom,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing || false}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
};

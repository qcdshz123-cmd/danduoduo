import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

interface HeaderAction {
  icon: React.ReactNode;
  onPress: () => void;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: HeaderAction;
  rightActions?: HeaderAction[];
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightActions,
  style,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          paddingTop: insets.top + theme.space[2],
          paddingBottom: theme.space[3],
          paddingHorizontal: theme.space[4],
          backgroundColor: theme.colors.bgPrimary,
          borderBottomWidth: 0,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: theme.layout.headerHeight,
        }}
      >
        {/* Left */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
          {leftAction && (
            <TouchableOpacity onPress={leftAction.onPress} hitSlop={8}>
              {leftAction.icon}
            </TouchableOpacity>
          )}
          <View>
            <Text style={[theme.text.h2, { color: theme.colors.textPrimary }]}>
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[theme.text.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Right */}
        {rightActions && rightActions.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
            {rightActions.map((action, i) => (
              <TouchableOpacity key={i} onPress={action.onPress} hitSlop={8}>
                {action.icon}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

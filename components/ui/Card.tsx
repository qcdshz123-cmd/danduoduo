import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  variant?: CardVariant;
  padding?: number;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding,
  onPress,
  children,
  style,
}) => {
  const theme = useTheme();
  const p = padding ?? theme.layout.cardPadding;

  const cardStyle: ViewStyle = {
    padding: p,
    borderRadius: theme.radius['2xl'],
    backgroundColor:
      variant === 'filled'
        ? theme.isDark
          ? theme.colors.bgTertiary
          : theme.colors.bgSecondary
        : theme.colors.bgPrimary,
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: variant === 'outlined' ? theme.colors.borderLight : undefined,
    ...(variant === 'elevated' ? theme.shadows.sm : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.95}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

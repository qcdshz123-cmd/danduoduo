import React, { useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  onPress,
  children,
  style,
}) => {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scale]);

  const isDisabled = disabled || loading;

  const bgColors: Record<ButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.isDark ? theme.colors.bgTertiary : theme.colors.bgTertiary,
    outline: 'transparent',
    ghost: 'transparent',
    danger: theme.colors.danger,
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: '#FFFFFF',
    secondary: theme.colors.textPrimary,
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
    danger: '#FFFFFF',
  };

  const borderColors: Record<ButtonVariant, string> = {
    primary: 'transparent',
    secondary: 'transparent',
    outline: theme.isDark ? theme.colors.borderDefault : theme.colors.borderDefault,
    ghost: 'transparent',
    danger: 'transparent',
  };

  const heights: Record<ButtonSize, number> = {
    sm: theme.layout.buttonHeight.sm,
    md: theme.layout.buttonHeight.md,
    lg: theme.layout.buttonHeight.lg,
  };

  const paddings: Record<ButtonSize, number> = {
    sm: theme.space[3],
    md: theme.space[4],
    lg: theme.space[5],
  };

  const isSmall = size === 'sm';
  const textStyle = isSmall ? theme.text.buttonSmall : theme.text.button;

  const containerStyle: ViewStyle = {
    height: heights[size],
    paddingHorizontal: paddings[size],
    backgroundColor: isDisabled ? theme.colors.borderLight : bgColors[variant],
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: isDisabled ? theme.colors.borderLight : borderColors[variant],
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
    opacity: isDisabled ? 0.5 : 1,
    ...(fullWidth ? { width: '100%' as const } : {}),
  };

  const labelColor = isDisabled
    ? theme.colors.textTertiary
    : textColors[variant];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={isDisabled}
        style={[containerStyle, style]}
      >
        {loading ? (
          <ActivityIndicator size={isSmall ? 14 : 18} color={labelColor} />
        ) : icon ? (
          <>{icon}</>
        ) : null}
        {typeof children === 'string' ? (
          <Text style={[textStyle, { color: labelColor }]}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

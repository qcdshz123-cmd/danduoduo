import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  prefix?: string;
  suffix?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  isPassword = false,
  prefix,
  suffix,
  containerStyle,
  ...rest
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : isFocused
    ? theme.colors.primary
    : theme.colors.borderLight;

  return (
    <View style={[{ gap: theme.space[1] }, containerStyle]}>
      {label && (
        <Text
          style={[
            theme.text.captionMedium,
            {
              color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
              marginLeft: theme.space[1],
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={{
          height: theme.layout.inputHeight,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.isDark ? theme.colors.bgTertiary : theme.colors.bgSecondary,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor,
          paddingHorizontal: theme.space[4],
          gap: theme.space[2],
        }}
      >
        {leftIcon && <View>{leftIcon}</View>}
        {prefix && (
          <Text style={[theme.text.body, { color: theme.colors.textSecondary }]}>
            {prefix}
          </Text>
        )}
        <TextInput
          {...rest}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={theme.colors.textTertiary}
          style={[
            theme.text.body,
            {
              flex: 1,
              color: theme.colors.textPrimary,
              height: '100%',
              paddingVertical: 0,
            },
          ]}
        />
        {suffix && (
          <Text style={[theme.text.body, { color: theme.colors.textSecondary }]}>
            {suffix}
          </Text>
        )}
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={[theme.text.bodySmall, { color: theme.colors.primary }]}>
              {showPassword ? '隐藏' : '显示'}
            </Text>
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && <View>{rightIcon}</View>}
      </View>

      {(error || hint) && (
        <Text
          style={[
            theme.text.caption,
            {
              color: error ? theme.colors.danger : theme.colors.textTertiary,
              marginLeft: theme.space[1],
            },
          ]}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
};

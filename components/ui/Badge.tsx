import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  style?: ViewStyle;
}

const variantColors = {
  default: { bg: 'bgSecondary', text: 'textSecondary' },
  success: { bg: 'successBg', text: 'success' },
  warning: { bg: 'warningBg', text: 'warning' },
  danger:  { bg: 'dangerBg',  text: 'danger' },
  info:    { bg: 'infoBg',    text: 'info' },
} as const;

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  children,
  style,
}) => {
  const theme = useTheme();
  const v = variantColors[variant];

  const isLabel = typeof children === 'string';

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors[v.bg as keyof typeof theme.colors] as string,
          borderRadius: theme.radius.full,
          paddingHorizontal: size === 'sm' ? theme.space[2] : theme.space[3],
          paddingVertical: size === 'sm' ? theme.space[0.5] : theme.space[1],
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {isLabel ? (
        <Text
          style={[
            theme.text.captionMedium,
            {
              color: theme.colors[v.text as keyof typeof theme.colors] as string,
            },
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

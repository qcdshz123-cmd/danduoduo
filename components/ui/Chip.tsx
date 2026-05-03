import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ChipProps {
  label: string;
  selected?: boolean;
  count?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  count,
  onPress,
  style,
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space[1],
          paddingHorizontal: theme.space[3],
          paddingVertical: theme.space[1.5],
          borderRadius: theme.radius.full,
          backgroundColor: selected
            ? theme.colors.primary
            : theme.isDark
            ? theme.colors.bgTertiary
            : theme.colors.bgSecondary,
        },
        style,
      ]}
    >
      <Text
        style={[
          theme.text.captionMedium,
          {
            color: selected ? '#FFFFFF' : theme.colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
      {count !== undefined && (
        <Text
          style={[
            theme.text.caption,
            {
              color: selected ? 'rgba(255,255,255,0.7)' : theme.colors.textTertiary,
            },
          ]}
        >
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );
};

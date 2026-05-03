import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface DividerProps {
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({ style }) => {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: theme.colors.borderLight,
        },
        style,
      ]}
    />
  );
};

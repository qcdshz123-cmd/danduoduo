import React, { useCallback, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface FABProps {
  icon: React.ReactNode;
  onPress?: () => void;
  color?: string;
  style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({ icon, onPress, color, style }) => {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  }, [scale]);

  const fabColor = color || theme.colors.primary;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          {
            width: theme.layout.fabSize,
            height: theme.layout.fabSize,
            borderRadius: theme.layout.fabSize / 2,
            backgroundColor: fabColor,
            alignItems: 'center',
            justifyContent: 'center',
            ...theme.shadows.fab,
          },
          style,
        ]}
      >
        {icon}
      </TouchableOpacity>
    </Animated.View>
  );
};

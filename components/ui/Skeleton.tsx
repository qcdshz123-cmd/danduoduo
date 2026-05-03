import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number;
  height?: number;
  count?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  style,
}) => {
  const theme = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const bgColor = theme.isDark ? theme.colors.bgTertiary : theme.colors.bgSecondary;
  const shimmerColor = theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const interpolatedColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [bgColor as string, shimmerColor],
  });

  const items = Array.from({ length: count });

  const getDefaultSize = (): { width: number; height: number } => {
    switch (variant) {
      case 'circle':
        return { width: height || 40, height: height || 40 };
      case 'rect':
        return { width: width || 200, height: height || 100 };
      case 'card':
        return { width: width || 300, height: height || 120 };
      case 'text':
      default:
        return { width: width || 200, height: height || 14 };
    }
  };

  const defaultSize = getDefaultSize();

  return (
    <View style={[{ gap: theme.space[2] }, style]}>
      {items.map((_, i) => (
        <Animated.View
          key={i}
          style={{
            width: width || defaultSize.width,
            height: height || defaultSize.height,
            borderRadius:
              variant === 'circle'
                ? 9999
                : variant === 'text'
                ? 4
                : theme.radius.lg,
            backgroundColor: interpolatedColor as any,
          }}
        />
      ))}
    </View>
  );
};

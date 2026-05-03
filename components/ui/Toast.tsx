import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useUIStore, ToastType } from '../../stores/uiStore';

const iconMap: Record<ToastType, string> = {
  success: '✓',
  error:   '✗',
  warning: '⚠',
  info:    'ℹ',
};

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);
  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onDismiss={dismissToast}
        />
      ))}
    </View>
  );
};

const ToastItem: React.FC<{
  id: string;
  type: ToastType;
  message: string;
  onDismiss: (id: string) => void;
}> = ({ id, type, message, onDismiss }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const bgColor =
    type === 'success'
      ? theme.colors.success
      : type === 'error'
      ? theme.colors.danger
      : type === 'warning'
      ? theme.colors.warning
      : theme.colors.info;

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        alignSelf: 'stretch',
        marginTop: insets.top + theme.space[2],
        marginHorizontal: theme.space[4],
        backgroundColor: '#1F2937',
        borderRadius: theme.radius.lg,
        paddingHorizontal: theme.space[4],
        paddingVertical: theme.space[3],
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space[2],
        ...theme.shadows.md,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#FFF', fontSize: 11 }}>{iconMap[type]}</Text>
      </View>
      <Text
        style={[
          theme.text.bodySmall,
          { color: '#FFFFFF', flex: 1 },
        ]}
        numberOfLines={2}
      >
        {message}
      </Text>
      <TouchableOpacity onPress={() => onDismiss(id)}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
          {'✕'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface StepperProps {
  value: number;
  minValue?: number;
  maxValue?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  minValue = 0,
  maxValue = 9999,
  onChange,
  disabled = false,
  size = 'md',
}) => {
  const theme = useTheme();
  const btnSize = size === 'sm' ? 28 : 34;
  const fontSize = size === 'sm' ? theme.text.caption : theme.text.body;

  const decrement = () => {
    if (value > minValue) onChange(value - 1);
  };
  const increment = () => {
    if (value < maxValue) onChange(value + 1);
  };

  const isAtMin = value <= minValue;
  const isAtMax = value >= maxValue;

  const btnStyle = {
    width: btnSize,
    height: btnSize,
    borderRadius: btnSize / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.isDark ? theme.colors.bgTertiary : theme.colors.bgSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  };

  const btnTextColor = (atLimit: boolean) =>
    atLimit || disabled ? theme.colors.textTertiary : theme.colors.textPrimary;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[1] }}>
      <TouchableOpacity
        onPress={decrement}
        disabled={isAtMin || disabled}
        style={btnStyle}
        activeOpacity={0.6}
      >
        <Text style={[fontSize, { color: btnTextColor(isAtMin) }]}>−</Text>
      </TouchableOpacity>

      <View
        style={{
          minWidth: 40,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.space[1],
        }}
      >
        <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary }]}>
          {value}
        </Text>
      </View>

      <TouchableOpacity
        onPress={increment}
        disabled={isAtMax || disabled}
        style={btnStyle}
        activeOpacity={0.6}
      >
        <Text style={[fontSize, { color: btnTextColor(isAtMax) }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

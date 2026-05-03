import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Text,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = '搜索...',
  onFocus,
  onBlur,
  autoFocus = false,
  ...rest
}) => {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        backgroundColor: theme.isDark ? theme.colors.bgTertiary : theme.colors.bgSecondary,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.space[3],
        gap: theme.space[2],
      }}
    >
      {/* Search icon */}
      <Text style={{ fontSize: 15, color: theme.colors.textTertiary }}>
        {'🔍'}
      </Text>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        autoFocus={autoFocus}
        onFocus={onFocus}
        onBlur={onBlur}
        style={[
          theme.text.body,
          {
            flex: 1,
            color: theme.colors.textPrimary,
            paddingVertical: 0,
          },
        ]}
        {...rest}
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: theme.colors.borderLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>
              {'✕'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

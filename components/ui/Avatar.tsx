import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: { uri: string } | null;
  name?: string;
  size?: AvatarSize;
}

const sizes: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const textSizes: Record<AvatarSize, number> = {
  sm: 13,
  md: 16,
  lg: 22,
  xl: 32,
};

export const Avatar: React.FC<AvatarProps> = ({ source, name, size = 'md' }) => {
  const theme = useTheme();
  const dim = sizes[size];

  const initials = name
    ? name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?';

  if (source?.uri) {
    return (
      <Image
        source={{ uri: source.uri }}
        style={{
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: theme.colors.bgSecondary,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: dim,
        height: dim,
        borderRadius: dim / 2,
        backgroundColor: theme.colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: textSizes[size],
          fontWeight: '600',
          color: theme.colors.primary,
        }}
      >
        {initials}
      </Text>
    </View>
  );
};

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.space[8],
        paddingVertical: theme.space[12],
        gap: theme.space[4],
      }}
    >
      {icon ? (
        <View style={{ marginBottom: theme.space[2] }}>{icon}</View>
      ) : (
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.isDark ? theme.colors.bgTertiary : theme.colors.bgSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.space[2],
          }}
        >
          <Text style={{ fontSize: 28, opacity: 0.4 }}>📦</Text>
        </View>
      )}

      <Text
        style={[
          theme.text.h3,
          {
            color: theme.colors.textPrimary,
            textAlign: 'center',
          },
        ]}
      >
        {title}
      </Text>

      {description && (
        <Text
          style={[
            theme.text.bodySmall,
            {
              color: theme.colors.textSecondary,
              textAlign: 'center',
              lineHeight: theme.text.bodySmall.lineHeight,
            },
          ]}
        >
          {description}
        </Text>
      )}

      {action && (
        <Button variant="primary" onPress={action.onPress} style={{ marginTop: theme.space[2] }}>
          {action.label}
        </Button>
      )}
    </View>
  );
};

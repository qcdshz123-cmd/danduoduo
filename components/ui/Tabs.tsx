import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeKey, onChange }) => {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: theme.space[4],
        gap: theme.space[0],
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
            style={{
              paddingHorizontal: theme.space[3],
              paddingVertical: theme.space[2],
              marginRight: theme.space[1],
              borderBottomWidth: 2,
              borderBottomColor: isActive ? theme.colors.primary : 'transparent',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[1] }}>
              <Text
                style={[
                  isActive ? theme.text.tabActive : theme.text.tab,
                  {
                    color: isActive
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {tab.label}
              </Text>
              {tab.count !== undefined && tab.count > 0 && (
                <View
                  style={{
                    backgroundColor: isActive
                      ? theme.colors.primaryBg
                      : theme.colors.bgSecondary,
                    borderRadius: theme.radius.full,
                    paddingHorizontal: theme.space[1.5],
                    paddingVertical: 1,
                    minWidth: 20,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={[
                      theme.text.caption,
                      {
                        color: isActive
                          ? theme.colors.primary
                          : theme.colors.textTertiary,
                      },
                    ]}
                  >
                    {tab.count > 99 ? '99+' : tab.count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

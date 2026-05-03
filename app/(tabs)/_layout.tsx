import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Tabs, router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { FAB } from '../../components/ui/FAB';

const tabs = [
  { key: 'products',   label: '商品', route: '/(tabs)/products' },
  { key: 'orders',     label: '订单', route: '/(tabs)/orders' },
  { key: 'inventory',  label: '库存', route: '/(tabs)/inventory' },
  { key: 'reports',    label: '报表', route: '/(tabs)/reports' },
  { key: 'profile',    label: '我的', route: '/(tabs)/profile' },
];

function CustomTabBar({ state, navigation }: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = theme.layout.tabBarHeight + insets.bottom;
  const pathname = usePathname();

  const activeKey = tabs.find((t) => pathname.startsWith(t.route))?.key || 'products';

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: tabBarHeight,
        backgroundColor: 'transparent',
      }}
    >
      {/* Translucent background */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.isDark
            ? 'rgba(10,10,10,0.94)'
            : 'rgba(255,255,255,0.94)',
        }}
      />

      {/* Border top */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 0.5,
          backgroundColor: theme.colors.tabBarBorder,
        }}
      />

      {/* Tab items */}
      <View
        style={{
          flexDirection: 'row',
          height: theme.layout.tabBarHeight,
          paddingBottom: 0,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => {
                if (!isActive) {
                  router.replace(tab.route as any);
                }
              }}
              activeOpacity={0.7}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Text
                style={[
                  isActive ? theme.text.tabActive : theme.text.tab,
                  {
                    color: isActive ? theme.colors.primary : theme.colors.textSecondary,
                  },
                ]}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    width: 20,
                    height: 2,
                    borderRadius: 1,
                    backgroundColor: theme.colors.primary,
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const theme = useTheme();
  const pathname = usePathname();

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="products" />
        <Tabs.Screen name="orders" />
        <Tabs.Screen name="inventory" />
        <Tabs.Screen name="reports" />
        <Tabs.Screen name="profile" />
      </Tabs>

      {/* FAB - show on orders tab */}
      {pathname.startsWith('/(tabs)/orders') && (
        <View
          style={{
            position: 'absolute',
            bottom: theme.layout.tabBarHeight + theme.space[4] + 34, // safe area included
            alignSelf: 'center',
          }}
        >
          <FAB
            icon={<Text style={{ color: '#FFF', fontSize: 24 }}>+</Text>}
            onPress={() => router.push('/(tabs)/orders/create')}
          />
        </View>
      )}
    </>
  );
}

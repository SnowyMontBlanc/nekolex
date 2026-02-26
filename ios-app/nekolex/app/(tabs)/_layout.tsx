import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HapticTab } from '@/components/haptic-tab';
import { NekoLexColors, Typography } from '@/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type TabConfig = {
  name: string;
  title: string;
  icon: IoniconsName;
  iconActive: IoniconsName;
};

const TABS: TabConfig[] = [
  { name: 'index',   title: 'ホーム', icon: 'home-outline',            iconActive: 'home' },
  { name: 'pokedex', title: '図鑑',   icon: 'book-outline',            iconActive: 'book' },
  { name: 'quiz',    title: 'クイズ', icon: 'game-controller-outline', iconActive: 'game-controller' },
  { name: 'profile', title: 'マイページ', icon: 'person-outline',      iconActive: 'person' },
];

function GameTabIcon({
  icon,
  iconActive,
  label,
  focused,
}: {
  icon: IoniconsName;
  iconActive: IoniconsName;
  label: string;
  focused: boolean;
}) {
  const color = focused ? NekoLexColors.primary : NekoLexColors.textLight;

  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      <Ionicons
        name={focused ? iconActive : icon}
        size={24}
        color={color}
      />
      <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <GameTabIcon
                icon={tab.icon}
                iconActive={tab.iconActive}
                label={tab.title}
                focused={focused}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: NekoLexColors.surface,
    borderTopWidth: 0,
    // 実機iOS: ホームインジケータ分の余白 / Web・Android: 控えめな高さ
    height: Platform.select({ ios: 90, default: 72 }),
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 28, default: 10 }),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 24,
  },
  tabIconWrap: {
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 4,
    minWidth: 70,
    gap: 3,
    borderTopWidth: 2.5,
    borderTopColor: 'transparent',
  },
  tabIconWrapActive: {
    borderTopColor: NekoLexColors.primary,
  },
  tabLabel: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '700',
  },
});

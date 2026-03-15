import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Platform } from 'react-native';

import AddRecipeScreen from '../screens/AddRecipeScreen';
import CookbookScreen from '../screens/CookbookScreen';
import FeedScreen from '../screens/FeedScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { iconColors } from '../theme/accents';
import { colors, semanticAccents } from '../theme/colors';
import { spacing } from '../theme/spacing';

const Tab = createBottomTabNavigator();

/** Route names used for navigation refs and deep linking. */
export const ROUTES = {
  Discover: 'Discover',
  KitchenInventory: 'KitchenInventory',
  Cookbook: 'Cookbook',
  AddRecipe: 'AddRecipe',
  Profile: 'Profile',
} as const;

/** Outlined icon names per tab (Ionicons). */
const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  [ROUTES.Discover]: 'compass-outline',
  [ROUTES.KitchenInventory]: 'basket-outline',
  [ROUTES.Cookbook]: 'book-outline',
  [ROUTES.AddRecipe]: 'add-outline',
  [ROUTES.Profile]: 'person-outline',
};

const ICON_SIZE = 24;
const TAB_BAR_HEIGHT = 56;
const TOP_BORDER_WIDTH = 1;

export function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: TOP_BORDER_WIDTH,
          borderTopColor: colors.divider,
          minHeight: TAB_BAR_HEIGHT,
          paddingTop: spacing[2],
          paddingBottom: Platform.OS === 'ios' ? spacing[4] : spacing[3],
        },
        tabBarActiveTintColor: semanticAccents.cta,
        tabBarInactiveTintColor: iconColors.inactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          paddingVertical: spacing[1],
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = TAB_ICONS[route.name] ?? 'ellipse-outline';
          return <Ionicons name={iconName} size={size ?? ICON_SIZE} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name={ROUTES.Discover}
        component={FeedScreen}
        options={{ title: 'Discover' }}
      />
      <Tab.Screen
        name={ROUTES.KitchenInventory}
        component={InventoryScreen}
        options={{ title: 'Inventory' }}
      />
      <Tab.Screen
        name={ROUTES.Cookbook}
        component={CookbookScreen}
        options={{ title: 'Cookbook' }}
      />
      <Tab.Screen
        name={ROUTES.AddRecipe}
        component={AddRecipeScreen}
        options={{ title: 'Add Recipe' }}
      />
      <Tab.Screen
        name={ROUTES.Profile}
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

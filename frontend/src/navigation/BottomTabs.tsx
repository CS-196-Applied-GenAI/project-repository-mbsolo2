import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import CookbookScreen from '../screens/CookbookScreen';
import FeedScreen from '../screens/FeedScreen';
import InventoryScreen from '../screens/InventoryScreen';
import UpcomingScreen from '../screens/UpcomingScreen';

const Tab = createBottomTabNavigator();

export function BottomTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Upcoming" component={UpcomingScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen
        name="Cookbook"
        component={CookbookScreen}
        options={{ title: 'My Cookbook' }}
      />
    </Tab.Navigator>
  );
}

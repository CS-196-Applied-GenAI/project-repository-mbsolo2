import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { BottomTabs } from './src/navigation/BottomTabs';
import { cookbookStore } from './src/store/cookbookStore';
import { feedStore } from './src/store/feedStore';
import { inventoryStore } from './src/store/inventoryStore';
import { uiStore } from './src/store/uiStore';
import { upcomingStore } from './src/store/upcomingStore';

function OfflineBanner() {
  const visible = uiStore((s) => s.offlineBannerVisible);
  if (!visible) return null;
  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineText}>
        Offline — showing last updated data
      </Text>
    </View>
  );
}

export default function App() {
  useEffect(() => {
    feedStore.getState().loadFromCache();
    inventoryStore.getState().loadFromCache();
    cookbookStore.getState().loadFromCache();
    upcomingStore.getState().loadFromCache();
  }, []);

  return (
    <NavigationContainer>
      <View style={styles.root}>
        <OfflineBanner />
        <View style={styles.main}>
          <BottomTabs />
        </View>
      </View>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
  offlineBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0ad4e',
  },
  offlineText: {
    color: '#000',
    fontSize: 14,
  },
});

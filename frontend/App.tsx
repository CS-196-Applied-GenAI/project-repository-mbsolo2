import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { getApiBaseUrl } from './src/api/client';
import { BottomTabs } from './src/navigation/BottomTabs';
import { cookbookStore } from './src/store/cookbookStore';
import { feedStore } from './src/store/feedStore';
import { inventoryStore } from './src/store/inventoryStore';
import { uiStore } from './src/store/uiStore';
import { upcomingStore } from './src/store/upcomingStore';
import { colors, fontSizes, layout, spacing } from './src/theme';

function OfflineBanner() {
  const visible = uiStore((s) => s.offlineBannerVisible);
  if (!visible) return null;
  const apiUrl = getApiBaseUrl();
  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineText}>
        Offline — showing last updated data
      </Text>
      <Text style={styles.offlineHint}>
        Start backend (project root): uvicorn app.main:app --reload — API: {apiUrl}
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
    ...layout.flex1,
    backgroundColor: colors.background,
  },
  main: layout.flex1,
  offlineBanner: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.offlineBanner,
  },
  offlineText: {
    color: colors.text,
    fontSize: fontSizes.sm,
  },
  offlineHint: {
    color: colors.text,
    fontSize: fontSizes.xs,
    marginTop: spacing[1],
    opacity: 0.9,
  },
});

import { useMemo } from 'react';
import { FlatList, SectionList, StyleSheet, Text, View } from 'react-native';

import { feedStore } from '../store/feedStore';
import { upcomingStore } from '../store/upcomingStore';
import type { Bucket } from '../store/upcomingStore';
import type { Recipe } from '../types/recipe';

const BUCKET_ORDER: Bucket[] = ['today', 'tomorrow', 'later'];
const BUCKET_LABELS: Record<Bucket, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  later: 'Later',
};

export default function UpcomingScreen() {
  const pinned = upcomingStore((s) => s.pinned);
  const recipes = feedStore((s) => s.recipes);

  const recipeMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    recipes.forEach((r) => map.set(r.id, r));
    return map;
  }, [recipes]);

  const sections = useMemo(() => {
    const raw = BUCKET_ORDER.map((bucket) => {
      const data = pinned
        .filter((p) => p.bucket === bucket)
        .map((p) => ({ recipeId: p.recipeId, recipe: recipeMap.get(p.recipeId) }));
      return { title: BUCKET_LABELS[bucket], data };
    });
    return raw.filter((s) => s.data.length > 0);
  }, [pinned, recipeMap]);

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.recipeId}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.title}>
              {item.recipe?.title ?? 'Unknown recipe'}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No pinned recipes yet. Pin from Feed.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  row: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
  },
});

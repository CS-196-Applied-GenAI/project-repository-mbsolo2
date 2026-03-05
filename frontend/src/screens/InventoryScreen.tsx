import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { InventoryRow } from '../components/InventoryRow';
import { AddInventoryModal } from '../modals/AddInventoryModal';
import {
  byLocation,
  expiringSoon,
  inventoryStore,
} from '../store/inventoryStore';
import type { InventoryItem } from '../types/inventory';

export default function InventoryScreen() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const items = inventoryStore((s) => s.items);
  const addLocalItem = inventoryStore.getState().addLocalItem;
  const removeLocalItem = inventoryStore.getState().removeLocalItem;

  const sections = useMemo(() => {
    const soon = expiringSoon(items);
    const byLoc = byLocation(items);
    const result: { title: string; data: InventoryItem[] }[] = [];
    if (soon.length > 0) {
      result.push({ title: 'Expiring Soon', data: soon });
    }
    for (const key of ['fridge', 'pantry', 'freezer'] as const) {
      const list = byLoc[key] ?? [];
      if (list.length > 0) {
        result.push({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          data: list,
        });
      }
    }
    return result;
  }, [items]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <InventoryRow item={item} onDelete={removeLocalItem} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No items. Tap "+ Add" to add an item.
            </Text>
          </View>
        }
      />
      <AddInventoryModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={(name, quantity) => {
          addLocalItem(name, quantity);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
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

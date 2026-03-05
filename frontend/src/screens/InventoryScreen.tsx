import { useEffect, useMemo, useState } from 'react';
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
  const error = inventoryStore((s) => s.error);
  const fetchInventory = inventoryStore.getState().fetchInventory;
  const addInventoryItem = inventoryStore.getState().addInventoryItem;
  const deleteInventoryItem = inventoryStore.getState().deleteInventoryItem;
  const clearError = inventoryStore.getState().clearError;

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

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

  const handleAddSubmit = async (name: string, quantity: number) => {
    await addInventoryItem(name, quantity);
    if (!inventoryStore.getState().error) {
      setAddModalVisible(false);
    }
  };

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
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={clearError} hitSlop={8}>
            <Text style={styles.errorDismiss}>Dismiss</Text>
          </Pressable>
        </View>
      ) : null}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <InventoryRow item={item} onDelete={deleteInventoryItem} />
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
        onSubmit={handleAddSubmit}
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fee',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#c00',
  },
  errorDismiss: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 12,
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

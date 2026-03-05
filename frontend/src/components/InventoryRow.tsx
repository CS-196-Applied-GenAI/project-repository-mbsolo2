import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { InventoryItem } from '../types/inventory';

export interface InventoryRowProps {
  item: InventoryItem;
  onDelete?: (id: string) => void | Promise<void>;
}

export function InventoryRow({ item, onDelete }: InventoryRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.quantity} · {item.location} · expires {item.expiresOn}
          {item.expired ? ' (expired)' : ''}
        </Text>
      </View>
      {onDelete && (
        <Pressable
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
          accessibilityRole="button"
          accessibilityLabel="Delete"
        >
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteText: {
    color: '#c00',
    fontSize: 15,
  },
});

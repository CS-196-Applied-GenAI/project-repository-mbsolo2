import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, semanticAccents, spacing } from '../theme';
import type { InventoryItem } from '../types/inventory';

import { QuantityStepper } from './QuantityStepper';

export interface InventoryRowProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void | Promise<void>;
  onIncrement?: (id: string) => void | Promise<void>;
  onDecrement?: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

function formatExpiration(expiresOn: string, expired: boolean): string {
  if (expired) return 'Expired';
  return `Expires ${expiresOn}`;
}

export function InventoryRow({
  item,
  onEdit,
  onDelete,
  onIncrement,
  onDecrement,
  isDeleting = false,
  isUpdating = false,
}: InventoryRowProps) {
  const metaParts: string[] = [];
  metaParts.push(String(item.quantity));
  if (item.unit) metaParts.push(item.unit);
  metaParts.push(item.location);
  metaParts.push(formatExpiration(item.expiresOn, item.expired));

  const busy = isDeleting || isUpdating;

  return (
    <View style={[styles.row, busy && styles.rowBusy]}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.metaRow}>
          {(onIncrement != null || onDecrement != null) && (
            <QuantityStepper
              value={item.quantity}
              onIncrement={() => onIncrement(item.id)}
              onDecrement={() => onDecrement(item.id)}
              min={0}
              disabled={busy}
              accessibilityLabel="Quantity"
            />
          )}
          {!(onIncrement != null || onDecrement != null) && (
            <Text style={styles.meta}>{metaParts.join(' · ')}</Text>
          )}
          {(onIncrement != null || onDecrement != null) && (
            <Text style={styles.meta}>
              {[item.unit, item.location, formatExpiration(item.expiresOn, item.expired)]
                .filter(Boolean)
                .join(' · ') || '\u00A0'}
            </Text>
          )}
        </View>
        {(item.category != null && item.category !== '') && (
          <Text style={styles.category}>{item.category}</Text>
        )}
        {item.expired && (
          <View style={styles.expiredBadge}>
            <Text style={styles.expiredText}>Expired</Text>
          </View>
        )}
      </View>
      {(isDeleting || isUpdating) && (
        <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
      )}
      <View style={styles.actions}>
        {onEdit && (
          <Pressable
            style={[styles.actionButton, busy && styles.actionButtonDisabled]}
            onPress={() => onEdit(item)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Edit"
          >
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
        )}
        {onDelete && (
          <Pressable
            style={[styles.actionButton, styles.deleteButton, busy && styles.actionButtonDisabled]}
            onPress={() => onDelete(item.id)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Delete"
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  metaRow: {
    marginTop: spacing[1],
  },
  meta: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  rowBusy: {
    opacity: 0.8,
  },
  spinner: {
    marginRight: spacing[2],
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  category: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    marginTop: spacing[1],
    textTransform: 'capitalize',
  },
  expiredBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing[2],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: 4,
    backgroundColor: colors.errorBackground,
  },
  expiredText: {
    fontSize: fontSizes.xs,
    color: colors.error,
    fontWeight: fontWeights.medium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  actionButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  actionText: {
    fontSize: fontSizes.sm,
    color: semanticAccents.cta,
  },
  deleteButton: {},
  deleteText: {
    fontSize: fontSizes.sm,
    color: colors.error,
  },
});

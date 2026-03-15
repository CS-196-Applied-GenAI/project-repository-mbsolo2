import React, { useCallback } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, radius, spacing } from '../theme';
import type { InventoryItem } from '../types/inventory';

import {
  InventoryItemForm,
  itemToFormValues,
  type InventoryItemFormValues,
  validateInventoryForm,
} from '../components/InventoryItemForm';

export interface EditInventoryModalProps {
  visible: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  /** Backend has no PATCH; caller should delete then add (replace). Sends name, quantity, optional expiration_date, and optional category. */
  onSave: (itemId: string, name: string, quantity: number, expirationDate?: string | null, category?: string | null) => void | Promise<void>;
}

export function EditInventoryModal({
  visible,
  item,
  onClose,
  onSave,
}: EditInventoryModalProps) {
  const handleSubmit = useCallback(
    async (values: InventoryItemFormValues) => {
      const err = validateInventoryForm(values, 'edit');
      if (err || !item) return;
      const name = values.name.trim();
      const q = parseFloat(values.quantity);
      if (!name || Number.isNaN(q) || q < 0) return;
      const expirationDate =
        values.expirationDate.trim() !== ''
          ? values.expirationDate.trim().slice(0, 10)
          : undefined;
      const category =
        values.category.trim() !== '' ? values.category.trim() : undefined;
      await Promise.resolve(onSave(item.id, name, q, expirationDate, category));
      onClose();
    },
    [item, onSave, onClose]
  );

  if (!visible || !item) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit ingredient</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={12}
              accessibilityRole="button"
            >
              <Text style={styles.close}>Cancel</Text>
            </Pressable>
          </View>
          <InventoryItemForm
            initialValues={itemToFormValues(item)}
            mode="edit"
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitLabel="Save"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.surfaceOverlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  closeButton: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    justifyContent: 'center',
  },
  close: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.accentBlue,
  },
});

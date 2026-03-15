import React, { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, radius, spacing } from '../theme';

import {
  InventoryItemForm,
  type InventoryItemFormValues,
  validateInventoryForm,
} from '../components/InventoryItemForm';

export interface AddInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  /** Backend accepts name, quantity, and optional expiration_date (YYYY-MM-DD). */
  onSubmit: (name: string, quantity: number, expirationDate?: string | null) => void | Promise<void>;
}

export function AddInventoryModal({
  visible,
  onClose,
  onSubmit,
}: AddInventoryModalProps) {
  const [key, setKey] = useState(0);

  const handleSubmit = useCallback(
    async (values: InventoryItemFormValues) => {
      const err = validateInventoryForm(values, 'add');
      if (err) return;
      const name = values.name.trim();
      const q = parseFloat(values.quantity);
      if (!name || Number.isNaN(q) || q <= 0) return;
      const expirationDate =
        values.expirationDate.trim() !== ''
          ? values.expirationDate.trim().slice(0, 10)
          : undefined;
      await Promise.resolve(onSubmit(name, q, expirationDate));
      setKey((k) => k + 1);
      onClose();
    },
    [onSubmit, onClose]
  );

  const handleCancel = useCallback(() => {
    setKey((k) => k + 1);
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Add ingredient</Text>
            <Pressable
              onPress={handleCancel}
              style={styles.closeButton}
              hitSlop={12}
              accessibilityRole="button"
            >
              <Text style={styles.close}>Cancel</Text>
            </Pressable>
          </View>
          <InventoryItemForm
            key={key}
            initialValues={null}
            mode="add"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Add ingredient"
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

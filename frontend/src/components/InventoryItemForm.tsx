import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, fontSizes, fontWeights, radius, spacing } from '../theme';
import type { InventoryItem } from '../types/inventory';

import { PrimaryButton } from './PrimaryButton';

/** Form values; only name and quantity are sent to the backend on create/update. */
export interface InventoryItemFormValues {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  expirationDate: string;
}

export interface InventoryItemFormProps {
  /** Prefill for edit mode. */
  initialValues?: Partial<InventoryItemFormValues> | null;
  mode: 'add' | 'edit';
  onSubmit: (values: InventoryItemFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

function parseQuantity(s: string): number {
  const n = parseFloat(s);
  return Number.isNaN(n) ? NaN : n;
}

/** Validates required fields. Returns error message or null. */
export function validateInventoryForm(
  values: InventoryItemFormValues,
  mode: 'add' | 'edit'
): string | null {
  const name = values.name.trim();
  if (!name) return 'Ingredient name is required.';
  const q = parseQuantity(values.quantity);
  if (Number.isNaN(q)) return 'Quantity must be a number.';
  if (mode === 'add' && q <= 0) return 'Quantity must be greater than 0.';
  if (mode === 'edit' && q < 0) return 'Quantity cannot be negative.';
  if (values.expirationDate.trim()) {
    const d = new Date(values.expirationDate.trim());
    if (Number.isNaN(d.getTime())) return 'Expiration date must be valid (e.g. YYYY-MM-DD).';
  }
  return null;
}

export function InventoryItemForm({
  initialValues,
  mode,
  onSubmit,
  onCancel,
  submitLabel = mode === 'add' ? 'Add ingredient' : 'Save',
}: InventoryItemFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [quantity, setQuantity] = useState(
    initialValues?.quantity ?? ''
  );
  const [unit, setUnit] = useState(initialValues?.unit ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? '');
  const [expirationDate, setExpirationDate] = useState(
    initialValues?.expirationDate ?? ''
  );
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (initialValues != null) {
      setName(initialValues.name ?? '');
      setQuantity(initialValues.quantity ?? '');
      setUnit(initialValues.unit ?? '');
      setCategory(initialValues.category ?? '');
      setExpirationDate(initialValues.expirationDate ?? '');
    }
  }, [initialValues]);

  const values: InventoryItemFormValues = {
    name,
    quantity,
    unit,
    category,
    expirationDate,
  };
  const error = touched ? validateInventoryForm(values, mode) : null;

  const handleSubmit = async () => {
    setTouched(true);
    const err = validateInventoryForm(values, mode);
    if (err) return;
    await Promise.resolve(onSubmit(values));
  };

  const canSubmit = !validateInventoryForm(values, mode);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Ingredient name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Milk, Chicken breast"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        accessibilityLabel="Ingredient name"
      />

      <Text style={styles.label}>Quantity *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 2"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="decimal-pad"
        accessibilityLabel="Quantity"
      />

      <Text style={styles.labelOptional}>Unit (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. cups, oz, lbs"
        value={unit}
        onChangeText={setUnit}
        autoCapitalize="none"
      />

      <Text style={styles.labelOptional}>Category (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. dairy, produce"
        value={category}
        onChangeText={setCategory}
        autoCapitalize="none"
      />

      <Text style={styles.labelOptional}>Expiration date (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={expirationDate}
        onChangeText={setExpirationDate}
        autoCapitalize="none"
      />

      {mode === 'add' && (
        <Text style={styles.hint}>
          Category and expiration are estimated by the app when not provided.
        </Text>
      )}

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      <PrimaryButton
        title={submitLabel}
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

/** Build form initial values from an InventoryItem (for edit mode). */
export function itemToFormValues(item: InventoryItem): Partial<InventoryItemFormValues> {
  return {
    name: item.name,
    quantity: String(item.quantity),
    unit: item.unit ?? '',
    category: item.category ?? '',
    expirationDate: item.expiresOn && item.expiresOn !== '' ? item.expiresOn : '',
  };
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.text,
    marginBottom: spacing[1],
    marginTop: spacing[2],
  },
  labelOptional: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    marginBottom: spacing[1],
    marginTop: spacing[3],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing[3],
    fontSize: fontSizes.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  hint: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    marginTop: spacing[3],
    fontStyle: 'italic',
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.error,
    marginTop: spacing[2],
  },
  submitButton: {
    marginTop: spacing[4],
  },
});

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, fontSizes, fontWeights, radius, spacing } from '../theme';

export type PassReasonOption =
  | 'ingredient_dislike'
  | 'dish_type_dislike'
  | 'too_many_steps'
  | 'not_in_mood'
  | 'custom_text';

export interface PassReasonResult {
  reason: PassReasonOption;
  ingredient?: string;
  dishType?: string;
  freeText?: string;
}

export interface PassReasonModalProps {
  visible: boolean;
  recipeId: string | null;
  onClose: () => void;
  onSubmit?: (result: PassReasonResult) => void;
}

const REASON_OPTIONS: { value: PassReasonOption; label: string }[] = [
  { value: 'ingredient_dislike', label: "Don't like an ingredient" },
  { value: 'dish_type_dislike', label: "Don't want this type of dish" },
  { value: 'too_many_steps', label: 'Too many steps' },
  { value: 'not_in_mood', label: 'Not in the mood' },
  { value: 'custom_text', label: "Other (I'll type)" },
];

export function PassReasonModal({
  visible,
  recipeId,
  onClose,
  onSubmit,
}: PassReasonModalProps) {
  const [reason, setReason] = useState<PassReasonOption | null>(null);
  const [ingredient, setIngredient] = useState('');
  const [dishType, setDishType] = useState('');
  const [freeText, setFreeText] = useState('');

  const handleSubmit = () => {
    if (reason) {
      onSubmit?.({
        reason,
        ...(ingredient ? { ingredient } : undefined),
        ...(dishType ? { dishType } : undefined),
        ...(freeText ? { freeText } : undefined),
      });
    }
    setReason(null);
    setIngredient('');
    setDishType('');
    setFreeText('');
    onClose();
  };

  const handleDismiss = () => {
    setReason(null);
    setIngredient('');
    setDishType('');
    setFreeText('');
    onClose();
  }

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleDismiss}
    >
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Why pass?</Text>
            <Pressable onPress={handleDismiss} hitSlop={12}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.scroll}>
            {REASON_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.option, reason === opt.value && styles.optionSelected]}
                onPress={() => setReason(opt.value)}
              >
                <Text>{opt.label}</Text>
              </Pressable>
            ))}
            {reason === 'ingredient_dislike' && (
              <TextInput
                style={styles.input}
                placeholder="Which ingredient?"
                placeholderTextColor={colors.textTertiary}
                value={ingredient}
                onChangeText={setIngredient}
              />
            )}
            {reason === 'dish_type_dislike' && (
              <TextInput
                style={styles.input}
                placeholder="Which dish type?"
                placeholderTextColor={colors.textTertiary}
                value={dishType}
                onChangeText={setDishType}
              />
            )}
            {reason === 'custom_text' && (
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Tell us more (optional)"
                placeholderTextColor={colors.textTertiary}
                value={freeText}
                onChangeText={setFreeText}
                multiline
              />
            )}
            {reason && (
              <Pressable style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Done</Text>
              </Pressable>
            )}
          </ScrollView>
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
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  close: {
    fontSize: fontSizes.md,
    color: colors.accentBlue,
    fontWeight: fontWeights.medium,
  },
  scroll: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  option: {
    padding: spacing[3],
    marginBottom: spacing[2],
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
  },
  optionSelected: {
    backgroundColor: colors.borderLight,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing[3],
    marginTop: spacing[3],
    fontSize: fontSizes.md,
    color: colors.text,
  },
  inputMultiline: {
    minHeight: 80,
  },
  submitButton: {
    marginTop: spacing[5],
    padding: spacing[3],
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  submitText: {
    color: colors.textInverse,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
});

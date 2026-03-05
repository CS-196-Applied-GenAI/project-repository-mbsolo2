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
                value={ingredient}
                onChangeText={setIngredient}
              />
            )}
            {reason === 'dish_type_dislike' && (
              <TextInput
                style={styles.input}
                placeholder="Which dish type?"
                value={dishType}
                onChangeText={setDishType}
              />
            )}
            {reason === 'custom_text' && (
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Tell us more (optional)"
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  close: {
    fontSize: 16,
    color: '#007AFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  option: {
    padding: 14,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 80,
  },
  submitButton: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

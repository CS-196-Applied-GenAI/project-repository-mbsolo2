import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export interface AddInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, quantity: number) => void;
}

export function AddInventoryModal({
  visible,
  onClose,
  onSubmit,
}: AddInventoryModalProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    const q = parseFloat(quantity);
    if (trimmed && !Number.isNaN(q) && q > 0) {
      onSubmit(trimmed, q);
      setName('');
      setQuantity('');
      onClose();
    }
  };

  const handleDismiss = () => {
    setName('');
    setQuantity('');
    onClose();
  };

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
            <Text style={styles.title}>Add item</Text>
            <Pressable onPress={handleDismiss} hitSlop={12}>
              <Text style={styles.close}>Cancel</Text>
            </Pressable>
          </View>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity (e.g. 2)"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />
            <Pressable
              style={[styles.submitButton, (!name.trim() || !quantity) && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={!name.trim() || !quantity}
            >
              <Text style={styles.submitText}>Add</Text>
            </Pressable>
          </View>
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
    paddingBottom: 32,
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
  form: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 8,
    padding: 14,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

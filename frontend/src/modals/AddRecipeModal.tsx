import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { cookbookStore } from '../store/cookbookStore';
import type { Recipe } from '../types/recipe';

export interface AddRecipeModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}

function parseLines(s: string): string[] {
  return s
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseTags(s: string): string[] {
  return s
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function AddRecipeModal({
  visible,
  onClose,
  onAdded,
}: AddRecipeModalProps) {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const recipeData: Omit<Recipe, 'id'> = {
      title: trimmedTitle,
      cuisine: '',
      totalMinutes: 0,
      servings: 2,
      tags: parseTags(tagsInput),
      why: [],
      ingredientsHave: parseLines(ingredients),
      ingredientsMaybeWant: [],
      instructions: parseLines(instructions),
      ...(photoUri ? { photoUri } : {}),
    };

    cookbookStore.getState().addMyRecipe(recipeData);
    setTitle('');
    setIngredients('');
    setInstructions('');
    setTagsInput('');
    setPhotoUri(undefined);
    onAdded();
  };

  const handleDismiss = () => {
    setTitle('');
    setIngredients('');
    setInstructions('');
    setTagsInput('');
    setPhotoUri(undefined);
    onClose();
  };

  if (!visible) return null;

  const canSubmit = title.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDismiss}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Recipe</Text>
          <Pressable onPress={handleDismiss} hitSlop={12}>
            <Text style={styles.close}>Cancel</Text>
          </Pressable>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={styles.input}
            placeholder="Recipe title"
            value={title}
            onChangeText={setTitle}
            autoCapitalize="words"
          />
          <Text style={styles.label}>Ingredients (one per line)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="e.g. 2 cups flour&#10;1 tsp salt"
            value={ingredients}
            onChangeText={setIngredients}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.label}>Instructions (one step per line)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="e.g. Mix dry ingredients&#10;Bake 30 min"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.label}>Tags (comma-separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. quick, vegetarian, breakfast"
            value={tagsInput}
            onChangeText={setTagsInput}
          />
          <View style={styles.photoRow}>
            <Text style={styles.label}>Photo (optional)</Text>
            <Pressable style={styles.photoButton} onPress={pickImage}>
              <Text style={styles.photoButtonText}>
                {photoUri ? 'Change photo' : 'Pick image'}
              </Text>
            </Pressable>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.preview}
                resizeMode="cover"
              />
            ) : null}
          </View>
          <Pressable
            style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text style={styles.submitText}>Add to Cookbook</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
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
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoRow: {
    marginTop: 12,
  },
  photoButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  photoButtonText: {
    fontSize: 15,
    color: '#007AFF',
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#eee',
  },
  submitButton: {
    marginTop: 24,
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

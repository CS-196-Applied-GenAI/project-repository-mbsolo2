import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AddRecipeForm } from '../components/AddRecipeForm';
import { ErrorBanner } from '../components/ErrorBanner';
import { cookbookStore } from '../store/cookbookStore';
import { recipeService } from '../services/recipeService';
import type { Recipe } from '../types/recipe';
import type { AddRecipeFormErrors, AddRecipeFormValues } from '../utils/addRecipeForm';
import {
  parseIngredientLines,
  parseInstructions,
  parseTags,
  recipeToFormValues,
  validateAddRecipeForm,
} from '../utils/addRecipeForm';
import { colors, fontSizes, fontWeights, spacing } from '../theme';

const INITIAL_VALUES: AddRecipeFormValues = {
  title: '',
  ingredientsText: '',
  instructionsText: '',
  totalMinutes: 0,
  servings: 0,
  tagsInput: '',
  photoUri: undefined,
};

export interface AddRecipeModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
  /** When set, modal opens in edit mode with form prefilled; on submit calls onUpdated instead of onAdded. */
  recipeToEdit?: Recipe | null;
  /** Called after successfully updating a recipe (when recipeToEdit was set). */
  onUpdated?: () => void;
  /** When true, render as inline content (e.g. for Add Recipe tab) instead of a modal. */
  asScreen?: boolean;
}

export function AddRecipeModal({
  visible,
  onClose,
  onAdded,
  recipeToEdit = null,
  onUpdated,
  asScreen = false,
}: AddRecipeModalProps) {
  const [values, setValues] = useState<AddRecipeFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<AddRecipeFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (recipeToEdit) {
        setValues(recipeToFormValues(recipeToEdit));
      } else {
        setValues(INITIAL_VALUES);
      }
      setErrors({});
      setSubmitError(null);
    }
  }, [visible, recipeToEdit]);

  const handleChange = useCallback((field: keyof AddRecipeFormValues, value: string | number | undefined) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as keyof AddRecipeFormErrors];
      return next;
    });
    setSubmitError(null);
  }, []);

  const handlePickPhoto = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setValues((prev) => ({ ...prev, photoUri: result.assets[0].uri }));
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const validation = validateAddRecipeForm(values);
    const hasErrors = Object.keys(validation).length > 0;
    if (hasErrors) {
      setErrors(validation);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    try {
      const { ingredients, names } = parseIngredientLines(values.ingredientsText);
      const instructions = parseInstructions(values.instructionsText);
      const tags = parseTags(values.tagsInput);

      const recipeData: Omit<Recipe, 'id'> = {
        title: values.title.trim(),
        cuisine: recipeToEdit?.cuisine ?? '',
        totalMinutes: values.totalMinutes > 0 ? values.totalMinutes : 0,
        servings: values.servings > 0 ? values.servings : 2,
        tags,
        why: recipeToEdit?.why ?? [],
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        ingredientsHave: names.length > 0 ? names : [],
        ingredientsMaybeWant: recipeToEdit?.ingredientsMaybeWant ?? [],
        instructions,
        ...(values.photoUri ? { photoUri: values.photoUri } : {}),
      };

      if (recipeToEdit) {
        cookbookStore.getState().updateRecipe(recipeToEdit.id, recipeData);
        setValues(INITIAL_VALUES);
        setErrors({});
        onUpdated?.();
      } else {
        recipeService.createRecipe(recipeData);
        setValues(INITIAL_VALUES);
        setErrors({});
        onAdded();
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }, [values, recipeToEdit, onAdded, onUpdated]);

  const handleDismiss = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setSubmitError(null);
    onClose();
  }, [onClose]);

  if (!visible && !asScreen) return null;

  const isEdit = Boolean(recipeToEdit);
  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isEdit ? 'Edit Recipe' : 'Add Recipe'}</Text>
        {!asScreen && (
          <Pressable
            onPress={handleDismiss}
            style={styles.closeButton}
            hitSlop={12}
            accessibilityRole="button"
          >
            <Text style={styles.close}>Cancel</Text>
          </Pressable>
        )}
      </View>
      {submitError != null && (
        <ErrorBanner
          message={submitError}
          onDismiss={() => setSubmitError(null)}
        />
      )}
      <AddRecipeForm
        values={values}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onPickPhoto={handlePickPhoto}
        submitting={submitting}
      />
    </View>
  );

  if (asScreen) {
    return <View style={styles.wrapper}>{content}</View>;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDismiss}
    >
      <View style={styles.wrapper}>{content}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
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

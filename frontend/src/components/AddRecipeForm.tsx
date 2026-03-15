/**
 * Add Recipe form — presentational form component.
 * Form state, validation, and submit handling live in the parent (AddRecipeModal / AddRecipeScreen).
 */
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

import type { AddRecipeFormErrors, AddRecipeFormValues } from '../utils/addRecipeForm';
import { colors, fontSizes, fontWeights, radius, spacing } from '../theme';
import { ImageUploadPlaceholder } from './ImageUploadPlaceholder';
import { PrimaryButton } from './PrimaryButton';

export type { AddRecipeFormErrors, AddRecipeFormValues } from '../utils/addRecipeForm';

export interface AddRecipeFormProps {
  values: AddRecipeFormValues;
  errors: AddRecipeFormErrors;
  onChange: (field: keyof AddRecipeFormValues, value: string | number | undefined) => void;
  onSubmit: () => void;
  onPickPhoto?: () => void;
  submitting?: boolean;
  style?: ViewStyle;
}

export function AddRecipeForm({
  values,
  errors,
  onChange,
  onSubmit,
  onPickPhoto,
  submitting = false,
  style,
}: AddRecipeFormProps) {
  const canSubmit =
    values.title.trim().length > 0 &&
    (values.ingredientsText.trim().length > 0 || values.instructionsText.trim().length > 0);

  return (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={[styles.input, errors.title ? styles.inputError : null]}
        placeholder="Recipe title"
        placeholderTextColor={colors.textTertiary}
        value={values.title}
        onChangeText={(t) => onChange('title', t)}
        autoCapitalize="words"
        editable={!submitting}
      />
      {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

      <Text style={styles.label}>Ingredients * (one per line, e.g. "2 cups flour")</Text>
      <TextInput
        style={[styles.input, styles.multiline, errors.ingredients ? styles.inputError : null]}
        placeholder="e.g. 2 cups flour&#10;1 tsp salt&#10;3 eggs"
        placeholderTextColor={colors.textTertiary}
        value={values.ingredientsText}
        onChangeText={(t) => onChange('ingredientsText', t)}
        multiline
        numberOfLines={4}
        editable={!submitting}
      />
      {errors.ingredients ? <Text style={styles.errorText}>{errors.ingredients}</Text> : null}

      <Text style={styles.label}>Instructions * (one step per line)</Text>
      <TextInput
        style={[styles.input, styles.multiline, errors.instructions ? styles.inputError : null]}
        placeholder="e.g. Mix dry ingredients&#10;Bake at 350°F for 30 min"
        placeholderTextColor={colors.textTertiary}
        value={values.instructionsText}
        onChangeText={(t) => onChange('instructionsText', t)}
        multiline
        numberOfLines={4}
        editable={!submitting}
      />
      {errors.instructions ? <Text style={styles.errorText}>{errors.instructions}</Text> : null}

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Cook time (min)</Text>
          <TextInput
            style={[styles.input, errors.totalMinutes ? styles.inputError : null]}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            value={values.totalMinutes > 0 ? String(values.totalMinutes) : ''}
            onChangeText={(t) => {
              const n = parseInt(t, 10);
              onChange('totalMinutes', t === '' ? 0 : isNaN(n) ? values.totalMinutes : n);
            }}
            keyboardType="number-pad"
            editable={!submitting}
          />
          {errors.totalMinutes ? <Text style={styles.errorText}>{errors.totalMinutes}</Text> : null}
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Servings</Text>
          <TextInput
            style={[styles.input, errors.servings ? styles.inputError : null]}
            placeholder="2"
            placeholderTextColor={colors.textTertiary}
            value={values.servings > 0 ? String(values.servings) : ''}
            onChangeText={(t) => {
              const n = parseInt(t, 10);
              onChange('servings', t === '' ? 0 : isNaN(n) ? values.servings : n);
            }}
            keyboardType="number-pad"
            editable={!submitting}
          />
          {errors.servings ? <Text style={styles.errorText}>{errors.servings}</Text> : null}
        </View>
      </View>

      <Text style={styles.label}>Tags (comma-separated, e.g. vegetarian, quick)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. vegetarian, quick, breakfast"
        placeholderTextColor={colors.textTertiary}
        value={values.tagsInput}
        onChangeText={(t) => onChange('tagsInput', t)}
        editable={!submitting}
      />

      {onPickPhoto != null && (
        <View style={styles.photoSection}>
          {values.photoUri ? (
            <>
              <Pressable
                style={styles.photoButton}
                onPress={onPickPhoto}
                disabled={submitting}
                accessibilityRole="button"
              >
                <Text style={styles.photoButtonText}>Change photo</Text>
              </Pressable>
              <Image
                source={{ uri: values.photoUri }}
                style={styles.preview}
                resizeMode="cover"
              />
            </>
          ) : (
            <ImageUploadPlaceholder
              label="Add photo (optional)"
              hint="Tap to choose from library"
              onPress={onPickPhoto}
              disabled={submitting}
            />
          )}
        </View>
      )}

      <PrimaryButton
        title={submitting ? 'Saving…' : 'Add to Cookbook'}
        onPress={onSubmit}
        disabled={!canSubmit || submitting}
        size="lg"
        style={styles.submitButton}
      />
    </ScrollView>
  );
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
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing[3],
    fontSize: fontSizes.base,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: spacing[1],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  half: {
    flex: 1,
  },
  photoSection: {
    marginTop: spacing[3],
  },
  photoButton: {
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
    marginTop: spacing[1],
  },
  photoButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.accentBlue,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    marginTop: spacing[2],
    backgroundColor: colors.surfaceSubtle,
  },
  submitButton: {
    marginTop: spacing[6],
  },
});


import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors, fontSizes, radius, spacing, textStyles } from '../theme';

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
}

/**
 * Search field using design system: rounded corners, soft gray placeholder, 44pt min height.
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search…',
  editable = true,
  ...rest
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondarySoft}
        editable={editable}
        returnKeyType="search"
        accessibilityRole="search"
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    ...textStyles.body,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    color: colors.text,
  },
  inputDisabled: {
    opacity: 0.6,
  },
});

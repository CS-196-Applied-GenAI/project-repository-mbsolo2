import React from 'react';
import { ViewStyle } from 'react-native';

import { accentOrder } from '../theme';

import { TagChip, TagChipProps } from './TagChip';

export interface FilterChipProps extends Omit<TagChipProps, 'selectedAccentColor'> {
  /** Index into accentOrder for rainbow selected state (default 0). */
  accentIndex?: number;
}

/**
 * Filter chip for tabs like "All" / "From your kitchen". Uses TagChip with design system
 * and optional rainbow accent by index.
 */
export function FilterChip({
  accentIndex = 0,
  selectedAccentColor,
  ...rest
}: FilterChipProps) {
  const resolvedAccent = selectedAccentColor ?? accentOrder[accentIndex % accentOrder.length];
  return <TagChip {...rest} selectedAccentColor={resolvedAccent} />;
}

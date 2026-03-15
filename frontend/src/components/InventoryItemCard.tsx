import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontSizes, fontWeights, spacing, textStyles } from '../theme';

import { CardContainer } from './CardContainer';
import { QuantityStepper } from './QuantityStepper';

export interface InventoryItemCardProps {
  /** Item name (primary) */
  name: string;
  /** Optional secondary line (e.g. location, expiration) */
  meta?: string;
  /** Optional category or tag */
  category?: string;
  /** When provided, renders QuantityStepper; otherwise no stepper */
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  /** Optional custom right content (e.g. actions) */
  right?: ReactNode;
  /** Optional badge (e.g. "Expired") */
  badge?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * Card-style inventory item: name, optional meta, optional quantity stepper, optional right actions.
 * Presentational only; pass quantity and handlers from parent.
 */
export function InventoryItemCard({
  name,
  meta,
  category,
  quantity,
  onIncrement,
  onDecrement,
  right,
  badge,
  onPress,
  style,
}: InventoryItemCardProps) {
  const showStepper =
    quantity != null && onIncrement != null && onDecrement != null;

  return (
    <CardContainer onPress={onPress} shadow="sm" style={style}>
      <View style={styles.row}>
        <View style={styles.main}>
          <Text style={styles.name}>{name}</Text>
          {showStepper && (
            <QuantityStepper
              value={quantity}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              min={0}
              accessibilityLabel="Quantity"
            />
          )}
          {meta != null && meta !== '' && (
            <Text style={styles.meta}>{meta}</Text>
          )}
          {category != null && category !== '' && (
            <Text style={styles.category}>{category}</Text>
          )}
          {badge != null && <View style={styles.badgeWrap}>{badge}</View>}
        </View>
        {right != null && <View style={styles.right}>{right}</View>}
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...textStyles.body,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  meta: {
    ...textStyles.bodySmall,
    color: colors.textSecondarySoft,
    marginTop: spacing[1],
  },
  category: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    marginTop: spacing[1],
    textTransform: 'capitalize',
  },
  badgeWrap: {
    marginTop: spacing[2],
  },
  right: {
    marginLeft: spacing[3],
  },
});

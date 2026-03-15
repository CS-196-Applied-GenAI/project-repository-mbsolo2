import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import {
  CardContainer,
  EmptyState,
  ErrorBanner,
  FilterChip,
  InventoryItemCard,
  LoadingState,
  PrimaryButton,
  ScreenContainer,
  SectionHeader,
  SecondaryButton,
  SearchBar,
  StatCard,
} from '../components';
import { AddInventoryModal } from '../modals/AddInventoryModal';
import { EditInventoryModal } from '../modals/EditInventoryModal';
import { ROUTES } from '../navigation/BottomTabs';
import { feedStore } from '../store/feedStore';
import {
  byCategory,
  expiringSoon,
  inventoryStore,
  lowStock,
} from '../store/inventoryStore';
import type { InventoryItem } from '../types/inventory';
import {
  accentOrder,
  colors,
  fontSizes,
  fontWeights,
  screenPaddingHorizontal,
  spacing,
  textStyles,
} from '../theme';

type InventoryFilter = 'all' | 'expiring_soon' | 'low_stock';

function formatExpiration(expiresOn: string, expired: boolean): string {
  if (expired) return 'Expired';
  return expiresOn ? `Expires ${expiresOn}` : '';
}

export default function InventoryScreen() {
  const navigation = useNavigation();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChip, setFilterChip] = useState<InventoryFilter>('all');
  const [findingRecipes, setFindingRecipes] = useState(false);

  const items = inventoryStore((s) => s.items);
  const error = inventoryStore((s) => s.error);
  const loading = inventoryStore((s) => s.loading);
  const fetchInventory = inventoryStore.getState().fetchInventory;
  const loadFromCache = inventoryStore.getState().loadFromCache;
  const addInventoryItem = inventoryStore.getState().addInventoryItem;
  const deleteInventoryItem = inventoryStore.getState().deleteInventoryItem;
  const replaceItem = inventoryStore.getState().replaceItem;
  const updateQuantity = inventoryStore.getState().updateQuantity;
  const clearError = inventoryStore.getState().clearError;
  const deletingItemId = inventoryStore((s) => s.deletingItemId);
  const updatingItemId = inventoryStore((s) => s.updatingItemId);

  useEffect(() => {
    const run = async () => {
      await loadFromCache();
      await fetchInventory();
    };
    run();
  }, [fetchInventory, loadFromCache]);

  const filteredBySearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.category?.toLowerCase().includes(q) ?? false)
    );
  }, [items, searchQuery]);

  const filteredByChip = useMemo(() => {
    switch (filterChip) {
      case 'expiring_soon':
        return expiringSoon(filteredBySearch);
      case 'low_stock':
        return lowStock(filteredBySearch);
      default:
        return filteredBySearch;
    }
  }, [filterChip, filteredBySearch]);

  const sections = useMemo(
    () => byCategory(filteredByChip),
    [filteredByChip]
  );

  const totalCount = items.length;
  const expiringSoonCount = expiringSoon(items).length;
  const lowStockCount = lowStock(items).length;

  const handleAddSubmit = useCallback(
    async (name: string, quantity: number, expirationDate?: string | null) => {
      await addInventoryItem(name, quantity, expirationDate);
      if (!inventoryStore.getState().error) {
        setAddModalVisible(false);
      }
    },
    [addInventoryItem]
  );

  const handleEditSave = useCallback(
    async (
      itemId: string,
      name: string,
      quantity: number,
      expirationDate?: string | null,
      category?: string | null
    ) => {
      await replaceItem(itemId, name, quantity, expirationDate, category);
      if (!inventoryStore.getState().error) {
        setEditItem(null);
      }
    },
    [replaceItem]
  );

  const handleDelete = useCallback(
    (id: string, itemName: string) => {
      Alert.alert(
        'Delete ingredient?',
        `Remove "${itemName}" from your inventory?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteInventoryItem(id) },
        ]
      );
    },
    [deleteInventoryItem]
  );

  const handleFindRecipes = useCallback(async () => {
    setFindingRecipes(true);
    try {
      await feedStore.getState().fetchFeed();
      (navigation as { navigate: (name: string, params?: { fromKitchen?: boolean }) => void }).navigate(
        ROUTES.Discover,
        { fromKitchen: true }
      );
    } finally {
      setFindingRecipes(false);
    }
  }, [navigation]);

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        <LoadingState message="Loading inventory…" />
      </ScreenContainer>
    );
  }

  const listHeader = (
    <View style={styles.listHeader}>
      <View style={styles.chipsRow}>
        <FilterChip
          label="All Items"
          selected={filterChip === 'all'}
          accentIndex={0}
          onPress={() => setFilterChip('all')}
        />
        <FilterChip
          label="Expiring Soon"
          selected={filterChip === 'expiring_soon'}
          accentIndex={2}
          onPress={() => setFilterChip('expiring_soon')}
        />
        <FilterChip
          label="Low Stock"
          selected={filterChip === 'low_stock'}
          accentIndex={4}
          onPress={() => setFilterChip('low_stock')}
        />
      </View>

      <View style={styles.tipCard}>
        <CardContainer shadow="none" style={styles.tipCardInner}>
          <Text style={styles.tipText}>
            Add ingredients and tap Find Recipes to see suggestions based on what you have.
          </Text>
        </CardContainer>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          label="Total items"
          value={totalCount}
          accentColor={accentOrder[0]}
        />
        <StatCard
          label="Expiring soon"
          value={expiringSoonCount}
          accentColor={accentOrder[2]}
        />
        <StatCard
          label="Low stock"
          value={lowStockCount}
          accentColor={accentOrder[4]}
        />
      </View>

      <View style={styles.buttonsRow}>
        <PrimaryButton
          title={findingRecipes ? 'Finding recipes…' : 'Find Recipes With My Ingredients'}
          onPress={handleFindRecipes}
          disabled={findingRecipes}
          size="lg"
        />
        <SecondaryButton
          title="Add Ingredient"
          onPress={() => setAddModalVisible(true)}
          variant="outline"
          size="lg"
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kitchen Inventory</Text>
      </View>

      <View style={styles.searchRow}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search ingredients…"
        />
      </View>

      {error ? (
        <ErrorBanner
          message={error}
          onDismiss={clearError}
          retryLabel="Retry"
          onRetry={fetchInventory}
        />
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        extraData={sections}
        ListHeaderComponent={listHeader}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} style={styles.sectionHeader} />
        )}
        renderItem={({ item }) => {
          const busy = deletingItemId === item.id || updatingItemId === item.id;
          const meta = [
            item.location,
            formatExpiration(item.expiresOn, item.expired),
          ].filter(Boolean).join(' · ');
          return (
            <View style={[styles.cardWrap, busy && styles.cardWrapBusy]}>
              <InventoryItemCard
                name={item.name}
                meta={meta || undefined}
                category={item.category}
                quantity={item.quantity}
                onIncrement={() => updateQuantity(item.id, 1)}
                onDecrement={() => updateQuantity(item.id, -1)}
                badge={item.expired ? <Text style={styles.expiredBadge}>Expired</Text> : undefined}
                right={
                  <View style={styles.cardActions}>
                    <Pressable
                      style={[styles.cardAction, busy && styles.cardActionDisabled]}
                      onPress={() => setEditItem(item)}
                      disabled={busy}
                      accessibilityRole="button"
                      accessibilityLabel="Edit"
                    >
                      <Text style={styles.cardActionText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.cardAction, styles.cardActionDelete, busy && styles.cardActionDisabled]}
                      onPress={() => handleDelete(item.id, item.name)}
                      disabled={busy}
                      accessibilityRole="button"
                      accessibilityLabel="Delete"
                    >
                      <Text style={styles.cardActionDeleteText}>Delete</Text>
                    </Pressable>
                  </View>
                }
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            message={
              searchQuery.trim()
                ? 'No ingredients match your search.'
                : filterChip !== 'all'
                  ? `No ingredients match "${filterChip === 'expiring_soon' ? 'Expiring Soon' : 'Low Stock'}".`
                  : 'No ingredients yet. Tap Add Ingredient to get started.'
            }
            actionLabel={!searchQuery.trim() && filterChip === 'all' ? 'Add ingredient' : undefined}
            onAction={!searchQuery.trim() && filterChip === 'all' ? () => setAddModalVisible(true) : undefined}
          />
        }
        contentContainerStyle={sections.length === 0 ? styles.emptyList : styles.listContent}
      />

      <AddInventoryModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={handleAddSubmit}
      />
      <EditInventoryModal
        visible={editItem !== null}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleEditSave}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: screenPaddingHorizontal,
    paddingTop: spacing[5],
    paddingBottom: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...textStyles.title,
    color: colors.text,
  },
  searchRow: {
    paddingHorizontal: screenPaddingHorizontal,
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  listHeader: {
    paddingHorizontal: screenPaddingHorizontal,
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    backgroundColor: colors.background,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  tipCard: {
    marginBottom: spacing[4],
  },
  tipCardInner: {
    backgroundColor: colors.infoBackground,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  tipText: {
    ...textStyles.bodySmall,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  buttonsRow: {
    flexDirection: 'column',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  sectionHeader: {
    marginTop: spacing[2],
  },
  cardWrap: {
    marginBottom: spacing[2],
  },
  cardWrapBusy: {
    opacity: 0.8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  cardAction: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  cardActionDisabled: {
    opacity: 0.5,
  },
  cardActionText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.accentBlue,
  },
  cardActionDelete: {},
  cardActionDeleteText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.error,
  },
  expiredBadge: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.error,
  },
  listContent: {
    paddingHorizontal: screenPaddingHorizontal,
    paddingBottom: spacing[8],
  },
  emptyList: {
    flexGrow: 1,
    paddingBottom: spacing[8],
  },
});

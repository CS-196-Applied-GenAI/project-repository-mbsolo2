import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  CardContainer,
  ErrorState,
  LoadingState,
  ScreenContainer,
  SectionHeader,
  TagChip,
} from '../components';
import { ROUTES } from '../navigation/BottomTabs';
import { profileService } from '../services/profileService';
import { cookbookStore } from '../store/cookbookStore';
import {
  DIETARY_RESTRICTION_IDS,
  DIETARY_RESTRICTION_LABELS,
  preferencesStore,
} from '../store/preferencesStore';
import { accentOrder, colors, fontSizes, fontWeights, spacing, textStyles } from '../theme';
import type { CookbookFilter } from '../store/cookbookStore';

function StatRow({
  label,
  value,
  accentColor,
  onPress,
}: {
  label: string;
  value: number;
  accentColor?: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accentColor ? { color: accentColor } : null]}>{value}</Text>
    </>
  );
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.statRow, pressed && styles.statRowPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={styles.statRow}>{content}</View>;
}

function SettingsRow({ label }: { label: string }) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const [displayName, setDisplayName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const favoritesCount = cookbookStore((s) => s.favorites.length);
  const cookedCount = cookbookStore((s) => s.cookedRecipeIds.length);
  const myRecipesCount = cookbookStore((s) => s.myRecipeIds.length);

  const dietaryRestrictions = preferencesStore((s) => s.dietaryRestrictions);
  const toggleDietary = preferencesStore((s) => s.toggleDietary);
  const loadPreferences = preferencesStore((s) => s.loadFromCache);

  const navigateToCookbook = useCallback(
    (initialFilter: CookbookFilter) => {
      (navigation as { navigate: (name: string, params?: { initialFilter: CookbookFilter }) => void }).navigate(
        ROUTES.Cookbook,
        { initialFilter }
      );
    },
    [navigation]
  );

  const loadProfile = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const summary = await profileService.getProfile();
      if (summary.displayName) {
        setDisplayName(summary.displayName);
      }
    } catch {
      setError('We couldn’t load your profile. Pull to try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const headerTitle = displayName?.trim() || 'Profile';

  if (loading) {
    return (
      <ScreenContainer style={styles.screen}>
        <LoadingState message="Loading profile…" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer style={styles.screen}>
        <ErrorState
          message={error}
          actionLabel="Try again"
          onAction={loadProfile}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder} />
          <Text style={styles.title}>{headerTitle}</Text>
          {displayName ? (
            <Text style={styles.subtitle}>Your cooking stats and settings</Text>
          ) : null}
        </View>

        <SectionHeader title="Your cookbook" />
        <View style={styles.sectionContent}>
          <CardContainer shadow="sm">
            <StatRow
              label="Saved (favorites)"
              value={favoritesCount}
              accentColor={accentOrder[0]}
              onPress={() => navigateToCookbook('favorites')}
            />
            <View style={styles.divider} />
            <StatRow
              label="Cooked"
              value={cookedCount}
              accentColor={accentOrder[2]}
              onPress={() => navigateToCookbook('cooked')}
            />
            <View style={styles.divider} />
            <StatRow
              label="My recipes"
              value={myRecipesCount}
              accentColor={accentOrder[4]}
              onPress={() => navigateToCookbook('my-recipes')}
            />
          </CardContainer>
        </View>

        <SectionHeader title="Preferences" />
        <View style={styles.sectionContent}>
          <CardContainer shadow="none">
            <View style={styles.dietaryRow}>
              {DIETARY_RESTRICTION_IDS.map((id, index) => (
                <TagChip
                  key={id}
                  label={DIETARY_RESTRICTION_LABELS[id]}
                  selected={dietaryRestrictions.includes(id)}
                  selectedAccentColor={accentOrder[index % accentOrder.length]}
                  onPress={() => toggleDietary(id)}
                />
              ))}
            </View>
          </CardContainer>
        </View>

        <SectionHeader title="Settings" />
        <View style={styles.sectionContent}>
          <CardContainer shadow="none">
            <SettingsRow label="Account" />
          </CardContainer>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSubtle,
    marginBottom: spacing[3],
  },
  title: {
    ...textStyles.title,
    color: colors.text,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  sectionContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  statRowPressed: {
    opacity: 0.8,
  },
  statLabel: {
    ...textStyles.body,
    color: colors.text,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  dietaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  settingsLabel: {
    ...textStyles.body,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  bottomPad: {
    height: spacing[4],
  },
});

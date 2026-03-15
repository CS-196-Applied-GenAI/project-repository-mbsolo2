/**
 * Profile service — user profile and preferences.
 * No backend yet. Stub interface for future GET/PATCH profile/preferences API.
 */
import type { ProfileSummary } from '../types/profile';

export type { ProfileSummary } from '../types/profile';

/** Stub: no backend. Return default so callers can rely on the interface. */
export const profileService = {
  /** Stub: returns empty summary. Replace with GET /profile when backend exists. */
  async getProfile(): Promise<ProfileSummary> {
    return {};
  },

  /** Stub: no-op. Replace with PATCH /profile or /preferences when backend exists. */
  async updatePreferences(_preferences: Record<string, unknown>): Promise<void> {
    // no-op
  },
} as const;

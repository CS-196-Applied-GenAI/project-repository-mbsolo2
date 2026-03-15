/**
 * Profile / user types.
 * No backend endpoints yet. Stub types for future GET/PATCH profile or preferences.
 */

/**
 * User profile for UI (Profile screen).
 * All fields optional until backend exists.
 */
export interface UserProfile {
  displayName?: string;
  /** Future: email, avatar URL, etc. */
  preferences?: Record<string, unknown>;
}

/**
 * Response shape for future GET /profile or GET /preferences.
 * Stub; backend spec mentions cuisine_likes, dietary_restrictions, spice_tolerance, etc.
 */
export interface ProfileSummary {
  displayName?: string;
  preferences?: Record<string, unknown>;
}

/** Request body for future PATCH /profile or PATCH /preferences. */
export interface ProfileUpdateRequest {
  displayName?: string;
  preferences?: Record<string, unknown>;
}

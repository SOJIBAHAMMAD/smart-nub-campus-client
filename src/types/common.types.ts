/**
 * Shared base types used across multiple modules.
 * Module-specific types extend these with additional fields.
 */

/** Minimal user reference returned in API responses. */
export interface UserReference {
  id: string;
  name: string;
  image?: string | null;
}

/** User reference with email (most modules include this). */
export interface UserReferenceWithEmail extends UserReference {
  email: string;
}

/** Base category shape shared across resources, discussions, and Q&A. */
export interface CategoryBase {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * File storage configuration for user documents
 *
 * Convex automatically creates storage buckets.
 * This file contains helper functions for working with the user-docs storage.
 */

import { Id } from "./_generated/dataModel";

/**
 * Generate a storage path for a user's document
 */
export function getUserDocPath(userId: string, docName: string): string {
  return `${userId}/${docName}`;
}

/**
 * Document types
 */
export const DocTypes = {
  VALIDATION: "VALIDATION.md",
  VIBE_CODING: "VIBE_CODING.md",
  UX_PLAYBOOK: "UX_PLAYBOOK.md",
} as const;

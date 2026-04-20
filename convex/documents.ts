/**
 * Query functions for retrieving generated documents
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get all documents for a user
 */
export const getUserDocuments = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("userDocuments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return documents;
  },
});

/**
 * Get a specific document by user and type
 */
export const getUserDocumentByType = query({
  args: {
    userId: v.string(),
    docType: v.string(),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("userDocuments")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", args.userId).eq("docType", args.docType)
      )
      .first();

    if (!document) {
      return null;
    }

    // Get the file URL from storage
    const fileUrl = await ctx.storage.getUrl(document.storageId);

    return {
      ...document,
      fileUrl,
    };
  },
});

/**
 * Get download URLs for all user documents
 */
export const getUserDocumentUrls = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("userDocuments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get URLs for all documents
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const fileUrl = await ctx.storage.getUrl(doc.storageId);
        return {
          ...doc,
          fileUrl,
        };
      })
    );

    return documentsWithUrls;
  },
});

/**
 * Check if all documents have been generated for a user
 */
export const checkDocumentsComplete = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("userDocuments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const docTypes = new Set(documents.map((doc) => doc.docType));

    return {
      complete: docTypes.has("VALIDATION") && docTypes.has("VIBE_CODING") && docTypes.has("UX_PLAYBOOK"),
      generated: {
        validation: docTypes.has("VALIDATION"),
        vibeCoding: docTypes.has("VIBE_CODING"),
        uxPlaybook: docTypes.has("UX_PLAYBOOK"),
      },
      count: documents.length,
    };
  },
});

/**
 * Document generation functions using Google Gemini
 * These are Convex actions that call external APIs and save files to storage
 */

import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { fillTemplate, generateWithGemini, Templates } from "./gemini";
import { getUserDocPath, DocTypes } from "./storage";
import { api, internal } from "./_generated/api";

// Answer schema for validation
const answersSchema = v.object({
  q1: v.string(),
  q2: v.string(),
  q3: v.string(),
  q4: v.string(),
  q5: v.string(),
  q6: v.string(),
  q7: v.string(),
});

/**
 * Function 1: Create Validation Document
 * Generates a user interview guide using TEMPLATE_A and SYSTEM_A
 */
export const createValidationDoc = action({
  args: {
    userId: v.string(),
    answers: answersSchema,
  },
  handler: async (ctx, args) => {
    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    try {
      console.log("Starting validation doc generation for user:", args.userId);

      // Fill template with user's answers
      const userPrompt = fillTemplate(Templates.VALIDATION.template, args.answers);
      console.log("Template filled, prompt length:", userPrompt.length);

      // Generate content using Gemini
      console.log("Calling Gemini API...");
      const generatedContent = await generateWithGemini(
        Templates.VALIDATION.system,
        userPrompt,
        apiKey
      );
      console.log("Gemini response received, length:", generatedContent.length);

      // Convert to blob for storage (Convex expects Blob)
      const blob = new Blob([generatedContent], { type: "text/markdown" });
      console.log("Blob created");

      // Upload to storage
      const storageId = await ctx.storage.store(blob);
      console.log("File stored with ID:", storageId);

      // Save metadata to database
      await ctx.runMutation(internal.documentGeneration.saveDocumentMetadata, {
        userId: args.userId,
        docType: "VALIDATION",
        storageId,
        fileName: DocTypes.VALIDATION,
      });
      console.log("Metadata saved");

      return {
        success: true,
        storageId,
        message: "Validation document generated successfully",
      };
    } catch (error: any) {
      console.error("Error generating validation doc:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw new Error(`Failed to generate validation document: ${error.message || error}`);
    }
  },
});

/**
 * Function 2: Create Vibe Coding Prompts
 * Generates coding prompts using TEMPLATE_B and SYSTEM_B
 */
export const createVibeCodingPrompt = action({
  args: {
    userId: v.string(),
    answers: answersSchema,
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    try {
      // Fill template with user's answers
      const userPrompt = fillTemplate(Templates.VIBE_CODING.template, args.answers);

      // Generate content using Gemini
      const generatedContent = await generateWithGemini(
        Templates.VIBE_CODING.system,
        userPrompt,
        apiKey
      );

      // Convert to blob for storage
      const blob = new Blob([generatedContent], { type: "text/markdown" });

      // Upload to storage
      const storageId = await ctx.storage.store(blob);

      // Save metadata to database
      await ctx.runMutation(internal.documentGeneration.saveDocumentMetadata, {
        userId: args.userId,
        docType: "VIBE_CODING",
        storageId,
        fileName: DocTypes.VIBE_CODING,
      });

      return {
        success: true,
        storageId,
        message: "Vibe coding prompts generated successfully",
      };
    } catch (error) {
      console.error("Error generating vibe coding prompts:", error);
      throw new Error(`Failed to generate vibe coding prompts: ${error}`);
    }
  },
});

/**
 * Function 3: Create UX Playbook
 * Generates a UX playbook using TEMPLATE_C and SYSTEM_C
 */
export const createUxPlaybook = action({
  args: {
    userId: v.string(),
    answers: answersSchema,
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    try {
      // Fill template with user's answers
      const userPrompt = fillTemplate(Templates.UX_PLAYBOOK.template, args.answers);

      // Generate content using Gemini
      const generatedContent = await generateWithGemini(
        Templates.UX_PLAYBOOK.system,
        userPrompt,
        apiKey
      );

      // Convert to blob for storage
      const blob = new Blob([generatedContent], { type: "text/markdown" });

      // Upload to storage
      const storageId = await ctx.storage.store(blob);

      // Save metadata to database
      await ctx.runMutation(internal.documentGeneration.saveDocumentMetadata, {
        userId: args.userId,
        docType: "UX_PLAYBOOK",
        storageId,
        fileName: DocTypes.UX_PLAYBOOK,
      });

      return {
        success: true,
        storageId,
        message: "UX playbook generated successfully",
      };
    } catch (error) {
      console.error("Error generating UX playbook:", error);
      throw new Error(`Failed to generate UX playbook: ${error}`);
    }
  },
});

/**
 * Generate all three documents at once
 * This is useful for the loading screen after form submission
 */
export const generateAllDocuments = action({
  args: {
    userId: v.string(),
    answers: answersSchema,
  },
  handler: async (ctx, args) => {
    try {
      // Generate all three documents in parallel
      const [validationResult, vibeCodingResult, uxPlaybookResult] = await Promise.all([
        ctx.runAction(api.documentGeneration.createValidationDoc, {
          userId: args.userId,
          answers: args.answers,
        }),
        ctx.runAction(api.documentGeneration.createVibeCodingPrompt, {
          userId: args.userId,
          answers: args.answers,
        }),
        ctx.runAction(api.documentGeneration.createUxPlaybook, {
          userId: args.userId,
          answers: args.answers,
        }),
      ]);

      return {
        success: true,
        results: {
          validation: validationResult,
          vibeCoding: vibeCodingResult,
          uxPlaybook: uxPlaybookResult,
        },
        message: "All documents generated successfully",
      };
    } catch (error) {
      console.error("Error generating documents:", error);
      throw new Error(`Failed to generate documents: ${error}`);
    }
  },
});

/**
 * Internal mutation to save document metadata
 * This is called by the actions above
 */
export const saveDocumentMetadata = internalMutation({
  args: {
    userId: v.string(),
    docType: v.string(),
    storageId: v.string(),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("userDocuments", {
      userId: args.userId,
      docType: args.docType,
      storageId: args.storageId,
      fileName: args.fileName,
      createdAt: Date.now(),
    });
  },
});

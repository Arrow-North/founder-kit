import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Shared product summary, generated first and passed into every phase
export const summaryValidator = v.object({
  productName: v.string(),
  pitch: v.string(),
  targetUser: v.string(),
  problem: v.string(),
  currentWorkaround: v.string(),
  coreOutcome: v.string(),
  riskiestAssumption: v.string(),
});

export const stepValidator = v.object({
  title: v.string(),
  goal: v.string(),
  todo: v.array(v.string()),
  prompt: v.string(),
  pasteInto: v.string(),
  tip: v.optional(v.string()),
});

export const phaseValidator = v.object({
  intro: v.string(),
  steps: v.array(stepValidator),
});

export const phasesValidator = v.object({
  validate: phaseValidator,
  design: phaseValidator,
  build: phaseValidator,
});

export const emailStatusValidator = v.union(
  v.literal("sent"),
  v.literal("skipped"),
  v.literal("failed")
);

export default defineSchema({
  submissions: defineTable({
    // User information
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),

    // Question answers
    answers: v.object({
      q1: v.string(), // What's your idea?
      q2: v.string(), // Who specifically has this problem?
      q3: v.string(), // What's the pain point?
      q4: v.string(), // What's their current workaround?
      q5: v.string(), // What does your solution do?
      q6: v.string(), // What changes for them?
      q7: v.string(), // What are you most unsure about?
    }),

    // Private kit link ID (older rows have none)
    kitId: v.optional(v.string()),

    // Metadata
    submittedAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_submission_time", ["submittedAt"]),

  kits: defineTable({
    // Random, unguessable ID used in the kit link
    kitId: v.string(),
    submissionId: v.id("submissions"),
    status: v.union(v.literal("pending"), v.literal("ready"), v.literal("failed")),
    summary: v.optional(summaryValidator),
    phases: v.optional(phasesValidator),
    error: v.optional(v.string()),
    // Issues sanitized after one regeneration
    warnings: v.optional(v.array(v.string())),
    // Kit-ready email outcome; a failed email never fails the kit
    emailStatus: v.optional(emailStatusValidator),
    emailError: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_kitId", ["kitId"]),

  // Legacy: files from the old document flow, kept for existing data
  userDocuments: defineTable({
    // User identifier (could be submission ID or email)
    userId: v.string(),

    // Document type (VALIDATION, VIBE_CODING, UX_PLAYBOOK)
    docType: v.string(),

    // Convex storage ID where the file is stored
    storageId: v.string(),

    // File name
    fileName: v.string(),

    // Metadata
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "docType"]),
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

    // Metadata
    submittedAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_submission_time", ["submittedAt"]),

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

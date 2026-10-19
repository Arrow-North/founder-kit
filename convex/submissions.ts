import { Infer, v } from "convex/values";
import { MutationCtx, query } from "./_generated/server";

export const answersValidator = v.object({
  q1: v.string(),
  q2: v.string(),
  q3: v.string(),
  q4: v.string(),
  q5: v.string(),
  q6: v.string(),
  q7: v.string(),
});

export const submissionArgs = {
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  answers: answersValidator,
};

// Helper to create a new submission, called inside the kits.createKit mutation
export async function insertSubmission(
  ctx: MutationCtx,
  args: {
    firstName: string;
    lastName: string;
    email: string;
    answers: Infer<typeof answersValidator>;
    kitId: string;
  }
) {
  return await ctx.db.insert("submissions", {
    firstName: args.firstName,
    lastName: args.lastName,
    email: args.email,
    answers: args.answers,
    kitId: args.kitId,
    submittedAt: Date.now(),
  });
}

// Query to get all submissions (for admin purposes)
export const getAllSubmissions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("submissions")
      .order("desc")
      .collect();
  },
});

// Query to get submissions by email
export const getSubmissionsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
  },
});

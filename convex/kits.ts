/**
 * Founder Kit orchestration: one public action starts a kit, generation runs
 * in a scheduled internal action, and the kit page reads it by kitId.
 */

import { v } from "convex/values";
import { action, internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { phasesValidator, summaryValidator } from "./schema";
import { answersValidator, insertSubmission, submissionArgs } from "./submissions";
import { generatePhase, generateSummary, PHASE_KEYS } from "./gemini";

const KIT_ID_LENGTH = 22;
const KIT_ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// 22 characters from 62 (~131 bits). Rejection sampling keeps every character equally likely.
function generateKitId(): string {
  const limit = 256 - (256 % KIT_ID_ALPHABET.length);
  let id = "";
  while (id.length < KIT_ID_LENGTH) {
    for (const byte of crypto.getRandomValues(new Uint8Array(32))) {
      if (byte < limit && id.length < KIT_ID_LENGTH) {
        id += KIT_ID_ALPHABET[byte % KIT_ID_ALPHABET.length];
      }
    }
  }
  return id;
}

/**
 * Single entry point for the browser: saves the submission, creates a pending
 * kit, schedules generation, and returns the kitId straight away.
 */
export const startKit = action({
  args: submissionArgs,
  handler: async (ctx, args): Promise<{ kitId: string }> => {
    const kitId = generateKitId();
    await ctx.runMutation(internal.kits.createKit, { ...args, kitId });
    return { kitId };
  },
});

export const createKit = internalMutation({
  args: { ...submissionArgs, kitId: v.string() },
  handler: async (ctx, args) => {
    const submissionId = await insertSubmission(ctx, args);
    await ctx.db.insert("kits", {
      kitId: args.kitId,
      submissionId,
      status: "pending",
      createdAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.kits.generateKit, {
      kitId: args.kitId,
      answers: args.answers,
    });
    return null;
  },
});

/**
 * 4 Gemini calls: the summary first, then Validate, Design and Build in parallel
 */
export const generateKit = internalAction({
  args: { kitId: v.string(), answers: answersValidator },
  handler: async (ctx, args) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
      }

      const summary = await generateSummary(args.answers, apiKey);
      const [validate, design, build] = await Promise.all(
        PHASE_KEYS.map((key) => generatePhase(key, summary.value, args.answers, apiKey))
      );
      const warnings = [
        ...summary.warnings,
        ...validate.warnings,
        ...design.warnings,
        ...build.warnings,
      ];

      await ctx.runMutation(internal.kits.saveKitResult, {
        kitId: args.kitId,
        summary: summary.value,
        phases: { validate: validate.value, design: design.value, build: build.value },
        ...(warnings.length > 0 ? { warnings } : {}),
      });
      console.log(`✓ Kit ${args.kitId} ready${warnings.length ? ` with ${warnings.length} warning(s)` : ""}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`✗ Kit ${args.kitId} failed:`, message);
      await ctx.runMutation(internal.kits.markKitFailed, { kitId: args.kitId, error: message });
    }
    return null;
  },
});

export const saveKitResult = internalMutation({
  args: {
    kitId: v.string(),
    summary: summaryValidator,
    phases: phasesValidator,
    warnings: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const kit = await ctx.db
      .query("kits")
      .withIndex("by_kitId", (q) => q.eq("kitId", args.kitId))
      .unique();
    if (!kit) throw new Error(`Kit ${args.kitId} not found`);
    await ctx.db.patch(kit._id, {
      status: "ready",
      summary: args.summary,
      phases: args.phases,
      warnings: args.warnings,
    });
    return null;
  },
});

export const markKitFailed = internalMutation({
  args: { kitId: v.string(), error: v.string() },
  handler: async (ctx, args) => {
    const kit = await ctx.db
      .query("kits")
      .withIndex("by_kitId", (q) => q.eq("kitId", args.kitId))
      .unique();
    if (!kit) throw new Error(`Kit ${args.kitId} not found`);
    await ctx.db.patch(kit._id, { status: "failed", error: args.error });
    return null;
  },
});

/**
 * Public read for the kit page and loading-screen polling. Returns no email.
 */
export const getKit = query({
  args: { kitId: v.string() },
  handler: async (ctx, args) => {
    const kit = await ctx.db
      .query("kits")
      .withIndex("by_kitId", (q) => q.eq("kitId", args.kitId))
      .unique();
    if (!kit) return null;
    const submission = await ctx.db.get(kit.submissionId);
    return {
      kitId: kit.kitId,
      status: kit.status,
      firstName: submission?.firstName ?? "",
      summary: kit.summary ?? null,
      phases: kit.phases ?? null,
      error: kit.error ?? null,
      warnings: kit.warnings ?? [],
      createdAt: kit.createdAt,
    };
  },
});

/**
 * Google Gemini API integration for document generation
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Templates content (embedded to avoid file system reads in serverless)
const TEMPLATE_A = `Idea: <q1>
Target user: <q2>
Pain point: <q3>
Current workaround: <q4>
Solution: <q5>
Desired outcome: <q6>
Biggest uncertainty: <q7>

Generate a validation document with exactly this structure:

RESEARCH OBJECTIVE
One to two sentences. What we're trying to learn before anything else.

USER RECRUITMENT
One to two sentences. Specific role and situation from q2. Include an opening line the founder uses to frame the conversation.

SECTION 1: PAIN PROBE
Primary question about q3. One follow-up probe labeled "(If they go surface-level: ...)"

SECTION 2: WORKAROUND PROBE
Primary question about q4. One follow-up probe labeled "(If they go surface-level: ...)"

SECTION 3: SOLUTION FIT
Primary question derived from q5 and q6 together. One follow-up probe labeled "(If they go surface-level: ...)"

SECTION 4: ASSUMPTION TEST
Primary question built specifically around q7. One follow-up probe labeled "(If they go surface-level: ...)"

CLOSING
One open question that lets the user surface anything we haven't asked about.`;

const SYSTEM_A = `You are a UX researcher writing a user interview guide for a startup founder preparing to talk to potential customers for the first time.

Your job is to write a focused, practical interview document they can pick up and use immediately — no research background required.

Rules:
- Write only the document. No preamble, no explanation, no commentary.
- Use plain conversational language. No jargon.
- Every question should feel like natural conversation, not a survey.
- No yes/no questions anywhere in the document.
- Each section gets one primary question and one follow-up probe in parentheses, labeled "If they go surface-level."
- Section 4 must be built specifically around the founder's stated uncertainty — not generic competitive questions.
- Format with clear section headers exactly as specified.`;

const TEMPLATE_B = `Idea: <q1>
Target user: <q2>
Pain point: <q3>
Current workaround: <q4>
Solution: <q5>
Desired outcome: <q6>
Biggest uncertainty: <q7>

Generate the following three parts:

---
JUMP-START PROMPT
(Label: "Paste this into Bolt, v0, or Replit to get started")

A single self-contained prompt the founder pastes into their coding tool. Must include:
- Full product context inline
- Specific interface type decision (derived from product, not defaulted)
- Instruction to use realistic domain-specific data — real names, real units, real values for this industry. No placeholders.
- Specific description of which screen to build: the one that gets a real reaction from the user in q2, organized around q7
- Build as single React component with Tailwind CSS, one file, demo-ready today

---
PATH A — DESIGN REFINEMENT
(Label: "If you want to refine how it looks first")

Three prompts each starting with "Using what you just built":
1. Strengthen visual hierarchy — most important info most prominent
2. Improve data clarity — numbers and comparisons instantly readable
3. Add one micro-interaction — hover state, indicator, or tooltip that makes it feel like a real product

---
PATH B — DEEPER BUILD
(Label: "If you want to build out the full product")

Four sequential prompts each starting with "Using the context above and what was built so far":
1. First action — the interaction that starts the core workflow, plus what the screen looks like immediately after
2. Core functionality — the full result from q5 with realistic data throughout
3. Outcome state — destination view from q6, able to stand alone as a demo
4. Second validation screen — tests a different aspect from the jump-start; ends with the one question to ask a real user when showing it`;

const SYSTEM_B = `You are a technical product strategist writing a prompt package for a non-technical founder to use with AI coding tools like Bolt, v0, or Replit.

The package has three parts:
1. A jump-start prompt — one paste that produces a working demo-ready screen
2. A design refinement path — for polishing what the jump-start built
3. A deeper build path — for founders who want to build out the full product flow

Rules:
- Write only the three parts. No preamble, no explanation, no commentary.
- The jump-start prompt must produce a complete, realistic screen on the first paste. Realistic domain-specific data only — no "Lorem ipsum" or "Sample data."
- Before writing the jump-start, determine what type of interface this product actually is. Let that decision shape the prompt. Do not default to "dashboard with sidebar" unless the product genuinely requires it.
- The jump-start prompt must be self-contained — the founder pastes it with no setup or modification. Full context is included inline.
- The jump-start screen must directly address the uncertainty in q7. A real user should be able to look at it and say yes or no.
- Path A and Path B prompts each start with "Using what you just built" so the founder understands they build on the jump-start output.
- Keep all language non-technical.`;

const TEMPLATE_C = `Idea: <q1>
Target user: <q2>
Pain point: <q3>
Current workaround: <q4>
Solution: <q5>
Desired outcome: <q6>
Biggest uncertainty: <q7>

Generate a UX playbook with exactly this structure:

PRODUCT
Two to three sentences. What it is, who it's for, what it does.

USER
Two to three sentences. Specific role and situation from q2. Not demographics.

BEFORE STATE
Two to three sentences. Real person's experience using q3 and q4 together.

AFTER STATE
Two to three sentences. What changes from q6. What they can do now that they couldn't before.

CORE FLOW
4 to 6 numbered steps. One sentence each. Start each with a verb.

WHAT TO DESIGN FIRST
Two to three sentences. Where to concentrate effort to test q7 specifically.

OPEN QUESTIONS
3 to 4 unresolved questions the brief exposes — things the founder needs to answer before their next stage of work.`;

const SYSTEM_C = `You are a UX designer writing a product brief for a founder who is about to design or build their product for the first time.

Rules:
- Write only the document. No preamble, no explanation, no commentary.
- Plain language. No UX jargon.
- Before state and after state must feel like a real person's day — specific, not abstract.
- Core flow: 4 to 6 steps, one sentence each, start each with a verb.
- "What to design first" must come from q7 specifically.
- Open questions surface real unresolved issues from the brief — not generic product questions.`;

/**
 * Replace placeholders in template with actual answers
 */
export function fillTemplate(template: string, answers: Record<string, string>): string {
  let filled = template;
  for (let i = 1; i <= 7; i++) {
    const placeholder = `<q${i}>`;
    const answer = answers[`q${i}`] || "";
    filled = filled.replace(new RegExp(placeholder, "g"), answer);
  }
  return filled;
}

/**
 * Call Google Gemini API to generate content with retry logic
 */
export async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);

  // Try primary model with retries
  const primaryModel = "gemini-2.5-flash";
  const fallbackModel = "gemini-2.5-flash-lite";
  const maxRetries = 2;

  // Try primary model first
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries + 1} with model: ${primaryModel}`);

      const model = genAI.getGenerativeModel({
        model: primaryModel,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userPrompt);
      const response = result.response;
      const text = response.text();

      console.log(`✓ Success with ${primaryModel} on attempt ${attempt + 1}`);
      return text;
    } catch (error: any) {
      console.log(`✗ Attempt ${attempt + 1} failed with ${primaryModel}:`, error.message);

      // If it's the last retry, move to fallback
      if (attempt === maxRetries) {
        console.log(`Switching to fallback model: ${fallbackModel}`);
        break;
      }

      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // Try fallback model
  try {
    console.log(`Trying fallback model: ${fallbackModel}`);

    const model = genAI.getGenerativeModel({
      model: fallbackModel,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const text = response.text();

    console.log(`✓ Success with fallback model: ${fallbackModel}`);
    return text;
  } catch (error: any) {
    console.error(`✗ Fallback model ${fallbackModel} also failed:`, error.message);
    throw new Error(`All models failed. Last error: ${error.message}`);
  }
}

/**
 * Template definitions
 */
export const Templates = {
  VALIDATION: {
    template: TEMPLATE_A,
    system: SYSTEM_A,
  },
  VIBE_CODING: {
    template: TEMPLATE_B,
    system: SYSTEM_B,
  },
  UX_PLAYBOOK: {
    template: TEMPLATE_C,
    system: SYSTEM_C,
  },
} as const;

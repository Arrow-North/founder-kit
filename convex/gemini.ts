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

Generate a user interview guide with exactly this structure:

RESEARCH OBJECTIVE
One sentence. Built around q7 — what this research needs to answer, not what the product does.

USER RECRUITMENT
Who to recruit (role and situation from q2). One to two sentence opening the interviewer can use verbatim.

SECTION 1 — PAIN PROBE
One question testing whether the pain in q3 is real and frequent. (If they go surface-level: one follow-up probe)

SECTION 2 — WORKAROUND PROBE
One question surfacing how entrenched q4 is and where it breaks down. (If they go surface-level: one follow-up probe)

SECTION 3 — SOLUTION FIT
One question testing whether the outcome in q6 is what the user actually wants. (If they go surface-level: one follow-up probe)

SECTION 4 — ASSUMPTION TEST
One question aimed directly at q7. Specific to what they said — not generic. (If they go surface-level: one follow-up probe)

CLOSING
One standard closing question.`;

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
- Specific interface type decision derived from the product — not defaulted
- Instruction to use realistic domain-specific data — real names, real units, 
  real values for this industry. No placeholders.
- Specific description of which screen to build: the one that gets a real 
  reaction from the user in q2, organized around q7
- Build as single React component with Tailwind CSS, one file, demo-ready today

---
PATH A — DESIGN REFINEMENT
(Label: "If you want to refine how it looks first")

Three prompts each starting with "Using what you just built":
1. Strengthen visual hierarchy — most important info most prominent
2. Improve data clarity — numbers and comparisons instantly readable
3. Add one micro-interaction — hover state, indicator, or tooltip that makes 
   it feel like a real product

---
PATH B — DEEPER BUILD
(Label: "If you want to build out the full product")

Four sequential prompts each starting with "Using the context above and what 
was built so far":
1. First action — the interaction that starts the core workflow, plus what the 
   screen looks like immediately after
2. Core functionality — the full result from q5 with realistic data throughout
3. Outcome state — destination view from q6, able to stand alone as a demo
4. Second validation screen — tests a different aspect from the jump-start; 
   ends with the one question to ask a real user when showing it
`;

const SYSTEM_B = `### Structure
Three parts delivered together. Founder chooses direction after the jump-start.

1. **Jump-Start Prompt** — one paste → working demo-ready screen
2. **Path A: Design Refinement** — polish what the jump-start built
3. **Path B: Deeper Build** — build out the full product flow

### System Prompt

You are a technical product strategist writing a prompt package for a 
non-technical founder to use with AI coding tools like Bolt, v0, or Replit.

The package has three parts:
1. A jump-start prompt — one paste that produces a working demo-ready screen
2. A design refinement path — for polishing what the jump-start built
3. A deeper build path — for founders who want to build out the full product flow

Rules:
- Write only the three parts. No preamble, no explanation, no commentary.
- The jump-start prompt must produce a complete, realistic screen on the first 
  paste. Realistic domain-specific data only — no "Lorem ipsum" or "Sample data."
- Before writing the jump-start, determine what type of interface this product 
  actually is. Let that decision shape the prompt. Do not default to "dashboard 
  with sidebar" unless the product genuinely requires it.
- The jump-start prompt must be self-contained — the founder pastes it with no 
  setup or modification. Full context is included inline.
- The jump-start screen must directly address the uncertainty in q7. A real user 
  should be able to look at it and say yes or no.
- Path A and Path B prompts each start with "Using what you just built" so the 
  founder understands they build on the jump-start output.
- Keep all language non-technical.`;

const TEMPLATE_C = `Idea: <q1>
Target user: <q2>
Pain point: <q3>
Current workaround: <q4>
Solution: <q5>
Desired outcome: <q6>
Biggest uncertainty: <q7>

Generate a UX playbook with exactly this structure:

---
PHASE 1 — YOUR PRODUCT BRIEF
---

PRODUCT
Two to three sentences. What it is, who it's for, what it does.

USER
Two to three sentences. Specific role and situation from q2. Not demographics.

BEFORE STATE
Two to three sentences. Real person's experience using q3 and q4 together.

AFTER STATE
Two to three sentences. What changes from q6. What they can do now that they 
couldn't before.

CORE FLOW
4 to 6 steps. Each step uses exactly this 4-line format:

[Step number]. [Step name]
Action: [what the user does — one sentence starting with a verb]
Feeling: [the emotion the user likely has at this moment — one sentence]
Risk: [what breaks down here if the design gets it wrong — one sentence]
Status: [Exists / Needs building / Undefined]

WHAT TO DESIGN FIRST
Two to three sentences. Where to concentrate effort to test q7 specifically.

OPEN QUESTIONS
3 to 4 unresolved questions the brief exposes — things the founder needs to 
answer before their next stage of work.

---
PHASE 2 — CREATE YOUR UX JOURNEY
---

[One sentence intro: "Use these prompts to turn your core flow into a visual 
UX journey map. Paste each one into Claude or ChatGPT in order."]

JOURNEY PROMPT 1 — MAP THE FULL EXPERIENCE
[A self-contained prompt that takes the full core flow above and asks Claude 
to generate a complete UX journey map — each step with what the user sees, 
thinks, feels, and does. Framed as a journey from the user's first touchpoint 
to the final outcome. Instructs Claude to present it as a structured table or 
stage-by-stage breakdown the founder can read top to bottom.]

JOURNEY PROMPT 2 — FIND THE FRICTION
[A self-contained prompt that takes the journey map output and asks Claude to 
identify the 2 to 3 moments of highest friction — where the user is most 
likely to drop off, get confused, or lose trust. For each friction point: 
what causes it, what the user experiences, and one design intervention that 
would resolve it.]

JOURNEY PROMPT 3 — VISUALIZE AS A DIAGRAM
[A self-contained prompt that asks Claude to render the UX journey as a 
text-based flow diagram — stages across the top, user actions and emotions 
below each stage, friction points highlighted. Tell the founder this is their 
UX journey map they can use to make design decisions, share with a designer 
or developer, and return to as they build.]
`;

const SYSTEM_C = `### Structure
Two phases delivered together. A founder may work through only Phase 1 or continue into Phase 2.

- **Phase 1** — The playbook: user definition, before/after states, enhanced core flow, what to design first, open questions
- **Phase 2** — UX Journey Prompt Set: 3 prompts the founder pastes into Claude to generate a visual UX journey map of the full experience

### System Prompt
You are a UX designer writing a two-phase product brief for a founder who is 
about to design or build their product for the first time.

Rules:
- Write only the document. No preamble, no explanation, no commentary.
- Plain language. No UX jargon — write as if the reader has never worked 
  with a designer before.
- Before state and after state must feel like a real person's day — specific, 
  not abstract.
- Core flow: 4 to 6 steps. Each step has exactly 4 lines in this order:
    Action: one sentence starting with a verb — what the user does
    Feeling: the emotion the user likely has at this moment — one sentence
    Risk: what breaks down here if the design gets it wrong — one sentence
    Status: one of three values only — Exists / Needs building / Undefined
- "What to design first" must come from q7 specifically.
- Open questions surface real unresolved issues — not generic product questions.
- Phase 2 must contain exactly 3 journey prompts. Each prompt must be 
  self-contained, explicitly framed as a UX journey map, and written so the 
  founder can paste it directly into Claude or ChatGPT with no modification.
  The prompts should together produce a complete picture of the experience 
  from start to finish that the founder can use to make design decisions.
- Format Phase 1 and Phase 2 with clear headers so a founder can work through 
  one without needing the other.`;

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

  // Use gemini-2.5-flash-lite with 5 retries (6 total attempts)
  const modelName = "gemini-2.5-flash-lite";
  const maxRetries = 5;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries + 1} with model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userPrompt);
      const response = result.response;
      const text = response.text();

      console.log(`✓ Success with ${modelName} on attempt ${attempt + 1}`);
      return text;
    } catch (error: any) {
      console.log(`✗ Attempt ${attempt + 1} failed with ${modelName}:`, error.message);

      // If it's the last retry, throw error
      if (attempt === maxRetries) {
        console.error(`✗ All ${maxRetries + 1} attempts failed with ${modelName}`);
        throw new Error(`Failed after ${maxRetries + 1} attempts. Last error: ${error.message}`);
      }

      // Wait before retrying (exponential backoff: 1s, 2s, 4s, 8s, 16s)
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("Unexpected error in generateWithGemini");
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

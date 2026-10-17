/**
 * Google Gemini API integration for Founder Kit generation (JSON mode).
 * Prompt text is copied word for word from PROMPTS-v1.md.
 */

import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";
import type { Infer } from "convex/values";
import { phaseValidator, summaryValidator } from "./schema";

const MODEL_NAME = "gemini-2.5-flash-lite";
const MAX_API_ATTEMPTS = 3;

export type Answers = {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
};
export type Summary = Infer<typeof summaryValidator>;
export type Phase = Infer<typeof phaseValidator>;
export type PhaseKey = "validate" | "design" | "build";
export const PHASE_KEYS: PhaseKey[] = ["validate", "design", "build"];

const SHARED_RULES = `Writing rules. Follow all of them.
- Write for a first-time, non-technical founder. Plain words, short sentences, speak to them as "you".
- Use the founder's own specifics. Name the product, the user and the problem inside every prompt you write.
- Every prompt must stand alone. The founder pastes it into a fresh chat with no other context, so include everything the AI tool needs to know about the product.
- Every prompt must be complete and ready to paste. Never use square brackets, curly braces, angle brackets, blanks, or fill-in-the-blank text.
- Never include code, code blocks, backticks, file names, or technical markup.
- Never mention dates, years, or prices of tools.
- If an answer is thin or missing, make a sensible assumption from the other answers and say so inside the prompt, for example "Assume the main user is a solo bookkeeper." Never switch to a different product or invent a new idea.
- Each todo list has at most 3 lines. Each line starts with a verb and stays under 15 words.
- Each goal is one sentence.`;

const withRules = (system: string) => `${system}\n\n${SHARED_RULES}`;

const SUMMARY_SYSTEM = withRules(`You turn a founder's rough answers into a short product summary. Every later document relies on it, so it must stay faithful to the founder's idea.

Return:
- productName: the name the founder used. If there is none, a plain 1 to 3 word working name that says what it does. No puns, no invented brand words.
- pitch: one sentence under 20 words in the form "X helps Y do Z without W."
- targetUser: one specific kind of person, with their role and situation.
- problem: the pain in one or two sentences, in the user's terms.
- currentWorkaround: what they do today instead.
- coreOutcome: the single result the user gets from the product.
- riskiestAssumption: the one belief that, if wrong, sinks the idea. Draw it from answer 7 when possible.`);

const VALIDATE_SYSTEM = withRules(`You are a customer-research coach. You help a first-time founder learn, within one week and before building anything, whether the problem is real. Produce exactly 4 steps in this order. Each step has a goal, a todo list, a ready-to-paste prompt for ChatGPT or Claude, and an optional one-line tip.

Phase intro: one or two sentences on what this phase gets them: proof from real people before spending time or money.

Step 1, Recruit 5 people. The prompt asks the AI to list 10 specific places where this target user can be found (communities, groups, job sites, events) and to write a short, friendly outreach message asking for a 20-minute chat about the problem. The message must not pitch the product.

Step 2, Interview script. The prompt asks the AI to write a 20-minute interview script about the person's past behaviour: the last time the problem happened, what they did, what the workaround costs them, and what they have already tried. It must include follow-up probes, at least two questions that test the riskiest assumption, and a closing ask for referrals. It must not ask whether they would use or pay for the product.

Step 3, Make sense of the notes. The prompt is used after the interviews. It gives the AI the product context, then tells the founder to paste their interview notes below it. It asks for: the pains that repeated, the workarounds people actually use, evidence for and against the riskiest assumption, and the strongest direct quotes.

Step 4, Go, adjust or stop. The prompt asks the AI to make a call using these rules. Go: 3 or more of the 5 described the pain without prompting and already use a workaround. Adjust: the pain is real but belongs to a different user or a different problem. Stop: fewer than 2 described the pain. It asks for a one-paragraph decision and the single next action.`);

const DESIGN_SYSTEM = withRules(`You are a product designer. You help a non-technical founder turn a validated idea into a clear plan for a small first version before anything is built. Produce exactly 4 steps in this order. Each step has a goal, a todo list, a ready-to-paste prompt for ChatGPT or Claude, and an optional one-line tip.

Phase intro: one or two sentences on what this phase gets them: a first version small enough to build in days, aimed at the biggest pain.

Step 1, One-page brief. The prompt asks the AI to write a one-page brief: who it is for, the problem, the outcome, what is in the first version (at most 3 features), what is deliberately left out, and how the founder will know it works.

Step 2, Journey map. The prompt asks the AI to map the user's journey step by step, first as it happens today with the workaround, then as it would happen with the product, marking where time, money or patience is lost.

Step 3, Find the friction. The prompt asks the AI to review that journey, name the 3 moments where users are most likely to get stuck, confused or give up, and recommend the smallest product that removes the biggest one. Everything else gets cut from the first version.

Step 4, Key screens. The prompt asks the AI to describe 3 to 5 screens in plain words: each screen's name, its purpose, what is on it, and the one main action. The founder carries this screen list into the Build phase.`);

const BUILD_SYSTEM = withRules(`You are a senior product builder coaching a non-technical founder who uses an AI app builder such as Bolt, Lovable, v0 or Replit. The goal is a clickable first version they can put in front of the 5 people from their interviews. Produce exactly 5 steps in this order. The founder pastes each prompt into the same app-builder project, one at a time. Each step has a goal, a todo list, a ready-to-paste prompt, and an optional one-line tip.

Describe screens and behaviour in plain words only. Never name programming languages, frameworks or databases. Keep the first version to 3 to 5 screens and the scope of the one-page brief.

Phase intro: one or two sentences on what this phase gets them: a working version people can click through, built one piece at a time.

Step 1, Jump-start. The prompt creates the project: what the app is, who it is for, the 3 to 5 screens by name and purpose, a simple clean look, and realistic sample data that fits this user. No logins or payments yet.

Step 2, Core flow. The prompt makes the main task work from start to finish: the one thing the user came to do, with sample data that stays saved between visits.

Step 3, Outcome screen. The prompt builds the screen that shows the core outcome. The user should understand their result within five seconds.

Step 4, Polish. The prompt adds empty states, loading states, plain-language error messages, a layout that works on a phone, and clearer button labels.

Step 5, Ready to test. The prompt adds a short welcome that explains the app, a simple feedback form, and a final check of the main flow. The todo covers sharing the link with the 5 interviewees and watching them use it without helping.`);

const CHAT_TOOL = "ChatGPT or Claude";
const APP_BUILDER = "Your app-builder project (Bolt, Lovable, v0 or Replit)";

const PHASES: Record<PhaseKey, { system: string; titles: string[]; pasteInto: string }> = {
  validate: {
    system: VALIDATE_SYSTEM,
    titles: ["Recruit 5 people", "Interview script", "Make sense of the notes", "Go / adjust / stop"],
    pasteInto: CHAT_TOOL,
  },
  design: {
    system: DESIGN_SYSTEM,
    titles: ["One-page brief", "Journey map", "Find the friction", "Key screens"],
    pasteInto: CHAT_TOOL,
  },
  build: {
    system: BUILD_SYSTEM,
    titles: ["Jump-start", "Core flow", "Outcome screen", "Polish", "Ready to test"],
    pasteInto: APP_BUILDER,
  },
};

const NO_ANSWER = "(no answer given)";
const answerOrNone = (value: string) => (value.trim() === "" ? NO_ANSWER : value.trim());

function buildAnswersBlock(a: Answers): string {
  return [
    "FOUNDER'S ANSWERS",
    `1. The idea: ${answerOrNone(a.q1)}`,
    `2. Who has the problem: ${answerOrNone(a.q2)}`,
    `3. The pain point: ${answerOrNone(a.q3)}`,
    `4. Their current workaround: ${answerOrNone(a.q4)}`,
    `5. What the solution does: ${answerOrNone(a.q5)}`,
    `6. What changes for them: ${answerOrNone(a.q6)}`,
    `7. What the founder is most unsure about: ${answerOrNone(a.q7)}`,
  ].join("\n");
}

function buildSummaryBlock(s: Summary): string {
  return [
    "PRODUCT SUMMARY",
    `Name: ${s.productName}`,
    `Pitch: ${s.pitch}`,
    `Target user: ${s.targetUser}`,
    `Problem: ${s.problem}`,
    `Current workaround: ${s.currentWorkaround}`,
    `Core outcome: ${s.coreOutcome}`,
    `Riskiest assumption: ${s.riskiestAssumption}`,
  ].join("\n");
}

const SUMMARY_FIELDS = [
  "productName",
  "pitch",
  "targetUser",
  "problem",
  "currentWorkaround",
  "coreOutcome",
  "riskiestAssumption",
] as const;

const stringSchema = { type: SchemaType.STRING } as const;

const summarySchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: Object.fromEntries(SUMMARY_FIELDS.map((field) => [field, stringSchema])),
  required: [...SUMMARY_FIELDS],
};

function phaseSchema(stepCount: number): ResponseSchema {
  return {
    type: SchemaType.OBJECT,
    properties: {
      intro: stringSchema,
      steps: {
        type: SchemaType.ARRAY,
        minItems: stepCount,
        maxItems: stepCount,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            goal: stringSchema,
            todo: { type: SchemaType.ARRAY, maxItems: 3, items: stringSchema },
            prompt: stringSchema,
            tip: stringSchema,
          },
          required: ["goal", "todo", "prompt"],
        },
      },
    },
    required: ["intro", "steps"],
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * Call Gemini in JSON mode, retrying API errors with backoff (1s, 2s)
 */
async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  responseSchema: ResponseSchema,
  apiKey: string
): Promise<string> {
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: systemPrompt,
    generationConfig: { responseMimeType: "application/json", responseSchema },
  });

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_API_ATTEMPTS; attempt++) {
    try {
      const result = await model.generateContent(userPrompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      console.log(`✗ Gemini attempt ${attempt}/${MAX_API_ATTEMPTS} failed:`, errorMessage(error));
      if (attempt < MAX_API_ATTEMPTS) await sleep(1000 * Math.pow(2, attempt - 1));
    }
  }
  throw new Error(`Gemini failed after ${MAX_API_ATTEMPTS} attempts: ${errorMessage(lastError)}`);
}

// Output checks. "hard" issues fail the kit after one regeneration; "soft" issues are sanitized with a warning.
type CheckResult<T> = { value?: T; hard: string[]; soft: string[] };

const FORBIDDEN_CHARS = /[[\]{}<>`]/;
const FORBIDDEN_CHARS_ALL = /[[\]{}<>`]/g;
const YEAR_OR_PRICE = /\b(19|20)\d{2}\b|[$€£]\s?\d/;

const isRecord = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);
const asText = (x: unknown) => (typeof x === "string" ? x.trim() : "");
const strip = (text: string) => text.replace(FORBIDDEN_CHARS_ALL, "").replace(/ {2,}/g, " ").trim();

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function checkText(label: string, text: string, soft: string[]) {
  if (FORBIDDEN_CHARS.test(text)) soft.push(`${label}: contains brackets, braces or backticks`);
  if (YEAR_OR_PRICE.test(text)) soft.push(`${label}: may mention a year or price`);
}

function checkSummary(raw: unknown): CheckResult<Summary> {
  if (!isRecord(raw)) return { hard: ["summary: response is not a JSON object"], soft: [] };
  const soft: string[] = [];
  const value = {} as Summary;
  for (const field of SUMMARY_FIELDS) {
    const text = asText(raw[field]);
    if (!text) soft.push(`summary.${field}: is empty`);
    if (FORBIDDEN_CHARS.test(text)) soft.push(`summary.${field}: contains brackets, braces or backticks`);
    value[field] = text;
  }
  return { value, hard: [], soft };
}

function sanitizeSummary(summary: Summary): Summary {
  const value = {} as Summary;
  for (const field of SUMMARY_FIELDS) value[field] = strip(summary[field]);
  return value;
}

function checkPhase(key: PhaseKey, raw: unknown): CheckResult<Phase> {
  const { titles, pasteInto } = PHASES[key];
  if (!isRecord(raw) || !Array.isArray(raw.steps)) {
    return { hard: [`${key}: response is not a phase object`], soft: [] };
  }
  if (raw.steps.length !== titles.length) {
    return { hard: [`${key}: expected ${titles.length} steps, got ${raw.steps.length}`], soft: [] };
  }

  const hard: string[] = [];
  const soft: string[] = [];
  const intro = asText(raw.intro);
  if (!intro) soft.push(`${key}.intro: is empty`);
  checkText(`${key}.intro`, intro, soft);

  const steps = raw.steps.map((rawStep, i) => {
    const label = `${key} step ${i + 1}`;
    const step = isRecord(rawStep) ? rawStep : {};
    const goal = asText(step.goal);
    const prompt = asText(step.prompt);
    const todo = Array.isArray(step.todo) ? step.todo.map(asText).filter(Boolean) : [];
    const tip = asText(step.tip);

    if (!prompt) hard.push(`${label}: prompt is empty`);
    if (!goal) soft.push(`${label}: goal is empty`);
    if (todo.length === 0) soft.push(`${label}: todo list is empty`);
    if (todo.length > 3) soft.push(`${label}: todo list has more than 3 lines`);
    for (const text of [goal, prompt, tip, ...todo]) checkText(label, text, soft);

    return { title: titles[i], goal, todo, prompt, pasteInto, ...(tip ? { tip } : {}) };
  });

  return { value: hard.length === 0 ? { intro, steps } : undefined, hard, soft: [...new Set(soft)] };
}

function sanitizePhase(phase: Phase): Phase {
  return {
    intro: strip(phase.intro),
    steps: phase.steps.map((step) => ({
      title: step.title,
      goal: strip(step.goal),
      todo: step.todo.slice(0, 3).map(strip),
      prompt: strip(step.prompt),
      pasteInto: step.pasteInto,
      ...(step.tip ? { tip: strip(step.tip) } : {}),
    })),
  };
}

/**
 * Generate, check, and on failure regenerate once. On the second failure,
 * hard issues throw; soft issues are sanitized and returned as warnings.
 */
async function generateChecked<T>(
  label: string,
  systemPrompt: string,
  userPrompt: string,
  responseSchema: ResponseSchema,
  apiKey: string,
  check: (raw: unknown) => CheckResult<T>,
  sanitize: (value: T) => T
): Promise<{ value: T; warnings: string[] }> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const raw = parseJson(await callGemini(systemPrompt, userPrompt, responseSchema, apiKey));
    const result: CheckResult<T> =
      raw === undefined ? { hard: [`${label}: response was not valid JSON`], soft: [] } : check(raw);

    if (result.value !== undefined && result.hard.length === 0 && result.soft.length === 0) {
      return { value: result.value, warnings: [] };
    }
    if (attempt === 1) {
      console.log(`${label}: failed checks, regenerating once:`, [...result.hard, ...result.soft]);
      continue;
    }
    if (result.value === undefined || result.hard.length > 0) {
      throw new Error(result.hard.join("; "));
    }
    return {
      value: sanitize(result.value),
      warnings: result.soft.map((issue) => `${issue} (sanitized after one regeneration)`),
    };
  }
  throw new Error(`${label}: generation did not complete`);
}

export async function generateSummary(answers: Answers, apiKey: string) {
  return generateChecked(
    "summary",
    SUMMARY_SYSTEM,
    buildAnswersBlock(answers),
    summarySchema,
    apiKey,
    checkSummary,
    sanitizeSummary
  );
}

export async function generatePhase(key: PhaseKey, summary: Summary, answers: Answers, apiKey: string) {
  return generateChecked(
    key,
    PHASES[key].system,
    `${buildSummaryBlock(summary)}\n\n${buildAnswersBlock(answers)}`,
    phaseSchema(PHASES[key].titles.length),
    apiKey,
    (raw) => checkPhase(key, raw),
    sanitizePhase
  );
}


Idea: <q1>
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
4. Second validation screen — tests a different aspect from the jump-start; ends with the one question to ask a real user when showing it

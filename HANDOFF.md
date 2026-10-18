# Founder Kit — handoff

Branch: `output-upgrade` (not merged, not deployed). Base: `main`.

## What changed

- **Step 3 — engine:** all 7 answers feed one shared product summary, then structured Validate / Design / Build steps (goal, what to do, ready-to-paste prompt). No placeholders, no raw code.
- **Step 4 — results page:** `/kit/<kitId>` with a random unguessable ID, no login, tabs, checklist, Copy per prompt, progress in localStorage, Save as PDF.
- **Step 5 — email:** one kit-ready email per kit with an "Open your kit" button. No attachments, no download links. An email failure never fails the kit.
- **Step 6 — question flow:** optional "Need help?" per question with guiding questions and tap-to-fill examples.
- **Step 7 — demo safety:** no `alert()`; inline error with "Try again" on the email screen; the kit page updates on its own and shows "Still working" plus Refresh after 90 seconds.

## Commits

| Commit | Step |
|---|---|
| `6d403cb` | 3 — structured kit engine |
| `c16fc3c` | 4 — kit results page |
| `87c0c91` | 4b — prompt sync, expandable prompt box, old docs removed |
| `4d1ae38` | prompt fix, refreshed dev fixtures |
| `31a0c81` | 5 — kit-ready email |
| `eea5941` | 6 — Need help? toggle |
| `f2de270` | 7 — demo safety |

## Convex schema changes

- **New `kits` table:** `kitId`, `submissionId`, `status` (pending / ready / failed), `summary`, `phases`, `error`, `warnings`, `emailStatus`, `emailError`, `createdAt`. Index `by_kitId`.
- **`submissions`:** new optional `kitId`. Older rows have none.
- **`userDocuments`:** kept as is for old data. Nothing writes to it any more.

All changes are additive, so existing data stays valid.

## Environment variables

Convex (set with `npx convex env set NAME` or the dashboard):

- `GEMINI_API_KEY` — **must be REPLACED in production** with Will's own key. Will provides it to you directly. It is not in code or GitHub.
- `RESEND_API_KEY` — unchanged. If unset, the email step is skipped and the kit still finishes.
- `SITE_URL` — optional. Used for the "Open your kit" link. Default `https://founder.arrownorth.design`.

Vercel: `VITE_CONVEX_URL` — unchanged, points at the Convex deployment.

## Vercel routing

`vercel.json` adds an SPA rewrite so kit links load the app:

```json
{ "rewrites": [{ "source": "/kit/:path*", "destination": "/index.html" }] }
```

## Required pre-launch check (dev deployment first)

The Convex side (submit → pending → ready → email) has not been run live yet. Do this on a **dev** deployment before touching production:

1. `npx convex dev` against a dev deployment. Set `GEMINI_API_KEY` and `RESEND_API_KEY` there.
2. Run the front end against it (`npm run dev`).
3. Submit the 3 sample ideas. Their answers are in `sample-outputs-2026-10-18/` (Will sends this folder) and also in `src/dev/fixtures/*.json` under `answers`: dog-walker, teacher, thin-answers.
4. For each one, confirm the page goes from "Building your kit" to the finished kit by itself, with **4 / 4 / 5** steps in Validate / Design / Build.
5. Confirm one email arrives per kit and its "Open your kit" link opens the same kit.
6. Confirm Save as PDF works on a finished kit.
7. Then deploy to production (below) and repeat one submission live, checking the same points.

## Deploy steps

1. Set the production Convex environment variables above (replace `GEMINI_API_KEY`).
2. `npx convex deploy` from this branch.
3. Deploy the front end on Vercel from this branch (or after merging to `main`).
4. Run step 7 of the pre-launch check.

## Rollback

1. Redeploy `main` on Convex (`npx convex deploy` from `main`).
2. Redeploy `main` on Vercel.

The new `kits` table can stay; old code ignores it.

Note: `main`'s schema does not allow `kitId` on `submissions`. If any submission was made on the new version, Convex will reject the `main` deploy with a schema error. In that case add `kitId: v.optional(v.string()),` to the `submissions` table in `main`'s `convex/schema.ts`, then deploy again. Do not delete data to get past the error.

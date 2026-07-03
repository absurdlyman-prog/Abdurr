# Abdurr — Conventions & Rules

This repo currently holds **two things**:

1. **Smart Drug Formulary** — a deployed Vite/React web app (`src/`, `public/`, `netlify/`).
2. **Second Brain** — a personal markdown vault (`inbox/`, `daily/`, `tasks/`, …).

Read the section for the thing you're working on. A split into separate repos is under consideration (see `improvements.md`).

## Working Rules (every session)

- **Branch from `main`** (once it exists; until then, from the repo's default branch). Never base work on another `claude/*` session branch. End every session by either merging the PR or telling the user the work is abandoned — orphaned branches have caused the same bug to be re-fixed in three separate sessions.
- **Verify before pushing app changes:** run `npm run lint` and `npm run build`, and smoke-test with `npm run dev` when behavior changed. CI (`.github/workflows/ci.yml`) runs lint + build on every push.
- **Never guess data-file structure.** Parse the real file or mark the assumption loudly. (A guessed Excel sheet name once shipped broken for 3 months.)
- **Write facts back.** When a session discovers a non-obvious fact about this repo — a data format, a provider decision, a deploy quirk — append it to the relevant section of this file before finishing.

---

# Part 1 — Smart Drug Formulary (the app)

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build (what Netlify runs)
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- No test suite exists yet.

## Data contract

- The app loads `public/Doh_Drugs_January_2026.xlsx` at runtime (`src/utils/excelParser.js`).
- The workbook's sheets are `Version` and `Drugs`. There is **no** `Drugs (2)` sheet — that guess caused a 3-month-latent bug.
- Watch for double extensions (`.xlsx.xlsx`) when the data file is replaced; it has caused deploy 404s twice.

## Prescription scan (vision) — decisions

- **Provider: OpenAI `gpt-4o`.** It was switched to Anthropic and back on 2026-06-19; OpenAI is the settled choice (the user has an OpenAI key). Do not flip providers again without recording the reason here.
- **Key handling:** the preferred path is the Netlify function `netlify/functions/scan-prescription.mjs`, which uses the `OPENAI_API_KEY` environment variable set in the Netlify site config. The browser falls back to a user-supplied key only when the function is unavailable. Never hardcode keys; never add new client-side key storage.
- The extraction prompt is shared via `src/utils/scanPrompt.js` — change it there, not in two places.
- **Health-data rule:** prescription photos are PHI-adjacent. Any change that sends images or patient data to a new external service must be flagged to the user explicitly before implementation.

## Deploy

- **Single deploy target: Netlify** (`netlify.toml`: build to `dist`, SPA redirect, functions in `netlify/functions/`). Do not add gh-pages or second Netlify sites.
- Netlify deploy previews are **not reachable from remote Claude Code containers** (network policy blocks netlify.app) — verify with CI plus a local `vite preview` smoke test instead of curling the preview URL.
- `public/game/` is a self-contained static game ("HUSHWATER", plain HTML + ES modules, no build step). Vite copies `public/` verbatim, so it deploys at `/game/` on the same site; the SPA redirect doesn't shadow it because Netlify serves existing files before redirect rules. Its JS is linted by the repo-wide ESLint config.

---

# Part 2 — Second Brain (the vault)

This is a personal synthesis system. The goal is not storage — it's pattern recognition, commitment tracking, and reflection.

## Folder Map

| Folder | Purpose |
|--------|---------|
| `inbox/` | Raw drop zone — text, transcripts, handwritten page photos. Process from here. |
| `daily/` | One `YYYY-MM-DD.md` per day. Journal, todos, links, captured items. |
| `digests/` | End-of-day synthesis: `YYYY-MM-DD-digest.md`. Written on request. |
| `tasks/` | Single `TASKS.md` of open commitments. Propose only; never auto-complete. |
| `people/` | One file per person. Log interactions, follow-ups, birthdays. |
| `ideas/` | Raw early ideas. Graduate to `projects/` when they mature. |
| `projects/` | Active things being built. Current state + next actions. |
| `reference/` | Finished/stable knowledge worth keeping. |
| `private/` | **OFF LIMITS.** Never read, summarize, or reference without explicit per-moment permission. |

## Handwriting Capture

When an image lands in `inbox/`:
1. Read it with vision capability.
2. Transcribe faithfully. Mark unclear words as `[illegible]` or `[?word]` — never guess silently.
3. Save clean markdown note in the appropriate folder.
4. Extract any tasks/commitments as `[PROPOSED]` items in `tasks/TASKS.md`.
5. Confirm with the user before moving/deleting the original from inbox.

## Daily Digest Format (`digests/YYYY-MM-DD-digest.md`)

Triggered by: user asking for a digest.

Sections:
1. **Commitments** — tasks/deadlines/follow-ups. Flag new (proposed) vs confirmed. Flag overdue items.
2. **Recurring threads** — topics/worries/ideas appearing more than once this week. This is the highest-value section; find non-obvious connections.
3. **One idea worth keeping** — single most interesting capture of the day.
4. **Reflection** — short human paragraph: "here's what was on your mind."

Keep it tight. It should be readable in 2 minutes.

## Rules

- **Propose, don't act.** For task changes, file moves, or anything irreversible: show the plan and wait for confirmation.
- **No external services for vault data.** Keep vault contents local. Don't suggest cloud sync or third-party tools unless asked. (The app's prescription scan is an accepted, user-approved exception — see Part 1.)
- **No bulk reorganization** without showing the plan and getting a yes first.
- **Backup reminder:** Periodically remind the user to keep a backup (git commit/push, or a synced copy) since files are being edited here.
- **private/ is absolute.** No exceptions to the off-limits rule without explicit per-session, per-moment permission. `private/*` is gitignored (only its README is tracked) — keep it that way.
- **Session log:** at the end of a working session, use the `/session-log` skill to capture what was done and *why* into `daily/` — decisions without recorded rationale get re-litigated (the vision-provider flip-flop cost an hour).

## Daily Note Format

File: `daily/YYYY-MM-DD.md`

Sections: Journal, Todos, Captured, Links.

## Task Status Markers

- `[ ]` confirmed open
- `[x]` done (user marks this)
- `[PROPOSED]` extracted by Claude, awaiting user confirmation

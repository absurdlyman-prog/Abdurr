# Claude Code Setup — Improvement Candidates

**Status: executed 2026-07-02** (on user request) — all items except the ones needing GitHub-side decisions:
- ✅ #2 CLAUDE.md rewritten (app section, data contract, provider decision, write-back rule)
- ✅ #3 `private/*` gitignored; scan moved behind a Netlify function (`OPENAI_API_KEY` env var — **you must set it in the Netlify site config**); no more keystroke-persistence; stale `anthropicApiKey` cleaned up; privacy note in UI
- ✅ #4 dead npm-publish workflow replaced with real CI (lint + build on push); verify-before-push rule in CLAUDE.md
- ✅ #6 `/session-log` project skill created
- ✅ #7 `.claude/settings.json` (permission allowlist) + SessionStart hook (`npm install` on web sessions)
- ✅ #8 orphaned files deleted; README/title fixed
- ⏳ #1 branch surgery (create `main`, set default, merge/close 9 branches + 3 PRs) — **needs your decisions per branch**
- ⏳ #5 repo split — **needs your decision**

## How this was produced

Session transcripts don't persist in the remote container, so three sub-agents mined the durable traces instead: (1) full git history with per-commit diffs, (2) GitHub PR / branch / Actions activity on `absurdlyman-prog/Abdurr`, (3) an audit of the repo state against CLAUDE.md. Signals were then clustered across sessions. Where the evidence is a commit or PR, it's cited.

The session record reconstructed from those traces: **~9 Claude sessions since 2026-03-13**, producing 9 `claude/*` branches, 3 PRs (all still open, 0 ever merged), 5 unrelated projects in one repo (drug formulary app, second-brain vault, Python curriculum, SurgeryQuest, HOLLOWREACH), and no `main` branch — the default branch is itself an old session branch.

---

## 1. Branch & merge hygiene — nothing ever merges, so sessions re-fix the same bugs

**Leverage: highest. This is directly measurable wasted work.**

**Signals**
- No `main`/`master` exists. The default branch is `claude/smart-drug-formulary-po2v8`, a March session branch.
- 9 `claude/*` branches; 6 never even got a PR (including a full clinical rebuild of the formulary app, a symptom-to-OTC feature, and a virtualization/PWA rework — all abandoned); 3 PRs open since April–June, 0 merged.
- Because fixes never land in a shared base, later sessions inherit old bugs: the double-`.xlsx` filename was fixed in **three separate sessions** (`3cff450` Mar 13, `f52664e` Jun 19, `20bff73` Jun 19) and the `'Drugs (2)'` sheet-name bug **twice** (`f52664e`, `e150a79`).
- Every PR is based on whatever branch was current, so diffs carry unrelated divergence (PR #2's own body apologizes for this).

**Recommendation**
- **One-time cleanup (needs your decisions):** create `main` from the best current state; for each open PR and orphaned branch, decide merge / cherry-pick / close. Set `main` as default branch.
- **CLAUDE.md fix:** add a rule — every session branches from `main`; end every session by merging the PR or explicitly telling you it's abandoned; never base work on another session branch.
- **Optional automation:** have sessions `subscribe_pr_activity` on the PRs they open so they drive them to merged instead of going quiet.

---

## 2. CLAUDE.md describes a repo that doesn't exist — and hard-won facts never get written back

**Leverage: very high. Every session starts blind to 80% of the actual work.**

**Signals**
- CLAUDE.md covers only the vault. 8 of the 11 commits on the default branch are app work; `src/`, `public/`, build/lint/dev commands, Netlify deploy — none mentioned. An agent reading CLAUDE.md doesn't know the app exists.
- Facts learned the hard way were never recorded, so they can be re-lost:
  - The data contract: app must load `public/Doh_Drugs_January_2026.xlsx`, sheets are `Version` and `Drugs` (Session 1 *guessed* `'Drugs (2)'` — a sheet that never existed in the file — and it sat broken for 3 months until first deploy).
  - The vision-provider decision: scan was switched OpenAI→Anthropic→OpenAI within 54 minutes on Jun 19 (`0886d3a` → `c59cf1a`) and the revert message records **no reason**. Nothing stops a future session from flipping it again.
  - Deploy target(s): netlify.toml, two different Netlify sites, and gh-pages all in play across projects.
- Conversely, app sessions load vault-only rules as noise.

**Recommendation**
- **CLAUDE.md fix:** add an "App" section — what it is, commands (`npm run dev/build/lint`), the xlsx data contract, the chosen vision provider *with the reason*, the single deploy target.
- **CLAUDE.md fix (meta-rule):** "when a session discovers a non-obvious fact about this repo (data format, provider choice, deploy quirk), append it to CLAUDE.md before finishing." This is the rule that would have prevented items 1 and 4 from recurring.

---

## 3. Security & privacy — a health-data app that contradicts the vault's own privacy rules

**Leverage: high (severity, not frequency). One-time fixes plus rules.**

**Signals**
- `src/components/ScanModal.jsx:122-140,199-206`: user's OpenAI API key stored in **plaintext localStorage** ("Remember key on this device"), written on every keystroke, and sent from the browser directly to `api.openai.com` — on a pharmacy tool plausibly used on shared workstations. Session 1 had promised "memory only, never stored" (`ca9d885`); `8f69aeb` silently drifted from that.
- Prescription **photos** (which routinely contain patient names — PHI-adjacent) are posted client-side to OpenAI with no proxy, consent note, or retention thought. This directly contradicts CLAUDE.md's "No external services. Keep data local."
- The brief Anthropic version used `anthropic-dangerous-direct-browser-access`; a leftover `anthropicApiKey` localStorage entry is never cleaned up on devices that saved a key in that 6-minute window.
- `private/` — the folder CLAUDE.md calls "absolute off-limits" — is **committed to git and not gitignored** (`git ls-files private/` returns tracked files; `.gitignore` has no entry). Anything dropped there today would be pushed to GitHub.
- A `security-review` skill exists in the setup; there's no evidence it was ever run on these changes.

**Recommendation**
- **One-time fixes:** gitignore `private/*` (keep the README via exception); move the OpenAI call behind a Netlify Function so the key lives server-side; drop localStorage key persistence or scope it deliberately.
- **CLAUDE.md fix:** a short "secrets & health data" policy — no keys in client code/storage, no patient-identifiable images to third-party APIs without a stated decision, reconcile or scope the "no external services" rule (it currently applies to the vault but is violated by the app's core feature).
- **Habit, not new skill:** run the existing `/security-review` on any change touching ScanModal/API-key/data-upload paths.

---

## 4. No verification before push — deploy-debug loops and guessed facts

**Leverage: high. Compresses the most common failure loop.**

**Signals**
- Jun 19: **5 fix commits in 44 minutes** after first deploy (20:27–21:11) — 404 filename, wrong sheet name, iOS capture attribute, key persistence, provider revert. The first two were 100% reproducible locally with `npm run dev`; each iteration was push-and-check-prod instead.
- Session 1 wrote parser code against a data file that wasn't in the repo yet and guessed the sheet name instead of flagging the assumption.
- HOLLOWREACH CI failed twice (runs 28334711601/28334712011) on a Node-20-vs-21 test-glob incompatibility — caught only after push.
- Meanwhile the only CI workflow in the repo, `npm-publish-github-packages.yml`, is a stock template you added via the GitHub web UI: it runs `npm test` (no test script exists) and `npm publish` (package is `"private": true`), triggers only on releases, and has had **zero runs ever**. Nothing runs `npm run build` or `npm run lint` on push/PR — Netlify is the only thing that ever exercises the build.

**Recommendation**
- **New automation:** replace the dead npm-publish workflow with a simple CI workflow: `npm ci && npm run lint && npm run build` on push/PR. This alone would have caught the 404 and CI-glob failures pre-deploy.
- **CLAUDE.md fix:** "before pushing app changes, run `npm run build` and smoke-test with `npm run dev`; never guess data-file structure — parse the real file or mark the assumption."
- **No new skill needed:** `/verify` and `/run` already exist in the setup — the fix is instructing sessions (via CLAUDE.md) to actually use them.

---

## 5. One repo, five projects — structural decision needed

**Leverage: high if you keep working across these projects; it amplifies every problem above.**

**Signals**
- Drug formulary app, second-brain vault, Python curriculum (PR #1), SurgeryQuest (PR #2), HOLLOWREACH (PR #3) all interleave on shared branches. GitHub repo description still says "Telegram bot."
- Three parallel deploy mechanisms: two distinct Netlify sites posting previews on PR #2, plus gh-pages force-publishes tracking PR #2/#3 commits.
- The vault (including `private/`) lives in the same push target as publicly deployed apps.

**Recommendation**
- **One-time restructure (your call — this is the biggest decision in this document):** split into separate repos (at minimum: vault separate from deployed apps; ideally one repo per app). Alternative if you want one repo: subdirectories with per-directory CLAUDE.md sections and one deploy target per app — but the vault-next-to-public-deploys privacy issue argues for a real split.
- **Nothing** to build skill/automation-wise until this decision is made.

---

## 6. The second brain isn't capturing your Claude work — decisions evaporate

**Leverage: medium, but it's the whole point of the vault.**

**Signals**
- `daily/2026-06-19.md` exists but is completely blank (Journal/Todos/Captured/Links all empty) — despite that being the day of a 3-hour session with a deploy, five fixes, and a provider flip-flop whose rationale is now lost. Only one daily file exists at all; `tasks/TASKS.md` is an empty template.
- The vault's highest-value artifact for improving future sessions — "what did we decide and why" — is exactly what's missing everywhere else in this report (provider choice, deploy target, abandoned rebuilds).

**Recommendation**
- **New skill** (e.g. `/session-log`): at end of a working session, append to `daily/YYYY-MM-DD.md` — what was done, decisions + rationale, open threads — and add `[PROPOSED]` tasks to `tasks/TASKS.md`. Cheap, uses the vault's existing format and propose-don't-act rules.
- Could later become a Stop-hook **automation**, but start as a skill you invoke — automating it before the format settles would create noise.

---

## 7. Remote-session environment setup is missing

**Leverage: medium. Small recurring friction every web session.**

**Signals**
- No `.claude/` directory in the repo at all: no `settings.json` (permission allowlist), no project skills, no SessionStart hook. Every remote session starts cold — no `npm ci`, and presumably repeated permission prompts.

**Recommendation**
- **New automation:** SessionStart hook that runs `npm ci` (the `session-start-hook` skill in your setup exists to build exactly this).
- **New automation:** run the existing `/fewer-permission-prompts` skill to generate a project allowlist in `.claude/settings.json`.

---

## 8. Dead weight — one-time cleanup, no setup change needed

**Leverage: low. Batch it into any future session.**

**Signals**
- Orphans from the Session-1 rebuild: `src/components/DrugTable.jsx`, `FileLoader.jsx`, `src/assets/hero.png`/`react.svg`/`vite.svg` — nothing imports/references them.
- `README.md` is the stock Vite template; `index.html` title is placeholder `abdurr`; repo description is "Telegram bot".
- `.gitignore` is stock Vite — no `.env*`, no data-file conventions; the 3 MB formulary xlsx is committed (public DOH data, so low risk, but there's no stated policy separating shippable data from PHI-risk data).
- Decision on each: **one-time cleanup / nothing** — not worth a skill or automation.

---

## Suggested order if you approve everything

1. Repo split decision (#5) — it changes the shape of everything else.
2. Branch surgery + `main` (#1).
3. Security one-time fixes (#3) — gitignore `private/`, key handling.
4. CLAUDE.md rewrite (#2 + rules from #1/#3/#4).
5. CI workflow + SessionStart hook + allowlist (#4, #7).
6. `/session-log` skill (#6).
7. Cleanup pass (#8).

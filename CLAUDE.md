# Second Brain — Conventions & Rules

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
- **No external services.** Keep data local. Don't suggest cloud sync or third-party tools unless asked.
- **No bulk reorganization** without showing the plan and getting a yes first.
- **Backup reminder:** Periodically remind the user to keep a backup (git commit/push, or a synced copy) since files are being edited here.
- **private/ is absolute.** No exceptions to the off-limits rule without explicit per-session, per-moment permission.

## Daily Note Format

File: `daily/YYYY-MM-DD.md`

Sections: Journal, Todos, Captured, Links.

## Task Status Markers

- `[ ]` confirmed open
- `[x]` done (user marks this)
- `[PROPOSED]` extracted by Claude, awaiting user confirmation

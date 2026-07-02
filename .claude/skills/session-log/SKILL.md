---
name: session-log
description: Capture what happened in this working session into the second-brain vault — what was done, decisions made and WHY, open threads. Use at the end of any session that did real work (coding, research, planning), or when the user asks to "log this session".
---

# Session Log

Write the session's outcome into the vault so future sessions (and the user) inherit the decisions instead of re-litigating them.

## Steps

1. Determine today's date and open `daily/YYYY-MM-DD.md`. If it doesn't exist, create it with the standard sections (Journal, Todos, Captured, Links) per CLAUDE.md.
2. Under **Captured**, append a `### Session log — <short title>` block containing:
   - **Done:** 2-5 bullets of what actually shipped/changed (with commit SHAs or PR links if any).
   - **Decisions:** each decision **with its rationale** — this is the whole point. "Switched X back to Y *because Z*." A decision without a why is not done.
   - **Open threads:** anything unfinished, abandoned, or deferred, and why.
3. Extract any new commitments as `[PROPOSED]` items in `tasks/TASKS.md` (never mark anything done — that's the user's move).
4. If a durable, non-obvious fact about the repo was learned (data format, provider choice, deploy quirk), also append it to the relevant CLAUDE.md section per the "write facts back" rule.
5. Keep the whole block under ~15 lines. This is a log, not an essay.

## Rules

- Follow vault conventions: propose don't act, `[PROPOSED]` markers, never touch `private/`.
- Do not duplicate an existing session-log block for the same session; extend it instead.

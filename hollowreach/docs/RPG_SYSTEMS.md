# RPG Systems

All systems are pure TypeScript over `GameState` in `src/game/systems/`.

## Skill checks (`skillcheck.ts`)

- Resolution: `2d6 + effectiveAttr ≥ finalDC`, where `finalDC = baseDC −
  Σ situational modifiers` (modifiers can be conditional and are shown to the
  player).
- **Criticals:** `6,6` always succeeds; `1,1` always fails.
- **White vs. red:** white checks are retryable once your relevant power changes;
  red checks consume and persist the RNG seed so failure is permanent across
  save/load.
- `successOdds()` enumerates the 36 dice outcomes for an exact percentage in the
  UI. The whole roll, including breakdown, is rendered in `SkillCheckOverlay`.

## Attributes & growth (`attributes.ts`)

- `effectiveAttr` = base + sum of non-expired modifiers (thoughts/items/wounds).
- XP curve: `xpForNextPoint(spent) = 50 + 25·spent`; `pointsOwed` grants points
  as XP crosses thresholds. Spent in **The Voices** sheet.

## Thought Cabinet — the "Mind Reliquary" (`thoughts.ts`)

Ideas you fixate on are slotted as **forming** thoughts. While forming they apply
a penalty modifier and count down `formMinutes` of in-game time; on internalizing
they swap to a permanent bonus and set flags that gate dialogue and endings.
`tickThoughts` runs whenever the clock advances; `applyThoughtModifiers` rebuilds
the thought-sourced modifiers from scratch each tick (idempotent across
save/load). Thoughts are the roguelike-of-the-mind: which ideas take root reshape
who the detective becomes.

## Reputation (`reputation.ts`)

Faction standing −100..+100 with **spillover**: a delta to one faction applies a
fractional opposite delta to its rivals and a fractional same-sign delta to its
allies (`SPILLOVER = 0.4`). `standingBand` buckets it into
hostile/wary/neutral/friendly/devoted for greetings and gated lines.

## NPC memory & reactions (`memory/MemorySystem.ts`)

Each NPC keeps a memory log (lies, bribes, threats, kindnesses, promises, facts)
with a sentiment and a timestamp. `netSentiment` is recency-weighted (memories
soften but never fully vanish). `resolveEntryNode` lets a character's reaction
rules override which dialogue node opens, so the world remembers what you did.

## NPC schedules (`npc/Schedule.ts`)

Characters carry a `schedule[]` of slots keyed by minute-of-day (with optional
conditions). `tickSchedules` relocates every NPC as the clock turns;
`npcsInScene` and `whereIs` answer "who is here now?" and "where's the witness?"
Schedules make the city feel inhabited and make *timing* a real investigative
variable (the foreman only meets his Syndicate contact in the evening, and only
once you know the link exists).

## Investigation / deduction (`investigation/CaseBoard.ts`)

The case board is the centrepiece:

- **Clues** have reliability (`hard`/`soft`/`rumor`) and tags.
- **Contradictions** pair two known clues; *reconciling* one mints a new
  **deduced** clue (e.g. "drowned in seawater" + "found on dry stone" →
  "the body was moved").
- **Theories** are complete, internally-consistent stories. Each lists `requires`
  clues (to become *available*) and optional `weakenedBy` clues (which mark it
  *shaky*). **Multiple theories can be available at once and the game never tells
  you which is true.** You may even accuse on a shaky theory — and live with it.
- **Committing** a theory closes the case and brands its `endingTag` onto the
  save (`<case>__ending`, `<case>__shaky`) for the finale to branch on.

The opening case ships **five** theories accusing the Guild, the Syndicate, the
Mutual/Widow, no-one (accident), or **you** — see `QUEST_FRAMEWORK.md`.

## Clock, save, RNG

- The clock advances on travel, on `advanceTime`, and via `advanceTime` effects;
  crossing midnight rolls the day.
- RNG is a save-persisted Mulberry32 seed (`rng.ts`) so checks are reproducible
  and red checks can't be reloaded away.
- Save/load is versioned with forward migrations (`save/SaveSystem.ts`); see
  `DATABASE_SCHEMA.md`.

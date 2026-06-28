# Quest & Case Framework

Cases are JSON in `content/cases/` (schema: `types/investigation.ts`). A case is
a board of clues, suspects, contradictions, and **theories** (solution paths).
Side quests and faction storylines reuse the same primitives plus dialogue flags.

## Anatomy of a case

```jsonc
{
  "id": "drowned_clerk",
  "title": "The Drowned Clerk",
  "resolutionFlag": "drowned_clerk_closed",
  "briefing": "…",
  "clues":          [ { "id": "clue_wet_lungs", "reliability": "hard", "tags": ["physical","medical"], … } ],
  "suspects":       [ { "id": "suspect_voss", "characterId": "voss", "motiveSketch": "…", "alibi": "…" } ],
  "contradictions": [ { "id": "contra_dry_drowning", "between": ["clue_wet_lungs","clue_no_wound"],
                        "resolvesTo": "clue_moved_body" } ],
  "theories":       [ { "id": "theory_guild", "requires": ["clue_wet_lungs","clue_guild_chit","clue_smuggled"],
                        "accuses": "voss", "endingTag": "guild", "weakenedBy": [], "summary": "…" } ]
}
```

## How a case is played

1. A dialogue/scene effect fires `startCase` (the opener auto-starts in
   `newgame.ts`).
2. **Clues** are learned through `learnClue` effects on dialogue nodes and
   `onExamine` hotspots. Some are gated behind skill checks or attribute reveals
   (the brass lighter only appears at Perception ≥ 3; the low-riding barge at
   Perception ≥ 4).
3. **Contradictions** light up on the board once *both* their clues are known.
   *Reconciling* one mints a deduced clue — that's the deduction system.
4. **Theories** unlock as their `requires` set is satisfied. The board shows
   available theories in green, shaky ones (contradicted by evidence you hold) in
   red, and locked ones with how many clues remain.
5. **Accusing** commits a theory, closes the case, and writes its `endingTag`.

## Designing for multiple solutions

The rule is **no case has one correct answer**. The opening case demonstrates the
pattern with five theories drawing on overlapping evidence:

| Theory | Accuses | Key clues | Ending tag |
| --- | --- | --- | --- |
| The Guild Drowned Him | Foreman Voss | wet lungs + guild chit + (deduced) smuggled cargo | `guild` |
| The Syndicate Bought His Silence | The Syndicate | the secret PAID ledger + (deduced) moved body | `syndicate` |
| The Quarter Took Care of Its Own | The Widow | the impossible debt + moved body (shaky if you hold the ledger) | `mutual` |
| He Let Go | no-one (accident) | wet lungs + debt (shaky if you know the body was moved) | `accident` |
| **V.K.** | **you** | the brass lighter + moved body | `self` |

Because theories share clues and some *weaken* others, the player builds a case
rather than guessing a password. The finale (designed in `ROADMAP.md`) reads the
ending tag and the `__shaky` flag, and the whole city reacts via reputation and
NPC memory.

## Side quests, companions, faction arcs

These need no new system — they are dialogues + flags + (optionally) their own
small case:

- **Faction arc**: gate dialogue on `repAtLeast`/`repBelow`, move standing with
  `rep` effects, branch endings on faction flags.
- **Companion arc**: an NPC with a richer `reactions[]` table and a personal case
  whose `theories` accuse parts of *their* past.
- **Secret ending**: a theory or flag combination only reachable by internalizing
  a specific thought (e.g. **The Drowned God** opens faith-coded lines).

Author it, run `npm run validate:content`, ship it.

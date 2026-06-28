# Dialogue Framework

Conversations are graphs of **nodes** authored as JSON in `content/dialogues/`.
The schema is defined in `src/game/types/dialogue.ts`; the runtime is
`src/game/systems/dialogue/`. No dialogue requires code.

## A node

```jsonc
{
  "id": "wet_lungs",
  "onEnter": [                       // effects fired the first time you enter
    { "op": "learnClue", "key": "clue_wet_lungs" },
    { "op": "xp", "value": 25 }
  ],
  "lines": [                          // narration / speaker / attribute lines
    { "speaker": "narrator", "text": "A thin run of water rises…" },
    { "speaker": "attribute", "speakerId": "logic", "text": "Seawater. He drowned. And yet —" }
  ],
  "passiveChecks": [                  // auto-resolved on entry; success injects a voice line
    { "attribute": "perception", "dc": 8, "kind": "white",
      "label": "the water's wrong shape", "onSuccess": "perc_water", "onFailure": "noop" }
  ],
  "responses": [ /* see below */ ]
}
```

`speaker` is one of `narrator | self | npc | attribute`. `npc`/`attribute` lines
take a `speakerId` (a character id or attribute id) and render in that entity's
colour. Optional `emotion` swaps the portrait/label.

## A response

```jsonc
{
  "id": "r_contradiction",
  "text": "[The water and the dry stone don't agree. File it.]",
  "tone": "inner",                    // neutral|aggressive|kind|sly|inner — tints the option
  "conditions": [                     // ALL must hold or the option is hidden (or greyed if showLocked)
    { "op": "visited", "key": "no_wound" }
  ],
  "effects": [                        // fired immediately on selection (before any check)
    { "op": "addContradiction", "key": "contra_dry_drowning" }
  ],
  "check": {                          // optional skill check; routes by outcome
    "attribute": "logic", "dc": 8, "kind": "white", "label": "Find what killed him",
    "modifiers": [{ "label": "The light is improving", "value": 1,
                    "when": { "op": "timeAfter", "value": 480 } }],
    "onSuccess": "no_wound", "onFailure": "examine_fail"
  },
  "goto": "filed",                    // used when there is no check
  "exit": false,                      // true ends the conversation
  "once": true,                       // hide after first use
  "showLocked": true                  // show greyed with a reason when conditions fail
}
```

If a response has a `check`, `goto` is ignored and the conversation routes to
`onSuccess`/`onFailure`. Otherwise it follows `goto`, or `exit`.

## Conditions (`op`)

`flag` · `!flag` · `flagEquals` · `attrAtLeast` · `attrBelow` · `hasItem` ·
`hasThought` · `repAtLeast` · `repBelow` · `knows` (clue) · `visited` (node) ·
`timeAfter` / `timeBefore` (minutes) · `chance` (0–1, seed-stable).

Evaluated purely in `conditions.ts` — safe to call while rendering, which is how
locked options show their reason (`lockReason`).

## Effects (`op`)

`setFlag` · `incFlag` · `giveItem` · `takeItem` · `addThought` ·
`internalizeThought` · `rep` (faction ± value, with spillover) · `learnClue` ·
`addContradiction` · `remember` (plant an NPC memory) · `xp` · `health` ·
`advanceTime` · `startCase` · `closeCase` · `unlockNode` · `playStinger`.

`remember` carries a memory the NPC will react to later:

```jsonc
{ "op": "remember", "who": "teller",
  "memory": { "id": "mem_honest", "summary": "told her the truth",
              "sentiment": 2, "kind": "fact" } }
```

## Skill checks

`2d6 + effective attribute ≥ DC`. `kind: "white"` is retryable after you grow;
`kind: "red"` is one-shot (the RNG seed is consumed and persisted so reloading
can't re-roll it). `1,1` always fails, `6,6` always succeeds — nothing is ever
certain or impossible. The UI shows live odds and the full modifier breakdown
before you commit (`successOdds`, `SkillCheckOverlay`). `hidden: true` makes a
check passive/silent (surfaceable via Settings → Reveal hidden checks).

## Memory-aware entry

A character's `reactions[]` (in `characters.json`) can re-route the opening node
based on memory kind, recency-weighted sentiment, or a flag — so the bartender
opens *cold* if you lied to her yesterday. Resolved by
`memory/MemorySystem.resolveEntryNode`.

## Validation

`npm run validate:content` checks every `goto`/`onSuccess`/`onFailure` points at
a real node, every effect references a real item/clue/faction/thought/character,
and every check uses a real attribute. It exits non-zero on error, so wire it
into CI.

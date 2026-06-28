# Character Generation

Defined in `content/world/archetypes.json`, validated and instantiated in
`src/game/newgame.ts`, presented in `ui/CharacterCreation.tsx`.

## The flow

1. **Name & pronoun.** Cosmetic + used in narration/UI.
2. **Archetype.** Each archetype is *a wound, not a class* — it pre-seeds the
   eight voices and grants a signature opening **thought** and starting items.
3. **(Optional) free allocation.** The "Hollow Man" archetype unlocks a 24-point
   budget across the eight voices (each 1–6), with live validity feedback
   (`validateAllocation`).
4. **Take the Quay.** `createNewGame` builds the full `GameState`: attributes,
   morale/endurance pools (scaled by Composure/Instinct), inventory, the opening
   thought (forming), the opening case, and the first journal entry. It drops you
   into the cold-open monologue (`intro`).

## The archetypes

| Archetype | Spread highlights | Opening thought | Fantasy |
| --- | --- | --- | --- |
| **The Clerk Who Counted** | Logic 4 · Composure 4 | The Ledger Speaks | The mind is a fortress; you noticed something in the numbers. |
| **The Open Wound** | Empathy 5 · Intuition 4 | Everyone Is Drowning | You feel everything; people tell you the truth and you wish they wouldn't. |
| **The Old Dog** | Instinct 5 · Perception 4 · Authority 4 | The Body Remembers | Twenty years on the worst streets; your hands know things your mind forgot. |
| **The Hollow Man** | even 3s, **free allocation** | Who Was I? | A blank slate — build yourself from nothing. |

## Vitals scaling

```
moraleMax    = 3 + ceil(Composure / 2)
enduranceMax = 3 + ceil(Instinct   / 2)
```

So a psyche-heavy build is harder to break emotionally, and a physique build
soaks more physical punishment — the same number means two different
survivabilities.

## Extending

Add an archetype by appending to `archetypes.json`:

```jsonc
{
  "id": "the_believer",
  "name": "The Tideborn",
  "blurb": "You were baptised in the flood and never quite came back up.",
  "attributes": { "logic": 1, "empathy": 3, "intuition": 5, "authority": 2,
                  "creativity": 4, "perception": 3, "composure": 3, "instinct": 3 },
  "startingThought": "the_drowned_god",
  "startingItems": ["case_notebook"]
}
```

No code change required; the creation screen renders it automatically.

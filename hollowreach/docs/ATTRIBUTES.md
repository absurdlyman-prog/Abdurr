# The Eight Voices

HOLLOWREACH replaces traditional stats with eight **inner voices**, each a
character with opinions, biases, advice, and conflicts. They are defined in
`content/attributes.json` and rendered in their own colour whenever they speak
(`ui/DialogueBox`, `ui/CharacterSheet`).

## The roster

| Voice | Cluster | Creed | Good at | Pitfall |
| --- | --- | --- | --- | --- |
| **Logic** | Intellect | "Two and two, and never a third." | Deduction, inconsistencies, procedure | Sneers at feeling; misses the unprovable. |
| **Empathy** | Psyche | "Their wound, in your chest." | Reading grief, earning trust, spotting performance | It bleeds; every con becomes your debt. |
| **Intuition** | Intellect | "You knew before you knew." | Hunches, pattern completion, cold reads | Confidence without footnotes. |
| **Authority** | Psyche | "They are already obeying." | Intimidation, command, holding a line | Mistakes fear for respect. |
| **Creativity** | Intellect | "What if the wall were a door?" | Lateral solutions, reframing, the absurd | Would rather be interesting than right. |
| **Perception** | Reflex | "The room is talking." | Spotting clues, tells, detail | Floods; the noise drowns the signal. |
| **Composure** | Psyche | "Let the face hold while the house burns." | Hiding tells, withstanding shock | The mask can fuse to the face. |
| **Instinct** | Physique | "The body knew the alley was wrong." | Threat-sense, confrontation, stamina | Two verbs only: fight or flee. |

## How they speak

Three channels, all data-driven:

1. **Interjections** — dialogue lines authored with `"speaker": "attribute"` and
   a `speakerId`. They render indented, italic, in the voice's colour.
2. **Passive checks** — a node's `passiveChecks[]` are auto-resolved on entry;
   on success the target node's first line is injected *as that voice*, so a
   sharp Perception notices the waterline without you asking.
3. **Skill checks** — an active option tagged with a voice; success/failure
   routes the conversation (see `DIALOGUE_FRAMEWORK.md`).

## The double edge

Every voice's `pitfall` is real design intent, not flavour: high Authority opens
intimidation lines but *closes* warmth (NPCs remember being bullied via the
memory system); high Empathy makes you trust liars; a forming thought can
temporarily lower a voice and change which lines you can even see. The game wants
you to feel that becoming better at one way of being a person makes you worse at
another.

## Mechanics

- **Range:** base 1–8 (start 1–6). Effective = base + active modifiers (thoughts,
  items, wounds, substances), computed in `systems/attributes.ts`.
- **Vitals:** Composure underwrites the **Morale** pool; Instinct underwrites the
  **Endurance** pool. Run a pool to zero and that voice "kills" you (blackout /
  collapse) — disable in Settings → No-fail mode.
- **Growth:** XP from clues and passed checks awards skill points
  (`pointsOwed`/`xpForNextPoint`); spend them in **The Voices** sheet to raise a
  base value. The voice literally "grows louder."

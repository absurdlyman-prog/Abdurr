# UI / UX & Accessibility

The interface is DOM/React layered over the Pixi canvas, in a painterly noir
register: bruised blues, sodium amber, brine-green, serif body type for the
literary voice. Styling is in `ui/styles/global.css`, driven by CSS variables.

## Screens & overlays

| Surface | Component | Notes |
| --- | --- | --- |
| Title | `MainMenu` | Continue (autosave), load slots, new game, import code. |
| Creation | `CharacterCreation` | Name, pronoun, archetype, optional 24-pt allocation with live validity. |
| World | `GameView` + Pixi | Click to move/interact, drag to pan, wheel to zoom; hover reveals hotspot labels. |
| HUD | `Hud` | Clock with time-of-day mood, morale/endurance pips, scene name, overlay launcher (badges for open cases & unspent points). |
| Dialogue | `DialogueBox` | Speaker/attribute/narration lines; numbered responses with tone tint, check tag, live odds, and lock reasons. Keyboard: number keys pick, Esc exits. |
| Skill check | `SkillCheckOverlay` | Animated dice, full modifier breakdown, total-vs-DC, white/red framing. |
| Case board | `CaseBoard` | Evidence wall, reconcilable contradictions, theories you can accuse. |
| Mind Reliquary | `ThoughtCabinet` | Forming progress bars, penalties/bonuses, "walk the city" time-pass. |
| The Voices | `CharacterSheet` | Eight colour-coded cards with creed, strengths, pitfall, and raise buttons. |
| Coat | `Inventory` | Items with passive modifiers + faction standing bands. |
| Notebook | `Journal` | Auto-written, reverse-chronological entries. |
| Settings | `Settings` | Audio mix + full accessibility suite + save export. |
| Toasts | `Toasts` | Transient event feed (clues, rep, level-ups, "they'll remember that"). |

## Design principles

- **Show the maths.** Skill checks display exact odds and every modifier *before*
  you commit — failure should feel like a risk you understood, not a cheat.
- **Locked, not hidden (when it matters).** Options you *could* take with a
  different build can show greyed with the reason (`showLocked`), so you feel the
  shape of the character you didn't make.
- **The voices are characters.** Attribute lines are indented, italic, and in the
  voice's own colour, so the chorus in your head reads as people, not stats.
- **The canvas is ambient; the DOM is interactive.** All decisions happen in
  crisp, legible DOM; the Pixi scene is mood and place.

## Accessibility suite (`Settings`)

| Toggle | Effect |
| --- | --- |
| **Reduced motion** | Stills rain/fog drift and UI animation (also honours the `reduce-motion` class). |
| **High contrast** | Brighter ink, darker paper, and a lighter day/night grade so text never fights the scene. |
| **Dyslexia-friendly font** | Swaps the serif for a legible sans with looser tracking. |
| **Reveal hidden checks** | Surfaces passive/hidden rolls instead of resolving silently. |
| **No-fail mode** | Removes morale/endurance death; the story continues regardless. |
| **Text size** | 80%–160% global scale via `--text-scale` on `<html>`. |

Plus full keyboard support in dialogue, large hit targets, and tabular-numeric
odds for screen legibility. All settings persist with the save.

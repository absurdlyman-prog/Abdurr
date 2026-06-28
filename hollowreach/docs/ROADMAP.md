# Roadmap & Honest Scope

This document is deliberately candid about what HOLLOWREACH **is today** versus
what the brief asks for, so no one mistakes the framework for the finished
campaign.

## Shipped — a complete, playable vertical slice

- ✅ Engine, architecture, and every core system listed in the README, **running
  end-to-end** (verified in-browser: menu → creation → cold-open → investigation →
  skill checks → case board → verdict, zero console errors).
- ✅ The opening case **"The Drowned Clerk"**: 4 explorable districts, 4 speaking
  characters with memory/schedules/reactions, 9 clues, 2 contradictions, and
  **5 internally-consistent solution paths** with no single correct answer.
- ✅ Eight inner-voice attributes that speak, gate checks, and grow.
- ✅ Thought Cabinet, reputation with spillover, NPC memory, daily schedules.
- ✅ Painterly isometric renderer with rain, volumetric fog, day/night, neon,
  camera; generative adaptive score + ambience + stingers.
- ✅ Save/load (local + optional cloud), export codes, migrations; accessibility
  suite; localization layer; modding API; content linter.

Roughly a **30–60 minute** authored experience that exercises every system.

## Designed, framework-ready — the road to 30+ hours

These need **content authoring**, not new engineering. Every primitive exists.

| Goal | What's needed | Already supported by |
| --- | --- | --- |
| Full main storyline | More cases chained by flags/endings | `startCase`/`closeCase`, ending tags |
| Multiple major cases | More `content/cases/*.json` + dialogues/scenes | Case board, deduction, theories |
| Companion arcs | NPCs with personal cases + richer reactions | Memory, reactions, schedules |
| Faction storylines | Dialogue gated on reputation + faction flags | `rep` spillover, `repAtLeast` |
| Secret endings | Theory/flag/thought combinations | `endingTag`, thought flags, `chance` |
| Branching finale | A finale dialogue reading `<case>__ending` + `__shaky` | flags already written on verdict |
| The northern gentry district | One more scene set + faction (Reclamation Office) | Scene/district schema, factions.json |
| Voice acting | Per-line audio ids + subtitles | line `speaker`/`emotion` schema, sfx bus |
| Bitmap art option | Atlas + sprite swap in `IsoScene` | sprite-by-string keying |

## Engineering backlog (nice-to-haves)

- Path-finding for click-to-move (currently teleports to the clicked tile).
- A* NPC movement between schedule slots (currently snap-relocate).
- Pixi sprite atlas loader + `@assetpack` integration for optional bitmaps.
- Streamed-music option alongside the generative score.
- More unit/integration tests around the deduction edge cases.
- A finale screen component that renders the ending the flags describe.

## Guiding principle

The hardest, riskiest part of a narrative RPG — the systems that make choices
*mean* something (inner-voice checks, memory, deduction with multiple truths,
consequence flags that echo) — is **built and proven**. Scaling to a full
campaign is now a writing-and-content problem on top of a working, tested,
data-driven engine.

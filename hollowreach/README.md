# HOLLOWREACH

> *A drowning city. A death it would rather forget. Eight voices in one skull, and no memory of which of them you used to be.*

**HOLLOWREACH** is a narrative detective RPG inspired by the depth and atmosphere of the genre's best — built entirely original in setting, characters, lore, mechanics, art, and story. You wake on a rain-black quay beside a dead man, with a Watch badge you don't remember earning and eight arguing inner voices for company. Solve the death of the drowned clerk — and decide who you become while doing it.

It runs in the browser: **React + TypeScript + PixiJS (v8)** on the front end, a dependency-free **Node** save backend, and a fully **JSON-driven content system**. There are **no binary art or audio assets** — the painterly isometric world and the generative score are produced procedurally in code, so the whole game ships in a small bundle and every scene, voice, and clue is data you can edit.

---

## What's in the box

| Pillar | Status | Where |
| --- | --- | --- |
| Eight inner-voice attributes that speak, argue, and gate checks | ✅ Implemented | `content/attributes.json`, `ui/DialogueBox` |
| JSON-driven branching dialogue with white/red & hidden skill checks | ✅ Implemented | `systems/dialogue/*`, `content/dialogues/*` |
| Investigation: clues, contradictions, deduction, **5-theory** non-linear case | ✅ Implemented | `systems/investigation`, `content/cases` |
| Reputation (with faction spillover), NPC memory & reactions, daily schedules | ✅ Implemented | `systems/reputation`, `systems/memory`, `systems/npc` |
| Thought Cabinet ("Mind Reliquary") that reshapes the character over time | ✅ Implemented | `systems/thoughts`, `content/thoughts.json` |
| Painterly isometric renderer: rain, volumetric fog, day/night, neon, parallax | ✅ Implemented | `engine/pixi/*` |
| Adaptive generative score + ambience + stingers (WebAudio, asset-free) | ✅ Implemented | `engine/audio/AudioDirector` |
| Save/load (localStorage + optional cloud), export codes, versioned migrations | ✅ Implemented | `systems/save`, `server/` |
| Accessibility suite, localization layer, modding API | ✅ Implemented | `ui/Settings`, `localization/`, `App.tsx` |
| Full world bible: timeline, districts, factions, economy, maps | ✅ Authored | `docs/WORLD_BIBLE.md` |
| 30+ hour campaign, companions, voiced lines | 🟡 Designed, framework ready | `docs/ROADMAP.md` |

The opening case, **"The Drowned Clerk,"** is a complete, playable vertical slice: four explorable districts, four speaking characters, a full investigation with five internally-consistent solution paths and **no single correct answer**, and an ending tag the finale branches on. `docs/ROADMAP.md` is honest about what is a playable slice versus a designed-but-unbuilt arc.

---

## Quick start

```bash
cd hollowreach
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build            # typecheck + production bundle into dist/
npm run preview          # serve the built bundle (base path /hollowreach/)
npm run validate:content # lint all JSON for broken references (gates CI)
npm run server           # optional cloud-save backend on :8787
```

> Click anywhere on the title screen to start the audio engine (browser autoplay policy). Headphones recommended.

---

## The eight voices

Instead of numbers on a sheet, HOLLOWREACH gives you eight *characters* that live in your head, each with opinions, biases, and a distinct voice that interjects during play:

- **Logic** — *"Two and two, and never a third."*
- **Empathy** — *"Their wound, in your chest."*
- **Intuition** — *"You knew before you knew."*
- **Authority** — *"They are already obeying. They just don't know it."*
- **Creativity** — *"What if the wall were a door?"*
- **Perception** — *"The room is talking. Are you listening?"*
- **Composure** — *"Let the face hold while the house burns."*
- **Instinct** — *"The body knew the alley was wrong."*

Raise one and its voice grows louder — for better and worse. Every attribute's strength has a pitfall; a maxed voice will lead you confidently into its own blind spot. See `docs/ATTRIBUTES.md`.

---

## Documentation

| Doc | Covers |
| --- | --- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Project architecture, folder structure, data flow, modding & localization pipeline |
| [WORLD_BIBLE.md](docs/WORLD_BIBLE.md) | Lore, historical timeline, district maps, faction profiles, economy & culture |
| [ATTRIBUTES.md](docs/ATTRIBUTES.md) | The eight-voice psychology system in depth |
| [DIALOGUE_FRAMEWORK.md](docs/DIALOGUE_FRAMEWORK.md) | How to author dialogue: nodes, conditions, effects, checks |
| [RPG_SYSTEMS.md](docs/RPG_SYSTEMS.md) | Skill checks, thoughts, reputation, memory, schedules, investigation |
| [QUEST_FRAMEWORK.md](docs/QUEST_FRAMEWORK.md) | Authoring cases, clues, contradictions, and multi-solution theories |
| [CHARACTER_GENERATION.md](docs/CHARACTER_GENERATION.md) | Archetypes and the creation flow |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Save-state schema and the cloud-save REST API |
| [ASSET_PIPELINE.md](docs/ASSET_PIPELINE.md) | The procedural art/audio approach and how to add bitmap/audio assets |
| [SOUND_DESIGN.md](docs/SOUND_DESIGN.md) | Adaptive-music specification and the generative implementation |
| [UI_UX.md](docs/UI_UX.md) | Interface design and the accessibility suite |
| [BUILD_AND_DEPLOY.md](docs/BUILD_AND_DEPLOY.md) | Build instructions and deployment (GitHub Pages, Netlify, Node host) |
| [ROADMAP.md](docs/ROADMAP.md) | Honest scope: shipped vs. designed, and the path to a full campaign |

---

## Tech at a glance

```
React 18 + TypeScript (strict)   UI, screens, overlays
PixiJS 8                          isometric renderer + atmosphere
Zustand                          single-source game store
Vite 6                           dev server + build
Node (no deps)                   optional cloud-save server
JSON                             100% of game content
```

Licensed under the terms in [LICENSE](LICENSE). Original work; any resemblance to existing titles is in spirit only.

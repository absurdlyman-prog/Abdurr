# Architecture

HOLLOWREACH is a single-page app with a strict separation between **domain logic**
(framework-agnostic TypeScript), the **rendering engine** (PixiJS), the **UI**
(React), and **content** (JSON). State flows one way; content is never reached
into directly outside the content registry.

```
                       ┌──────────────────────────────┐
                       │          content/*.json        │
                       │ attributes, scenes, dialogues, │
                       │ cases, characters, thoughts…   │
                       └───────────────┬────────────────┘
                                       │ imported & indexed
                                       ▼
                            ┌────────────────────┐
                            │  game/content.ts    │  typed getters, one source
                            └─────────┬───────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────┐         ┌────────────────────────┐      ┌─────────────────┐
│ game/systems  │         │  game/state/store.ts    │      │  engine/pixi    │
│ pure logic:   │◄────────│  Zustand single store    │─────►│ SceneRenderer    │
│ dialogue,     │ mutate  │  (the only mutable state)│ subs │ subscribes to    │
│ skillcheck,   │────────►│                          │      │ store, draws     │
│ investigation,│         └───────────┬──────────────┘      └─────────────────┘
│ memory, rep,  │                     │ hooks                         │
│ thoughts, npc │                     ▼                               ▼
└───────────────┘             ┌──────────────┐              ┌─────────────────┐
        ▲                      │   ui/ (React) │              │ engine/audio    │
        │ structuredClone      │ screens,      │─────────────►│ AudioDirector   │
        └──────────────────────│ overlays, HUD │   stingers   │ (WebAudio)      │
                               └──────────────┘              └─────────────────┘
```

## One-way data flow

1. **UI** dispatches an intent to the store (`choose`, `interact`, `travelTo`,
   `spendPoint`, …).
2. The store's private `mutate(fn)` **clones** the `GameState`
   (`structuredClone`), runs the relevant **pure systems** against the draft,
   then recomputes derived state (thought modifiers, NPC schedules) and commits a
   new top-level reference. This makes every mutation atomic and trivially
   serializable — the save file *is* the state.
3. Systems return `GameEvent[]`; the store turns them into transient **toasts**
   and forwards audio **stingers**.
4. **Pixi** (`SceneRenderer`) and **React** both subscribe to the store. Pixi
   rebuilds the scene on `sceneEpoch` and does cheap per-frame updates on
   `revision`; React re-renders via selectors.

Because all logic is pure functions over `GameState`, the systems are testable in
isolation with no DOM, no Pixi, and no React (`npm test`).

## Folder structure

```
hollowreach/
├─ index.html                 # first-paint loader, mounts #root
├─ vite.config.ts             # base path, aliases, manual chunks
├─ tsconfig.json              # strict TS, path aliases
├─ public/favicon.svg
├─ server/
│  └─ index.ts                # optional cloud-save HTTP server (no deps)
├─ scripts/
│  └─ validate-content.ts     # JSON referential-integrity linter (CI gate)
├─ docs/                      # this documentation set
└─ src/
   ├─ main.tsx                # React bootstrap
   ├─ App.tsx                 # screen switch + audio wiring + a11y classes
   ├─ vite-env.d.ts
   ├─ engine/
   │  ├─ pixi/
   │  │  ├─ SceneRenderer.ts  # Pixi app, camera, input, store subscription
   │  │  ├─ IsoScene.ts       # procedural painterly tile/hotspot builder
   │  │  ├─ iso.ts            # isometric projection + picking math
   │  │  ├─ tiles.ts          # tile & decal palette
   │  │  └─ atmosphere/
   │  │     ├─ RainLayer.ts   # wind-sheared particle rain
   │  │     ├─ FogLayer.ts    # drifting volumetric fog
   │  │     └─ DayNight.ts    # time-of-day colour grade
   │  └─ audio/
   │     └─ AudioDirector.ts  # generative adaptive score + ambience + stingers
   ├─ game/
   │  ├─ content.ts           # content registry (typed getters)
   │  ├─ newgame.ts           # new-game factory + allocation validation
   │  ├─ types/               # the entire domain model (see DATABASE_SCHEMA.md)
   │  ├─ state/store.ts       # Zustand store — the orchestrator
   │  └─ systems/
   │     ├─ rng.ts            # seeded, save-persisted RNG
   │     ├─ attributes.ts     # effective scores, XP/level thresholds
   │     ├─ skillcheck.ts     # 2d6 + attribute vs DC, white/red/crit
   │     ├─ reputation.ts     # faction standing + spillover
   │     ├─ thoughts.ts       # thought-cabinet lifecycle & modifiers
   │     ├─ dialogue/
   │     │  ├─ DialogueEngine.ts  # node traversal, response views
   │     │  ├─ conditions.ts      # pure condition evaluation
   │     │  └─ effects.ts         # effect application → GameEvent[]
   │     ├─ investigation/CaseBoard.ts  # deduction, theories, contradictions
   │     ├─ memory/MemorySystem.ts      # NPC memory + reaction routing
   │     └─ npc/Schedule.ts             # daily-schedule AI
   ├─ ui/
   │  ├─ components/          # MainMenu, CharacterCreation, GameView, Hud,
   │  │                       # DialogueBox, SkillCheckOverlay, CaseBoard,
   │  │                       # ThoughtCabinet, Inventory, Journal,
   │  │                       # CharacterSheet, Settings, Toasts, OverlayShell
   │  └─ styles/global.css
   ├─ localization/
   │  ├─ en.json
   │  └─ loc.ts               # t(), registerLocale(), setLocale()
   └─ content/
      ├─ attributes.json
      ├─ thoughts.json
      ├─ world/  (factions, districts, items, archetypes)
      ├─ scenes/ (quay_dawn, mutual_hall, spindle_yard, rows_night)
      ├─ characters/characters.json
      ├─ dialogues/ (intro, the_body, teller, widow, voss)
      └─ cases/drowned_clerk.json
```

## Modding API

In any build the game publishes a small scripting surface on `window`:

```js
window.hollowreach.store    // the live Zustand store (getState / setState / subscribe)
window.hollowreach.content  // the content registry (lookups by id)
window.hollowreach.audio    // the AudioDirector (playTheme, stinger)
window.hollowreach.version
```

Mods can drive the game, inspect state, or hot-swap behaviour from the console or
a userscript. **New content needs no code**: add a JSON file under `content/`,
register it in `content.ts`, and the systems pick it up. The content linter
(`npm run validate:content`) checks every cross-reference so a typo in a `goto`
or a missing clue id fails fast.

## Localization & content pipeline

- **UI chrome** strings live in `localization/<locale>.json` and resolve through
  `t(key)` with English fallback.
- **Narrative content** (which is the bulk of the words) is localized by
  swapping the `content/` bundle. Because content is pure data keyed by id, a
  translation is a parallel set of JSON files; `content.ts` is the single place
  to choose which bundle loads. See `ASSET_PIPELINE.md`.

## Why no assets?

Every visual is drawn from layered, jittered polygons (`IsoScene`, `tiles.ts`)
and every sound is synthesized live (`AudioDirector`). This keeps the bundle
tiny, makes the whole game diff-able and mod-able as text, and means the
"painterly" look and "haunting score" are reproducible from source with zero
binary blobs. `ASSET_PIPELINE.md` documents how to layer real bitmap/audio
assets on top when you want them — the renderer already keys sprites by string,
so swapping a procedural sprite for a texture is a one-line change per hotspot.

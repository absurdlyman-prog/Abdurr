# Asset Pipeline

HOLLOWREACH ships **zero binary assets**. The painterly world and the haunting
score are produced procedurally in code. This keeps the bundle small, makes the
entire game diff-able and mod-able as text, and means the look/sound are
reproducible from source. This document explains the procedural pipeline *and*
how to layer real bitmap/audio assets on top when you want them.

## Visuals — the procedural painter

| Concern | Source | Technique |
| --- | --- | --- |
| Tiles | `engine/pixi/tiles.ts` | Each tile id → top/left/right face colours + height + roughness. Drawn as a 2:1 iso diamond with extruded side faces (`IsoScene.drawTile`). |
| Brushstrokes | `IsoScene.drawTile` | Per-tile jittered flecks of lightened/darkened paint give the oil-sketch grain (seeded per scene, so it's stable). |
| Decals | `tiles.ts` DECALS + `IsoScene.drawDecal` | Puddles, neon lamps, dead lamps, rebar, reflections — billboarded shapes in the "decals" layer. |
| Hotspots | `IsoScene.makeHotspotMarker` | NPC silhouettes, clue glints, exit chevrons, with hover labels and emissive halos. |
| Rain | `atmosphere/RainLayer.ts` | Recycled wind-sheared streak particles; intensity from scene weather. |
| Fog | `atmosphere/FogLayer.ts` | Parallax drifting soft blobs (stacked circles = cheap gaussian); density from scene weather. |
| Day/night | `atmosphere/DayNight.ts` | Keyframed colour-grade overlay (multiply) by minute-of-day. |
| Neon | tile `glow` + decal `lamp_neon` | Emissive fills + the day/night ambient make neon pop after dusk. |
| Camera | `SceneRenderer` | Smooth follow, drag-pan, wheel-zoom (0.55×–2.2×). |

Scenes are authored as JSON tile maps (`content/scenes/*.json`): `layers[].tiles`
(row-major ids), `hotspots[]`, `weather`, `palette`, `spawn`. The content linter
checks `width·height === tiles.length`.

### Adding real bitmap art (optional)

The renderer already keys sprites by string (`hotspot.sprite`, tile ids). To use
textures instead of procedural shapes:

1. Drop images in `public/atlas/` and load them with Pixi `Assets.load`.
2. In `IsoScene`, replace the `Graphics` draw for a tile/hotspot with a `Sprite`
   from the loaded texture, keyed by the same id/string.
3. Keep the atmosphere layers — they composite over any art.

Recommended authoring target if you go bitmap: hand-painted **256×512** isometric
tile sprites at 2× for crispness, exported as a packed atlas (e.g. via
`@assetpack/core` or TexturePacker) to `public/atlas/world.json`.

## Audio — the procedural composer

See `SOUND_DESIGN.md`. In brief: `engine/audio/AudioDirector.ts` synthesizes a
drone + filtered pad chord (per district theme) + shaped-noise ambience
(water/wind/street/room) + short stinger motifs, all via WebAudio, gain-ducked by
the user's mix. To use streamed music instead, swap `playTheme` to load and
crossfade `AudioBufferSourceNode`s from `public/audio/` — the rest of the game
only calls `playTheme(themeId)` and `stinger(id)`.

## Build pipeline

`vite build` runs `tsc -b` (typecheck/emit declarations) then bundles. Output in
`dist/` with `pixi`, `react`, and app code split into separate chunks
(`vite.config.ts → manualChunks`). Source maps are on. Because there are no
assets, the only files served are `index.html`, the favicon, and the JS/CSS
chunks.

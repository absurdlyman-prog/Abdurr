# Data Schema

HOLLOWREACH has no SQL database — its "database" is the serializable
`GameState`, persisted to **localStorage** and (optionally) to a **Node file
store**. The whole game is reconstructable from one `GameState` object, which is
the schema below (canonical source: `src/game/types/save.ts`).

## `GameState` (save document)

```ts
GameState {
  version: number                 // SAVE_VERSION; migrated forward on load
  profile: { name, archetype, pronoun }
  attributes: {
    base: Record<AttributeId, number>          // 1..8
    modifiers: { source, attribute, value, reason, expiresAt? }[]
  }
  vitals: { morale, moraleMax, endurance, enduranceMax }
  clock: { minutes, day }         // minutes = total elapsed; day rolls at 24h
  xp: number
  skillPoints: number
  flags: Record<string, number|string|boolean>  // world state & counters
  inventory: Record<itemId, count>
  reputation: Record<factionId, number>          // -100..100
  cases: Record<caseId, {
    caseId, knownClues[], resolvedContradictions[], committedTheory?, closed
  }>
  npcs: Record<characterId, {
    characterId, relationship, memories: NpcMemory[], location?
  }>
  thoughts: { thoughtId, status: 'forming'|'internalized', slottedAt }[]
  location: { scene, x, y }
  seenNodes: string[]             // "dialogueId#nodeId" and bare node ids
  knownClues: string[]            // denormalized for fast condition checks
  journal: { id, day, minute, title, body, caseId? }[]
  rngSeed: number                 // save-persisted RNG
  settings: SettingsState         // audio + accessibility
  savedAt?: string                // ISO
}
```

### Indexing & integrity

- `knownClues` is denormalized at the top level (and mirrored into each case) so
  `knows` conditions are O(1) without walking every case.
- `seenNodes` stores both `dialogueId#nodeId` (first-visit / once tracking) and
  bare `nodeId` (the `visited` condition).
- `flags.__pointsGranted` tracks granted skill points so XP can't double-award
  across reloads.

## Migrations

`SaveSystem.migrate()` runs versioned, additive migrations
(`migrateTo2`, `migrateTo3`, …). Older saves never hard-break; missing fields are
backfilled with defaults. Bump `SAVE_VERSION` and add a `migrateToN` when the
shape changes.

## Storage layers

| Layer | Keys | Notes |
| --- | --- | --- |
| **localStorage** | `hollowreach.save.<slot>`, index at `hollowreach.saves` | Primary; works offline & on GitHub Pages. `autosave` slot written on travel and dialogue close. |
| **Export code** | — | `exportSave` → base64 string; `importSave` reads it back. Portable backup/transfer. |
| **Cloud (optional)** | files under `server/.saves/<slot>.json` | Enabled only if the Node server is running; `pushCloud`/`pullCloud` in `SaveSystem`. |

## Cloud save REST API (`server/index.ts`)

A dependency-free Node HTTP server. CORS-open, 2 MB body cap, slot ids validated
against `^[a-z0-9_-]{1,40}$`.

| Method & path | Body | Response |
| --- | --- | --- |
| `GET /api/health` | — | `{ ok: true, dir }` |
| `GET /api/saves` | — | `{ slots: SaveSlotMeta[] }` |
| `GET /api/saves/:slot` | — | the `GameState` JSON, or `404` |
| `PUT /api/saves/:slot` | `GameState` JSON | `{ ok: true, slot }` |
| `DELETE /api/saves/:slot` | — | `{ ok: true }` |

Run with `npm run server` (`PORT`, `SAVE_DIR` env-configurable). Vite proxies
`/api` → `:8787` in dev.

## Content reference (read-only "tables")

Authored content is effectively a set of static, id-keyed tables loaded by
`game/content.ts`: `attributes`, `thoughts`, `factions`, `districts`, `items`,
`archetypes`, `characters`, `scenes`, `dialogues`, `cases`. They are immutable at
runtime; only `GameState` mutates.

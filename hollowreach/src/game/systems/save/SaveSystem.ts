import type { GameState, SaveSlotMeta } from '../../types';
import { SAVE_VERSION } from '../../types';
import { Content } from '../../content';

// Save/load. Primary store is localStorage (works offline, on GitHub Pages).
// An optional cloud backend (server/) can be layered on via `pushCloud`/`pullCloud`.
// Saves are versioned and migrated forward on load so old saves never hard-break.

const PREFIX = 'hollowreach.save.';
const INDEX_KEY = 'hollowreach.saves';
const AUTOSAVE_SLOT = 'autosave';

export interface SaveIndex {
  slots: SaveSlotMeta[];
}

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null; // private mode / SSR
  }
}

export function listSaves(): SaveSlotMeta[] {
  const s = storage();
  if (!s) return [];
  try {
    const idx = JSON.parse(s.getItem(INDEX_KEY) ?? '{"slots":[]}') as SaveIndex;
    return idx.slots.sort((a, b) => (b.savedAt > a.savedAt ? 1 : -1));
  } catch {
    return [];
  }
}

export function saveGame(slot: string, state: GameState): SaveSlotMeta {
  const s = storage();
  const savedAt = new Date().toISOString();
  const meta: SaveSlotMeta = {
    slot,
    name: state.profile.name || 'Detective',
    day: state.clock.day,
    minute: state.clock.minutes,
    scene: Content.scene(state.location.scene)?.name ?? state.location.scene,
    savedAt,
    version: SAVE_VERSION,
  };
  const payload: GameState = { ...state, version: SAVE_VERSION, savedAt };
  if (s) {
    s.setItem(PREFIX + slot, JSON.stringify(payload));
    const idx = readIndex(s);
    idx.slots = idx.slots.filter((x) => x.slot !== slot);
    idx.slots.push(meta);
    s.setItem(INDEX_KEY, JSON.stringify(idx));
  }
  return meta;
}

export function autosave(state: GameState): SaveSlotMeta {
  return saveGame(AUTOSAVE_SLOT, state);
}

export function loadGame(slot: string): GameState | null {
  const s = storage();
  if (!s) return null;
  const raw = s.getItem(PREFIX + slot);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as GameState;
    return migrate(data);
  } catch (e) {
    console.error('[save] corrupt slot', slot, e);
    return null;
  }
}

export function deleteSave(slot: string): void {
  const s = storage();
  if (!s) return;
  s.removeItem(PREFIX + slot);
  const idx = readIndex(s);
  idx.slots = idx.slots.filter((x) => x.slot !== slot);
  s.setItem(INDEX_KEY, JSON.stringify(idx));
}

export function exportSave(state: GameState): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function importSave(code: string): GameState | null {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    return migrate(JSON.parse(json) as GameState);
  } catch {
    return null;
  }
}

function readIndex(s: Storage): SaveIndex {
  try {
    return JSON.parse(s.getItem(INDEX_KEY) ?? '{"slots":[]}') as SaveIndex;
  } catch {
    return { slots: [] };
  }
}

// --- migrations -----------------------------------------------------------

function migrate(data: GameState): GameState {
  let s = data;
  if ((s.version ?? 0) < 2) s = migrateTo2(s);
  if ((s.version ?? 0) < 3) s = migrateTo3(s);
  s.version = SAVE_VERSION;
  return s;
}

function migrateTo2(s: GameState): GameState {
  // v1 -> v2: introduced thoughts[] and knownClues[].
  return { ...s, thoughts: s.thoughts ?? [], knownClues: s.knownClues ?? [], version: 2 };
}

const SETTINGS_FALLBACK = {
  locale: 'en',
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  reducedMotion: false,
  highContrast: false,
  dyslexiaFont: false,
  textScale: 1,
  revealHiddenChecks: false,
  noFailState: false,
} as const;

function migrateTo3(s: GameState): GameState {
  // v2 -> v3: introduced journal[] and richer settings.
  return {
    ...s,
    journal: s.journal ?? [],
    settings: { ...SETTINGS_FALLBACK, ...(s.settings ?? {}) },
    version: 3,
  };
}

// --- optional cloud sync (server/) ---------------------------------------

export async function pushCloud(slot: string, state: GameState): Promise<boolean> {
  try {
    const res = await fetch(`/api/saves/${encodeURIComponent(slot)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(state),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullCloud(slot: string): Promise<GameState | null> {
  try {
    const res = await fetch(`/api/saves/${encodeURIComponent(slot)}`);
    if (!res.ok) return null;
    return migrate((await res.json()) as GameState);
  } catch {
    return null;
  }
}

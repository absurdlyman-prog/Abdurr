import type { AttributeRuntimeState } from './attributes';
import type { CaseProgress } from './investigation';
import type { NpcRuntimeState } from './character';
import type { ThoughtSlotState } from './thoughts';

// Serializable save state. The whole game is reconstructable from this object.
// Versioned so migrations can run on load (see systems/save/SaveSystem).

export const SAVE_VERSION = 3;

export interface VitalsState {
  /** Morale ("Composure pool"). At 0 → a Composure death/blackout. */
  morale: number;
  moraleMax: number;
  /** Endurance ("Instinct pool"). At 0 → an Instinct death/collapse. */
  endurance: number;
  enduranceMax: number;
}

export interface ClockState {
  /** Total in-game minutes elapsed since the game began (00:00 of day 1 = 0). */
  minutes: number;
  day: number;
}

export interface PlayerProfileState {
  name: string;
  /** Self-chosen archetype that pre-seeds attributes and a starting thought. */
  archetype: string;
  pronoun: 'he' | 'she' | 'they';
}

export interface GameState {
  version: number;
  profile: PlayerProfileState;
  attributes: AttributeRuntimeState;
  vitals: VitalsState;
  clock: ClockState;
  /** Skill XP; thresholds award skill points (see systems/attributes). */
  xp: number;
  skillPoints: number;
  /** Arbitrary world flags & counters set by dialogue/quests. */
  flags: Record<string, number | string | boolean>;
  /** Item id -> count. */
  inventory: Record<string, number>;
  /** Faction id -> reputation, -100..100. */
  reputation: Record<string, number>;
  /** Case id -> progress. */
  cases: Record<string, CaseProgress>;
  /** Character id -> runtime (relationship, memories, location). */
  npcs: Record<string, NpcRuntimeState>;
  thoughts: ThoughtSlotState[];
  /** Current scene + player tile. */
  location: { scene: string; x: number; y: number };
  /** Node ids the player has already visited (for `visited` conditions). */
  seenNodes: string[];
  /** Clues learned across all cases (denormalized for fast condition checks). */
  knownClues: string[];
  /** Free-text journal entries for the quest log. */
  journal: JournalEntry[];
  /** RNG seed so skill checks are reproducible across save/load. */
  rngSeed: number;
  /** Player-facing settings persisted with the save. */
  settings: SettingsState;
  /** When this save was written (ISO). */
  savedAt?: string;
}

export interface JournalEntry {
  id: string;
  day: number;
  minute: number;
  title: string;
  body: string;
  caseId?: string;
}

export interface SettingsState {
  locale: string;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  /** Accessibility. */
  reducedMotion: boolean;
  highContrast: boolean;
  dyslexiaFont: boolean;
  textScale: number; // 0.8..1.6
  /** Auto-resolve hidden checks vs. always show them (accessibility/clarity). */
  revealHiddenChecks: boolean;
  /** Slow down or remove timed pressure. */
  noFailState: boolean;
}

export interface SaveSlotMeta {
  slot: string;
  name: string;
  day: number;
  minute: number;
  scene: string;
  savedAt: string;
  version: number;
}

import type { Condition, NpcMemorySeed } from './dialogue';

// NPC model. NPCs have portraits, factions, daily schedules, and a memory log
// that dialogue effects write to and reaction rules read from. The NPC AI layer
// (systems/npc) advances schedules with the clock and evolves relationships.

export interface PortraitSpec {
  /** Base portrait key. Emotions are overlays/variants. */
  base: string;
  /** Palette tints for the painterly portrait frame. */
  frame?: string;
  emotions?: Record<string, string>;
}

export interface ScheduleSlot {
  /** Minutes from day-start (0 = 06:00 in-world) this slot begins. */
  fromMinute: number;
  /** Scene the NPC occupies during this slot. */
  scene: string;
  /** Hotspot/tile they stand at. */
  at: { x: number; y: number };
  /** Short activity label for flavor & the "where are they now" UI. */
  activity: string;
  /** Optional condition: schedule branch only applies if it holds. */
  when?: Condition;
}

export interface ReactionRule {
  /** When this memory kind/sentiment is present, override the entry node. */
  whenMemoryKind?: NpcMemorySeed['kind'];
  whenSentimentBelow?: number;
  whenSentimentAbove?: number;
  whenFlag?: string;
  /** Dialogue node to jump to instead of the default start. */
  gotoNode: string;
}

export interface CharacterDef {
  id: string;
  name: string;
  /** Public role / how they are first labelled to the player. */
  role: string;
  faction?: string;
  portrait: PortraitSpec;
  /** Default dialogue id. */
  dialogue?: string;
  schedule?: ScheduleSlot[];
  /** Rules that re-route conversation based on memory/flags. */
  reactions?: ReactionRule[];
  /** Color used for this character's name in dialogue. */
  nameColor?: string;
  /** A short bio for the codex. */
  bio?: string;
}

export interface NpcMemory extends NpcMemorySeed {
  /** In-game minute it was formed (for decay/recency weighting). */
  at: number;
}

export interface NpcRuntimeState {
  characterId: string;
  /** Running relationship score with the player, -100..100. */
  relationship: number;
  memories: NpcMemory[];
  /** Current scene + tile, advanced by the schedule system. */
  location?: { scene: string; x: number; y: number };
}

import type { CharacterDef, GameState, ScheduleSlot } from '../../types';
import { Content } from '../../content';
import { evalCondition } from '../dialogue/conditions';
import { getNpc } from '../memory/MemorySystem';

// Daily-schedule AI. NPCs move through the city on a clock. Given the current
// in-game minute-of-day, we pick the latest slot whose `fromMinute` has passed
// and whose optional condition holds. This makes "where is the witness right
// now?" a real, answerable question and lets the world feel inhabited.

export function minuteOfDay(state: GameState): number {
  return state.clock.minutes % (24 * 60);
}

/** The slot an NPC is currently in, or undefined if they have no schedule. */
export function currentSlot(state: GameState, def: CharacterDef): ScheduleSlot | undefined {
  if (!def.schedule?.length) return undefined;
  const t = minuteOfDay(state);
  const eligible = def.schedule
    .filter((s) => s.fromMinute <= t)
    .filter((s) => !s.when || evalCondition(state, s.when))
    .sort((a, b) => a.fromMinute - b.fromMinute);
  // If nothing has started yet today, wrap to the last slot of "yesterday".
  return eligible.at(-1) ?? def.schedule.at(-1);
}

/** Recompute every scheduled NPC's location for the current time. */
export function tickSchedules(state: GameState): void {
  for (const def of Content.characters) {
    const slot = currentSlot(state, def);
    if (!slot) continue;
    const npc = getNpc(state, def.id);
    npc.location = { scene: slot.scene, x: slot.at.x, y: slot.at.y };
  }
}

/** All NPCs physically present in a given scene right now (for hotspot spawn). */
export function npcsInScene(state: GameState, sceneId: string): CharacterDef[] {
  const out: CharacterDef[] = [];
  for (const def of Content.characters) {
    const slot = currentSlot(state, def);
    if (slot?.scene === sceneId) out.push(def);
  }
  return out;
}

/** Human-readable "last seen" answer for the codex / case board. */
export function whereIs(state: GameState, characterId: string): string {
  const def = Content.character(characterId);
  if (!def) return 'Unknown';
  const slot = currentSlot(state, def);
  if (!slot) return 'Whereabouts unknown';
  const scene = Content.scene(slot.scene);
  return `${slot.activity} — ${scene?.name ?? slot.scene}`;
}

import type { AttributeId, AttributeRuntimeState, AttributeScores, GameState } from '../types';
import { ATTRIBUTE_IDS } from '../types';
import { Content } from '../content';

// Attribute math: effective scores (base + active modifiers), XP/level
// thresholds, and the starting-state factory used by character creation.

export const ATTR_MIN = 1;
export const ATTR_MAX = 8;

/** Effective value of one attribute = base + sum of non-expired modifiers, clamped. */
export function effectiveAttr(state: GameState, attr: AttributeId): number {
  const base = state.attributes.base[attr] ?? 1;
  const mods = state.attributes.modifiers
    .filter((m) => m.attribute === attr)
    .filter((m) => m.expiresAt === undefined || m.expiresAt > state.clock.minutes)
    .reduce((sum, m) => sum + m.value, 0);
  return clamp(base + mods, 0, ATTR_MAX + 6);
}

/** Snapshot of all eight effective values — handy for the character sheet / voices. */
export function effectiveAll(state: GameState): AttributeScores {
  const out = {} as AttributeScores;
  for (const id of ATTRIBUTE_IDS) out[id] = effectiveAttr(state, id);
  return out;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** XP needed to earn the Nth skill point. Gentle early, steeper later. */
export function xpForNextPoint(pointsSpent: number): number {
  return 50 + pointsSpent * 25;
}

/** Given total xp and points already granted, how many new points are owed. */
export function pointsOwed(xp: number, alreadyGranted: number): number {
  let granted = 0;
  let needed = 0;
  while (true) {
    needed += xpForNextPoint(alreadyGranted + granted);
    if (xp >= needed) granted += 1;
    else break;
  }
  return granted;
}

export function makeAttributeState(scores: Partial<AttributeScores>): AttributeRuntimeState {
  const base = {} as AttributeScores;
  for (const id of ATTRIBUTE_IDS) base[id] = clamp(scores[id] ?? 1, ATTR_MIN, ATTR_MAX);
  return { base, modifiers: [] };
}

/** Pretty data for one attribute, merging static def + live value. */
export function attrCardData(state: GameState, attr: AttributeId) {
  const def = Content.attribute(attr)!;
  return {
    ...def,
    base: state.attributes.base[attr],
    effective: effectiveAttr(state, attr),
  };
}

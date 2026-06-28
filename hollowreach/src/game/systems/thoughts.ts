import type { GameState } from '../types';
import { Content } from '../content';
import type { GameEvent } from './dialogue/effects';

// Thought-cabinet lifecycle. Forming thoughts apply their penalties as live
// attribute modifiers; once enough in-game time has elapsed they internalize,
// swapping penalties for permanent bonuses and setting their flags. Call
// `tickThoughts` whenever the clock advances.

export function applyThoughtModifiers(state: GameState): void {
  // Rebuild thought-sourced modifiers from scratch each tick so we never
  // double-apply across saves/loads.
  state.attributes.modifiers = state.attributes.modifiers.filter((m) => !m.source.startsWith('thought:'));
  for (const slot of state.thoughts) {
    const def = Content.thought(slot.thoughtId);
    if (!def) continue;
    const mods = slot.status === 'forming' ? def.whileForming : def.whenInternalized;
    for (const m of mods ?? []) {
      state.attributes.modifiers.push({ source: `thought:${slot.thoughtId}:${m.attribute}`, ...m });
    }
  }
}

export function tickThoughts(state: GameState): GameEvent[] {
  const events: GameEvent[] = [];
  for (const slot of state.thoughts) {
    if (slot.status !== 'forming') continue;
    const def = Content.thought(slot.thoughtId);
    if (!def) continue;
    if (state.clock.minutes - slot.slottedAt >= def.formMinutes) {
      slot.status = 'internalized';
      for (const f of def.grantsFlags ?? []) state.flags[f] = true;
      events.push({ kind: 'thought', message: `Thought internalized: ${def.name}`, data: { id: def.id } });
    }
  }
  applyThoughtModifiers(state);
  return events;
}

/** Fraction 0..1 of how far a forming thought has progressed. */
export function thoughtProgress(state: GameState, thoughtId: string): number {
  const slot = state.thoughts.find((t) => t.thoughtId === thoughtId);
  const def = Content.thought(thoughtId);
  if (!slot || !def) return 0;
  if (slot.status === 'internalized') return 1;
  return Math.min(1, (state.clock.minutes - slot.slottedAt) / def.formMinutes);
}

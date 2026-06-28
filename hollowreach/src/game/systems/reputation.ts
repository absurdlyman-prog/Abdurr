import type { GameState } from '../types';
import { Content } from '../content';
import type { GameEvent } from './dialogue/effects';

// Reputation with spillover. Helping a faction nudges its allies up and its
// rivals down, so the political web reacts to your choices the way DE's
// communities do — you cannot please the Guild and the Reclamation Office both.

const SPILLOVER = 0.4;

export function reputation(state: GameState, factionId: string): number {
  return state.reputation[factionId] ?? 0;
}

export function adjustReputation(state: GameState, factionId: string, delta: number): GameEvent[] {
  const events: GameEvent[] = [];
  const faction = Content.faction(factionId);
  apply(state, factionId, delta);
  events.push({
    kind: 'rep',
    message: `${faction?.name ?? factionId}: ${delta >= 0 ? '+' : ''}${delta} standing`,
    data: { factionId, delta },
  });

  if (faction) {
    for (const ally of faction.allies ?? []) apply(state, ally, Math.round(delta * SPILLOVER));
    for (const rival of faction.rivals ?? []) apply(state, rival, Math.round(-delta * SPILLOVER));
  }
  return events;
}

function apply(state: GameState, factionId: string, delta: number): void {
  if (delta === 0) return;
  const cur = state.reputation[factionId] ?? 0;
  state.reputation[factionId] = Math.max(-100, Math.min(100, cur + delta));
}

/** Coarse standing band used by dialogue tone and NPC greetings. */
export function standingBand(value: number): 'hostile' | 'wary' | 'neutral' | 'friendly' | 'devoted' {
  if (value <= -50) return 'hostile';
  if (value <= -15) return 'wary';
  if (value < 15) return 'neutral';
  if (value < 50) return 'friendly';
  return 'devoted';
}

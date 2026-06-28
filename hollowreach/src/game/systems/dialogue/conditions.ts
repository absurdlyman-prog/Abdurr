import type { Condition, GameState } from '../../types';
import { effectiveAttr } from '../attributes';

// Pure predicate evaluation for dialogue/scene conditions. No side effects —
// safe to call while rendering to grey out locked options.

export function evalCondition(state: GameState, c: Condition): boolean {
  switch (c.op) {
    case 'flag':
      return truthy(state.flags[str(c.key)]);
    case '!flag':
      return !truthy(state.flags[str(c.key)]);
    case 'flagEquals':
      return state.flags[str(c.key)] === c.value;
    case 'attrAtLeast':
      return effectiveAttr(state, c.key as any) >= num(c.value);
    case 'attrBelow':
      return effectiveAttr(state, c.key as any) < num(c.value);
    case 'hasItem':
      return (state.inventory[str(c.key)] ?? 0) > 0;
    case 'hasThought':
      return state.thoughts.some((t) => t.thoughtId === c.key && t.status === 'internalized');
    case 'repAtLeast':
      return (state.reputation[str(c.key)] ?? 0) >= num(c.value);
    case 'repBelow':
      return (state.reputation[str(c.key)] ?? 0) < num(c.value);
    case 'knows':
      return state.knownClues.includes(str(c.key));
    case 'visited':
      return state.seenNodes.includes(str(c.key));
    case 'timeAfter':
      return state.clock.minutes >= num(c.value);
    case 'timeBefore':
      return state.clock.minutes < num(c.value);
    case 'chance':
      // Deterministic-ish: derived from seed so re-render doesn't reshuffle.
      return pseudo(state.rngSeed, str(c.key)) < num(c.value);
    default:
      return false;
  }
}

export function evalAll(state: GameState, conditions?: Condition[]): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((c) => evalCondition(state, c));
}

/** Human-readable reason an option is locked, for the greyed-out tooltip. */
export function lockReason(state: GameState, conditions?: Condition[]): string | null {
  if (!conditions) return null;
  for (const c of conditions) {
    if (!evalCondition(state, c)) return describe(c);
  }
  return null;
}

function describe(c: Condition): string {
  switch (c.op) {
    case 'attrAtLeast':
      return `${cap(String(c.key))} ${c.value}+ required`;
    case 'attrBelow':
      return `Only with ${cap(String(c.key))} below ${c.value}`;
    case 'hasItem':
      return `Requires an item you don't have`;
    case 'hasThought':
      return `Requires a thought you haven't internalized`;
    case 'knows':
      return `You don't know enough yet`;
    case 'repAtLeast':
      return `Requires standing with a faction`;
    case 'flag':
    case 'flagEquals':
      return `Something must happen first`;
    default:
      return `Locked`;
  }
}

const truthy = (v: unknown) => v !== undefined && v !== false && v !== 0 && v !== '';
const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);
const str = (v: unknown) => (v == null ? '' : String(v));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function pseudo(seed: number, salt: string): number {
  let h = seed >>> 0;
  for (let i = 0; i < salt.length; i++) h = (Math.imul(h ^ salt.charCodeAt(i), 0x01000193) >>> 0);
  return (h % 1000) / 1000;
}

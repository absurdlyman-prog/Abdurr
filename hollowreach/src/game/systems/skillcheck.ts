import type { GameState, SkillCheck, CheckModifier, Condition } from '../types';
import { effectiveAttr } from './attributes';
import { roll2d6, type RngState } from './rng';
import { evalCondition } from './dialogue/conditions';

// Skill-check resolution. HOLLOWREACH uses 2d6 + effective attribute vs. a
// difficulty class.
//   - "1,1" (snake eyes) is an automatic failure; "6,6" an automatic success —
//     so no check is ever truly impossible or truly safe.
//   - White checks may be retried after you've grown (new thought, item, level).
//   - Red checks are one-shot: the seed is consumed and the failure is permanent.

export interface CheckBreakdownItem {
  label: string;
  value: number;
}

export interface CheckOutcome {
  success: boolean;
  /** The two dice rolled. */
  dice: [number, number];
  /** Sum of dice. */
  roll: number;
  /** Effective attribute used. */
  attrValue: number;
  /** Final difficulty class after situational modifiers. */
  finalDc: number;
  /** Total = roll + attrValue. */
  total: number;
  critical: 'success' | 'failure' | null;
  breakdown: CheckBreakdownItem[];
}

/** Resolve the situational modifiers a player can see before committing. */
export function resolveModifiers(state: GameState, mods: CheckModifier[] | undefined): CheckBreakdownItem[] {
  if (!mods) return [];
  const out: CheckBreakdownItem[] = [];
  for (const m of mods) {
    if (m.when && !evalCondition(state, m.when)) continue;
    out.push({ label: m.label, value: m.value });
  }
  return out;
}

/** Probability of success, for the UI's percentage readout (DE-style). */
export function successOdds(state: GameState, check: SkillCheck): number {
  const attrValue = effectiveAttr(state, check.attribute);
  const situational = resolveModifiers(state, check.modifiers).reduce((s, m) => s + m.value, 0);
  const finalDc = check.dc - situational;
  // Need roll >= finalDc - attrValue, where roll is 2d6 (2..12).
  const need = finalDc - attrValue;
  let ways = 0;
  for (let a = 1; a <= 6; a++)
    for (let b = 1; b <= 6; b++) {
      const sum = a + b;
      const crit = (a === 1 && b === 1) ? 'fail' : (a === 6 && b === 6) ? 'succ' : null;
      if (crit === 'succ') ways++;
      else if (crit === 'fail') continue;
      else if (sum >= need) ways++;
    }
  return ways / 36;
}

export function resolveCheck(state: GameState, check: SkillCheck, rng: RngState): CheckOutcome {
  const attrValue = effectiveAttr(state, check.attribute);
  const situational = resolveModifiers(state, check.modifiers);
  const situationalTotal = situational.reduce((s, m) => s + m.value, 0);
  const finalDc = check.dc - situationalTotal;

  const dice = roll2d6(rng);
  const roll = dice[0] + dice[1];
  const total = roll + attrValue;

  let critical: CheckOutcome['critical'] = null;
  let success: boolean;
  if (dice[0] === 6 && dice[1] === 6) {
    critical = 'success';
    success = true;
  } else if (dice[0] === 1 && dice[1] === 1) {
    critical = 'failure';
    success = false;
  } else {
    success = total >= finalDc;
  }

  const breakdown: CheckBreakdownItem[] = [
    { label: '2d6', value: roll },
    { label: Content_attrName(check.attribute), value: attrValue },
    ...situational,
  ];

  return { success, dice, roll, attrValue, finalDc, total, critical, breakdown };
}

// Tiny local helper to avoid a circular import on Content for just the name.
function Content_attrName(attr: string): string {
  const map: Record<string, string> = {
    logic: 'Logic',
    empathy: 'Empathy',
    intuition: 'Intuition',
    authority: 'Authority',
    creativity: 'Creativity',
    perception: 'Perception',
    composure: 'Composure',
    instinct: 'Instinct',
  };
  return map[attr] ?? attr;
}

/** A white check is retryable if the player's relevant power has changed since last attempt. */
export function isRetryable(check: SkillCheck): boolean {
  return check.kind === 'white';
}

/** Whether a passive (hidden) check's condition gate is met for auto-resolution. */
export function passiveGateMet(state: GameState, gate?: Condition): boolean {
  return gate ? evalCondition(state, gate) : true;
}

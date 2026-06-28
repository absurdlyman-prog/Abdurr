import type { Effect, GameState, NpcMemory } from '../../types';
import { Content } from '../../content';
import { pointsOwed, xpForNextPoint } from '../attributes';
import { adjustReputation } from '../reputation';

// Effect application. Effects mutate a draft GameState (we operate on a cloned
// draft in the store) and emit GameEvents that the UI/audio layers consume
// (toasts, stingers, "+1 Logic" floaters, case-board flashes).

export interface GameEvent {
  kind:
    | 'flag'
    | 'item'
    | 'thought'
    | 'clue'
    | 'rep'
    | 'memory'
    | 'xp'
    | 'levelup'
    | 'vitals'
    | 'time'
    | 'case'
    | 'contradiction'
    | 'stinger'
    | 'unlock';
  message: string;
  data?: Record<string, unknown>;
}

export function applyEffects(state: GameState, effects: Effect[] | undefined): GameEvent[] {
  const events: GameEvent[] = [];
  if (!effects) return events;
  for (const e of effects) events.push(...applyEffect(state, e));
  return events;
}

function applyEffect(state: GameState, e: Effect): GameEvent[] {
  const events: GameEvent[] = [];
  switch (e.op) {
    case 'setFlag':
      state.flags[key(e)] = e.value ?? true;
      break;
    case 'incFlag': {
      const cur = Number(state.flags[key(e)] ?? 0);
      state.flags[key(e)] = cur + Number(e.value ?? 1);
      break;
    }
    case 'giveItem': {
      const id = key(e);
      state.inventory[id] = (state.inventory[id] ?? 0) + Number(e.value ?? 1);
      const item = Content.item(id);
      events.push({ kind: 'item', message: `Obtained: ${item?.name ?? id}`, data: { id } });
      break;
    }
    case 'takeItem': {
      const id = key(e);
      const n = (state.inventory[id] ?? 0) - Number(e.value ?? 1);
      if (n > 0) state.inventory[id] = n;
      else delete state.inventory[id];
      break;
    }
    case 'addThought': {
      const id = key(e);
      if (!state.thoughts.some((t) => t.thoughtId === id)) {
        state.thoughts.push({ thoughtId: id, status: 'forming', slottedAt: state.clock.minutes });
        const t = Content.thought(id);
        events.push({ kind: 'thought', message: `A thought takes hold: ${t?.name ?? id}`, data: { id } });
      }
      break;
    }
    case 'internalizeThought': {
      const id = key(e);
      const slot = state.thoughts.find((t) => t.thoughtId === id);
      if (slot) slot.status = 'internalized';
      break;
    }
    case 'rep': {
      const evs = adjustReputation(state, key(e), Number(e.value ?? 0));
      events.push(...evs);
      break;
    }
    case 'learnClue': {
      const id = key(e);
      if (!state.knownClues.includes(id)) {
        state.knownClues.push(id);
        // Mirror into any open case that owns the clue.
        for (const cp of Object.values(state.cases)) {
          const cdef = Content.case(cp.caseId);
          if (cdef?.clues.some((c) => c.id === id) && !cp.knownClues.includes(id)) cp.knownClues.push(id);
        }
        events.push({ kind: 'clue', message: `New evidence logged.`, data: { id } });
      }
      break;
    }
    case 'addContradiction': {
      events.push({ kind: 'contradiction', message: `Something doesn't add up.`, data: { id: key(e) } });
      break;
    }
    case 'remember': {
      if (e.who && e.memory) {
        const npc = ensureNpc(state, e.who);
        const mem: NpcMemory = { ...e.memory, at: state.clock.minutes };
        if (!npc.memories.some((m) => m.id === mem.id)) {
          npc.memories.push(mem);
          npc.relationship = clampRel(npc.relationship + mem.sentiment * 5);
          events.push({ kind: 'memory', message: `They'll remember that.`, data: { who: e.who } });
        }
      }
      break;
    }
    case 'xp': {
      const before = state.skillPoints;
      const spentBaseline = totalPointsGranted(state);
      state.xp += Number(e.value ?? 0);
      const owed = pointsOwed(state.xp, spentBaseline);
      if (owed > 0) {
        state.skillPoints += owed;
        state.flags['__pointsGranted'] = spentBaseline + owed;
        events.push({
          kind: 'levelup',
          message: owed === 1 ? `You've learned something. (+1 skill point)` : `+${owed} skill points`,
          data: { points: owed, next: xpForNextPoint(spentBaseline + owed) },
        });
      }
      events.push({ kind: 'xp', message: `+${e.value} XP`, data: { before } });
      break;
    }
    case 'health': {
      const v = Number(e.value ?? 0);
      // Negative = damage. We split arbitrary "health" into morale by default.
      state.vitals.morale = clampVital(state.vitals.morale + v, state.vitals.moraleMax);
      events.push({ kind: 'vitals', message: v < 0 ? `That hurt.` : `You steady yourself.`, data: { morale: v } });
      break;
    }
    case 'advanceTime': {
      advanceClock(state, Number(e.value ?? 0));
      events.push({ kind: 'time', message: `Time passes.`, data: { minutes: e.value } });
      break;
    }
    case 'startCase': {
      const id = key(e);
      if (!state.cases[id]) {
        state.cases[id] = { caseId: id, knownClues: [], resolvedContradictions: [], closed: false };
        const cdef = Content.case(id);
        events.push({ kind: 'case', message: `New case: ${cdef?.title ?? id}`, data: { id } });
      }
      break;
    }
    case 'closeCase': {
      const id = key(e);
      if (state.cases[id]) state.cases[id].closed = true;
      break;
    }
    case 'unlockNode':
      events.push({ kind: 'unlock', message: ``, data: { node: key(e) } });
      break;
    case 'playStinger':
      events.push({ kind: 'stinger', message: ``, data: { cue: key(e) } });
      break;
  }
  return events;
}

export function advanceClock(state: GameState, minutes: number): void {
  state.clock.minutes += minutes;
  while (state.clock.minutes >= 24 * 60) {
    state.clock.minutes -= 24 * 60;
    state.clock.day += 1;
  }
}

function ensureNpc(state: GameState, id: string) {
  if (!state.npcs[id]) state.npcs[id] = { characterId: id, relationship: 0, memories: [] };
  return state.npcs[id];
}

/** Reconstruct how many points have already been granted (spent + unspent). */
function totalPointsGranted(state: GameState): number {
  // base started at archetype sum; granted points = current available + spent.
  // We track spent implicitly: every base point above the archetype baseline.
  // Simpler: store grantedPoints in flags.
  return Number(state.flags['__pointsGranted'] ?? 0);
}

const key = (e: Effect) => String(e.key ?? '');
const clampRel = (n: number) => Math.max(-100, Math.min(100, n));
const clampVital = (n: number, max: number) => Math.max(0, Math.min(max, n));

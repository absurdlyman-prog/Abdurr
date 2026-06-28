import type { AttributeScores, GameState, PlayerProfileState, SettingsState } from './types';
import { ATTRIBUTE_IDS } from './types';
import { Content, type Archetype } from './content';
import { makeAttributeState } from './systems/attributes';
import { createSeed } from './systems/rng';
import { applyEffects } from './systems/dialogue/effects';

// New-game construction. Turns an archetype + optional point reallocation into a
// fully-formed GameState, seeds the opening case and starting thought, and drops
// the detective on the dawn quay where the body was found.

export const STARTING_SCENE = 'quay_dawn';
export const OPENING_DIALOGUE = 'intro';

export function defaultSettings(): SettingsState {
  return {
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
  };
}

export interface NewGameOptions {
  name: string;
  pronoun: PlayerProfileState['pronoun'];
  archetypeId: string;
  /** Override attribute spread (used by free-allocation archetype). */
  attributes?: Partial<AttributeScores>;
  settings?: SettingsState;
}

export function createNewGame(opts: NewGameOptions): GameState {
  const archetype = Content.archetype(opts.archetypeId) ?? fallbackArchetype();
  const scores = opts.attributes ?? (archetype.attributes as AttributeScores);

  const state: GameState = {
    version: 3,
    profile: { name: opts.name || 'The Hollow Man', archetype: archetype.id, pronoun: opts.pronoun },
    attributes: makeAttributeState(scores),
    vitals: { morale: 4, moraleMax: 4, endurance: 4, enduranceMax: 4 },
    clock: { minutes: 6 * 60, day: 1 }, // dawn of day one
    xp: 0,
    skillPoints: 0,
    flags: { __pointsGranted: 0 },
    inventory: {},
    reputation: {},
    cases: {},
    npcs: {},
    thoughts: [],
    location: { scene: STARTING_SCENE, x: 6, y: 6 },
    seenNodes: [],
    knownClues: [],
    journal: [],
    rngSeed: createSeed(),
    settings: opts.settings ?? defaultSettings(),
  };

  // Vitals scale a little with the relevant psyche/physique voices.
  state.vitals.moraleMax = 3 + Math.ceil(state.attributes.base.composure / 2);
  state.vitals.morale = state.vitals.moraleMax;
  state.vitals.enduranceMax = 3 + Math.ceil(state.attributes.base.instinct / 2);
  state.vitals.endurance = state.vitals.enduranceMax;

  // Starting items.
  for (const itemId of archetype.startingItems ?? []) {
    state.inventory[itemId] = (state.inventory[itemId] ?? 0) + 1;
  }

  // Starting thought (forming).
  if (archetype.startingThought) {
    applyEffects(state, [{ op: 'addThought', key: archetype.startingThought }]);
  }

  // Seed the opening case.
  applyEffects(state, [{ op: 'startCase', key: 'drowned_clerk' }]);

  state.journal.push({
    id: 'j_open',
    day: 1,
    minute: state.clock.minutes,
    title: 'A body on the quay',
    body: 'You woke on the boards of the Drowned Quarter quay with no memory of the night and a dead man ten feet away. The Mutual found you both at dawn. They think you are the Watch. You are not sure they are wrong.',
    caseId: 'drowned_clerk',
  });

  return state;
}

/** Validate a free-allocation spread: 24 total points, each 1..6. */
export function validateAllocation(scores: Partial<AttributeScores>): { ok: boolean; total: number; reason?: string } {
  let total = 0;
  for (const id of ATTRIBUTE_IDS) {
    const v = scores[id] ?? 1;
    if (v < 1 || v > 6) return { ok: false, total, reason: `${id} must be 1–6` };
    total += v;
  }
  const BUDGET = 24;
  if (total !== BUDGET) return { ok: false, total, reason: `Spend exactly ${BUDGET} points (you have ${total}).` };
  return { ok: true, total };
}

function fallbackArchetype(): Archetype {
  return {
    id: 'blank_slate',
    name: 'The Hollow Man',
    blurb: '',
    attributes: { logic: 3, empathy: 3, intuition: 3, authority: 3, creativity: 3, perception: 3, composure: 3, instinct: 3 },
    startingThought: 'who_was_i',
    startingItems: ['case_notebook'],
    freeAllocation: true,
  };
}

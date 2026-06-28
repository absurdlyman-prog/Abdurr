import type { AttributeModifier } from './attributes';

// The Mind Reliquary — HOLLOWREACH's "thought cabinet".
//
// Ideas the protagonist fixates on can be slotted to "internalize" over in-game
// time. While forming, a thought applies a (usually negative) modifier; once
// internalized it grants a permanent bonus and unlocks dialogue. Thoughts are
// the game's roguelike-of-the-mind: which ideas you let take root reshape who
// the detective becomes.

export interface ThoughtDef {
  id: string;
  name: string;
  /** Flavor shown on the slot while forming. */
  premise: string;
  /** Payoff text shown once internalized. */
  conclusion: string;
  /** In-game minutes required to internalize while slotted. */
  formMinutes: number;
  /** Penalties applied while the thought is forming. */
  whileForming?: Omit<AttributeModifier, 'source'>[];
  /** Permanent bonuses once internalized. */
  whenInternalized?: Omit<AttributeModifier, 'source'>[];
  /** Flags set when internalized (gate dialogue, endings). */
  grantsFlags?: string[];
  /** How the thought first appears (flag/clue/dialogue effect references this). */
  category: 'trauma' | 'ideology' | 'craft' | 'vice' | 'revelation';
}

export interface ThoughtSlotState {
  thoughtId: string;
  status: 'forming' | 'internalized';
  /** In-game minute the thought was slotted. */
  slottedAt: number;
}

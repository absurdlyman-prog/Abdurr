// The eight inner voices of HOLLOWREACH.
//
// Unlike traditional RPG stats, each attribute is a *character* that lives in
// the protagonist's skull. It has opinions, biases, and a voice. During play
// these speak unprompted (see systems/dialogue + ui/AttributeVoice), argue with
// each other, and gate skill checks.

export const ATTRIBUTE_IDS = [
  'logic',
  'empathy',
  'intuition',
  'authority',
  'creativity',
  'perception',
  'composure',
  'instinct',
] as const;

export type AttributeId = (typeof ATTRIBUTE_IDS)[number];

/** The four "clusters" the eight voices belong to, used for UI grouping and thematic checks. */
export type AttributeCluster = 'intellect' | 'psyche' | 'physique' | 'reflex';

export interface AttributeDef {
  id: AttributeId;
  /** Display name, e.g. "Logic". */
  name: string;
  cluster: AttributeCluster;
  /** One-line creed the voice lives by. */
  tagline: string;
  /** Long-form description shown in the character sheet. */
  description: string;
  /** What this voice is good at — surfaced as flavor in the sheet. */
  goodAt: string[];
  /** Where this voice leads you astray when over-leveled ("too much of a good thing"). */
  pitfall: string;
  /** Hex accent used for this voice's interjections and meters. */
  color: string;
  /** A short signature so dialogue lines feel like they come from a person. */
  voiceSignature: string;
}

/** A single point allocation per attribute, 1..6 in the base ruleset. */
export type AttributeScores = Record<AttributeId, number>;

export interface AttributeRuntimeState {
  base: AttributeScores;
  /** Temporary modifiers keyed by source id (thoughts, items, substances, wounds). */
  modifiers: AttributeModifier[];
}

export interface AttributeModifier {
  /** Unique source id so the same buff is not double-applied. */
  source: string;
  attribute: AttributeId;
  value: number;
  /** Human-readable reason shown in tooltips. */
  reason: string;
  /** Optional in-game time (minutes) at which this modifier expires. */
  expiresAt?: number;
}

// Investigation / case model. A Case is a board of Clues, Suspects, and
// Contradictions, plus a set of Theories (solution paths). The deduction system
// lets the player link clues to suspects to form a theory; no case is single-
// solution — each has multiple internally-consistent Theories that the world
// reacts to differently (see content/cases/*.json).

export interface Clue {
  id: string;
  title: string;
  /** What the player wrote in their notebook. */
  detail: string;
  /** Where it was found (scene id) — for the case-board map pins. */
  source?: string;
  /** Tags used by deduction rules: "physical", "testimony", "financial"… */
  tags: string[];
  /** Some clues are only "physical evidence" if a check was passed. */
  reliability: 'hard' | 'soft' | 'rumor';
}

export interface Suspect {
  id: string;
  /** Character id this suspect maps to. */
  characterId: string;
  name: string;
  motiveSketch: string;
  alibi?: string;
}

export interface Contradiction {
  id: string;
  /** Plain text the case board displays in red thread. */
  statement: string;
  /** Two clue/testimony ids that conflict. */
  between: [string, string];
  /** Resolving it (linking the right clue) advances the case. */
  resolvesTo?: string;
}

export interface Theory {
  id: string;
  title: string;
  /** Narrative summary of "who did it / what happened" under this theory. */
  summary: string;
  /** Clue ids that must be known for the theory to be *available*. */
  requires: string[];
  /** Clue ids that, if known, contradict / weaken this theory. */
  weakenedBy?: string[];
  /** The suspect this theory accuses (or "none"/"accident"). */
  accuses: string;
  /** Strength tier the theory can reach: how the ending reacts. */
  endingTag: string;
}

export interface CaseDef {
  id: string;
  title: string;
  /** One-paragraph briefing shown when the case opens. */
  briefing: string;
  clues: Clue[];
  suspects: Suspect[];
  contradictions: Contradiction[];
  theories: Theory[];
  /** Flag set when the case is formally closed with a chosen theory. */
  resolutionFlag: string;
}

export interface CaseProgress {
  caseId: string;
  knownClues: string[];
  resolvedContradictions: string[];
  /** Theory the player has committed to, if any. */
  committedTheory?: string;
  closed: boolean;
}

import type { CaseDef, GameState, Theory } from '../../types';
import { Content } from '../../content';

// Deduction engine. The case board lets the player commit to a Theory once its
// required clues are known. Crucially, multiple theories can be *available* at
// once — the game never tells you which is "true". Closing the case with a
// theory sets its ending tag, which the finale reads. Theories you have the
// evidence to contradict are flagged as "shaky", but you may still choose them
// (and live with the consequences).

export interface TheoryStatus {
  theory: Theory;
  available: boolean;
  shaky: boolean;
  /** Clue ids still missing to make it available. */
  missing: string[];
  /** Clue ids the player knows that weaken it. */
  weakening: string[];
}

export function caseProgress(state: GameState, caseId: string) {
  return state.cases[caseId];
}

export function knownClues(state: GameState, def: CaseDef): string[] {
  const cp = state.cases[def.id];
  if (!cp) return [];
  return def.clues.filter((c) => cp.knownClues.includes(c.id) || state.knownClues.includes(c.id)).map((c) => c.id);
}

export function theoryStatuses(state: GameState, def: CaseDef): TheoryStatus[] {
  const known = new Set(knownClues(state, def));
  return def.theories.map((theory) => {
    const missing = theory.requires.filter((r) => !known.has(r));
    const weakening = (theory.weakenedBy ?? []).filter((w) => known.has(w));
    return {
      theory,
      available: missing.length === 0,
      shaky: weakening.length > 0,
      missing,
      weakening,
    };
  });
}

export interface ContradictionStatus {
  id: string;
  statement: string;
  /** Both halves of the contradiction are known to the player. */
  active: boolean;
  resolved: boolean;
}

export function contradictionStatuses(state: GameState, def: CaseDef): ContradictionStatus[] {
  const cp = state.cases[def.id];
  const known = new Set(knownClues(state, def));
  return def.contradictions.map((c) => ({
    id: c.id,
    statement: c.statement,
    active: c.between.every((b) => known.has(b)),
    resolved: cp?.resolvedContradictions.includes(c.id) ?? false,
  }));
}

/** Commit to a theory. Returns whether it was accepted. */
export function commitTheory(state: GameState, def: CaseDef, theoryId: string): boolean {
  const cp = state.cases[def.id];
  if (!cp || cp.closed) return false;
  const status = theoryStatuses(state, def).find((t) => t.theory.id === theoryId);
  if (!status || !status.available) return false;
  cp.committedTheory = theoryId;
  cp.closed = true;
  state.flags[def.resolutionFlag] = theoryId;
  // The ending tag is recorded so the finale and codex can branch on it.
  state.flags[`${def.id}__ending`] = status.theory.endingTag;
  state.flags[`${def.id}__shaky`] = status.shaky;
  return true;
}

/** Resolve a contradiction by linking the clue that explains it. */
export function resolveContradiction(state: GameState, def: CaseDef, contradictionId: string): boolean {
  const cp = state.cases[def.id];
  if (!cp) return false;
  const c = def.contradictions.find((x) => x.id === contradictionId);
  if (!c) return false;
  const known = new Set(knownClues(state, def));
  if (!c.between.every((b) => known.has(b))) return false;
  if (!cp.resolvedContradictions.includes(contradictionId)) cp.resolvedContradictions.push(contradictionId);
  if (c.resolvesTo && !cp.knownClues.includes(c.resolvesTo)) {
    cp.knownClues.push(c.resolvesTo);
    if (!state.knownClues.includes(c.resolvesTo)) state.knownClues.push(c.resolvesTo);
  }
  return true;
}

export function caseById(id: string): CaseDef | undefined {
  return Content.case(id);
}

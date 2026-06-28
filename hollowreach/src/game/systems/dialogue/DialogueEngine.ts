import type {
  Dialogue,
  DialogueNode,
  DialogueResponse,
  GameState,
  SkillCheck,
} from '../../types';
import { Content } from '../../content';
import { evalAll, lockReason } from './conditions';
import { applyEffects, type GameEvent } from './effects';
import { resolveCheck, resolveModifiers, successOdds, type CheckOutcome } from '../skillcheck';
import type { RngState } from '../rng';
import { resolveEntryNode } from '../memory/MemorySystem';

// The dialogue runner. Pure-ish: every mutating call takes the live GameState
// draft, mutates it, and returns descriptive results + a GameEvent[] the UI/
// audio layers render. The UI never touches raw nodes — it asks the engine for
// a NodeView and a list of ResponseViews.

export interface ResponseView {
  id: string;
  text: string;
  tone: DialogueResponse['tone'];
  locked: boolean;
  lockReason: string | null;
  once: boolean;
  /** Present if this option triggers a skill check. */
  check?: {
    label: string;
    attribute: SkillCheck['attribute'];
    kind: SkillCheck['kind'];
    dc: number;
    odds: number; // 0..1
    breakdown: { label: string; value: number }[];
  };
  exit: boolean;
}

export interface NodeView {
  dialogueId: string;
  nodeId: string;
  lines: DialogueNode['lines'];
  /** Extra lines injected by passed passive checks (attribute interjections). */
  passiveLines: DialogueNode['lines'];
  responses: ResponseView[];
}

export interface ChooseResult {
  events: GameEvent[];
  /** Next node id, or null to close the conversation. */
  nextNodeId: string | null;
  /** If the response carried a check, its resolved outcome. */
  check?: { outcome: CheckOutcome; def: SkillCheck };
}

export function getDialogue(id: string): Dialogue {
  return Content.requireDialogue(id);
}

/** Resolve which node a conversation should open on (memory-aware). */
export function openingNode(state: GameState, dialogue: Dialogue): string {
  const speakerId = dialogue.speaker;
  if (speakerId) return resolveEntryNode(state, speakerId, dialogue.start);
  return dialogue.start;
}

/** Build a render-ready view of a node, evaluating locks, checks, passives. */
export function viewNode(state: GameState, dialogueId: string, nodeId: string): NodeView {
  const dialogue = getDialogue(dialogueId);
  const node = dialogue.nodes[nodeId];
  if (!node) throw new Error(`[dialogue] missing node ${dialogueId}#${nodeId}`);

  const passiveLines = resolvePassiveLines(state, node);

  const responses: ResponseView[] = [];
  for (const r of node.responses) {
    const ok = evalAll(state, r.conditions);
    const alreadyUsed = r.once && state.seenNodes.includes(responseSeenKey(dialogueId, nodeId, r.id));
    if ((!ok && !r.showLocked) || alreadyUsed) continue;

    const view: ResponseView = {
      id: r.id,
      text: r.text,
      tone: r.tone ?? 'neutral',
      locked: !ok,
      lockReason: ok ? null : lockReason(state, r.conditions),
      once: !!r.once,
      exit: !!r.exit,
    };
    if (r.check) {
      view.check = {
        label: r.check.label,
        attribute: r.check.attribute,
        kind: r.check.kind,
        dc: r.check.dc,
        odds: successOdds(state, r.check),
        breakdown: resolveModifiers(state, r.check.modifiers),
      };
    }
    responses.push(view);
  }

  return { dialogueId, nodeId, lines: node.lines, passiveLines, responses };
}

/** Enter a node: fire onEnter effects, mark visited, return the resulting events. */
export function enterNode(state: GameState, dialogueId: string, nodeId: string): GameEvent[] {
  const dialogue = getDialogue(dialogueId);
  const node = dialogue.nodes[nodeId];
  if (!node) return [];
  const seenKey = nodeSeenKey(dialogueId, nodeId);
  const firstVisit = !state.seenNodes.includes(seenKey);
  if (firstVisit) state.seenNodes.push(seenKey);
  // Generic visited marker (bare node id) for `visited` conditions.
  if (!state.seenNodes.includes(nodeId)) state.seenNodes.push(nodeId);
  return firstVisit ? applyEffects(state, node.onEnter) : [];
}

/** Choose a response. Applies effects, runs a check if present, returns the path. */
export function chooseResponse(
  state: GameState,
  dialogueId: string,
  nodeId: string,
  responseId: string,
  rng: RngState,
): ChooseResult {
  const dialogue = getDialogue(dialogueId);
  const node = dialogue.nodes[nodeId];
  const response = node?.responses.find((r) => r.id === responseId);
  if (!response) return { events: [], nextNodeId: null };

  const events: GameEvent[] = [];

  // Mark `once` responses consumed.
  if (response.once) state.seenNodes.push(responseSeenKey(dialogueId, nodeId, responseId));

  // Pre-check effects.
  events.push(...applyEffects(state, response.effects));

  if (response.check) {
    const outcome = resolveCheck(state, response.check, rng);
    // Persist the advanced seed so reload can't re-roll a red check.
    state.rngSeed = rng.seed;
    const next = outcome.success ? response.check.onSuccess : response.check.onFailure;
    return { events, nextNodeId: next, check: { outcome, def: response.check } };
  }

  if (response.exit) return { events, nextNodeId: null };
  return { events, nextNodeId: response.goto ?? null };
}

// --- passive checks -------------------------------------------------------

/**
 * Resolve a node's passive checks. Passed passives inject their `onSuccess`
 * node's first line as an attribute interjection. Hidden passives are auto-
 * resolved silently using the persisted seed (no dice UI). Reproducible.
 */
function resolvePassiveLines(state: GameState, node: DialogueNode): DialogueNode['lines'] {
  if (!node.passiveChecks?.length) return [];
  const lines: DialogueNode['lines'] = [];
  for (const pc of node.passiveChecks) {
    // Passive checks use the player's static power vs. dc, no dice (DE "passives").
    const rng: RngState = { seed: hash(`${node.id}:${pc.attribute}:${state.rngSeed}`) };
    const outcome = resolveCheck(state, pc, rng);
    if (outcome.success) {
      const target = getNodeSafe(state, node, pc.onSuccess);
      const first = target?.lines[0];
      if (first) lines.push({ ...first, speaker: 'attribute', speakerId: pc.attribute });
    }
  }
  return lines;
}

function getNodeSafe(_state: GameState, node: DialogueNode, _id: string): DialogueNode | undefined {
  // Passive onSuccess can reference an inline pseudo-node id present in the same
  // dialogue. We look it up lazily via Content to avoid threading the dialogue.
  for (const d of Content.dialogues) {
    if (d.nodes[node.id] === node && d.nodes[_id]) return d.nodes[_id];
  }
  return undefined;
}

const nodeSeenKey = (d: string, n: string) => `${d}#${n}`;
const responseSeenKey = (d: string, n: string, r: string) => `${d}#${n}@${r}`;

function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h >>> 0;
}

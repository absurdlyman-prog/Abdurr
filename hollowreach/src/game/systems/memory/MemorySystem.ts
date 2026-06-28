import type { GameState, NpcMemory, NpcRuntimeState, ReactionRule } from '../../types';
import { Content } from '../../content';

// NPC memory & reaction routing. Dialogue effects plant memories (lies, bribes,
// kindnesses). When you next speak to that NPC, this module picks the entry
// node: a reaction rule can re-route the conversation so the bartender opens
// cold because he caught you lying yesterday.

export function getNpc(state: GameState, characterId: string): NpcRuntimeState {
  if (!state.npcs[characterId]) {
    state.npcs[characterId] = { characterId, relationship: 0, memories: [] };
  }
  return state.npcs[characterId];
}

/** Most recent memory of a given kind, if any. */
export function recallKind(npc: NpcRuntimeState, kind: NpcMemory['kind']): NpcMemory | undefined {
  return [...npc.memories].reverse().find((m) => m.kind === kind);
}

export function hasMemory(npc: NpcRuntimeState, id: string): boolean {
  return npc.memories.some((m) => m.id === id);
}

/** Net sentiment the NPC currently holds, recency-weighted. */
export function netSentiment(state: GameState, npc: NpcRuntimeState): number {
  const now = state.clock.minutes + state.clock.day * 24 * 60;
  let total = 0;
  for (const m of npc.memories) {
    const ageDays = (now - (m.at)) / (24 * 60);
    const recency = Math.max(0.4, 1 - ageDays * 0.08); // memories soften, never vanish
    total += m.sentiment * recency;
  }
  return total;
}

/**
 * Decide which dialogue node to enter for an NPC, honouring reaction rules.
 * Returns the default `start` node id if no rule fires.
 */
export function resolveEntryNode(state: GameState, characterId: string, defaultStart: string): string {
  const def = Content.character(characterId);
  if (!def?.reactions?.length) return defaultStart;
  const npc = getNpc(state, characterId);
  const sentiment = netSentiment(state, npc);

  for (const rule of def.reactions) {
    if (ruleMatches(state, npc, rule, sentiment)) return rule.gotoNode;
  }
  return defaultStart;
}

function ruleMatches(state: GameState, npc: NpcRuntimeState, rule: ReactionRule, sentiment: number): boolean {
  if (rule.whenFlag && !state.flags[rule.whenFlag]) return false;
  if (rule.whenMemoryKind && !recallKind(npc, rule.whenMemoryKind)) return false;
  if (rule.whenSentimentBelow !== undefined && !(sentiment < rule.whenSentimentBelow)) return false;
  if (rule.whenSentimentAbove !== undefined && !(sentiment > rule.whenSentimentAbove)) return false;
  return true;
}

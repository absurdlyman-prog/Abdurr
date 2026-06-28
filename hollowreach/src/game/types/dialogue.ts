import type { AttributeId } from './attributes';

// JSON-driven dialogue model.
//
// A Dialogue is a graph of Nodes. Each Node has narration/speaker lines and a
// set of Responses. Responses can be gated by Conditions, carry skill Checks,
// and fire Effects (set flags, change reputation, plant memories, award XP,
// open the case board, etc.). Everything is data — see content/dialogues/*.json.

export type SpeakerKind = 'npc' | 'self' | 'attribute' | 'narrator';

export interface DialogueLine {
  /** Who is speaking. `attribute` lines render in that voice's color. */
  speaker: SpeakerKind;
  /** Character id (for npc) or attribute id (for attribute). */
  speakerId?: string;
  text: string;
  /** Optional portrait emotion key, e.g. "wary", "drunk", "grieving". */
  emotion?: string;
}

export type ConditionOp =
  | 'flag' // flag is set/truthy
  | '!flag' // flag unset/falsey
  | 'flagEquals' // flag === value
  | 'attrAtLeast' // effective attribute >= value
  | 'attrBelow'
  | 'hasItem'
  | 'hasThought' // internalized thought id
  | 'repAtLeast' // faction reputation >= value
  | 'repBelow'
  | 'knows' // case-clue known
  | 'timeAfter' // in-game minutes since day start
  | 'timeBefore'
  | 'visited' // node id previously seen
  | 'chance'; // probabilistic gate, value is 0..1

export interface Condition {
  op: ConditionOp;
  /** Target key: flag name, attribute id, item id, faction id, clue id, node id. */
  key?: string;
  value?: number | string | boolean;
}

export type EffectOp =
  | 'setFlag'
  | 'incFlag'
  | 'giveItem'
  | 'takeItem'
  | 'addThought' // queue a thought into the Thought Cabinet
  | 'internalizeThought'
  | 'rep' // adjust faction reputation by value
  | 'learnClue'
  | 'addContradiction'
  | 'remember' // plant an NPC memory
  | 'xp'
  | 'health' // morale/endurance damage or heal
  | 'advanceTime' // push in-game clock forward by `value` minutes
  | 'startCase'
  | 'closeCase'
  | 'unlockNode'
  | 'playStinger'; // adaptive-audio cue id

export interface Effect {
  op: EffectOp;
  key?: string;
  value?: number | string | boolean;
  /** For `remember`: which npc remembers, and the memory payload. */
  who?: string;
  memory?: NpcMemorySeed;
}

export interface NpcMemorySeed {
  id: string;
  /** Short tag the NPC will reference later, e.g. "you lied about the badge". */
  summary: string;
  sentiment: number; // -3..+3
  /** Memory category used by reaction rules. */
  kind: 'lie' | 'kindness' | 'threat' | 'bribe' | 'promise' | 'insult' | 'fact';
}

export type CheckKind = 'white' | 'red';

export interface SkillCheck {
  attribute: AttributeId;
  /** Base difficulty class. Final DC is modified by modifiers[] below. */
  dc: number;
  kind: CheckKind; // white = retryable later; red = one-shot, permanent
  /** Visible label, e.g. "Read the bartender's hands." */
  label: string;
  /** Situational +/- modifiers that the player can see and reason about. */
  modifiers?: CheckModifier[];
  /** Node to go to on success / failure. */
  onSuccess: string;
  onFailure: string;
  /** Optional: hide the check entirely (passive). Resolved silently. */
  hidden?: boolean;
}

export interface CheckModifier {
  label: string;
  value: number;
  /** Only applied when this condition holds. If absent, always applies. */
  when?: Condition;
}

export interface DialogueResponse {
  id: string;
  text: string;
  /** All conditions must hold for the option to appear. */
  conditions?: Condition[];
  /** If present, the option is an attempt at a skill check. */
  check?: SkillCheck;
  /** Effects fired immediately when the option is chosen (before any check). */
  effects?: Effect[];
  /** Where to go next (ignored if `check` is present). */
  goto?: string;
  /** If true, this response ends the conversation. */
  exit?: boolean;
  /** Render hint: 'red' checks and aggressive lines can be tinted. */
  tone?: 'neutral' | 'aggressive' | 'kind' | 'sly' | 'inner';
  /** Show greyed-out with the reason when conditions fail (DE-style). */
  showLocked?: boolean;
  /** One-time only: hide after first selection. */
  once?: boolean;
}

export interface DialogueNode {
  id: string;
  lines: DialogueLine[];
  /** Effects that fire on entering the node (e.g. learn a clue on arrival). */
  onEnter?: Effect[];
  responses: DialogueResponse[];
  /** Passive checks auto-resolved on entry; success unlocks extra responses/lines. */
  passiveChecks?: SkillCheck[];
}

export interface Dialogue {
  id: string;
  /** Default speaker character id if a line omits speakerId. */
  speaker?: string;
  start: string;
  nodes: Record<string, DialogueNode>;
}

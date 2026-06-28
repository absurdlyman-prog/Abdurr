import { create } from 'zustand';
import type {
  AttributeId,
  GameState,
  SceneDef,
  SettingsState,
} from '../types';
import { Content } from '../content';
import { createNewGame, type NewGameOptions } from '../newgame';
import * as Save from '../systems/save/SaveSystem';
import {
  chooseResponse as engineChoose,
  enterNode,
  openingNode,
  viewNode,
  type NodeView,
} from '../systems/dialogue/DialogueEngine';
import type { CheckOutcome } from '../systems/skillcheck';
import type { GameEvent } from '../systems/dialogue/effects';
import { advanceClock, applyEffects } from '../systems/dialogue/effects';
import { tickThoughts, applyThoughtModifiers } from '../systems/thoughts';
import { tickSchedules } from '../systems/npc/Schedule';
import { effectiveAttr } from '../systems/attributes';
import type { SkillCheck } from '../types';

// Central game store. Single source of truth for the React + Pixi layers. All
// state mutation goes through `mutate`, which clones the GameState, runs the
// systems, recomputes derived state (thought modifiers, schedules), and pushes
// emitted GameEvents to the toast/audio queue.

export type Screen = 'menu' | 'create' | 'playing';
export type Overlay = null | 'cases' | 'thoughts' | 'inventory' | 'journal' | 'sheet' | 'settings' | 'map';

export interface DialogueSession {
  dialogueId: string;
  nodeId: string;
  view: NodeView;
  /** Pending check animation, consumed by the SkillCheck overlay. */
  pendingCheck?: { outcome: CheckOutcome; def: SkillCheck; nextNodeId: string | null };
}

export interface ToastEvent extends GameEvent {
  id: number;
  at: number;
}

interface GameStore {
  screen: Screen;
  overlay: Overlay;
  game: GameState | null;
  dialogue: DialogueSession | null;
  toasts: ToastEvent[];
  /** Bumps every state mutation so Pixi subscribers can diff cheaply. */
  revision: number;
  /** Set by the engine when a scene should (re)load. */
  sceneEpoch: number;

  // lifecycle
  newGame(opts: NewGameOptions): void;
  loadSlot(slot: string): boolean;
  save(slot: string): void;
  autosave(): void;
  toMenu(): void;
  goCreate(): void;

  // world
  currentScene(): SceneDef | null;
  movePlayer(x: number, y: number): void;
  travelTo(sceneId: string, spawn?: { x: number; y: number }): void;
  interact(hotspotId: string): void;
  advanceTime(minutes: number): void;

  // dialogue
  openDialogue(dialogueId: string): void;
  choose(responseId: string): void;
  resolvePendingCheck(): void;
  closeDialogue(): void;

  // character growth
  spendPoint(attr: AttributeId): boolean;
  slotThought(thoughtId: string): void;

  // ui
  setOverlay(o: Overlay): void;
  updateSettings(patch: Partial<SettingsState>): void;
  dismissToast(id: number): void;
  pushEvents(events: GameEvent[]): void;
}

let toastSeq = 1;

export const useGame = create<GameStore>((set, get) => {
  /** Clone game, run mutator, recompute derived state, commit, queue events. */
  function mutate(fn: (g: GameState) => GameEvent[] | void): void {
    const cur = get().game;
    if (!cur) return;
    const draft: GameState = structuredClone(cur);
    const emitted = fn(draft) ?? [];
    // Derived recompute after every mutation.
    applyThoughtModifiers(draft);
    tickSchedules(draft);
    set((s) => ({ game: draft, revision: s.revision + 1 }));
    if (emitted.length) get().pushEvents(emitted);
  }

  return {
    screen: 'menu',
    overlay: null,
    game: null,
    dialogue: null,
    toasts: [],
    revision: 0,
    sceneEpoch: 0,

    newGame(opts) {
      const game = createNewGame(opts);
      applyThoughtModifiers(game);
      tickSchedules(game);
      set((s) => ({ game, screen: 'playing', overlay: null, dialogue: null, sceneEpoch: s.sceneEpoch + 1, revision: s.revision + 1 }));
      // Auto-open the cold-open monologue.
      get().openDialogue('intro');
    },

    loadSlot(slot) {
      const game = Save.loadGame(slot);
      if (!game) return false;
      applyThoughtModifiers(game);
      tickSchedules(game);
      set((s) => ({ game, screen: 'playing', overlay: null, dialogue: null, sceneEpoch: s.sceneEpoch + 1, revision: s.revision + 1 }));
      return true;
    },

    save(slot) {
      const g = get().game;
      if (g) Save.saveGame(slot, g);
    },

    autosave() {
      const g = get().game;
      if (g) Save.autosave(g);
    },

    toMenu() {
      set({ screen: 'menu', overlay: null, dialogue: null });
    },

    goCreate() {
      set({ screen: 'create' });
    },

    currentScene() {
      const g = get().game;
      if (!g) return null;
      return Content.scene(g.location.scene) ?? null;
    },

    movePlayer(x, y) {
      mutate((g) => {
        g.location.x = x;
        g.location.y = y;
      });
    },

    travelTo(sceneId, spawn) {
      mutate((g) => {
        const scene = Content.scene(sceneId);
        if (!scene) return;
        g.location.scene = sceneId;
        const sp = spawn ?? scene.spawn;
        g.location.x = sp.x;
        g.location.y = sp.y;
        // Travel costs a little time.
        advanceClock(g, 10);
        return tickThoughts(g);
      });
      set((s) => ({ sceneEpoch: s.sceneEpoch + 1 }));
      get().autosave();
    },

    interact(hotspotId) {
      const scene = get().currentScene();
      const hs = scene?.hotspots.find((h) => h.id === hotspotId);
      if (!hs) return;
      if (hs.kind === 'exit' && hs.target) {
        get().travelTo(hs.target.scene, hs.target.spawn);
        return;
      }
      if (hs.dialogue) {
        get().openDialogue(hs.dialogue);
        return;
      }
      if (hs.kind === 'clue' || hs.kind === 'object') {
        mutate((g) => {
          if (g.flags[`examined_${hs.id}`]) return [];
          g.flags[`examined_${hs.id}`] = true;
          const evs = applyEffects(g, hs.onExamine);
          evs.unshift({ kind: 'flag', message: hs.hoverNote ?? `You examine the ${hs.label.toLowerCase()}.` });
          return evs;
        });
      }
    },

    advanceTime(minutes) {
      mutate((g) => {
        advanceClock(g, minutes);
        return tickThoughts(g);
      });
    },

    openDialogue(dialogueId) {
      const g = get().game;
      if (!g) return;
      const dialogue = Content.requireDialogue(dialogueId);
      const startNode = openingNode(g, dialogue);
      mutate((draft) => enterNode(draft, dialogueId, startNode));
      const after = get().game!;
      const view = viewNode(after, dialogueId, startNode);
      set({ dialogue: { dialogueId, nodeId: startNode, view }, overlay: null });
    },

    choose(responseId) {
      const { dialogue, game } = get();
      if (!dialogue || !game) return;
      // Hold the engine result in an object so TS doesn't narrow it to `never`
      // across the mutate() closure boundary.
      const holder: { r: ReturnType<typeof engineChoose> | null } = { r: null };
      mutate((draft) => {
        const rng = { seed: draft.rngSeed };
        holder.r = engineChoose(draft, dialogue.dialogueId, dialogue.nodeId, responseId, rng);
        draft.rngSeed = rng.seed;
        return holder.r.events;
      });
      const r = holder.r;
      if (!r) return;

      if (r.check) {
        // Stage the check for the overlay; the player clicks through the dice,
        // then resolvePendingCheck advances to the result node.
        set({
          dialogue: {
            ...get().dialogue!,
            pendingCheck: { outcome: r.check.outcome, def: r.check.def, nextNodeId: r.nextNodeId },
          },
        });
        return;
      }
      advanceToNode(r.nextNodeId);
    },

    resolvePendingCheck() {
      const d = get().dialogue;
      if (!d?.pendingCheck) return;
      const next = d.pendingCheck.nextNodeId;
      set({ dialogue: { ...d, pendingCheck: undefined } });
      advanceToNode(next);
    },

    closeDialogue() {
      set({ dialogue: null });
      get().autosave();
    },

    spendPoint(attr) {
      const g = get().game;
      if (!g || g.skillPoints <= 0) return false;
      if (effectiveAttr(g, attr) >= 8 + 6) return false;
      mutate((draft) => {
        draft.skillPoints -= 1;
        draft.attributes.base[attr] = Math.min(8, draft.attributes.base[attr] + 1);
        return [{ kind: 'levelup', message: `${Content.attribute(attr)?.name} rises. The voice grows louder.` }];
      });
      return true;
    },

    slotThought(thoughtId) {
      mutate((draft) => {
        if (draft.thoughts.some((t) => t.thoughtId === thoughtId)) return;
        draft.thoughts.push({ thoughtId, status: 'forming', slottedAt: draft.clock.minutes });
        const def = Content.thought(thoughtId);
        return [{ kind: 'thought', message: `You begin to dwell on: ${def?.name ?? thoughtId}` }];
      });
    },

    setOverlay(o) {
      set({ overlay: o });
    },

    updateSettings(patch) {
      mutate((g) => {
        g.settings = { ...g.settings, ...patch };
      });
    },

    dismissToast(id) {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },

    pushEvents(events) {
      const now = Date.now();
      const visible = events.filter((e) => e.message);
      if (!visible.length) return;
      set((s) => ({
        toasts: [...s.toasts, ...visible.map((e) => ({ ...e, id: toastSeq++, at: now }))].slice(-6),
      }));
    },
  };

  // --- helpers that close over set/get ---
  function advanceToNode(nextNodeId: string | null): void {
    if (!nextNodeId) {
      get().closeDialogue();
      return;
    }
    const d = get().dialogue!;
    mutate((draft) => enterNode(draft, d.dialogueId, nextNodeId));
    const after = get().game!;
    const view = viewNode(after, d.dialogueId, nextNodeId);
    set({ dialogue: { dialogueId: d.dialogueId, nodeId: nextNodeId, view } });
  }
});

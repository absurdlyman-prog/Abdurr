import { useEffect, useRef } from 'react';
import { useGame } from '@game/state/store';
import { SceneRenderer } from '@engine/pixi/SceneRenderer';
import { audio } from '@engine/audio/AudioDirector';
import { Hud } from './Hud';
import { DialogueBox } from './DialogueBox';
import { SkillCheckOverlay } from './SkillCheckOverlay';
import { Toasts } from './Toasts';
import { CaseBoard } from './CaseBoard';
import { ThoughtCabinet } from './ThoughtCabinet';
import { Inventory } from './Inventory';
import { Journal } from './Journal';
import { CharacterSheet } from './CharacterSheet';
import { Settings } from './Settings';

// The play screen. Mounts the Pixi renderer into a host div for the lifetime of
// the screen, then layers all DOM UI (HUD, dialogue, overlays, toasts) above it.

export function GameView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const overlay = useGame((s) => s.overlay);
  const dialogue = useGame((s) => s.dialogue);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const renderer = new SceneRenderer();
    void renderer.mount(host);
    audio.ensureStarted();
    return () => renderer.destroy();
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div className="canvas-host" ref={hostRef} />
      <Hud />
      {dialogue && <DialogueBox />}
      {dialogue?.pendingCheck && <SkillCheckOverlay />}
      {overlay === 'cases' && <CaseBoard />}
      {overlay === 'thoughts' && <ThoughtCabinet />}
      {overlay === 'inventory' && <Inventory />}
      {overlay === 'journal' && <Journal />}
      {overlay === 'sheet' && <CharacterSheet />}
      {overlay === 'settings' && <Settings />}
      <Toasts />
    </div>
  );
}

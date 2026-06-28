import { useEffect } from 'react';
import { useGame } from '@game/state/store';
import { audio } from '@engine/audio/AudioDirector';
import { Content } from '@game/content';
import { MainMenu } from '@ui/components/MainMenu';
import { CharacterCreation } from '@ui/components/CharacterCreation';
import { GameView } from '@ui/components/GameView';

// Root component. Switches between the three top-level screens and wires the
// audio director to the store (theme follows scene, stingers follow events).

export function App() {
  const screen = useGame((s) => s.screen);
  const game = useGame((s) => s.game);
  const toasts = useGame((s) => s.toasts);
  const sceneEpoch = useGame((s) => s.sceneEpoch);

  // Resume / theme audio when entering a scene.
  useEffect(() => {
    if (!game) {
      audio.playTheme('menu_theme');
      return;
    }
    const scene = Content.scene(game.location.scene);
    if (scene?.theme) audio.playTheme(scene.theme as Parameters<typeof audio.playTheme>[0]);
  }, [game, sceneEpoch]);

  // Apply audio settings.
  useEffect(() => {
    if (!game) return;
    audio.applySettings({
      master: game.settings.masterVolume,
      music: game.settings.musicVolume,
      sfx: game.settings.sfxVolume,
    });
  }, [game?.settings.masterVolume, game?.settings.musicVolume, game?.settings.sfxVolume, game]);

  // Fire audio stingers off toast events.
  useEffect(() => {
    const last = toasts.at(-1);
    if (!last) return;
    if (last.kind === 'stinger' && last.data?.cue) audio.stinger(last.data.cue as never);
    if (last.kind === 'clue') audio.stinger('clue_found');
    if (last.kind === 'levelup') audio.stinger('level_up');
  }, [toasts]);

  // Accessibility classes on <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('hc', !!game?.settings.highContrast);
    root.classList.toggle('dyslexia', !!game?.settings.dyslexiaFont);
    root.classList.toggle('reduce-motion', !!game?.settings.reducedMotion);
    root.style.setProperty('--text-scale', String(game?.settings.textScale ?? 1));
  }, [game?.settings.highContrast, game?.settings.dyslexiaFont, game?.settings.reducedMotion, game?.settings.textScale]);

  // Expose a small scripting surface for mods, debugging, and automated tests.
  // Documented in docs/ARCHITECTURE.md → "Modding API".
  useEffect(() => {
    (window as unknown as { hollowreach: unknown }).hollowreach = {
      store: useGame,
      content: Content,
      audio,
      version: '0.3.0',
    };
  }, []);

  const start = () => audio.ensureStarted();

  return (
    <div className="app-shell" onPointerDown={start}>
      {screen === 'menu' && <MainMenu />}
      {screen === 'create' && <CharacterCreation />}
      {screen === 'playing' && <GameView />}
    </div>
  );
}

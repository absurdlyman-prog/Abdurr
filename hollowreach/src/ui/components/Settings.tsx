import { useGame } from '@game/state/store';
import { exportSave } from '@game/systems/save/SaveSystem';
import { OverlayShell } from './OverlayShell';

// Settings — audio mix and the accessibility suite (reduced motion, high
// contrast, dyslexia-friendly font, text scaling, no-fail mode, hidden-check
// reveal). Also exposes save export for backup/transfer.

export function Settings() {
  const game = useGame((s) => s.game)!;
  const update = useGame((s) => s.updateSettings);
  const s = game.settings;

  const slider = (label: string, key: keyof typeof s, hint?: string) => (
    <div className="setting">
      <div>
        <label>{label}</label>
        {hint && <div className="hint">{hint}</div>}
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={s[key] as number}
        onChange={(e) => update({ [key]: Number(e.target.value) })}
      />
    </div>
  );

  const toggle = (label: string, key: keyof typeof s, hint?: string) => (
    <div className="setting">
      <div>
        <label>{label}</label>
        {hint && <div className="hint">{hint}</div>}
      </div>
      <input type="checkbox" checked={!!s[key]} onChange={(e) => update({ [key]: e.target.checked })} />
    </div>
  );

  return (
    <OverlayShell title="Settings">
      <h4 className="menu-tag">Sound</h4>
      {slider('Master volume', 'masterVolume')}
      {slider('Music', 'musicVolume')}
      {slider('Effects', 'sfxVolume')}

      <h4 className="menu-tag" style={{ marginTop: '1rem' }}>
        Accessibility
      </h4>
      {toggle('Reduced motion', 'reducedMotion', 'Stills the rain, fog drift, and animations.')}
      {toggle('High contrast', 'highContrast', 'Brighter ink, darker paper, lighter day/night grade.')}
      {toggle('Dyslexia-friendly font', 'dyslexiaFont')}
      {toggle('Reveal hidden checks', 'revealHiddenChecks', 'Surface passive/hidden rolls instead of resolving them silently.')}
      {toggle('No-fail mode', 'noFailState', 'Removes morale/endurance death; the story continues regardless.')}
      <div className="setting">
        <div>
          <label>Text size</label>
          <div className="hint">Scales all text from 80% to 160%.</div>
        </div>
        <input
          type="range"
          min={0.8}
          max={1.6}
          step={0.1}
          value={s.textScale}
          onChange={(e) => update({ textScale: Number(e.target.value) })}
        />
      </div>

      <h4 className="menu-tag" style={{ marginTop: '1rem' }}>
        Save data
      </h4>
      <div className="setting">
        <div>
          <label>Export save code</label>
          <div className="hint">Copy a portable code you can re-import on any device.</div>
        </div>
        <button
          className="btn"
          onClick={() => {
            const code = exportSave(game);
            navigator.clipboard?.writeText(code).then(
              () => alert('Save code copied to clipboard.'),
              () => prompt('Copy your save code:', code),
            );
          }}
        >
          Export
        </button>
      </div>
    </OverlayShell>
  );
}

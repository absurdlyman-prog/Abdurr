import { useState } from 'react';
import { useGame } from '@game/state/store';
import { listSaves, deleteSave, importSave } from '@game/systems/save/SaveSystem';

// Title screen. Continue (autosave), load a slot, start anew, or import a save
// code. Saves are read live from localStorage so the list reflects reality.

export function MainMenu() {
  const goCreate = useGame((s) => s.goCreate);
  const loadSlot = useGame((s) => s.loadSlot);
  const [saves, setSaves] = useState(() => listSaves());
  const [importing, setImporting] = useState(false);
  const [code, setCode] = useState('');

  const refresh = () => setSaves(listSaves());
  const autosave = saves.find((s) => s.slot === 'autosave');

  const doImport = () => {
    const g = importSave(code);
    if (!g) return alert('That save code could not be read.');
    useGame.setState({ game: g, screen: 'playing', sceneEpoch: useGame.getState().sceneEpoch + 1 });
  };

  return (
    <div className="menu">
      <div className="menu-inner">
        <div className="menu-tag">A drowning city. A death it would rather forget.</div>
        <h1 className="title-xl">Hollowreach</h1>
        <p className="menu-blurb">
          You woke on the dawn quay beside a dead man, with eight arguing voices in your skull and no memory of
          your own name. The notebook in your coat is in your handwriting. It is afraid of you. Find out who
          drowned the clerk — and whether the answer is a man you can still arrest.
        </p>
        <div className="menu-actions">
          {autosave && (
            <button className="btn primary" onClick={() => loadSlot('autosave')}>
              Continue — Day {autosave.day}, {fmt(autosave.minute)} · {autosave.scene}
            </button>
          )}
          <button className="btn" onClick={goCreate}>
            Begin a New Case
          </button>
          <button className="btn ghost" onClick={() => setImporting((v) => !v)}>
            Import save code
          </button>
        </div>

        {importing && (
          <div className="row" style={{ marginTop: '1rem' }}>
            <input type="text" placeholder="Paste save code…" value={code} onChange={(e) => setCode(e.target.value)} style={{ flex: 1 }} />
            <button className="btn" onClick={doImport}>
              Load
            </button>
          </div>
        )}

        {saves.length > 0 && (
          <div className="menu-saves panel" style={{ padding: '0.5rem 0.8rem' }}>
            <div className="menu-tag" style={{ padding: '0.4rem 0' }}>
              Saved games
            </div>
            {saves.map((s) => (
              <div className="save-row" key={s.slot}>
                <span>
                  {s.name} · <span className="meta">{s.slot}</span>
                </span>
                <span className="meta">
                  Day {s.day}, {fmt(s.minute)} · {s.scene}
                </span>
                <span className="row">
                  <button className="btn ghost" onClick={() => loadSlot(s.slot)}>
                    Load
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => {
                      deleteSave(s.slot);
                      refresh();
                    }}
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="subtle" style={{ marginTop: '2rem', fontSize: '0.74rem' }}>
          Click anywhere to wake the score. Headphones recommended.
        </p>
      </div>
    </div>
  );
}

function fmt(min: number): string {
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

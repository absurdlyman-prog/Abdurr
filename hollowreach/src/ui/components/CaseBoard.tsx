import { useState } from 'react';
import { useGame } from '@game/state/store';
import { Content } from '@game/content';
import {
  theoryStatuses,
  contradictionStatuses,
  knownClues,
  commitTheory,
  resolveContradiction,
} from '@game/systems/investigation/CaseBoard';

// The Case Board. Left: the evidence wall (clues) and the red-thread
// contradictions you can resolve into new deductions. Right: the theories —
// each one a complete, internally-consistent story you can accuse. Committing
// closes the case and brands its ending tag onto the save.

export function CaseBoard() {
  const game = useGame((s) => s.game)!;
  const setOverlay = useGame((s) => s.setOverlay);
  const [activeCase, setActiveCase] = useState(Object.keys(game.cases)[0] ?? '');
  const [, force] = useState(0);

  const def = activeCase ? Content.case(activeCase) : undefined;
  if (!def) {
    return (
      <Shell onClose={() => setOverlay(null)}>
        <p className="subtle">No cases open. The city hasn't handed you a body yet.</p>
      </Shell>
    );
  }

  const cp = game.cases[def.id];
  const known = new Set(knownClues(game, def));
  const theories = theoryStatuses(game, def);
  const contradictions = contradictionStatuses(game, def);

  // Mutate the live game object, then publish a fresh top-level reference so
  // store selectors (HUD counts, etc.) re-render. Persists via autosave.
  const mutateAndRefresh = (fn: (g: typeof game) => void) => {
    const g = useGame.getState().game!;
    fn(g);
    useGame.setState((s) => ({ game: { ...s.game! }, revision: s.revision + 1 }));
    useGame.getState().autosave();
    force((n) => n + 1);
  };

  const onResolve = (id: string) => {
    mutateAndRefresh((g) => {
      resolveContradiction(g, def, id);
    });
  };

  const onCommit = (theoryId: string) => {
    const status = theories.find((t) => t.theory.id === theoryId)!;
    const warn = status.shaky
      ? 'This theory is contradicted by evidence you already hold. Accuse anyway? The Quarter will remember how you closed this.'
      : `Close the case on "${status.theory.title}"? This is final.`;
    if (!confirm(warn)) return;
    mutateAndRefresh((g) => {
      const ok = commitTheory(g, def, theoryId);
      if (ok) {
        g.journal.push({
          id: `verdict_${def.id}`,
          day: g.clock.day,
          minute: g.clock.minutes,
          title: `Verdict: ${status.theory.title}`,
          body: status.theory.summary,
          caseId: def.id,
        });
        useGame.getState().pushEvents([
          { kind: 'case', message: `Case closed: ${status.theory.title}` },
          { kind: 'stinger', message: '', data: { cue: 'theme_rise' } },
        ]);
      }
    });
  };

  return (
    <Shell onClose={() => setOverlay(null)} title={def.title}>
      {Object.keys(game.cases).length > 1 && (
        <div className="row" style={{ marginBottom: '0.8rem' }}>
          {Object.keys(game.cases).map((id) => (
            <button key={id} className={`btn ${id === activeCase ? 'primary' : 'ghost'}`} onClick={() => setActiveCase(id)}>
              {Content.case(id)?.title}
            </button>
          ))}
        </div>
      )}
      <p className="subtle" style={{ marginTop: 0 }}>{def.briefing}</p>

      {cp?.closed && (
        <div className="theory available" style={{ marginBottom: '1rem' }}>
          <div className="tt">CASE CLOSED</div>
          <div className="ts">
            You accused: <b>{theories.find((t) => t.theory.id === cp.committedTheory)?.theory.title}</b>.
            {String(game.flags[`${def.id}__shaky`]) === 'true' && ' (Against the evidence.)'}
          </div>
        </div>
      )}

      <div className="board">
        <div className="board-col scroll">
          <h4>Evidence ({known.size}/{def.clues.length})</h4>
          {def.clues.map((c) => {
            const have = known.has(c.id);
            return (
              <div className="clue" key={c.id} style={{ opacity: have ? 1 : 0.3 }}>
                <div className="ctitle">{have ? c.title : '— undiscovered —'}</div>
                {have && <div className="cdetail">{c.detail}</div>}
                {have && <div className="creliab">{c.reliability} evidence · {c.tags.join(', ')}</div>}
              </div>
            );
          })}

          <h4 style={{ marginTop: '1rem' }}>Contradictions</h4>
          {contradictions.map((c) => (
            <div key={c.id} className={`contradiction ${c.resolved ? 'resolved' : ''}`}>
              {c.statement}
              {c.active && !c.resolved && (
                <button className="btn ghost" style={{ marginLeft: '0.5rem', fontSize: '0.74rem' }} onClick={() => onResolve(c.id)}>
                  Reconcile →
                </button>
              )}
              {!c.active && <span className="hidden-note"> · need more evidence</span>}
              {c.resolved && <span className="hidden-note"> · reconciled</span>}
            </div>
          ))}
        </div>

        <div className="board-col scroll">
          <h4>Theories — accuse one</h4>
          {theories.map((t) => (
            <div key={t.theory.id} className={`theory ${t.available ? 'available' : ''} ${t.shaky ? 'shaky' : ''}`}>
              <div className="tt">{t.theory.title}</div>
              <div className="ts">{t.theory.summary}</div>
              {t.shaky && <div className="missing">⚠ Contradicted by evidence you hold.</div>}
              {!t.available && <div className="missing">Locked: needs {t.missing.length} more clue(s).</div>}
              {t.available && !cp?.closed && (
                <button className="btn primary" style={{ marginTop: '0.4rem' }} onClick={() => onCommit(t.theory.id)}>
                  Accuse & close
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ title = 'Case Board', children, onClose }: { title?: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-card panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2>{title}</h2>
          <button className="close-x" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="overlay-body scroll">{children}</div>
      </div>
    </div>
  );
}

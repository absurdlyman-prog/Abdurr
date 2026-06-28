import { useEffect, useState } from 'react';
import { useGame } from '@game/state/store';
import { Content } from '@game/content';
import { audio } from '@engine/audio/AudioDirector';

// Skill-check theatre. Shows the dice, the attribute + situational breakdown,
// and the verdict — then advances the conversation. Red checks are flagged as
// one-shot so the weight of the roll lands.

export function SkillCheckOverlay() {
  const dialogue = useGame((s) => s.dialogue)!;
  const resolve = useGame((s) => s.resolvePendingCheck);
  const pending = dialogue.pendingCheck!;
  const { outcome, def } = pending;
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setRevealed(true);
      audio.stinger(outcome.success ? 'check_success' : 'check_fail');
    }, 700);
    return () => clearTimeout(t);
  }, [outcome.success]);

  const attr = Content.attribute(def.attribute);

  return (
    <div className="check-overlay">
      <div className="check-card panel">
        <div className="menu-tag" style={{ color: attr?.color }}>
          {attr?.name} · {def.kind === 'red' ? 'Red Check (one chance)' : 'White Check'}
        </div>
        <h3 style={{ margin: '0.4rem 0 0' }}>{def.label}</h3>

        <div className="dice">
          <div className={`die ${outcome.critical ? 'crit' : ''}`}>{revealed ? outcome.dice[0] : '?'}</div>
          <div className={`die ${outcome.critical ? 'crit' : ''}`}>{revealed ? outcome.dice[1] : '?'}</div>
        </div>

        {revealed && (
          <>
            <div className="check-breakdown">
              {outcome.breakdown.map((b, i) => (
                <span key={i}>
                  {b.label} {b.value >= 0 ? '+' : ''}
                  {b.value}
                  {i < outcome.breakdown.length - 1 ? '  ·  ' : ''}
                </span>
              ))}
              <div style={{ marginTop: '0.3rem' }}>
                Total <b>{outcome.total}</b> vs. difficulty <b>{outcome.finalDc}</b>
              </div>
            </div>
            <div className={`check-result ${outcome.success ? 'success' : 'failure'}`}>
              {outcome.critical === 'success'
                ? 'Critical!'
                : outcome.critical === 'failure'
                  ? 'Snake eyes…'
                  : outcome.success
                    ? 'Success'
                    : 'Failure'}
            </div>
            <button className="btn primary" onClick={resolve}>
              Continue
            </button>
          </>
        )}
        {!revealed && <p className="subtle">The dice are still falling…</p>}
      </div>
    </div>
  );
}

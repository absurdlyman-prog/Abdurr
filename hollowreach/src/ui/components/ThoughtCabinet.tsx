import { useGame } from '@game/state/store';
import { Content } from '@game/content';
import { thoughtProgress } from '@game/systems/thoughts';
import { OverlayShell } from './OverlayShell';

// The Mind Reliquary — thought cabinet. Forming thoughts apply a penalty and a
// time-to-internalize; once they take root they grant a permanent bonus and open
// new lines. Time passes as you investigate, so thoughts resolve through play.

export function ThoughtCabinet() {
  const game = useGame((s) => s.game)!;
  const advanceTime = useGame((s) => s.advanceTime);

  return (
    <OverlayShell title="The Mind Reliquary">
      <p className="subtle" style={{ marginTop: 0 }}>
        Ideas you cannot put down. While a thought forms it costs you; once internalized it reshapes who the
        detective is becoming. Thoughts ripen as in-game time passes.
      </p>

      {game.thoughts.length === 0 && <p className="subtle">No thoughts have taken hold yet. Live a little. Lose a little.</p>}

      {game.thoughts.map((slot) => {
        const def = Content.thought(slot.thoughtId);
        if (!def) return null;
        const p = thoughtProgress(game, slot.thoughtId);
        const internalized = slot.status === 'internalized';
        return (
          <div className={`thought ${internalized ? 'internalized' : ''}`} key={slot.thoughtId}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <b style={{ color: internalized ? 'var(--brine)' : 'var(--gold)' }}>{def.name}</b>
              <span className="hidden-note">{def.category}</span>
            </div>
            <div className="desc" style={{ marginTop: '0.3rem' }}>
              {internalized ? def.conclusion : def.premise}
            </div>
            {!internalized && (
              <>
                <div className="progress">
                  <div style={{ width: `${Math.round(p * 100)}%` }} />
                </div>
                <div className="hidden-note" style={{ marginTop: '0.3rem' }}>
                  {Math.round(p * 100)}% formed
                  {(def.whileForming ?? []).map((m) => (
                    <span key={m.attribute} style={{ color: 'var(--blood)' }}>
                      {' '}
                      · {m.value > 0 ? '+' : ''}
                      {m.value} {m.attribute}
                    </span>
                  ))}
                </div>
              </>
            )}
            {internalized &&
              (def.whenInternalized ?? []).map((m) => (
                <span key={m.attribute} className="hidden-note" style={{ color: 'var(--brine)' }}>
                  {' '}
                  {m.value > 0 ? '+' : ''}
                  {m.value} {m.attribute}
                </span>
              ))}
          </div>
        );
      })}

      <div className="row" style={{ marginTop: '1rem' }}>
        <span className="subtle">Need to let a thought ripen?</span>
        <button className="btn" onClick={() => advanceTime(120)}>
          Walk the city — pass 2 hours
        </button>
      </div>
    </OverlayShell>
  );
}

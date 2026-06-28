import { useGame } from '@game/state/store';
import { OverlayShell } from './OverlayShell';

// The Notebook — chronological journal. Auto-written by quests/effects, in your
// own (untrustworthy) hand. Newest first.

export function Journal() {
  const game = useGame((s) => s.game)!;
  const entries = [...game.journal].reverse();

  return (
    <OverlayShell title="The Notebook">
      {entries.length === 0 && <p className="subtle">Blank pages. For now.</p>}
      {entries.map((e) => (
        <div className="clue" key={e.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="ctitle">{e.title}</span>
            <span className="creliab">
              Day {e.day} · {fmt(e.minute)}
            </span>
          </div>
          <div className="cdetail">{e.body}</div>
        </div>
      ))}
    </OverlayShell>
  );
}

function fmt(min: number): string {
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

import { useGame } from '@game/state/store';
import { Content } from '@game/content';
import { standingBand } from '@game/systems/reputation';
import { OverlayShell } from './OverlayShell';

// The Coat — inventory + standing. Lists carried items (with passive modifiers)
// and your standing with each faction, since both are things you "carry" through
// the city and both shape which doors open.

export function Inventory() {
  const game = useGame((s) => s.game)!;
  const items = Object.entries(game.inventory).filter(([, n]) => n > 0);

  return (
    <OverlayShell title="The Coat">
      <div className="board">
        <div className="board-col scroll">
          <h4>Carried</h4>
          {items.length === 0 && <p className="subtle">Empty pockets. Just lint and dread.</p>}
          {items.map(([id, n]) => {
            const item = Content.item(id);
            if (!item) return null;
            return (
              <div className="clue" key={id}>
                <div className="ctitle">
                  {item.name}
                  {n > 1 ? ` ×${n}` : ''}
                </div>
                <div className="cdetail">{item.blurb}</div>
                {item.carryModifiers?.map((m) => (
                  <div key={m.attribute} className="creliab" style={{ color: 'var(--brine)' }}>
                    {m.value > 0 ? '+' : ''}
                    {m.value} {m.attribute} — {m.reason}
                  </div>
                ))}
                <div className="creliab">{item.kind}</div>
              </div>
            );
          })}
        </div>

        <div className="board-col scroll">
          <h4>Standing</h4>
          {Content.factions.map((f) => {
            const v = game.reputation[f.id] ?? 0;
            const band = standingBand(v);
            return (
              <div className="clue" key={f.id} style={{ borderLeft: `3px solid ${f.color}` }}>
                <div className="ctitle" style={{ color: f.color }}>
                  {f.name}
                </div>
                <div className="cdetail">
                  <b>{band}</b> ({v >= 0 ? '+' : ''}
                  {v}) — <i>{f.creed}</i>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </OverlayShell>
  );
}

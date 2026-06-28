import { useGame } from '@game/state/store';
import { Content } from '@game/content';
import { ATTRIBUTE_IDS } from '@game/types';
import { effectiveAttr } from '@game/systems/attributes';
import { OverlayShell } from './OverlayShell';

// The Voices — character sheet. Shows each of the eight attributes as a living
// card: base + effective value, creed, strengths, and pitfall. Spare skill
// points can be spent to raise a voice (it grows louder, for better and worse).

export function CharacterSheet() {
  const game = useGame((s) => s.game)!;
  const spend = useGame((s) => s.spendPoint);

  return (
    <OverlayShell title={`The Voices — ${game.profile.name}`}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <span className="subtle">
          {Content.archetype(game.profile.archetype)?.name} · {game.xp} XP
        </span>
        <span style={{ color: game.skillPoints > 0 ? 'var(--gold)' : 'var(--ink-dim)' }}>
          {game.skillPoints} skill point{game.skillPoints === 1 ? '' : 's'} to spend
        </span>
      </div>

      <div className="attr-grid">
        {ATTRIBUTE_IDS.map((id) => {
          const def = Content.attribute(id)!;
          const base = game.attributes.base[id];
          const eff = effectiveAttr(game, id);
          const delta = eff - base;
          return (
            <div className="attr-card" key={id} style={{ ['--c' as string]: def.color }}>
              <h3>
                <span>{def.name}</span>
                <span className="val">
                  {eff}
                  {delta !== 0 && (
                    <span style={{ fontSize: '0.7rem', color: delta > 0 ? 'var(--brine)' : 'var(--blood)' }}>
                      {' '}
                      ({delta > 0 ? '+' : ''}
                      {delta})
                    </span>
                  )}
                </span>
              </h3>
              <div className="tag">“{def.tagline}”</div>
              <div className="desc">{def.description}</div>
              <div className="desc" style={{ marginTop: '0.4rem' }}>
                <b style={{ color: def.color }}>Good at:</b> {def.goodAt.join(', ')}.
              </div>
              <div className="desc" style={{ marginTop: '0.2rem' }}>
                <b style={{ color: 'var(--blood)' }}>Pitfall:</b> {def.pitfall}
              </div>
              {game.skillPoints > 0 && (
                <button className="btn raise" onClick={() => spend(id)} disabled={base >= 8}>
                  Raise {def.name} → {base + 1}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </OverlayShell>
  );
}

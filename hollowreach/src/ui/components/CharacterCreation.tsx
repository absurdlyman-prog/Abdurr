import { useMemo, useState } from 'react';
import { useGame } from '@game/state/store';
import { Content } from '@game/content';
import { ATTRIBUTE_IDS, type AttributeId, type AttributeScores } from '@game/types';
import { validateAllocation } from '@game/newgame';

// Character creation. Pick a name, a pronoun, and an archetype (a wound, not a
// class). The "Hollow Man" archetype unlocks free point allocation across the
// eight voices, with a 24-point budget and a live validity readout.

export function CharacterCreation() {
  const newGame = useGame((s) => s.newGame);
  const toMenu = useGame((s) => s.toMenu);

  const [name, setName] = useState('');
  const [pronoun, setPronoun] = useState<'he' | 'she' | 'they'>('they');
  const [archetypeId, setArchetypeId] = useState('the_clerk');

  const archetype = Content.archetype(archetypeId)!;
  const isFree = !!archetype.freeAllocation;

  const [alloc, setAlloc] = useState<AttributeScores>(() => baseScores());

  const total = useMemo(() => ATTRIBUTE_IDS.reduce((s, id) => s + alloc[id], 0), [alloc]);
  const valid = validateAllocation(alloc);

  const choose = (id: string) => {
    setArchetypeId(id);
    const a = Content.archetype(id)!;
    setAlloc({ ...(a.attributes as AttributeScores) });
  };

  const bump = (id: AttributeId, d: number) => {
    setAlloc((prev) => {
      const v = Math.max(1, Math.min(6, prev[id] + d));
      return { ...prev, [id]: v };
    });
  };

  const begin = () => {
    newGame({
      name,
      pronoun,
      archetypeId,
      attributes: isFree ? alloc : undefined,
    });
  };

  return (
    <div className="create">
      <header className="row">
        <button className="btn ghost" onClick={toMenu}>
          ← Back
        </button>
        <h1 className="title-xl" style={{ fontSize: '1.6rem', flex: 1, textAlign: 'center' }}>
          Who Washed Up?
        </h1>
        <span style={{ width: 80 }} />
      </header>

      <div className="scroll" style={{ paddingRight: '0.4rem' }}>
        <div className="row" style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="A name you may not remember…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <div className="row">
            {(['he', 'she', 'they'] as const).map((p) => (
              <button key={p} className={`btn ${pronoun === p ? 'primary' : 'ghost'}`} onClick={() => setPronoun(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="archetypes">
          {Content.archetypes.map((a) => (
            <button key={a.id} className={`btn arch-card ${a.id === archetypeId ? 'selected' : ''}`} onClick={() => choose(a.id)}>
              <h3>{a.name}</h3>
              <p>{a.blurb}</p>
              <span className="subtle" style={{ fontSize: '0.74rem' }}>
                {a.freeAllocation ? 'Free allocation (24 pts)' : spread(a.attributes as AttributeScores)}
              </span>
            </button>
          ))}
        </div>

        <h4 className="menu-tag" style={{ marginTop: '1.4rem' }}>
          The Eight Voices {isFree && <span className={valid.ok ? 'subtle' : 'lockwhy'}> · {total}/24 spent</span>}
        </h4>
        <div className="alloc">
          {ATTRIBUTE_IDS.map((id) => {
            const def = Content.attribute(id)!;
            return (
              <div className="alloc-row" key={id} style={{ borderLeft: `3px solid ${def.color}` }}>
                <div>
                  <div style={{ color: def.color }}>{def.name}</div>
                  <div className="hidden-note">{def.tagline}</div>
                </div>
                <div className="ctrl">
                  {isFree && (
                    <button className="btn ghost" onClick={() => bump(id, -1)} disabled={alloc[id] <= 1}>
                      −
                    </button>
                  )}
                  <span className="v" style={{ color: def.color }}>
                    {alloc[id]}
                  </span>
                  {isFree && (
                    <button className="btn ghost" onClick={() => bump(id, 1)} disabled={alloc[id] >= 6 || total >= 24}>
                      +
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="row">
        <span className="subtle">{archetype.startingThought && `Opening thought: ${Content.thought(archetype.startingThought)?.name}`}</span>
        <span className="spacer" />
        {isFree && !valid.ok && <span className="lockwhy">{valid.reason}</span>}
        <button className="btn primary" onClick={begin} disabled={isFree && !valid.ok}>
          Take the Quay →
        </button>
      </footer>
    </div>
  );
}

function baseScores(): AttributeScores {
  return { ...(Content.archetype('the_clerk')!.attributes as AttributeScores) };
}

function spread(a: AttributeScores): string {
  const top = ATTRIBUTE_IDS.map((id) => ({ id, v: a[id] }))
    .sort((x, y) => y.v - x.v)
    .slice(0, 2)
    .map((x) => `${Content.attribute(x.id)?.name} ${x.v}`)
    .join(' · ');
  return top;
}

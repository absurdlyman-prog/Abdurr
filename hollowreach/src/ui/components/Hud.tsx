import { useGame } from '@game/state/store';
import { Content } from '@game/content';
import { gradeForMinute } from '@engine/pixi/atmosphere/DayNight';

// Heads-up display: the in-world clock with time-of-day mood, the morale /
// endurance vitals as pip rows, the scene name, and the overlay launcher bar.

export function Hud() {
  const game = useGame((s) => s.game);
  const setOverlay = useGame((s) => s.setOverlay);
  const save = useGame((s) => s.save);
  const toMenu = useGame((s) => s.toMenu);
  if (!game) return null;

  const scene = Content.scene(game.location.scene);
  const minute = game.clock.minutes % 1440;
  const grade = gradeForMinute(minute);
  const openCases = Object.values(game.cases).filter((c) => !c.closed).length;

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="clock">
          <div className="time">{fmt(minute)}</div>
          <div className="label">
            Day {game.clock.day} · {grade.label}
          </div>
        </div>
        <div className="scene-name">{scene?.name}</div>
        <div className="vitals">
          <div className="vital">
            <span>Morale</span>
            <div className="pips">
              {Array.from({ length: game.vitals.moraleMax }).map((_, i) => (
                <span key={i} className={`pip morale ${i < game.vitals.morale ? 'on' : ''}`} />
              ))}
            </div>
          </div>
          <div className="vital">
            <span>Endurance</span>
            <div className="pips">
              {Array.from({ length: game.vitals.enduranceMax }).map((_, i) => (
                <span key={i} className={`pip endurance ${i < game.vitals.endurance ? 'on' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hud-bottom">
        <button className="btn" style={{ position: 'relative' }} onClick={() => setOverlay('cases')}>
          Case Board
          {openCases > 0 && <span className="skill-badge">{openCases}</span>}
        </button>
        <button className="btn" style={{ position: 'relative' }} onClick={() => setOverlay('sheet')}>
          The Voices
          {game.skillPoints > 0 && <span className="skill-badge">+{game.skillPoints}</span>}
        </button>
        <button className="btn" onClick={() => setOverlay('thoughts')}>
          Mind Reliquary
        </button>
        <button className="btn" onClick={() => setOverlay('inventory')}>
          Coat
        </button>
        <button className="btn" onClick={() => setOverlay('journal')}>
          Notebook
        </button>
        <button className="btn ghost" onClick={() => setOverlay('settings')}>
          ⚙
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            save('manual');
            alert('Saved.');
          }}
        >
          Save
        </button>
        <button className="btn ghost" onClick={toMenu}>
          Menu
        </button>
      </div>
    </div>
  );
}

function fmt(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

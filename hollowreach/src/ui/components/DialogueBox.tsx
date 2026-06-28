import { useEffect, useRef } from 'react';
import { useGame } from '@game/state/store';
import { Content } from '@game/content';
import type { DialogueLine } from '@game/types';

// The dialogue panel. Renders the current node's narration + speaker lines and
// any attribute interjections from passed passive checks, then the list of
// responses with their tone tint, skill-check tag, odds, and lock reasons.

export function DialogueBox() {
  const dialogue = useGame((s) => s.dialogue)!;
  const choose = useGame((s) => s.choose);
  const close = useGame((s) => s.closeDialogue);
  const logRef = useRef<HTMLDivElement>(null);

  const { view } = dialogue;
  const lines = [...view.lines, ...view.passiveLines];

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [view.nodeId]);

  // Keyboard: number keys pick responses, Esc exits if an exit option exists.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= view.responses.length) {
        const r = view.responses[n - 1];
        if (!r.locked) choose(r.id);
      }
      if (e.key === 'Escape') {
        const exit = view.responses.find((r) => r.exit && !r.locked);
        if (exit) choose(exit.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, choose]);

  return (
    <div className="dialogue-wrap">
      <div className="dialogue panel">
        <div className="dialogue-log scroll" ref={logRef}>
          {lines.map((line, i) => (
            <Line key={`${view.nodeId}-${i}`} line={line} />
          ))}
          {lines.length === 0 && <p className="subtle">…</p>}
        </div>
        <div className="responses">
          {view.responses.map((r, i) => (
            <button
              key={r.id}
              className={`response ${r.tone ?? 'neutral'} ${r.locked ? 'locked' : ''} ${r.check ? 'check' : ''}`}
              disabled={r.locked}
              onClick={() => !r.locked && choose(r.id)}
            >
              <span className="num">{i + 1}.</span>
              <span style={{ flex: 1 }}>
                {r.check && (
                  <span className={`check-tag ${r.check.kind}`} style={{ marginRight: '0.5rem' }}>
                    {Content.attribute(r.check.attribute)?.name} · {r.check.kind === 'red' ? 'Red' : 'White'} {r.check.dc}
                  </span>
                )}
                {r.text}
              </span>
              {r.locked && r.lockReason && <span className="lockwhy">{r.lockReason}</span>}
              {!r.locked && r.check && <span className="odds" style={{ color: oddsColor(r.check.odds) }}>{Math.round(r.check.odds * 100)}%</span>}
            </button>
          ))}
          {view.responses.length === 0 && (
            <button className="response" onClick={close}>
              <span className="num">→</span> <span>[Continue.]</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Line({ line }: { line: DialogueLine }) {
  const { who, color } = speakerInfo(line);
  return (
    <p className={`line ${line.speaker}`} style={color ? { color } : undefined}>
      {who && <span className="who" style={color ? { color } : undefined}>{who}{line.emotion ? ` · ${line.emotion}` : ''}</span>}
      <span className="text">{line.text}</span>
    </p>
  );
}

function speakerInfo(line: DialogueLine): { who: string | null; color?: string } {
  switch (line.speaker) {
    case 'attribute': {
      const a = line.speakerId ? Content.attribute(line.speakerId) : undefined;
      return { who: a?.name.toUpperCase() ?? 'INNER VOICE', color: a?.color };
    }
    case 'npc': {
      const c = line.speakerId ? Content.character(line.speakerId) : undefined;
      return { who: c?.name ?? 'Someone', color: c?.nameColor };
    }
    case 'self':
      return { who: 'You' };
    case 'narrator':
    default:
      return { who: null };
  }
}

function oddsColor(p: number): string {
  if (p >= 0.7) return 'var(--brine)';
  if (p >= 0.4) return 'var(--gold)';
  return 'var(--blood)';
}

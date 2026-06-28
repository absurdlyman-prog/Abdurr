import type { ReactNode } from 'react';
import { useGame } from '@game/state/store';

// Shared modal chrome for the simple overlays (inventory, journal, thoughts,
// sheet, settings). Click-outside and the ✕ both close.

export function OverlayShell({ title, children }: { title: string; children: ReactNode }) {
  const setOverlay = useGame((s) => s.setOverlay);
  return (
    <div className="overlay" onClick={() => setOverlay(null)}>
      <div className="overlay-card panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2>{title}</h2>
          <button className="close-x" onClick={() => setOverlay(null)}>
            ✕
          </button>
        </div>
        <div className="overlay-body scroll">{children}</div>
      </div>
    </div>
  );
}

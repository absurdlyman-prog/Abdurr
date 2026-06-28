import { useEffect } from 'react';
import { useGame } from '@game/state/store';

// Transient event feed (clues found, reputation shifts, level-ups, "they'll
// remember that"). Auto-expire after a few seconds; non-interactive.

export function Toasts() {
  const toasts = useGame((s) => s.toasts);
  const dismiss = useGame((s) => s.dismissToast);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), 4200));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  return (
    <div className="toasts">
      {toasts
        .filter((t) => t.message)
        .map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.message}
          </div>
        ))}
    </div>
  );
}

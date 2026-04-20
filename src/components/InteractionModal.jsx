import { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { checkInteractions, SEVERITY_ORDER } from '../utils/interactions';

export default function InteractionModal() {
  const { t, drugs, showInteractions, setShowInteractions } = useApp();
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const seenGenerics = new Set(selected.map((d) => d.genericName.toLowerCase()));
    const out = [];
    for (const d of drugs) {
      const g = d.genericName.toLowerCase();
      if (seenGenerics.has(g)) continue;
      if (g.includes(q) || d.packageName.toLowerCase().includes(q)) {
        out.push(d);
        seenGenerics.add(g);
        if (out.length >= 8) break;
      }
    }
    return out;
  }, [drugs, query, selected]);

  const findings = useMemo(
    () => checkInteractions(selected).sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]),
    [selected]
  );

  if (!showInteractions) return null;

  const add = (drug) => {
    setSelected((prev) => [...prev, drug]);
    setQuery('');
  };
  const remove = (id) => setSelected((prev) => prev.filter((d) => d._id !== id));

  return (
    <div className="modal-backdrop no-print" onClick={() => setShowInteractions(false)}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="modal-head">
          <div>
            <h2 className="modal-title">{t.interactions.title}</h2>
            <p className="modal-sub">{t.interactions.subtitle}</p>
          </div>
          <button className="icon-btn" onClick={() => setShowInteractions(false)} aria-label={t.detail.close}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="modal-body">
          <div className="inter-picker">
            <div className="inter-selected">
              {selected.map((d) => (
                <span key={d._id} className="chip">
                  <span className="chip-main">{d.genericName}</span>
                  <button onClick={() => remove(d._id)} aria-label="Remove">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="inter-search">
              <input
                type="search"
                className="input"
                placeholder={t.interactions.add}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {suggestions.length > 0 && (
                <ul className="inter-suggestions">
                  {suggestions.map((d) => (
                    <li key={d._id}>
                      <button onClick={() => add(d)}>
                        <span className="inter-sug-generic">{d.genericName}</span>
                        <span className="inter-sug-brand">{d.packageName}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="inter-results">
            {selected.length < 2 ? (
              <p className="muted center">Add at least two medications to screen.</p>
            ) : findings.length === 0 ? (
              <div className="inter-ok">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
                </svg>
                <p>{t.interactions.none}</p>
              </div>
            ) : (
              <ul className="inter-list">
                {findings.map((f, i) => (
                  <li key={i} className={'inter inter--' + f.severity}>
                    <div className="inter-head">
                      <span className={'sev sev--' + f.severity}>{t.interactions.severity[f.severity]}</span>
                      <span className="inter-pair">{f.aName} ↔ {f.bName}</span>
                    </div>
                    <p className="inter-effect">{f.effect}</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="disclaimer">{t.interactions.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

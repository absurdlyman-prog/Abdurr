import { useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';

export default function SearchBar() {
  const { query, setQuery, t, results, resetFilters } = useApp();
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        ref.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === ref.current) {
        ref.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="search no-print">
      <div className="search-input-wrap">
        <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={ref}
          className="search-input"
          type="search"
          placeholder={t.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck="false"
        />
        {query ? (
          <button className="search-clear" onClick={() => setQuery('')} aria-label={t.clear}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <kbd className="search-kbd">/</kbd>
        )}
      </div>

      <div className="search-meta">
        <span className="search-count">
          <strong>{results.length.toLocaleString()}</strong> {t.results}
        </span>
        <button className="search-reset" onClick={resetFilters}>{t.reset}</button>
      </div>
    </div>
  );
}

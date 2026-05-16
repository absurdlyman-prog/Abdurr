import { useState, useMemo, useRef } from 'react';
import { useDrugData } from '../contexts/DrugDataContext';
import {
  SYMPTOM_CHIPS,
  parseSymptomInput,
  resolveSymptoms,
  getIngredients,
  matchesDrug,
  isOTC,
} from '../utils/symptomMap';

function OTCResultCard({ drug }) {
  return (
    <div className="sl-result-card">
      <div className="sl-result-header">
        <div className="sl-result-names">
          <span className="sl-result-trade">{drug.packageName || '—'}</span>
          <span className="sl-result-generic">{drug.genericName || '—'}</span>
        </div>
        <span className="badge badge-otc">OTC</span>
      </div>
      <div className="sl-result-meta">
        {[drug.strength, drug.dosageForm].filter(Boolean).join(' · ') || '—'}
        {drug.manufacturerName && (
          <span className="sl-result-mfr"> · {drug.manufacturerName}</span>
        )}
      </div>
      <div className="sl-result-footer">
        <span className="sl-result-price">
          {drug.packagePrice !== null
            ? `AED ${drug.packagePrice.toFixed(2)}`
            : 'Price N/A'}
        </span>
        {drug.thiqaFormulary === 'Yes' && (
          <span className="badge badge-thiqa badge-sm">Thiqa ✓</span>
        )}
      </div>
    </div>
  );
}

export default function SymptomLookup() {
  const { drugs, loading } = useDrugData();
  const [input, setInput] = useState('');
  const [activeChips, setActiveChips] = useState(new Set());
  const inputRef = useRef(null);

  const toggleChip = (key) => {
    setActiveChips((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Combine typed input tokens + active chips
  const allSymptomKeys = useMemo(() => {
    const typedTokens = input.trim() ? parseSymptomInput(input) : [];
    const fromTyped = resolveSymptoms(typedTokens);
    return [...new Set([...fromTyped, ...activeChips])];
  }, [input, activeChips]);

  const ingredients = useMemo(() => getIngredients(allSymptomKeys), [allSymptomKeys]);

  const results = useMemo(() => {
    if (ingredients.length === 0) return [];
    return drugs.filter((d) => isOTC(d) && matchesDrug(d, ingredients));
  }, [drugs, ingredients]);

  const hasQuery = allSymptomKeys.length > 0;

  const clearAll = () => {
    setInput('');
    setActiveChips(new Set());
    inputRef.current?.focus();
  };

  return (
    <div className="sl-wrapper">
      {/* Input */}
      <div className="sl-input-section">
        <div className="sl-search-box">
          <svg className="sl-search-icon" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
          </svg>
          <input
            ref={inputRef}
            className="sl-input"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            placeholder="Type symptoms… e.g. cough + chest congestion"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Enter symptoms"
          />
          {(input || activeChips.size > 0) && (
            <button className="sl-clear-btn" onClick={clearAll} aria-label="Clear all">
              ✕
            </button>
          )}
        </div>
        <p className="sl-hint">
          Separate multiple symptoms with <strong>+</strong> or <strong>,</strong> — or tap the chips below
        </p>
      </div>

      {/* Symptom chips */}
      <div className="sl-chips">
        {SYMPTOM_CHIPS.map(({ label, key }) => (
          <button
            key={key}
            className={`sl-chip ${activeChips.has(key) ? 'sl-chip--active' : ''}`}
            onClick={() => toggleChip(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Matched ingredient pills */}
      {hasQuery && ingredients.length > 0 && (
        <div className="sl-ingredients-row">
          <span className="sl-ingredients-label">Searching for:</span>
          <div className="sl-ingredient-pills">
            {ingredients.map((ing) => (
              <span key={ing} className="sl-ingredient-pill">{ing}</span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && hasQuery && (
        <div className="sl-results-section">
          <div className="sl-results-header">
            <span className="sl-results-count">
              {results.length > 0
                ? <><strong>{results.length}</strong> OTC product{results.length !== 1 ? 's' : ''} found</>
                : 'No OTC products found for these symptoms'}
            </span>
          </div>

          {results.length > 0 ? (
            <div className="sl-results-grid">
              {results.map((d) => <OTCResultCard key={d._id} drug={d} />)}
            </div>
          ) : (
            <div className="sl-empty">
              <div className="sl-empty-icon">🔍</div>
              <p className="sl-empty-title">No matches in inventory</p>
              <p className="sl-empty-sub">
                The active ingredients for these symptoms may not be stocked as OTC items, or the symptom keyword may not be recognised yet.
              </p>
            </div>
          )}
        </div>
      )}

      {!hasQuery && !loading && (
        <div className="sl-idle">
          <div className="sl-idle-icon">💊</div>
          <p className="sl-idle-title">What symptoms are you treating?</p>
          <p className="sl-idle-sub">Type above or tap a symptom chip — we'll show matching OTC products from your formulary.</p>
        </div>
      )}
    </div>
  );
}

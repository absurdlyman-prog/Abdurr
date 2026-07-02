import { useDrugData } from '../contexts/DrugDataContext';

function dispenseBadge(mode) {
  const m = (mode || '').toLowerCase();
  if (m.includes('controlled') || m.includes('narcotic')) return { label: mode || 'Controlled', cls: 'badge-controlled' };
  if (m.includes('prescription')) return { label: 'Prescription Only', cls: 'badge-prescription' };
  if (m.includes('counter') || m.includes('otc')) return { label: 'OTC', cls: 'badge-otc' };
  return { label: mode || '—', cls: 'badge-default' };
}

export default function AlternativesPanel() {
  const { selectedDrug, alternatives, clearSelection } = useDrugData();
  if (!selectedDrug) return null;

  return (
    <div className="alt-panel" role="region" aria-label="Cheaper alternatives">
      <div className="alt-panel-header">
        <div>
          <h4 className="alt-panel-title">Cheapest Alternatives</h4>
          <p className="alt-panel-sub">
            All products containing <strong>{selectedDrug.genericName}</strong>,
            sorted by price
          </p>
        </div>
        <button className="alt-close-btn" onClick={clearSelection} aria-label="Close panel">✕</button>
      </div>

      {alternatives.length === 0 ? (
        <p className="alt-empty">No other products found with this generic name.</p>
      ) : (
        <div className="alt-list">
          {/* Include selected drug first, marked as "currently viewing" */}
          {[selectedDrug, ...alternatives].map((drug) => {
            // Determine the best price across all (selected + alternatives)
            const all = [selectedDrug, ...alternatives];
            const minPrice = Math.min(
              ...all.filter((d) => d.packagePrice !== null).map((d) => d.packagePrice)
            );
            const isBest = drug.packagePrice !== null && drug.packagePrice === minPrice;
            const badge = dispenseBadge(drug.dispenseMode);
            const isCurrent = drug._id === selectedDrug._id;

            return (
              <div key={drug._id} className={`alt-row ${isCurrent ? 'alt-row--current' : ''}`}>
                <div className="alt-row-info">
                  <div className="alt-row-name">
                    {drug.packageName || '—'}
                    {isCurrent && <span className="alt-current-tag">viewing</span>}
                  </div>
                  <div className="alt-row-meta">
                    {[drug.strength, drug.dosageForm].filter(Boolean).join(' · ') || '—'}
                    <span className="alt-row-mfr">{drug.manufacturerName || ''}</span>
                  </div>
                  <div className="alt-row-badges">
                    <span className={`badge badge-sm ${badge.cls}`}>{badge.label}</span>
                    {drug.thiqaFormulary === 'Yes' && (
                      <span className="badge badge-sm badge-thiqa">Thiqa ✓</span>
                    )}
                  </div>
                </div>
                <div className="alt-row-price">
                  {drug.packagePrice !== null
                    ? <span className="alt-price-value">AED {drug.packagePrice.toFixed(2)}</span>
                    : <span className="alt-price-na">N/A</span>}
                  {isBest && (
                    <span className="badge badge-best">Best Price</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

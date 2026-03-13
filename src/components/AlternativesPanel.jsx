import { useDrugData } from '../contexts/DrugDataContext';

function dispenseBadge(mode) {
  const m = (mode || '').toLowerCase();
  if (m.includes('controlled') || m.includes('narcotic')) return { label: mode || 'Controlled', cls: 'badge-controlled' };
  if (m.includes('prescription')) return { label: 'Prescription Only', cls: 'badge-prescription' };
  if (m.includes('counter') || m.includes('otc')) return { label: 'OTC', cls: 'badge-otc' };
  return { label: mode || '—', cls: 'badge-default' };
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

export default function AlternativesPanel() {
  const { selectedDrug, alternatives, clearSelection } = useDrugData();
  if (!selectedDrug) return null;

  const badge = dispenseBadge(selectedDrug.dispenseMode);

  // All drugs with same generic: selected first, then alternatives sorted cheapest-first
  const all = [selectedDrug, ...alternatives];

  // Find the minimum price across all variants
  const pricesWithValue = all.filter((d) => d.packagePrice !== null);
  const minPrice = pricesWithValue.length > 0
    ? Math.min(...pricesWithValue.map((d) => d.packagePrice))
    : null;

  return (
    <div className="alt-panel" role="region" aria-label="Drug detail and alternatives">
      {/* ── Drug Detail ── */}
      <div className="alt-panel-header">
        <div className="alt-panel-title-group">
          <h4 className="alt-panel-title">{selectedDrug.packageName || '—'}</h4>
          <p className="alt-panel-generic">{selectedDrug.genericName || '—'}</p>
        </div>
        <button className="alt-close-btn" onClick={clearSelection} aria-label="Close panel">✕</button>
      </div>

      <div className="drug-detail-section">
        <div className="drug-detail-badges">
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
          {selectedDrug.thiqaFormulary === 'Yes' && (
            <span className="badge badge-thiqa">Thiqa ✓</span>
          )}
          {selectedDrug.packagePrice !== null && selectedDrug.packagePrice === minPrice && alternatives.length > 0 && (
            <span className="badge badge-best">Best Price</span>
          )}
        </div>
        <div className="drug-detail-grid">
          <DetailRow label="Strength" value={selectedDrug.strength} />
          <DetailRow label="Dosage Form" value={selectedDrug.dosageForm} />
          <DetailRow label="Dispense Mode" value={selectedDrug.dispenseMode} />
          <DetailRow label="Manufacturer" value={selectedDrug.manufacturerName} />
          <DetailRow
            label="Public Price"
            value={selectedDrug.packagePrice !== null
              ? `AED ${selectedDrug.packagePrice.toFixed(2)}`
              : 'N/A'}
          />
          <DetailRow label="Status" value={selectedDrug.status} />
          <DetailRow
            label="Thiqa / ABM"
            value={selectedDrug.thiqaFormulary === 'Yes' ? 'Covered' : 'Not covered'}
          />
        </div>
      </div>

      {/* ── Alternatives ── */}
      {alternatives.length > 0 && (
        <>
          <div className="alt-section-header">
            <h5 className="alt-section-title">
              Cheapest Alternatives
              <span className="alt-count">{alternatives.length} other{alternatives.length !== 1 ? 's' : ''}</span>
            </h5>
            <p className="alt-panel-sub">
              All products containing <strong>{selectedDrug.genericName || '—'}</strong>, cheapest first
            </p>
          </div>
          <div className="alt-list">
            {all.map((drug) => {
              const isBest = minPrice !== null && drug.packagePrice === minPrice;
              const altBadge = dispenseBadge(drug.dispenseMode);
              const isCurrent = drug._id === selectedDrug._id;

              return (
                <div key={drug._id} className={`alt-row ${isCurrent ? 'alt-row--current' : ''}`}>
                  <div className="alt-row-info">
                    <div className="alt-row-name">
                      {drug.packageName || '—'}
                      {isCurrent && <span className="alt-current-tag">selected</span>}
                    </div>
                    <div className="alt-row-meta">
                      {[drug.strength, drug.dosageForm].filter(Boolean).join(' · ') || '—'}
                      {drug.manufacturerName && (
                        <span className="alt-row-mfr">{drug.manufacturerName}</span>
                      )}
                    </div>
                    <div className="alt-row-badges">
                      <span className={`badge badge-sm ${altBadge.cls}`}>{altBadge.label}</span>
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
        </>
      )}

      {alternatives.length === 0 && (
        <p className="alt-empty">No other products found with this generic name.</p>
      )}
    </div>
  );
}

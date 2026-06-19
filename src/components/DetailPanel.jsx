import { useDrugData } from '../contexts/DrugDataContext';
import { dispenseBadge } from '../utils/badges';

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      <span className="detail-field-value">{value}</span>
    </div>
  );
}

export default function DetailPanel() {
  const { selectedDrug, clearSelection, alternatives } = useDrugData();
  if (!selectedDrug) return null;

  const badge = dispenseBadge(selectedDrug.dispenseMode);
  const all = [selectedDrug, ...alternatives];
  const prices = all.filter((d) => d.packagePrice !== null).map((d) => d.packagePrice);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;

  return (
    <aside className="detail-panel" aria-label="Drug detail">
      <div className="detail-header">
        <div className="detail-title-block">
          <div className="detail-trade">{selectedDrug.packageName || '—'}</div>
          <div className="detail-generic">{selectedDrug.genericName || '—'}</div>
        </div>
        <button className="btn-close-panel" onClick={clearSelection} aria-label="Close panel">✕</button>
      </div>

      <div className="detail-body">
        {/* Badges */}
        <div className="detail-badges">
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
          {selectedDrug.thiqaFormulary === 'Yes' && (
            <span className="badge badge-thiqa">Thiqa ✓</span>
          )}
          {selectedDrug.packagePrice !== null && selectedDrug.packagePrice === minPrice && alternatives.length > 0 && (
            <span className="badge badge-best">Best Price</span>
          )}
        </div>

        {/* Price */}
        <div>
          <div className="detail-price-label">Public Price</div>
          <div className="detail-price-value">
            {selectedDrug.packagePrice !== null
              ? `AED ${selectedDrug.packagePrice.toFixed(2)}`
              : 'N/A'}
          </div>
        </div>

        {/* Details grid */}
        <div>
          <div className="detail-section-title">Details</div>
          <div className="detail-fields">
            <Field label="Strength"     value={selectedDrug.strength} />
            <Field label="Dosage Form"  value={selectedDrug.dosageForm} />
            <Field label="Manufacturer" value={selectedDrug.manufacturerName} />
            <Field label="Status"       value={selectedDrug.status} />
            <Field
              label="Thiqa / ABM"
              value={selectedDrug.thiqaFormulary === 'Yes' ? 'Covered' : 'Not covered'}
            />
          </div>
        </div>

        {/* Alternatives */}
        <div>
          <div className="detail-section-title">
            {alternatives.length > 0
              ? `${alternatives.length} Alternative${alternatives.length !== 1 ? 's' : ''} — cheapest first`
              : 'Alternatives'}
          </div>
          {alternatives.length === 0 ? (
            <p className="alt-no-alts">No other products with this generic name.</p>
          ) : (
            <div className="alt-list">
              {all.map((drug) => {
                const isBest = minPrice !== null && drug.packagePrice === minPrice;
                const isCurrent = drug._id === selectedDrug._id;
                return (
                  <div key={drug._id} className={`alt-item ${isCurrent ? 'alt-current' : ''}`}>
                    <div className="alt-item-info">
                      <div className="alt-item-name" title={drug.packageName}>{drug.packageName || '—'}</div>
                      <div className="alt-item-meta">
                        {[drug.strength, drug.dosageForm, drug.manufacturerName].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div className="alt-item-right">
                      <span className="alt-item-price">
                        {drug.packagePrice !== null ? `AED ${drug.packagePrice.toFixed(2)}` : '—'}
                      </span>
                      {isBest && <span className="badge badge-best">Best</span>}
                      {isCurrent && <span className="badge badge-thiqa" style={{ fontSize: 10 }}>Selected</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

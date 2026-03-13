import { useDrugData } from '../contexts/DrugDataContext';

function dispenseBadge(mode) {
  const m = (mode || '').toLowerCase();
  if (m.includes('controlled') || m.includes('narcotic')) {
    return { label: mode || 'Controlled', cls: 'badge-controlled' };
  }
  if (m.includes('prescription')) {
    return { label: 'Prescription Only', cls: 'badge-prescription' };
  }
  if (m.includes('counter') || m.includes('otc')) {
    return { label: 'OTC', cls: 'badge-otc' };
  }
  return { label: mode || '—', cls: 'badge-default' };
}

export default function DrugCard({ drug }) {
  const { setSelectedDrug, selectedDrug } = useDrugData();
  const isSelected = selectedDrug?._id === drug._id;
  const badge = dispenseBadge(drug.dispenseMode);

  return (
    <article
      className={`drug-card ${isSelected ? 'drug-card--selected' : ''}`}
      onClick={() => setSelectedDrug(isSelected ? null : drug)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setSelectedDrug(isSelected ? null : drug)}
      aria-pressed={isSelected}
    >
      <div className="card-badges">
        <span className={`badge ${badge.cls}`}>{badge.label}</span>
        {drug.thiqaFormulary === 'Yes' && (
          <span className="badge badge-thiqa">Thiqa ✓</span>
        )}
      </div>

      <div className="card-names">
        <h3 className="card-trade-name">{drug.packageName || '—'}</h3>
        <p className="card-generic-name">{drug.genericName || '—'}</p>
      </div>

      <div className="card-meta">
        <span className="card-strength-form">
          {[drug.strength, drug.dosageForm].filter(Boolean).join(' · ') || '—'}
        </span>
      </div>

      <div className="card-footer">
        <div className="card-price">
          <span className="price-label">Public Price</span>
          <span className="price-value">
            {drug.packagePrice !== null
              ? `AED ${drug.packagePrice.toFixed(2)}`
              : 'N/A'}
          </span>
        </div>
        <div className="card-chevron" aria-hidden="true">
          {isSelected ? '▲' : '▼'}
        </div>
      </div>
    </article>
  );
}

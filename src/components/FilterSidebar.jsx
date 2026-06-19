import { useDrugData } from '../contexts/DrugDataContext';

const MODES = [
  { label: 'All',          value: 'All' },
  { label: 'Prescription', value: 'Prescription' },
  { label: 'OTC',          value: 'Over The Counter' },
  { label: 'Controlled',   value: 'Controlled' },
];

export default function FilterSidebar() {
  const { modeFilter, setModeFilter, thiqaOnly, setThiqaOnly, modeCounts, results, loading } = useDrugData();

  return (
    <aside className="filter-sidebar">
      <div>
        <div className="filter-section-title">Dispense Type</div>
        <div className="filter-options">
          {MODES.map(({ label, value }) => (
            <button
              key={value}
              className={`filter-option ${modeFilter === value ? 'active' : ''}`}
              onClick={() => setModeFilter(value)}
            >
              {label}
              <span className="filter-option-count">
                {(modeCounts[label] ?? 0).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="filter-section-title">Coverage</div>
        <div className="thiqa-row">
          <span className="thiqa-label">Thiqa / ABM only</span>
          <button
            className={`toggle ${thiqaOnly ? 'on' : ''}`}
            onClick={() => setThiqaOnly((v) => !v)}
            role="switch"
            aria-checked={thiqaOnly}
            aria-label="Filter Thiqa covered drugs only"
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>

      {!loading && (
        <div className="result-summary">
          <strong>{results.length.toLocaleString()}</strong> drugs shown
        </div>
      )}
    </aside>
  );
}

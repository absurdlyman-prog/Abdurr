import { useDrugData } from '../contexts/DrugDataContext';

const MODE_BUTTONS = [
  { label: 'All',          value: 'All' },
  { label: 'Prescription', value: 'Prescription' },
  { label: 'OTC',          value: 'Over The Counter' },
  { label: 'Controlled',   value: 'Controlled' },
];

export default function FilterBar() {
  const { modeFilter, setModeFilter, thiqaOnly, setThiqaOnly, results, loading } = useDrugData();

  return (
    <div className="filter-bar">
      <div className="filter-modes">
        {MODE_BUTTONS.map(({ label, value }) => (
          <button
            key={value}
            className={`filter-btn ${modeFilter === value ? 'active' : ''}`}
            onClick={() => setModeFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="thiqa-toggle">
        <input
          type="checkbox"
          checked={thiqaOnly}
          onChange={(e) => setThiqaOnly(e.target.checked)}
        />
        <span className={`thiqa-toggle-track${thiqaOnly ? ' is-on' : ''}`}>
          <span className="thiqa-toggle-thumb" />
        </span>
        <span className="thiqa-toggle-label">Thiqa covered only</span>
      </label>
      {!loading && (
        <span className="result-count">
          Showing <strong>{results.length.toLocaleString()}</strong> results
        </span>
      )}
    </div>
  );
}

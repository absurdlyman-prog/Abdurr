import { useApp } from '../contexts/AppContext';
import { downloadCsv, printPage } from '../utils/export';

export default function FilterBar() {
  const { t, modeFilter, setModeFilter, thiqaOnly, setThiqaOnly, results } = useApp();

  const modes = [
    { k: 'All',          label: t.all },
    { k: 'Prescription', label: t.prescription },
    { k: 'OTC',          label: t.otc },
    { k: 'Controlled',   label: t.controlled },
  ];

  return (
    <div className="filterbar no-print">
      <div className="filter-group" role="group" aria-label={t.filters}>
        {modes.map((m) => (
          <button
            key={m.k}
            className={'seg' + (modeFilter === m.k ? ' is-active' : '')}
            onClick={() => setModeFilter(m.k)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <label className="filter-check">
        <input
          type="checkbox"
          checked={thiqaOnly}
          onChange={(e) => setThiqaOnly(e.target.checked)}
        />
        <span>{t.thiqaOnly}</span>
      </label>

      <div className="filter-spacer" />

      <button className="icon-btn" onClick={() => downloadCsv(results)} title={t.export}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" />
        </svg>
        <span>{t.export}</span>
      </button>
      <button className="icon-btn" onClick={printPage} title={t.print}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9V3h12v6" /><rect x="6" y="13" width="12" height="8" rx="1" />
          <path d="M6 17H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
        </svg>
        <span>{t.print}</span>
      </button>
    </div>
  );
}

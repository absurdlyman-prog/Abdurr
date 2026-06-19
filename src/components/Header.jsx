import { useRef, useState } from 'react';
import { useDrugData } from '../contexts/DrugDataContext';
import ScanModal from './ScanModal';

export default function Header() {
  const { query, setQuery, results } = useDrugData();
  const [scanOpen, setScanOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const inputRef = useRef(null);

  function exportCSV() {
    const headers = ['Trade Name', 'Generic Name', 'Strength', 'Dosage Form', 'Dispense Mode', 'Price (AED)', 'Manufacturer', 'Thiqa'];
    const rows = results.map((d) => [
      d.packageName, d.genericName, d.strength, d.dosageForm,
      d.dispenseMode,
      d.packagePrice !== null ? d.packagePrice.toFixed(2) : '',
      d.manufacturerName, d.thiqaFormulary,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'formulary-export.csv';
    a.click();
    setExportOpen(false);
  }

  function printTable() {
    window.print();
    setExportOpen(false);
  }

  return (
    <>
      <header className="header">
        <div className="header-brand">
          <div className="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
              <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div>
            <div className="header-title">Smart Drug Formulary</div>
            <div className="header-subtitle">DOH Abu Dhabi · January 2026</div>
          </div>
        </div>

        <div className="header-search">
          <svg className="header-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            className="header-search-input"
            type="search"
            autoComplete="off"
            spellCheck="false"
            placeholder="Search by trade name, generic name, or manufacturer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search drugs"
          />
          {query && (
            <button
              className="header-search-clear"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="header-actions">
          <div className="export-btn-group">
            <button
              className={`btn-icon ${exportOpen ? 'active' : ''}`}
              onClick={() => setExportOpen((v) => !v)}
              title="Export"
              aria-label="Export"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            {exportOpen && (
              <div className="export-menu">
                <button className="export-menu-item" onClick={exportCSV}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Export CSV
                </button>
                <button className="export-menu-item" onClick={printTable}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  Print
                </button>
              </div>
            )}
          </div>

          <button className="btn-primary" onClick={() => setScanOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Scan Prescription
          </button>
        </div>
      </header>

      {scanOpen && <ScanModal onClose={() => setScanOpen(false)} />}

      {exportOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setExportOpen(false)} />
      )}
    </>
  );
}

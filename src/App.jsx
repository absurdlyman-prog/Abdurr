import { useState } from 'react';
import { DrugDataProvider, useDrugData } from './contexts/DrugDataContext';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import DrugTable from './components/DrugTable';
import DetailPanel from './components/DetailPanel';
import './App.css';

function MobileToolbar({ onFilterOpen, hasFilter }) {
  const { results, loading } = useDrugData();
  return (
    <div className="mobile-toolbar">
      <span className="mobile-toolbar-count">
        {loading ? 'Loading…' : <><strong>{results.length.toLocaleString()}</strong> drugs</>}
      </span>
      <button
        className={`btn-filter-toggle ${hasFilter ? 'has-filter' : ''}`}
        onClick={onFilterOpen}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        Filters{hasFilter ? ' ●' : ''}
      </button>
    </div>
  );
}

function FilterDrawer({ onClose }) {
  return (
    <div className="filter-drawer-overlay" onClick={onClose}>
      <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="filter-drawer-handle" />
        <div className="filter-drawer-title">Filters</div>
        <FilterSidebar onClose={onClose} />
      </div>
    </div>
  );
}

function AppContent() {
  const { loading, error, selectedDrug, modeFilter, thiqaOnly } = useDrugData();
  const [filterOpen, setFilterOpen] = useState(false);
  const hasFilter = modeFilter !== 'All' || thiqaOnly;

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="center-screen">
          <div className="spinner" />
          <p className="center-title">Loading Drug Formulary</p>
          <p className="center-sub">Parsing 22,000+ active medications…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header />
        <div className="center-screen">
          <span style={{ fontSize: 40 }}>⚠️</span>
          <p className="center-title">Could not load formulary</p>
          <div className="error-box">{error}</div>
          <p className="center-sub">
            Place <code>Doh_Drugs_January_2026.xlsx</code> in the <code>public/</code> folder and restart.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <MobileToolbar onFilterOpen={() => setFilterOpen(true)} hasFilter={hasFilter} />
      <div className="app-body">
        <FilterSidebar />
        <DrugTable />
        {selectedDrug && <DetailPanel />}
      </div>
      {filterOpen && <FilterDrawer onClose={() => setFilterOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <DrugDataProvider>
      <AppContent />
    </DrugDataProvider>
  );
}

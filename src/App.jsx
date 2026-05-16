import { useState } from 'react';
import { DrugDataProvider, useDrugData } from './contexts/DrugDataContext';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import DrugGrid from './components/DrugGrid';
import SymptomLookup from './components/SymptomLookup';
import './App.css';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p className="loading-title">Loading Drug Formulary</p>
      <p className="loading-sub">Parsing 22,000+ active medications…</p>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="error-screen">
      <div className="error-icon">⚠️</div>
      <h2 className="error-title">Could not load formulary</h2>
      <p className="error-message">{message}</p>
      <div className="error-hint">
        <p>Make sure <code>Doh_Drugs_January_2026.xlsx</code> is placed in the <code>public/</code> folder, then restart the dev server.</p>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'formulary', label: 'Formulary Search' },
  { id: 'symptom',   label: 'Symptom → OTC Lookup' },
];

function AppContent() {
  const { loading, error } = useDrugData();
  const [activeTab, setActiveTab] = useState('formulary');

  if (loading) return (
    <div className="app-layout">
      <Header />
      <main className="app-main"><LoadingScreen /></main>
    </div>
  );

  if (error) return (
    <div className="app-layout">
      <Header />
      <main className="app-main"><ErrorScreen message={error} /></main>
    </div>
  );

  return (
    <div className="app-layout">
      <Header />

      {/* Tab bar */}
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'formulary' ? (
        <>
          <div className="app-search-zone">
            <SearchBar />
            <FilterBar />
          </div>
          <main className="app-main">
            <DrugGrid />
          </main>
        </>
      ) : (
        <main className="app-main">
          <SymptomLookup />
        </main>
      )}

      <footer className="app-footer">
        Smart Drug Formulary · DOH Abu Dhabi · Data: January 2026
      </footer>
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

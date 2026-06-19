import { DrugDataProvider, useDrugData } from './contexts/DrugDataContext';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import DrugTable from './components/DrugTable';
import DetailPanel from './components/DetailPanel';
import './App.css';

function AppContent() {
  const { loading, error, selectedDrug } = useDrugData();

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
      <div className="app-body">
        <FilterSidebar />
        <DrugTable />
        {selectedDrug && <DetailPanel />}
      </div>
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

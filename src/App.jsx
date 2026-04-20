import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import Sidebar from './components/Sidebar';
import DrugTable from './components/DrugTable';
import DrugDetail from './components/DrugDetail';
import ScanModal from './components/ScanModal';
import InteractionModal from './components/InteractionModal';
import './App.css';

function LoadingScreen() {
  const { t } = useApp();
  return (
    <div className="loading">
      <div className="loading-spinner" />
      <p className="loading-title">{t.loading}</p>
      <p className="loading-sub">{t.loadingSub}</p>
    </div>
  );
}

function ErrorScreen({ message }) {
  const { t } = useApp();
  return (
    <div className="errorscreen">
      <div className="errorscreen-icon">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      </div>
      <h2>{t.errorTitle}</h2>
      <p>{message}</p>
      <p className="muted">{t.errorHint}</p>
    </div>
  );
}

function Shell() {
  const { loading, error, t } = useApp();

  return (
    <div className="shell">
      <Header />
      <div className="controls no-print">
        <SearchBar />
        <FilterBar />
      </div>

      {loading ? (
        <main className="main-center"><LoadingScreen /></main>
      ) : error ? (
        <main className="main-center"><ErrorScreen message={error} /></main>
      ) : (
        <main className="main-grid">
          <Sidebar />
          <section className="main-table"><DrugTable /></section>
          <DrugDetail />
        </main>
      )}

      <footer className="footer no-print">
        <span>{t.footer}</span>
        <span className="footer-sep">·</span>
        <span className="muted">{t.disclaimer}</span>
      </footer>

      <ScanModal />
      <InteractionModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

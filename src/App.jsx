import { DrugDataProvider, useDrugData } from './contexts/DrugDataContext';
import Header from './components/Header';
import FileLoader from './components/FileLoader';
import DrugTable from './components/DrugTable';
import './App.css';

function AppContent() {
  const { drugs, error } = useDrugData();
  const hasData = drugs.length > 0;

  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        {error && (
          <div className="error-banner" role="alert">
            <strong>Error loading file:</strong> {error}
          </div>
        )}
        {hasData ? <DrugTable /> : <FileLoader />}
      </main>
      <footer className="app-footer">
        Smart Drug Formulary &mdash; DOH Abu Dhabi &copy; 2026
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

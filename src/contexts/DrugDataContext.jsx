import { createContext, useContext, useState, useCallback } from 'react';
import { parseFormularyExcel } from '../utils/excelParser';

const DrugDataContext = createContext(null);

export function DrugDataProvider({ children }) {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);

  const loadFile = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await parseFormularyExcel(file);
      setDrugs(data);
      setFileName(file.name);
      setLoadedAt(new Date());
    } catch (err) {
      setError(err.message || 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setDrugs([]);
    setFileName(null);
    setLoadedAt(null);
    setError(null);
  }, []);

  return (
    <DrugDataContext.Provider
      value={{ drugs, loading, error, fileName, loadedAt, loadFile, reset }}
    >
      {children}
    </DrugDataContext.Provider>
  );
}

export function useDrugData() {
  const ctx = useContext(DrugDataContext);
  if (!ctx) throw new Error('useDrugData must be used within DrugDataProvider');
  return ctx;
}

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { loadFormularyFromPublic } from '../utils/excelParser';

const DrugDataContext = createContext(null);

const FUSE_OPTIONS = {
  keys: [
    { name: 'genericName', weight: 0.6 },
    { name: 'packageName', weight: 0.4 },
  ],
  threshold: 0.35,      // tolerates ~2-3 char typos
  minMatchCharLength: 2,
  includeScore: true,
};

export function DrugDataProvider({ children }) {
  const [drugs, setDrugs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Search / filter state
  const [query, setQuery]             = useState('');
  const [modeFilter, setModeFilter]   = useState('All');
  const [thiqaOnly, setThiqaOnly]     = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);

  // Auto-load the Excel from public/ on mount
  useEffect(() => {
    loadFormularyFromPublic()
      .then((data) => { setDrugs(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  // Build Fuse index whenever drugs change
  const fuse = useMemo(() => new Fuse(drugs, FUSE_OPTIONS), [drugs]);

  // Derive filtered results
  const results = useMemo(() => {
    let list;
    if (query.trim().length < 2) {
      list = drugs;
    } else {
      list = fuse.search(query.trim()).map((r) => r.item);
    }

    if (modeFilter !== 'All') {
      list = list.filter((d) =>
        d.dispenseMode.toLowerCase().includes(modeFilter.toLowerCase())
      );
    }
    if (thiqaOnly) {
      list = list.filter((d) => d.thiqaFormulary === 'Yes');
    }
    return list;
  }, [drugs, fuse, query, modeFilter, thiqaOnly]);

  // Cheapest alternatives for a selected drug (same generic, sorted by price)
  const alternatives = useMemo(() => {
    if (!selectedDrug) return [];
    return drugs
      .filter(
        (d) =>
          d.genericName.toLowerCase() === selectedDrug.genericName.toLowerCase() &&
          d._id !== selectedDrug._id
      )
      .sort((a, b) => {
        if (a.packagePrice === null) return 1;
        if (b.packagePrice === null) return -1;
        return a.packagePrice - b.packagePrice;
      });
  }, [drugs, selectedDrug]);

  const clearSelection = useCallback(() => setSelectedDrug(null), []);

  return (
    <DrugDataContext.Provider
      value={{
        drugs,
        loading,
        error,
        query,
        setQuery,
        modeFilter,
        setModeFilter,
        thiqaOnly,
        setThiqaOnly,
        results,
        selectedDrug,
        setSelectedDrug,
        clearSelection,
        alternatives,
      }}
    >
      {children}
    </DrugDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives with its provider by design
export function useDrugData() {
  const ctx = useContext(DrugDataContext);
  if (!ctx) throw new Error('useDrugData must be used within DrugDataProvider');
  return ctx;
}

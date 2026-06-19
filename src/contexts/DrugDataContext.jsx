import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { loadFormularyFromPublic } from '../utils/excelParser';

const DrugDataContext = createContext(null);

const FUSE_OPTIONS = {
  keys: [
    { name: 'genericName',  weight: 0.55 },
    { name: 'packageName',  weight: 0.35 },
    { name: 'manufacturerName', weight: 0.1 },
  ],
  threshold: 0.35,
  minMatchCharLength: 2,
  includeScore: true,
};

export function DrugDataProvider({ children }) {
  const [drugs, setDrugs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [query, setQuery]           = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [thiqaOnly, setThiqaOnly]   = useState(false);
  const [sortKey, setSortKey]       = useState(null);
  const [sortDir, setSortDir]       = useState('asc');
  const [selectedDrug, setSelectedDrug] = useState(null);

  useEffect(() => {
    loadFormularyFromPublic()
      .then((data) => { setDrugs(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  const fuse = useMemo(() => new Fuse(drugs, FUSE_OPTIONS), [drugs]);

  // Mode counts for filter sidebar
  const modeCounts = useMemo(() => {
    const counts = { All: drugs.length, Prescription: 0, OTC: 0, Controlled: 0 };
    for (const d of drugs) {
      const m = (d.dispenseMode || '').toLowerCase();
      if (m.includes('controlled') || m.includes('narcotic')) counts.Controlled++;
      else if (m.includes('counter') || m.includes('otc')) counts.OTC++;
      else if (m.includes('prescription')) counts.Prescription++;
    }
    return counts;
  }, [drugs]);

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

    if (sortKey) {
      list = [...list].sort((a, b) => {
        let va = a[sortKey];
        let vb = b[sortKey];
        if (sortKey === 'packagePrice') {
          va = va ?? Infinity;
          vb = vb ?? Infinity;
          return sortDir === 'asc' ? va - vb : vb - va;
        }
        va = (va || '').toLowerCase();
        vb = (vb || '').toLowerCase();
        return sortDir === 'asc'
          ? va.localeCompare(vb)
          : vb.localeCompare(va);
      });
    }

    return list;
  }, [drugs, fuse, query, modeFilter, thiqaOnly, sortKey, sortDir]);

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

  const toggleSort = useCallback((key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedDrug(null), []);

  return (
    <DrugDataContext.Provider value={{
      drugs, loading, error,
      query, setQuery,
      modeFilter, setModeFilter,
      thiqaOnly, setThiqaOnly,
      sortKey, sortDir, toggleSort,
      results, modeCounts,
      selectedDrug, setSelectedDrug, clearSelection,
      alternatives,
    }}>
      {children}
    </DrugDataContext.Provider>
  );
}

export function useDrugData() {
  const ctx = useContext(DrugDataContext);
  if (!ctx) throw new Error('useDrugData must be used within DrugDataProvider');
  return ctx;
}

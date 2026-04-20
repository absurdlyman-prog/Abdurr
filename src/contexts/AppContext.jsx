import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import Fuse from 'fuse.js';
import { loadFormularyFromPublic } from '../utils/excelParser';
import { storage } from '../utils/storage';
import { LANGS, T } from '../i18n/translations';

const Ctx = createContext(null);

const FUSE_OPTIONS = {
  keys: [
    { name: 'genericName',      weight: 0.55 },
    { name: 'packageName',      weight: 0.35 },
    { name: 'manufacturerName', weight: 0.10 },
  ],
  threshold: 0.35,
  minMatchCharLength: 2,
  includeScore: true,
};

const MAX_RECENT = 12;

export function AppProvider({ children }) {
  /* Data */
  const [drugs, setDrugs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  /* UI state */
  const [query, setQuery]           = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [thiqaOnly, setThiqaOnly]   = useState(false);
  const [selectedDrug, _setSelectedDrug] = useState(null);

  const [lang, _setLang] = useState(() => storage.getLang());
  const [favorites, _setFavorites] = useState(() => storage.getFavorites());
  const [recent, _setRecent]       = useState(() => storage.getRecent());

  const [showScan, setShowScan] = useState(false);
  const [showInteractions, setShowInteractions] = useState(false);

  /* Load formulary once */
  useEffect(() => {
    loadFormularyFromPublic()
      .then((data) => { setDrugs(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  /* Apply dir on <html> based on language */
  useEffect(() => {
    document.documentElement.setAttribute('dir', LANGS[lang].dir);
    document.documentElement.setAttribute('lang', lang);
    storage.setLang(lang);
  }, [lang]);

  /* Persist favorites / recent */
  useEffect(() => { storage.setFavorites(favorites); }, [favorites]);
  useEffect(() => { storage.setRecent(recent); }, [recent]);

  const setLang = useCallback((l) => _setLang(l in LANGS ? l : 'en'), []);
  const toggleLang = useCallback(() => _setLang((l) => (l === 'en' ? 'ar' : 'en')), []);

  const t = useMemo(() => T[lang] || T.en, [lang]);

  /* Fuse index */
  const fuse = useMemo(() => new Fuse(drugs, FUSE_OPTIONS), [drugs]);

  /* Filtered results */
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

  /* Alternatives (same generic, cheapest first) */
  const alternatives = useMemo(() => {
    if (!selectedDrug) return [];
    return drugs
      .filter(
        (d) =>
          d.genericName.toLowerCase() === selectedDrug.genericName.toLowerCase() &&
          d._id !== selectedDrug._id
      )
      .sort((a, b) => {
        if (a.packagePrice == null) return 1;
        if (b.packagePrice == null) return -1;
        return a.packagePrice - b.packagePrice;
      });
  }, [drugs, selectedDrug]);

  /* Selection pushes into recent */
  const setSelectedDrug = useCallback((drug) => {
    _setSelectedDrug(drug);
    if (drug) {
      _setRecent((prev) => {
        const filtered = prev.filter((r) => r._id !== drug._id);
        return [drug, ...filtered].slice(0, MAX_RECENT);
      });
    }
  }, []);

  const clearSelection = useCallback(() => _setSelectedDrug(null), []);

  /* Favorites */
  const isFavorite = useCallback(
    (drug) => !!drug && favorites.some((f) => f._id === drug._id),
    [favorites]
  );

  const toggleFavorite = useCallback((drug) => {
    if (!drug) return;
    _setFavorites((prev) =>
      prev.some((f) => f._id === drug._id)
        ? prev.filter((f) => f._id !== drug._id)
        : [drug, ...prev].slice(0, 100)
    );
  }, []);

  const resetFilters = useCallback(() => {
    setQuery('');
    setModeFilter('All');
    setThiqaOnly(false);
  }, []);

  const value = {
    drugs, loading, error,
    query, setQuery,
    modeFilter, setModeFilter,
    thiqaOnly, setThiqaOnly,
    results,
    selectedDrug, setSelectedDrug, clearSelection,
    alternatives,
    lang, setLang, toggleLang, t, dir: LANGS[lang].dir,
    favorites, isFavorite, toggleFavorite,
    recent,
    resetFilters,
    showScan, setShowScan,
    showInteractions, setShowInteractions,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

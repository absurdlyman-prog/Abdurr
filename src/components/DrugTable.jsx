import { useState, useMemo } from 'react';
import { useDrugData } from '../contexts/DrugDataContext';

const COLUMNS = [
  { key: 'genericName',      label: 'Generic Name' },
  { key: 'packageName',      label: 'Package Name' },
  { key: 'strength',         label: 'Strength' },
  { key: 'dosageForm',       label: 'Dosage Form' },
  { key: 'dispenseMode',     label: 'Dispense Mode' },
  { key: 'packagePrice',     label: 'Price (AED)' },
  { key: 'manufacturerName', label: 'Manufacturer' },
  { key: 'status',           label: 'Status' },
  { key: 'thiqaFormulary',   label: 'Thiqa / ABM Formulary' },
];

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function DrugTable() {
  const { drugs, fileName, loadedAt, reset } = useDrugData();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [thiqaFilter, setThiqaFilter] = useState('');
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(50);
  const [sortKey, setSortKey]         = useState('genericName');
  const [sortDir, setSortDir]         = useState('asc');

  // Derived filter options
  const statusOptions = useMemo(
    () => [...new Set(drugs.map((d) => d.status).filter(Boolean))].sort(),
    [drugs]
  );
  const thiqaOptions = useMemo(
    () => [...new Set(drugs.map((d) => d.thiqaFormulary).filter(Boolean))].sort(),
    [drugs]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return drugs.filter((d) => {
      if (statusFilter && d.status !== statusFilter) return false;
      if (thiqaFilter && d.thiqaFormulary !== thiqaFilter) return false;
      if (q) {
        return (
          d.genericName.toLowerCase().includes(q) ||
          d.packageName.toLowerCase().includes(q) ||
          d.manufacturerName.toLowerCase().includes(q) ||
          d.strength.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [drugs, search, statusFilter, thiqaFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (sortKey === 'packagePrice') {
        return sortDir === 'asc'
          ? (Number(av) || 0) - (Number(bv) || 0)
          : (Number(bv) || 0) - (Number(av) || 0);
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="drug-table-container">
      {/* Summary bar */}
      <div className="summary-bar">
        <div className="summary-info">
          <span className="summary-file">📄 {fileName}</span>
          <span className="summary-count">
            {filtered.length.toLocaleString()} / {drugs.length.toLocaleString()} drugs
          </span>
          {loadedAt && (
            <span className="summary-time">
              Loaded {loadedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
        <button className="btn-secondary" onClick={reset}>Load new file</button>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <input
          className="search-input"
          type="search"
          placeholder="Search generic name, package, manufacturer, strength…"
          value={search}
          onChange={handleSearch}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={thiqaFilter}
          onChange={(e) => { setThiqaFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Thiqa / ABM</option>
          {thiqaOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-scroll">
        <table className="drug-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={sortKey === col.key ? `sorted-${sortDir}` : ''}
                  title={`Sort by ${col.label}`}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="sort-arrow">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="no-results">
                  No drugs match the current filters.
                </td>
              </tr>
            ) : (
              pageData.map((drug) => (
                <tr key={drug._rowIndex}>
                  <td className="col-generic">{drug.genericName}</td>
                  <td>{drug.packageName}</td>
                  <td className="col-center">{drug.strength}</td>
                  <td className="col-center">{drug.dosageForm}</td>
                  <td className="col-center">{drug.dispenseMode}</td>
                  <td className="col-right">
                    {drug.packagePrice !== null
                      ? drug.packagePrice.toFixed(2)
                      : '—'}
                  </td>
                  <td>{drug.manufacturerName}</td>
                  <td>
                    <span className={`status-badge status-${drug.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {drug.status || '—'}
                    </span>
                  </td>
                  <td className="col-center">
                    {drug.thiqaFormulary || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-bar">
        <div className="page-size-selector">
          <label>Rows per page:</label>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="page-controls">
          <button
            className="btn-page"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
          >«</button>
          <button
            className="btn-page"
            onClick={() => setPage((p) => p - 1)}
            disabled={currentPage === 1}
          >‹</button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn-page"
            onClick={() => setPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >›</button>
          <button
            className="btn-page"
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
          >»</button>
        </div>
        <span className="page-range">
          {((currentPage - 1) * pageSize + 1).toLocaleString()}–
          {Math.min(currentPage * pageSize, sorted.length).toLocaleString()} of{' '}
          {sorted.length.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

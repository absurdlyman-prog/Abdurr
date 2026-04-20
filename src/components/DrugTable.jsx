import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../contexts/AppContext';

const PAGE_SIZE = 80;

function DispenseBadge({ mode }) {
  const m = String(mode || '').toLowerCase();
  let cls = 'badge badge--rx';
  if (m.includes('otc') || m.includes('counter')) cls = 'badge badge--otc';
  else if (m.includes('control')) cls = 'badge badge--ctrl';
  return <span className={cls}>{mode || '—'}</span>;
}

function ThiqaDot({ yes }) {
  return (
    <span className={'dot ' + (yes ? 'dot--on' : 'dot--off')} title={yes ? 'Thiqa / ABM covered' : 'Not covered'} />
  );
}

function formatPrice(v) {
  if (v == null) return '—';
  return v.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DrugTable() {
  const { t, results, selectedDrug, setSelectedDrug, loading } = useApp();
  const [page, setPage] = useState(1);
  const [lastResults, setLastResults] = useState(results);
  const scrollRef = useRef(null);
  if (lastResults !== results) {
    setLastResults(results);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [results, page]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!pageItems.length) return;
        const idx = selectedDrug ? pageItems.findIndex((d) => d._id === selectedDrug._id) : -1;
        const next = e.key === 'ArrowDown'
          ? Math.min(pageItems.length - 1, idx + 1)
          : Math.max(0, idx - 1);
        if (next >= 0) {
          e.preventDefault();
          setSelectedDrug(pageItems[next]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pageItems, selectedDrug, setSelectedDrug]);

  if (loading) return null;

  if (results.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <p className="empty-title">{t.noResults}</p>
        <p className="empty-sub">{t.noResultsHint}</p>
      </div>
    );
  }

  return (
    <div className="tablewrap">
      <div className="tablescroll" ref={scrollRef}>
        <table className="dtable">
          <thead>
            <tr>
              <th className="col-brand">{t.col.brand}</th>
              <th className="col-generic">{t.col.generic}</th>
              <th className="col-strength">{t.col.strength}</th>
              <th className="col-form">{t.col.form}</th>
              <th className="col-mode">{t.col.mode}</th>
              <th className="col-price">{t.col.price}</th>
              <th className="col-thiqa">{t.col.thiqa}</th>
              <th className="col-mfr">{t.col.mfr}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((d) => {
              const isSel = selectedDrug?._id === d._id;
              return (
                <tr
                  key={d._id}
                  className={'drow' + (isSel ? ' drow--active' : '')}
                  onClick={() => setSelectedDrug(d)}
                >
                  <td className="col-brand">
                    <div className="brand">{d.packageName || '—'}</div>
                  </td>
                  <td className="col-generic">{d.genericName}</td>
                  <td className="col-strength mono">{d.strength || '—'}</td>
                  <td className="col-form">{d.dosageForm || '—'}</td>
                  <td className="col-mode"><DispenseBadge mode={d.dispenseMode} /></td>
                  <td className="col-price mono">{formatPrice(d.packagePrice)}</td>
                  <td className="col-thiqa"><ThiqaDot yes={d.thiqaFormulary === 'Yes'} /></td>
                  <td className="col-mfr">{d.manufacturerName || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination no-print">
          <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          <span className="page-indicator">
            {page} / {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        </div>
      )}
    </div>
  );
}

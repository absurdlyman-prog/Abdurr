import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { monographOf, classOf } from '../utils/drugInfo';
import { checkInteractions } from '../utils/interactions';

function formatPrice(v) {
  if (v == null) return '—';
  return v.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DrugDetail() {
  const { t, selectedDrug, clearSelection, alternatives, favorites, isFavorite, toggleFavorite } = useApp();
  const [tab, setTab] = useState('overview');
  const [lastId, setLastId] = useState(selectedDrug?._id);
  if (lastId !== selectedDrug?._id) {
    setLastId(selectedDrug?._id);
    setTab('overview');
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && selectedDrug) clearSelection();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedDrug, clearSelection]);

  const mono = useMemo(() => selectedDrug ? monographOf(selectedDrug.genericName) : null, [selectedDrug]);
  const classes = useMemo(() => selectedDrug ? classOf(selectedDrug.genericName) : [], [selectedDrug]);

  // Quick interaction screen vs user's favorites
  const favInteractions = useMemo(() => {
    if (!selectedDrug || favorites.length === 0) return [];
    return checkInteractions([selectedDrug, ...favorites.filter((f) => f._id !== selectedDrug._id)]);
  }, [selectedDrug, favorites]);

  if (!selectedDrug) {
    return (
      <aside className="detail detail--empty no-print">
        <div className="detail-placeholder">
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 7h-8l-2-2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          </svg>
          <p>Select a medication to view clinical details.</p>
        </div>
      </aside>
    );
  }

  const tabs = [
    { k: 'overview',     label: t.detail.overview },
    { k: 'dosing',       label: t.detail.dosing },
    { k: 'side',         label: t.detail.sideEffects },
    { k: 'interactions', label: t.detail.interactions },
    { k: 'alternatives', label: t.detail.alternatives + ' · ' + alternatives.length },
  ];

  return (
    <aside className="detail no-print">
      <div className="detail-head">
        <div className="detail-head-top">
          <div className="detail-brand">{selectedDrug.packageName || selectedDrug.genericName}</div>
          <div className="detail-head-actions">
            <button
              className={'icon-btn' + (isFavorite(selectedDrug) ? ' icon-btn--active' : '')}
              onClick={() => toggleFavorite(selectedDrug)}
              title={isFavorite(selectedDrug) ? t.detail.saved : t.detail.save}
              aria-pressed={isFavorite(selectedDrug)}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill={isFavorite(selectedDrug) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
            <button className="icon-btn" onClick={clearSelection} title={t.detail.close} aria-label={t.detail.close}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="detail-generic">{selectedDrug.genericName}</div>
        <div className="detail-meta">
          <span className="mono">{selectedDrug.strength}</span>
          <span>·</span>
          <span>{selectedDrug.dosageForm}</span>
          <span>·</span>
          <span>{selectedDrug.dispenseMode}</span>
          {selectedDrug.thiqaFormulary === 'Yes' && (
            <><span>·</span><span className="tag tag--thiqa">Thiqa</span></>
          )}
        </div>
        {classes.length > 0 && (
          <div className="detail-classes">
            {classes.map((c) => <span key={c} className="tag tag--class">{c}</span>)}
          </div>
        )}
      </div>

      <nav className="detail-tabs" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb.k}
            role="tab"
            aria-selected={tab === tb.k}
            className={'detail-tab' + (tab === tb.k ? ' is-active' : '')}
            onClick={() => setTab(tb.k)}
          >
            {tb.label}
          </button>
        ))}
      </nav>

      <div className="detail-body">
        {tab === 'overview' && (
          <div className="section">
            {mono ? (
              <>
                <DetailRow label={t.detail.class} value={mono.class} />
                <DetailRow label={t.detail.mechanism} value={mono.mechanism} />
                <DetailRow label={t.detail.pregnancy} value={mono.pregnancy} />
                <div className="kv">
                  <div className="kv-k">{t.col.price}</div>
                  <div className="kv-v mono">AED {formatPrice(selectedDrug.packagePrice)}</div>
                </div>
                <div className="kv">
                  <div className="kv-k">{t.col.mfr}</div>
                  <div className="kv-v">{selectedDrug.manufacturerName || '—'}</div>
                </div>
              </>
            ) : (
              <p className="muted">{t.detail.noInfo}</p>
            )}
          </div>
        )}

        {tab === 'dosing' && (
          <div className="section">
            {mono ? (
              <>
                <DetailRow label={t.detail.adultDose} value={mono.adultDose} />
                <DetailRow label={t.detail.pediatricDose} value={mono.pediatricDose} />
                <DetailRow label={t.detail.maxDose} value={mono.maxDose} />
                <DetailRow label={t.detail.renal} value={mono.renal} />
                <DetailRow label={t.detail.hepatic} value={mono.hepatic} />
              </>
            ) : (
              <p className="muted">{t.detail.noInfo}</p>
            )}
          </div>
        )}

        {tab === 'side' && (
          <div className="section">
            {mono ? (
              <>
                <div className="kv">
                  <div className="kv-k">{t.detail.common}</div>
                  <div className="kv-v">
                    {mono.common?.length ? (
                      <ul className="bullets">{mono.common.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    ) : '—'}
                  </div>
                </div>
                <div className="kv">
                  <div className="kv-k">{t.detail.serious}</div>
                  <div className="kv-v">
                    {mono.serious?.length ? (
                      <ul className="bullets bullets--warn">{mono.serious.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    ) : '—'}
                  </div>
                </div>
              </>
            ) : (
              <p className="muted">{t.detail.noInfo}</p>
            )}
          </div>
        )}

        {tab === 'interactions' && (
          <div className="section">
            {favInteractions.length === 0 ? (
              <p className="muted">
                {favorites.length === 0
                  ? 'Add medications to your favorites to auto-screen for interactions with this drug.'
                  : t.interactions.none}
              </p>
            ) : (
              <ul className="inter-list">
                {favInteractions.map((f, i) => (
                  <li key={i} className={'inter inter--' + f.severity}>
                    <div className="inter-head">
                      <span className={'sev sev--' + f.severity}>{t.interactions.severity[f.severity]}</span>
                      <span className="inter-pair">{f.aName} ↔ {f.bName}</span>
                    </div>
                    <p className="inter-effect">{f.effect}</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="disclaimer">{t.interactions.disclaimer}</p>
          </div>
        )}

        {tab === 'alternatives' && (
          <div className="section">
            {alternatives.length === 0 ? (
              <p className="muted">No other products with the same generic in the formulary.</p>
            ) : (
              <ul className="alt-list">
                {alternatives.map((a, i) => {
                  const isBest = i === 0 && a.packagePrice != null;
                  return (
                    <li key={a._id} className="alt">
                      <div className="alt-main">
                        <div className="alt-brand">
                          {a.packageName}
                          {isBest && <span className="tag tag--best">Best price</span>}
                        </div>
                        <div className="alt-meta">
                          <span className="mono">{a.strength}</span> · {a.dosageForm} · {a.manufacturerName}
                        </div>
                      </div>
                      <div className="alt-price mono">{formatPrice(a.packagePrice)}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="kv">
      <div className="kv-k">{label}</div>
      <div className="kv-v">{value}</div>
    </div>
  );
}

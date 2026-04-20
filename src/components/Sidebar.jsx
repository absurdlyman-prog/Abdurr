import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

export default function Sidebar() {
  const { t, favorites, recent, setSelectedDrug, toggleFavorite } = useApp();
  const [tab, setTab] = useState('favorites');
  const list = tab === 'favorites' ? favorites : recent;
  const empty = tab === 'favorites' ? t.noFavorites : t.noRecent;

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'favorites'}
          className={'sidebar-tab' + (tab === 'favorites' ? ' is-active' : '')}
          onClick={() => setTab('favorites')}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>{t.favorites}</span>
          <span className="count-pill">{favorites.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'recent'}
          className={'sidebar-tab' + (tab === 'recent' ? ' is-active' : '')}
          onClick={() => setTab('recent')}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
          </svg>
          <span>{t.recent}</span>
          <span className="count-pill">{recent.length}</span>
        </button>
      </div>

      <div className="sidebar-body">
        {list.length === 0 ? (
          <p className="sidebar-empty">{empty}</p>
        ) : (
          <ul className="sidebar-list">
            {list.map((d) => (
              <li key={d._id} className="sidebar-item">
                <button className="sidebar-item-btn" onClick={() => setSelectedDrug(d)}>
                  <span className="sidebar-item-brand">{d.packageName || d.genericName}</span>
                  <span className="sidebar-item-generic">{d.genericName}</span>
                  <span className="sidebar-item-meta">{d.strength} · {d.dosageForm}</span>
                </button>
                {tab === 'favorites' && (
                  <button
                    className="sidebar-item-remove"
                    onClick={() => toggleFavorite(d)}
                    aria-label="Remove from favorites"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

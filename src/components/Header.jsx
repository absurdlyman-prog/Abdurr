import { useApp } from '../contexts/AppContext';

export default function Header() {
  const { t, lang, toggleLang, setShowScan, setShowInteractions } = useApp();

  return (
    <header className="hdr no-print">
      <div className="hdr-brand">
        <div className="hdr-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M2 12h20" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <div className="hdr-titles">
          <h1 className="hdr-title">{t.appTitle}</h1>
          <p className="hdr-sub">{t.appSubtitle} · {t.dataVersion}</p>
        </div>
      </div>

      <nav className="hdr-actions">
        <button className="hdr-btn" onClick={() => setShowInteractions(true)} title={t.checkInteractions}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="6" cy="12" r="3" /><circle cx="18" cy="12" r="3" /><path d="M9 12h6" />
          </svg>
          <span>{t.checkInteractions}</span>
        </button>
        <button className="hdr-btn hdr-btn--primary" onClick={() => setShowScan(true)} title={t.scanBtn}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M7 10h10M7 14h6" />
          </svg>
          <span>{t.scanBtn}</span>
        </button>
        <button
          className="hdr-lang"
          onClick={toggleLang}
          title="Switch language"
          aria-label="Switch language"
        >
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
      </nav>
    </header>
  );
}

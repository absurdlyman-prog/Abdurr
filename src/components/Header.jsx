import ScanModal from './ScanModal';
import { useState } from 'react';

export default function Header() {
  const [scanOpen, setScanOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="header-logo-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
                <path d="M12 8v8m-4-4h8" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h1 className="header-title">Smart Drug Formulary</h1>
              <p className="header-subtitle">DOH Abu Dhabi · January 2026</p>
            </div>
          </div>
          <button className="btn-scan" onClick={() => setScanOpen(true)}>
            📷 Scan Prescription
          </button>
        </div>
      </header>
      {scanOpen && <ScanModal onClose={() => setScanOpen(false)} />}
    </>
  );
}

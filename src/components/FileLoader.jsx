import { useRef, useState } from 'react';
import { useDrugData } from '../contexts/DrugDataContext';

export default function FileLoader() {
  const { loadFile, loading } = useDrugData();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    loadFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="file-loader-wrapper">
      <div
        className={`drop-zone ${dragging ? 'dragging' : ''} ${loading ? 'loading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload Excel file"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {loading ? (
          <div className="loader-content">
            <div className="spinner" />
            <p>Parsing formulary data&hellip;</p>
            <p className="loader-sub">This may take a moment for large files</p>
          </div>
        ) : (
          <div className="loader-content">
            <div className="upload-icon">📂</div>
            <p className="loader-title">Load Drug Formulary</p>
            <p className="loader-sub">
              Drop <strong>Doh_Drugs_January_2026.xlsx</strong> here or click to browse
            </p>
            <button className="btn-primary" tabIndex={-1}>Select File</button>
          </div>
        )}
      </div>
    </div>
  );
}

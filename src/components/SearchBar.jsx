import { useRef } from 'react';
import { useDrugData } from '../contexts/DrugDataContext';

export default function SearchBar() {
  const { query, setQuery } = useDrugData();
  const inputRef = useRef(null);

  return (
    <div className="search-wrapper">
      <div className="search-box">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef}
          className="search-input"
          type="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          placeholder="Search generic or trade name… (e.g. rampril, panadol)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search drugs"
        />
        {query && (
          <button className="search-clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

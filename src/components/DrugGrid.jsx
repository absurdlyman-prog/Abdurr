import { useState, useEffect, useRef } from 'react';
import { useDrugData } from '../contexts/DrugDataContext';
import DrugCard from './DrugCard';
import AlternativesPanel from './AlternativesPanel';

const PAGE_SIZE = 48;

export default function DrugGrid() {
  const { results, selectedDrug, loading, query, modeFilter, thiqaOnly } = useDrugData();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // Reset visible count when filters/search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, modeFilter, thiqaOnly]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < results.length) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, results.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, results.length]);

  if (loading) return null;

  if (results.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💊</div>
        <p className="empty-title">No drugs found</p>
        <p className="empty-sub">Try adjusting your search or filters</p>
      </div>
    );
  }

  const visible = results.slice(0, visibleCount);
  const selectedIndex = selectedDrug
    ? visible.findIndex((d) => d._id === selectedDrug._id)
    : -1;

  const items = [];
  for (let i = 0; i < visible.length; i++) {
    items.push(<DrugCard key={visible[i]._id} drug={visible[i]} />);
    if (i === selectedIndex) {
      items.push(
        <div key="alternatives-panel" className="alternatives-panel-row">
          <AlternativesPanel />
        </div>
      );
    }
  }

  const remaining = results.length - visibleCount;

  return (
    <div className="drug-grid-wrapper">
      <div className="drug-grid">{items}</div>
      {remaining > 0 && (
        <div className="load-more-area">
          <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />
          <button
            className="btn-load-more"
            onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, results.length))}
          >
            Load more ({remaining.toLocaleString()} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

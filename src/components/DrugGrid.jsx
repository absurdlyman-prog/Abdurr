import { useDrugData } from '../contexts/DrugDataContext';
import DrugCard from './DrugCard';
import AlternativesPanel from './AlternativesPanel';

const PAGE_SIZE = 48;

export default function DrugGrid() {
  const { results, selectedDrug, loading } = useDrugData();

  if (loading) return null; // loading handled by parent

  if (results.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💊</div>
        <p className="empty-title">No drugs found</p>
        <p className="empty-sub">Try adjusting your search or filters</p>
      </div>
    );
  }

  // Show first PAGE_SIZE results (performance guard for no-query state)
  const visible = results.slice(0, PAGE_SIZE);
  const hidden = results.length - visible.length;

  // Find position of selected card to insert panel right after its row
  const selectedIndex = selectedDrug
    ? visible.findIndex((d) => d._id === selectedDrug._id)
    : -1;

  // Insert AlternativesPanel after the selected card
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

  return (
    <div className="drug-grid-wrapper">
      <div className="drug-grid">{items}</div>
      {hidden > 0 && (
        <p className="grid-hint">
          Showing first {PAGE_SIZE.toLocaleString()} of {results.length.toLocaleString()} results.{' '}
          Refine your search to narrow down.
        </p>
      )}
    </div>
  );
}

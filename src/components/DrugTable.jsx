import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDrugData } from '../contexts/DrugDataContext';
import { dispenseBadge } from '../utils/badges';

const COLUMNS = [
  { key: 'packageName',      label: 'Trade Name',      cls: 'col-trade',    sortable: true },
  { key: 'genericName',      label: 'Generic Name',    cls: 'col-generic',  sortable: true },
  { key: 'strength',         label: 'Strength / Form', cls: 'col-strength', sortable: false },
  { key: 'dispenseMode',     label: 'Type',            cls: 'col-type',     sortable: true },
  { key: 'thiqaFormulary',   label: 'Thiqa',           cls: 'col-thiqa',    sortable: false },
  { key: 'packagePrice',     label: 'Price (AED)',     cls: 'col-price',    sortable: true },
  { key: 'manufacturerName', label: 'Manufacturer',    cls: 'col-mfr',      sortable: true },
];

const ROW_HEIGHT = 48;

export default function DrugTable() {
  const { results, selectedDrug, setSelectedDrug, sortKey, sortDir, toggleSort } = useDrugData();
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  if (results.length === 0) {
    return (
      <div className="table-area">
        <div className="center-screen">
          <span style={{ fontSize: 36, marginBottom: 4 }}>💊</span>
          <p className="center-title">No drugs found</p>
          <p className="center-sub">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  const topPad = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const lastItem = virtualItems[virtualItems.length - 1];
  const bottomPad = lastItem ? totalSize - (lastItem.start + lastItem.size) : 0;

  return (
    <div className="table-area">
      <div className="table-scroll" ref={parentRef}>
        <table className="drug-table" role="grid">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`${col.cls} ${col.sortable ? 'th-sortable' : ''} ${sortKey === col.key ? 'sorted' : ''}`}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                >
                  <div className="th-inner">
                    {col.label}
                    {col.sortable && (
                      <span className="sort-icon">
                        {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topPad > 0 && (
              <tr style={{ height: topPad }}>
                <td colSpan={COLUMNS.length} style={{ padding: 0, border: 'none' }} />
              </tr>
            )}

            {virtualItems.map((vRow) => {
              const drug = results[vRow.index];
              const isSelected = selectedDrug?._id === drug._id;
              const badge = dispenseBadge(drug.dispenseMode);

              return (
                <tr
                  key={drug._id}
                  className={isSelected ? 'row-selected' : ''}
                  onClick={() => setSelectedDrug(isSelected ? null : drug)}
                  aria-selected={isSelected}
                  style={{ height: ROW_HEIGHT }}
                >
                  <td className="cell-trade col-trade" title={drug.packageName}>{drug.packageName || '—'}</td>
                  <td className="cell-generic col-generic" title={drug.genericName}>{drug.genericName || '—'}</td>
                  <td className="cell-strength col-strength">
                    {[drug.strength, drug.dosageForm].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="col-type">
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="col-thiqa">
                    {drug.thiqaFormulary === 'Yes'
                      ? <span className="thiqa-check">✓</span>
                      : <span className="thiqa-dash">—</span>}
                  </td>
                  <td className="col-price">
                    {drug.packagePrice !== null
                      ? <span className="cell-price">{drug.packagePrice.toFixed(2)}</span>
                      : <span className="cell-price-na">—</span>}
                  </td>
                  <td className="cell-mfr col-mfr" title={drug.manufacturerName}>{drug.manufacturerName || '—'}</td>
                </tr>
              );
            })}

            {bottomPad > 0 && (
              <tr style={{ height: bottomPad }}>
                <td colSpan={COLUMNS.length} style={{ padding: 0, border: 'none' }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

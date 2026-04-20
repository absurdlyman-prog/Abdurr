const HEADERS = [
  'Generic Name', 'Brand / Package', 'Strength', 'Dosage Form',
  'Dispense Mode', 'Package Price (AED)', 'Thiqa', 'Manufacturer',
];

function escape(v) {
  const s = v == null ? '' : String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function drugsToCsv(drugs) {
  const rows = [HEADERS.join(',')];
  for (const d of drugs) {
    rows.push([
      d.genericName, d.packageName, d.strength, d.dosageForm,
      d.dispenseMode,
      d.packagePrice == null ? '' : d.packagePrice.toFixed(2),
      d.thiqaFormulary, d.manufacturerName,
    ].map(escape).join(','));
  }
  return rows.join('\n');
}

export function downloadCsv(drugs, filename = 'formulary-export.csv') {
  const csv = drugsToCsv(drugs);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printPage() {
  window.print();
}

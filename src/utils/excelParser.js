import * as XLSX from 'xlsx';

const SHEET_NAME = 'Drugs (2)';

const COLUMN_MAP = {
  'Generic Name': 'genericName',
  'Package Name': 'packageName',
  'Strength': 'strength',
  'Dosage Form': 'dosageForm',
  'Dispense Mode': 'dispenseMode',
  'Package Price to Public': 'packagePrice',
  'Manufacturer Name': 'manufacturerName',
  'Status': 'status',
  'Included in Thiqa/ ABM - other than 1&7- Drug Formulary': 'thiqaFormulary',
};

export async function parseFormularyExcel(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    const available = workbook.SheetNames.join(', ');
    throw new Error(
      `Sheet "${SHEET_NAME}" not found. Available sheets: ${available}`
    );
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  return rows.map((row, index) => {
    const drug = { _rowIndex: index };
    for (const [excelCol, key] of Object.entries(COLUMN_MAP)) {
      drug[key] = row[excelCol] !== undefined ? String(row[excelCol]).trim() : '';
    }
    // Normalize price to number when possible
    const rawPrice = row['Package Price to Public'];
    drug.packagePrice =
      rawPrice !== undefined && rawPrice !== '' ? Number(rawPrice) : null;
    return drug;
  });
}

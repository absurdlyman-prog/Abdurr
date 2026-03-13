import * as XLSX from 'xlsx';

const SHEET_NAME = 'Drugs (2)';
// Try both the single-extension and double-extension variants that may exist in public/
const FILE_CANDIDATES = [
  '/Doh_Drugs_January_2026.xlsx',
  '/Doh_Drugs_January_2026.xlsx.xlsx',
];

// Strip all whitespace from a header string for safe comparison
const normalizeHeader = (h) => String(h ?? '').replace(/\s+/g, ' ').trim();

// Map normalized header → camelCase key
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

function safe(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

export async function loadFormularyFromPublic() {
  let lastError;
  for (const candidate of FILE_CANDIDATES) {
    try {
      const response = await fetch(candidate);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return parseBuffer(arrayBuffer);
      }
      lastError = `HTTP ${response.status} for ${candidate}`;
    } catch (err) {
      lastError = err.message;
    }
  }
  throw new Error(
    `Excel file not found. Tried: ${FILE_CANDIDATES.join(', ')}. ` +
    'Place Doh_Drugs_January_2026.xlsx in the public/ folder and restart.'
  );
}

export function parseFormularyExcel(file) {
  return file.arrayBuffer().then(parseBuffer);
}

async function parseBuffer(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    const available = workbook.SheetNames.join(', ');
    throw new Error(
      `Sheet "${SHEET_NAME}" not found. Available: ${available}`
    );
  }

  // Read raw rows with raw headers
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

  if (raw.length === 0) return [];

  // Build a normalized header → original header lookup from the first row
  const firstRow = raw[0];
  const headerMap = {}; // normalizedHeader → originalKey
  for (const key of Object.keys(firstRow)) {
    headerMap[normalizeHeader(key)] = key;
  }

  // Build accessor: camelKey → originalKey in the row objects
  const accessors = {};
  for (const [colHeader, camelKey] of Object.entries(COLUMN_MAP)) {
    const originalKey = headerMap[normalizeHeader(colHeader)];
    if (originalKey) accessors[camelKey] = originalKey;
  }

  const drugs = [];
  for (let i = 0; i < raw.length; i++) {
    const row = raw[i];
    const status = safe(row[accessors.status]);
    if (status.toLowerCase() !== 'active') continue;

    const rawPrice = row[accessors.packagePrice];
    const price = rawPrice !== '' && rawPrice !== undefined
      ? parseFloat(String(rawPrice).replace(/[^0-9.]/g, ''))
      : null;

    drugs.push({
      _id: i,
      genericName:      safe(row[accessors.genericName]),
      packageName:      safe(row[accessors.packageName]),
      strength:         safe(row[accessors.strength]),
      dosageForm:       safe(row[accessors.dosageForm]),
      dispenseMode:     safe(row[accessors.dispenseMode]),
      packagePrice:     isNaN(price) ? null : price,
      manufacturerName: safe(row[accessors.manufacturerName]),
      status,
      thiqaFormulary:   safe(row[accessors.thiqaFormulary]).toLowerCase() === 'yes' ? 'Yes' : 'No',
    });
  }

  return drugs;
}

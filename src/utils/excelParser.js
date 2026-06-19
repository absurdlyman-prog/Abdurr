import * as XLSX from 'xlsx';

const SHEET_NAME = 'Drugs';
const FILE_CANDIDATES = [
  '/Doh_Drugs_January_2026.xlsx',
  '/Doh_Drugs_January_2026.xlsx.xlsx',
];

const COLUMN_MAP = {
  'Generic Name':              'genericName',
  'Package Name':              'packageName',
  'Strength':                  'strength',
  'Dosage Form':               'dosageForm',
  'Dispense Mode':             'dispenseMode',
  'Package Price to Public':   'packagePrice',
  'Manufacturer Name':         'manufacturerName',
  'Status':                    'status',
  // present in some versions of the sheet
  'Included in Thiqa/ ABM - other than 1&7- Drug Formulary': 'thiqaFormulary',
};

const normalizeHeader = (h) => String(h ?? '').replace(/\s+/g, ' ').trim();

function safe(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function isHtmlBuffer(buffer) {
  const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 16));
  const text = String.fromCharCode(...bytes).toLowerCase();
  return text.startsWith('<!doctype') || text.startsWith('<html');
}

export async function loadFormularyFromPublic() {
  let lastError = 'Excel file not found.';

  for (const candidate of FILE_CANDIDATES) {
    try {
      const response = await fetch(candidate);
      if (!response.ok) {
        lastError = `HTTP ${response.status} for ${candidate}`;
        continue;
      }
      const arrayBuffer = await response.arrayBuffer();
      if (isHtmlBuffer(arrayBuffer)) {
        // Vite SPA fallback returned index.html — file doesn't exist
        lastError = `File not found: ${candidate}`;
        continue;
      }
      return parseBuffer(arrayBuffer);
    } catch (err) {
      lastError = err.message;
    }
  }

  throw new Error(
    `${lastError} — Place Doh_Drugs_January_2026.xlsx in the public/ folder and restart.`
  );
}

export function parseFormularyExcel(file) {
  return file.arrayBuffer().then(parseBuffer);
}

async function parseBuffer(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Try the known sheet name; fall back to the largest sheet
  let sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    const fallback = workbook.SheetNames.find((n) => n !== 'Version') ?? workbook.SheetNames[0];
    sheet = workbook.Sheets[fallback];
    if (!sheet) {
      throw new Error(`No usable sheet found. Available: ${workbook.SheetNames.join(', ')}`);
    }
  }

  const raw = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  if (raw.length === 0) return [];

  const firstRow = raw[0];
  const headerMap = {};
  for (const key of Object.keys(firstRow)) {
    headerMap[normalizeHeader(key)] = key;
  }

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

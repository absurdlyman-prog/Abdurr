// Prescription → dispensing matcher.
//
// Takes a prescribed { genericName, strength, form } (as read off a prescription)
// and ranks the formulary to find the package(s) that should be dispensed.
//
// All functions are pure so they can be unit-tested in isolation.

/* ───────────────────────── strength parsing ───────────────────────── */

const MASS_TO_MG = { mcg: 0.001, 'µg': 0.001, ug: 0.001, mg: 1, gm: 1000, g: 1000, kg: 1e6 };
const VOL_TO_ML  = { ml: 1, cc: 1, dl: 100, l: 1000 };

// Normalise free-text quirks so "mg/ml" and "mg per 5 ml" tokenise cleanly.
//   "per"  → "/" ,  a volume right after "/" with no number → implicit "1".
function normalizeStrengthText(raw) {
  return String(raw)
    .toLowerCase()
    .replace(/\bper\b/g, '/')
    .replace(/\/\s*(ml|cc|dl|l)\b/g, '/1 $1');
}

// Pull every "<number> <unit>" pair out of a free-text strength string.
function strengthTokens(raw) {
  const out = [];
  const re = /(\d+(?:\.\d+)?)\s*(mcg|µg|ug|mg|gm|g|kg|iu|units?|ml|cc|dl|l|%)/gi;
  let m;
  while ((m = re.exec(raw)) !== null) {
    out.push({ value: parseFloat(m[1]), unit: m[2].toLowerCase() });
  }
  return out;
}

// Normalise a strength string into a comparable shape.
//   "500 mg"        → { kind: 'mass',  values: [500] }
//   "500mg/125mg"   → { kind: 'mass',  values: [125, 500] }      (combo, sorted)
//   "250 mg/5 ml"   → { kind: 'ratio', value: 50 }               (mg per ml)
//   "0.05 %"        → { kind: 'percent', value: 0.05 }
//   "1000 IU/ml"    → { kind: 'ratio', value: 1000 }
export function parseStrength(raw) {
  if (!raw) return { kind: 'unknown', raw: '' };
  const str = normalizeStrengthText(raw).trim();
  const toks = strengthTokens(str);
  if (toks.length === 0) return { kind: 'unknown', raw: str };

  const pct = toks.find((t) => t.unit === '%');
  if (pct) return { kind: 'percent', value: pct.value, raw: str };

  const masses = toks.filter((t) => t.unit in MASS_TO_MG).map((t) => t.value * MASS_TO_MG[t.unit]);
  const ius    = toks.filter((t) => t.unit === 'iu' || t.unit === 'unit' || t.unit === 'units').map((t) => t.value);
  const vols   = toks.filter((t) => t.unit in VOL_TO_ML).map((t) => t.value * VOL_TO_ML[t.unit]);

  // A volume denominator alongside an amount means a concentration.
  if (vols.length > 0 && (masses.length > 0 || ius.length > 0)) {
    const amount = masses.length > 0 ? masses.reduce((a, b) => a + b, 0) : ius.reduce((a, b) => a + b, 0);
    const volume = vols.reduce((a, b) => a + b, 0);
    return { kind: 'ratio', value: volume ? amount / volume : amount, raw: str };
  }
  if (masses.length > 0) return { kind: 'mass', values: masses.sort((a, b) => a - b), raw: str };
  if (ius.length > 0)    return { kind: 'iu',   values: ius.sort((a, b) => a - b), raw: str };
  return { kind: 'unknown', raw: str };
}

function approxEqual(a, b, tol = 0.02) {
  if (a === b) return true;
  const scale = Math.max(Math.abs(a), Math.abs(b)) || 1;
  return Math.abs(a - b) / scale <= tol;
}

// Compare a prescribed strength to a package strength.
// Returns { score: 0..1, exact: boolean, comparable: boolean }.
export function strengthScore(rxStrength, drugStrength) {
  const A = parseStrength(rxStrength);
  const B = parseStrength(drugStrength);

  if (A.kind === 'unknown' || B.kind === 'unknown') return { score: 0, exact: false, comparable: false };
  if (A.kind !== B.kind) return { score: 0, exact: false, comparable: true }; // e.g. tablet mass vs liquid ratio

  if (A.kind === 'mass' || A.kind === 'iu') {
    const sameLen = A.values.length === B.values.length;
    if (sameLen && A.values.every((v, i) => approxEqual(v, B.values[i]))) {
      return { score: 1, exact: true, comparable: true };
    }
    // Every prescribed component is present in the package (e.g. rx single, package combo).
    const allFound = A.values.every((v) => B.values.some((w) => approxEqual(v, w)));
    if (allFound) return { score: 0.7, exact: false, comparable: true };
    // Single-value closeness (helps surface a near dose when exact is absent).
    if (A.values.length === 1 && B.values.length === 1) {
      const ratio = Math.min(A.values[0], B.values[0]) / Math.max(A.values[0], B.values[0]);
      return { score: ratio > 0.5 ? ratio * 0.5 : 0, exact: false, comparable: true };
    }
    return { score: 0, exact: false, comparable: true };
  }

  // ratio or percent — single comparable number
  if (approxEqual(A.value, B.value)) return { score: 1, exact: true, comparable: true };
  const ratio = Math.min(A.value, B.value) / Math.max(A.value, B.value);
  return { score: ratio > 0.5 ? ratio * 0.5 : 0, exact: false, comparable: true };
}

/* ───────────────────────── generic & form matching ───────────────────────── */

function normGeneric(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9+ ]/g, ' ').replace(/\s+/g, ' ').trim();
}

// 1 = identical, 0.85 = one contains the other, token-overlap otherwise, 0 = unrelated.
export function genericScore(rxGeneric, drugGeneric) {
  const a = normGeneric(rxGeneric);
  const b = normGeneric(drugGeneric);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (b.includes(a) || a.includes(b)) return 0.85;

  const aTokens = a.split(' ').filter(Boolean);
  const bTokens = new Set(b.split(' ').filter(Boolean));
  const overlap = aTokens.filter((t) => bTokens.has(t)).length;
  if (overlap === 0) return 0;
  return Math.min(0.8, (overlap / aTokens.length) * 0.8);
}

function normForm(s) {
  const x = (s || '').toLowerCase();
  const map = [
    [/tab/, 'tablet'], [/cap/, 'capsule'], [/syrup|syr\b/, 'syrup'],
    [/susp/, 'suspension'], [/inject|inj\b|vial|ampoule|amp\b/, 'injection'],
    [/solution|sol\b/, 'solution'], [/cream/, 'cream'], [/ointment|oint/, 'ointment'],
    [/drop/, 'drops'], [/inhaler|inhalation|puff|mdi/, 'inhaler'], [/gel/, 'gel'],
    [/suppository|supp/, 'suppository'], [/patch/, 'patch'], [/spray/, 'spray'],
    [/powder/, 'powder'], [/sachet/, 'sachet'], [/lotion/, 'lotion'],
  ];
  for (const [re, val] of map) if (re.test(x)) return val;
  return x.trim();
}

// 1 = same form (or no form prescribed), 0.2 = different, 0.5 = package form unknown.
export function formScore(rxForm, drugForm) {
  if (!rxForm) return 1;
  const a = normForm(rxForm);
  const b = normForm(drugForm);
  if (!b) return 0.5;
  if (a === b) return 1;
  return 0.2;
}

/* ───────────────────────── the matcher ───────────────────────── */

const GENERIC_FLOOR = 0.6; // must plausibly be the same active ingredient

// Rank the formulary for one prescribed medication.
// Returns an array of candidates, best-to-dispense first:
//   { drug, genericScore, strength: {score,exact}, formScore, confidence, exactStrength }
export function matchPrescription(drugs, rx, limit = 6) {
  const candidates = [];

  for (const drug of drugs) {
    const g = genericScore(rx.genericName, drug.genericName);
    if (g < GENERIC_FLOOR) continue;

    const s = strengthScore(rx.strength, drug.strength);
    const f = formScore(rx.form, drug.dosageForm);
    const confidence = Math.round((g * 0.5 + s.score * 0.4 + f * 0.1) * 100);

    candidates.push({ drug, genericScore: g, strength: s, formScore: f, confidence, exactStrength: s.exact });
  }

  candidates.sort((a, b) => {
    // Exact dose first — that's what "correct package to dispense" means.
    if (a.exactStrength !== b.exactStrength) return a.exactStrength ? -1 : 1;
    if (b.strength.score !== a.strength.score) return b.strength.score - a.strength.score;
    if (b.formScore !== a.formScore) return b.formScore - a.formScore;
    if (b.genericScore !== a.genericScore) return b.genericScore - a.genericScore;
    // Among equals, prefer Thiqa coverage, then the cheapest pack.
    const at = a.drug.thiqaFormulary === 'Yes';
    const bt = b.drug.thiqaFormulary === 'Yes';
    if (at !== bt) return at ? -1 : 1;
    const ap = a.drug.packagePrice ?? Infinity;
    const bp = b.drug.packagePrice ?? Infinity;
    return ap - bp;
  });

  return candidates.slice(0, limit);
}

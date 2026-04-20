import { classOf } from './drugInfo';

// Rule-based pairwise interaction screening using class tags.
// Each rule matches if BOTH classes are present across the two drugs.
// Severity: 'major' | 'moderate' | 'minor'

const RULES = [
  // Anticoagulants + bleeding risk
  { a: 'anticoagulant', b: 'nsaid',       severity: 'major',    effect: 'Increased bleeding risk (GI and systemic). Avoid combination; use paracetamol where possible.' },
  { a: 'anticoagulant', b: 'antiplatelet',severity: 'major',    effect: 'Additive bleeding risk. Combine only with clear indication and monitoring.' },
  { a: 'anticoagulant', b: 'ssri',        severity: 'moderate', effect: 'SSRIs impair platelet aggregation — monitor for bleeding/bruising.' },
  { a: 'anticoagulant', b: 'snri',        severity: 'moderate', effect: 'SNRIs may increase bleeding risk when combined with anticoagulants.' },
  { a: 'vka',           b: 'macrolide',   severity: 'major',    effect: 'Macrolides ↑ warfarin effect (CYP inhibition) — monitor INR closely.' },
  { a: 'vka',           b: 'fluoroquinolone', severity: 'major', effect: 'Fluoroquinolones ↑ INR — monitor closely.' },
  { a: 'vka',           b: 'antifungal',  severity: 'major',    effect: 'Azole antifungals markedly ↑ INR.' },

  // RAAS & potassium
  { a: 'acei',          b: 'arb',         severity: 'major',    effect: 'Dual RAAS blockade ↑ hyperkalemia, hypotension, AKI. Avoid.' },
  { a: 'acei',          b: 'k-sparing',   severity: 'major',    effect: 'Risk of hyperkalemia. Monitor K+ and renal function.' },
  { a: 'arb',           b: 'k-sparing',   severity: 'major',    effect: 'Risk of hyperkalemia. Monitor K+ and renal function.' },
  { a: 'acei',          b: 'nsaid',       severity: 'moderate', effect: '↑ AKI risk; NSAID may blunt antihypertensive effect.' },
  { a: 'arb',           b: 'nsaid',       severity: 'moderate', effect: '↑ AKI risk; NSAID may blunt antihypertensive effect.' },
  { a: 'diuretic',      b: 'nsaid',       severity: 'moderate', effect: 'NSAIDs reduce diuretic efficacy; ↑ AKI risk (triple whammy with ACEi/ARB).' },

  // Cardiac conduction
  { a: 'beta-blocker',  b: 'ccb-non-dhp', severity: 'major',    effect: 'Risk of severe bradycardia, heart block, and HF exacerbation.' },
  { a: 'negative-chronotrope', b: 'negative-chronotrope', severity: 'moderate', effect: 'Additive bradycardia — monitor HR.' },

  // QT prolongation
  { a: 'qt-prolonging', b: 'qt-prolonging', severity: 'major',  effect: 'Additive QT prolongation — risk of torsades de pointes. Consider ECG monitoring.' },

  // Serotonin syndrome
  { a: 'serotonergic',  b: 'serotonergic', severity: 'major',   effect: 'Risk of serotonin syndrome — monitor for tremor, clonus, hyperthermia, altered mental status.' },

  // Statin interactions
  { a: 'statin',        b: 'macrolide',   severity: 'major',    effect: 'Macrolides ↑ statin levels (esp. simvastatin/atorvastatin) → rhabdomyolysis risk.' },
  { a: 'statin',        b: 'antifungal',  severity: 'major',    effect: 'Azoles ↑ statin exposure — dose reduction or alternative required.' },
  { a: 'cyp3a4-substrate', b: 'cyp3a4-inhibitor', severity: 'moderate', effect: 'CYP3A4 inhibition may ↑ substrate drug levels — review dose.' },

  // Glucose
  { a: 'antidiabetic',  b: 'systemic-steroid', severity: 'moderate', effect: 'Steroids cause hyperglycemia — may require antidiabetic dose adjustment.' },
  { a: 'sulfonylurea',  b: 'antibiotic',  severity: 'minor',    effect: 'Some antibiotics (e.g., sulfonamides) may potentiate hypoglycemia.' },

  // CNS depression
  { a: 'benzodiazepine', b: 'opioid',     severity: 'major',    effect: 'Profound sedation, respiratory depression, and death — avoid concurrent use.' },
  { a: 'sedative',       b: 'opioid',     severity: 'major',    effect: 'Additive CNS/respiratory depression.' },
  { a: 'sedative',       b: 'sedative',   severity: 'moderate', effect: 'Additive CNS depression — use lowest effective doses.' },

  // Antibiotics & tetracyclines / fluoroquinolones with cations (generic flag)
  { a: 'tetracycline',  b: 'ppi',         severity: 'minor',    effect: 'Minor reduction in absorption; separate dosing when possible.' },
  { a: 'fluoroquinolone', b: 'ppi',       severity: 'minor',    effect: 'Divalent cations in some products ↓ FQ absorption.' },

  // Aspirin & ibuprofen
  { a: 'antiplatelet',  b: 'nsaid',       severity: 'moderate', effect: 'NSAIDs may blunt aspirin’s cardioprotective effect; ↑ GI bleeding.' },

  // Metformin & contrast — informational (no "contrast" class, skipped)
];

// Returns array of { a, b, aName, bName, severity, effect }
export function checkInteractions(drugs) {
  const items = drugs
    .filter(Boolean)
    .map((d) => ({ drug: d, classes: new Set(classOf(d.genericName)) }));

  const findings = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const A = items[i];
      const B = items[j];
      for (const rule of RULES) {
        const hit =
          (A.classes.has(rule.a) && B.classes.has(rule.b)) ||
          (A.classes.has(rule.b) && B.classes.has(rule.a));
        if (hit) {
          findings.push({
            aName: A.drug.genericName,
            bName: B.drug.genericName,
            aBrand: A.drug.packageName,
            bBrand: B.drug.packageName,
            severity: rule.severity,
            effect: rule.effect,
            classA: rule.a,
            classB: rule.b,
          });
        }
      }
    }
  }
  // Deduplicate: same pair + same effect
  const seen = new Set();
  return findings.filter((f) => {
    const key = [f.aName, f.bName, f.effect].sort().join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const SEVERITY_ORDER = { major: 0, moderate: 1, minor: 2 };

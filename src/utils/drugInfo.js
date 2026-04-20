// Local clinical reference database — keyed by normalized generic name.
// This is a pragmatic, non-exhaustive reference sourced from common monographs
// (BNF / Medscape / UpToDate style summaries). Always verify with official sources.

const norm = (s) => String(s || '').toLowerCase().trim().replace(/\s+/g, ' ');

// Therapeutic class tags used by the interactions engine.
// Values are lowercase tokens; a drug can belong to multiple classes.
const CLASS_MAP = {
  warfarin:            ['anticoagulant', 'vka'],
  apixaban:            ['anticoagulant', 'doac'],
  rivaroxaban:         ['anticoagulant', 'doac'],
  dabigatran:          ['anticoagulant', 'doac'],
  enoxaparin:          ['anticoagulant', 'lmwh'],
  heparin:             ['anticoagulant'],
  aspirin:             ['antiplatelet', 'nsaid', 'salicylate'],
  clopidogrel:         ['antiplatelet'],

  ibuprofen:           ['nsaid'],
  naproxen:            ['nsaid'],
  diclofenac:          ['nsaid'],
  celecoxib:           ['nsaid', 'cox2'],
  ketorolac:           ['nsaid'],
  mefenamic:           ['nsaid'],
  indomethacin:        ['nsaid'],

  paracetamol:         ['analgesic'],
  acetaminophen:       ['analgesic'],

  tramadol:            ['opioid', 'serotonergic'],
  morphine:            ['opioid'],
  codeine:             ['opioid'],
  fentanyl:            ['opioid'],
  oxycodone:           ['opioid'],

  amoxicillin:         ['antibiotic', 'penicillin'],
  ampicillin:          ['antibiotic', 'penicillin'],
  penicillin:          ['antibiotic', 'penicillin'],
  cephalexin:          ['antibiotic', 'cephalosporin'],
  ceftriaxone:         ['antibiotic', 'cephalosporin'],
  cefuroxime:          ['antibiotic', 'cephalosporin'],
  azithromycin:        ['antibiotic', 'macrolide', 'cyp3a4-inhibitor', 'qt-prolonging'],
  clarithromycin:      ['antibiotic', 'macrolide', 'cyp3a4-inhibitor', 'qt-prolonging'],
  erythromycin:        ['antibiotic', 'macrolide', 'cyp3a4-inhibitor', 'qt-prolonging'],
  ciprofloxacin:       ['antibiotic', 'fluoroquinolone', 'qt-prolonging'],
  levofloxacin:        ['antibiotic', 'fluoroquinolone', 'qt-prolonging'],
  moxifloxacin:        ['antibiotic', 'fluoroquinolone', 'qt-prolonging'],
  doxycycline:         ['antibiotic', 'tetracycline'],
  tetracycline:        ['antibiotic', 'tetracycline'],
  metronidazole:       ['antibiotic'],
  trimethoprim:        ['antibiotic'],
  sulfamethoxazole:    ['antibiotic', 'sulfonamide'],

  fluconazole:         ['antifungal', 'cyp3a4-inhibitor', 'qt-prolonging'],
  itraconazole:        ['antifungal', 'cyp3a4-inhibitor'],
  ketoconazole:        ['antifungal', 'cyp3a4-inhibitor'],
  voriconazole:        ['antifungal', 'cyp3a4-inhibitor'],

  lisinopril:          ['acei', 'antihypertensive'],
  enalapril:           ['acei', 'antihypertensive'],
  ramipril:            ['acei', 'antihypertensive'],
  perindopril:         ['acei', 'antihypertensive'],
  losartan:            ['arb', 'antihypertensive'],
  valsartan:           ['arb', 'antihypertensive'],
  telmisartan:         ['arb', 'antihypertensive'],
  irbesartan:          ['arb', 'antihypertensive'],

  amlodipine:          ['ccb-dhp', 'antihypertensive'],
  nifedipine:          ['ccb-dhp', 'antihypertensive'],
  felodipine:          ['ccb-dhp', 'antihypertensive'],
  verapamil:           ['ccb-non-dhp', 'antihypertensive', 'cyp3a4-inhibitor', 'negative-chronotrope'],
  diltiazem:           ['ccb-non-dhp', 'antihypertensive', 'cyp3a4-inhibitor', 'negative-chronotrope'],

  metoprolol:          ['beta-blocker', 'antihypertensive', 'negative-chronotrope'],
  atenolol:            ['beta-blocker', 'antihypertensive', 'negative-chronotrope'],
  bisoprolol:          ['beta-blocker', 'antihypertensive', 'negative-chronotrope'],
  carvedilol:          ['beta-blocker', 'antihypertensive', 'negative-chronotrope'],
  propranolol:         ['beta-blocker', 'antihypertensive', 'negative-chronotrope'],

  hydrochlorothiazide: ['diuretic', 'thiazide', 'antihypertensive'],
  chlorthalidone:      ['diuretic', 'thiazide', 'antihypertensive'],
  furosemide:          ['diuretic', 'loop'],
  bumetanide:          ['diuretic', 'loop'],
  spironolactone:      ['diuretic', 'k-sparing'],
  eplerenone:          ['diuretic', 'k-sparing'],

  atorvastatin:        ['statin', 'cyp3a4-substrate'],
  simvastatin:         ['statin', 'cyp3a4-substrate'],
  rosuvastatin:        ['statin'],
  pravastatin:         ['statin'],

  metformin:           ['antidiabetic', 'biguanide'],
  glibenclamide:       ['antidiabetic', 'sulfonylurea'],
  gliclazide:          ['antidiabetic', 'sulfonylurea'],
  glimepiride:         ['antidiabetic', 'sulfonylurea'],
  sitagliptin:         ['antidiabetic', 'dpp4'],
  empagliflozin:       ['antidiabetic', 'sglt2'],
  dapagliflozin:       ['antidiabetic', 'sglt2'],
  insulin:             ['antidiabetic', 'insulin'],

  sertraline:          ['ssri', 'serotonergic', 'antidepressant'],
  fluoxetine:          ['ssri', 'serotonergic', 'antidepressant', 'cyp2d6-inhibitor'],
  paroxetine:          ['ssri', 'serotonergic', 'antidepressant', 'cyp2d6-inhibitor'],
  citalopram:          ['ssri', 'serotonergic', 'antidepressant', 'qt-prolonging'],
  escitalopram:        ['ssri', 'serotonergic', 'antidepressant', 'qt-prolonging'],
  venlafaxine:         ['snri', 'serotonergic', 'antidepressant'],
  duloxetine:          ['snri', 'serotonergic', 'antidepressant'],
  amitriptyline:       ['tca', 'serotonergic', 'antidepressant', 'qt-prolonging'],

  ondansetron:         ['antiemetic', 'qt-prolonging', 'serotonergic'],
  metoclopramide:      ['antiemetic'],

  omeprazole:          ['ppi'],
  esomeprazole:        ['ppi'],
  pantoprazole:        ['ppi'],
  lansoprazole:        ['ppi'],
  rabeprazole:         ['ppi'],
  ranitidine:          ['h2ra'],
  famotidine:          ['h2ra'],

  salbutamol:          ['saba', 'bronchodilator'],
  albuterol:           ['saba', 'bronchodilator'],
  formoterol:          ['laba', 'bronchodilator'],
  salmeterol:          ['laba', 'bronchodilator'],
  tiotropium:          ['lama', 'bronchodilator'],
  ipratropium:         ['sama', 'bronchodilator'],
  budesonide:          ['ics', 'corticosteroid'],
  fluticasone:         ['ics', 'corticosteroid'],
  prednisolone:        ['systemic-steroid', 'corticosteroid'],
  dexamethasone:       ['systemic-steroid', 'corticosteroid'],

  levothyroxine:       ['thyroid-hormone'],

  cetirizine:          ['antihistamine'],
  loratadine:          ['antihistamine'],
  fexofenadine:        ['antihistamine'],
  diphenhydramine:     ['antihistamine', 'anticholinergic', 'sedative'],

  diazepam:            ['benzodiazepine', 'sedative'],
  lorazepam:           ['benzodiazepine', 'sedative'],
  alprazolam:          ['benzodiazepine', 'sedative'],
  clonazepam:          ['benzodiazepine', 'sedative'],
};

// Clinical monographs — abbreviated, practical. Not a full drug reference.
const MONOGRAPHS = {
  paracetamol: {
    class: 'Non-opioid analgesic / antipyretic',
    mechanism: 'Central COX inhibition; weak peripheral effect.',
    adultDose: '500–1000 mg PO/IV q4–6h PRN.',
    pediatricDose: '10–15 mg/kg PO q4–6h (max 5 doses/24h).',
    maxDose: 'Adults: 4 g/24h (≤3 g/24h if hepatic risk or chronic use).',
    renal: 'No adjustment for mild–moderate; extend interval in severe CKD.',
    hepatic: 'Caution; avoid in severe hepatic impairment.',
    pregnancy: 'Preferred analgesic in pregnancy.',
    common: ['Rash (rare)', 'Nausea'],
    serious: ['Hepatotoxicity with overdose or chronic excess'],
  },
  acetaminophen: { alias: 'paracetamol' },
  ibuprofen: {
    class: 'NSAID (non-selective COX-1/COX-2)',
    mechanism: 'Prostaglandin synthesis inhibition.',
    adultDose: '200–400 mg PO q4–6h; up to 600–800 mg q6–8h for inflammation.',
    pediatricDose: '5–10 mg/kg PO q6–8h (max 40 mg/kg/day).',
    maxDose: '3.2 g/24h (prescription); 1.2 g/24h OTC.',
    renal: 'Avoid in CKD stage ≥3, AKI risk.',
    hepatic: 'Caution; avoid in advanced cirrhosis.',
    pregnancy: 'Avoid after 20 wk (oligohydramnios, premature duct closure).',
    common: ['Dyspepsia', 'Nausea', 'Headache'],
    serious: ['GI bleed', 'AKI', 'Hypertension', 'CV events'],
  },
  amoxicillin: {
    class: 'Aminopenicillin antibiotic',
    mechanism: 'Inhibits bacterial cell-wall synthesis (PBP binding).',
    adultDose: '500 mg PO TID or 875 mg BID (×5–10 d depending on indication).',
    pediatricDose: '20–45 mg/kg/day divided BID–TID (high-dose AOM: 80–90 mg/kg/day).',
    maxDose: '3 g/day (higher per indication).',
    renal: 'Adjust if CrCl <30 mL/min.',
    hepatic: 'No routine adjustment.',
    pregnancy: 'Generally considered safe.',
    common: ['Diarrhoea', 'Rash', 'Nausea'],
    serious: ['Anaphylaxis', 'C. difficile colitis', 'SJS (rare)'],
  },
  azithromycin: {
    class: 'Macrolide antibiotic',
    mechanism: 'Binds 50S ribosome, inhibits protein synthesis.',
    adultDose: '500 mg PO day 1, then 250 mg daily ×4 d; or 500 mg daily ×3 d.',
    pediatricDose: '10 mg/kg day 1, then 5 mg/kg daily ×4 d.',
    maxDose: '500 mg/day.',
    renal: 'No adjustment for mild–moderate.',
    hepatic: 'Caution; avoid in hepatic impairment.',
    pregnancy: 'Use if benefit outweighs risk.',
    common: ['GI upset', 'Diarrhoea'],
    serious: ['QT prolongation', 'Hepatotoxicity', 'Hearing loss (long use)'],
  },
  metformin: {
    class: 'Biguanide antidiabetic',
    mechanism: 'Decreases hepatic glucose output; improves insulin sensitivity.',
    adultDose: 'Start 500 mg OD–BID; titrate to 1 g BID.',
    pediatricDose: '≥10 y: 500 mg BID; titrate to 2 g/day.',
    maxDose: '2 g/day (IR) or 2.5 g/day (some XR).',
    renal: 'Contraindicated if eGFR <30; reduce dose if 30–45.',
    hepatic: 'Avoid in significant hepatic impairment.',
    pregnancy: 'May be continued; consider insulin.',
    common: ['GI intolerance', 'Metallic taste', 'B12 deficiency'],
    serious: ['Lactic acidosis (rare)'],
  },
  lisinopril: {
    class: 'ACE inhibitor',
    mechanism: 'Blocks angiotensin II formation → vasodilation, ↓ aldosterone.',
    adultDose: 'HTN: 10 mg OD (5–40 mg). HF: start 2.5–5 mg OD.',
    pediatricDose: '≥6 y: 0.07 mg/kg OD (max 5 mg).',
    maxDose: '40 mg/day.',
    renal: 'Reduce dose if CrCl <30.',
    hepatic: 'No routine adjustment.',
    pregnancy: 'Contraindicated (teratogenic — fetal renal injury).',
    common: ['Dry cough', 'Dizziness', 'Hyperkalemia'],
    serious: ['Angioedema', 'AKI', 'Severe hypotension'],
  },
  amlodipine: {
    class: 'Dihydropyridine calcium channel blocker',
    mechanism: 'Peripheral arterial vasodilation via L-type Ca²⁺ block.',
    adultDose: '5 mg OD, up to 10 mg OD.',
    pediatricDose: '6–17 y: 2.5–5 mg OD.',
    maxDose: '10 mg/day.',
    renal: 'No adjustment.',
    hepatic: 'Start 2.5 mg OD.',
    pregnancy: 'Use only if benefit outweighs risk.',
    common: ['Peripheral edema', 'Flushing', 'Headache'],
    serious: ['Reflex tachycardia', 'Severe hypotension'],
  },
  atorvastatin: {
    class: 'HMG-CoA reductase inhibitor (statin)',
    mechanism: 'Reduces hepatic cholesterol synthesis → ↑ LDL-R expression.',
    adultDose: '10–80 mg PO OD (evening or anytime).',
    pediatricDose: '≥10 y FH: 10–20 mg OD.',
    maxDose: '80 mg/day.',
    renal: 'No adjustment.',
    hepatic: 'Contraindicated in active liver disease.',
    pregnancy: 'Contraindicated.',
    common: ['Myalgia', 'LFT elevation', 'GI upset'],
    serious: ['Rhabdomyolysis', 'Hepatitis'],
  },
  omeprazole: {
    class: 'Proton pump inhibitor',
    mechanism: 'Irreversible H⁺/K⁺-ATPase inhibition in parietal cells.',
    adultDose: '20–40 mg PO OD before breakfast.',
    pediatricDose: '≥1 y: 0.7–3.5 mg/kg/day.',
    maxDose: '40 mg BID for severe GERD / ZE syndrome.',
    renal: 'No adjustment.',
    hepatic: 'Max 20 mg/day.',
    pregnancy: 'Considered low risk.',
    common: ['Headache', 'Diarrhoea', 'Abdominal pain'],
    serious: ['Hypomagnesaemia', '↑ C. difficile risk', '↓ B12 on long use'],
  },
  losartan: {
    class: 'Angiotensin II receptor blocker (ARB)',
    mechanism: 'Blocks AT1 receptor.',
    adultDose: '50 mg OD (25–100 mg OD).',
    pediatricDose: '≥6 y: 0.7 mg/kg OD (max 50 mg).',
    maxDose: '100 mg/day.',
    renal: 'Start 25 mg if volume depleted / elderly.',
    hepatic: 'Start 25 mg.',
    pregnancy: 'Contraindicated (teratogenic).',
    common: ['Dizziness', 'Hyperkalemia'],
    serious: ['Angioedema (rare)', 'AKI'],
  },
  sertraline: {
    class: 'SSRI antidepressant',
    mechanism: 'Selective serotonin reuptake inhibition.',
    adultDose: '25–50 mg OD; titrate to 50–200 mg OD.',
    pediatricDose: 'OCD ≥6 y: 25 mg OD; titrate.',
    maxDose: '200 mg/day.',
    renal: 'No adjustment.',
    hepatic: 'Reduce dose / extend interval.',
    pregnancy: 'Often preferred SSRI; discuss risks.',
    common: ['Nausea', 'Insomnia', 'Sexual dysfunction', 'Diarrhoea'],
    serious: ['Serotonin syndrome', 'Hyponatraemia', 'QT (high dose)', 'Bleeding risk'],
  },
  salbutamol: {
    class: 'Short-acting β₂-agonist (SABA)',
    mechanism: 'β₂-adrenergic bronchial smooth-muscle relaxation.',
    adultDose: 'MDI 100 mcg: 1–2 puffs PRN (max 8/24h).',
    pediatricDose: '1–2 puffs PRN; neb 2.5 mg.',
    maxDose: 'Seek review if >1 canister/month.',
    renal: 'No adjustment.',
    hepatic: 'No adjustment.',
    pregnancy: 'Safe in asthma.',
    common: ['Tremor', 'Tachycardia', 'Hypokalaemia'],
    serious: ['Paradoxical bronchospasm', 'Severe hypokalaemia (high dose)'],
  },
  warfarin: {
    class: 'Vitamin K antagonist',
    mechanism: 'Inhibits vit-K epoxide reductase → ↓ factors II, VII, IX, X.',
    adultDose: 'Initiate 2–5 mg OD; adjust to target INR.',
    pediatricDose: 'Specialist initiation only.',
    maxDose: 'Titrated to INR.',
    renal: 'No routine adjustment; caution in severe CKD.',
    hepatic: 'Caution; lower doses may be sufficient.',
    pregnancy: 'Contraindicated (teratogenic).',
    common: ['Bruising', 'Minor bleeding'],
    serious: ['Major haemorrhage', 'Skin necrosis', 'Purple-toe syndrome'],
  },
  levothyroxine: {
    class: 'Thyroid hormone replacement',
    mechanism: 'Synthetic T4; converted peripherally to T3.',
    adultDose: '1.6 mcg/kg OD on empty stomach; start 25–50 mcg in elderly/cardiac.',
    pediatricDose: 'Weight-based, age-dependent.',
    maxDose: 'Titrated to TSH.',
    renal: 'No adjustment.',
    hepatic: 'No adjustment.',
    pregnancy: 'Continue; dose often increases ~30%.',
    common: ['Palpitations if overdosed'],
    serious: ['Thyrotoxicosis (overdose)', 'Atrial fibrillation'],
  },
  cetirizine: {
    class: 'Second-generation H₁ antihistamine',
    mechanism: 'Peripheral H₁ receptor antagonism.',
    adultDose: '10 mg PO OD.',
    pediatricDose: '6 m–2 y: 2.5 mg OD; 2–6 y: 2.5 mg BID; >6 y: 5–10 mg OD.',
    maxDose: '10 mg/day.',
    renal: 'Reduce if CrCl <30.',
    hepatic: 'Reduce dose.',
    pregnancy: 'Likely safe.',
    common: ['Drowsiness', 'Dry mouth'],
    serious: ['Rare'],
  },
};

export function classOf(genericName) {
  const key = resolveKey(genericName);
  return key ? CLASS_MAP[key] || [] : [];
}

export function monographOf(genericName) {
  const key = resolveKey(genericName);
  if (!key) return null;
  let entry = MONOGRAPHS[key];
  if (entry && entry.alias) entry = MONOGRAPHS[entry.alias];
  return entry || null;
}

function resolveKey(genericName) {
  const n = norm(genericName);
  if (!n) return null;
  // Exact token match first
  const tokens = n.split(/[^a-z]+/).filter(Boolean);
  for (const tok of tokens) {
    if (CLASS_MAP[tok] || MONOGRAPHS[tok]) return tok;
  }
  // Fallback: partial — first token present as substring
  for (const k of Object.keys({ ...CLASS_MAP, ...MONOGRAPHS })) {
    if (n.includes(k)) return k;
  }
  return null;
}

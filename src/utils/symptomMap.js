// symptom keyword → active ingredient substrings (matched against genericName, case-insensitive)
export const SYMPTOM_MAP = {
  'cough': [
    'dextromethorphan', 'pholcodine', 'codeine', 'guaifenesin',
    'bromhexine', 'ambroxol', 'carbocisteine', 'acetylcysteine', 'benzonatate',
  ],
  'dry cough': ['dextromethorphan', 'pholcodine', 'codeine', 'benzonatate'],
  'productive cough': ['guaifenesin', 'bromhexine', 'ambroxol', 'carbocisteine', 'acetylcysteine'],
  'chest congestion': ['guaifenesin', 'bromhexine', 'ambroxol', 'carbocisteine', 'acetylcysteine'],
  'mucus': ['guaifenesin', 'bromhexine', 'ambroxol', 'carbocisteine', 'acetylcysteine'],
  'phlegm': ['guaifenesin', 'bromhexine', 'ambroxol', 'carbocisteine', 'acetylcysteine'],
  'nasal congestion': ['pseudoephedrine', 'phenylephrine', 'oxymetazoline', 'xylometazoline', 'naphazoline'],
  'stuffy nose': ['pseudoephedrine', 'phenylephrine', 'oxymetazoline', 'xylometazoline', 'naphazoline'],
  'blocked nose': ['pseudoephedrine', 'phenylephrine', 'oxymetazoline', 'xylometazoline', 'naphazoline'],
  'runny nose': ['loratadine', 'cetirizine', 'fexofenadine', 'chlorphenamine', 'levocetirizine', 'desloratadine', 'bilastine', 'diphenhydramine'],
  'sneezing': ['loratadine', 'cetirizine', 'fexofenadine', 'chlorphenamine', 'levocetirizine', 'desloratadine', 'bilastine'],
  'allergy': ['loratadine', 'cetirizine', 'fexofenadine', 'chlorphenamine', 'levocetirizine', 'desloratadine', 'bilastine'],
  'hay fever': ['loratadine', 'cetirizine', 'fexofenadine', 'chlorphenamine', 'levocetirizine', 'desloratadine', 'bilastine'],
  'allergic rhinitis': ['loratadine', 'cetirizine', 'fexofenadine', 'chlorphenamine', 'levocetirizine', 'desloratadine', 'bilastine'],
  'fever': ['paracetamol', 'ibuprofen', 'aspirin', 'acetaminophen', 'naproxen'],
  'high temperature': ['paracetamol', 'ibuprofen', 'aspirin', 'acetaminophen'],
  'headache': ['paracetamol', 'ibuprofen', 'aspirin', 'naproxen', 'acetaminophen', 'caffeine'],
  'migraine': ['paracetamol', 'ibuprofen', 'aspirin', 'naproxen', 'sumatriptan', 'ergotamine'],
  'sore throat': ['benzocaine', 'benzydamine', 'flurbiprofen', 'chlorhexidine', 'povidone iodine', 'lidocaine', 'hexylresorcinol'],
  'throat pain': ['benzocaine', 'benzydamine', 'flurbiprofen', 'chlorhexidine', 'lidocaine'],
  'muscle pain': ['ibuprofen', 'diclofenac', 'naproxen', 'paracetamol', 'aspirin', 'methyl salicylate', 'ketoprofen'],
  'body aches': ['ibuprofen', 'diclofenac', 'naproxen', 'paracetamol', 'aspirin'],
  'joint pain': ['ibuprofen', 'diclofenac', 'naproxen', 'aspirin', 'methyl salicylate', 'ketoprofen'],
  'back pain': ['ibuprofen', 'diclofenac', 'naproxen', 'paracetamol', 'methyl salicylate'],
  'heartburn': ['omeprazole', 'lansoprazole', 'pantoprazole', 'esomeprazole', 'rabeprazole', 'ranitidine', 'famotidine', 'calcium carbonate', 'magnesium hydroxide', 'aluminum hydroxide', 'sodium alginate'],
  'acid reflux': ['omeprazole', 'lansoprazole', 'pantoprazole', 'esomeprazole', 'rabeprazole', 'ranitidine', 'famotidine', 'sodium alginate'],
  'indigestion': ['simethicone', 'calcium carbonate', 'magnesium hydroxide', 'aluminum hydroxide', 'domperidone', 'metoclopramide', 'pancreatin', 'peppermint'],
  'bloating': ['simethicone', 'dimethicone', 'peppermint', 'activated charcoal'],
  'gas': ['simethicone', 'dimethicone', 'activated charcoal'],
  'nausea': ['domperidone', 'metoclopramide', 'promethazine', 'meclizine', 'dimenhydrinate', 'ginger'],
  'vomiting': ['domperidone', 'metoclopramide', 'ondansetron', 'promethazine'],
  'motion sickness': ['meclizine', 'dimenhydrinate', 'promethazine', 'scopolamine'],
  'travel sickness': ['meclizine', 'dimenhydrinate', 'promethazine', 'scopolamine'],
  'diarrhea': ['loperamide', 'bismuth subsalicylate', 'kaolin', 'oral rehydration'],
  'constipation': ['bisacodyl', 'senna', 'docusate', 'polyethylene glycol', 'lactulose', 'glycerol', 'psyllium', 'macrogol'],
  'eye redness': ['naphazoline', 'tetrahydrozoline', 'ketotifen', 'olopatadine'],
  'eye allergy': ['ketotifen', 'olopatadine', 'azelastine', 'cromoglicate', 'lodoxamide'],
  'dry eyes': ['carmellose', 'hydroxypropyl methylcellulose', 'hyaluronic acid', 'sodium hyaluronate', 'polyvinyl alcohol'],
  'itchy eyes': ['ketotifen', 'olopatadine', 'cromoglicate', 'naphazoline'],
  'skin itch': ['hydrocortisone', 'calamine', 'diphenhydramine', 'crotamiton', 'chlorphenamine', 'loratadine', 'cetirizine'],
  'skin rash': ['hydrocortisone', 'calamine', 'betamethasone', 'clobetasone'],
  'eczema': ['hydrocortisone', 'betamethasone', 'clobetasone', 'emollient'],
  'athletes foot': ['clotrimazole', 'miconazole', 'terbinafine', 'ketoconazole', 'tolnaftate'],
  'fungal infection': ['clotrimazole', 'miconazole', 'terbinafine', 'ketoconazole', 'fluconazole'],
  'acne': ['benzoyl peroxide', 'salicylic acid', 'adapalene', 'clindamycin', 'tretinoin'],
  'cold sore': ['aciclovir', 'docosanol', 'penciclovir'],
  'sleep': ['diphenhydramine', 'doxylamine', 'melatonin', 'valerian'],
  'insomnia': ['diphenhydramine', 'doxylamine', 'melatonin', 'valerian'],
  'toothache': ['benzocaine', 'eugenol', 'paracetamol', 'ibuprofen', 'lidocaine'],
  'mouth ulcer': ['benzocaine', 'chlorhexidine', 'triamcinolone', 'lidocaine', 'carbenoxolone'],
  'hemorrhoids': ['hydrocortisone', 'witch hazel', 'phenylephrine', 'lidocaine', 'bismuth'],
  'vaginal yeast': ['clotrimazole', 'miconazole', 'fluconazole'],
  'dandruff': ['ketoconazole', 'selenium sulfide', 'zinc pyrithione', 'coal tar', 'salicylic acid'],
  'warts': ['salicylic acid', 'podophyllotoxin'],
  'wound': ['povidone iodine', 'chlorhexidine', 'hydrogen peroxide', 'mupirocin', 'fusidic acid'],
  'cold': ['paracetamol', 'ibuprofen', 'pseudoephedrine', 'phenylephrine', 'dextromethorphan', 'guaifenesin', 'chlorphenamine', 'loratadine', 'cetirizine'],
  'flu': ['paracetamol', 'ibuprofen', 'pseudoephedrine', 'dextromethorphan', 'guaifenesin'],
};

// Chips shown as quick-select buttons — curated most-common ones
export const SYMPTOM_CHIPS = [
  { label: 'Cough',            key: 'cough' },
  { label: 'Chest Congestion', key: 'chest congestion' },
  { label: 'Nasal Congestion', key: 'nasal congestion' },
  { label: 'Runny Nose',       key: 'runny nose' },
  { label: 'Fever',            key: 'fever' },
  { label: 'Headache',         key: 'headache' },
  { label: 'Sore Throat',      key: 'sore throat' },
  { label: 'Allergy',          key: 'allergy' },
  { label: 'Heartburn',        key: 'heartburn' },
  { label: 'Nausea',           key: 'nausea' },
  { label: 'Diarrhea',         key: 'diarrhea' },
  { label: 'Constipation',     key: 'constipation' },
  { label: 'Muscle Pain',      key: 'muscle pain' },
  { label: 'Eye Allergy',      key: 'eye allergy' },
  { label: 'Skin Itch',        key: 'skin itch' },
  { label: 'Cold & Flu',       key: 'cold' },
  { label: 'Motion Sickness',  key: 'motion sickness' },
  { label: 'Sleep / Insomnia', key: 'sleep' },
];

/**
 * Split a free-text symptom input into individual symptom tokens.
 * Splits on "+", ",", "&", "and", "/" (case-insensitive).
 */
export function parseSymptomInput(input) {
  return input
    .split(/[+,&/]|\band\b/i)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Fuzzy-ish symptom matching: for each token, find the best matching key
 * in SYMPTOM_MAP by checking substring containment in both directions.
 */
export function resolveSymptoms(tokens) {
  const mapKeys = Object.keys(SYMPTOM_MAP);
  const matched = new Set();

  for (const token of tokens) {
    // Direct hit
    if (SYMPTOM_MAP[token]) {
      matched.add(token);
      continue;
    }
    // Token is contained in a map key, or map key is contained in token
    for (const key of mapKeys) {
      if (key.includes(token) || token.includes(key)) {
        matched.add(key);
      }
    }
  }
  return [...matched];
}

/** Return the union of all active-ingredient substrings for the given symptom keys. */
export function getIngredients(symptomKeys) {
  const ingredients = new Set();
  for (const key of symptomKeys) {
    (SYMPTOM_MAP[key] || []).forEach((ing) => ingredients.add(ing));
  }
  return [...ingredients];
}

/** Check if a drug's genericName contains any of the ingredient substrings. */
export function matchesDrug(drug, ingredients) {
  const name = (drug.genericName || '').toLowerCase();
  return ingredients.some((ing) => name.includes(ing));
}

/** Return true if a drug is OTC based on dispenseMode. */
export function isOTC(drug) {
  const mode = (drug.dispenseMode || '').toLowerCase();
  return mode.includes('counter') || mode.includes('otc');
}

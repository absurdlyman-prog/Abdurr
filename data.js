/* ============================================================================
 *  SurgeryQuest — content & configuration
 *  A gamified 3D clinical simulation. EDUCATIONAL / SYNTHETIC content only.
 *  Nothing here is real patient data or a real clinical recommendation.
 * ============================================================================
 *
 *  ┌──────────────────────────────────────────────────────────────────────┐
 *  │  ✏️  EDIT ME — personalize the birthday gift here (and nowhere else)   │
 *  └──────────────────────────────────────────────────────────────────────┘
 *  Change the three constants below. That's all you need to touch to make
 *  this personal. Keep the quotes. Use \n for a line break inside a message.
 */
const SQ_CONFIG = {
  // Her name as it should appear on the welcome screen, e.g. "Dr. Sarah".
  RECIPIENT_NAME: "Noon",

  // Short birthday message shown under her name on the welcome screen.
  // (Tweak freely — this is just a starting draft.)
  BIRTHDAY_MESSAGE:
    "Happy birthday to my favorite surgeon. 🎂\n\n" +
    "You spend your real days saving people in Marshfield — so I built you a " +
    "little ward of your own to play in. Six patients are waiting. Take their " +
    "history, trust your exam, order only what you need, and call it like the " +
    "great PGY-2 you are.\n\n" +
    "I'm so proud of you. Now go round on your patients. 🩺💙",

  // Tiny sign-off line. Set to "" to hide it.
  SIGNED: "— With all my love",

  // Cosmetic only: shown in the header. Safe to leave as-is.
  HOSPITAL_NAME: "Quest General Hospital",
};

/* ============================================================================
 *  From here down is the game content. You can tweak cases if you like, but
 *  you don't need to in order to personalize the gift.
 * ========================================================================= */

/* ---------------------------------------------------------------------------
 *  SHARED MASTER ORDER MENU
 *  Every patient is worked up from this same catalog, so the player has to
 *  pick the RELEVANT actions. Labs & imaging carry a "cost" weight that is
 *  charged against Resource Stewardship when ordered without indication.
 * ------------------------------------------------------------------------- */
const ORDER_MENU = {
  history: [
    { id: "h_onset",     label: "Onset, timing & progression of the pain" },
    { id: "h_location",  label: "Pain location, radiation & migration" },
    { id: "h_character", label: "Pain character & severity" },
    { id: "h_aggrav",    label: "Aggravating / relieving factors (movement, food, position)" },
    { id: "h_nausea",    label: "Nausea, vomiting & appetite" },
    { id: "h_bowel",     label: "Bowel habits / last flatus & bowel movement" },
    { id: "h_urinary",   label: "Urinary symptoms" },
    { id: "h_fevers",    label: "Fevers, chills & rigors" },
    { id: "h_gyn",       label: "Gynecologic history / last menstrual period" },
    { id: "h_diet",      label: "Recent oral intake & relation to meals" },
    { id: "h_prior",     label: "Prior similar episodes" },
    { id: "h_pmh",       label: "Past medical history & comorbidities" },
    { id: "h_psh",       label: "Past surgical history / prior abdominal surgery" },
    { id: "h_meds",      label: "Medications (NSAIDs, anticoagulants, steroids)" },
    { id: "h_social",    label: "Social history (alcohol, tobacco)" },
  ],
  exam: [
    { id: "e_general",   label: "General appearance & vital-sign review" },
    { id: "e_inspect",   label: "Abdominal inspection (distension, scars, hernias)" },
    { id: "e_auscult",   label: "Auscultation of bowel sounds" },
    { id: "e_palp",      label: "Light & deep palpation / localized tenderness" },
    { id: "e_perit",     label: "Peritoneal signs (rebound, guarding, rigidity)" },
    { id: "e_murphy",    label: "Murphy's sign" },
    { id: "e_special",   label: "Rovsing / psoas / obturator signs" },
    { id: "e_mcburney",  label: "McBurney's point tenderness" },
    { id: "e_hernia",    label: "Groin / hernia exam (reducibility, overlying skin)" },
    { id: "e_rectal",    label: "Digital rectal exam" },
    { id: "e_pelvic",    label: "Pelvic exam (if indicated)" },
    { id: "e_wound",     label: "Surgical wound / incision exam" },
    { id: "e_cardiopulm",label: "Cardiopulmonary exam" },
  ],
  labs: [
    { id: "l_cbc",       label: "CBC with differential",           cost: 1 },
    { id: "l_bmp",       label: "Basic metabolic panel",           cost: 1 },
    { id: "l_lft",       label: "Liver function tests",            cost: 1 },
    { id: "l_lipase",    label: "Lipase",                          cost: 1 },
    { id: "l_lactate",   label: "Serum lactate",                   cost: 2 },
    { id: "l_coags",     label: "Coagulation panel (PT/INR, PTT)", cost: 1 },
    { id: "l_crp",       label: "C-reactive protein",              cost: 1 },
    { id: "l_ua",        label: "Urinalysis",                      cost: 1 },
    { id: "l_bhcg",      label: "β-hCG (urine/serum)",             cost: 1 },
    { id: "l_vbg",       label: "Venous blood gas",                cost: 1 },
    { id: "l_typescreen",label: "Type & screen",                   cost: 1 },
    { id: "l_bloodcx",   label: "Blood cultures",                  cost: 2 },
    { id: "l_trop",      label: "Troponin",                        cost: 1 },
    { id: "l_amylase",   label: "Amylase",                         cost: 1 },
    { id: "l_procal",    label: "Procalcitonin",                   cost: 2 },
  ],
  imaging: [
    { id: "i_us_ruq",    label: "Right-upper-quadrant ultrasound",          cost: 2 },
    { id: "i_us_pelvis", label: "Pelvic / transvaginal ultrasound",         cost: 2 },
    { id: "i_ct_ap",     label: "CT abdomen/pelvis with IV contrast",       cost: 4 },
    { id: "i_ct_nc",     label: "CT abdomen/pelvis without contrast",       cost: 3 },
    { id: "i_cxr",       label: "Upright chest X-ray",                      cost: 1 },
    { id: "i_kub",       label: "Abdominal X-ray (supine + upright)",       cost: 1 },
    { id: "i_hida",      label: "HIDA scan (cholescintigraphy)",            cost: 3 },
    { id: "i_mrcp",      label: "MRCP",                                     cost: 4 },
    { id: "i_cta",       label: "CT angiography (mesenteric)",              cost: 4 },
    { id: "i_ctchest",   label: "CT chest (PE protocol)",                   cost: 4 },
    { id: "i_mri",       label: "MRI abdomen/pelvis",                       cost: 5 },
    { id: "i_ugi",       label: "Water-soluble upper-GI contrast study",    cost: 2 },
  ],
};

// Default result text for an ordered item the case doesn't specifically author.
const DEFAULT_RESULT = {
  history: "Nothing contributory reported.",
  exam:    "Unremarkable on this part of the exam.",
  labs:    "Within normal limits.",
  imaging: "No acute findings reported.",
};

/* ---------------------------------------------------------------------------
 *  CASES  (all synthetic / educational)
 *
 *  Per case:
 *   keyHistory / keyExam ....... high-yield items (drive History & Exam scores)
 *   appropriateLabs/Imaging .... indicated workup (drive Workup score, no steward hit)
 *   acceptableLabs/Imaging ..... reasonable, no steward penalty, no workup bonus
 *   criticalImaging ............ must-have study; missing it dents the Workup score
 *   findings ................... { orderItemId: "result text" }
 *   diagnoses .................. [{id,label,tier}] tier: correct | partial | wrong
 *   managements ............... [{id,label,tier,note}] tier: correct|acceptable|suboptimal|harmful
 * ------------------------------------------------------------------------- */
const CASES = [
  /* ===== CASE 1 — ACUTE APPENDICITIS ==================================== */
  {
    id: "appendicitis",
    title: "Acute Appendicitis",
    bedLabel: "RLQ pain",
    icd10: "K35.80 — Unspecified acute appendicitis",
    patient: { name: "Jordan A.", age: 22, sex: "F" },
    chiefComplaint: "Right-lower-quadrant abdominal pain since this morning.",
    triage: "Walk-in, looks uncomfortable but stable.",
    vitals: { temp: "38.1 °C", hr: "98", bp: "124/78", rr: "16", spo2: "99%", pain: "7/10" },

    keyHistory: ["h_onset", "h_location", "h_nausea", "h_fevers", "h_aggrav", "h_gyn"],
    keyExam: ["e_general", "e_palp", "e_perit", "e_mcburney", "e_special", "e_pelvic"],
    appropriateLabs: ["l_cbc", "l_bmp", "l_crp", "l_ua", "l_bhcg"],
    acceptableLabs: ["l_lft", "l_lipase"],
    appropriateImaging: ["i_ct_ap"],
    acceptableImaging: ["i_us_pelvis"],
    criticalImaging: ["i_ct_ap", "i_us_pelvis"],

    findings: {
      h_onset: "Pain began ~18 hours ago around the umbilicus, then migrated to the right lower quadrant and has steadily worsened.",
      h_location: "Now sharp and localized to the RLQ.",
      h_nausea: "Nauseated with one episode of vomiting; no appetite since yesterday.",
      h_fevers: "Felt feverish; no rigors.",
      h_aggrav: "Worse with movement — the bumps on the car ride over were painful.",
      h_gyn: "LMP two weeks ago, regular cycles; reports no chance of pregnancy (still confirm with β-hCG).",
      h_bowel: "Normal bowel movement yesterday; no diarrhea.",
      h_urinary: "No dysuria or frequency.",
      e_general: "Lying still, mildly uncomfortable, flushed.",
      e_palp: "Focal tenderness in the right lower quadrant.",
      e_perit: "Voluntary guarding and rebound tenderness localized to the RLQ.",
      e_mcburney: "Maximal tenderness at McBurney's point.",
      e_special: "Positive Rovsing's sign; psoas sign positive.",
      e_pelvic: "No cervical motion tenderness; adnexae non-tender.",
      l_cbc: "WBC 14.8 ×10⁹/L with neutrophilic left shift.",
      l_crp: "CRP elevated at 78 mg/L.",
      l_ua: "Trace leukocytes, no nitrites; a few RBCs (reactive, from the adjacent inflamed appendix).",
      l_bhcg: "Negative.",
      l_bmp: "Within normal limits.",
      i_ct_ap: "CT A/P: dilated appendix (11 mm) with wall thickening, periappendiceal fat stranding, and a trace of free fluid. No abscess or perforation. Findings consistent with acute appendicitis.",
      i_us_pelvis: "US: non-compressible, blind-ending tubular structure (~10 mm) in the RLQ; ovaries normal with arterial & venous flow.",
    },

    diagnoses: [
      { id: "dx_appy", label: "Acute appendicitis", tier: "correct" },
      { id: "dx_adenitis", label: "Mesenteric adenitis", tier: "partial" },
      { id: "dx_torsion", label: "Ovarian torsion", tier: "wrong" },
      { id: "dx_ectopic", label: "Ectopic pregnancy", tier: "wrong" },
      { id: "dx_colic", label: "Right ureteric colic", tier: "wrong" },
    ],
    managements: [
      { id: "mg_appy", tier: "correct", label: "Admit, NPO, IV fluids, IV antibiotics, and laparoscopic appendectomy", note: "Appendectomy remains the standard for uncomplicated appendicitis in a healthy young patient." },
      { id: "mg_abx", tier: "acceptable", label: "Non-operative management with IV antibiotics alone", note: "Antibiotic-first therapy is a reasonable option for selected uncomplicated cases, but carries a meaningful recurrence rate and requires informed shared decision-making." },
      { id: "mg_dc", tier: "harmful", label: "Discharge home with oral analgesia and PCP follow-up", note: "Discharging an evolving appendicitis risks perforation and sepsis." },
      { id: "mg_scope", tier: "harmful", label: "Colonoscopy before any intervention", note: "Not indicated acutely and dangerously delays definitive care." },
    ],
    teaching:
      "Educational case. Classic appendicitis = peri-umbilical pain migrating to the RLQ with anorexia, " +
      "low-grade fever, and localized peritonism (McBurney's, Rovsing's, psoas). Mild leukocytosis and CRP " +
      "support the diagnosis; always send a β-hCG in a person of child-bearing potential. CT A/P is the " +
      "standard confirmatory study in adults, while ultrasound (or MRI) is preferred first in young/pregnant " +
      "patients to spare radiation. Laparoscopic appendectomy is the usual definitive treatment; an " +
      "antibiotic-first strategy is an emerging option for uncomplicated disease.",
  },

  /* ===== CASE 2 — ADHESIVE SMALL BOWEL OBSTRUCTION ===================== */
  {
    id: "sbo",
    title: "Small Bowel Obstruction",
    bedLabel: "Distension + vomiting",
    icd10: "K56.5 — Intestinal adhesions [bands] with obstruction",
    patient: { name: "Walter K.", age: 63, sex: "M" },
    chiefComplaint: "Crampy abdominal pain, distension, and vomiting.",
    triage: "Arrived by car, dry mucous membranes, uncomfortable in waves.",
    vitals: { temp: "37.4 °C", hr: "105", bp: "118/74", rr: "18", spo2: "98%", pain: "6/10 colicky" },

    keyHistory: ["h_onset", "h_character", "h_nausea", "h_bowel", "h_psh", "h_prior"],
    keyExam: ["e_general", "e_inspect", "e_auscult", "e_palp", "e_perit", "e_hernia"],
    appropriateLabs: ["l_cbc", "l_bmp", "l_lactate"],
    acceptableLabs: ["l_vbg", "l_typescreen", "l_coags"],
    appropriateImaging: ["i_ct_ap"],
    acceptableImaging: ["i_kub"],
    criticalImaging: ["i_ct_ap", "i_kub"],

    findings: {
      h_onset: "About 12 hours of crampy pain that comes and goes in waves.",
      h_character: "Colicky, diffuse cramps every few minutes.",
      h_nausea: "Several episodes of bilious vomiting, now becoming feculent-smelling.",
      h_bowel: "No flatus or bowel movement for roughly 24 hours (obstipation).",
      h_psh: "Open appendectomy 20 years ago; no other abdominal surgery.",
      h_prior: "One similar, milder episode a few years ago that settled on its own.",
      h_urinary: "No urinary symptoms.",
      e_general: "Uncomfortable in waves; mildly dehydrated.",
      e_inspect: "Abdomen distended; a well-healed RLQ scar; no visible hernia bulge.",
      e_auscult: "High-pitched, tinkling bowel sounds.",
      e_palp: "Diffusely mildly tender and tympanitic, but soft.",
      e_perit: "No rebound or guarding — no peritonitis.",
      e_hernia: "No groin hernia palpable.",
      l_cbc: "WBC 11.2 ×10⁹/L; hemoglobin normal.",
      l_bmp: "Na 134, K 3.3, Cl 96, HCO₃ 30, BUN 28, Cr 1.3 — a hypokalemic, hypochloremic contraction alkalosis with a prerenal picture.",
      l_lactate: "1.4 mmol/L (normal) — no current biochemical evidence of ischemia.",
      i_kub: "Upright film: multiple dilated small-bowel loops with air–fluid levels and a paucity of colonic gas.",
      i_ct_ap: "CT A/P: dilated small-bowel loops to a transition point in the RLQ with collapsed distal bowel; an adhesive band is suspected. No bowel-wall thickening, pneumatosis, or free air — no evidence of strangulation/ischemia.",
    },

    diagnoses: [
      { id: "dx_sbo", label: "Adhesive small bowel obstruction", tier: "correct" },
      { id: "dx_ileus", label: "Paralytic ileus", tier: "partial" },
      { id: "dx_lbo", label: "Large bowel obstruction", tier: "wrong" },
      { id: "dx_ischemia", label: "Acute mesenteric ischemia", tier: "wrong" },
      { id: "dx_hernia", label: "Incarcerated hernia", tier: "wrong" },
    ],
    managements: [
      { id: "mg_nonop", tier: "correct", label: "NPO, NG-tube decompression, IV fluids, correct electrolytes, serial exams (non-operative trial)", note: "Uncomplicated adhesive SBO without ischemia is managed non-operatively first, with close serial assessment." },
      { id: "mg_gastrografin", tier: "acceptable", label: "NG decompression plus a water-soluble (Gastrografin) contrast challenge", note: "A reasonable adjunct that is both prognostic and can be therapeutic; pairs well with NG decompression." },
      { id: "mg_lap", tier: "suboptimal", label: "Immediate exploratory laparotomy", note: "Reserve urgent surgery for strangulation/ischemia, closed-loop obstruction, or failure of a non-operative trial — none present here yet." },
      { id: "mg_feed", tier: "harmful", label: "Start opioids and oral feeding to 'test tolerance'", note: "Feeding an obstructed bowel worsens distension and vomiting and risks aspiration." },
      { id: "mg_dc", tier: "harmful", label: "Discharge home with laxatives", note: "Misses a true mechanical obstruction; risks progression to strangulation." },
    ],
    teaching:
      "Educational case. Adhesions from prior surgery are the leading cause of small bowel obstruction. The " +
      "triad is colicky pain, distension, and vomiting with obstipation; high-pitched bowel sounds and air–fluid " +
      "levels support it. CT defines the transition point and screens for ischemia. Watch for strangulation — " +
      "fever, rising WBC, elevated lactate, peritonitis, or CT signs (wall thickening, pneumatosis, poor " +
      "enhancement) — which mandates the OR. Otherwise, decompress (NG), resuscitate, correct the classic " +
      "hypokalemic hypochloremic metabolic alkalosis, and give a non-operative trial (≈24–48 h), often with a " +
      "water-soluble contrast challenge.",
  },

  /* ===== CASE 3 — ACUTE CHOLECYSTITIS ================================== */
  {
    id: "cholecystitis",
    title: "Acute Cholecystitis",
    bedLabel: "RUQ pain, fever",
    icd10: "K80.00 — Calculus of gallbladder w/ acute cholecystitis, no obstruction",
    patient: { name: "Maria D.", age: 45, sex: "F" },
    chiefComplaint: "Right-upper-quadrant pain after a fatty meal, with fever.",
    triage: "Stable, holding her right side, nauseated.",
    vitals: { temp: "38.3 °C", hr: "96", bp: "130/80", rr: "16", spo2: "98%", pain: "8/10" },

    keyHistory: ["h_onset", "h_location", "h_nausea", "h_fevers", "h_diet", "h_prior"],
    keyExam: ["e_general", "e_inspect", "e_palp", "e_murphy", "e_perit"],
    appropriateLabs: ["l_cbc", "l_lft", "l_lipase"],
    acceptableLabs: ["l_bmp", "l_crp"],
    appropriateImaging: ["i_us_ruq"],
    acceptableImaging: ["i_hida", "i_mrcp"],
    criticalImaging: ["i_us_ruq"],

    findings: {
      h_onset: "Constant RUQ pain for ~10 hours that began after a fatty meal; previous shorter episodes resolved on their own.",
      h_location: "Right upper quadrant, radiating to the right shoulder blade.",
      h_nausea: "Nauseated; vomited twice.",
      h_fevers: "Low-grade fever with chills.",
      h_diet: "Symptoms are reliably triggered by greasy / fatty food.",
      h_prior: "Several self-limited episodes of RUQ pain over recent months (biliary colic).",
      e_general: "Uncomfortable, mildly febrile.",
      e_inspect: "No distension; no jaundice.",
      e_palp: "Tender RUQ with localized guarding.",
      e_murphy: "Positive Murphy's sign — inspiratory arrest on RUQ palpation.",
      e_perit: "Localized peritonism over the RUQ only.",
      l_cbc: "WBC 13.5 ×10⁹/L with neutrophilia.",
      l_lft: "Mildly elevated ALP and bilirubin (total bili 1.4); transaminases near normal — pattern not suggestive of common-bile-duct obstruction.",
      l_lipase: "Normal — argues against gallstone pancreatitis.",
      i_us_ruq: "US: gallbladder wall thickening (5 mm), pericholecystic fluid, gallstones, and a sonographic Murphy's sign. CBD normal caliber (4 mm). Consistent with acute cholecystitis.",
      i_hida: "HIDA: non-visualization of the gallbladder at 60 minutes — consistent with cystic-duct obstruction / acute cholecystitis.",
    },

    diagnoses: [
      { id: "dx_chole", label: "Acute (calculous) cholecystitis", tier: "correct" },
      { id: "dx_colic", label: "Biliary colic", tier: "partial" },
      { id: "dx_choledoco", label: "Choledocholithiasis / cholangitis", tier: "wrong" },
      { id: "dx_panc", label: "Acute pancreatitis", tier: "wrong" },
      { id: "dx_pud", label: "Peptic ulcer disease", tier: "wrong" },
    ],
    managements: [
      { id: "mg_lapchole", tier: "correct", label: "Admit, IV fluids, IV antibiotics, analgesia, and early laparoscopic cholecystectomy (within ~72 h)", note: "Early laparoscopic cholecystectomy during the index admission is the preferred treatment for acute calculous cholecystitis." },
      { id: "mg_interval", tier: "acceptable", label: "IV antibiotics now, interval cholecystectomy in ~6 weeks", note: "An older 'cool-off' approach; acceptable in some contexts but early cholecystectomy is generally preferred." },
      { id: "mg_chole_tube", tier: "suboptimal", label: "Percutaneous cholecystostomy tube", note: "Reserved for patients who are too unfit/high-risk for surgery, not first-line in a stable patient." },
      { id: "mg_ercp", tier: "harmful", label: "Urgent ERCP", note: "Not indicated — there is no evidence of CBD obstruction/cholangitis here; carries procedural risk." },
      { id: "mg_dc", tier: "harmful", label: "Discharge with oral antibiotics", note: "Under-treats an acute surgical infection and risks gangrenous cholecystitis." },
    ],
    teaching:
      "Educational case. Acute calculous cholecystitis presents with constant RUQ pain (often post-prandial), " +
      "fever, and a positive Murphy's sign. Ultrasound is first-line (wall thickening, pericholecystic fluid, " +
      "stones, sonographic Murphy's); HIDA is the most specific test when US is equivocal. Check LFTs — markedly " +
      "elevated bilirubin/ALP or a dilated CBD suggests choledocholithiasis and warrants MRCP/ERCP. Treatment is " +
      "fluids, antibiotics, analgesia, and early laparoscopic cholecystectomy; cholecystostomy is reserved for " +
      "patients unfit for surgery.",
  },

  /* ===== CASE 4 — PERFORATED PEPTIC ULCER ============================= */
  {
    id: "perforated_ulcer",
    title: "Perforated Peptic Ulcer",
    bedLabel: "Sudden rigid abdomen",
    icd10: "K27.1 — Acute peptic ulcer, site unspecified, with perforation",
    patient: { name: "Frank R.", age: 58, sex: "M" },
    chiefComplaint: "Sudden, severe abdominal pain that started a few hours ago.",
    triage: "Brought in lying very still, diaphoretic, looks unwell.",
    vitals: { temp: "37.9 °C", hr: "112", bp: "104/68", rr: "22", spo2: "97%", pain: "10/10" },

    keyHistory: ["h_onset", "h_character", "h_meds", "h_pmh", "h_aggrav", "h_social"],
    keyExam: ["e_general", "e_inspect", "e_palp", "e_perit", "e_auscult"],
    appropriateLabs: ["l_cbc", "l_bmp", "l_lipase", "l_lactate"],
    acceptableLabs: ["l_coags", "l_typescreen", "l_vbg", "l_bloodcx"],
    appropriateImaging: ["i_cxr", "i_ct_ap"],
    acceptableImaging: ["i_kub"],
    criticalImaging: ["i_cxr", "i_ct_ap"],

    findings: {
      h_onset: "Sudden, severe epigastric pain ~3 hours ago — he can name the exact minute it started; it has now spread across the whole abdomen.",
      h_character: "Constant, sharp, 10/10; any movement is agonizing.",
      h_meds: "Takes ibuprofen several times daily for knee arthritis; occasional over-the-counter antacids.",
      h_pmh: "History of dyspepsia / 'heartburn'; never had an endoscopy.",
      h_aggrav: "Lying perfectly still helps; any movement or coughing is excruciating.",
      h_social: "Smoker; social alcohol use.",
      h_nausea: "Mild nausea; no large vomiting.",
      e_general: "Diaphoretic, lying motionless, ill-appearing.",
      e_inspect: "Abdomen not distended; not moving with respiration.",
      e_palp: "Diffuse tenderness throughout.",
      e_perit: "Board-like rigidity with diffuse guarding and rebound — generalized peritonitis.",
      e_auscult: "Absent bowel sounds.",
      l_cbc: "WBC 17.0 ×10⁹/L with left shift.",
      l_bmp: "Acute kidney injury (Cr 1.6) with mild metabolic disturbance.",
      l_lipase: "Mildly elevated but not > 3× the upper limit — makes pancreatitis less likely (lipase can rise modestly in perforation).",
      l_lactate: "3.1 mmol/L — elevated, reflecting hypoperfusion/peritonitis.",
      i_cxr: "Upright chest X-ray: free air under the right hemidiaphragm (pneumoperitoneum).",
      i_ct_ap: "CT A/P: free intraperitoneal air and fluid with a focal wall defect at the duodenal bulb/gastric antrum and surrounding inflammation — consistent with a perforated peptic ulcer.",
    },

    diagnoses: [
      { id: "dx_perf", label: "Perforated peptic ulcer", tier: "correct" },
      { id: "dx_panc", label: "Acute pancreatitis", tier: "wrong" },
      { id: "dx_aaa", label: "Ruptured abdominal aortic aneurysm", tier: "wrong" },
      { id: "dx_ischemia", label: "Acute mesenteric ischemia", tier: "wrong" },
      { id: "dx_appy", label: "Acute appendicitis", tier: "wrong" },
    ],
    managements: [
      { id: "mg_or", tier: "correct", label: "Resuscitate (IV fluids), broad-spectrum IV antibiotics, IV PPI, NG tube, type & screen, and urgent operative repair (omental/Graham patch)", note: "Generalized peritonitis from perforation is a surgical emergency — resuscitate and get to the OR for source control." },
      { id: "mg_nonop", tier: "suboptimal", label: "Non-operative management (NPO, NG, antibiotics, PPI) with serial exams", note: "Only considered for a stable patient with a contained, sealed perforation — not with diffuse peritonitis as here." },
      { id: "mg_egd", tier: "harmful", label: "Upper endoscopy now to find the ulcer", note: "Insufflation can enlarge the perforation and dangerously delays surgery." },
      { id: "mg_dc", tier: "harmful", label: "Discharge on a PPI with outpatient H. pylori testing", note: "Catastrophic — this is acute peritonitis, not outpatient dyspepsia." },
    ],
    teaching:
      "Educational case. A perforated peptic ulcer classically causes sudden, severe pain (patients can time " +
      "its onset) progressing to a rigid, board-like abdomen with peritonitis. Risk factors include NSAIDs and " +
      "H. pylori. An upright chest X-ray may show free air under the diaphragm; CT is more sensitive and also " +
      "localizes the defect. Management is aggressive resuscitation, broad-spectrum antibiotics, a PPI, NG " +
      "decompression, and urgent surgery (commonly an omental/Graham patch repair), followed later by H. pylori " +
      "eradication and NSAID review.",
  },

  /* ===== CASE 5 — STRANGULATED INGUINAL HERNIA ======================= */
  {
    id: "strangulated_hernia",
    title: "Strangulated Inguinal Hernia",
    bedLabel: "Painful groin bulge",
    icd10: "K40.40 — Unilateral inguinal hernia, with gangrene",
    patient: { name: "George P.", age: 68, sex: "M" },
    chiefComplaint: "A groin bulge that became painful and won't go back in.",
    triage: "Distressed, guarding the right groin, vomiting.",
    vitals: { temp: "38.0 °C", hr: "108", bp: "126/82", rr: "18", spo2: "97%", pain: "9/10" },

    keyHistory: ["h_onset", "h_prior", "h_nausea", "h_bowel", "h_location"],
    keyExam: ["e_general", "e_hernia", "e_inspect", "e_auscult", "e_perit"],
    appropriateLabs: ["l_cbc", "l_bmp", "l_lactate"],
    acceptableLabs: ["l_typescreen", "l_coags", "l_vbg"],
    appropriateImaging: ["i_ct_ap"],
    acceptableImaging: ["i_kub"],
    criticalImaging: [],

    findings: {
      h_onset: "A long-standing groin bulge that he usually pushes back in; today it became painful and he cannot reduce it.",
      h_prior: "Known reducible right inguinal hernia for years.",
      h_nausea: "Nausea and vomiting since the bulge got stuck this morning.",
      h_bowel: "No flatus since this morning.",
      h_location: "Pain centered on the right groin, extending toward the scrotum.",
      e_general: "Distressed and tachycardic.",
      e_hernia: "Tender, firm, irreducible right groin mass extending toward the scrotum; the overlying skin is erythematous and warm — concerning for strangulation.",
      e_inspect: "Mild abdominal distension.",
      e_auscult: "High-pitched bowel sounds.",
      e_perit: "Localized tenderness over the hernia; no diffuse peritonitis yet.",
      l_cbc: "WBC 15.2 ×10⁹/L with left shift.",
      l_lactate: "2.6 mmol/L — mildly elevated, concerning for bowel compromise.",
      l_bmp: "Mild prerenal picture from vomiting.",
      i_ct_ap: "CT A/P: right inguinal hernia containing a loop of small bowel with upstream dilation (obstruction); narrowing at the hernia neck with bowel-wall thickening, reduced enhancement, and fat stranding — concerning for incarceration with early strangulation.",
      i_kub: "Dilated small-bowel loops with air–fluid levels, in keeping with obstruction.",
    },

    diagnoses: [
      { id: "dx_strang", label: "Strangulated (incarcerated) inguinal hernia", tier: "correct" },
      { id: "dx_incarc", label: "Incarcerated hernia without strangulation", tier: "partial" },
      { id: "dx_reducible", label: "Reducible inguinal hernia", tier: "wrong" },
      { id: "dx_hydrocele", label: "Hydrocele", tier: "wrong" },
      { id: "dx_torsion", label: "Testicular torsion", tier: "wrong" },
    ],
    managements: [
      { id: "mg_or", tier: "correct", label: "NPO, IV fluids, IV antibiotics, type & screen, and urgent surgical exploration/repair", note: "With signs of strangulation, take the patient to the OR — assess bowel viability and repair; do NOT forcibly reduce." },
      { id: "mg_reduce", tier: "harmful", label: "Sedate and forcibly reduce the hernia, then observe", note: "Reducing potentially dead bowel back into the abdomen (reduction en masse) can cause missed ischemia and peritonitis. Gentle taxis is only for incarceration WITHOUT strangulation signs." },
      { id: "mg_elective", tier: "harmful", label: "Refer for elective outpatient hernia repair", note: "This is an emergency, not an elective problem — delay risks bowel necrosis." },
      { id: "mg_truss", tier: "harmful", label: "Discharge with a truss", note: "Inappropriate and dangerous for a strangulated hernia." },
    ],
    teaching:
      "Educational case. An incarcerated hernia is irreducible; strangulation adds compromised blood supply — " +
      "suggested by severe pain, overlying erythema, fever, leukocytosis, raised lactate, and signs of bowel " +
      "obstruction. Diagnosis is largely clinical; CT helps assess the contents and viability. A strangulated " +
      "hernia is a surgical emergency: resuscitate and explore urgently, resecting non-viable bowel as needed. " +
      "Crucially, do not forcibly reduce a suspected strangulated hernia, which can return dead bowel to the abdomen.",
  },

  /* ===== CASE 6 — POST-OP ANASTOMOTIC LEAK =========================== */
  {
    id: "anastomotic_leak",
    title: "Post-op Anastomotic Leak",
    bedLabel: "POD#5 fever",
    icd10: "K91.89 — Other postprocedural complication of digestive system",
    patient: { name: "Linda S.", age: 60, sex: "F" },
    chiefComplaint: "Worsening abdominal pain and a new fever on post-op day 5.",
    triage: "Inpatient on the surgical ward; looks more unwell than yesterday.",
    vitals: { temp: "38.7 °C", hr: "118", bp: "102/64", rr: "22", spo2: "95%", pain: "8/10" },

    keyHistory: ["h_onset", "h_psh", "h_fevers", "h_bowel", "h_diet"],
    keyExam: ["e_general", "e_wound", "e_inspect", "e_perit", "e_cardiopulm"],
    appropriateLabs: ["l_cbc", "l_lactate", "l_crp", "l_bloodcx"],
    acceptableLabs: ["l_bmp", "l_procal", "l_vbg", "l_ua"],
    appropriateImaging: ["i_ct_ap"],
    acceptableImaging: ["i_cxr"],
    criticalImaging: ["i_ct_ap"],

    findings: {
      h_onset: "She was recovering well, but over post-op days 4–5 developed worsening, diffuse abdominal pain instead of improving.",
      h_psh: "Laparoscopic sigmoid colectomy 5 days ago for recurrent diverticulitis.",
      h_fevers: "New fever to 38.7 °C with chills today.",
      h_bowel: "Had started passing flatus, which has now stopped; the abdomen feels more distended.",
      h_diet: "Was advanced to a light diet yesterday; the pain worsened afterward.",
      h_urinary: "No dysuria; the urinary catheter was removed on post-op day 2.",
      e_general: "Ill-appearing, flushed, tachycardic.",
      e_wound: "Incisions intact; one port site has mild surrounding erythema but no frank pus.",
      e_inspect: "Increasingly distended abdomen.",
      e_perit: "Diffuse tenderness with guarding and rebound — new peritonism.",
      e_cardiopulm: "Lungs clear; tachycardic, no murmur (argues against pneumonia as the fever source).",
      l_cbc: "WBC 18.5 ×10⁹/L with bandemia (left shift).",
      l_lactate: "3.4 mmol/L — elevated.",
      l_crp: "Markedly elevated; a CRP that fails to fall by post-op day 5 is a red flag for an anastomotic leak.",
      l_bloodcx: "Drawn; gram-negative rods flagged as preliminary.",
      l_bmp: "Acute kidney injury with a prerenal pattern.",
      i_ct_ap: "CT A/P with IV + rectal contrast: extraluminal contrast and free fluid/air around the colorectal anastomosis with an adjacent rim-enhancing collection — consistent with an anastomotic leak.",
      i_cxr: "No consolidation; no new effusion (does not explain the sepsis).",
    },

    diagnoses: [
      { id: "dx_leak", label: "Anastomotic leak", tier: "correct" },
      { id: "dx_abscess", label: "Contained intra-abdominal abscess", tier: "partial" },
      { id: "dx_ileus", label: "Post-op ileus", tier: "wrong" },
      { id: "dx_ssi", label: "Superficial surgical-site infection", tier: "wrong" },
      { id: "dx_pna", label: "Hospital-acquired pneumonia", tier: "wrong" },
    ],
    managements: [
      { id: "mg_source", tier: "correct", label: "Resuscitate, broad-spectrum IV antibiotics + blood cultures, NPO/NG, urgent CT, and operative re-exploration (washout ± diversion/Hartmann) for source control", note: "Diffuse peritonitis with sepsis from a leak needs operative source control alongside the sepsis bundle." },
      { id: "mg_drain", tier: "acceptable", label: "IV antibiotics and image-guided percutaneous drainage of a contained collection", note: "Reasonable for a stable patient with a small, contained leak/abscess — but this patient has diffuse peritonitis and sepsis, so she needs the OR." },
      { id: "mg_ileus", tier: "harmful", label: "Reassure, continue diet, and treat as expected post-op ileus", note: "Mislabels a leak as ileus and delays life-saving source control." },
      { id: "mg_dc", tier: "harmful", label: "Start oral antibiotics and plan discharge", note: "Dangerous under-treatment of intra-abdominal sepsis." },
    ],
    teaching:
      "Educational case. Anastomotic leak typically declares itself around post-op day 5–7 after bowel surgery " +
      "with fever, tachycardia, worsening pain/peritonitis, and a CRP that fails to fall. Work the post-op fever " +
      "differential (the classic 'wind, water, walking, wound, wonder-drugs' by post-op day) but don't anchor — " +
      "a rigid, septic abdomen points to a leak. CT with contrast confirms it. Management combines the sepsis " +
      "bundle (resuscitation, cultures, broad-spectrum antibiotics) with source control: percutaneous drainage " +
      "for a stable, contained leak versus reoperation (washout, diversion/Hartmann) for diffuse peritonitis or " +
      "an unstable patient.",
  },
];

// Expose for non-module scripts.
window.SQ_CONFIG = SQ_CONFIG;
window.ORDER_MENU = ORDER_MENU;
window.DEFAULT_RESULT = DEFAULT_RESULT;
window.CASES = CASES;

# 🩺 SurgeryQuest

A gamified **3D clinical simulation** — a birthday gift for a PGY-2 general-surgery resident.
You're the surgeon on call: walk the ward, click a patient's bed, and work the case end-to-end
(triage → history → exam → labs → imaging → diagnosis → management). An "attending" then grades
the encounter against a rubric and gives teaching feedback.

> 🧪 **Everything here is synthetic and for education only.** No real patient data, no real
> medical advice.

---

## ▶️ How to play

**Easiest:** double-click `index.html` to open it in any modern browser.
*(The 3D library loads from a CDN, so you need internet the first time.)*

**Or serve it locally:**
```bash
cd surgeryquest
python3 -m http.server 8000
# then open http://localhost:8000
```

**Controls:** drag to look around · scroll / pinch to zoom · click a bed to open that patient.

---

## ✏️ Personalize it (the only thing you need to edit)

Open **`data.js`** and edit the clearly-marked `SQ_CONFIG` block at the very top:

```js
const SQ_CONFIG = {
  RECIPIENT_NAME: "[Her Name]",        // ← shown on the welcome screen
  BIRTHDAY_MESSAGE: "Happy birthday…",  // ← your message (use \n for line breaks)
  SIGNED: "— With all my love",         // ← sign-off ("" to hide)
  HOSPITAL_NAME: "Quest General Hospital",
};
```

That's it — no build step, no tooling.

---

## 🗣️ Make the patients talk (live AI) — optional

Out of the box the game is **scripted**: tap a question and the patient answers from
the case script, read aloud by your browser's voice. To make it a true Medkit-style
**talking AI simulator** (patients answer your *typed* questions in character, and an
**AI attending** writes personalized feedback), add one secret on Netlify:

1. Netlify → your site → **Site settings → Environment variables**
2. Add `ANTHROPIC_API_KEY` = your Anthropic API key (from console.anthropic.com)
3. **Redeploy** (Deploys → Trigger deploy). The badge in the app flips to **● Live AI**.

It's **phased** — nothing breaks without a key; the key just switches the brain on.
The key lives only on the server (a Netlify Function in `netlify/functions/ai.js`) and
is never exposed to the browser. Patient voice = Claude Haiku 4.5; attending = Claude Opus 4.8.

> 💡 On an iPhone, Safari can *speak* but can't do speech-to-text, so you **type** your
> questions and the patient talks back — which is exactly how this is set up.

## 🎮 What's inside

- **6 PGY-2 general-surgery cases:** acute appendicitis, small bowel obstruction, acute
  cholecystitis, perforated peptic ulcer, strangulated inguinal hernia, and a post-op
  anastomotic leak — each with vitals, history, exam, labs, imaging, the correct diagnosis,
  correct vs. harmful management, and a teaching summary.
- **Shared master order menu:** the same catalog of history questions, exam maneuvers, labs, and
  imaging for every patient — so you have to choose what's *relevant*. Unindicated / expensive
  tests cost **Resource Stewardship** points.
- **Rubric scoring** across six domains (History, Exam, Workup, Diagnosis, Management,
  Stewardship) → an overall score, **1–3 stars**, and written attending feedback.
- **Gamification:** XP bar, resident-themed levels, a diagnosis **streak**, and unlockable
  **badges** (Sharp Eye, Lifesaver, Steward, Perfect Round, and more). Progress is saved in your
  browser via `localStorage`.

---

## 🗂️ Files

| File | What it is |
|------|-----------|
| `index.html` | Page shell + script/style includes |
| `styles.css` | All styling |
| `data.js` | **Config (edit here)** + master order menu + the 6 cases |
| `game.js`  | 3D ward, encounter flow, scoring, gamification, persistence |

Built with [Three.js](https://threejs.org/) (loaded from CDN). Pure static files — deploy anywhere.

# Abdurr

Two things live in this repository (a split into separate repos is under consideration — see `improvements.md`):

## 1. Smart Drug Formulary

A Vite + React web app for searching a DOH drug formulary, with filters, fuzzy search (Fuse.js), and an AI prescription-scan feature that reads a prescription photo and suggests packages to dispense.

- **Run locally:** `npm install && npm run dev`
- **Lint / build:** `npm run lint` / `npm run build`
- **Data:** loaded at runtime from `public/Doh_Drugs_January_2026.xlsx` (sheets: `Version`, `Drugs`)
- **Deploy:** Netlify (`netlify.toml`). The prescription scan uses the serverless function `netlify/functions/scan-prescription.mjs` — set `OPENAI_API_KEY` in the Netlify site environment to enable it. Without it, the UI falls back to asking the user for their own key.

## 2. Second Brain vault

A personal markdown vault (`inbox/`, `daily/`, `digests/`, `tasks/`, `people/`, `ideas/`, `projects/`, `reference/`, `private/`) managed with Claude Code. Conventions and rules are in `CLAUDE.md`. `private/` contents are gitignored and off limits.

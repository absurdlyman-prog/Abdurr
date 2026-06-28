# Build & Deployment

## Prerequisites

- **Node ≥ 20** (developed on 22). `npm` ships with it.
- A modern browser (WebGL/WebGPU for Pixi, WebAudio for the score).

## Local development

```bash
cd hollowreach
npm install
npm run dev          # Vite dev server at http://localhost:5173 (base "/")
```

Optional cloud-save backend (cross-device sync; the game is fully playable
without it):

```bash
npm run server       # Node HTTP server at http://localhost:8787
```

Vite proxies `/api` → `:8787` in dev, so `pushCloud`/`pullCloud` just work.

## Quality gates

```bash
npm run typecheck         # strict tsc, no emit
npm run validate:content  # JSON referential-integrity linter (exits non-zero on error)
npm test                  # node:test unit tests for the pure systems
```

Wire `validate:content` and `typecheck` into CI to keep content honest.

## Production build

```bash
npm run build        # tsc -b && vite build  → dist/
npm run preview      # serve dist/ at http://localhost:4173/hollowreach/
```

The build splits `pixi`, `react`, and app code into separate chunks and emits
source maps. There are no assets to copy beyond the favicon.

### Base path

`vite.config.ts` sets `base` to `/hollowreach/` in production (for a project
sub-path) and `/` in dev. Override per host:

```bash
VITE_BASE=/ npm run build          # root deploy (Netlify, custom domain)
VITE_BASE=/games/hollowreach/ npm run build
```

## Deploying

### GitHub Pages (project sub-path)

The repo already publishes to the `gh-pages` branch. Build with the default base
and copy `dist/` into the published tree under `hollowreach/`:

```bash
npm run build
# publish dist/ to gh-pages at path /hollowreach/  (e.g. via your Pages action)
```

Then the game is live at `https://<user>.github.io/<repo>/hollowreach/`. The repo
root already contains `.nojekyll`, which Pages needs to serve the hashed asset
files.

### Netlify

```bash
# netlify.toml
[build]
  base = "hollowreach"
  command = "VITE_BASE=/ npm run build"
  publish = "hollowreach/dist"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Any static host

Serve `dist/` behind the matching `VITE_BASE`. The SPA needs a fallback rewrite
to `index.html` for deep links. No server is required unless you want cloud
saves.

### Cloud-save server (optional, for sync)

Deploy `server/index.ts` to any Node host (`tsx server/index.ts`, or compile
first). Set `SAVE_DIR` to a persistent volume and `PORT`. Point the frontend's
`/api` at it (reverse-proxy or same origin). It has no dependencies.

## Troubleshooting

- **Blank page on a sub-path:** the `base` doesn't match where you served it — the
  hashed asset URLs 404. Rebuild with the correct `VITE_BASE`.
- **No audio:** browsers block autoplay until a user gesture; click the title
  screen once. Check the master/music sliders in Settings.
- **Pixi context lost on resize storms:** the renderer resizes to its host; ensure
  the host div has a non-zero size before `mount`.

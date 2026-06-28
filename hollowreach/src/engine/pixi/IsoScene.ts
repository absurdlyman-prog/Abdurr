import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDef, SceneHotspot } from '@game/types';
import { TILES, DECALS, type TileSpec } from './tiles';
import { tileToScreen, depth, type IsoConfig } from './iso';

// Builds the static, painterly iso world for one scene plus the dynamic marker
// layer (hotspots + player). All art is procedural: each tile is a 2:1 diamond
// with extruded left/right faces and a scatter of brushstroke flecks, so the
// scene reads as an oil sketch rather than flat tiles — and ships with no
// binary assets.

export interface BuiltScene {
  root: Container;
  cfg: IsoConfig;
  markers: Container;
  setPlayer(x: number, y: number): void;
  setHotspots(visible: SceneHotspot[], hovered: string | null): void;
  hotspotAt(tx: number, ty: number): SceneHotspot | null;
}

const labelStyle = new TextStyle({
  fontFamily: 'Georgia, serif',
  fontSize: 14,
  fill: '#e8dcc0',
  stroke: { color: '#0a0e13', width: 4 },
  dropShadow: { color: '#000000', blur: 4, distance: 2, alpha: 0.6 },
});

export function buildScene(scene: SceneDef, viewW: number, viewH: number, seed = 1): BuiltScene {
  const cfg: IsoConfig = {
    tileWidth: scene.tileWidth,
    tileHeight: scene.tileHeight,
    originX: viewW / 2,
    originY: viewH / 2 - (scene.width + scene.height) * (scene.tileHeight / 4),
  };

  const root = new Container();
  root.sortableChildren = true;

  const ground = new Graphics();
  ground.zIndex = 0;
  const decals = new Graphics();
  decals.zIndex = 1;
  root.addChild(ground, decals);

  const rng = mulberry(seed);

  // --- ground + raised faces ---------------------------------------------
  const groundLayer = scene.layers.find((l) => l.name === 'ground');
  if (groundLayer) {
    for (let y = 0; y < scene.height; y++) {
      for (let x = 0; x < scene.width; x++) {
        const id = groundLayer.tiles[y * scene.width + x] ?? 0;
        const spec = TILES[id];
        if (!spec) continue;
        drawTile(ground, x, y, spec, cfg, rng);
      }
    }
  }

  // --- decals (puddles, neon lamps, debris) ------------------------------
  const decalLayer = scene.layers.find((l) => l.name === 'decals');
  if (decalLayer) {
    for (let y = 0; y < scene.height; y++) {
      for (let x = 0; x < scene.width; x++) {
        const id = decalLayer.tiles[y * scene.width + x] ?? 0;
        const kind = DECALS[id];
        if (!kind) continue;
        drawDecal(decals, x, y, kind, cfg, rng);
      }
    }
  }

  // --- dynamic markers ---------------------------------------------------
  const markers = new Container();
  markers.sortableChildren = true;
  markers.zIndex = 10;
  root.addChild(markers);

  const playerMarker = makePlayerMarker();
  markers.addChild(playerMarker);

  const hotspotContainer = new Container();
  hotspotContainer.sortableChildren = true;
  markers.addChild(hotspotContainer);

  let lastHotspots: SceneHotspot[] = [];

  function setPlayer(x: number, y: number): void {
    const { sx, sy } = tileToScreen(x, y, cfg);
    playerMarker.position.set(sx, sy - 10);
    playerMarker.zIndex = depth(x, y) + 0.5;
  }

  function setHotspots(visible: SceneHotspot[], hovered: string | null): void {
    lastHotspots = visible;
    hotspotContainer.removeChildren();
    for (const h of visible) {
      const node = makeHotspotMarker(h, h.id === hovered);
      const { sx, sy } = tileToScreen(h.x, h.y, cfg);
      node.position.set(sx, sy - 14);
      node.zIndex = depth(h.x, h.y);
      hotspotContainer.addChild(node);
    }
  }

  function hotspotAt(tx: number, ty: number): SceneHotspot | null {
    let best: SceneHotspot | null = null;
    let bestDist = Infinity;
    for (const h of lastHotspots) {
      const r = h.radius ?? 1.2;
      const d = Math.hypot(h.x - tx, h.y - ty);
      if (d <= r && d < bestDist) {
        best = h;
        bestDist = d;
      }
    }
    return best;
  }

  return { root, cfg, markers, setPlayer, setHotspots, hotspotAt };
}

// --- drawing primitives ---------------------------------------------------

function drawTile(g: Graphics, x: number, y: number, spec: TileSpec, cfg: IsoConfig, rng: () => number): void {
  const { sx, sy } = tileToScreen(x, y, cfg);
  const hw = cfg.tileWidth / 2;
  const hh = cfg.tileHeight / 2;
  const h = spec.height;

  // Left & right extruded faces (drawn first, under the top).
  if (h > 0) {
    g.poly([sx - hw, sy, sx - hw, sy + h, sx, sy + hh + h, sx, sy + hh]).fill({ color: spec.left });
    g.poly([sx + hw, sy, sx + hw, sy + h, sx, sy + hh + h, sx, sy + hh]).fill({ color: spec.right });
  }

  // Top diamond.
  g.poly([sx, sy - hh, sx + hw, sy, sx, sy + hh, sx - hw, sy]).fill({ color: spec.top });

  // Painterly speckle: a few jittered flecks of lighter/darker paint.
  const flecks = Math.floor(spec.roughness * 7);
  for (let i = 0; i < flecks; i++) {
    const jx = (rng() - 0.5) * cfg.tileWidth * 0.7;
    const jy = (rng() - 0.5) * cfg.tileHeight * 0.7;
    const lighten = rng() > 0.5;
    g.circle(sx + jx, sy + jy, 0.6 + rng() * 1.6).fill({
      color: lighten ? lighten20(spec.top) : darken20(spec.top),
      alpha: 0.25 + rng() * 0.25,
    });
  }

  // Water/neon glow on the top face.
  if (spec.glow !== undefined) {
    g.poly([sx, sy - hh, sx + hw, sy, sx, sy + hh, sx - hw, sy]).fill({ color: spec.glow, alpha: 0.12 });
  }
}

function drawDecal(g: Graphics, x: number, y: number, kind: string, cfg: IsoConfig, rng: () => number): void {
  const { sx, sy } = tileToScreen(x, y, cfg);
  switch (kind) {
    case 'puddle':
      g.ellipse(sx, sy, 22 + rng() * 10, 11 + rng() * 5).fill({ color: 0x1c2b3a, alpha: 0.55 });
      g.ellipse(sx, sy, 10, 5).fill({ color: 0x39536b, alpha: 0.4 });
      break;
    case 'reflection':
      g.ellipse(sx, sy, 26, 13).fill({ color: 0xc9772e, alpha: 0.18 });
      break;
    case 'rebar':
      g.rect(sx - 1.5, sy - 36, 3, 40).fill({ color: 0x2a2925 });
      g.rect(sx - 8, sy - 8, 16, 5).fill({ color: 0x33302a });
      break;
    case 'lamp_neon':
      g.rect(sx - 2, sy - 44, 4, 44).fill({ color: 0x10151c });
      g.circle(sx, sy - 48, 9).fill({ color: 0xd65fa2, alpha: 0.9 });
      g.circle(sx, sy - 48, 20).fill({ color: 0xd65fa2, alpha: 0.18 });
      break;
    case 'lamp_dead':
      g.rect(sx - 2, sy - 40, 4, 40).fill({ color: 0x14110d });
      g.circle(sx, sy - 44, 7).fill({ color: 0x2a2620 });
      break;
  }
}

function makePlayerMarker(): Container {
  const c = new Container();
  const g = new Graphics();
  // A long coat seen from the back, painterly — a hunched silhouette + lamp halo.
  g.ellipse(0, 6, 16, 7).fill({ color: 0x000000, alpha: 0.35 }); // shadow
  g.poly([-10, 4, 10, 4, 7, -34, -7, -34]).fill({ color: 0x2a3038 }); // coat
  g.poly([-10, 4, 10, 4, 8, -6, -8, -6]).fill({ color: 0x1c2128 }); // coat hem shadow
  g.circle(0, -40, 7).fill({ color: 0x4a4036 }); // head
  g.circle(0, -44, 9).fill({ color: 0xc9a25f, alpha: 0.12 }); // faint halo
  c.addChild(g);
  return c;
}

function makeHotspotMarker(h: SceneHotspot, hovered: boolean): Container {
  const c = new Container();
  const g = new Graphics();
  const accent = h.emissive ? parseInt(h.emissive.replace('#', ''), 16) : 0xc8b48a;

  // Footprint glow.
  g.ellipse(0, 4, 18, 9).fill({ color: accent, alpha: hovered ? 0.4 : 0.16 });

  // Sprite stand-in by kind.
  switch (h.kind) {
    case 'npc':
      g.poly([-8, 2, 8, 2, 6, -30, -6, -30]).fill({ color: 0x3a342c });
      g.circle(0, -34, 6).fill({ color: 0x6a5238 });
      break;
    case 'exit':
      g.poly([0, -26, 12, -10, 0, -2, -12, -10]).fill({ color: accent, alpha: 0.85 });
      break;
    case 'clue':
      g.circle(0, -16, 6).fill({ color: accent, alpha: 0.9 });
      g.circle(0, -16, 12).fill({ color: accent, alpha: 0.22 });
      break;
    default:
      g.rect(-9, -20, 18, 18).fill({ color: 0x3a342c });
  }
  c.addChild(g);

  if (hovered) {
    const label = new Text({ text: h.label, style: labelStyle });
    label.anchor.set(0.5, 1);
    label.position.set(0, -40);
    c.addChild(label);
  }
  return c;
}

// --- colour utils ---------------------------------------------------------

function lighten20(c: number): number {
  return shade(c, 1.3);
}
function darken20(c: number): number {
  return shade(c, 0.7);
}
function shade(c: number, f: number): number {
  const r = Math.min(255, Math.round(((c >> 16) & 255) * f));
  const g = Math.min(255, Math.round(((c >> 8) & 255) * f));
  const b = Math.min(255, Math.round((c & 255) * f));
  return (r << 16) | (g << 8) | b;
}

function mulberry(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    let t = (s += 0x6d2b79f5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

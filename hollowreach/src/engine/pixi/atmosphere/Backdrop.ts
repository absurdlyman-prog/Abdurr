import { Container, Graphics } from 'pixi.js';

// Parallax skyline. Behind the isometric map sits a painted horizon: a sky wash,
// then two drifting rows of silhouetted rooftops and dead crane-towers with a
// scatter of lit windows (which catch the bloom). Far row moves slowest. This
// anchors every scene in a city instead of leaving the map floating on black.

interface Window {
  g: Graphics;
}

export class Backdrop {
  readonly view = new Container();
  private sky = new Graphics();
  private far = new Container();
  private near = new Container();
  private windows: Window[] = [];
  private w = 0;
  private h = 0;
  private seed = 1;
  private accent = 0xd6a25f;
  private silhouette = 0x0c1118;
  private t = 0;
  private reducedMotion = false;

  constructor() {
    this.view.eventMode = 'none';
    this.view.addChild(this.sky, this.far, this.near);
  }

  resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
    this.rebuild();
  }

  configure(palette: { sky: string; accent: string; shadow: string }, seed: number, reducedMotion: boolean): void {
    this.accent = hex(palette.accent);
    this.silhouette = hex(palette.shadow);
    this.seed = seed;
    this.reducedMotion = reducedMotion;
    this.rebuild();
  }

  private rebuild(): void {
    if (this.w === 0) return;
    const rng = mulberry(this.seed);

    // Sky wash — a soft vertical gradient drawn as stacked bands (cheap, no shader).
    this.sky.clear();
    const horizon = this.h * 0.6;
    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      const y = t * horizon;
      this.sky.rect(0, y, this.w, horizon / 24 + 1).fill({ color: blend(this.silhouette, 0x202a3a, 1 - t), alpha: 1 });
    }
    this.sky.rect(0, horizon, this.w, this.h - horizon).fill({ color: this.silhouette });

    this.far.removeChildren();
    this.near.removeChildren();
    this.windows = [];

    this.buildRow(this.far, rng, horizon, 0.55, 0.7, 70);
    this.buildRow(this.near, rng, horizon + 24, 0.8, 1.0, 90);
  }

  private buildRow(layer: Container, rng: () => number, baseY: number, darkness: number, scale: number, maxH: number): void {
    const g = new Graphics();
    layer.addChild(g);
    const color = blend(this.silhouette, 0x000000, darkness);
    let x = -120;
    while (x < this.w + 120) {
      const wBuild = 40 + rng() * 90 * scale;
      const hBuild = 30 + rng() * maxH;
      const top = baseY - hBuild;
      g.rect(x, top, wBuild, hBuild + 200).fill({ color });

      // Occasional crane-tower silhouette.
      if (rng() > 0.78) {
        const cx = x + wBuild / 2;
        g.rect(cx - 2, top - 50 * scale, 4, 50 * scale).fill({ color });
        g.rect(cx - 30 * scale, top - 50 * scale, 60 * scale, 4).fill({ color });
        g.moveTo(cx, top - 50 * scale).lineTo(cx + 26 * scale, top - 30 * scale).stroke({ color, width: 2 });
      }

      // Lit windows — small warm rects that the bloom turns into glows.
      const cols = Math.floor(wBuild / 12);
      const rows = Math.floor(hBuild / 14);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (rng() > 0.82) {
            const wg = new Graphics();
            const lit = rng() > 0.5 ? this.accent : 0xc9b27a;
            wg.rect(x + 6 + c * 12, top + 6 + r * 14, 4, 6).fill({ color: lit, alpha: 0.9 });
            layer.addChild(wg);
            this.windows.push({ g: wg });
          }
        }
      }
      x += wBuild + 6;
    }
  }

  /** Shift the rows opposite the camera for depth. */
  setParallax(camX: number, camY: number): void {
    this.far.position.set(camX * 0.04, camY * 0.02);
    this.near.position.set(camX * 0.09, camY * 0.05);
  }

  tick(dt: number): void {
    if (this.reducedMotion) return;
    this.t += dt;
    // Slow drift + occasional window flicker for life.
    this.far.x += Math.sin(this.t * 0.002) * 0.05;
    if (Math.random() < 0.01 && this.windows.length) {
      const w = this.windows[(Math.random() * this.windows.length) | 0];
      w.g.alpha = 0.3 + Math.random() * 0.7;
    }
  }
}

function hex(s: string): number {
  return parseInt(s.replace('#', ''), 16);
}

function blend(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255,
    ag = (a >> 8) & 255,
    ab = a & 255;
  const br = (b >> 16) & 255,
    bg = (b >> 8) & 255,
    bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
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

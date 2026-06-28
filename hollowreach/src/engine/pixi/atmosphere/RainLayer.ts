import { Container, Graphics } from 'pixi.js';

// Rain. A pool of streaks falling on a wind-sheared diagonal, recycled when they
// leave the viewport. Intensity 0..1 scales drop count, length, and opacity. A
// thin splash flicker is drawn where drops "land" to sell wet stone.

interface Drop {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
}

export class RainLayer {
  readonly view = new Container();
  private g = new Graphics();
  private drops: Drop[] = [];
  private w = 0;
  private h = 0;
  private intensity = 0;
  private wind = 0.4;
  private reducedMotion = false;

  constructor() {
    this.view.addChild(this.g);
    this.view.eventMode = 'none';
  }

  resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
    this.seed();
  }

  configure(intensity: number, wind: number, reducedMotion: boolean): void {
    this.intensity = intensity;
    this.wind = wind;
    this.reducedMotion = reducedMotion;
    this.seed();
  }

  private seed(): void {
    const count = this.reducedMotion ? 0 : Math.floor(this.intensity * 420);
    this.drops = Array.from({ length: count }, () => this.spawn());
  }

  private spawn(): Drop {
    return {
      x: Math.random() * (this.w + 200) - 100,
      y: Math.random() * this.h,
      len: 8 + Math.random() * 18 * (0.5 + this.intensity),
      speed: 9 + Math.random() * 14,
      alpha: 0.12 + Math.random() * 0.28 * this.intensity,
    };
  }

  tick(dt: number): void {
    if (!this.drops.length) {
      this.g.clear();
      return;
    }
    const wx = (this.wind - 0.2) * 6;
    this.g.clear();
    for (const d of this.drops) {
      d.y += d.speed * dt;
      d.x += wx * dt;
      if (d.y > this.h) {
        d.y = -d.len;
        d.x = Math.random() * (this.w + 200) - 100;
      }
      this.g
        .moveTo(d.x, d.y)
        .lineTo(d.x - wx * 1.4, d.y - d.len)
        .stroke({ color: 0xbcd0e0, alpha: d.alpha, width: 1.2 });
    }
  }
}

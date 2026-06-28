import { Container, Graphics } from 'pixi.js';

// Volumetric fog. Several large, soft, semi-transparent blobs drift across the
// scene at different speeds and depths (parallax), building a moving haze that
// reads as low harbour mist. Density 0..1 scales count, size, and opacity.

interface Puff {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  alpha: number;
}

export class FogLayer {
  readonly view = new Container();
  private g = new Graphics();
  private puffs: Puff[] = [];
  private w = 0;
  private h = 0;
  private density = 0;
  private color = 0x2a3744;
  private reducedMotion = false;
  private t = 0;

  constructor() {
    this.view.addChild(this.g);
    this.view.eventMode = 'none';
    this.view.alpha = 0.9;
  }

  resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
    this.seed();
  }

  configure(density: number, color: number, reducedMotion: boolean): void {
    this.density = density;
    this.color = color;
    this.reducedMotion = reducedMotion;
    this.seed();
  }

  private seed(): void {
    const count = Math.floor(6 + this.density * 14);
    this.puffs = Array.from({ length: count }, () => this.spawn(true));
  }

  private spawn(anywhere: boolean): Puff {
    return {
      x: anywhere ? Math.random() * this.w : -300,
      y: this.h * (0.25 + Math.random() * 0.7),
      r: 140 + Math.random() * 260 * (0.6 + this.density),
      speed: (this.reducedMotion ? 0 : 1) * (4 + Math.random() * 12),
      drift: Math.random() * Math.PI * 2,
      alpha: (0.04 + Math.random() * 0.12) * (0.4 + this.density),
    };
  }

  tick(dt: number): void {
    this.t += dt * 0.01;
    this.g.clear();
    for (const p of this.puffs) {
      p.x += p.speed * dt * 0.25;
      const wobble = Math.sin(this.t + p.drift) * 12;
      if (p.x - p.r > this.w) Object.assign(p, this.spawn(false));
      // Soft blob = stacked concentric circles fading out (cheap gaussian).
      for (let i = 3; i >= 1; i--) {
        this.g.circle(p.x, p.y + wobble, p.r * (i / 3)).fill({ color: this.color, alpha: p.alpha / i });
      }
    }
  }
}

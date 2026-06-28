import { Container, Sprite, Texture, TilingSprite, type Filter } from 'pixi.js';
import { AdvancedBloomFilter, GodrayFilter } from 'pixi-filters';

// Cinematic post-processing. Two parts:
//   1. `filters` — a bloom + godray stack applied to the whole composited scene.
//      Bloom is what turns flat neon and lamplight into glowing wet paint;
//      godrays add the volumetric light-shafts you get in rain and harbour mist.
//   2. `overlay` — a multiply vignette + a drifting film-grain layer added ABOVE
//      the day/night grade, so the frame reads like a photographed oil painting.
//
// Everything tunes down or off under reduced-motion / high-contrast.

export class PostFX {
  readonly filters: Filter[] = [];
  readonly overlay = new Container();

  private bloom: AdvancedBloomFilter;
  private godray: GodrayFilter;
  private vignette = new Sprite(Texture.WHITE);
  private grain: TilingSprite;
  private w = 1;
  private h = 1;
  private animate = true;
  private grainStrength = 0.06;
  private baseGodrayGain = 0.3;

  constructor() {
    this.bloom = new AdvancedBloomFilter({
      threshold: 0.5,
      bloomScale: 1.05,
      brightness: 1.0,
      blur: 9,
      quality: 6,
    });
    this.godray = new GodrayFilter({
      gain: this.baseGodrayGain,
      lacunarity: 2.5,
      alpha: 0.7,
      angle: 38,
      parallel: true,
    });
    this.filters.push(this.bloom, this.godray);

    this.vignette.blendMode = 'multiply';
    this.grain = new TilingSprite({ texture: makeGrainTexture(), width: 4, height: 4 });
    this.grain.alpha = this.grainStrength;
    this.grain.blendMode = 'overlay';

    this.overlay.eventMode = 'none';
    this.overlay.addChild(this.vignette, this.grain);
  }

  resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
    this.vignette.texture = makeVignetteTexture(w, h);
    this.vignette.width = w;
    this.vignette.height = h;
    this.grain.width = w;
    this.grain.height = h;
  }

  /** Tune intensity to the scene's weather (more rain/fog ⇒ stronger shafts). */
  configureScene(rain: number, fog: number): void {
    const wetness = Math.min(1, rain + fog * 0.5);
    this.baseGodrayGain = 0.12 + wetness * 0.3;
    this.godray.gain = this.baseGodrayGain;
    this.bloom.bloomScale = 0.85 + wetness * 0.4;
  }

  /** Accessibility + master FX toggles. */
  configure(opts: { reducedMotion: boolean; highContrast: boolean }): void {
    this.animate = !opts.reducedMotion;
    this.grain.visible = !opts.reducedMotion;
    if (opts.highContrast) {
      // Keep text legible: soften bloom and vignette, drop the shafts.
      this.bloom.threshold = 0.7;
      this.bloom.bloomScale = 0.5;
      this.godray.gain = 0.05;
      this.vignette.alpha = 0.4;
    } else {
      this.bloom.threshold = 0.5;
      this.vignette.alpha = 1;
      this.godray.gain = this.baseGodrayGain;
    }
  }

  tick(dt: number): void {
    if (!this.animate) return;
    // Drift the light shafts and breathe the bloom so the frame never sits still.
    this.godray.time += dt * 0.004;
    // Jitter grain to avoid a fixed dirty-screen look.
    this.grain.tilePosition.set(Math.random() * this.w, Math.random() * this.h);
  }
}

// --- procedural textures ---------------------------------------------------

function makeVignetteTexture(w: number, h: number): Texture {
  const canvas = document.createElement('canvas');
  // Low-res is fine — it's stretched and multiplied.
  canvas.width = Math.max(2, Math.round(w / 4));
  canvas.height = Math.max(2, Math.round(h / 4));
  const ctx = canvas.getContext('2d')!;
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.44;
  const grad = ctx.createRadialGradient(cx, cy, Math.min(cx, cy) * 0.3, cx, cy, Math.max(cx, cy) * 1.15);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.6, '#d8d2c4');
  grad.addColorStop(1, '#1a1a22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return Texture.from(canvas);
}

function makeGrainTexture(): Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 90;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return Texture.from(canvas);
}

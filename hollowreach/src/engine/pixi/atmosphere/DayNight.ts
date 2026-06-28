// Day/night colour grading. Maps an in-game minute-of-day (0..1439) to an
// ambient tint + darkness used as a full-screen multiply/overlay. Hand-tuned
// keyframes give the painterly palette its time-of-day mood: bruised dawn,
// bleached noon, sodium dusk, drowned midnight.

export interface Grade {
  /** Overlay colour (hex number). */
  tint: number;
  /** Overlay alpha 0..1 (how strong the grade is). */
  alpha: number;
  /** Suggested ambient light 0..1, for neon/lamp contrast. */
  ambient: number;
  /** Human label for the HUD clock. */
  label: string;
}

interface Keyframe extends Grade {
  minute: number;
}

const KEYS: Keyframe[] = [
  { minute: 0, tint: 0x0a1424, alpha: 0.62, ambient: 0.12, label: 'Dead of night' },
  { minute: 300, tint: 0x1a2740, alpha: 0.5, ambient: 0.2, label: 'Before dawn' },
  { minute: 390, tint: 0x6a4a44, alpha: 0.34, ambient: 0.42, label: 'Bruised dawn' },
  { minute: 600, tint: 0x9fae9a, alpha: 0.14, ambient: 0.78, label: 'Grey morning' },
  { minute: 780, tint: 0xb6b0a0, alpha: 0.08, ambient: 0.9, label: 'Flat noon' },
  { minute: 1020, tint: 0xc08648, alpha: 0.2, ambient: 0.62, label: 'Sodium afternoon' },
  { minute: 1140, tint: 0x6a3f3a, alpha: 0.36, ambient: 0.4, label: 'Rust dusk' },
  { minute: 1290, tint: 0x18223a, alpha: 0.54, ambient: 0.18, label: 'Lamplight' },
  { minute: 1439, tint: 0x0a1424, alpha: 0.62, ambient: 0.12, label: 'Drowned midnight' },
];

export function gradeForMinute(minuteOfDay: number): Grade {
  const m = ((minuteOfDay % 1440) + 1440) % 1440;
  let a = KEYS[0];
  let b = KEYS[KEYS.length - 1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (m >= KEYS[i].minute && m <= KEYS[i + 1].minute) {
      a = KEYS[i];
      b = KEYS[i + 1];
      break;
    }
  }
  const span = b.minute - a.minute || 1;
  const t = (m - a.minute) / span;
  return {
    tint: lerpColor(a.tint, b.tint, t),
    alpha: lerp(a.alpha, b.alpha, t),
    ambient: lerp(a.ambient, b.ambient, t),
    label: t < 0.5 ? a.label : b.label,
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255,
    ag = (a >> 8) & 255,
    ab = a & 255;
  const br = (b >> 16) & 255,
    bg = (b >> 8) & 255,
    bb = b & 255;
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bl = Math.round(lerp(ab, bb, t));
  return (r << 16) | (g << 8) | bl;
}

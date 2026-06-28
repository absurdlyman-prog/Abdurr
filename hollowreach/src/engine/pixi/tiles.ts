// Procedural tile + decal vocabulary. HOLLOWREACH ships no bitmap tilesets — the
// painterly look is built from layered, jittered polygons so the whole game runs
// from JSON + code with zero binary art. Each tile id maps to a palette of
// top/left/right face colours (for the faux-3D block look) plus a roughness used
// to scatter brushstroke flecks.
//
// Lighting model: a warm key light from the upper-left. Top faces are warmest
// and brightest, the left face catches a little of it, the right face falls into
// cool shadow. Strong top/side contrast is what gives the scene its sculpted,
// oil-painted volume — and the brighter `glow` values feed the bloom pass.

export interface TileSpec {
  /** Top face (lit). */
  top: number;
  /** Left and right faces give cheap volume under the iso key light. */
  left: number;
  right: number;
  /** 0 = flat, >0 = raised block height in px. */
  height: number;
  /** 0..1 brushstroke speckle density. */
  roughness: number;
  /** Optional emissive (neon/water-glow) colour — fed to the bloom pass. */
  glow?: number;
}

const C = (hex: string): number => parseInt(hex.replace('#', ''), 16);

export const TILES: Record<number, TileSpec> = {
  0: { top: C('#0a0e13'), left: C('#070a0e'), right: C('#05080b'), height: 0, roughness: 0 }, // void
  1: { top: C('#6a5638'), left: C('#3d3122'), right: C('#241d14'), height: 6, roughness: 0.55 }, // planks
  2: { top: C('#0d141d'), left: C('#0a0f16'), right: C('#06090d'), height: 0, roughness: 0.2, glow: C('#22405e') }, // water
  3: { top: C('#454d57'), left: C('#272c33'), right: C('#171b20'), height: 8, roughness: 0.45 }, // stone quay
  4: { top: C('#564a3a'), left: C('#332c24'), right: C('#201a15'), height: 4, roughness: 0.65 }, // mud
  5: { top: C('#55432f'), left: C('#33281d'), right: C('#1f1812'), height: 10, roughness: 0.35 }, // building floor
  6: { top: C('#525e6b'), left: C('#2f363e'), right: C('#1c2127'), height: 10, roughness: 0.4 }, // dock edge
  7: { top: C('#7a5e3e'), left: C('#473625'), right: C('#2c2117'), height: 14, roughness: 0.35 }, // hall wall
  8: { top: C('#46443c'), left: C('#2a2925'), right: C('#1a1916'), height: 6, roughness: 0.55 }, // industrial gravel
  9: { top: C('#1a2230'), left: C('#0f131c'), right: C('#080b11'), height: 12, roughness: 0.3 }, // rows building
  10: { top: C('#303b49'), left: C('#1c232c'), right: C('#11161c'), height: 2, roughness: 0.35, glow: C('#ff79c0') }, // neon-lit plaza
};

// Decal ids (>=11) are billboarded sprites placed in the "decals" layer.
export type DecalKind = 'puddle' | 'crate' | 'lamp_dead' | 'lamp_neon' | 'rebar' | 'reflection';

export const DECALS: Record<number, DecalKind> = {
  11: 'puddle',
  12: 'reflection',
  13: 'rebar',
  14: 'lamp_neon',
  15: 'lamp_dead',
};

// Procedural tile + decal vocabulary. HOLLOWREACH ships no bitmap tilesets — the
// painterly look is built from layered, jittered polygons so the whole game runs
// from JSON + code with zero binary art. Each tile id maps to a palette of
// top/left/right face colours (for the faux-3D block look) plus a roughness used
// to scatter brushstroke flecks.

export interface TileSpec {
  /** Top face. */
  top: number;
  /** Left and right faces give cheap volume under the iso light. */
  left: number;
  right: number;
  /** 0 = flat, >0 = raised block height in px. */
  height: number;
  /** 0..1 brushstroke speckle density. */
  roughness: number;
  /** Optional emissive (neon/water-glow) colour. */
  glow?: number;
}

const C = (hex: string): number => parseInt(hex.replace('#', ''), 16);

export const TILES: Record<number, TileSpec> = {
  0: { top: C('#0a0e13'), left: C('#070a0e'), right: C('#05080b'), height: 0, roughness: 0 }, // void
  1: { top: C('#5a4a36'), left: C('#3d3122'), right: C('#332a1d'), height: 6, roughness: 0.5 }, // planks
  2: { top: C('#10161e'), left: C('#0b1016'), right: C('#080c11'), height: 0, roughness: 0.2, glow: C('#1c2b3a') }, // water
  3: { top: C('#3a4049'), left: C('#272c33'), right: C('#1f242a'), height: 8, roughness: 0.4 }, // stone quay
  4: { top: C('#4a4034'), left: C('#332c24'), right: C('#28221c'), height: 4, roughness: 0.6 }, // mud
  5: { top: C('#4a3a2a'), left: C('#33281d'), right: C('#281f17'), height: 10, roughness: 0.3 }, // building floor
  6: { top: C('#46505b'), left: C('#2f363e'), right: C('#252b31'), height: 10, roughness: 0.35 }, // dock edge
  7: { top: C('#6a5238'), left: C('#473625'), right: C('#3a2c1e'), height: 14, roughness: 0.3 }, // hall wall
  8: { top: C('#3c3a34'), left: C('#2a2925'), right: C('#211f1c'), height: 6, roughness: 0.5 }, // industrial gravel
  9: { top: C('#161c28'), left: C('#0f131c'), right: C('#0b0e15'), height: 12, roughness: 0.25 }, // rows building
  10: { top: C('#2a3340'), left: C('#1c232c'), right: C('#161b22'), height: 2, roughness: 0.3, glow: C('#d65fa2') }, // neon-lit plaza
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

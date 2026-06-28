// Deterministic RNG so skill checks are reproducible across save/load and so a
// red check the player just failed can't be re-rolled by reloading (the seed is
// advanced and persisted). Mulberry32 — small, fast, good enough for dice.

export interface RngState {
  seed: number;
}

export function createSeed(): number {
  // 32-bit seed from time + entropy.
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

/** Advance the seed and return a float in [0,1). Mutates the passed state. */
export function nextFloat(state: RngState): number {
  let t = (state.seed += 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Integer in [min, max] inclusive. */
export function nextInt(state: RngState, min: number, max: number): number {
  return min + Math.floor(nextFloat(state) * (max - min + 1));
}

/** Roll a single d6. */
export function rollD6(state: RngState): number {
  return nextInt(state, 1, 6);
}

/** Roll 2d6 — returns the two dice so the UI can show snake-eyes/boxcars. */
export function roll2d6(state: RngState): [number, number] {
  return [rollD6(state), rollD6(state)];
}

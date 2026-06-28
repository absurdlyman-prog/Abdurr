// Isometric projection helpers. Diamond (2:1) projection shared by the renderer
// and the input/picking code so clicks land on the right tile.

export interface IsoConfig {
  tileWidth: number;
  tileHeight: number;
  /** Pixel offset that centres the map in the viewport. */
  originX: number;
  originY: number;
}

export function tileToScreen(x: number, y: number, cfg: IsoConfig): { sx: number; sy: number } {
  const sx = (x - y) * (cfg.tileWidth / 2) + cfg.originX;
  const sy = (x + y) * (cfg.tileHeight / 2) + cfg.originY;
  return { sx, sy };
}

export function screenToTile(sx: number, sy: number, cfg: IsoConfig): { x: number; y: number } {
  const px = sx - cfg.originX;
  const py = sy - cfg.originY;
  const x = (px / (cfg.tileWidth / 2) + py / (cfg.tileHeight / 2)) / 2;
  const y = (py / (cfg.tileHeight / 2) - px / (cfg.tileWidth / 2)) / 2;
  return { x: Math.round(x), y: Math.round(y) };
}

/** Depth-sort key so nearer tiles/sprites draw on top. */
export function depth(x: number, y: number): number {
  return x + y;
}

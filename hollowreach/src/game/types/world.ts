import type { Condition, Effect } from './dialogue';

// World / scene model. Scenes are isometric tile maps with interactable hotspots.
// They are authored as JSON (content/scenes/*.json) and rendered by the Pixi
// IsoScene. Hotspots can open dialogues, trigger effects, or move between scenes.

export interface TileLayer {
  /** Layer name: "ground", "water", "decals", "roofs". */
  name: string;
  /** Tile ids in row-major order (width*height). 0 = empty. */
  tiles: number[];
  /** Render opacity 0..1. */
  opacity?: number;
}

export interface SceneHotspot {
  id: string;
  label: string;
  /** Iso tile coordinate of the hotspot anchor. */
  x: number;
  y: number;
  kind: 'npc' | 'object' | 'exit' | 'clue';
  /** Pixi sprite/atlas key or procedural shape descriptor. */
  sprite?: string;
  /** Opens this dialogue id when interacted with. */
  dialogue?: string;
  /** For exits: target scene id and spawn point. */
  target?: { scene: string; spawn?: { x: number; y: number } };
  /** Hidden until the condition holds (e.g. perception passive reveals a clue). */
  revealWhen?: Condition;
  /** Tint/emissive for neon-lit objects. */
  emissive?: string;
  /** Footprint radius in tiles for click hit-testing. */
  radius?: number;
  /** Optional ambient note shown on hover. */
  hoverNote?: string;
  /** Effects fired the first time a `clue`/`object` hotspot is examined. */
  onExamine?: Effect[];
}

export interface SceneWeather {
  /** Base weather; can be overridden by the WeatherDirector. */
  rain: number; // 0..1 intensity
  fog: number; // 0..1 density
  wind: number; // 0..1
  /** Hex tints for the fog/rain at this location. */
  fogColor?: string;
}

export interface SceneDef {
  id: string;
  name: string;
  district: string;
  width: number; // tiles
  height: number; // tiles
  /** Iso tile pixel dimensions. */
  tileWidth: number;
  tileHeight: number;
  layers: TileLayer[];
  hotspots: SceneHotspot[];
  /** Default player spawn tile. */
  spawn: { x: number; y: number };
  weather: SceneWeather;
  /** Ambient audio bed id, see content/world/audio.json. */
  ambience?: string;
  /** Musical theme id for the AudioDirector. */
  theme?: string;
  /** Palette anchors used by the painterly post pass. */
  palette: { sky: string; ground: string; accent: string; shadow: string };
}

export interface DistrictDef {
  id: string;
  name: string;
  blurb: string;
  /** Scene ids belonging to this district. */
  scenes: string[];
  /** Dominant faction id. */
  faction?: string;
  /** Social class flavor. */
  classTier: 'drowned' | 'labour' | 'clerical' | 'merchant' | 'gentry';
}

// Barrel export for the HOLLOWREACH domain model.
export * from './attributes';
export * from './dialogue';
export * from './world';
export * from './investigation';
export * from './character';
export * from './thoughts';
export * from './save';

export interface ItemDef {
  id: string;
  name: string;
  blurb: string;
  /** Inventory category for sorting. */
  kind: 'evidence' | 'tool' | 'substance' | 'document' | 'key' | 'curio';
  /** Optional passive attribute modifiers while carried. */
  carryModifiers?: { attribute: import('./attributes').AttributeId; value: number; reason: string }[];
  /** Substances can be consumed for a temporary high (and a crash). */
  consumable?: boolean;
}

export interface FactionDef {
  id: string;
  name: string;
  creed: string;
  blurb: string;
  color: string;
  /** Factions this one is hostile/allied to (for reputation spillover). */
  rivals?: string[];
  allies?: string[];
}

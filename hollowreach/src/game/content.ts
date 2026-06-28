// Central content registry. All authored JSON is imported here, validated
// loosely at load, and exposed through typed getters. Keeping every lookup
// behind this module means the rest of the game never reaches into raw JSON and
// we get one obvious place to add hot-reload, localization, or mod overrides.

import type {
  AttributeDef,
  CaseDef,
  CharacterDef,
  Dialogue,
  DistrictDef,
  FactionDef,
  ItemDef,
  SceneDef,
  ThoughtDef,
} from './types';

import attributesJson from '@content/attributes.json';
import thoughtsJson from '@content/thoughts.json';
import factionsJson from '@content/world/factions.json';
import districtsJson from '@content/world/districts.json';
import itemsJson from '@content/world/items.json';
import archetypesJson from '@content/world/archetypes.json';

// Scenes
import quayDawn from '@content/scenes/quay_dawn.json';
import mutualHall from '@content/scenes/mutual_hall.json';
import spindleYard from '@content/scenes/spindle_yard.json';
import rowsNight from '@content/scenes/rows_night.json';

// Characters
import charactersJson from '@content/characters/characters.json';

// Dialogues
import dlgTeller from '@content/dialogues/teller.json';
import dlgVoss from '@content/dialogues/voss.json';
import dlgWidow from '@content/dialogues/widow.json';
import dlgBody from '@content/dialogues/the_body.json';
import dlgIntro from '@content/dialogues/intro.json';

// Cases
import caseDrowned from '@content/cases/drowned_clerk.json';

export interface Archetype {
  id: string;
  name: string;
  blurb: string;
  attributes: Record<string, number>;
  startingThought: string;
  startingItems: string[];
  freeAllocation?: boolean;
}

const attributes = (attributesJson as { attributes: AttributeDef[] }).attributes;
const thoughts = (thoughtsJson as { thoughts: ThoughtDef[] }).thoughts;
const factions = (factionsJson as { factions: FactionDef[] }).factions;
const districts = (districtsJson as { districts: DistrictDef[] }).districts;
const items = (itemsJson as { items: ItemDef[] }).items;
const archetypes = (archetypesJson as { archetypes: Archetype[] }).archetypes;
const characters = (charactersJson as { characters: CharacterDef[] }).characters;

const scenes: SceneDef[] = [
  quayDawn as SceneDef,
  mutualHall as SceneDef,
  spindleYard as SceneDef,
  rowsNight as SceneDef,
];

const dialogues: Dialogue[] = [
  dlgIntro as Dialogue,
  dlgTeller as Dialogue,
  dlgVoss as Dialogue,
  dlgWidow as Dialogue,
  dlgBody as Dialogue,
];

const cases: CaseDef[] = [caseDrowned as CaseDef];

function indexBy<T extends { id: string }>(arr: T[]): Map<string, T> {
  const m = new Map<string, T>();
  for (const x of arr) {
    if (m.has(x.id)) console.warn(`[content] duplicate id "${x.id}"`);
    m.set(x.id, x);
  }
  return m;
}

const attrIndex = indexBy(attributes);
const thoughtIndex = indexBy(thoughts);
const factionIndex = indexBy(factions);
const districtIndex = indexBy(districts);
const itemIndex = indexBy(items);
const archetypeIndex = indexBy(archetypes);
const characterIndex = indexBy(characters);
const sceneIndex = indexBy(scenes);
const dialogueIndex = indexBy(dialogues);
const caseIndex = indexBy(cases);

export const Content = {
  attributes,
  thoughts,
  factions,
  districts,
  items,
  archetypes,
  characters,
  scenes,
  dialogues,
  cases,

  attribute: (id: string) => attrIndex.get(id),
  thought: (id: string) => thoughtIndex.get(id),
  faction: (id: string) => factionIndex.get(id),
  district: (id: string) => districtIndex.get(id),
  item: (id: string) => itemIndex.get(id),
  archetype: (id: string) => archetypeIndex.get(id),
  character: (id: string) => characterIndex.get(id),
  scene: (id: string) => sceneIndex.get(id),
  dialogue: (id: string) => dialogueIndex.get(id),
  case: (id: string) => caseIndex.get(id),

  requireScene(id: string): SceneDef {
    const s = sceneIndex.get(id);
    if (!s) throw new Error(`[content] missing scene "${id}"`);
    return s;
  },
  requireDialogue(id: string): Dialogue {
    const d = dialogueIndex.get(id);
    if (!d) throw new Error(`[content] missing dialogue "${id}"`);
    return d;
  },
} as const;

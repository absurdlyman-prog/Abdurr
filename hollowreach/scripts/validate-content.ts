/* HOLLOWREACH content linter.
 *
 * Reads the authored JSON straight off disk (no bundler aliases) and checks
 * referential integrity so a typo in a dialogue `goto` or a missing clue id is
 * caught before runtime. Run: `npm run validate:content`. Exits non-zero on
 * error so it can gate CI.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content');

interface Json {
  [k: string]: unknown;
}

function readJson(path: string): Json {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return p.endsWith('.json') ? [p] : [];
  });
}

const errors: string[] = [];
const warnings: string[] = [];
const err = (m: string) => errors.push(m);
const warn = (m: string) => warnings.push(m);

// --- collect id sets -------------------------------------------------------

const files = walk(ROOT);
const get = (rel: string) => readJson(join(ROOT, rel));

const attrIds = new Set((get('attributes.json').attributes as Json[]).map((a) => a.id as string));
const thoughtIds = new Set((get('thoughts.json').thoughts as Json[]).map((t) => t.id as string));
const itemIds = new Set((get('world/items.json').items as Json[]).map((i) => i.id as string));
const factionIds = new Set((get('world/factions.json').factions as Json[]).map((f) => f.id as string));
const characters = get('characters/characters.json').characters as Json[];
const characterIds = new Set(characters.map((c) => c.id as string));

const sceneFiles = files.filter((f) => f.includes(`${join('content', 'scenes')}`));
const scenes = sceneFiles.map(readJson);
const sceneIds = new Set(scenes.map((s) => s.id as string));

const dialogueFiles = files.filter((f) => f.includes(`${join('content', 'dialogues')}`));
const dialogues = dialogueFiles.map(readJson);
const dialogueIds = new Set(dialogues.map((d) => d.id as string));

const caseFiles = files.filter((f) => f.includes(`${join('content', 'cases')}`));
const cases = caseFiles.map(readJson);

const allClueIds = new Set<string>();
for (const c of cases) for (const clue of (c.clues as Json[]) ?? []) allClueIds.add(clue.id as string);

// --- dialogues: node graph integrity --------------------------------------

for (const d of dialogues) {
  const id = d.id as string;
  const nodes = d.nodes as Record<string, Json>;
  const nodeIds = new Set(Object.keys(nodes));
  if (!nodeIds.has(d.start as string)) err(`dialogue ${id}: start node "${d.start}" missing`);

  for (const [nid, node] of Object.entries(nodes)) {
    const check = (target: unknown, where: string) => {
      if (typeof target === 'string' && target && !nodeIds.has(target)) {
        err(`dialogue ${id}#${nid}: ${where} -> unknown node "${target}"`);
      }
    };
    for (const r of (node.responses as Json[]) ?? []) {
      check(r.goto, `response ${r.id}.goto`);
      const chk = r.check as Json | undefined;
      if (chk) {
        check(chk.onSuccess, `response ${r.id}.check.onSuccess`);
        check(chk.onFailure, `response ${r.id}.check.onFailure`);
        if (!attrIds.has(chk.attribute as string)) err(`dialogue ${id}#${nid}: check attribute "${chk.attribute}" invalid`);
      }
      validateEffects(r.effects as Json[], `${id}#${nid}/${r.id}`);
    }
    for (const pc of (node.passiveChecks as Json[]) ?? []) {
      check(pc.onSuccess, `passive.onSuccess`);
      check(pc.onFailure, `passive.onFailure`);
      if (!attrIds.has(pc.attribute as string)) err(`dialogue ${id}#${nid}: passive attribute "${pc.attribute}" invalid`);
    }
    validateEffects(node.onEnter as Json[], `${id}#${nid}/onEnter`);
  }
}

function validateEffects(effects: Json[] | undefined, where: string): void {
  for (const e of effects ?? []) {
    const key = e.key as string;
    switch (e.op) {
      case 'giveItem':
      case 'takeItem':
        if (!itemIds.has(key)) err(`${where}: ${e.op} unknown item "${key}"`);
        break;
      case 'addThought':
      case 'internalizeThought':
        if (!thoughtIds.has(key)) err(`${where}: ${e.op} unknown thought "${key}"`);
        break;
      case 'rep':
        if (!factionIds.has(key)) err(`${where}: rep unknown faction "${key}"`);
        break;
      case 'learnClue':
        if (!allClueIds.has(key)) warn(`${where}: learnClue unknown clue "${key}"`);
        break;
      case 'remember':
        if (e.who && !characterIds.has(e.who as string)) err(`${where}: remember unknown character "${e.who}"`);
        break;
    }
  }
}

// --- scenes: hotspots ------------------------------------------------------

for (const s of scenes) {
  const sid = s.id as string;
  const w = s.width as number;
  const h = s.height as number;
  for (const layer of (s.layers as Json[]) ?? []) {
    const tiles = layer.tiles as number[];
    if (tiles.length !== w * h) err(`scene ${sid}: layer "${layer.name}" has ${tiles.length} tiles, expected ${w * h}`);
  }
  for (const hs of (s.hotspots as Json[]) ?? []) {
    if (hs.dialogue && !dialogueIds.has(hs.dialogue as string)) err(`scene ${sid}: hotspot ${hs.id} -> unknown dialogue "${hs.dialogue}"`);
    const target = hs.target as Json | undefined;
    if (target && !sceneIds.has(target.scene as string)) err(`scene ${sid}: hotspot ${hs.id} -> unknown scene "${target.scene}"`);
    validateEffects(hs.onExamine as Json[], `scene ${sid}/${hs.id}`);
  }
}

// --- characters ------------------------------------------------------------

for (const c of characters) {
  if (c.dialogue && !dialogueIds.has(c.dialogue as string)) err(`character ${c.id}: unknown dialogue "${c.dialogue}"`);
  if (c.faction && !factionIds.has(c.faction as string)) err(`character ${c.id}: unknown faction "${c.faction}"`);
  for (const slot of (c.schedule as Json[]) ?? []) {
    if (!sceneIds.has(slot.scene as string)) err(`character ${c.id}: schedule scene "${slot.scene}" missing`);
  }
}

// --- cases -----------------------------------------------------------------

for (const c of cases) {
  const cid = c.id as string;
  const clueIds = new Set((c.clues as Json[]).map((x) => x.id as string));
  for (const th of (c.theories as Json[]) ?? []) {
    for (const r of (th.requires as string[]) ?? []) if (!clueIds.has(r)) err(`case ${cid}: theory ${th.id} requires unknown clue "${r}"`);
    for (const w of (th.weakenedBy as string[]) ?? []) if (!clueIds.has(w)) err(`case ${cid}: theory ${th.id} weakenedBy unknown clue "${w}"`);
  }
  for (const ct of (c.contradictions as Json[]) ?? []) {
    for (const b of (ct.between as string[]) ?? []) if (!clueIds.has(b)) err(`case ${cid}: contradiction ${ct.id} references unknown clue "${b}"`);
  }
}

// --- report ----------------------------------------------------------------

for (const w of warnings) console.warn(`⚠  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`✓ Content valid — ${dialogues.length} dialogues, ${scenes.length} scenes, ${cases.length} cases, ${characters.length} characters, ${warnings.length} warning(s).`);

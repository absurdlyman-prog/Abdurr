// HUSHWATER — engine.js: state, dialogue rendering, checks, panels.

import { SKILLS, ARCHETYPES, SPEAKERS, THOUGHTS, SCENES, NODES, START } from './story.js';
import { Painter, startGrain, paintPortrait, Ambience } from './fx.js';

const $ = (id) => document.getElementById(id);
const SAVE_KEY = 'hushwater-save-v1';

const painter = new Painter($('bg'));
startGrain($('grain'));
const amb = new Ambience();

/* ---------------- state ---------------- */

function freshState() {
  return {
    skills: { logic: 2, perception: 2, empathy: 2, deep: 2, volition: 2, authority: 2, hunger: 2 },
    hp: 4, hpMax: 4, spirit: 4, spiritMax: 4,
    insight: 0, checksPassed: 0, checksFailed: 0,
    flags: {}, thoughts: [], locked: {}, used: {}, visited: {},
    node: START, log: [],
  };
}

let S = freshState();

// Methods live outside the saved object so saves stay plain JSON.
const api = {
  applyArchetype(id) {
    const a = ARCHETYPES.find((x) => x.id === id);
    S.skills = { ...a.skills };
    S.hp = S.hpMax = a.hp;
    S.spirit = S.spiritMax = a.spirit;
    S.archetype = a.name;
  },
  damage(kind, n, why) {
    if (kind === 'spirit') S.spirit = Math.max(0, S.spirit - n);
    else S.hp = Math.max(0, S.hp - n);
    pushDamage(kind, n, why);
    painter.shake(0.5);
    refreshBars();
  },
  gainThought(id) {
    if (S.thoughts.includes(id)) return;
    S.thoughts.push(id);
    THOUGHTS[id].apply(S);
    toast(`THOUGHT INTERNALIZED — ${THOUGHTS[id].name}`, '#d9c98a');
    refreshBars();
  },
  addInsight(n) {
    S.insight += n;
    toast(`+${n} INSIGHT`, '#8fe8b7');
    refreshBars();
  },
};
Object.setPrototypeOf(S, api);

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch { /* private mode */ }
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !NODES[data.node]) return false;
    S = Object.setPrototypeOf(data, api);
    return true;
  } catch { return false; }
}

/* ---------------- text formatting ---------------- */

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function fmt(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function speakerOf(sp) {
  if (sp.startsWith('sk:')) {
    const k = sp.slice(3);
    return { name: SKILLS[k].name, color: SKILLS[k].color, skill: true, seed: 100 + Object.keys(SKILLS).indexOf(k) };
  }
  return { ...SPEAKERS[sp], skill: false };
}

/* ---------------- dialogue rendering ---------------- */

const logEl = $('log');
const choicesEl = $('choices');
let typing = null; // active typewriter, so a click can finish it

function addLine(sp, text, instant = false) {
  const who = speakerOf(sp);
  const div = document.createElement('div');
  div.className = 'line' + (who.skill ? ' skill' : '') + (sp === 'nar' ? ' nar' : '');
  let head = '';
  if (who.name) {
    head = `<span class="portrait"><canvas width="52" height="52"></canvas></span>` +
      `<span class="who" style="color:${who.color}">${who.name}</span><span class="dash">—</span>`;
  }
  div.innerHTML = head + `<span class="txt"></span>`;
  logEl.appendChild(div);
  const pc = div.querySelector('canvas');
  if (pc) paintPortrait(pc, who.color, who.seed || 5);
  const txt = div.querySelector('.txt');
  const html = fmt(text);
  if (instant) { txt.innerHTML = html; return Promise.resolve(); }
  // typewriter over plain text, then swap in formatted HTML
  const plain = text.replace(/\*/g, '');
  return new Promise((res) => {
    let i = 0;
    const step = () => {
      i += 2 + ((Math.random() * 2) | 0);
      if (i >= plain.length) {
        txt.innerHTML = html;
        typing = null;
        res();
        return;
      }
      txt.textContent = plain.slice(0, i);
      scrollLog();
      typing = { finish: () => { txt.innerHTML = html; typing = null; res(); } };
      setTimeout(step, 14);
    };
    step();
  });
}

function scrollLog() {
  const panel = $('dialogue');
  panel.scrollTop = panel.scrollHeight;
}

function pushDamage(kind, n, why) {
  const div = document.createElement('div');
  div.className = 'dmg';
  div.style.color = kind === 'spirit' ? '#b79cff' : '#e06a5c';
  div.textContent = `−${n} ${kind.toUpperCase()} · ${why}`;
  logEl.appendChild(div);
  scrollLog();
}

function toast(msg, color) {
  const div = document.createElement('div');
  div.className = 'toast';
  div.style.color = color;
  div.textContent = msg;
  logEl.appendChild(div);
  scrollLog();
}

/* ---------------- node runner ---------------- */

let busy = false;

async function goto(id) {
  const node = NODES[id];
  if (!node) return;
  S.node = id;
  const revisit = !!S.visited[id];
  S.visited[id] = true;

  const pal = SCENES[node.scene];
  painter.setScene(pal);
  document.documentElement.style.setProperty('--accent', pal.accent);

  choicesEl.innerHTML = '';
  busy = true;

  const lines = (revisit && node.lines2) ? node.lines2 : node.lines;
  for (const ln of lines) {
    if (ln.req && !ln.req(S)) continue;
    const text = typeof ln.text === 'function' ? ln.text(S) : ln.text;
    await addLine(ln.sp, text, revisit && !node.lines2 ? true : false);
    amb.ping(220 + Math.random() * 60, 0.04, 0.012);
  }
  busy = false;

  if (S.spirit <= 0 && !node.ending) return goto('deathSpirit');
  if (S.hp <= 0 && !node.ending) return goto('deathBody');

  if (node.ending) { showEnding(node.ending); save(); return; }
  renderChoices(node);
  save();
}

function renderChoices(node) {
  choicesEl.innerHTML = '';
  node.choices.forEach((ch, idx) => {
    const useId = S.node + ':' + idx;
    if (ch.once && S.used[useId]) return;
    if (ch.if && !ch.if(S)) return;
    if (ch.check && ch.check.red && S.locked[ch.check.id]) return;

    const btn = document.createElement('button');
    btn.className = 'choice';
    let tag = '';
    if (ch.check) {
      const c = ch.check;
      const bonus = c.bonus ? c.bonus(S) : 0;
      const odds = oddsFor(S.skills[c.skill] + bonus, c.dc);
      tag = `<span class="ctag" style="color:${SKILLS[c.skill].color}">` +
        `${c.red ? '◆' : '◇'} ${SKILLS[c.skill].name} ${odds}%</span>`;
      btn.classList.add(c.red ? 'red' : 'white');
    }
    btn.innerHTML = `${tag}<span class="clabel">${fmt(ch.label)}</span>` +
      (ch.sub ? `<span class="csub">${fmt(ch.sub)}</span>` : '');
    btn.onclick = () => {
      if (busy) { if (typing) typing.finish(); return; }
      amb.ping(500, 0.05, 0.02);
      if (ch.once) S.used[useId] = true;
      if (ch.do) ch.do(S);
      if (S.spirit <= 0) return goto('deathSpirit');
      if (S.hp <= 0) return goto('deathBody');
      refreshBars();
      if (ch.check) runCheck(ch.check);
      else if (ch.goto) goto(ch.goto);
    };
    choicesEl.appendChild(btn);
  });
  scrollLog();
}

/* ---------------- dice checks ---------------- */

function oddsFor(skill, dc) {
  // P(2d6 + skill >= dc), with 2 auto-fail and 12 auto-succeed
  let ways = 0, total = 36;
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
    const r = a + b;
    if (r === 2) continue;
    if (r === 12 || r + skill >= dc) ways++;
  }
  return Math.round((ways / total) * 100);
}

function runCheck(c) {
  busy = true;
  choicesEl.innerHTML = '';
  const bonus = c.bonus ? c.bonus(S) : 0;
  const skill = S.skills[c.skill] + bonus;
  const d1 = 1 + ((Math.random() * 6) | 0);
  const d2 = 1 + ((Math.random() * 6) | 0);
  const roll = d1 + d2;
  const crit = roll === 12, fumble = roll === 2;
  const pass = !fumble && (crit || roll + skill >= c.dc);

  const ov = $('dice');
  ov.className = 'show';
  $('diceSkill').textContent = SKILLS[c.skill].name + (c.red ? '  ◆' : '  ◇');
  $('diceSkill').style.color = SKILLS[c.skill].color;
  $('diceMath').textContent = '';
  $('diceVerdict').textContent = '';
  const e1 = $('die1'), e2 = $('die2');
  e1.textContent = '?'; e2.textContent = '?';
  e1.className = 'die roll'; e2.className = 'die roll';
  amb.dice();

  let ticks = 0;
  const spin = setInterval(() => {
    e1.textContent = 1 + ((Math.random() * 6) | 0);
    e2.textContent = 1 + ((Math.random() * 6) | 0);
    if (++ticks > 9) {
      clearInterval(spin);
      e1.textContent = d1; e2.textContent = d2;
      e1.className = 'die'; e2.className = 'die';
      $('diceMath').textContent =
        `${roll} + ${skill} vs ${c.dc}` + (bonus ? `  (incl. +${bonus} from allies)` : '');
      const v = $('diceVerdict');
      if (pass) {
        v.textContent = crit ? 'CRITICAL SUCCESS' : 'SUCCESS';
        v.style.color = '#d9c98a';
        painter.flash([255, 235, 180], 0.7);
        amb.bell();
        S.checksPassed++;
        S.insight += 1;
      } else {
        v.textContent = fumble ? 'SNAKE EYES' : 'FAILURE';
        v.style.color = '#e06a5c';
        painter.flash([180, 40, 30], 0.5);
        painter.shake(1);
        S.checksFailed++;
        if (c.red) S.locked[c.id] = true;
      }
      refreshBars();
      setTimeout(() => {
        ov.className = '';
        busy = false;
        goto(pass ? c.pass : c.fail);
      }, 1250);
    }
  }, 90);
}

/* ---------------- HUD / panels ---------------- */

function refreshBars() {
  $('hpBar').style.width = (S.hp / S.hpMax) * 100 + '%';
  $('spBar').style.width = (S.spirit / S.spiritMax) * 100 + '%';
  $('hpNum').textContent = `${S.hp}/${S.hpMax}`;
  $('spNum').textContent = `${S.spirit}/${S.spiritMax}`;
  $('insightNum').textContent = S.insight;
}

function openPanel() {
  const p = $('panel');
  p.className = 'show';
  const box = $('panelBody');
  let h = `<h3>PSYCHE</h3><div class="skills">`;
  for (const k of Object.keys(SKILLS)) {
    const sk = SKILLS[k];
    h += `<div class="skrow"><span class="skname" style="color:${sk.color}">${sk.name}</span>` +
      `<span class="skval">${S.skills[k]}</span>` +
      `<button class="buy" data-skill="${k}" ${S.insight < 4 ? 'disabled' : ''}>+1 (4 insight)</button>` +
      `<div class="skdesc">${fmt(sk.desc)}</div></div>`;
  }
  h += `</div><h3>VITALS</h3><div class="vitals">` +
    `<button class="buy" id="healHp" ${S.insight < 2 || S.hp >= S.hpMax ? 'disabled' : ''}>Bind wounds · +2 HEALTH (2 insight)</button>` +
    `<button class="buy" id="healSp" ${S.insight < 2 || S.spirit >= S.spiritMax ? 'disabled' : ''}>Collect yourself · +2 SPIRIT (2 insight)</button>` +
    `</div><h3>THOUGHT CABINET</h3>`;
  if (S.thoughts.length === 0) h += `<p class="dim">Nothing internalized yet. Thoughts are earned, not found.</p>`;
  for (const id of S.thoughts) {
    const t = THOUGHTS[id];
    h += `<div class="thought"><div class="tname">${t.name}</div>` +
      `<div class="tquote">${fmt(t.quote)}</div><div class="teff">${t.effect}</div></div>`;
  }
  box.innerHTML = h;
  box.querySelectorAll('.buy[data-skill]').forEach((b) => {
    b.onclick = () => {
      if (S.insight < 4) return;
      S.insight -= 4;
      S.skills[b.dataset.skill] += 1;
      refreshBars(); save(); openPanel();
    };
  });
  const hh = $('healHp'), hs = $('healSp');
  if (hh) hh.onclick = () => { if (S.insight >= 2) { S.insight -= 2; S.hp = Math.min(S.hpMax, S.hp + 2); refreshBars(); save(); openPanel(); } };
  if (hs) hs.onclick = () => { if (S.insight >= 2) { S.insight -= 2; S.spirit = Math.min(S.spiritMax, S.spirit + 2); refreshBars(); save(); openPanel(); } };
}

/* ---------------- endings ---------------- */

function showEnding(title) {
  const fin = $('fin');
  $('finTitle').textContent = title;
  $('finStats').innerHTML =
    `<span>${S.archetype || 'A STRANGER'}</span>` +
    `<span>Checks passed ${S.checksPassed} · failed ${S.checksFailed}</span>` +
    `<span>Thoughts internalized ${S.thoughts.length} of ${Object.keys(THOUGHTS).length}</span>`;
  setTimeout(() => { fin.className = 'show'; }, 1400);
  amb.bell();
  try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
}

/* ---------------- title / boot ---------------- */

function newGame() {
  S = Object.setPrototypeOf(freshState(), api);
  logEl.innerHTML = '';
  $('title').className = 'hide';
  $('fin').className = '';
  refreshBars();
  goto(START);
}

function boot() {
  painter.setScene(SCENES.void);
  refreshBars();
  $('btnNew').onclick = () => { amb.ping(660, 0.08, 0.03); newGame(); };
  const has = load();
  const bc = $('btnContinue');
  if (has) {
    bc.style.display = '';
    bc.onclick = () => {
      amb.ping(660, 0.08, 0.03);
      logEl.innerHTML = '';
      $('title').className = 'hide';
      refreshBars();
      goto(S.node);
    };
  }
  $('btnSound').onclick = () => {
    const on = amb.toggle();
    $('btnSound').textContent = on ? '♪ SOUND ON' : '♪ SOUND OFF';
    if (on) amb.bell();
  };
  $('btnPsyche').onclick = openPanel;
  $('panelClose').onclick = () => { $('panel').className = ''; };
  $('btnAgain').onclick = () => { $('fin').className = ''; $('title').className = ''; boot2(); };
  // clicking dialogue fast-forwards the typewriter
  $('dialogue').addEventListener('click', () => { if (typing) typing.finish(); });
}

function boot2() {
  const bc = $('btnContinue');
  bc.style.display = 'none';
}

boot();

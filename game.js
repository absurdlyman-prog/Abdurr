/* ============================================================================
 *  SurgeryQuest — game engine
 *  3D ward (Three.js) + encounter flow + rubric scoring + gamification.
 *  All clinical content is synthetic / educational (see data.js).
 * ========================================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------- *
   *  Constants
   * ---------------------------------------------------------------------- */
  const SAVE_KEY = "surgeryquest_save_v1";

  const WEIGHTS = {
    history: 0.15, exam: 0.15, workup: 0.15,
    diagnosis: 0.20, management: 0.20, stewardship: 0.15,
  };

  const LEVEL_TITLES = [
    "Medical Student", "Intern (PGY-1)", "Junior Resident (PGY-2)",
    "Senior Resident (PGY-3)", "Chief Resident", "Surgical Fellow",
    "Attending Surgeon", "Chief of Surgery", "Legendary Attending",
  ];
  // XP needed to advance FROM a given level.
  function xpForLevel(level) { return 200 + (level - 1) * 130; }

  const BADGES = [
    { id: "sharp_eye",   name: "Sharp Eye",          icon: "🎯", desc: "Nail a diagnosis with a perfect read." },
    { id: "lifesaver",   name: "Lifesaver",          icon: "🚑", desc: "Choose the optimal management plan." },
    { id: "steward",     name: "Steward",            icon: "🌿", desc: "Finish a case with stewardship ≥ 90." },
    { id: "perfect",     name: "Perfect Round",      icon: "🌟", desc: "Earn all 3 stars on a case." },
    { id: "historian",   name: "Thorough Historian", icon: "📋", desc: "Ask every high-yield history question." },
    { id: "eagle_eye",   name: "Eagle-Eyed",         icon: "👁️", desc: "Complete every key exam maneuver." },
    { id: "on_a_roll",   name: "On a Roll",          icon: "🔥", desc: "Reach a 3-case diagnosis streak." },
    { id: "chief",       name: "Chief Resident",     icon: "🏆", desc: "Pass all 6 cases with ≥ 2 stars." },
  ];

  const TAB_DEFS = [
    { id: "history",    label: "History",    icon: "🗣️", cat: "history" },
    { id: "exam",       label: "Exam",       icon: "🩺", cat: "exam" },
    { id: "labs",       label: "Labs",       icon: "🧪", cat: "labs" },
    { id: "imaging",    label: "Imaging",    icon: "🩻", cat: "imaging" },
    { id: "diagnosis",  label: "Diagnosis",  icon: "🧠", cat: null },
    { id: "management", label: "Management", icon: "💊", cat: null },
  ];

  /* ---------------------------------------------------------------------- *
   *  Persistence
   * ---------------------------------------------------------------------- */
  function defaultSave() {
    return { xp: 0, badges: [], streak: 0, bestStreak: 0, cases: {}, welcomed: false };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultSave();
      return Object.assign(defaultSave(), JSON.parse(raw));
    } catch (e) { return defaultSave(); }
  }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ }
  }
  let save = loadSave();

  function levelInfo() {
    let level = 1, xp = save.xp;
    while (xp >= xpForLevel(level)) { xp -= xpForLevel(level); level++; }
    return {
      level,
      title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
      into: xp,
      need: xpForLevel(level),
    };
  }

  /* ---------------------------------------------------------------------- *
   *  Tiny DOM helpers
   * ---------------------------------------------------------------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  /* ---------------------------------------------------------------------- *
   *  Live AI (optional) — talks to the Netlify serverless proxy.
   *  The game runs fully without it (scripted); it upgrades automatically
   *  when an ANTHROPIC_API_KEY is configured on the deployed site.
   * ---------------------------------------------------------------------- */
  const AI = { available: false, checked: false, endpoint: "/.netlify/functions/ai" };
  async function aiCall(payload) {
    const r = await fetch(AI.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error("net " + r.status);
    return r.json();
  }
  async function aiDetect() {
    try {
      const d = await aiCall({ mode: "status" });
      AI.available = !!(d && d.available);
    } catch (e) { AI.available = false; }
    AI.checked = true;
    updateAiBadge();
  }
  function updateAiBadge() {
    const b = $("#ai-badge"), t = $("#ai-badge-text");
    if (!b) return;
    if (AI.available) {
      b.className = "ai-badge live";
      b.title = "Live AI: talking patients + AI attending";
      b.innerHTML = '<span class="pulse">●</span> <span id="ai-badge-text">Live AI</span>';
    } else {
      b.className = "ai-badge scripted";
      b.title = "Scripted mode — add an Anthropic key in Netlify to enable live AI";
      t.textContent = "Scripted";
    }
  }

  /* ---- Text-to-speech (spoken patient & attending) ---- */
  const TTS = { on: true, supported: false, voice: null };
  function initTTS() {
    TTS.on = save.tts !== false;
    TTS.supported = "speechSynthesis" in window;
    if (!TTS.supported) return;
    const pick = () => {
      const vs = window.speechSynthesis.getVoices() || [];
      TTS.voice =
        vs.find((v) => /en[-_]US/i.test(v.lang) && /(female|samantha|zira|aria|jenny|karen|moira)/i.test(v.name)) ||
        vs.find((v) => /^en/i.test(v.lang)) || vs[0] || null;
    };
    pick();
    try { window.speechSynthesis.onvoiceschanged = pick; } catch (e) { /* ignore */ }
    updateMuteBtn();
  }
  function speak(text) {
    if (!TTS.on || !TTS.supported || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).slice(0, 600));
      if (TTS.voice) u.voice = TTS.voice;
      u.rate = 1.0; u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }
  function stopSpeak() { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  function toggleVoice() {
    TTS.on = !TTS.on; save.tts = TTS.on; persist();
    if (!TTS.on) stopSpeak();
    updateMuteBtn();
  }
  function updateMuteBtn() {
    const btn = $("#voice-btn");
    if (!btn) return;
    btn.classList.toggle("muted", !TTS.on);
    btn.innerHTML = (TTS.on ? "🔊" : "🔇") + " <span>Voice</span>";
  }

  /* ---------------------------------------------------------------------- *
   *  Three.js scene
   * ---------------------------------------------------------------------- */
  const T = {}; // scene refs
  const BED_POSITIONS = [
    { x: -4.4, z: -3.4, face: 1 }, { x: 0, z: -3.4, face: 1 }, { x: 4.4, z: -3.4, face: 1 },
    { x: -4.4, z: 3.4, face: -1 }, { x: 0, z: 3.4, face: -1 }, { x: 4.4, z: 3.4, face: -1 },
  ];
  const beds = [];
  let hovered = null;

  // ---- animated ECG texture (shared across all monitors) ----
  const ecg = { canvas: null, ctx: null, tex: null, samples: [], t: 0, last: 0 };
  function buildECG() {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 96;
    ecg.canvas = c; ecg.ctx = c.getContext("2d");
    // one synthetic beat (P-QRS-T), tiled while scrolling
    const N = 130, beat = new Array(N).fill(0);
    const spike = (i, c0, w, a) => { for (let k = -w; k <= w; k++) { const idx = c0 + k; if (idx >= 0 && idx < N) beat[idx] += a * (1 - Math.abs(k) / (w + 1)); } };
    spike(22, 22, 6, 0.18);            // P
    beat[55] = -0.12; beat[57] = 0.95; beat[59] = -0.28; // QRS
    spike(85, 85, 12, 0.30);           // T
    ecg.samples = beat;
    ecg.tex = new THREE.CanvasTexture(c);
    ecg.tex.minFilter = THREE.LinearFilter;
  }
  function drawECG() {
    const ctx = ecg.ctx, w = 256, h = 96;
    ctx.fillStyle = "#04140f"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(52,211,153,0.10)"; ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = "#34d399"; ctx.lineWidth = 2; ctx.shadowColor = "#34d399"; ctx.shadowBlur = 6;
    ctx.beginPath();
    const N = ecg.samples.length, mid = h * 0.6, amp = h * 0.5;
    for (let x = 0; x < w; x++) {
      const s = ecg.samples[(x + ecg.t) % N];
      const y = mid - s * amp;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.shadowBlur = 0;
    ecg.tex.needsUpdate = true;
  }

  function makeBed(idx, pos) {
    const g = new THREE.Group();
    g.position.set(pos.x, 0, pos.z);
    g.rotation.y = pos.face === 1 ? 0 : Math.PI;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0xdfe7ee, roughness: 0.85, metalness: 0.05 });
    const mattMat  = new THREE.MeshStandardMaterial({ color: 0xf3f6f9, roughness: 0.95 });
    const blanket  = new THREE.MeshStandardMaterial({ color: 0x5eead4, roughness: 0.85, emissive: 0x000000 });
    const skin     = new THREE.MeshStandardMaterial({ color: 0xf1c9a5, roughness: 0.8 });
    const pillowM  = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.28, 0.98), frameMat);
    frame.position.y = 0.5; frame.castShadow = true; g.add(frame);
    // legs
    [[-0.95, -0.42], [0.95, -0.42], [-0.95, 0.42], [0.95, 0.42]].forEach((p) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), frameMat);
      leg.position.set(p[0], 0.2, p[1]); g.add(leg);
    });
    const matt = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.16, 0.9), mattMat);
    matt.position.y = 0.72; matt.castShadow = true; matt.receiveShadow = true; g.add(matt);
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.13, 0.74), pillowM);
    pillow.position.set(-0.72, 0.85, 0); pillow.castShadow = true; g.add(pillow);
    // patient: head + blanket lump
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 14), skin);
    head.position.set(-0.72, 0.98, 0); head.castShadow = true; g.add(head);
    const lump = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.26, 0.78), blanket);
    lump.position.set(0.18, 0.86, 0); lump.castShadow = true; g.add(lump);
    const knees = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), blanket);
    knees.position.set(0.55, 0.95, 0); knees.scale.set(1.3, 0.8, 1); knees.castShadow = true; g.add(knees);

    // bedside monitor
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.2, 10),
      new THREE.MeshStandardMaterial({ color: 0xb8c2cc, roughness: 0.6 }));
    stand.position.set(-1.15, 0.6, 0.36); g.add(stand);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.46, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 }));
    body.position.set(-1.15, 1.32, 0.36); g.add(body);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.34),
      new THREE.MeshBasicMaterial({ map: ecg.tex }));
    screen.position.set(-1.15, 1.34, 0.405); g.add(screen);

    // transparent hit box for picking
    const hit = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.6, 1.3),
      new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(0, 0.8, 0); hit.userData.caseIndex = idx; g.add(hit);

    // floating label
    const label = makeLabel();
    label.sprite.position.set(0, 2.0, 0);
    g.add(label.sprite);

    T.scene.add(g);
    const bed = { group: g, hit, label, highlightMats: [blanket, frame], idx, baseY: g.position.y };
    beds.push(bed);
    return bed;
  }

  function makeLabel() {
    const c = document.createElement("canvas");
    c.width = 320; c.height = 150;
    const ctx = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.9, 0.89, 1);
    function redraw(idx) {
      const caseObj = CASES[idx];
      const rec = save.cases[caseObj.id];
      const done = rec && rec.completed;
      ctx.clearRect(0, 0, c.width, c.height);
      // pill background
      ctx.fillStyle = done ? "rgba(13,148,136,0.96)" : "rgba(15,23,42,0.92)";
      roundRect(ctx, 8, 8, 304, 100, 22); ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 27px Inter, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Bed " + (idx + 1), 160, 44);
      ctx.font = "500 19px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText(trim(ctx, caseObj.bedLabel, 280), 160, 74);
      // stars / status row
      const stars = done ? rec.bestStars : 0;
      ctx.font = "700 22px Inter, sans-serif"; ctx.textAlign = "center";
      if (done) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillText("★★★".slice(0, stars) + "☆☆☆".slice(0, 3 - stars), 160, 132);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "600 18px Inter, sans-serif";
        ctx.fillText("Tap to assess", 160, 130);
      }
      tex.needsUpdate = true;
    }
    return { sprite, redraw };
  }
  function trim(ctx, txt, max) {
    if (ctx.measureText(txt).width <= max) return txt;
    while (txt.length > 1 && ctx.measureText(txt + "…").width > max) txt = txt.slice(0, -1);
    return txt + "…";
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function refreshBedLabels() { beds.forEach((b) => b.label.redraw(b.idx)); }

  function initScene() {
    const canvas = $("#scene");
    T.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    T.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    T.renderer.setSize(window.innerWidth, window.innerHeight);
    if ("outputEncoding" in T.renderer) T.renderer.outputEncoding = THREE.sRGBEncoding;
    T.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    T.renderer.toneMappingExposure = 1.08;
    T.renderer.shadowMap.enabled = true;
    T.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    T.scene = new THREE.Scene();
    T.scene.background = new THREE.Color(0xeaf0f4);
    T.scene.fog = new THREE.Fog(0xeaf0f4, 18, 34);

    T.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);

    // lights — soft & clinical
    T.scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd8e0, 0.85));
    T.scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const dir = new THREE.DirectionalLight(0xfff4e6, 0.6);
    dir.position.set(7, 13, 5);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.near = 1; dir.shadow.camera.far = 44;
    dir.shadow.camera.left = -13; dir.shadow.camera.right = 13;
    dir.shadow.camera.top = 13; dir.shadow.camera.bottom = -13;
    dir.shadow.bias = -0.0005;
    T.scene.add(dir);
    [[-4, 4], [4, -4]].forEach((p) => {
      const pl = new THREE.PointLight(0xffffff, 0.25, 30); pl.position.set(p[0], 5, p[1]); T.scene.add(pl);
    });

    // room
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 16),
      new THREE.MeshStandardMaterial({ color: 0xdde5ec, roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; T.scene.add(floor);
    // subtle aisle
    const aisle = new THREE.Mesh(new THREE.PlaneGeometry(3, 16),
      new THREE.MeshStandardMaterial({ color: 0xcdd8e2, roughness: 0.95 }));
    aisle.rotation.x = -Math.PI / 2; aisle.position.y = 0.002; T.scene.add(aisle);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf4f7fa, roughness: 1 });
    const mkWall = (w, h, x, y, z, ry) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
      m.position.set(x, y, z); if (ry) m.rotation.y = ry; T.scene.add(m);
    };
    mkWall(20, 4.5, 0, 2.25, -8, 0);
    mkWall(20, 4.5, 0, 2.25, 8, Math.PI);
    mkWall(16, 4.5, -10, 2.25, 0, Math.PI / 2);
    mkWall(16, 4.5, 10, 2.25, 0, -Math.PI / 2);

    // ceiling light panels (visual)
    [-4.4, 0, 4.4].forEach((x) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 7),
        new THREE.MeshBasicMaterial({ color: 0xffffff }));
      panel.rotation.x = Math.PI / 2; panel.position.set(x, 4.49, 0); T.scene.add(panel);
    });

    // daylight windows on the two end walls
    const winMat = new THREE.MeshBasicMaterial({ color: 0xd4e8ff });
    const frameMat2 = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    [-5, 0, 5].forEach((x) => {
      [[-7.92, 0], [7.92, Math.PI]].forEach((p) => {
        const sill = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.1, 0.08), frameMat2);
        sill.position.set(x, 2.5, p[0] + (p[1] ? 0.05 : -0.05)); sill.rotation.y = p[1]; T.scene.add(sill);
        const w = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.8), winMat);
        w.position.set(x, 2.5, p[0]); w.rotation.y = p[1]; T.scene.add(w);
      });
    });

    // low-poly plants in the corners
    const plant = (x, z) => {
      const grp = new THREE.Group(); grp.position.set(x, 0, z);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.42, 12),
        new THREE.MeshStandardMaterial({ color: 0xb08968, roughness: 0.9 }));
      pot.position.y = 0.21; pot.castShadow = true; grp.add(pot);
      const fo = new THREE.MeshStandardMaterial({ color: 0x6aa84f, roughness: 0.9 });
      [[0, 0.78, 0, 0.44], [0.16, 1.02, 0.1, 0.3], [-0.13, 0.98, -0.09, 0.28]].forEach((p) => {
        const s = new THREE.Mesh(new THREE.SphereGeometry(p[3], 10, 8), fo);
        s.position.set(p[0], p[1], p[2]); s.castShadow = true; grp.add(s);
      });
      T.scene.add(grp);
    };
    plant(-8.7, -6.7); plant(8.7, 6.7); plant(8.7, -6.7); plant(-8.7, 6.7);

    buildECG();
    BED_POSITIONS.forEach((p, i) => makeBed(i, p));
    refreshBedLabels();

    T.ray = new THREE.Raycaster();
    setupControls();
    window.addEventListener("resize", onResize);
    animate();
  }

  function onResize() {
    T.camera.aspect = window.innerWidth / window.innerHeight;
    T.camera.updateProjectionMatrix();
    T.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /* ---- custom orbit / zoom controls ---- */
  const cam = {
    target: new THREE.Vector3(0, 1, 0),
    // current pose starts wide & high; desired (d*) is the resting view —
    // the damping in animate() eases this into a gentle intro fly-in.
    theta: -1.25, phi: 0.58, radius: 30,
    dTheta: -0.45, dPhi: 1.02, dRadius: 15,
    dragging: false, lastX: 0, lastY: 0, downX: 0, downY: 0, moved: 0,
    pinch: 0,
  };
  function setupControls() {
    const c = $("#scene");
    const ndc = new THREE.Vector2();

    function onDown(x, y) {
      cam.dragging = true; cam.lastX = x; cam.lastY = y; cam.downX = x; cam.downY = y; cam.moved = 0;
    }
    function onMove(x, y) {
      if (cam.dragging) {
        const dx = x - cam.lastX, dy = y - cam.lastY;
        cam.moved += Math.abs(dx) + Math.abs(dy);
        cam.dTheta -= dx * 0.005;
        cam.dPhi -= dy * 0.005;
        cam.dPhi = Math.max(0.28, Math.min(1.45, cam.dPhi));
        cam.lastX = x; cam.lastY = y;
        hideHint();
      } else {
        ndc.x = (x / window.innerWidth) * 2 - 1;
        ndc.y = -(y / window.innerHeight) * 2 + 1;
        pick(ndc);
      }
    }
    function onUp(x, y) {
      if (cam.dragging && cam.moved < 7) {
        // treat as a click/tap: raycast at the release point (covers touch taps)
        ndc.x = (x / window.innerWidth) * 2 - 1;
        ndc.y = -(y / window.innerHeight) * 2 + 1;
        pick(ndc);
        if (hovered != null) openEncounter(hovered);
      }
      cam.dragging = false;
    }

    c.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", (e) => onUp(e.clientX, e.clientY));
    c.addEventListener("wheel", (e) => {
      e.preventDefault();
      cam.dRadius *= 1 + (e.deltaY > 0 ? 0.1 : -0.1);
      cam.dRadius = Math.max(7, Math.min(24, cam.dRadius));
      hideHint();
    }, { passive: false });

    // touch
    c.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) onDown(e.touches[0].clientX, e.touches[0].clientY);
      else if (e.touches.length === 2) cam.pinch = touchDist(e);
    }, { passive: true });
    c.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
      else if (e.touches.length === 2) {
        const d = touchDist(e);
        if (cam.pinch) { cam.dRadius *= cam.pinch / d; cam.dRadius = Math.max(7, Math.min(24, cam.dRadius)); }
        cam.pinch = d; hideHint();
      }
      e.preventDefault();
    }, { passive: false });
    c.addEventListener("touchend", (e) => {
      if (cam.dragging) onUp(cam.lastX, cam.lastY);
      cam.pinch = 0;
    });
  }
  function touchDist(e) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function pick(ndc) {
    T.ray.setFromCamera(ndc, T.camera);
    const hits = T.ray.intersectObjects(beds.map((b) => b.hit), false);
    const idx = hits.length ? hits[0].object.userData.caseIndex : null;
    if (idx !== hovered) {
      hovered = idx;
      document.body.style.cursor = idx != null ? "pointer" : "default";
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    // damping
    cam.theta += (cam.dTheta - cam.theta) * 0.12;
    cam.phi += (cam.dPhi - cam.phi) * 0.12;
    cam.radius += (cam.dRadius - cam.radius) * 0.12;
    const sp = cam.phi, st = cam.theta, r = cam.radius;
    T.camera.position.set(
      cam.target.x + r * Math.sin(sp) * Math.sin(st),
      cam.target.y + r * Math.cos(sp),
      cam.target.z + r * Math.sin(sp) * Math.cos(st)
    );
    T.camera.lookAt(cam.target);

    // hover highlight + gentle label bob
    const now = performance.now();
    beds.forEach((b) => {
      const on = b.idx === hovered;
      const target = on ? 0x14342f : 0x000000;
      b.highlightMats.forEach((m) => { if (m.emissive) m.emissive.setHex(target); });
      const want = on ? 2.18 : 2.0;
      b.label.sprite.position.y += (want - b.label.sprite.position.y) * 0.15;
      const s = on ? 2.05 : 1.9;
      b.label.sprite.scale.x += (s - b.label.sprite.scale.x) * 0.15;
      b.label.sprite.scale.y += (s * 0.468 - b.label.sprite.scale.y) * 0.15;
    });

    // ECG
    if (now - ecg.last > 70) { ecg.t = (ecg.t + 3) % ecg.samples.length; drawECG(); ecg.last = now; }

    T.renderer.render(T.scene, T.camera);
  }
  function hideHint() { const h = $("#scene-hint"); if (h) h.style.opacity = "0"; }

  /* ---------------------------------------------------------------------- *
   *  HUD
   * ---------------------------------------------------------------------- */
  function renderHUD() {
    const li = levelInfo();
    $("#lvl-badge").textContent = li.level;
    $("#lvl-title").textContent = li.title;
    $("#lvl-xp").textContent = li.into + " / " + li.need + " XP";
    $("#xpbar-fill").style.width = Math.min(100, (li.into / li.need) * 100) + "%";

    const streakChip = $("#streak");
    streakChip.classList.toggle("cold", save.streak === 0);
    $("#streak-val").textContent = save.streak;

    $("#badge-count").textContent = save.badges.length + "/" + BADGES.length;
  }

  /* ---------------------------------------------------------------------- *
   *  Welcome screen
   * ---------------------------------------------------------------------- */
  function renderWelcome() {
    const C = SQ_CONFIG;
    $("#w-name").textContent = "Happy Birthday, " + C.RECIPIENT_NAME;
    $("#w-msg").textContent = C.BIRTHDAY_MESSAGE;
    $("#w-signed").textContent = C.SIGNED || "";
    $("#w-signed").style.display = C.SIGNED ? "block" : "none";
  }

  /* ---------------------------------------------------------------------- *
   *  Encounter
   * ---------------------------------------------------------------------- */
  let enc = null; // { caseObj, ordered:Set, dxId, mgId, activeTab, visited:Set }

  function openEncounter(idx) {
    const caseObj = CASES[idx];
    enc = { caseObj, ordered: new Set(), dxId: null, mgId: null, activeTab: "history", visited: new Set(), chat: [], busy: false };
    stopSpeak();
    buildEncounterUI();
    show("#encounter");
  }

  function buildEncounterUI() {
    const c = enc.caseObj;
    const root = $("#encounter .card");
    root.innerHTML = "";

    // header
    const head = el("div", "enc-head");
    const row = el("div", "row");
    row.appendChild(el("div", "enc-avatar", "🛌"));
    const id = el("div", "enc-id");
    id.appendChild(el("h3", null, esc(c.patient.name) + " · " + c.patient.age + esc(c.patient.sex) ));
    id.appendChild(el("div", "cc", esc(c.chiefComplaint)));
    id.appendChild(el("div", "triage", "Triage: " + esc(c.triage)));
    row.appendChild(id);
    const close = el("button", "enc-close", "×");
    close.onclick = () => { stopSpeak(); hide("#encounter"); };
    row.appendChild(close);
    head.appendChild(row);

    // vitals
    const v = c.vitals;
    const vrow = el("div", "vitals");
    const vit = (k, val, flag) => {
      const n = el("div", "vital" + (flag ? " flag" : ""));
      n.appendChild(el("div", "k", k));
      n.appendChild(el("div", "v", esc(val)));
      return n;
    };
    const tNum = parseFloat(v.temp), hrNum = parseInt(v.hr, 10), spo2Num = parseInt(v.spo2, 10);
    vrow.appendChild(vit("Temp", v.temp, tNum >= 38));
    vrow.appendChild(vit("HR", v.hr, hrNum >= 100));
    vrow.appendChild(vit("BP", v.bp, false));
    vrow.appendChild(vit("RR", v.rr, parseInt(v.rr, 10) >= 22));
    vrow.appendChild(vit("SpO₂", v.spo2, spo2Num < 95));
    if (v.pain) vrow.appendChild(vit("Pain", v.pain, false));
    head.appendChild(vrow);
    root.appendChild(head);

    // tabs
    const tabs = el("div", "tabs");
    TAB_DEFS.forEach((t) => {
      const b = el("button", "tab" + (t.id === enc.activeTab ? " active" : ""));
      b.dataset.tab = t.id;
      b.innerHTML = '<span class="dot"></span>' + t.icon + " " + t.label;
      b.onclick = () => switchTab(t.id);
      tabs.appendChild(b);
    });
    root.appendChild(tabs);

    // body
    const body = el("div", "enc-body");
    body.id = "enc-body";
    root.appendChild(body);

    // footer
    const foot = el("div", "enc-foot");
    foot.innerHTML =
      '<div class="tally" id="enc-tally"></div><div class="grow"></div>' +
      '<button class="btn-submit" id="enc-submit">Submit to Attending →</button>';
    root.appendChild(foot);
    $("#enc-submit").onclick = submitEncounter;

    renderTab();
    updateFooter();
  }

  function switchTab(id) { enc.activeTab = id; enc.visited.add(id);
    document.querySelectorAll("#encounter .tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === id));
    renderTab();
  }

  function renderTab() {
    const body = $("#enc-body");
    body.innerHTML = "";
    const tab = TAB_DEFS.find((t) => t.id === enc.activeTab);
    if (tab.id === "history") renderInterview(body);
    else if (tab.cat) renderOrderPanel(body, tab);
    else if (tab.id === "diagnosis") renderChoicePanel(body, "diagnosis");
    else renderChoicePanel(body, "management");
    syncTabDoneFlags();
  }

  const PANEL_INTRO = {
    history: "Ask focused, high-yield questions. Thoroughness is rewarded; this section is free.",
    exam: "Perform the relevant exam maneuvers. Targeted exams earn the most credit.",
    labs: "Order only labs that will change your management — every test is charged against stewardship.",
    imaging: "Pick the right study. Expensive or unindicated imaging costs stewardship points.",
  };

  function renderOrderPanel(body, tab) {
    body.appendChild(el("p", "panel-intro", PANEL_INTRO[tab.cat]));
    const grid = el("div", "order-grid panel active");
    ORDER_MENU[tab.cat].forEach((item) => {
      const ordered = enc.ordered.has(item.id);
      const row = el("div", "order-item" + (ordered ? " ordered" : ""));
      const h = el("div", "oi-head");
      h.appendChild(el("div", "oi-check", "✓"));
      h.appendChild(el("div", "oi-label", esc(item.label)));
      if (item.cost != null) h.appendChild(el("div", "oi-cost", "$".repeat(Math.min(item.cost, 4))));
      row.appendChild(h);
      const result = enc.caseObj.findings[item.id] || DEFAULT_RESULT[tab.cat];
      row.appendChild(el("div", "oi-result", esc(result)));
      row.onclick = () => {
        if (enc.ordered.has(item.id)) enc.ordered.delete(item.id);
        else { enc.ordered.add(item.id); enc.visited.add(tab.id); }
        row.classList.toggle("ordered");
        updateFooter(); syncTabDoneFlags();
      };
      grid.appendChild(row);
    });
    body.appendChild(grid);
  }

  /* ---- Conversational history-taking (Medkit-style) ---- */
  const HISTORY_KEYWORDS = {
    h_onset: ["start", "begin", "began", "when", "onset", "how long", "duration", "timing", "come on"],
    h_location: ["where", "locat", "radiat", "point", "spread", "move", "side"],
    h_character: ["sharp", "dull", "cramp", "describe", "constant", "comes and goes", "burning", "stab", "type of pain", "what kind"],
    h_aggrav: ["worse", "better", "aggrav", "reliev", "movement", "position", "cough", "breathe", "lie", "trigger"],
    h_nausea: ["nausea", "vomit", "sick", "appetite", "throw up", "eat", "keep food"],
    h_bowel: ["bowel", "stool", "poop", "flatus", "gas", "constip", "diarrh", "pass wind", "last movement"],
    h_urinary: ["urin", "pee", "dysuria", "bladder", "water"],
    h_fevers: ["fever", "chill", "temperature", "hot", "sweat", "rigor"],
    h_gyn: ["period", "menstru", "pregnan", "lmp", "gyn", "last period"],
    h_diet: ["fatty", "meal", "food", "ate", "eaten", "greasy", "last ate", "after eating"],
    h_prior: ["before", "previous", "similar", "happened", "episode", "prior", "first time", "ever had"],
    h_pmh: ["medical history", "condition", "diabet", "past medical", "health problem", "illness", "hyperten"],
    h_psh: ["surger", "operation", "surgical", "scar", "had surgery", "appendix out"],
    h_meds: ["medicat", "drug", "nsaid", "ibuprofen", "pill", "blood thinner", "aspirin", "steroid", "taking any"],
    h_social: ["alcohol", "smok", "drink", "tobacco", "cigarette"],
  };
  const GENERIC_REPLIES = [
    "No, nothing like that, doctor.",
    "Not that I've noticed.",
    "No, I don't think so.",
    "That's been fine, actually.",
    "No, nothing unusual there.",
  ];

  function vitalsLine(v) {
    return "T " + v.temp + ", HR " + v.hr + ", BP " + v.bp + ", RR " + v.rr + ", SpO₂ " + v.spo2;
  }
  function historyLabel(id) {
    const it = ORDER_MENU.history.find((x) => x.id === id);
    return it ? it.label : id;
  }
  function buildPatientContext(c) {
    const bg = ORDER_MENU.history
      .filter((it) => c.findings[it.id])
      .map((it) => "- " + it.label + ": " + c.findings[it.id])
      .join("\n");
    return {
      who: c.patient.age + "-year-old " + (c.patient.sex === "F" ? "woman" : "man") + " (" + c.patient.name + ")",
      complaint: c.chiefComplaint,
      vitals: vitalsLine(c.vitals),
      background: bg + "\n(For your reference only — never say this aloud — the underlying problem is: " + c.title + ".)",
    };
  }
  function mapHistory(text) {
    const t = text.toLowerCase();
    for (const id in HISTORY_KEYWORDS) {
      if (HISTORY_KEYWORDS[id].some((k) => t.indexOf(k) !== -1)) return id;
    }
    return null;
  }
  function scriptedAnswer(id, c) {
    if (id && c.findings[id]) return c.findings[id];
    return GENERIC_REPLIES[Math.floor(Math.random() * GENERIC_REPLIES.length)];
  }

  function renderInterview(body) {
    const c = enc.caseObj;
    const wrap = el("div", "interview panel active");
    wrap.appendChild(el("p", "panel-intro",
      "Take a focused history — tap a question or type your own. " +
      (AI.available ? "The patient is voiced by live AI." : "Add an AI key in Netlify to make the patient talk back freely.")));

    const log = el("div", "chat-log"); log.id = "chat-log";
    wrap.appendChild(log);

    const chips = el("div", "ask-chips");
    ORDER_MENU.history.forEach((it) => {
      const asked = enc.ordered.has(it.id);
      const b = el("button", "chip" + (asked ? " asked" : ""),
        (asked ? '<span class="c-check">✓</span> ' : "") + esc(it.label));
      b.onclick = () => askQuestion(it.label, it.id);
      chips.appendChild(b);
    });
    wrap.appendChild(chips);

    const row = el("div", "ask-row");
    row.innerHTML =
      '<input id="ask-input" type="text" placeholder="Ask the patient something…" autocomplete="off" />' +
      '<button class="send" id="ask-send" title="Ask">↑</button>';
    wrap.appendChild(row);
    body.appendChild(wrap);

    const input = $("#ask-input"), send = $("#ask-send");
    const fire = () => { const v = input.value.trim(); if (v) { input.value = ""; askQuestion(v, null); } };
    send.onclick = fire;
    input.onkeydown = (e) => { if (e.key === "Enter") fire(); };

    if (!enc.greeted) {
      enc.greeted = true;
      const greet = "Hi doctor… " + greetingFor(c);
      enc.chat.push({ role: "patient", text: greet });
      renderChat();
      speak(greet);
    } else {
      renderChat();
    }
  }

  function greetingFor(c) {
    return "I'm here because of " + c.chiefComplaint.replace(/\.$/, "").toLowerCase() + ".";
  }

  function renderChat() {
    const log = $("#chat-log");
    if (!log) return;
    log.innerHTML = "";
    enc.chat.forEach((m) => {
      if (m.role === "system") {
        log.appendChild(el("div", "bubble system", '<div class="txt">' + esc(m.text) + "</div>"));
        return;
      }
      const b = el("div", "bubble " + (m.role === "doctor" ? "doctor" : "patient"));
      b.appendChild(el("div", "who-ic", m.role === "doctor" ? "🩺" : "🙋"));
      const txt = el("div", "txt", esc(m.text));
      if (m.role === "patient") {
        const sp = el("button", "speaker-btn", "🔊");
        sp.title = "Replay"; sp.onclick = () => speak(m.text);
        txt.appendChild(document.createTextNode(" "));
        txt.appendChild(sp);
      }
      b.appendChild(txt);
      log.appendChild(b);
    });
    if (enc.busy) {
      const t = el("div", "bubble patient typing",
        '<div class="who-ic">🙋</div><div class="txt"><span class="typing-dots"><span></span><span></span><span></span></span></div>');
      log.appendChild(t);
    }
    log.scrollTop = log.scrollHeight;
  }

  async function askQuestion(text, orderId) {
    if (enc.busy) return;
    text = String(text || "").trim();
    if (!text) return;
    const c = enc.caseObj;
    const id = orderId || mapHistory(text);
    if (id) { enc.ordered.add(id); enc.visited.add("history"); }

    enc.chat.push({ role: "doctor", text });
    renderChat();
    updateFooter(); syncTabDoneFlags();

    let reply;
    if (AI.available) {
      enc.busy = true; renderChat();
      try {
        const conv = enc.chat.slice(0, -1).map((m) => ({ role: m.role, text: m.text }));
        const d = await aiCall({ mode: "patient", patient: buildPatientContext(c), conversation: conv, message: text });
        reply = d && d.reply ? d.reply : null;
        if (!reply) { AI.available = AI.available && !(d && d.error); reply = scriptedAnswer(id, c); }
      } catch (e) {
        reply = scriptedAnswer(id, c);
      }
      enc.busy = false;
    } else {
      reply = scriptedAnswer(id, c);
    }
    enc.chat.push({ role: "patient", text: reply });
    // re-render the whole tab so chips update their "asked" check
    if (enc.activeTab === "history") renderTab();
    else renderChat();
    speak(reply);
  }

  function renderChoicePanel(body, kind) {
    const c = enc.caseObj;
    body.appendChild(el("p", "panel-intro",
      kind === "diagnosis"
        ? "Commit to your single best diagnosis."
        : "Choose the best management / disposition."));
    const list = el("div", "order-grid panel active");
    const items = kind === "diagnosis" ? c.diagnoses : c.managements;
    const selKey = kind === "diagnosis" ? "dxId" : "mgId";
    items.forEach((opt) => {
      const sel = enc[selKey] === opt.id;
      const row = el("div", "choice" + (sel ? " selected" : ""));
      row.appendChild(el("div", "radio"));
      row.appendChild(el("div", "ctxt", esc(opt.label)));
      row.onclick = () => {
        enc[selKey] = opt.id; enc.visited.add(enc.activeTab);
        list.querySelectorAll(".choice").forEach((x) => x.classList.remove("selected"));
        row.classList.add("selected");
        updateFooter(); syncTabDoneFlags();
      };
      list.appendChild(row);
    });
    body.appendChild(list);
  }

  function syncTabDoneFlags() {
    document.querySelectorAll("#encounter .tab").forEach((t) => {
      const id = t.dataset.tab;
      let done = false;
      const def = TAB_DEFS.find((d) => d.id === id);
      if (def.cat) done = ORDER_MENU[def.cat].some((it) => enc.ordered.has(it.id));
      else if (id === "diagnosis") done = !!enc.dxId;
      else if (id === "management") done = !!enc.mgId;
      t.classList.toggle("done", done);
    });
  }

  function updateFooter() {
    let n = 0, cost = 0;
    ["labs", "imaging"].forEach((cat) =>
      ORDER_MENU[cat].forEach((it) => { if (enc.ordered.has(it.id)) { n++; cost += it.cost || 1; } }));
    $("#enc-tally").innerHTML =
      "<b>" + n + "</b> tests ordered &middot; workup cost <b>" + "$".repeat(Math.min(cost, 8)) +
      (cost > 8 ? "+" : "") + "</b>";
    const ready = enc.dxId && enc.mgId;
    const btn = $("#enc-submit");
    btn.disabled = !ready;
    btn.textContent = ready ? "Submit to Attending →" : "Pick a diagnosis & plan";
  }

  /* ---------------------------------------------------------------------- *
   *  Scoring engine
   * ---------------------------------------------------------------------- */
  function grade() {
    const c = enc.caseObj, ord = enc.ordered;
    const cover = (keys) => keys.length ? Math.round(100 * keys.filter((k) => ord.has(k)).length / keys.length) : 100;
    const history = cover(c.keyHistory);
    const exam = cover(c.keyExam);

    const appr = c.appropriateLabs.concat(c.appropriateImaging);
    let workup = appr.length ? appr.filter((k) => ord.has(k)).length / appr.length : 1;
    const crit = c.criticalImaging || [];
    if (crit.length && !crit.some((k) => ord.has(k))) workup *= 0.5;
    workup = Math.round(100 * workup);

    const dx = c.diagnoses.find((d) => d.id === enc.dxId);
    const diagnosis = dx ? ({ correct: 100, partial: 60, wrong: 0 }[dx.tier]) : 0;
    const mg = c.managements.find((m) => m.id === enc.mgId);
    const management = mg ? ({ correct: 100, acceptable: 70, suboptimal: 40, harmful: 0 }[mg.tier]) : 0;

    const okSet = new Set(c.appropriateLabs.concat(c.acceptableLabs, c.appropriateImaging, c.acceptableImaging));
    let steward = 100; const wasteful = [];
    ["labs", "imaging"].forEach((cat) => ORDER_MENU[cat].forEach((it) => {
      if (ord.has(it.id) && !okSet.has(it.id)) { steward -= (it.cost || 1) * 6; wasteful.push(it); }
    }));
    steward = Math.max(0, steward);

    const total = Math.round(
      history * WEIGHTS.history + exam * WEIGHTS.exam + workup * WEIGHTS.workup +
      diagnosis * WEIGHTS.diagnosis + management * WEIGHTS.management + steward * WEIGHTS.stewardship);
    const stars = total >= 85 ? 3 : total >= 65 ? 2 : 1;

    return { history, exam, workup, diagnosis, management, steward, total, stars, dx, mg, wasteful };
  }

  function submitEncounter() {
    const c = enc.caseObj;
    const r = grade();

    // update streak
    const correctDx = r.dx && r.dx.tier === "correct";
    save.streak = correctDx ? save.streak + 1 : 0;
    save.bestStreak = Math.max(save.bestStreak, save.streak);

    // update per-case best
    const prev = save.cases[c.id] || { bestTotal: 0, bestStars: 0 };
    const firstTime = !prev.completed;
    save.cases[c.id] = {
      completed: true,
      bestTotal: Math.max(prev.bestTotal || 0, r.total),
      bestStars: Math.max(prev.bestStars || 0, r.stars),
    };

    // XP
    const xpGain = r.total + r.stars * 20 + (firstTime ? 50 : 0);
    save.xp += xpGain;

    // badges
    const newBadges = checkBadges(r);

    persist();
    renderHUD();
    refreshBedLabels();
    hide("#encounter");
    showReport(r, xpGain, newBadges, c);
  }

  function checkBadges(r) {
    const earned = [];
    const give = (id, cond) => { if (cond && !save.badges.includes(id)) { save.badges.push(id); earned.push(id); } };
    give("sharp_eye", r.diagnosis === 100);
    give("lifesaver", r.management === 100);
    give("steward", r.steward >= 90);
    give("perfect", r.stars === 3);
    give("historian", r.history === 100);
    give("eagle_eye", r.exam === 100);
    give("on_a_roll", save.streak >= 3);
    const allPassed = CASES.every((c) => save.cases[c.id] && save.cases[c.id].bestStars >= 2);
    give("chief", allPassed);
    return earned;
  }

  /* ---------------------------------------------------------------------- *
   *  Report (attending grade)
   * ---------------------------------------------------------------------- */
  function showReport(r, xpGain, newBadges, c) {
    const root = $("#report .card");
    root.innerHTML = "";

    const head = el("div", "rep-head");
    head.appendChild(el("div", "who", "Attending Feedback"));
    head.appendChild(el("h2", null, esc(c.title)));
    const starsEl = el("div", "stars");
    for (let i = 0; i < 3; i++) starsEl.appendChild(el("span", "s" + (i < r.stars ? " on" : ""), "★"));
    head.appendChild(starsEl);
    head.appendChild(el("div", "rep-score", 'Overall score <b>' + r.total + "</b> / 100"));
    root.appendChild(head);

    const body = el("div", "rep-body");

    // xp
    body.appendChild(el("div", "xp-gain", "You earned <b>+" + xpGain + " XP</b>"));

    // domains
    const dwrap = el("div", "domains");
    const D = [
      ["History", r.history], ["Exam", r.exam], ["Workup appropriateness", r.workup],
      ["Diagnosis accuracy", r.diagnosis], ["Management", r.management], ["Resource stewardship", r.steward],
    ];
    D.forEach(([name, val]) => {
      const cls = val < 50 ? "lo" : val < 80 ? "mid" : "hi";
      const d = el("div", "domain");
      d.innerHTML =
        '<div class="d-top"><span class="d-name">' + name + '</span><span class="d-val">' + val + "</span></div>" +
        '<div class="bar ' + cls + '"><span style="width:0%"></span></div>';
      dwrap.appendChild(d);
      setTimeout(() => { d.querySelector(".bar > span").style.width = val + "%"; }, 60);
    });
    body.appendChild(dwrap);

    // earned badges
    if (newBadges.length) {
      const sec = el("div", "rep-section");
      sec.appendChild(el("h4", null, "🎉 Badges unlocked"));
      const wrap = el("div", "earned-badges");
      newBadges.forEach((id) => {
        const b = BADGES.find((x) => x.id === id);
        wrap.appendChild(el("div", "earned-badge",
          '<span class="be-ic">' + b.icon + "</span>" + esc(b.name)));
      });
      sec.appendChild(wrap); body.appendChild(sec);
    }

    // feedback
    const fbSec = el("div", "rep-section");
    fbSec.appendChild(el("h4", null, "Teaching points"));
    const list = el("div", "feedback-list");
    buildFeedback(r, c).forEach((f) => {
      list.appendChild(el("div", "fb " + f.kind,
        '<span class="ic">' + f.ic + "</span><span>" + f.text + "</span>"));
    });
    fbSec.appendChild(list); body.appendChild(fbSec);

    // live AI attending (if a key is configured)
    if (AI.available) {
      const aSec = el("div", "rep-section");
      aSec.appendChild(el("h4", null, "Attending feedback"));
      const live = el("div", "attending-live");
      live.innerHTML =
        '<div class="al-head">🧑‍⚕️ Dr. Attending</div>' +
        '<div class="al-loading">Reviewing your encounter…</div>';
      aSec.appendChild(live); body.appendChild(aSec);
      fetchAttending(r, c, live);
    }

    // teaching summary (always shown — guideline-style notes)
    const tSec = el("div", "rep-section");
    tSec.appendChild(el("h4", null, AI.available ? "Guideline notes" : "Attending summary"));
    const box = el("div", "teaching-box", esc(c.teaching));
    box.innerHTML += '<div class="icd">Synthetic teaching code (educational): <code>' + esc(c.icd10) + "</code></div>";
    tSec.appendChild(box); body.appendChild(tSec);

    root.appendChild(body);

    const foot = el("div", "rep-foot");
    const retry = el("button", "btn-ghost", "↻ Retry case");
    retry.onclick = () => { stopSpeak(); hide("#report"); openEncounter(CASES.indexOf(c)); };
    const back = el("button", "btn-primary", "Return to ward");
    back.style.marginTop = "0";
    back.onclick = () => { stopSpeak(); hide("#report"); };
    foot.appendChild(retry); foot.appendChild(back);
    root.appendChild(foot);

    show("#report");
    if (r.stars === 3 || newBadges.length) setTimeout(celebrate, 220);
  }

  async function fetchAttending(r, c, container) {
    const correctMg = c.managements.find((m) => m.tier === "correct");
    const correctDx = c.diagnoses.find((d) => d.tier === "correct");
    const missed = missing(c.keyHistory).concat(missing(c.keyExam)).slice(0, 6).join("; ");
    const payload = {
      title: c.title,
      correctDx: correctDx ? correctDx.label : "",
      residentDx: r.dx ? r.dx.label : "(none)",
      residentMgmt: r.mg ? r.mg.label : "(none)",
      mgmtTier: r.mg ? r.mg.tier : "none",
      correctMgmt: correctMg ? correctMg.label : "",
      history: r.history, exam: r.exam, workup: r.workup, diagnosis: r.diagnosis,
      management: r.management, steward: r.steward, total: r.total, stars: r.stars,
      missed: missed || "none",
      wasteful: r.wasteful.length ? r.wasteful.map((w) => w.label).join("; ") : "none",
    };
    const fail = () => { container.innerHTML =
      '<div class="al-head">🧑‍⚕️ Dr. Attending</div><div class="al-loading">(Live feedback unavailable right now — see the notes below.)</div>'; };
    try {
      const d = await aiCall({ mode: "attending", encounter: payload });
      if (d && d.feedback) {
        container.innerHTML = '<div class="al-head">🧑‍⚕️ Dr. Attending</div>' + esc(d.feedback);
        speak(d.feedback);
      } else { fail(); }
    } catch (e) { fail(); }
  }

  function labelsFor(ids, cat) {
    return ids.map((id) => {
      const it = (ORDER_MENU[cat] || []).find((x) => x.id === id);
      return it ? it.label : id;
    });
  }
  function missing(keys, cat) {
    return keys.filter((k) => !enc.ordered.has(k)).map((id) => {
      for (const cc of ["history", "exam", "labs", "imaging"]) {
        const it = ORDER_MENU[cc].find((x) => x.id === id);
        if (it) return it.label;
      }
      return id;
    });
  }

  function buildFeedback(r, c) {
    const fb = [];
    // history
    if (r.history >= 100) fb.push({ kind: "good", ic: "✅", text: "Focused, complete history — you covered the high-yield questions." });
    else {
      const miss = missing(c.keyHistory).slice(0, 4);
      fb.push({ kind: "warn", ic: "📋", text: "History gaps. Also worth asking about: " + esc(miss.join("; ")) + "." });
    }
    // exam
    if (r.exam >= 100) fb.push({ kind: "good", ic: "✅", text: "Thorough, targeted exam." });
    else {
      const miss = missing(c.keyExam).slice(0, 4);
      fb.push({ kind: "warn", ic: "🩺", text: "Key exam steps missed: " + esc(miss.join("; ")) + "." });
    }
    // workup
    const crit = c.criticalImaging || [];
    if (crit.length && !crit.some((k) => enc.ordered.has(k))) {
      fb.push({ kind: "bad", ic: "🩻", text: "You didn't obtain the key confirmatory study for this presentation." });
    } else if (r.workup >= 100) {
      fb.push({ kind: "good", ic: "✅", text: "Appropriate, efficient workup." });
    } else {
      const missL = missing(c.appropriateLabs).concat(missing(c.appropriateImaging)).slice(0, 4);
      if (missL.length) fb.push({ kind: "warn", ic: "🧪", text: "Consider also ordering: " + esc(missL.join("; ")) + "." });
    }
    // stewardship
    if (r.wasteful.length) {
      fb.push({ kind: "warn", ic: "🌿", text: "Low-yield / costly orders here: " + esc(r.wasteful.map((w) => w.label).join("; ")) + ". These add cost without changing management." });
    } else {
      fb.push({ kind: "good", ic: "🌿", text: "Excellent stewardship — no unnecessary tests." });
    }
    // diagnosis
    const correctDx = c.diagnoses.find((d) => d.tier === "correct");
    if (r.dx && r.dx.tier === "correct") fb.push({ kind: "good", ic: "🎯", text: "Correct diagnosis: " + esc(r.dx.label) + "." });
    else if (r.dx && r.dx.tier === "partial") fb.push({ kind: "warn", ic: "🧠", text: "Close. " + esc(r.dx.label) + " is on the differential, but the best answer was " + esc(correctDx.label) + "." });
    else fb.push({ kind: "bad", ic: "🧠", text: "The diagnosis was " + esc(correctDx.label) + (r.dx ? ", not " + esc(r.dx.label) : "") + "." });
    // management
    const correctMg = c.managements.find((m) => m.tier === "correct");
    if (r.mg && r.mg.tier === "correct") fb.push({ kind: "good", ic: "🚑", text: esc(r.mg.note) });
    else if (r.mg && (r.mg.tier === "acceptable" || r.mg.tier === "suboptimal")) fb.push({ kind: "warn", ic: "💊", text: esc(r.mg.note) + " Best plan: " + esc(correctMg.label) + "." });
    else if (r.mg) fb.push({ kind: "bad", ic: "⚠️", text: "Harmful choice. " + esc(r.mg.note) + " The correct plan: " + esc(correctMg.label) + "." });
    return fb;
  }

  /* ---------------------------------------------------------------------- *
   *  Badges modal
   * ---------------------------------------------------------------------- */
  function showBadges() {
    const grid = $("#badge-grid");
    grid.innerHTML = "";
    BADGES.forEach((b) => {
      const got = save.badges.includes(b.id);
      const n = el("div", "badge" + (got ? " unlocked" : ""));
      n.innerHTML =
        '<div class="b-ic">' + b.icon + "</div>" +
        '<div><div class="b-name">' + esc(b.name) + (got ? "" : " 🔒") + "</div>" +
        '<div class="b-desc">' + esc(b.desc) + "</div></div>";
      grid.appendChild(n);
    });
    show("#badges");
  }

  /* ---------------------------------------------------------------------- *
   *  Confetti celebration (self-contained, removes itself)
   * ---------------------------------------------------------------------- */
  function celebrate() {
    const cv = document.createElement("canvas");
    cv.style.cssText = "position:fixed;inset:0;z-index:200;pointer-events:none";
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    const colors = ["#0d9488", "#14b8a6", "#f59e0b", "#fbbf24", "#34d399", "#60a5fa", "#f472b6"];
    const P = [];
    for (let i = 0; i < 150; i++) P.push({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.6,
      r: 4 + Math.random() * 6, c: colors[(Math.random() * colors.length) | 0],
      vx: -2.2 + Math.random() * 4.4, vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI, vr: -0.22 + Math.random() * 0.44,
    });
    const start = performance.now();
    (function frame(t) {
      const elapsed = t - start;
      ctx.clearRect(0, 0, cv.width, cv.height);
      P.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 2700); ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();
      });
      if (elapsed < 2700) requestAnimationFrame(frame); else cv.remove();
    })(start);
  }

  /* ---------------------------------------------------------------------- *
   *  Toast
   * ---------------------------------------------------------------------- */
  function toast(text, icon) {
    const wrap = $("#toast-wrap");
    const t = el("div", "toast", '<span class="t-ic">' + (icon || "💡") + "</span>" + esc(text));
    wrap.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(8px)"; setTimeout(() => t.remove(), 400); }, 3200);
  }

  /* ---------------------------------------------------------------------- *
   *  Overlay show/hide
   * ---------------------------------------------------------------------- */
  function show(sel) { $(sel).classList.remove("hidden"); }
  function hide(sel) { $(sel).classList.add("hidden"); }

  /* ---------------------------------------------------------------------- *
   *  Reset
   * ---------------------------------------------------------------------- */
  function resetProgress() {
    if (!confirm("Reset all progress, XP, and badges? This cannot be undone.")) return;
    save = defaultSave();
    persist(); renderHUD(); refreshBedLabels(); hide("#badges");
    toast("Progress reset.", "♻️");
  }

  /* ---------------------------------------------------------------------- *
   *  Boot
   * ---------------------------------------------------------------------- */
  function boot() {
    if (typeof THREE === "undefined") {
      $("#loader").innerHTML =
        '<div style="max-width:340px;text-align:center;padding:24px;color:#cbd5e1">' +
        "⚠️ Couldn't load the 3D library (Three.js).<br><br>This app needs an internet connection the first time it loads. " +
        "Please reconnect and refresh.</div>";
      return;
    }
    initScene();
    renderHUD();
    renderWelcome();

    $("#w-start").onclick = () => { save.welcomed = true; persist(); hide("#welcome"); };
    $("#open-badges").onclick = showBadges;
    $("#badges-close").onclick = () => hide("#badges");
    $("#reset-btn").onclick = resetProgress;
    $("#voice-btn").onclick = toggleVoice;

    initTTS();
    updateAiBadge();
    aiDetect(); // async — flips the badge to "Live AI" if a key is configured

    if (save.welcomed) hide("#welcome");

    setTimeout(() => $("#loader").classList.add("hidden"), 350);
    setTimeout(() => { const h = $("#scene-hint"); if (h && h.style.opacity !== "0") h.style.opacity = "0"; }, 9000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

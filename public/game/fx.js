// HUSHWATER — fx.js: painterly canvas background, grain, portraits, audio.

/* ---------- color helpers ---------- */

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpRgb(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
function css(rgb, a = 1) {
  return `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${a})`;
}

/* ---------- seeded random ---------- */

export function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- background painter ---------- */

const NULL_PAL = { top: '#000000', bot: '#000000', fog: '#111111', water: null, accent: '#888888', rain: 0, motes: 0, fogAmt: 0, beam: false };

export class Painter {
  constructor(canvas) {
    this.cv = canvas;
    this.cx = canvas.getContext('2d');
    this.t = 0;
    this.cur = this.mix(NULL_PAL, NULL_PAL, 0);
    this.from = NULL_PAL;
    this.to = NULL_PAL;
    this.fadeT = 1;
    this.shakeAmt = 0;
    this.flashAmt = 0;
    this.flashColor = [255, 240, 200];
    this.parX = 0; this.parY = 0;
    this.fogBlobs = [];
    this.motes = [];
    this.rain = [];
    const rnd = mulberry(7);
    for (let i = 0; i < 14; i++) {
      this.fogBlobs.push({ x: rnd(), y: 0.35 + rnd() * 0.6, r: 0.18 + rnd() * 0.3, v: 0.004 + rnd() * 0.012, ph: rnd() * 7 });
    }
    for (let i = 0; i < 60; i++) {
      this.motes.push({ x: rnd(), y: rnd(), r: 0.6 + rnd() * 1.8, v: 0.01 + rnd() * 0.03, ph: rnd() * 7, dr: rnd() });
    }
    for (let i = 0; i < 90; i++) {
      this.rain.push({ x: rnd(), y: rnd(), l: 0.02 + rnd() * 0.03, v: 0.6 + rnd() * 0.7 });
    }
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('pointermove', (e) => {
      this.parX = (e.clientX / window.innerWidth - 0.5);
      this.parY = (e.clientY / window.innerHeight - 0.5);
    });
    this.last = performance.now();
    requestAnimationFrame((n) => this.frame(n));
  }

  resize() {
    const s = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = Math.floor(window.innerWidth * s * 0.75);
    this.cv.height = Math.floor(window.innerHeight * s * 0.75);
  }

  setScene(pal) {
    this.from = { ...this.cur };
    this.to = pal;
    this.fadeT = 0;
  }

  shake(a = 1) { this.shakeAmt = Math.max(this.shakeAmt, a); }
  flash(color = [255, 240, 200], a = 0.8) { this.flashColor = color; this.flashAmt = Math.max(this.flashAmt, a); }

  mix(a, b, t) {
    return {
      top: lerpRgb(hexToRgb(a.top || '#000000'), hexToRgb(b.top || '#000000'), t),
      bot: lerpRgb(hexToRgb(a.bot || '#000000'), hexToRgb(b.bot || '#000000'), t),
      fog: lerpRgb(hexToRgb(a.fog || '#111111'), hexToRgb(b.fog || '#111111'), t),
      water: b.water ? lerpRgb(hexToRgb(a.water || b.water), hexToRgb(b.water), t) : (a.water && t < 1 ? hexToRgb(a.water) : null),
      waterA: lerp(a.water ? 1 : 0, b.water ? 1 : 0, t),
      accent: lerpRgb(hexToRgb(a.accent || '#888888'), hexToRgb(b.accent || '#888888'), t),
      rain: lerp(a.rain || 0, b.rain || 0, t),
      motes: lerp(a.motes || 0, b.motes || 0, t),
      fogAmt: lerp(a.fogAmt || 0, b.fogAmt || 0, t),
      beamA: lerp(a.beam ? 1 : 0, b.beam ? 1 : 0, t),
      towerA: lerp(a.tower ? 1 : 0, b.tower ? 1 : 0, t),
      rayA: lerp(a.ray ? 1 : 0, b.ray ? 1 : 0, t),
      driftA: lerp(a.drift ? 1 : 0, b.drift ? 1 : 0, t),
    };
  }

  frame(now) {
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.t += dt;
    if (this.fadeT < 1) this.fadeT = Math.min(1, this.fadeT + dt / 2.2);
    const e = this.fadeT * this.fadeT * (3 - 2 * this.fadeT);
    this.cur = this.mix(this.from, this.to, e);
    this.draw(dt);
    requestAnimationFrame((n) => this.frame(n));
  }

  draw(dt) {
    const c = this.cur, cx = this.cx, W = this.cv.width, H = this.cv.height, t = this.t;
    cx.save();
    if (this.shakeAmt > 0.01) {
      cx.translate((Math.random() - 0.5) * this.shakeAmt * 22, (Math.random() - 0.5) * this.shakeAmt * 22);
      this.shakeAmt *= Math.pow(0.02, dt);
    }
    cx.translate(this.parX * -14, this.parY * -8);

    // sky — slow breathing gradient
    const breathe = Math.sin(t * 0.13) * 0.06;
    const g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, css(c.top));
    g.addColorStop(0.55 + breathe, css(lerpRgb(c.top, c.bot, 0.5)));
    g.addColorStop(1, css(c.bot));
    cx.fillStyle = g;
    cx.fillRect(-40, -40, W + 80, H + 80);

    // god ray (interiors)
    if (c.rayA > 0.02) {
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      const rx = W * 0.68, sway = Math.sin(t * 0.21) * W * 0.02;
      const rg = cx.createLinearGradient(rx + sway, 0, rx - W * 0.25 + sway, H);
      rg.addColorStop(0, css(c.accent, 0.14 * c.rayA * (0.8 + 0.2 * Math.sin(t * 0.5))));
      rg.addColorStop(1, css(c.accent, 0));
      cx.fillStyle = rg;
      cx.beginPath();
      cx.moveTo(rx + sway - W * 0.06, -40);
      cx.lineTo(rx + sway + W * 0.06, -40);
      cx.lineTo(rx + sway - W * 0.14, H + 40);
      cx.lineTo(rx + sway - W * 0.36, H + 40);
      cx.closePath();
      cx.fill();
      cx.restore();
    }

    // lighthouse silhouette + beam
    if (c.towerA > 0.02) {
      const tx = W * 0.16, tw = W * 0.028, th = H * 0.46, ty = H * 0.62 - th;
      cx.save();
      cx.globalAlpha = c.towerA;
      const sil = css(lerpRgb(c.top, [0, 0, 0], 0.55), 0.9);
      cx.fillStyle = sil;
      cx.beginPath();
      cx.moveTo(tx - tw, ty + th);
      cx.lineTo(tx - tw * 0.55, ty);
      cx.lineTo(tx + tw * 0.55, ty);
      cx.lineTo(tx + tw, ty + th);
      cx.closePath();
      cx.fill();
      cx.fillRect(tx - tw * 0.85, ty - H * 0.02, tw * 1.7, H * 0.022);
      cx.fillRect(tx - tw * 0.6, ty - H * 0.055, tw * 1.2, H * 0.037);
      if (c.beamA > 0.02) {
        cx.globalCompositeOperation = 'lighter';
        const ang = t * 0.45;
        const bx = tx, by = ty - H * 0.036;
        for (const dir of [1, -1]) {
          const a = ang * dir + (dir < 0 ? 2.2 : 0);
          const dx = Math.cos(a), dy = Math.sin(a) * 0.22;
          const len = W * 0.9;
          const bg = cx.createLinearGradient(bx, by, bx + dx * len, by + dy * len);
          bg.addColorStop(0, css(c.accent, 0.5 * c.beamA));
          bg.addColorStop(1, css(c.accent, 0));
          cx.fillStyle = bg;
          cx.beginPath();
          cx.moveTo(bx, by - 2);
          cx.lineTo(bx + dx * len - dy * len * 0.16, by + dy * len - H * 0.09);
          cx.lineTo(bx + dx * len + dy * len * 0.16, by + dy * len + H * 0.09);
          cx.lineTo(bx, by + 2);
          cx.closePath();
          cx.fill();
        }
        const gl = cx.createRadialGradient(bx, by, 0, bx, by, W * 0.06);
        gl.addColorStop(0, css([255, 250, 230], 0.9 * c.beamA));
        gl.addColorStop(1, css(c.accent, 0));
        cx.fillStyle = gl;
        cx.fillRect(bx - W * 0.06, by - W * 0.06, W * 0.12, W * 0.12);
        cx.globalCompositeOperation = 'source-over';
      }
      cx.restore();
    }

    // water — shimmering horizontal bands
    if (c.waterA > 0.02 && c.water) {
      const wy = H * 0.62;
      cx.save();
      cx.globalAlpha = c.waterA;
      const wg = cx.createLinearGradient(0, wy, 0, H);
      wg.addColorStop(0, css(lerpRgb(c.water, c.bot, 0.35)));
      wg.addColorStop(1, css(lerpRgb(c.water, [0, 0, 0], 0.4)));
      cx.fillStyle = wg;
      cx.fillRect(-40, wy, W + 80, H - wy + 40);
      cx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 22; i++) {
        const fy = wy + ((i * 37) % (H - wy));
        const depth = (fy - wy) / (H - wy);
        const ph = t * (0.5 + depth) + i * 1.7;
        const x = ((Math.sin(ph) * 0.5 + 0.5) * W * 1.2 - W * 0.1);
        const len = (30 + 90 * depth) * (0.7 + 0.3 * Math.sin(ph * 2.3));
        cx.fillStyle = css(lerpRgb(c.accent, [255, 255, 255], 0.3), 0.05 + 0.06 * depth);
        cx.fillRect(x - len / 2, fy, len, 1 + depth * 2);
      }
      cx.restore();
    }

    // fog blobs
    if (c.fogAmt > 0.02) {
      cx.save();
      for (const b of this.fogBlobs) {
        b.x += b.v * dt * (c.driftA > 0.5 ? -2.2 : 1);
        if (b.x > 1.3) b.x = -0.3;
        if (b.x < -0.3) b.x = 1.3;
        const bx = b.x * W, by = (b.y + Math.sin(t * 0.1 + b.ph) * 0.03) * H;
        const br = b.r * W;
        const fg = cx.createRadialGradient(bx, by, 0, bx, by, br);
        fg.addColorStop(0, css(c.fog, 0.16 * c.fogAmt));
        fg.addColorStop(1, css(c.fog, 0));
        cx.fillStyle = fg;
        cx.fillRect(bx - br, by - br, br * 2, br * 2);
      }
      cx.restore();
    }

    // motes / embers
    const moteN = Math.min(this.motes.length, c.motes | 0);
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < moteN; i++) {
      const m = this.motes[i];
      m.y -= m.v * dt * (0.4 + m.dr);
      m.x += Math.sin(t * 0.5 + m.ph) * 0.0003 + (c.driftA > 0.5 ? -0.02 * dt : 0);
      if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); }
      if (m.x < -0.05) m.x = 1.05;
      const a = 0.12 + 0.12 * Math.sin(t * 1.3 + m.ph);
      cx.fillStyle = css(c.accent, a);
      cx.beginPath();
      cx.arc(m.x * W, m.y * H, m.r, 0, 7);
      cx.fill();
    }
    cx.restore();

    // rain
    if (c.rain > 0.05) {
      cx.save();
      cx.strokeStyle = css(lerpRgb(c.fog, [255, 255, 255], 0.4), 0.14 * c.rain);
      cx.lineWidth = 1;
      cx.beginPath();
      for (const r of this.rain) {
        r.y += r.v * dt;
        r.x += r.v * dt * 0.12;
        if (r.y > 1.05) { r.y = -0.08; r.x = Math.random(); }
        const rx = r.x * W, ry = r.y * H;
        cx.moveTo(rx, ry);
        cx.lineTo(rx - r.l * W * 0.12, ry + r.l * H);
      }
      cx.stroke();
      cx.restore();
    }

    // vignette
    const vg = cx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    cx.fillStyle = vg;
    cx.fillRect(-40, -40, W + 80, H + 80);

    // flash
    if (this.flashAmt > 0.01) {
      cx.fillStyle = css(this.flashColor, this.flashAmt * 0.5);
      cx.fillRect(-40, -40, W + 80, H + 80);
      this.flashAmt *= Math.pow(0.01, dt);
    }
    cx.restore();
  }
}

/* ---------- film grain ---------- */

export function startGrain(canvas) {
  const cx = canvas.getContext('2d');
  canvas.width = 160; canvas.height = 160;
  const img = cx.createImageData(160, 160);
  function tick() {
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 22;
    }
    cx.putImageData(img, 0, 0);
  }
  setInterval(tick, 90);
  tick();
}

/* ---------- procedural painterly portraits ---------- */

export function paintPortrait(canvas, color, seed) {
  const cx = canvas.getContext('2d');
  const S = canvas.width;
  const rnd = mulberry(seed * 7919 + 13);
  const base = hexToRgb(color);
  cx.clearRect(0, 0, S, S);
  cx.save();
  cx.beginPath();
  cx.arc(S / 2, S / 2, S / 2 - 1, 0, 7);
  cx.clip();
  // ground
  const bg = cx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, css(lerpRgb(base, [8, 8, 12], 0.82)));
  bg.addColorStop(1, css(lerpRgb(base, [8, 8, 12], 0.6)));
  cx.fillStyle = bg;
  cx.fillRect(0, 0, S, S);
  // brush strokes
  for (let i = 0; i < 46; i++) {
    const shade = lerpRgb(base, rnd() > 0.5 ? [250, 245, 230] : [5, 5, 10], rnd() * 0.75);
    cx.strokeStyle = css(shade, 0.1 + rnd() * 0.22);
    cx.lineWidth = 2 + rnd() * (S / 9);
    cx.lineCap = 'round';
    const x0 = rnd() * S, y0 = rnd() * S;
    const a = rnd() * Math.PI, l = S * (0.2 + rnd() * 0.5);
    cx.beginPath();
    cx.moveTo(x0, y0);
    cx.quadraticCurveTo(
      x0 + Math.cos(a + rnd() * 0.8 - 0.4) * l * 0.5, y0 + Math.sin(a + rnd() * 0.8 - 0.4) * l * 0.5,
      x0 + Math.cos(a) * l, y0 + Math.sin(a) * l
    );
    cx.stroke();
  }
  // figure suggestion: shoulders + head silhouette
  const dark = css(lerpRgb(base, [4, 4, 8], 0.86), 0.92);
  cx.fillStyle = dark;
  cx.beginPath();
  cx.ellipse(S / 2, S * 1.06, S * 0.42, S * 0.42, 0, Math.PI, 0);
  cx.fill();
  cx.beginPath();
  cx.ellipse(S / 2 + (rnd() - 0.5) * S * 0.06, S * 0.47, S * 0.17, S * 0.21, (rnd() - 0.5) * 0.2, 0, 7);
  cx.fill();
  // rim light
  cx.strokeStyle = css(lerpRgb(base, [255, 250, 235], 0.55), 0.8);
  cx.lineWidth = 2;
  cx.beginPath();
  cx.arc(S / 2 + S * 0.02, S * 0.47, S * 0.185, -1.9, -0.4);
  cx.stroke();
  cx.restore();
  // ring
  cx.strokeStyle = css(base, 0.85);
  cx.lineWidth = 2;
  cx.beginPath();
  cx.arc(S / 2, S / 2, S / 2 - 1.5, 0, 7);
  cx.stroke();
}

/* ---------- ambient audio (WebAudio, all synthesized) ---------- */

export class Ambience {
  constructor() { this.ac = null; this.on = false; }

  ensure() {
    if (this.ac) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ac = new AC();
    this.master = this.ac.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ac.destination);
    // low drone: two detuned sines
    const mk = (f, g) => {
      const o = this.ac.createOscillator(), gn = this.ac.createGain();
      o.frequency.value = f; o.type = 'sine';
      gn.gain.value = g;
      o.connect(gn); gn.connect(this.master); o.start();
      return o;
    };
    mk(54, 0.05); mk(54.7, 0.04); mk(108.3, 0.014);
    // wind: filtered noise, slowly modulated
    const len = this.ac.sampleRate * 2;
    const buf = this.ac.createBuffer(1, len, this.ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ac.createBufferSource();
    src.buffer = buf; src.loop = true;
    const bp = this.ac.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 0.6;
    const wg = this.ac.createGain(); wg.gain.value = 0.05;
    src.connect(bp); bp.connect(wg); wg.connect(this.master); src.start();
    const lfo = this.ac.createOscillator(), lg = this.ac.createGain();
    lfo.frequency.value = 0.07; lg.gain.value = 160;
    lfo.connect(lg); lg.connect(bp.frequency); lfo.start();
  }

  toggle() {
    this.ensure();
    if (!this.ac) return false;
    this.on = !this.on;
    if (this.ac.state === 'suspended') this.ac.resume();
    this.master.gain.setTargetAtTime(this.on ? 0.6 : 0, this.ac.currentTime, 0.8);
    return this.on;
  }

  ping(freq = 660, dur = 0.09, gain = 0.05) {
    if (!this.ac || !this.on) return;
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(gain, this.ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ac.currentTime + dur);
    o.connect(g); g.connect(this.master);
    o.start(); o.stop(this.ac.currentTime + dur + 0.02);
  }

  bell() {
    if (!this.ac || !this.on) return;
    const t0 = this.ac.currentTime;
    for (const [f, g] of [[220, 0.1], [329, 0.05], [554, 0.03], [880, 0.015]]) {
      const o = this.ac.createOscillator(), gn = this.ac.createGain();
      o.type = 'sine'; o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.004);
      gn.gain.setValueAtTime(g, t0);
      gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.8);
      o.connect(gn); gn.connect(this.master);
      o.start(t0); o.stop(t0 + 3);
    }
  }

  dice() {
    if (!this.ac || !this.on) return;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.ping(320 + Math.random() * 240, 0.05, 0.04), i * 70);
    }
  }
}

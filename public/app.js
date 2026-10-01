(() => {
'use strict';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BASE_LOOP = 4.4;   // seconds, same as the original "PRO" svg
const HC = 300;          // content height in SVG user units (everything scales with it)
const REF_THICK = 0.278; // stroke thickness / height of the bold "PRO" the defaults were tuned on
const STORE_KEY = 'iridescent-settings-v3';

// Gradient maps: position 0 = core of the shape, 1 = outer halo.
const PRESETS = {
  Iridescent: [[0,'#0a0f5c'],[0.18,'#13279e'],[0.36,'#2c78e4'],[0.5,'#8fd3ff'],[0.6,'#f7ead2'],[0.7,'#ffa04a'],[0.8,'#ff4b2f'],[0.9,'#ff52c8'],[1,'#ffb0f2']],
  Aurora:     [[0,'#03122b'],[0.2,'#0b3d5c'],[0.4,'#0fb5a4'],[0.55,'#7cf2c9'],[0.65,'#eaffb3'],[0.78,'#b98bff'],[0.9,'#6a5bff'],[1,'#ff9ae3']],
  Sunset:     [[0,'#1b0b3a'],[0.2,'#4a1268'],[0.38,'#a3207a'],[0.52,'#f0466b'],[0.64,'#ff8a4c'],[0.76,'#ffd166'],[0.9,'#ff9fb2'],[1,'#ffe3ec']],
  Chrome:     [[0,'#0c0c12'],[0.2,'#3a3f4b'],[0.4,'#9ba4b6'],[0.55,'#eef2f9'],[0.68,'#b8efff'],[0.8,'#ffc9f2'],[0.9,'#ffe6a6'],[1,'#ffffff']],
  Molten:     [[0,'#160500'],[0.2,'#5a1a00'],[0.4,'#b8470c'],[0.55,'#ff9a1f'],[0.65,'#ffd76b'],[0.75,'#fff4cc'],[0.88,'#ff8f5a'],[1,'#ff5f8f']],
  Ocean:      [[0,'#001b2e'],[0.2,'#00406b'],[0.4,'#0077b6'],[0.55,'#48cae4'],[0.66,'#caf0f8'],[0.78,'#90e0ef'],[0.9,'#7b9cff'],[1,'#c9d6ff']],
  Candy:      [[0,'#3a0a4a'],[0.2,'#7a1fa2'],[0.4,'#d14fd8'],[0.55,'#ff9ee6'],[0.66,'#fff0fb'],[0.78,'#9ee8ff'],[0.9,'#7aa8ff'],[1,'#c9b8ff']],
  Neon:       [[0,'#10002b'],[0.18,'#3a0ca3'],[0.36,'#7209b7'],[0.52,'#f72585'],[0.66,'#ff9e00'],[0.76,'#ffe066'],[0.88,'#4cc9f0'],[1,'#4361ee']],
  Gold:       [[0,'#1a1203'],[0.2,'#4d3606'],[0.4,'#9a6b0e'],[0.55,'#e0b23a'],[0.66,'#fff1b8'],[0.78,'#f6d36b'],[0.9,'#d99a2b'],[1,'#ffe8b0']],
  Toxic:      [[0,'#061a07'],[0.2,'#0e4d1a'],[0.4,'#1fa34a'],[0.55,'#9cff57'],[0.66,'#f4ff9b'],[0.78,'#ffe74c'],[0.9,'#ff7ad9'],[1,'#ffc2f0']],
  Opal:       [[0,'#2d3a5a'],[0.2,'#5c6f9c'],[0.4,'#a3b8e0'],[0.55,'#e6f0ff'],[0.66,'#ffe6f2'],[0.78,'#d8fff1'],[0.9,'#fff3c9'],[1,'#ffffff']],
  Ultraviolet:[[0,'#05001a'],[0.2,'#1e0063'],[0.4,'#4b00d1'],[0.55,'#8a5cff'],[0.66,'#d0b8ff'],[0.78,'#ff5cf0'],[0.9,'#ff2e88'],[1,'#ff9ccc']],
  Ember:      [[0,'#0a0a0a'],[0.22,'#2b0d05'],[0.42,'#7a1d06'],[0.56,'#d9480f'],[0.68,'#ffa94d'],[0.8,'#ffe8a3'],[0.92,'#ff6b6b'],[1,'#ffb3b3']],
  Mint:       [[0,'#00261f'],[0.2,'#00594a'],[0.4,'#00a38a'],[0.55,'#5fffd7'],[0.66,'#eafff8'],[0.78,'#ffd6a5'],[0.9,'#ff99c8'],[1,'#ffd1e8']],
  Infrared:   [[0,'#000000'],[0.18,'#1a0033'],[0.36,'#6b00b3'],[0.5,'#ff0066'],[0.62,'#ff6600'],[0.74,'#ffcc00'],[0.86,'#ffffff'],[1,'#ffe0f0']],
  Mono:       [[0,'#050505'],[0.3,'#2a2a2a'],[0.5,'#8a8a8a'],[0.62,'#f2f2f2'],[0.8,'#9a9a9a'],[1,'#d8d8d8']],
};

const FONTS = ['Fredoka','Baloo 2','Unbounded','Syne','Bricolage Grotesque','Archivo Black','Rubik','Inter','Instrument Serif'];

const BACKGROUNDS = [['White', '#ffffff'], ['Paper', '#f3efe6'], ['Black', '#0a0a0b'], ['Midnight', '#0b1026']];

const DEFAULTS = {
  sourceType: 'text', text: 'PRO', font: 'Fredoka', weight: 700, letterSpacing: 0,
  maskMode: 'auto', threshold: 0.5,
  softness: 7.5, crisp: 0.3, depth: 1.3, shift: 0, halo: 1.6, grain: 0.03, haloGrain: 0.45,
  speed: 1, stripeStrength: 0.35, stripeWidth: 1.5, stripeSharp: 0, stripeAngle: 0, stripePasses: 1, stripeReverse: false,
  flow: 3, flowScale: 1, flowMorph: 0.15, flowCycles: 1, seed: 2,
  intro: true, introDur: 1.6, introSmear: 40, introMelt: 12,
  vanish: false, vanishStyle: 'dissolve', vanishDir: 'ltr', vanishDur: 1.4, vanishHold: 1.5,
  palette: 'Iridescent', stops: PRESETS.Iridescent.map(s => s.slice()),
  bg: '#ffffff', bgTransparent: false, padding: 10,
  ex: { frame: 'square', quality: 1080, fps: 30, length: 'loop', start: 0, dur: 3, at: 2, gif: 640, transparent: true, lottieFormat: 'dot', lottieSize: 512, lottieFps: 24 },
};

const SOURCE_KEYS = new Set(['text','font','weight','letterSpacing','maskMode','threshold']);

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let S = loadSettings();
const src = { href: null, aspect: 1, thick: 1, vector: null, detected: 'alpha', name: '' };
let upload = null; // { img, svgUrl }

const $ = (s, r = document) => r.querySelector(s);
const svg = $('#preview'), pvDyn = $('#pvDyn'), pvImg = $('#pvImg'), pvMask = $('#pvm');
const canvasWrap = $('#canvas'), stage = $('#stage');

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved) return { ...structuredClone(DEFAULTS), ...saved, ex: { ...DEFAULTS.ex, ...saved.ex }, sourceType: 'text' };
  } catch (e) {}
  return structuredClone(DEFAULTS);
}
let saveT = 0;
function save() {
  clearTimeout(saveT);
  saveT = setTimeout(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {} }, 300);
}

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const n3 = v => +(+v).toFixed(3);
const n5 = v => +(+v).toFixed(5);

function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t;
  const sy = t => ((ay * t + by) * t + cy) * t;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 28; i++) { t = (lo + hi) / 2; if (sx(t) < x) lo = t; else hi = t; }
    return sy(t);
  };
}
const EASE_INTRO = bezier(.16, 1, .3, 1);
const EASE_IO = bezier(.45, 0, .55, 1);
const SPL_INTRO = '.16 1 .3 1';
const SPL_IO = '.45 0 .55 1';

function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const v = parseInt(h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function sortedStops() { return S.stops.slice().sort((a, b) => a[0] - b[0]); }
function sampleStops(stops, x) {
  if (x <= stops[0][0]) return hexToRgb(stops[0][1]);
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i][0]) {
      const [p0, c0] = stops[i - 1], [p1, c1] = stops[i];
      const t = p1 === p0 ? 0 : (x - p0) / (p1 - p0);
      const a = hexToRgb(c0), b = hexToRgb(c1);
      return a.map((v, k) => lerp(v, b[k], t));
    }
  }
  return hexToRgb(stops[stops.length - 1][1]);
}
function paletteTables(n = 24) {
  const st = sortedStops();
  const r = [], g = [], b = [];
  for (let i = 0; i < n; i++) {
    const c = sampleStops(st, i / (n - 1));
    r.push(n3(c[0] / 255)); g.push(n3(c[1] / 255)); b.push(n3(c[2] / 255));
  }
  return { r: r.join(' '), g: g.join(' '), b: b.join(' ') };
}
function cssGradient(stops) {
  return `linear-gradient(90deg, ${stops.slice().sort((a, b) => a[0] - b[0]).map(([p, c]) => `${c} ${(p * 100).toFixed(1)}%`).join(', ')})`;
}

// ---------------------------------------------------------------------------
// SVG builder — the whole effect lives here. Preview and every export use it.
//
//   stripe gradient (white band, translating)  ── masked by the logo alpha
//        │
//   feTurbulence ─▶ feDisplacementMap        (fluid wobble + intro smear)
//        │
//   blur σ1 + blur σ2 ─▶ mixed "field" v     (alpha = depth inside the shape)
//        │
//   colour-matrix: idx = d·(1−v) + s·stripe + shift
//        │  + grain
//   feComponentTransfer tables = gradient map (core → rim → halo)
//        │
//   composited "in" an alpha curve of v (+ halo grain)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Timeline. Without "vanish" the intro plays once. With it, everything runs on
// one repeating cycle: intro → hold → vanish → short gap, rounded up to whole
// shimmer loops so the stripe and fluid stay seamless.
// ---------------------------------------------------------------------------
const VANISH_STYLES = {
  // amp: noise in the vanish mask (grain), slope: edge hardness,
  // freq: grain size, blur/smear/rise: what happens to the letters as they go.
  dissolve:  { label: 'Dissolve',  amp: 1.1, slope: 10, freq: 0.07, blur: 0.25, smear: 0,    rise: 0 },
  melt:      { label: 'Melt',      amp: 0.3, slope: 3,  freq: 0.02, blur: 1.4,  smear: 0.35, rise: 0 },
  evaporate: { label: 'Evaporate', amp: 0.9, slope: 7,  freq: 0.045, blur: 0.7, smear: 0.1,  rise: 0.18 },
  fade:      { label: 'Fade',      amp: 0,   slope: 1,  freq: 0.02, blur: 0.15, smear: 0,    rise: 0 },
};
const VANISH_DIRS = { ltr: 'Left to right', rtl: 'Right to left', center: 'From the centre', all: 'All at once' };
const SPL_LINEAR = '0 0 1 1';
const SPL_OUT = '.55 0 .85 .45';   // vanish accelerates away

function cycleInfo(introWanted = true) {
  const L = BASE_LOOP / S.speed;
  const introOn = !!(introWanted && S.intro);
  if (!S.vanish) return { vanish: false, introOn, ID: S.introDur, C: L };
  const ID = introOn ? S.introDur : 0.35;
  const VD = S.vanishDur, gap = 0.35;
  const C = Math.max(1, Math.ceil((ID + S.vanishHold + VD + gap) / L - 1e-6)) * L;
  return { vanish: true, introOn, ID, VD, C, tv1: C - gap, tv0: C - gap - VD };
}

const easeCache = {};
const easeFor = spl => easeCache[spl] || (easeCache[spl] = bezier(...spl.split(' ').map(Number)));
const asArr = v => Array.isArray(v) ? v : [v];
const fmtV = v => asArr(v).map(n3).join(' ');
function evalKeys(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, spl] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const p = t1 > t0 ? easeFor(spl || SPL_LINEAR)((t - t0) / (t1 - t0)) : 1;
      const a = asArr(v0), b = asArr(v1);
      const out = a.map((x, k) => lerp(x, b[k], p));
      return Array.isArray(v0) ? out : out[0];
    }
  }
  return keys[keys.length - 1][1];
}
// One animated attribute. Returns the static value (for frames) or the base value plus SMIL.
function track(attr, keys, ci, stat, t, transform) {
  const flat = keys.every(k => fmtV(k[1]) === fmtV(keys[0][1]));
  if (stat) return { v: evalKeys(keys, ci.vanish ? t % ci.C : t), a: '' };
  const last = keys[keys.length - 1][1];
  if (flat) return { v: last, a: '' };
  const dur = ci.vanish ? ci.C : keys[keys.length - 1][0];
  const ks = keys.slice();
  if (ks[0][0] > 0) ks.unshift([0, ks[0][1]]);
  if (ks[ks.length - 1][0] < dur) ks.push([dur, ks[ks.length - 1][1]]);
  const tag = transform ? `animateTransform attributeName="${attr}" type="${transform}"` : `animate attributeName="${attr}"`;
  const timing = ci.vanish ? 'repeatCount="indefinite"' : 'fill="freeze"';
  return {
    v: ci.vanish ? evalKeys(keys, ci.tv0 || 0) : last,
    a: `<${tag} values="${ks.map(k => fmtV(k[1])).join(';')}" keyTimes="${ks.map(k => n3(k[0] / dur)).join(';')}" calcMode="spline" keySplines="${ks.slice(1).map(k => k[2] || SPL_LINEAR).join(';')}" dur="${n3(dur)}s" ${timing}/>`,
  };
}
// intro value → base (eases in), held, then → vanish value (accelerates out)
function lifeKeys(ci, base, from, to) {
  if (ci.vanish) return [[0, ci.introOn ? from : base], [ci.ID, base, SPL_INTRO], [ci.tv0, base], [ci.tv1, to, SPL_OUT], [ci.C, to]];
  if (ci.introOn) return [[0, from], [ci.ID, base, SPL_INTRO]];
  return [[0, base]];
}

// The grain is the same noise every frame, so render it once as a small seamless
// tile instead of regenerating fractal noise per pixel per frame (~40% of the cost).
// The copied SVG code keeps feTurbulence so it stays tiny.
const GRAIN_T = 64;
let grainTile = null;
(function makeGrainTile() {
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${GRAIN_T}" height="${GRAIN_T}"><filter id="g" filterUnits="userSpaceOnUse" x="0" y="0" width="${GRAIN_T}" height="${GRAIN_T}" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="1.1" seed="7" stitchTiles="stitch"/></filter><rect width="${GRAIN_T}" height="${GRAIN_T}" filter="url(#g)"/></svg>`;
  const im = new Image();
  im.onload = () => {
    const c = document.createElement('canvas');
    c.width = c.height = GRAIN_T;
    c.getContext('2d').drawImage(im, 0, 0);
    try { grainTile = c.toDataURL('image/png'); schedule(); } catch (e) { /* keep feTurbulence */ }
  };
  im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
})();

function geom() {
  const Hc = HC, Wc = HC * src.aspect;
  const sig2 = S.softness / 100 * Hc * src.thick;
  const scale = S.flow / 100 * Hc * 2 * Math.sqrt(src.thick);
  const vs = S.vanish ? VANISH_STYLES[S.vanishStyle] || VANISH_STYLES.dissolve : null;
  const rise = vs ? vs.rise * Hc : 0;
  const pad = Math.ceil(sig2 * (2 + S.halo) + scale * 0.6 + S.padding / 100 * Hc + rise * 0.5);
  return { Wc, Hc, pad, W: Wc + 2 * pad, H: Hc + 2 * pad, sig2, sig1: sig2 * 0.3, scale };
}

function build(o) {
  const g = geom();
  const id = o.id;
  const stat = o.time != null;
  const t = o.time || 0;
  const L = BASE_LOOP / S.speed;
  const Ls = L / S.stripePasses, Lf = L / S.flowCycles;

  // --- shimmer stripe -----------------------------------------------------
  const a = S.stripeAngle * Math.PI / 180, P = S.stripeWidth * g.Wc;
  const px = P * Math.cos(a), py = P * Math.sin(a), dir = S.stripeReverse ? -1 : 1;
  const hb = 0.5 * (1 - S.stripeSharp * 0.92);
  const stops = `<stop offset="0"/><stop offset="${n3(.5 - hb)}"/><stop offset=".5" stop-color="#fff"/><stop offset="${n3(.5 + hb)}"/><stop offset="1"/>`;
  let gT = '', gA = '';
  if (stat) {
    const f = ((t / Ls) % 1) * dir;
    gT = ` gradientTransform="translate(${n3(f * px)} ${n3(f * py)})"`;
  } else {
    gA = `<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="${n3(dir * px)} ${n3(dir * py)}" dur="${n3(Ls)}s" repeatCount="indefinite"/>`;
  }
  const grad = `<linearGradient id="${id}s" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${n3(px)}" y2="${n3(py)}" spreadMethod="repeat"${gT}>${stops}${gA}</linearGradient>`;

  // --- fluid ----------------------------------------------------------------
  const f1 = 1 / (0.55 * g.Hc) * S.flowScale, f2 = f1 * (1 + S.flowMorph);
  let freq = f1, fA = '';
  if (stat) {
    const ph = (t % Lf) / Lf, u = ph < .5 ? ph * 2 : (1 - ph) * 2;
    freq = lerp(f1, f2, EASE_IO(u));
  } else if (S.flowMorph > 0) {
    fA = `<animate attributeName="baseFrequency" values="${n5(f1)};${n5(f2)};${n5(f1)}" keyTimes="0;.5;1" calcMode="spline" keySplines="${SPL_IO};${SPL_IO}" dur="${n3(Lf)}s" repeatCount="indefinite"/>`;
  }

  // --- intro / vanish ---------------------------------------------------------
  const ci = cycleInfo(o.intro);
  const vs = VANISH_STYLES[S.vanishStyle] || VANISH_STYLES.dissolve;
  const smear = S.introSmear / 100 * g.Hc * 2 * Math.sqrt(src.thick), melt = S.introMelt / 100 * g.Hc * src.thick;
  const tScale = track('scale', lifeKeys(ci, g.scale, smear, g.scale + vs.smear * g.Hc), ci, stat, t);
  const tS1 = track('stdDeviation', lifeKeys(ci, g.sig1, g.sig1 + melt * .6, g.sig1 + vs.blur * g.sig2 * .6), ci, stat, t);
  const tS2 = track('stdDeviation', lifeKeys(ci, g.sig2, g.sig2 + melt, g.sig2 * (1 + vs.blur)), ci, stat, t);
  const opKeys = ci.vanish ? [[0, 0], [ci.introOn ? ci.ID * .45 : ci.ID, 1, SPL_LINEAR], [ci.C, 1]]
    : ci.introOn ? [[0, 0], [ci.ID * .45, 1, SPL_LINEAR]] : [[0, 1]];
  const tOp = track('opacity', opKeys, ci, stat, t);

  // --- colour ---------------------------------------------------------------
  const d = S.depth, s = S.stripeStrength, off = d + S.shift;
  const row = `${n3(s)} 0 0 ${n3(-d)} ${n3(off)}`;
  const hg = S.haloGrain, gr = S.grain;
  const pal = paletteTables();
  const slope = 3 / S.halo;

  const filter =
`<filter id="${id}f" filterUnits="userSpaceOnUse" x="0" y="0" width="${n3(g.W)}" height="${n3(g.H)}" color-interpolation-filters="sRGB">` +
`<feTurbulence type="fractalNoise" baseFrequency="${n5(freq)}" numOctaves="2" seed="${S.seed}" result="w">${fA}</feTurbulence>` +
`<feDisplacementMap in="SourceGraphic" in2="w" scale="${n3(tScale.v)}" xChannelSelector="R" yChannelSelector="G" result="d">${tScale.a}</feDisplacementMap>` +
`<feGaussianBlur in="d" stdDeviation="${n3(tS1.v)}" result="b1">${tS1.a}</feGaussianBlur>` +
`<feGaussianBlur in="d" stdDeviation="${n3(tS2.v)}" result="b2">${tS2.a}</feGaussianBlur>` +
`<feComposite in="b1" in2="b2" operator="arithmetic" k2="${n3(S.crisp)}" k3="${n3(1 - S.crisp)}" result="v"/>` +
`<feColorMatrix in="v" values="${row} ${row} ${row} 0 0 0 0 1" result="i"/>` +
(o.fast && grainTile
  ? `<feImage href="${grainTile}" x="0" y="0" width="${GRAIN_T}" height="${GRAIN_T}" preserveAspectRatio="none" result="n0"/><feTile in="n0" result="n"/>`
  : `<feTurbulence type="fractalNoise" baseFrequency="1.1" seed="7" result="n"/>`) +
`<feComposite in="i" in2="n" operator="arithmetic" k2="1" k3="${n3(gr)}" k4="${n3(-gr / 2)}"/>` +
`<feComponentTransfer result="c"><feFuncR type="table" tableValues="${pal.r}"/><feFuncG type="table" tableValues="${pal.g}"/><feFuncB type="table" tableValues="${pal.b}"/></feComponentTransfer>` +
`<feComponentTransfer in="v"><feFuncA type="linear" slope="${n3(slope)}" intercept="-.04"/></feComponentTransfer>` +
`<feComposite in2="n" operator="arithmetic" k1="${n3(2 * hg)}" k2="${n3(1 - hg)}" result="a"/>` +
`<feComposite in="c" in2="a" operator="in"/>` +
`</filter>`;

  // --- mask image placement ---------------------------------------------------
  let img;
  if (src.vector) {
    const v = src.vector;
    img = { href: v.href, x: g.pad + v.x * g.Wc, y: g.pad + v.y * g.Hc, w: v.w * g.Wc, h: v.h * g.Hc };
  } else {
    img = { href: src.href, x: g.pad, y: g.pad, w: g.Wc, h: g.Hc };
  }

  const opAttr = tOp.v < 1 ? ` opacity="${n3(tOp.v)}"` : '';
  let body = `<g filter="url(#${id}f)"${opAttr}>${tOp.a}<rect width="${n3(g.W)}" height="${n3(g.H)}" fill="url(#${id}s)" mask="url(#${id}m)"/></g>`;

  // --- vanish mask: a ramp (or uniform level) + noise, thresholded into grain ---
  let vdefs = '';
  if (ci.vanish) {
    const W = g.W, H = g.H, B = Math.max(60, g.Wc * 0.55);
    const amp = vs.amp, sl = vs.slope, icp = n3(0.5 - 0.5 * sl);
    let fill = '';
    if (S.vanishDir === 'ltr' || S.vanishDir === 'rtl') {
      const ltr = S.vanishDir === 'ltr';
      const from = ltr ? [-B, 0] : [W, 0], to = ltr ? [W, 0] : [-B, 0];
      const tr = track('gradientTransform', [[0, from], [ci.tv0, from], [ci.tv1, to, SPL_IO], [ci.C, to]], ci, stat, t, 'translate');
      vdefs += `<linearGradient id="${id}vg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${n3(B)}" y2="0" gradientTransform="translate(${fmtV(tr.v)})">` +
        `<stop offset="0" stop-color="${ltr ? '#000' : '#fff'}"/><stop offset="1" stop-color="${ltr ? '#fff' : '#000'}"/>${tr.a}</linearGradient>`;
      fill = `<rect width="${n3(W)}" height="${n3(H)}" fill="url(#${id}vg)"/>`;
    } else if (S.vanishDir === 'center') {
      const R0 = 1, R1 = Math.hypot(W, H) / 2 / 0.6;
      const tr = track('r', [[0, R0], [ci.tv0, R0], [ci.tv1, R1, SPL_IO], [ci.C, R1]], ci, stat, t);
      vdefs += `<radialGradient id="${id}vg" gradientUnits="userSpaceOnUse" cx="${n3(W / 2)}" cy="${n3(H / 2)}" r="${n3(tr.v)}">` +
        `<stop offset="0" stop-color="#000"/><stop offset=".6" stop-color="#000"/><stop offset="1" stop-color="#fff"/>${tr.a}</radialGradient>`;
      fill = `<rect width="${n3(W)}" height="${n3(H)}" fill="url(#${id}vg)"/>`;
    } else {
      const tr = track('opacity', [[0, 1], [ci.tv0, 1], [ci.tv1, 0, SPL_IO], [ci.C, 0]], ci, stat, t);
      fill = `<rect width="${n3(W)}" height="${n3(H)}" fill="#000"/><rect width="${n3(W)}" height="${n3(H)}" fill="#fff" opacity="${n3(tr.v)}">${tr.a}</rect>`;
    }
    vdefs +=
      `<filter id="${id}vf" filterUnits="userSpaceOnUse" x="0" y="0" width="${n3(W)}" height="${n3(H)}" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency="${n5(vs.freq * 300 / g.Hc / Math.max(.35, src.thick))}" numOctaves="2" seed="${S.seed + 11}" result="vn"/>` +
      `<feColorMatrix in="vn" values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1"/>` +
      // fractal noise bunches around 0.5; stretch it so grains appear across the whole vanish
      `<feComponentTransfer result="vr"><feFuncR type="linear" slope="3.2" intercept="-1.1"/><feFuncG type="linear" slope="3.2" intercept="-1.1"/><feFuncB type="linear" slope="3.2" intercept="-1.1"/></feComponentTransfer>` +
      `<feComposite in="SourceGraphic" in2="vr" operator="arithmetic" k2="${n3(1 + amp)}" k3="${n3(amp)}" k4="${n3(-amp)}"/>` +
      `<feComponentTransfer><feFuncR type="linear" slope="${sl}" intercept="${icp}"/><feFuncG type="linear" slope="${sl}" intercept="${icp}"/><feFuncB type="linear" slope="${sl}" intercept="${icp}"/></feComponentTransfer>` +
      `</filter>` +
      `<mask id="${id}vm" maskUnits="userSpaceOnUse" x="0" y="0" width="${n3(W)}" height="${n3(H)}"><g filter="url(#${id}vf)">${fill}</g></mask>`;
    body = `<g mask="url(#${id}vm)">${body}</g>`;
    if (vs.rise) {
      const tr = track('transform', [[0, [0, 0]], [ci.tv0, [0, 0]], [ci.tv1, [0, -vs.rise * g.Hc], SPL_OUT], [ci.C, [0, -vs.rise * g.Hc]]], ci, stat, t, 'translate');
      body = `<g transform="translate(${fmtV(tr.v)})">${tr.a}${body}</g>`;
    }
  }
  const mask = `<mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${n3(g.W)}" height="${n3(g.H)}" mask-type="alpha" style="mask-type:alpha"><image href="${img.href}" x="${n3(img.x)}" y="${n3(img.y)}" width="${n3(img.w)}" height="${n3(img.h)}" preserveAspectRatio="none"/></mask>`;

  return { g, grad, filter: filter + vdefs, body, mask, img };
}
// Social frames: the logo is centred on a canvas of this aspect ratio.
const FRAMES = {
  original:  { label: 'Fit',   ar: null },
  square:    { label: '1:1',   ar: 1 },
  portrait:  { label: '4:5',   ar: 4 / 5 },
  story:     { label: '9:16',  ar: 9 / 16 },
  landscape: { label: '16:9',  ar: 16 / 9 },
};

function frameBox(frame) {
  const g = geom();
  const ar = FRAMES[frame] && FRAMES[frame].ar;
  if (!ar) return { x: 0, y: 0, w: g.W, h: g.H };
  const fill = 0.68; // logo may take up to this share of the frame in either direction
  const w = Math.max(g.Wc / fill, (g.Hc / fill) * ar, g.W, g.H * ar);
  const h = w / ar;
  return { x: (g.W - w) / 2, y: (g.H - h) / 2, w, h };
}

function exportSVG({ time = null, intro = true, width, height, bg, frame = 'original', fast = false } = {}) {
  const p = build({ id: 'ir', time, intro, fast });
  const b = frameBox(frame);
  const vb = `${n3(b.x)} ${n3(b.y)} ${n3(b.w)} ${n3(b.h)}`;
  const wh = width ? ` width="${width}" height="${height}"` : '';
  const bgRect = bg ? `<rect x="${n3(b.x)}" y="${n3(b.y)}" width="${n3(b.w)}" height="${n3(b.h)}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${wh}>${bgRect}<defs>${p.grad}${p.filter}${p.mask}</defs>${p.body}</svg>`;
}

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------
let raf = 0;
function schedule() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; renderPreview(); }); }

function renderPreview() {
  if (!src.href) return;
  const p = build({ id: 'pv', intro: true, fast: true });
  const { g, img } = p;
  svg.setAttribute('viewBox', `0 0 ${n3(g.W)} ${n3(g.H)}`);
  for (const [k, v] of Object.entries({ x: 0, y: 0, width: n3(g.W), height: n3(g.H) })) pvMask.setAttribute(k, v);
  if (pvImg.getAttribute('href') !== img.href) pvImg.setAttribute('href', img.href);
  pvImg.setAttribute('x', n3(img.x)); pvImg.setAttribute('y', n3(img.y));
  pvImg.setAttribute('width', n3(img.w)); pvImg.setAttribute('height', n3(img.h));
  pvDyn.innerHTML = `<defs>${p.grad}${p.filter}</defs>${p.body}`;
  canvasWrap.classList.toggle('checker', S.bgTransparent);
  canvasWrap.style.backgroundColor = S.bgTransparent ? '' : S.bg;
  fit();
}

// SVG filters cost per device pixel, every frame. The preview renders against a
// pixel budget (smaller on touch devices) and is scaled up with a compositor
// transform; a frame-rate governor lowers or raises resolution to hold ~60fps.
// The glow is soft, so the difference is hard to see. Exports always render at full size.
const COARSE = matchMedia('(pointer: coarse)').matches;
const PIXEL_BUDGET = COARSE ? 140000 : 520000;
let govScale = 1;
function fit() {
  const g = geom();
  const cs = getComputedStyle(canvasWrap);
  const aw = canvasWrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ah = canvasWrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const sc = Math.max(0.05, Math.min(aw / g.W, ah / g.H));
  const cw = Math.floor(g.W * sc), ch = Math.floor(g.H * sc);
  const dpr = window.devicePixelRatio || 1;
  const k = Math.min(dpr * 1.5, Math.max(1, Math.sqrt(cw * ch * dpr * dpr / PIXEL_BUDGET)) * govScale);
  svg.setAttribute('width', Math.max(1, Math.round(cw / k)));
  svg.setAttribute('height', Math.max(1, Math.round(ch / k)));
  svg.style.transform = k > 1.01 ? `scale(${n3(k)})` : '';
}
new ResizeObserver(() => fit()).observe(canvasWrap);

// Transport: a loop scrubber instead of an ever-growing clock.
const scrub = $('#scrub'), timeLabel = $('#timeLabel');
let scrubbing = false;
const loopLen = () => cycleInfo(true).C;
function setFill(el) {
  const min = +el.min || 0, max = +el.max || 1;
  el.style.setProperty('--p', ((el.value - min) / (max - min) * 100).toFixed(2) + '%');
}
let lastLabel = '', govFrames = 0, govT = performance.now(), govFast = 0;
(function tick(now) {
  const L = loopLen();
  const t = svg.getCurrentTime ? svg.getCurrentTime() : 0;
  const pos = t % L;
  if (!scrubbing) { scrub.value = pos / L; setFill(scrub); }
  const label = `${pos.toFixed(1)} / ${L.toFixed(1)}s`;
  if (label !== lastLabel) { timeLabel.textContent = label; lastLabel = label; }
  // Frame-rate governor (ignores throttled/background tabs and paused playback).
  govFrames++;
  if (now && now - govT >= 1000) {
    const fps = govFrames * 1000 / (now - govT);
    govFrames = 0; govT = now;
    if (document.visibilityState === 'visible' && !svg.animationsPaused() && !dlg.open && fps > 8) {
      if (fps < 45 && govScale < 2.2) { govScale = Math.min(2.2, govScale * 1.2); govFast = 0; fit(); }
      else if (fps > 57 && govScale > 1 && ++govFast >= 3) { govScale = Math.max(1, govScale / 1.12); govFast = 0; fit(); }
    }
  }
  requestAnimationFrame(tick);
})();
scrub.addEventListener('input', () => {
  scrubbing = true;
  const L = loopLen();
  const k = S.vanish ? 0 : S.intro ? Math.ceil(S.introDur / L) : 0; // land past a one-off intro
  svg.setCurrentTime(k * L + scrub.value * L);
  setFill(scrub);
});
scrub.addEventListener('change', () => { scrubbing = false; });

function togglePlay() {
  if (svg.animationsPaused()) svg.unpauseAnimations(); else svg.pauseAnimations();
  const paused = svg.animationsPaused(), b = $('#btnPlay');
  stage.classList.toggle('paused', paused);
  b.setAttribute('aria-label', paused ? 'Play' : 'Pause');
  b.title = `${paused ? 'Play' : 'Pause'} (Space)`;
}
function replay() {
  svg.setCurrentTime(0);
  if (svg.animationsPaused()) togglePlay();
}

// ---------------------------------------------------------------------------
// Source → alpha mask
// ---------------------------------------------------------------------------
function loadImg(url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('Unable to open that image in this browser. Save it as PNG or SVG and try again.'));
    im.src = url;
  });
}
function b64(str) { return btoa(unescape(encodeURIComponent(str))); }

function normalizeSvg(text) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg') throw new Error('Unable to read that SVG. Export it again from your design tool and retry.');
  const vb = (root.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  const bad = v => !v || /%/.test(v);
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
    if (bad(root.getAttribute('width')) || bad(root.getAttribute('height'))) {
      const sc = 1000 / Math.max(vb[2], vb[3]);
      root.setAttribute('width', vb[2] * sc);
      root.setAttribute('height', vb[3] * sc);
    }
  } else if (bad(root.getAttribute('width'))) {
    root.setAttribute('width', 1000); root.setAttribute('height', 1000);
  }
  if (!root.getAttribute('xmlns')) root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return new XMLSerializer().serializeToString(root);
}

// Any image the browser can decode: SVG (and gzipped SVGZ), PNG, JPG/JPEG, WebP, AVIF, GIF, BMP, ICO, TIFF/HEIC where supported.
const IMAGE_EXT = /\.(svgz?|png|jpe?g|jfif|webp|avif|gif|bmp|ico|tiff?|heic|heif)$/i;
const MAX_BYTES = 25 * 1024 * 1024;
let loadToken = 0, loadingName = null, fileInfo = null;
const fmtBytes = b => b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;
const fileKind = f => ((f.name.match(/\.([a-z0-9]+)$/i) || [])[1] || f.type.split('/')[1] || 'image').toUpperCase().replace('JPEG', 'JPG').replace('SVG+XML', 'SVG');

// Everything needed to put the previous logo back (failed upload, Undo).
function snapshot() {
  return { upload, fileInfo, src: { ...src }, maskMode: S.maskMode, threshold: S.threshold, sourceType: S.sourceType };
}
function restore(snap) {
  upload = snap.upload; fileInfo = snap.fileInfo; Object.assign(src, snap.src);
  S.maskMode = snap.maskMode; S.threshold = snap.threshold; S.sourceType = snap.sourceType;
  save(); renderPreview(); buildPanel();
}
function setLoading(name) { loadingName = name; buildPanel(); }

async function loadFile(file, { skipped = 0 } = {}) {
  if (!file) return;
  if (busy) { toast('Finish or cancel the export first, then add a new logo.', true); return; }
  if (!/^image\//.test(file.type) && !IMAGE_EXT.test(file.name)) { toast(`“${file.name}” isn’t an image. Choose an SVG, PNG, JPG, WebP or other image.`, true); return; }
  if (file.size > MAX_BYTES) { toast(`“${file.name}” is ${fmtBytes(file.size)}. Choose an image under 25 MB.`, true); return; }

  const token = ++loadToken;          // the newest file always wins
  const prev = snapshot();
  setLoading(file.name);
  try {
    const isSvgz = /\.svgz$/i.test(file.name);
    const isSvg = isSvgz || file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
    let url, svgUrl = null;
    if (isSvg) {
      const text = isSvgz
        ? await new Response(file.stream().pipeThrough(new DecompressionStream('gzip'))).text()
        : await file.text();
      url = svgUrl = 'data:image/svg+xml;base64,' + b64(normalizeSvg(text));
    } else {
      url = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
    }
    const img = await loadImg(url);
    if (token !== loadToken) return;

    upload = { img, svgUrl };
    fileInfo = { name: file.name, kind: fileKind(file), size: file.size, w: img.naturalWidth, h: img.naturalHeight, thumb: url };
    src.name = file.name;
    S.sourceType = 'upload';
    S.maskMode = 'auto';
    const ok = await processSource({ quiet: true });
    if (token !== loadToken) return;
    if (!ok) {
      loadingName = null; restore(prev);
      toast(`Unable to find a logo in “${file.name}”. It may be blank or a full photo. ${prev.upload ? 'Your previous logo is still here.' : ''}`, true);
      return;
    }
    loadingName = null;
    buildPanel(); replay();
    const extra = skipped ? ` ${skipped} other file${skipped > 1 ? 's were' : ' was'} skipped, one logo at a time.` : '';
    if (prev.upload && prev.fileInfo) {
      toast(`Replaced ${prev.fileInfo.name} with ${file.name}.${extra}`, false, { label: 'Undo', run: () => { restore(prev); replay(); toast(`Restored ${prev.fileInfo.name}`); } });
    } else {
      toast(`Added ${file.name}.${extra}`);
    }
  } catch (err) {
    console.error(err);
    if (token !== loadToken) return;
    loadingName = null; restore(prev);
    toast(`${err.message || 'Unable to read that file. Try an SVG, PNG, JPG or WebP.'}${prev.upload ? ' Your previous logo is still here.' : ''}`, true);
  }
}

function removeUpload() {
  if (!upload) return;
  const prev = snapshot();
  upload = null; fileInfo = null; src.vector = null; src.name = '';
  S.sourceType = 'text';
  save(); buildPanel(); processSource();
  toast(`Removed ${prev.fileInfo ? prev.fileInfo.name : 'your logo'}`, false, { label: 'Undo', run: () => { restore(prev); replay(); } });
}

async function drawSourceCanvas() {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (S.sourceType === 'text' || !upload) {
    const fs = 400;
    const font = `${S.weight} ${fs}px "${S.font}"`;
    try { await document.fonts.load(font, S.text); } catch (e) {}
    ctx.font = font;
    ctx.letterSpacing = `${S.letterSpacing / 100 * fs}px`;
    const m = ctx.measureText(S.text || ' ');
    c.width = Math.ceil(m.width + fs);
    c.height = Math.ceil(fs * 1.8);
    ctx.font = font;
    ctx.letterSpacing = `${S.letterSpacing / 100 * fs}px`;
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(S.text || ' ', fs / 2, fs * 1.25);
    return { c, ctx, mode: 'alpha', vectorUrl: null };
  }
  const { img, svgUrl } = upload;
  const nw = img.naturalWidth || 1000, nh = img.naturalHeight || 1000;
  const sc = svgUrl ? 1400 / Math.max(nw, nh) : Math.min(1, 2400 / Math.max(nw, nh));
  c.width = Math.max(1, Math.round(nw * sc));
  c.height = Math.max(1, Math.round(nh * sc));
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return { c, ctx, mode: null, vectorUrl: svgUrl };
}

function detectMode(d, w, h) {
  let trans = 0, cnt = 0;
  for (let i = 3; i < d.length; i += 16) { cnt++; if (d[i] < 235) trans++; }
  if (trans / cnt > 0.02) return 'alpha';
  let lum = 0, n = 0;
  const px = (x, y) => { const i = (y * w + x) * 4; lum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; n++; };
  for (let x = 0; x < w; x += 4) { px(x, 0); px(x, h - 1); }
  for (let y = 0; y < h; y += 4) { px(0, y); px(w - 1, y); }
  return lum / n > 0.5 ? 'dark' : 'light';
}

async function processSource({ quiet = false } = {}) {
  const { c, ctx, mode: forced, vectorUrl } = await drawSourceCanvas();
  const w = c.width, h = c.height;
  const id = ctx.getImageData(0, 0, w, h), d = id.data;
  const mode = forced || (S.maskMode === 'auto' ? detectMode(d, w, h) : S.maskMode);
  src.detected = mode;

  const lo = S.threshold - 0.12, hi = S.threshold + 0.12;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const A = d[i + 3] / 255;
      let v;
      if (mode === 'alpha') v = A;
      else {
        const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
        v = clamp(((mode === 'dark' ? 1 - l : l) - lo) / (hi - lo)) * A;
      }
      d[i] = d[i + 1] = d[i + 2] = 255;
      d[i + 3] = Math.round(v * 255);
      if (v > 0.03) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
  }
  if (maxX < 0) {
    if (!quiet) toast('Unable to find a logo with this mask. Open Fine-tune and choose another Logo mask option.', true);
    return false;
  }
  // Average stroke thickness ≈ 2 · area / perimeter. Used to keep the look
  // consistent between chunky lettering and thin wordmarks.
  let area = 0, edge = 0;
  const on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 127;
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    if (!on(x, y)) continue;
    area++;
    if (!on(x - 1, y) || !on(x + 1, y) || !on(x, y - 1) || !on(x, y + 1)) edge++;
  }
  ctx.putImageData(id, 0, 0);
  const bw = maxX - minX + 1, bh = maxY - minY + 1;
  const os = Math.min(1, 700 / bh, 3200 / bw);
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(bw * os));
  out.height = Math.max(1, Math.round(bh * os));
  out.getContext('2d').drawImage(c, minX, minY, bw, bh, 0, 0, out.width, out.height);

  src.href = out.toDataURL('image/png');
  src.aspect = bw / bh;
  src.thick = edge ? clamp((2 * area / edge) / bh / REF_THICK, 0.12, 2.5) : 1;
  // Keep SVG logos as vectors in the export when their transparency is the mask.
  src.vector = vectorUrl && mode === 'alpha'
    ? { href: vectorUrl, x: -minX / bw, y: -minY / bh, w: w / bw, h: h / bh }
    : null;
  renderPreview();
  const lbl = $('#detectedLabel');
  if (lbl) lbl.textContent = modeLabel(mode);
  return true;
}

const MODE_LABELS = { alpha: 'Transparency', dark: 'Dark logo on light bg', light: 'Light logo on dark bg' };
const modeLabel = m => MODE_LABELS[m] || m;

let srcT = 0;
function processSourceSoon() { clearTimeout(srcT); srcT = setTimeout(processSource, 120); }
// ---------------------------------------------------------------------------
// Panel — four things people actually play with up top, everything else
// tucked into "Fine-tune".
// ---------------------------------------------------------------------------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const decimals = step => step >= 1 ? 0 : step >= 0.1 ? 1 : 2;

// [key, label, min, max, step, leftCaption, rightCaption, format?]
const MOTION = [
  ['speed', 'Speed', 0.25, 3, 0.05, 'Slow', 'Fast', v => (+v).toFixed(2).replace(/\.?0+$/, '') + '×'],
  ['flow', 'Flow', 0, 12, 0.1, 'Still', 'Liquid'],
  ['stripeStrength', 'Shimmer', 0, 0.9, 0.01, 'Off', 'Bright'],
  ['softness', 'Glow', 3, 14, 0.1, 'Tight', 'Soft'],
];
const ADV = {
  shape: [
    ['crisp', 'Edge crispness', 0, 1, 0.01], ['depth', 'Depth', 0.4, 2.5, 0.01], ['shift', 'Tone shift', -0.6, 0.6, 0.01],
    ['halo', 'Halo size', 0.3, 3, 0.01], ['grain', 'Grain', 0, 0.3, 0.005], ['haloGrain', 'Halo grain', 0, 1, 0.01],
    ['padding', 'Padding', 0, 60, 1, null, null, v => v + '%'],
  ],
  shimmer: [
    ['stripeWidth', 'Band spacing', 0.3, 4, 0.05], ['stripeSharp', 'Band sharpness', 0, 1, 0.01],
    ['stripeAngle', 'Angle', -180, 180, 1, null, null, v => v + '°'], ['stripePasses', 'Passes per loop', 1, 6, 1],
  ],
  fluid: [['flowScale', 'Detail', 0.2, 4, 0.01], ['flowMorph', 'Movement', 0, 0.6, 0.01], ['flowCycles', 'Cycles per loop', 1, 6, 1]],
  intro: [
    ['introDur', 'Duration', 0.3, 5, 0.05, null, null, v => (+v).toFixed(1) + 's'],
    ['introSmear', 'Smear', 0, 100, 1], ['introMelt', 'Melt', 0, 40, 0.5],
  ],
  text: [['letterSpacing', 'Letter spacing', -15, 30, 0.5]],
  mask: [['threshold', 'Threshold', 0.05, 0.95, 0.01]],
};
const VANISH = [
  ['vanishDur', 'Vanish time', 0.4, 4, 0.05, 'Quick', 'Slow', v => (+v).toFixed(1) + 's'],
  ['vanishHold', 'Hold before vanishing', 0, 6, 0.1, 'Short', 'Long', v => (+v).toFixed(1) + 's'],
];
const DIR_ICONS = {
  ltr: '<path d="M3 10h12M11 6l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  rtl: '<path d="M17 10H5M9 6l-4 4 4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  center: '<circle cx="10" cy="10" r="2" fill="currentColor"/><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2.6"/>',
  all: '<rect x="3.5" y="5" width="13" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.4 2.4"/>',
};
const SLIDERS = Object.fromEntries([...MOTION, ...VANISH, ...Object.values(ADV).flat()].map(c => [c[0], c]));

function fmtVal(k) {
  const c = SLIDERS[k];
  if (!c) return S[k];
  return c[7] ? c[7](S[k]) : (+S[k]).toFixed(decimals(c[4]));
}
const sliderHTML = (c, showVal = true) => {
  const [key, label, min, max, step, l, r] = c;
  return `<label class="ctl">
    <span class="ctl-top"><span>${label}</span>${showVal ? `<output data-out="${key}"></output>` : ''}</span>
    <input type="range" data-key="${key}" min="${min}" max="${max}" step="${step}">
    ${l ? `<span class="ctl-ends"><span>${l}</span><span>${r}</span></span>` : ''}
  </label>`;
};
const toggleHTML = (key, label) => `<label class="toggle"><input type="checkbox" role="switch" class="switch" data-key="${key}"><span>${label}</span></label>`;
const palSwatch = stops => `radial-gradient(circle at 50% 50%, ${stops.map(([p, c]) => `${c} ${(12 + p * 60).toFixed(0)}%`).join(', ')}, #fff 92%)`;
const ICON_COPY = `<svg class="mi i-a" viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="7" width="9" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M13 4.5A1.5 1.5 0 0 0 11.5 3h-6A2.5 2.5 0 0 0 3 5.5v6A1.5 1.5 0 0 0 4.5 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const ICON_CHECK = `<svg class="mi i-b" viewBox="0 0 20 20" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_SHUFFLE = `<svg class="mi" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4.5h2.2c1.3 0 2.1.6 2.8 1.6l2 3c.7 1 1.5 1.6 2.8 1.6H14M2 11.5h2.2c1.3 0 2.1-.6 2.8-1.6M9 6.1c.7-1 1.5-1.6 2.8-1.6H14M12 2.5l2 2-2 2M12 9.5l2 2-2 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function buildPanel() {
  const up = S.sourceType === 'upload';
  const logo = `
    <section class="sec">
      <div class="sec-head"><h2 class="sec-title">Logo</h2></div>
      <div class="seg" role="group" aria-label="Logo source"><span class="seg-ind" aria-hidden="true"></span><button type="button" data-src="upload" class="${up ? 'on' : ''}" aria-pressed="${up}">Upload</button><button type="button" data-src="text" class="${up ? '' : 'on'}" aria-pressed="${!up}">Type text</button></div>
      ${up ? `
        ${loadingName ? `
        <div class="dropzone is-loading" aria-live="polite"><span class="spinner" aria-hidden="true"></span><b>Reading ${esc(loadingName)}…</b></div>
        ` : upload && fileInfo ? `
        <div class="file-card">
          <span class="file-thumb checker"><img src="${fileInfo.thumb}" alt=""></span>
          <span class="file-meta" title="${esc(fileInfo.name)} · ${fileInfo.w}×${fileInfo.h}px · ${fmtBytes(fileInfo.size)}"><b>${esc(fileInfo.name)}</b><span>${fileInfo.kind} · ${fmtBytes(fileInfo.size)}</span></span>
          <button type="button" class="btn btn-sm" id="replaceFile">Replace</button>
          <button type="button" class="icon-btn icon-btn-xs" id="removeFile" aria-label="Remove ${esc(fileInfo.name)}" title="Remove">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="note">Drop or paste another image anywhere to replace it. You can undo.</div>
        ` : `
        <div class="dropzone" id="dropzone" role="button" tabindex="0"><b>Choose a logo</b><span>Or drop or paste it anywhere</span></div>
        <div class="note">Any image works: SVG, PNG, JPG, WebP, AVIF, GIF and more. A transparent SVG or PNG gives the cleanest edges.</div>
        `}
      ` : `
        <label class="field"><span class="field-label">Text</span><input class="input" data-key="text" value="${esc(S.text)}" maxlength="40" placeholder="Acme" autocomplete="off" spellcheck="false"></label>
        <label class="field"><span class="field-label">Font</span><select class="input" data-key="font" data-font-preview>${FONTS.map(f => `<option${f === S.font ? ' selected' : ''}>${f}</option>`).join('')}</select></label>
      `}
    </section>`;

  const colors = `
    <section class="sec">
      <div class="sec-head"><h2 class="sec-title">Colors</h2><button type="button" class="btn btn-sm" id="shuffle" title="Pick a random look">${ICON_SHUFFLE}Shuffle</button></div>
      <div class="palettes">${Object.entries(PRESETS).map(([name, stops]) =>
        `<button type="button" class="pal${S.palette === name ? ' on' : ''}" data-pal="${name}" aria-pressed="${S.palette === name}"><i aria-hidden="true" style="background:${palSwatch(stops)}"></i>${name}</button>`).join('')}</div>
    </section>`;

  const motion = `
    <section class="sec">
      <div class="sec-head"><h2 class="sec-title">Motion</h2><span class="sec-hint" id="loopHint"></span></div>
      ${MOTION.map(c => sliderHTML(c, c[0] === 'speed')).join('')}
    </section>`;

  const vanish = `
    <section class="sec">
      <div class="sec-head"><h2 class="sec-title" id="vanishTitle">Vanish</h2>
        <label class="toggle" title="Letters vanish, then the logo plays again"><input type="checkbox" role="switch" class="switch" data-key="vanish" aria-labelledby="vanishTitle"></label></div>
      ${S.vanish ? `
        <div class="vanish-opts" id="vanishOpts">
          <div class="chips" role="group" aria-label="Vanish style">${Object.entries(VANISH_STYLES).map(([k, v]) =>
            `<button type="button" class="chip${S.vanishStyle === k ? ' on' : ''}" data-vstyle="${k}" aria-pressed="${S.vanishStyle === k}">${v.label}</button>`).join('')}</div>
          <div class="chips" role="group" aria-label="Direction">${Object.entries(VANISH_DIRS).map(([k, label]) =>
            `<button type="button" class="chip chip-icon${S.vanishDir === k ? ' on' : ''}" data-vdir="${k}" aria-pressed="${S.vanishDir === k}" aria-label="${label}" title="${label}"><svg class="mi" viewBox="0 0 20 20" aria-hidden="true">${DIR_ICONS[k]}</svg></button>`).join('')}</div>
          ${VANISH.map(c => sliderHTML(c)).join('')}
        </div>` : `<div class="note">Letters vanish, then the logo plays again. Made for looping posts.</div>`}
    </section>`;

  const bgOn = v => !S.bgTransparent && S.bg.toLowerCase() === v;
  const custom = !S.bgTransparent && !BACKGROUNDS.some(([, v]) => v === S.bg.toLowerCase());
  const background = `
    <section class="sec">
      <div class="sec-head"><h2 class="sec-title">Background</h2></div>
      <div class="swatches">
        ${BACKGROUNDS.map(([n, v]) => `<button type="button" class="sw${bgOn(v) ? ' on' : ''}" data-bg="${v}" title="${n}" aria-label="${n}" aria-pressed="${bgOn(v)}" style="background:${v}"></button>`).join('')}
        <button type="button" class="sw checker${S.bgTransparent ? ' on' : ''}" data-bgt title="Transparent" aria-label="Transparent" aria-pressed="${S.bgTransparent}"></button>
        <button type="button" class="sw sw-custom${custom ? ' on' : ''}" data-colorpick="bg" title="Custom colour" aria-label="Custom background colour" aria-haspopup="dialog" aria-expanded="false" aria-pressed="${custom}"></button>
      </div>
    </section>`;

  const stops = S.stops.map((s, i) => `
    <div class="stop">
      <button type="button" class="stop-color" data-colorpick="stop" data-i="${i}" style="background:${s[1]}" aria-label="Stop colour ${s[1]}" aria-haspopup="dialog" aria-expanded="false"></button>
      <input type="range" min="0" max="1" step="0.005" value="${s[0]}" data-stop-pos="${i}" aria-label="Stop position">
      <output>${Math.round(s[0] * 100)}%</output>
      <button type="button" class="x" data-stop-del="${i}" title="Remove"${S.stops.length <= 2 ? ' disabled' : ''}>×</button>
    </div>`).join('');

  const group = (label, inner) => `<div class="adv-group"><div class="adv-label">${label}</div>${inner}</div>`;
  const fine = `
    <details class="adv" id="adv"${advOpen ? ' open' : ''}>
      <summary>Fine-tune<span class="summary-hint">Gradient, intro, material and more</span></summary>
      <div class="adv-body">
        ${group('Gradient', `<div class="grad-bar" id="gradBar" style="background:${cssGradient(S.stops)}"></div>
          <div class="note">Left is the core of the shape, right is the outer halo.</div>
          <div class="stops">${stops}</div>
          <div class="btn-row"><button type="button" class="btn btn-sm" id="addStop">Add stop</button><button type="button" class="btn btn-sm" id="revStops">Reverse</button></div>`)}
        ${group('Intro', toggleHTML('intro', 'Melt in on start') + ADV.intro.map(c => sliderHTML(c)).join('') + `<div class="btn-row"><button type="button" class="btn btn-sm" id="replay2">Replay intro</button></div>`)}
        ${group('Material', ADV.shape.map(c => sliderHTML(c)).join(''))}
        ${group('Shimmer', ADV.shimmer.map(c => sliderHTML(c)).join('') + toggleHTML('stripeReverse', 'Reverse direction'))}
        ${group('Fluid', ADV.fluid.map(c => sliderHTML(c)).join('') + `<div class="btn-row"><button type="button" class="btn btn-sm" id="newSeed">Randomize flow</button></div>`)}
        ${up ? group('Logo mask', `<select class="input" data-key="maskMode" aria-label="Mask from">
            <option value="auto">Detect automatically</option><option value="alpha">Transparency</option>
            <option value="dark">Dark logo on light background</option><option value="light">Light logo on dark background</option></select>
            <div class="note">Detected: <span id="detectedLabel">${modeLabel(src.detected)}</span></div>
            ${src.detected !== 'alpha' ? ADV.mask.map(c => sliderHTML(c)).join('') : ''}`)
          : group('Text', `<select class="input" data-key="weight" aria-label="Weight">${[400, 500, 600, 700, 800].map(w => `<option value="${w}"${w == S.weight ? ' selected' : ''}>Weight ${w}</option>`).join('')}</select>` + ADV.text.map(c => sliderHTML(c)).join(''))}
        <div class="btn-row"><button type="button" class="btn btn-sm" id="resetAll">Reset everything</button></div>
      </div>
    </details>`;

  Kit.colorPicker.close();
  const prevSeg = lastSeg;
  panelEl.innerHTML = logo + colors + motion + vanish + background + fine;
  syncPanel();
  Kit.enhanceSelects(panelEl);
  // Segmented control: slide the pill from where it was.
  const seg = panelEl.querySelector('.seg');
  if (seg) {
    const now = up ? 0 : 1;
    seg.style.setProperty('--i', prevSeg ?? now);
    if (prevSeg != null && prevSeg !== now) requestAnimationFrame(() => requestAnimationFrame(() => seg.style.setProperty('--i', now)));
    else seg.style.setProperty('--i', now);
    lastSeg = now;
  }
}
let advOpen = false, lastSeg = null;

function syncPanel() {
  panelEl.querySelectorAll('[data-key]').forEach(el => {
    const k = el.dataset.key;
    if (el.type === 'checkbox') el.checked = !!S[k];
    else if (el.type !== 'text') el.value = S[k];
    if (el.type === 'range') setFill(el);
    const out = panelEl.querySelector(`[data-out="${k}"]`);
    if (out) out.textContent = fmtVal(k);
  });
  panelEl.querySelectorAll('[data-stop-pos]').forEach(setFill);
  const hint = $('#loopHint');
  if (hint) hint.textContent = `${loopLen().toFixed(1)}s loop`;
}

function onChange(k) {
  save();
  if (SOURCE_KEYS.has(k)) {
    processSourceSoon();
    if (k === 'maskMode') setTimeout(buildPanel, 200);
  } else schedule();
  if (k === 'speed' || k.startsWith('vanish') || k === 'intro' || k === 'introDur') { const h = $('#loopHint'); if (h) h.textContent = `${loopLen().toFixed(1)}s loop`; }
  if (k === 'vanish') {
    buildPanel();
    const o = $('#vanishOpts'); if (o) o.classList.add('reveal');
    panelEl.querySelector('[data-key="vanish"]').focus();
    svg.setCurrentTime(0);
  }
}

const panelEl = $('#panel');
panelEl.addEventListener('toggle', e => { if (e.target.id === 'adv') advOpen = e.target.open; }, true);
panelEl.addEventListener('input', e => {
  const el = e.target;
  if (el.type === 'range') setFill(el);
  if (el.dataset.key) {
    const k = el.dataset.key;
    if (el.type === 'checkbox') S[k] = el.checked;
    else if (el.type === 'range' || k === 'weight') S[k] = +el.value;
    else S[k] = el.value;
    const out = panelEl.querySelector(`[data-out="${k}"]`);
    if (out) out.textContent = fmtVal(k);
    onChange(k);
    return;
  }
  if (el.dataset.stopPos != null) {
    S.stops[+el.dataset.stopPos][0] = +el.value;
    el.nextElementSibling.textContent = Math.round(el.value * 100) + '%';
    stopsChanged();
  }
});

function stopsChanged() {
  S.palette = 'Custom';
  panelEl.querySelectorAll('.pal').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
  $('#gradBar').style.background = cssGradient(S.stops);
  save(); schedule();
}

const rnd = (a, b, step = 0.01) => Math.round((a + Math.random() * (b - a)) / step) * step;
function shuffle() {
  const names = Object.keys(PRESETS).filter(n => n !== S.palette && n !== 'Mono');
  const pal = names[Math.floor(Math.random() * names.length)];
  Object.assign(S, {
    palette: pal, stops: PRESETS[pal].map(s => s.slice()),
    speed: rnd(0.6, 1.6, 0.05), flow: rnd(1.5, 8, 0.1), stripeStrength: rnd(0.2, 0.6),
    softness: rnd(5.5, 10, 0.1), seed: 1 + Math.floor(Math.random() * 999),
    stripeAngle: [0, 0, -20, 20, 35, -35][Math.floor(Math.random() * 6)],
  });
  save(); buildPanel(); schedule();
}

panelEl.addEventListener('click', e => {
  const b = e.target.closest('button, #dropzone');
  if (!b) return;
  if (b.dataset.colorpick) {
    if (b.dataset.colorpick === 'bg') {
      Kit.colorPicker.open(b, S.bg, c => {
        S.bg = c; S.bgTransparent = false;
        panelEl.querySelectorAll('.sw').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
        save(); schedule();
      });
    } else {
      const i = +b.dataset.i;
      Kit.colorPicker.open(b, S.stops[i][1], c => {
        S.stops[i][1] = c; b.style.background = c; b.setAttribute('aria-label', `Stop colour ${c}`);
        stopsChanged();
      });
    }
    return;
  }
  if (b.dataset.src) {
    S.sourceType = b.dataset.src;
    buildPanel();
    if (S.sourceType === 'text' || upload) processSource();
    else $('#file').click();
    return;
  }
  if (b.id === 'dropzone' || b.id === 'replaceFile') { $('#file').click(); return; }
  if (b.id === 'removeFile') { removeUpload(); return; }
  if (b.dataset.pal) {
    S.palette = b.dataset.pal;
    S.stops = PRESETS[S.palette].map(s => s.slice());
    panelEl.querySelectorAll('.pal').forEach(p => { p.classList.toggle('on', p === b); p.setAttribute('aria-pressed', p === b); });
    if (advOpen) buildPanel();
    save(); schedule(); return;
  }
  if (b.dataset.bg) { S.bg = b.dataset.bg; S.bgTransparent = false; buildPanel(); save(); schedule(); return; }
  if (b.dataset.bgt != null) { S.bgTransparent = true; buildPanel(); save(); schedule(); return; }
  if (b.id === 'shuffle') { shuffle(); return; }
  if (b.dataset.vstyle || b.dataset.vdir) {
    const key = b.dataset.vstyle ? 'vanishStyle' : 'vanishDir';
    S[key] = b.dataset.vstyle || b.dataset.vdir;
    b.parentElement.querySelectorAll('.chip').forEach(c => { const on = c === b; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
    save(); schedule();
    // jump to just before the vanish so the change is visible right away
    const ci = cycleInfo(true);
    requestAnimationFrame(() => svg.setCurrentTime(Math.floor(svg.getCurrentTime() / ci.C) * ci.C + Math.max(0, ci.tv0 - 0.4)));
    return;
  }
  if (b.dataset.stopDel != null) { S.stops.splice(+b.dataset.stopDel, 1); S.palette = 'Custom'; buildPanel(); save(); schedule(); return; }
  if (b.id === 'addStop') {
    const st = sortedStops();
    let gap = 0, at = 0.5;
    for (let i = 1; i < st.length; i++) if (st[i][0] - st[i - 1][0] > gap) { gap = st[i][0] - st[i - 1][0]; at = (st[i][0] + st[i - 1][0]) / 2; }
    const c = sampleStops(st, at).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    S.stops.push([n3(at), '#' + c]);
    S.stops.sort((a, b) => a[0] - b[0]);
    S.palette = 'Custom'; buildPanel(); save(); schedule(); return;
  }
  if (b.id === 'revStops') { S.stops = S.stops.map(([p, c]) => [n3(1 - p), c]).sort((a, b) => a[0] - b[0]); S.palette = 'Custom'; buildPanel(); save(); schedule(); return; }
  if (b.id === 'newSeed') { S.seed = 1 + Math.floor(Math.random() * 999); save(); schedule(); return; }
  if (b.id === 'replay2') { replay(); return; }
  if (b.id === 'resetAll') {
    const keep = S.sourceType, ex = S.ex;
    S = structuredClone(DEFAULTS);
    S.ex = ex;
    if (upload) S.sourceType = keep;
    save(); buildPanel(); processSource(); return;
  }
});
panelEl.addEventListener('keydown', e => {
  if (e.target.id === 'dropzone' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); $('#file').click(); }
});

// ---------------------------------------------------------------------------
// Upload plumbing
// ---------------------------------------------------------------------------
$('#btnUpload').onclick = () => $('#file').click();
$('#file').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) loadFile(f); };
// Note: cancelling the file picker leaves the current logo untouched.
let dragDepth = 0;
window.addEventListener('dragenter', e => { if ([...e.dataTransfer.types].includes('Files')) { dragDepth++; document.body.classList.add('dragging'); } });
window.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; document.body.classList.remove('dragging'); } });
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => {
  e.preventDefault(); dragDepth = 0; document.body.classList.remove('dragging');
  const files = [...e.dataTransfer.files];
  if (files.length) { loadFile(files[0], { skipped: files.length - 1 }); return; }
  if ([...e.dataTransfer.types].some(t => t === 'text/uri-list' || t === 'text/html')) {
    toast('Save that image to your computer first, then drop the file here.', true);
  }
});
window.addEventListener('paste', e => {
  if (/INPUT|TEXTAREA/.test(document.activeElement.tagName) && !e.clipboardData?.files?.length) return;
  const files = [...(e.clipboardData?.files || [])];
  if (files.length) { e.preventDefault(); loadFile(files[0], { skipped: files.length - 1 }); }
});
window.addEventListener('keydown', e => {
  if (e.code === 'Space' && !dlg.open && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); togglePlay(); }
});
$('#btnPlay').onclick = togglePlay;
const btnSound = $('#btnSound');
function syncSound() {
  const on = Kit.sound.enabled;
  btnSound.setAttribute('aria-pressed', on);
  btnSound.title = on ? 'Sound on' : 'Sound off';
  btnSound.toggleAttribute('data-copied', !on); // reuses the icon-swap state
}
btnSound.onclick = () => { Kit.sound.enabled = !Kit.sound.enabled; syncSound(); if (Kit.sound.enabled) Kit.sound.toggle(true); };
syncSound();
$('#btnReplay').onclick = replay;

// ---------------------------------------------------------------------------
// Export: dropdown → dialog
// ---------------------------------------------------------------------------
function toast(msg, error = false, action = null) {
  const t = $('#toast');
  clearTimeout(t._t);
  t.classList.toggle('error', error);
  t.innerHTML = '';
  t.append(Object.assign(document.createElement('span'), { textContent: msg }));
  if (action) {
    const a = Object.assign(document.createElement('button'), { type: 'button', className: 'toast-x', textContent: action.label });
    a.onclick = () => { t.classList.remove('show'); action.run(); };
    t.append(a);
    t._t = setTimeout(() => t.classList.remove('show'), 6000);
  } else if (error) {
    const b = Object.assign(document.createElement('button'), { type: 'button', className: 'toast-x', textContent: 'Dismiss' });
    b.onclick = () => t.classList.remove('show');
    t.append(b);
  } else {
    t._t = setTimeout(() => t.classList.remove('show'), 2600);
  }
  t.classList.add('show');
  if (error) Kit.sound.error(); else if (/^(Copied|Downloaded)/.test(msg)) Kit.sound.success();
}
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function baseName() {
  const raw = S.sourceType === 'text' ? S.text : (src.name || 'logo').replace(/\.[^.]+$/, '');
  return ('iridescent-' + raw).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/-$/, '');
}
const even = v => Math.max(2, Math.round(v / 2) * 2);
const kb = bytes => { const k = bytes / 1024; return k < 10 ? k.toFixed(1) + ' KB' : k < 1024 ? Math.round(k) + ' KB' : (k / 1024).toFixed(1) + ' MB'; };

// Pixel size: social frames use quality as the short side; "Fit" uses it as the long side × 16/9.
function outSize(frame, q) {
  const b = frameBox(frame), ar = b.w / b.h;
  if (frame === 'original') {
    const long = q * 16 / 9;
    return ar >= 1 ? { w: even(long), h: even(long / ar) } : { w: even(long * ar), h: even(long) };
  }
  return ar >= 1 ? { w: even(q * ar), h: even(q) } : { w: even(q), h: even(q / ar) };
}
function gifSize(frame, long) {
  const b = frameBox(frame), ar = b.w / b.h;
  return ar >= 1 ? { w: even(long), h: even(long / ar) } : { w: even(long * ar), h: even(long) };
}
// Which slice of time an export covers. "custom" lets people grab any moment.
const maxTime = () => S.vanish ? loopLen() * 2 : (S.intro ? S.introDur : 0) + loopLen() * 3;
function range() {
  const L = loopLen(), ex = S.ex;
  if (ex.length === 'custom') return { t0: ex.start, dur: ex.dur, intro: S.intro };
  if (S.vanish) return { t0: 0, dur: L, intro: true }; // one full appear → vanish cycle
  if (ex.length === 'intro' && S.intro) return { t0: 0, dur: S.introDur + L, intro: true };
  return { t0: 0, dur: L, intro: false };
}
const duration = () => range().dur;

let copyT = 0;
async function copySVG() {
  try {
    const code = codeSVG();
    await navigator.clipboard.writeText(code);
    toast(`Copied SVG code (${kb(new Blob([code]).size)})`);
    // Copy → check icon swap, on the header button and the dialog button.
    document.querySelectorAll('[data-copied]').forEach(b => b.removeAttribute('data-copied'));
    document.querySelectorAll('#btnCopy, [data-do="copy"]').forEach(b => b.setAttribute('data-copied', ''));
    clearTimeout(copyT);
    copyT = setTimeout(() => document.querySelectorAll('[data-copied]').forEach(b => b.removeAttribute('data-copied')), 1600);
  } catch (e) { toast('Unable to copy. Your browser blocked clipboard access, so use Download .svg instead.', true); }
}

const btnExport = $('#btnExport'), btnCopy = $('#btnCopy');
btnExport.onclick = () => openExport(exTab);
btnCopy.onclick = () => copySVG();
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') { e.preventDefault(); copySVG(); }
});

const dlg = $('#exportDlg'), dlgOpts = $('#dlgOpts'), dlgFoot = $('#dlgFoot'), dlgImg = $('#dlgImg');
let exTab = 'video', busy = false, cancelled = false, previewUrl = null;

function openExport(tab) {
  exTab = tab;
  if (tab === 'image') S.ex.at = +(svg.getCurrentTime() % maxTime()).toFixed(2);
  dlg.classList.remove('closing');
  renderExport({ first: true });
  dlg.showModal();
  // The dialog has its own animated preview; don't render two behind a blurred backdrop.
  resumeAfterDialog = !svg.animationsPaused();
  if (resumeAfterDialog) svg.pauseAnimations();
  Kit.sound.open();
  requestAnimationFrame(() => moveTabIndicator(false));
}
// Exit: short and soft (opacity + small drop), then actually close.
function closeExport() {
  if (!dlg.open || dlg.classList.contains('closing')) return;
  if (busy) cancelled = true;
  Kit.sound.close();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { dlg.close(); return; }
  dlg.classList.add('closing');
  setTimeout(() => { dlg.classList.remove('closing'); dlg.close(); }, 160);
}
dlg.addEventListener('cancel', e => { e.preventDefault(); closeExport(); });
dlg.querySelector('.x-btn').addEventListener('click', e => { e.preventDefault(); closeExport(); });
let resumeAfterDialog = false;
dlg.addEventListener('close', () => {
  cancelled = true;
  if (resumeAfterDialog) { svg.unpauseAnimations(); resumeAfterDialog = false; }
  if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; dlgImg.removeAttribute('src'); }
});
dlg.addEventListener('click', e => { if (e.target === dlg && !busy) closeExport(); });

// Sliding pill behind the active tab.
function moveTabIndicator(animate = true) {
  const ind = $('#exportTabs .tab-ind'), t = $(`#exportTabs [data-tab="${exTab}"]`);
  if (!ind || !t) return;
  if (!animate) ind.style.transition = 'none';
  ind.style.width = t.offsetWidth + 'px';
  ind.style.translate = `${t.offsetLeft - 3}px 0`;
  if (!animate) { ind.offsetWidth; ind.style.transition = ''; }
}
$('#exportTabs').addEventListener('keydown', e => {
  const tabs = [...$('#exportTabs').querySelectorAll('[data-tab]')];
  const i = tabs.findIndex(t => t.dataset.tab === exTab);
  const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (next == null || busy) return;
  e.preventDefault();
  const t = tabs[(next + tabs.length) % tabs.length];
  exTab = t.dataset.tab; renderExport(); t.focus(); Kit.sound.press();
});
$('#exportTabs').addEventListener('click', e => {
  const b = e.target.closest('[data-tab]');
  if (b && !busy) { exTab = b.dataset.tab; renderExport(); }
});

const frameIcon = ar => {
  const w = ar >= 1 ? 14 : Math.round(14 * ar), h = ar >= 1 ? Math.round(14 / ar) : 14;
  return `<i class="ar" style="width:${w}px;height:${h}px"></i>`;
};
function chips(key, opts) {
  return `<div class="chips">${opts.map(([v, label]) =>
    `<button type="button" class="chip${String(S.ex[key]) === String(v) ? ' on' : ''}" data-ex="${key}" data-v="${v}" aria-pressed="${String(S.ex[key]) === String(v)}">${label}</button>`).join('')}</div>`;
}
const opt = (label, inner, hint = '', id = '') => `<div class="opt"><div class="opt-label">${label}${hint || id ? `<small${id ? ` id="${id}"` : ''}>${hint}</small>` : ''}</div>${inner}</div>`;
const frameChips = () => chips('frame', Object.entries(FRAMES).map(([k, f]) =>
  [k, `${frameIcon(f.ar || geom().W / geom().H)}${f.label}`]));
const timeSlider = (key, label, min, max, step) =>
  `<label class="ctl"><span class="ctl-top"><span>${label}</span><output data-exo="${key}">${(+S.ex[key]).toFixed(1)}s</output></span>
   <input type="range" data-exr="${key}" min="${min}" max="${max}" step="${step}" value="${S.ex[key]}"></label>`;
function lengthOpt() {
  const opts = [['loop', S.vanish ? 'Full cycle' : 'Loop']];
  if (S.intro && !S.vanish) opts.push(['intro', 'With intro']);
  opts.push(['custom', 'Custom']);
  if (S.ex.length === 'intro' && (!S.intro || S.vanish)) S.ex.length = 'loop';
  const custom = S.ex.length === 'custom'
    ? `<div class="well">${timeSlider('start', 'Start at', 0, n3(maxTime()), 0.1)}${timeSlider('dur', 'Duration', 0.5, 15, 0.1)}</div>` : '';
  return opt('Length', chips('length', opts) + custom, `${duration().toFixed(1)}s`, 'lenHint');
}
const solidBg = () => S.bgTransparent ? '#ffffff' : S.bg;
const bgChips = () => opt('Background', chips('transparent', [[true, 'Transparent'], [false, 'Solid']]));

function footMeta() {
  const ex = S.ex;
  if (exTab === 'video') { const { w, h } = outSize(ex.frame, ex.quality); return `MP4 · ${w}×${h} · ${duration().toFixed(1)}s`; }
  if (exTab === 'gif') { const { w, h } = gifSize(ex.frame, ex.gif); return `GIF · ${w}×${h} · ${duration().toFixed(1)}s`; }
  if (exTab === 'lottie') {
    const { w, h } = gifSize(ex.frame, ex.lottieSize);
    return `${ex.lottieFormat === 'dot' ? '.lottie' : 'Lottie JSON'} · ${w}×${h} · ${Math.round(duration() * ex.lottieFps)} frames`;
  }
  if (exTab === 'code') return `SVG · ${kb(new Blob([codeSVG()]).size)}`;
  const { w, h } = outSize(ex.frame, ex.quality);
  return `PNG · ${w}×${h} · at ${(+ex.at).toFixed(2)}s`;
}

const LOTIQLAB_URL = 'https://lotiqlab.com/?utm_source=iridescent&utm_medium=export_dialog&utm_campaign=lottie_tab';
const LOTIQLAB_BADGE = `
  <a class="promo" href="${LOTIQLAB_URL}" target="_blank" rel="noopener">
    <span class="promo-mark" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M4 15.5c3.5 0 4-11 7.5-11 1.6 0 2.5 1.3 3 2.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M7 10.25h6.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg></span>
    <span class="promo-text"><span class="promo-kicker">Powered by Lotiqlab</span><b>Edit this Lottie in Lotiqlab</b><span>Free Lottie editor: recolour, trim and convert in your browser</span></span>
    <svg class="promo-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 10.5l5-5M6 5.5h4.5V10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span class="sr-only">(opens in a new tab)</span>
  </a>`;
let renderedTab = null;
function renderExport(opts = {}) {
  const tabChanged = renderedTab !== exTab;
  renderedTab = exTab;
  $('#exportTabs').querySelectorAll('[data-tab]').forEach(b => {
    const on = b.dataset.tab === exTab;
    b.setAttribute('aria-selected', on);
    b.tabIndex = on ? 0 : -1;
  });
  const ex = S.ex;
  let html = '', btns = '';
  if (exTab === 'video') {
    html = opt('Frame', frameChips()) +
      opt('Quality', chips('quality', [[720, '720p'], [1080, '1080p'], [1440, '1440p']])) +
      opt('Frame rate', chips('fps', [[30, '30 fps'], [60, '60 fps']])) +
      lengthOpt() +
      (S.bgTransparent ? `<div class="note">Video can’t be transparent, so this uses a white background. Pick a background colour in the panel to change it.</div>` : '');
    btns = `<button type="button" class="btn btn-dark" data-do="mp4">Download MP4</button>`;
  } else if (exTab === 'gif') {
    html = opt('Frame', frameChips()) +
      opt('Size', chips('gif', [[480, 'Small'], [640, 'Medium'], [800, 'Large']])) +
      lengthOpt() +
      `<div class="note">GIFs are limited to 256 colours and get large. For social posts, MP4 looks better at about a tenth of the size.</div>`;
    btns = `<button type="button" class="btn btn-dark" data-do="gif">Download GIF</button>`;
  } else if (exTab === 'lottie') {
    html = opt('Format', chips('lottieFormat', [['dot', 'dotLottie (.lottie)'], ['json', 'Lottie JSON']])) +
      opt('Frame', frameChips()) +
      opt('Size', chips('lottieSize', [[360, 'Small'], [512, 'Medium'], [720, 'Large']])) +
      opt('Frame rate', chips('lottieFps', [[24, '24 fps'], [30, '30 fps']])) +
      lengthOpt() + bgChips() +
      `<div class="note">Plays the exact effect in any Lottie player, including web, iOS, Android, Webflow and Framer. Lottie can’t describe this effect as vector shapes, so each frame is stored as an image. Keep it short and small. dotLottie is compressed and usually much lighter.</div>`;
    html = LOTIQLAB_BADGE + html;
    btns = `<button type="button" class="btn btn-dark" data-do="lottie">Download ${ex.lottieFormat === 'dot' ? '.lottie' : 'JSON'}</button>`;
  } else if (exTab === 'code') {
    const code = codeSVG();
    const shown = code.replace(/(data:image\/[a-z+]+;base64,)[A-Za-z0-9+/=]+/g, (m, p) => `${p}…`);
    html = bgChips() +
      opt('Code', `<textarea class="code" readonly spellcheck="false">${esc(shown)}</textarea>`, 'Image data shortened') +
      `<div class="note">One self-contained animated file: use it as <code>&lt;img src="logo.svg"&gt;</code>, paste it inline into HTML, or drop it into Figma or Webflow. ${src.vector ? '' : 'Upload an SVG logo for a much smaller file.'} Press ⌘⇧C to copy it from anywhere.</div>`;
    btns = `<button type="button" class="btn" data-do="svg">Download .svg</button><button type="button" class="btn btn-dark" data-do="copy"><span class="swap">${ICON_COPY}${ICON_CHECK}</span>Copy code</button>`;
  } else {
    html = opt('Moment', `<div class="well">${timeSlider('at', 'Time', 0, n3(maxTime()), 0.01)}</div>`) +
      opt('Frame', frameChips()) +
      opt('Quality', chips('quality', [[720, '720p'], [1080, '1080p'], [1440, '1440p']])) +
      bgChips() +
      `<div class="note">Need every frame? Download frames saves a PNG sequence of the length below, ready for After Effects, Premiere or Keynote.</div>` +
      lengthOpt();
    btns = `<button type="button" class="btn" data-do="seq">Download frames</button><button type="button" class="btn btn-dark" data-do="png">Download PNG</button>`;
  }
  dlgOpts.innerHTML = html;
  dlgOpts.querySelectorAll('input[type=range]').forEach(setFill);
  dlgFoot.innerHTML = `<span class="meta" id="footMeta">${footMeta()}</span><div class="btns">${btns}</div>`;
  updateDlgPreview();
  if (tabChanged && !opts.first) {
    moveTabIndicator();
    for (const el of [dlgOpts, $('#dlgPreview')]) { el.classList.remove('swap-in'); el.offsetWidth; el.classList.add('swap-in'); }
  }
}

function exBg() {
  if (exTab === 'video' || exTab === 'gif') return solidBg();
  return S.ex.transparent ? null : solidBg();
}
function codeSVG() { return exportSVG({ intro: S.intro, bg: S.ex.transparent ? null : solidBg() }); }

function updateDlgPreview() {
  const frame = exTab === 'code' ? 'original' : S.ex.frame;
  const bg = exBg();
  const r = range();
  // Stills show the exact chosen moment; everything else previews the animation.
  const str = exTab === 'image'
    ? exportSVG({ time: +S.ex.at, intro: S.intro, bg, frame })
    : exportSVG({ intro: exTab === 'code' ? S.intro : r.intro, bg, frame });
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(new Blob([str], { type: 'image/svg+xml' }));
  dlgImg.src = previewUrl;
  dlgImg.classList.toggle('checker', !bg);
  const box = frameBox(frame), wide = box.w / box.h >= 1;
  dlgImg.style.aspectRatio = `${box.w} / ${box.h}`;
  dlgImg.style.width = wide ? '100%' : 'auto';
  dlgImg.style.height = wide ? 'auto' : '52vh';
}

dlgOpts.addEventListener('click', e => {
  const c = e.target.closest('[data-ex]');
  if (!c || busy) return;
  const k = c.dataset.ex, v = c.dataset.v;
  S.ex[k] = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v;
  save();
  // Structural options re-render; the rest update in place so state changes animate.
  if (['length', 'lottieFormat'].includes(k) || (k === 'transparent' && exTab === 'code')) {
    renderExport();
    const well = dlgOpts.querySelector('.well');
    if (k === 'length' && well) well.classList.add('reveal');
    return;
  }
  c.parentElement.querySelectorAll('.chip').forEach(ch => { const on = ch === c; ch.classList.toggle('on', on); ch.setAttribute('aria-pressed', on); });
  $('#footMeta').textContent = footMeta();
  const hint = $('#lenHint'); if (hint) hint.textContent = `${duration().toFixed(1)}s`;
  updateDlgPreview();
});
let dlgRaf = 0;
dlgOpts.addEventListener('input', e => {
  const el = e.target;
  if (!el.dataset.exr || busy) return;
  const k = el.dataset.exr;
  S.ex[k] = +el.value;
  setFill(el);
  const out = dlgOpts.querySelector(`[data-exo="${k}"]`);
  if (out) out.textContent = (+el.value).toFixed(k === 'at' ? 2 : 1) + 's';
  const hint = $('#lenHint'); if (hint) hint.textContent = `${duration().toFixed(1)}s`;
  $('#footMeta').textContent = footMeta();
  save();
  if (k === 'at' && !dlgRaf) dlgRaf = requestAnimationFrame(() => { dlgRaf = 0; updateDlgPreview(); });
});
dlgFoot.addEventListener('click', e => {
  const b = e.target.closest('[data-do]');
  if (b) { doExport(b.dataset.do); return; }
  if (e.target.closest('#cancelExport')) cancelled = true;
});

const prog = {
  show(title) {
    busy = true; cancelled = false;
    dlgFoot.innerHTML = `<span class="meta" role="status">${title}</span><div class="bar" role="progressbar" aria-label="${title}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="progBar"></span></div><button type="button" class="btn" id="cancelExport">Cancel</button>`;
  },
  set(p) {
    const bar = $('#progBar');
    if (!bar) return;
    bar.style.width = (p * 100).toFixed(1) + '%';
    bar.parentElement.setAttribute('aria-valuenow', Math.round(p * 100));
  },
  hide() { busy = false; if (dlg.open) renderExport(); },
};

async function renderFrame(ctx, w, h, t, intro, bg, frame) {
  const str = exportSVG({ time: t, intro, width: w, height: h, bg, frame });
  const url = URL.createObjectURL(new Blob([str], { type: 'image/svg+xml' }));
  try {
    const img = await loadImg(url);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
  } finally { URL.revokeObjectURL(url); }
}
const toPng = c => new Promise(r => c.toBlob(r, 'image/png'));
const blobToDataURL = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });

// Frame-by-frame Lottie: one image layer per frame, each visible for exactly one frame.
function lottieDoc(w, h, fps, assets) {
  const tr = { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [w / 2, h / 2, 0] }, a: { a: 0, k: [w / 2, h / 2, 0] }, s: { a: 0, k: [100, 100, 100] } };
  return {
    v: '5.7.4', fr: fps, ip: 0, op: assets.length, w, h, nm: baseName(), ddd: 0, assets,
    layers: assets.map((a, i) => ({ ddd: 0, ind: i + 1, ty: 2, nm: a.id, refId: a.id, sr: 1, ks: tr, ao: 0, ip: i, op: i + 1, st: 0, bm: 0 })),
    markers: [],
  };
}

async function doExport(kind) {
  if (!src.href || busy) return;
  const ex = S.ex, r = range();
  try {
    if (kind === 'svg') { download(new Blob([codeSVG()], { type: 'image/svg+xml' }), baseName() + '.svg'); toast('Downloaded SVG'); return; }
    if (kind === 'copy') { await copySVG(); return; }

    const c = document.createElement('canvas');
    const ctx = c.getContext('2d', { willReadFrequently: kind === 'gif' });

    if (kind === 'png') {
      const { w, h } = outSize(ex.frame, ex.quality);
      c.width = w; c.height = h;
      await renderFrame(ctx, w, h, +ex.at, S.intro, exBg(), ex.frame);
      download(await toPng(c), `${baseName()}-${(+ex.at).toFixed(2)}s.png`);
      toast('Downloaded PNG');
      return;
    }

    if (kind === 'mp4') {
      if (!('VideoEncoder' in window)) { toast('Unable to make MP4 in this browser. Use Chrome, Edge or Safari 17 or later.', true); return; }
      const { w, h } = outSize(ex.frame, ex.quality), fps = ex.fps;
      const frames = Math.max(1, Math.round(r.dur * fps));
      c.width = w; c.height = h;
      prog.show('Rendering video…');
      const { Muxer, ArrayBufferTarget } = await import('https://cdn.jsdelivr.net/npm/mp4-muxer@5/+esm');
      const cfg = { codec: 'avc1.640033', width: w, height: h, bitrate: Math.round(w * h * fps * 0.2), framerate: fps };
      if (!(await VideoEncoder.isConfigSupported(cfg)).supported) throw new Error('this browser can’t encode video at that size. Choose a lower quality');
      const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width: w, height: h }, fastStart: 'in-memory' });
      let encErr = null;
      const enc = new VideoEncoder({ output: (ch, meta) => muxer.addVideoChunk(ch, meta), error: e => { encErr = e; } });
      enc.configure(cfg);
      for (let i = 0; i < frames; i++) {
        if (cancelled || encErr) break;
        await renderFrame(ctx, w, h, r.t0 + i / fps, r.intro, solidBg(), ex.frame);
        const vf = new VideoFrame(c, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) });
        enc.encode(vf, { keyFrame: i % (fps * 2) === 0 });
        vf.close();
        if (enc.encodeQueueSize > 8) await new Promise(res => setTimeout(res, 0));
        prog.set((i + 1) / frames);
      }
      await enc.flush(); enc.close();
      if (encErr) throw encErr;
      if (!cancelled) { muxer.finalize(); download(new Blob([muxer.target.buffer], { type: 'video/mp4' }), baseName() + '.mp4'); toast('Downloaded MP4'); }
      prog.hide();
      return;
    }

    if (kind === 'gif') {
      const { w, h } = gifSize(ex.frame, ex.gif), fps = 25;
      const frames = Math.max(1, Math.round(r.dur * fps));
      c.width = w; c.height = h;
      prog.show('Rendering GIF…');
      const { GIFEncoder, quantize, applyPalette } = await import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm');
      const gif = GIFEncoder();
      for (let i = 0; i < frames; i++) {
        if (cancelled) break;
        await renderFrame(ctx, w, h, r.t0 + i / fps, r.intro, solidBg(), ex.frame);
        const data = ctx.getImageData(0, 0, w, h).data;
        const palette = quantize(data, 256);
        gif.writeFrame(applyPalette(data, palette), w, h, { palette, delay: 1000 / fps });
        prog.set((i + 1) / frames);
        await new Promise(res => setTimeout(res, 0));
      }
      if (!cancelled) { gif.finish(); download(new Blob([gif.bytes()], { type: 'image/gif' }), baseName() + '.gif'); toast('Downloaded GIF'); }
      prog.hide();
      return;
    }

    if (kind === 'lottie') {
      const dot = ex.lottieFormat === 'dot';
      const { w, h } = gifSize(ex.frame, ex.lottieSize), fps = ex.lottieFps;
      const frames = Math.max(1, Math.round(r.dur * fps));
      c.width = w; c.height = h;
      prog.show(`Rendering ${dot ? 'dotLottie' : 'Lottie'}…`);
      const { zipSync, strToU8 } = await import('https://cdn.jsdelivr.net/npm/fflate@0.8.2/+esm');
      const assets = [], files = {};
      for (let i = 0; i < frames; i++) {
        if (cancelled) break;
        await renderFrame(ctx, w, h, r.t0 + i / fps, r.intro, exBg(), ex.frame);
        const png = await toPng(c);
        const name = `frame_${String(i).padStart(4, '0')}.png`, id = `f${i}`;
        if (dot) {
          files['i/' + name] = [new Uint8Array(await png.arrayBuffer()), { level: 0 }];
          assets.push({ id, w, h, u: '/i/', p: name, e: 0 });
        } else {
          assets.push({ id, w, h, u: '', p: await blobToDataURL(png), e: 1 });
        }
        prog.set((i + 1) / frames);
      }
      if (!cancelled) {
        const json = JSON.stringify(lottieDoc(w, h, fps, assets));
        if (dot) {
          files['manifest.json'] = strToU8(JSON.stringify({ version: '2', generator: 'Iridescent', animations: [{ id: 'iridescent' }] }));
          files['a/iridescent.json'] = strToU8(json);
          download(new Blob([zipSync(files, { level: 6 })], { type: 'application/zip' }), baseName() + '.lottie');
        } else {
          download(new Blob([json], { type: 'application/json' }), baseName() + '.json');
        }
        toast('Downloaded Lottie');
      }
      prog.hide();
      return;
    }

    if (kind === 'seq') {
      const { w, h } = outSize(ex.frame, ex.quality), fps = 30;
      const frames = Math.max(1, Math.round(r.dur * fps));
      c.width = w; c.height = h;
      prog.show('Rendering frames…');
      const { zipSync } = await import('https://cdn.jsdelivr.net/npm/fflate@0.8.2/+esm');
      const files = {};
      for (let i = 0; i < frames; i++) {
        if (cancelled) break;
        await renderFrame(ctx, w, h, r.t0 + i / fps, r.intro, exBg(), ex.frame);
        files[`frame_${String(i).padStart(4, '0')}.png`] = [new Uint8Array(await (await toPng(c)).arrayBuffer()), { level: 0 }];
        prog.set((i + 1) / frames);
      }
      if (!cancelled) { download(new Blob([zipSync(files)], { type: 'application/zip' }), `${baseName()}-${fps}fps.zip`); toast('Downloaded frames'); }
      prog.hide();
    }
  } catch (err) {
    console.error(err);
    prog.hide();
    toast(`Unable to export. ${err.message ? err.message.replace(/^./, c => c.toUpperCase()) + '.' : 'Try a smaller size or a shorter length.'}`, true);
  }
}

// ---------------------------------------------------------------------------
// Live visitors — WebSocket to a Cloudflare Durable Object that counts open
// connections. The pill stays hidden when the endpoint is unavailable.
// ---------------------------------------------------------------------------
(function presence() {
  if (!('WebSocket' in window) || /^(localhost|127\.|file)/.test(location.hostname || 'file')) return;
  const pill = $('#livePill'), count = $('#liveCount'), label = $('#liveLabel');
  let ws, retry = 1000, shown = 0;
  function show(n) {
    if (n === shown) return;
    shown = n;
    count.textContent = n;
    label.textContent = n === 1 ? 'online now' : 'online now';
    pill.title = n === 1 ? 'You’re the only one here right now' : `${n} people are using Iridescent right now`;
    if (pill.hidden) { pill.hidden = false; requestAnimationFrame(() => pill.classList.add('in')); }
    count.classList.remove('bump'); count.offsetWidth; count.classList.add('bump');
  }
  function connect() {
    try { ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/presence`); }
    catch (e) { return; }
    ws.onmessage = e => { try { const d = JSON.parse(e.data); if (typeof d.online === 'number') show(Math.max(1, d.online)); } catch (err) {} };
    ws.onopen = () => { retry = 1000; };
    ws.onclose = () => { if (retry < 60000) setTimeout(connect, retry *= 2); };
  }
  connect();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ws && ws.readyState > 1) { retry = 1000; connect(); }
  });
})();

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
// Console helpers: iridescent.set({ flow: 6 }), iridescent.svg()
window.iridescent = {
  get settings() { return structuredClone(S); },
  get source() { return { aspect: src.aspect, thickness: src.thick, mask: src.detected, vector: !!src.vector }; },
  set(o) { Object.assign(S, o); save(); buildPanel(); Object.keys(o).some(k => SOURCE_KEYS.has(k)) ? processSource() : schedule(); },
  svg: () => codeSVG(),
  svgAt: (t, intro = true, w = 800) => exportSVG({ time: t, intro, width: w, height: Math.round(w * geom().H / geom().W) }),
  frameSVG: (t, w = 800) => exportSVG({ time: t, intro: true, width: w, height: Math.round(w * geom().H / geom().W), fast: true }),
  copy: copySVG,
  open: openExport,
  export: doExport,
};

buildPanel();
panelEl.classList.add('entering');
setTimeout(() => panelEl.classList.remove('entering'), 1100);
document.fonts.ready.then(processSource);
processSource();

})();

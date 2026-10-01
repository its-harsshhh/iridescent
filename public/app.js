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
  palette: 'Iridescent', stops: PRESETS.Iridescent.map(s => s.slice()),
  bg: '#ffffff', bgTransparent: false, padding: 10,
  ex: { frame: 'square', quality: 1080, fps: 30, length: 'loop', gif: 640, transparent: true },
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
function geom() {
  const Hc = HC, Wc = HC * src.aspect;
  const sig2 = S.softness / 100 * Hc * src.thick;
  const scale = S.flow / 100 * Hc * 2 * Math.sqrt(src.thick);
  const pad = Math.ceil(sig2 * (2 + S.halo) + scale * 0.6 + S.padding / 100 * Hc);
  return { Wc, Hc, pad, W: Wc + 2 * pad, H: Hc + 2 * pad, sig2, sig1: sig2 * 0.3, scale };
}

function build(o) {
  const g = geom();
  const id = o.id;
  const stat = o.time != null;
  const t = o.time || 0;
  const introOn = !!(o.intro && S.intro);
  const ID = S.introDur;
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

  // --- intro ----------------------------------------------------------------
  const smear = S.introSmear / 100 * g.Hc * 2 * Math.sqrt(src.thick), melt = S.introMelt / 100 * g.Hc * src.thick;
  const e = introOn && stat ? EASE_INTRO(clamp(t / ID)) : 1;
  const k = introOn && stat;
  const scaleV = k ? lerp(smear, g.scale, e) : g.scale;
  const s1V = k ? g.sig1 + melt * .6 * (1 - e) : g.sig1;
  const s2V = k ? g.sig2 + melt * (1 - e) : g.sig2;
  const opV = k ? clamp(t / (ID * .45)) : 1;
  const ia = (attr, from, to) => introOn && !stat
    ? `<animate attributeName="${attr}" values="${n3(from)};${n3(to)}" keyTimes="0;1" calcMode="spline" keySplines="${SPL_INTRO}" dur="${n3(ID)}s" fill="freeze"/>`
    : '';

  // --- colour ---------------------------------------------------------------
  const d = S.depth, s = S.stripeStrength, off = d + S.shift;
  const row = `${n3(s)} 0 0 ${n3(-d)} ${n3(off)}`;
  const hg = S.haloGrain, gr = S.grain;
  const pal = paletteTables();
  const slope = 3 / S.halo;

  const filter =
`<filter id="${id}f" filterUnits="userSpaceOnUse" x="0" y="0" width="${n3(g.W)}" height="${n3(g.H)}" color-interpolation-filters="sRGB">` +
`<feTurbulence type="fractalNoise" baseFrequency="${n5(freq)}" numOctaves="2" seed="${S.seed}" result="w">${fA}</feTurbulence>` +
`<feDisplacementMap in="SourceGraphic" in2="w" scale="${n3(scaleV)}" xChannelSelector="R" yChannelSelector="G" result="d">${ia('scale', smear, g.scale)}</feDisplacementMap>` +
`<feGaussianBlur in="d" stdDeviation="${n3(s1V)}" result="b1">${ia('stdDeviation', g.sig1 + melt * .6, g.sig1)}</feGaussianBlur>` +
`<feGaussianBlur in="d" stdDeviation="${n3(s2V)}" result="b2">${ia('stdDeviation', g.sig2 + melt, g.sig2)}</feGaussianBlur>` +
`<feComposite in="b1" in2="b2" operator="arithmetic" k2="${n3(S.crisp)}" k3="${n3(1 - S.crisp)}" result="v"/>` +
`<feColorMatrix in="v" values="${row} ${row} ${row} 0 0 0 0 1" result="i"/>` +
`<feTurbulence type="fractalNoise" baseFrequency="1.1" seed="7" result="n"/>` +
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

  const opAttr = stat ? (opV < 1 ? ` opacity="${n3(opV)}"` : '') : '';
  const opAnim = introOn && !stat ? `<animate attributeName="opacity" values="0;1" dur="${n3(ID * .45)}s" fill="freeze"/>` : '';
  const body = `<g filter="url(#${id}f)"${opAttr}>${opAnim}<rect width="${n3(g.W)}" height="${n3(g.H)}" fill="url(#${id}s)" mask="url(#${id}m)"/></g>`;
  const mask = `<mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${n3(g.W)}" height="${n3(g.H)}" mask-type="alpha" style="mask-type:alpha"><image href="${img.href}" x="${n3(img.x)}" y="${n3(img.y)}" width="${n3(img.w)}" height="${n3(img.h)}" preserveAspectRatio="none"/></mask>`;

  return { g, grad, filter, body, mask, img };
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

function exportSVG({ time = null, intro = true, width, height, bg, frame = 'original' } = {}) {
  const p = build({ id: 'ir', time, intro });
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
  const p = build({ id: 'pv', intro: true });
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

function fit() {
  const g = geom();
  const cs = getComputedStyle(canvasWrap);
  const aw = canvasWrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ah = canvasWrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const sc = Math.max(0.05, Math.min(aw / g.W, ah / g.H));
  svg.setAttribute('width', Math.floor(g.W * sc));
  svg.setAttribute('height', Math.floor(g.H * sc));
}
new ResizeObserver(() => fit()).observe(canvasWrap);

// Transport: a loop scrubber instead of an ever-growing clock.
const scrub = $('#scrub'), timeLabel = $('#timeLabel');
let scrubbing = false;
const loopLen = () => BASE_LOOP / S.speed;
function setFill(el) {
  const min = +el.min || 0, max = +el.max || 1;
  el.style.setProperty('--p', ((el.value - min) / (max - min) * 100).toFixed(2) + '%');
}
(function tick() {
  const L = loopLen();
  const t = svg.getCurrentTime ? svg.getCurrentTime() : 0;
  const pos = t % L;
  if (!scrubbing) { scrub.value = pos / L; setFill(scrub); }
  timeLabel.textContent = `${pos.toFixed(1)} / ${L.toFixed(1)}s`;
  requestAnimationFrame(tick);
})();
scrub.addEventListener('input', () => {
  scrubbing = true;
  const L = loopLen();
  const k = S.intro ? Math.ceil(S.introDur / L) : 0; // land past the intro
  svg.setCurrentTime(k * L + scrub.value * L);
  setFill(scrub);
});
scrub.addEventListener('change', () => { scrubbing = false; });

function togglePlay() {
  if (svg.animationsPaused()) svg.unpauseAnimations(); else svg.pauseAnimations();
  stage.classList.toggle('paused', svg.animationsPaused());
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
    im.onerror = () => rej(new Error('Could not load image'));
    im.src = url;
  });
}
function b64(str) { return btoa(unescape(encodeURIComponent(str))); }

function normalizeSvg(text) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg') throw new Error('Not a valid SVG file');
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

async function loadFile(file) {
  if (!file || !/^image\//.test(file.type) && !/\.svg$/i.test(file.name)) { toast('Please choose an image file'); return; }
  try {
    const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
    let url, svgUrl = null;
    if (isSvg) {
      url = svgUrl = 'data:image/svg+xml;base64,' + b64(normalizeSvg(await file.text()));
    } else {
      url = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
    }
    const img = await loadImg(url);
    upload = { img, svgUrl };
    src.name = file.name;
    S.sourceType = 'upload';
    S.maskMode = 'auto';
    await processSource();
    buildPanel();
    replay();
    toast(`Loaded ${file.name}`);
  } catch (err) {
    console.error(err);
    toast(err.message || 'Could not read that file');
  }
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

async function processSource() {
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
  if (maxX < 0) { toast('Nothing visible in that image — try another mask mode'); return; }
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
const SLIDERS = Object.fromEntries([...MOTION, ...Object.values(ADV).flat()].map(c => [c[0], c]));

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
const toggleHTML = (key, label) => `<label class="toggle"><input type="checkbox" data-key="${key}"> ${label}</label>`;
const palSwatch = stops => `radial-gradient(circle at 50% 50%, ${stops.map(([p, c]) => `${c} ${(12 + p * 60).toFixed(0)}%`).join(', ')}, #fff 92%)`;
const ICON_SHUFFLE = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 4.5h2.2c1.3 0 2.1.6 2.8 1.6l2 3c.7 1 1.5 1.6 2.8 1.6H14M2 11.5h2.2c1.3 0 2.1-.6 2.8-1.6M9 6.1c.7-1 1.5-1.6 2.8-1.6H14M12 2.5l2 2-2 2M12 9.5l2 2-2 2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function buildPanel() {
  const up = S.sourceType === 'upload';
  const logo = `
    <section class="sec">
      <div class="sec-head"><span class="sec-title">Logo</span></div>
      <div class="seg"><button type="button" data-src="upload" class="${up ? 'on' : ''}">Upload</button><button type="button" data-src="text" class="${up ? '' : 'on'}">Type text</button></div>
      ${up ? `
        <div class="dropzone" id="dropzone" role="button" tabindex="0">
          ${upload ? `<b>${esc(src.name)}</b><span>Click or drop to replace</span>` : `<b>Choose your logo</b><span>or drop / paste it anywhere</span>`}
        </div>
        <div class="note">Transparent PNG or SVG gives the cleanest result.</div>
      ` : `
        <input class="input" data-key="text" value="${esc(S.text)}" maxlength="40" aria-label="Text" placeholder="Type something">
        <select class="input" data-key="font" aria-label="Font">${FONTS.map(f => `<option${f === S.font ? ' selected' : ''}>${f}</option>`).join('')}</select>
      `}
    </section>`;

  const colors = `
    <section class="sec">
      <div class="sec-head"><span class="sec-title">Colors</span><button type="button" class="btn btn-sm" id="shuffle" title="Random look">${ICON_SHUFFLE} Shuffle</button></div>
      <div class="palettes">${Object.entries(PRESETS).map(([name, stops]) =>
        `<button type="button" class="pal${S.palette === name ? ' on' : ''}" data-pal="${name}" title="${name}"><i style="background:${palSwatch(stops)}"></i>${name}</button>`).join('')}</div>
    </section>`;

  const motion = `
    <section class="sec">
      <div class="sec-head"><span class="sec-title">Motion</span><span class="sec-hint" id="loopHint"></span></div>
      ${MOTION.map(c => sliderHTML(c, c[0] === 'speed')).join('')}
    </section>`;

  const bgOn = v => !S.bgTransparent && S.bg.toLowerCase() === v;
  const custom = !S.bgTransparent && !BACKGROUNDS.some(([, v]) => v === S.bg.toLowerCase());
  const background = `
    <section class="sec">
      <div class="sec-head"><span class="sec-title">Background</span></div>
      <div class="swatches">
        ${BACKGROUNDS.map(([n, v]) => `<button type="button" class="sw${bgOn(v) ? ' on' : ''}" data-bg="${v}" title="${n}" style="background:${v}"></button>`).join('')}
        <button type="button" class="sw checker${S.bgTransparent ? ' on' : ''}" data-bgt title="Transparent"></button>
        <label class="sw sw-custom${custom ? ' on' : ''}" title="Custom colour"><input type="color" data-key="bg" value="${S.bg}"></label>
      </div>
    </section>`;

  const stops = S.stops.map((s, i) => `
    <div class="stop">
      <input type="color" value="${s[1]}" data-stop-color="${i}" aria-label="Stop colour">
      <input type="range" min="0" max="1" step="0.005" value="${s[0]}" data-stop-pos="${i}" aria-label="Stop position">
      <output>${Math.round(s[0] * 100)}%</output>
      <button type="button" class="x" data-stop-del="${i}" title="Remove"${S.stops.length <= 2 ? ' disabled' : ''}>×</button>
    </div>`).join('');

  const group = (label, inner) => `<div class="adv-group"><div class="adv-label">${label}</div>${inner}</div>`;
  const fine = `
    <details class="adv" id="adv"${advOpen ? ' open' : ''}>
      <summary>Fine-tune</summary>
      <div class="adv-body">
        ${group('Gradient', `<div class="grad-bar" id="gradBar" style="background:${cssGradient(S.stops)}"></div>
          <div class="note">Left = core of the shape · right = outer halo</div>
          <div class="stops">${stops}</div>
          <div class="btn-row"><button type="button" class="btn btn-sm" id="addStop">Add stop</button><button type="button" class="btn btn-sm" id="revStops">Reverse</button></div>`)}
        ${group('Intro', toggleHTML('intro', 'Melt in when it starts') + ADV.intro.map(c => sliderHTML(c)).join('') + `<div class="btn-row"><button type="button" class="btn btn-sm" id="replay2">Replay intro</button></div>`)}
        ${group('Material', ADV.shape.map(c => sliderHTML(c)).join(''))}
        ${group('Shimmer', ADV.shimmer.map(c => sliderHTML(c)).join('') + toggleHTML('stripeReverse', 'Reverse direction'))}
        ${group('Fluid', ADV.fluid.map(c => sliderHTML(c)).join('') + `<div class="btn-row"><button type="button" class="btn btn-sm" id="newSeed">New flow pattern</button></div>`)}
        ${up ? group('Logo mask', `<select class="input" data-key="maskMode" aria-label="Mask from">
            <option value="auto">Auto-detect</option><option value="alpha">Transparency</option>
            <option value="dark">Dark logo on light background</option><option value="light">Light logo on dark background</option></select>
            <div class="note">Detected: <span id="detectedLabel">${modeLabel(src.detected)}</span></div>
            ${src.detected !== 'alpha' ? ADV.mask.map(c => sliderHTML(c)).join('') : ''}`)
          : group('Text', `<select class="input" data-key="weight" aria-label="Weight">${[400, 500, 600, 700, 800].map(w => `<option value="${w}"${w == S.weight ? ' selected' : ''}>Weight ${w}</option>`).join('')}</select>` + ADV.text.map(c => sliderHTML(c)).join(''))}
        <div class="btn-row"><button type="button" class="btn btn-sm" id="resetAll">Reset everything</button></div>
      </div>
    </details>`;

  panelEl.innerHTML = logo + colors + motion + background + fine;
  syncPanel();
}
let advOpen = false;

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
  if (k === 'speed') { const h = $('#loopHint'); if (h) h.textContent = `${loopLen().toFixed(1)}s loop`; }
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
    if (k === 'bg') {
      S.bgTransparent = false;
      panelEl.querySelectorAll('.sw').forEach(b => b.classList.remove('on'));
      el.parentElement.classList.add('on');
    }
    const out = panelEl.querySelector(`[data-out="${k}"]`);
    if (out) out.textContent = fmtVal(k);
    onChange(k);
    return;
  }
  if (el.dataset.stopColor != null) { S.stops[+el.dataset.stopColor][1] = el.value; stopsChanged(); }
  if (el.dataset.stopPos != null) {
    S.stops[+el.dataset.stopPos][0] = +el.value;
    el.nextElementSibling.textContent = Math.round(el.value * 100) + '%';
    stopsChanged();
  }
});

function stopsChanged() {
  S.palette = 'Custom';
  panelEl.querySelectorAll('.pal').forEach(b => b.classList.remove('on'));
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
  const b = e.target.closest('button, .dropzone');
  if (!b) return;
  if (b.dataset.src) {
    S.sourceType = b.dataset.src;
    buildPanel();
    if (S.sourceType === 'text' || upload) processSource();
    else $('#file').click();
    return;
  }
  if (b.id === 'dropzone') { $('#file').click(); return; }
  if (b.dataset.pal) {
    S.palette = b.dataset.pal;
    S.stops = PRESETS[S.palette].map(s => s.slice());
    panelEl.querySelectorAll('.pal').forEach(p => p.classList.toggle('on', p === b));
    if (advOpen) buildPanel();
    save(); schedule(); return;
  }
  if (b.dataset.bg) { S.bg = b.dataset.bg; S.bgTransparent = false; buildPanel(); save(); schedule(); return; }
  if (b.dataset.bgt != null) { S.bgTransparent = true; buildPanel(); save(); schedule(); return; }
  if (b.id === 'shuffle') { shuffle(); return; }
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
let dragDepth = 0;
window.addEventListener('dragenter', e => { if ([...e.dataTransfer.types].includes('Files')) { dragDepth++; document.body.classList.add('dragging'); } });
window.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; document.body.classList.remove('dragging'); } });
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => {
  e.preventDefault(); dragDepth = 0; document.body.classList.remove('dragging');
  const f = e.dataTransfer.files[0]; if (f) loadFile(f);
});
window.addEventListener('paste', e => {
  const f = [...(e.clipboardData?.files || [])][0];
  if (f) loadFile(f);
});
window.addEventListener('keydown', e => {
  if (e.code === 'Space' && !dlg.open && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); togglePlay(); }
});
$('#btnPlay').onclick = togglePlay;
$('#btnReplay').onclick = replay;

// ---------------------------------------------------------------------------
// Export: dropdown → dialog
// ---------------------------------------------------------------------------
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2600);
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
function duration() {
  const L = loopLen();
  return S.ex.length === 'intro' && S.intro ? S.introDur + L : L;
}

const menu = $('#exportMenu'), btnExport = $('#btnExport');
function setMenu(open) {
  menu.hidden = !open;
  btnExport.setAttribute('aria-expanded', open);
  if (open) menu.querySelector('button').focus();
}
btnExport.onclick = e => { e.stopPropagation(); setMenu(menu.hidden); };
document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btnExport.focus(); } });
menu.addEventListener('click', e => {
  const b = e.target.closest('[data-open]');
  if (b) { setMenu(false); openExport(b.dataset.open); }
});

const dlg = $('#exportDlg'), dlgOpts = $('#dlgOpts'), dlgFoot = $('#dlgFoot'), dlgImg = $('#dlgImg');
let exTab = 'video', busy = false, cancelled = false, previewUrl = null;

function openExport(tab) {
  exTab = tab;
  renderExport();
  dlg.showModal();
}
dlg.addEventListener('close', () => {
  cancelled = true;
  if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; dlgImg.removeAttribute('src'); }
});
dlg.addEventListener('click', e => { if (e.target === dlg && !busy) dlg.close(); });
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
    `<button type="button" class="chip${String(S.ex[key]) === String(v) ? ' on' : ''}" data-ex="${key}" data-v="${v}">${label}</button>`).join('')}</div>`;
}
const opt = (label, inner, hint = '') => `<div class="opt"><div class="opt-label">${label}${hint ? `<small>${hint}</small>` : ''}</div>${inner}</div>`;
const frameChips = () => chips('frame', Object.entries(FRAMES).map(([k, f]) =>
  [k, `${frameIcon(f.ar || geom().W / geom().H)}${f.label}`]));
const lengthChips = () => S.intro
  ? opt('Length', chips('length', [['loop', `Seamless loop`], ['intro', `With intro`]]), `${duration().toFixed(1)}s`)
  : '';
const solidBg = () => S.bgTransparent ? '#ffffff' : S.bg;

function renderExport() {
  $('#exportTabs').querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === exTab));
  const ex = S.ex;
  let html = '', meta = '', btns = '';
  if (exTab === 'video') {
    const { w, h } = outSize(ex.frame, ex.quality);
    html = opt('Frame', frameChips()) +
      opt('Quality', chips('quality', [[720, '720p'], [1080, '1080p'], [1440, '1440p']])) +
      opt('Frame rate', chips('fps', [[30, '30 fps'], [60, '60 fps']])) +
      lengthChips() +
      (S.bgTransparent ? `<div class="note">Video can't be transparent, so it uses a white background. Pick a background colour in the panel to change it.</div>` : '');
    meta = `MP4 · ${w}×${h} · ${duration().toFixed(1)}s`;
    btns = `<button type="button" class="btn btn-dark" data-do="mp4">Download MP4</button>`;
  } else if (exTab === 'gif') {
    const { w, h } = gifSize(ex.frame, ex.gif);
    html = opt('Frame', frameChips()) +
      opt('Size', chips('gif', [[480, 'Small'], [640, 'Medium'], [800, 'Large']])) +
      lengthChips() +
      `<div class="note">GIFs are big and limited to 256 colours. For social posts, MP4 looks better and is about 10× smaller.</div>`;
    meta = `GIF · ${w}×${h} · 25 fps`;
    btns = `<button type="button" class="btn btn-dark" data-do="gif">Download GIF</button>`;
  } else if (exTab === 'code') {
    const code = codeSVG();
    const shown = code.replace(/(data:image\/[a-z+]+;base64,)[A-Za-z0-9+/=]+/g, (m, p) => `${p}…`);
    html = opt('Background', chips('transparent', [[true, 'Transparent'], [false, 'Solid']])) +
      opt('Code', `<textarea class="code" readonly spellcheck="false">${esc(shown)}</textarea>`, 'Image data shortened') +
      `<div class="note">Self-contained and animated: use it as <code>&lt;img src="logo.svg"&gt;</code>, inline it in HTML, or drop it into Figma/Webflow. ${src.vector ? '' : 'Upload an SVG logo for a much smaller file.'}</div>`;
    meta = `SVG · ${kb(new Blob([code]).size)}`;
    btns = `<button type="button" class="btn" data-do="copy">Copy code</button><button type="button" class="btn btn-dark" data-do="svg">Download SVG</button>`;
  } else {
    const { w, h } = outSize(ex.frame, ex.quality);
    html = opt('Frame', frameChips()) +
      opt('Quality', chips('quality', [[720, '720p'], [1080, '1080p'], [1440, '1440p']])) +
      opt('Background', chips('transparent', [[true, 'Transparent'], [false, 'Solid']])) +
      `<div class="note">"Frames" downloads every frame as a PNG in a .zip, ready for After Effects, Premiere or Keynote.</div>`;
    meta = `PNG · ${w}×${h}`;
    btns = `<button type="button" class="btn" data-do="seq">Frames (.zip)</button><button type="button" class="btn btn-dark" data-do="png">Download PNG</button>`;
  }
  dlgOpts.innerHTML = html;
  dlgFoot.innerHTML = `<span class="meta">${meta}</span><div class="btns">${btns}</div>`;
  updateDlgPreview();
}

function exBg() {
  if (exTab === 'video' || exTab === 'gif') return solidBg();
  return S.ex.transparent ? null : solidBg();
}
function codeSVG() { return exportSVG({ intro: S.intro, bg: S.ex.transparent ? null : solidBg() }); }

function updateDlgPreview() {
  const frame = exTab === 'code' ? 'original' : S.ex.frame;
  const bg = exBg();
  const str = exportSVG({ intro: exTab !== 'image' && S.ex.length === 'intro', bg, frame });
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(new Blob([str], { type: 'image/svg+xml' }));
  dlgImg.src = previewUrl;
  $('#dlgPreview').classList.toggle('checker', !bg);
  const box = frameBox(frame);
  dlgImg.style.aspectRatio = `${box.w} / ${box.h}`;
  dlgImg.style.width = box.w / box.h >= 1 ? '100%' : 'auto';
  dlgImg.style.height = box.w / box.h >= 1 ? 'auto' : '52vh';
}

dlgOpts.addEventListener('click', e => {
  const c = e.target.closest('[data-ex]');
  if (!c || busy) return;
  const k = c.dataset.ex, v = c.dataset.v;
  S.ex[k] = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v;
  save(); renderExport();
});
dlgFoot.addEventListener('click', e => {
  const b = e.target.closest('[data-do]');
  if (b) { doExport(b.dataset.do); return; }
  if (e.target.closest('#cancelExport')) cancelled = true;
});

const prog = {
  show(title) {
    busy = true; cancelled = false;
    dlgFoot.innerHTML = `<span class="meta" id="progTitle">${title}</span><div class="bar"><span id="progBar"></span></div><button type="button" class="btn" id="cancelExport">Cancel</button>`;
  },
  set(p) { const bar = $('#progBar'); if (bar) bar.style.width = (p * 100).toFixed(1) + '%'; },
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

async function doExport(kind) {
  if (!src.href || busy) return;
  const ex = S.ex;
  const withIntro = ex.length === 'intro' && S.intro;
  try {
    if (kind === 'svg') { download(new Blob([codeSVG()], { type: 'image/svg+xml' }), baseName() + '.svg'); toast('SVG downloaded'); return; }
    if (kind === 'copy') { await navigator.clipboard.writeText(codeSVG()); toast('SVG code copied'); return; }

    const c = document.createElement('canvas');
    const ctx = c.getContext('2d', { willReadFrequently: kind === 'gif' });

    if (kind === 'png') {
      const { w, h } = outSize(ex.frame, ex.quality);
      c.width = w; c.height = h;
      const L = loopLen();
      const t = (svg.getCurrentTime() % L) + (S.intro ? Math.ceil(S.introDur / L) * L : 0);
      await renderFrame(ctx, w, h, t, true, exBg(), ex.frame);
      c.toBlob(b => { download(b, baseName() + '.png'); toast('PNG downloaded'); }, 'image/png');
      return;
    }

    if (kind === 'mp4') {
      if (!('VideoEncoder' in window)) { toast('MP4 export needs Chrome, Edge or Safari 17+'); return; }
      const { w, h } = outSize(ex.frame, ex.quality), fps = ex.fps;
      const frames = Math.max(1, Math.round(duration() * fps));
      c.width = w; c.height = h;
      prog.show('Rendering video…');
      const { Muxer, ArrayBufferTarget } = await import('https://cdn.jsdelivr.net/npm/mp4-muxer@5/+esm');
      const cfg = { codec: 'avc1.640033', width: w, height: h, bitrate: Math.round(w * h * fps * 0.2), framerate: fps };
      if (!(await VideoEncoder.isConfigSupported(cfg)).supported) throw new Error('this browser cannot encode H.264 at that size, try a lower quality');
      const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width: w, height: h }, fastStart: 'in-memory' });
      let encErr = null;
      const enc = new VideoEncoder({ output: (ch, meta) => muxer.addVideoChunk(ch, meta), error: e => { encErr = e; } });
      enc.configure(cfg);
      for (let i = 0; i < frames; i++) {
        if (cancelled || encErr) break;
        await renderFrame(ctx, w, h, i / fps, withIntro, solidBg(), ex.frame);
        const vf = new VideoFrame(c, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) });
        enc.encode(vf, { keyFrame: i % (fps * 2) === 0 });
        vf.close();
        if (enc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 0));
        prog.set((i + 1) / frames);
      }
      await enc.flush(); enc.close();
      if (encErr) throw encErr;
      if (!cancelled) { muxer.finalize(); download(new Blob([muxer.target.buffer], { type: 'video/mp4' }), baseName() + '.mp4'); toast('Video downloaded'); }
      prog.hide();
      return;
    }

    if (kind === 'gif') {
      const { w, h } = gifSize(ex.frame, ex.gif), fps = 25;
      const frames = Math.max(1, Math.round(duration() * fps));
      c.width = w; c.height = h;
      prog.show('Rendering GIF…');
      const { GIFEncoder, quantize, applyPalette } = await import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm');
      const gif = GIFEncoder();
      for (let i = 0; i < frames; i++) {
        if (cancelled) break;
        await renderFrame(ctx, w, h, i / fps, withIntro, solidBg(), ex.frame);
        const data = ctx.getImageData(0, 0, w, h).data;
        const palette = quantize(data, 256);
        gif.writeFrame(applyPalette(data, palette), w, h, { palette, delay: 1000 / fps });
        prog.set((i + 1) / frames);
        await new Promise(r => setTimeout(r, 0));
      }
      if (!cancelled) { gif.finish(); download(new Blob([gif.bytes()], { type: 'image/gif' }), baseName() + '.gif'); toast('GIF downloaded'); }
      prog.hide();
      return;
    }

    if (kind === 'seq') {
      const { w, h } = outSize(ex.frame, ex.quality), fps = 30;
      const frames = Math.max(1, Math.round(duration() * fps));
      c.width = w; c.height = h;
      prog.show('Rendering frames…');
      const { zipSync } = await import('https://cdn.jsdelivr.net/npm/fflate@0.8.2/+esm');
      const files = {};
      for (let i = 0; i < frames; i++) {
        if (cancelled) break;
        await renderFrame(ctx, w, h, i / fps, withIntro, exBg(), ex.frame);
        const blob = await new Promise(r => c.toBlob(r, 'image/png'));
        files[`frame_${String(i).padStart(4, '0')}.png`] = [new Uint8Array(await blob.arrayBuffer()), { level: 0 }];
        prog.set((i + 1) / frames);
      }
      if (!cancelled) { download(new Blob([zipSync(files)], { type: 'application/zip' }), `${baseName()}-${fps}fps.zip`); toast('Frames downloaded'); }
      prog.hide();
    }
  } catch (err) {
    console.error(err);
    prog.hide();
    toast('Export failed: ' + (err.message || err));
  }
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
// Console helpers: iridescent.set({ flow: 6 }), iridescent.svg()
window.iridescent = {
  get settings() { return structuredClone(S); },
  get source() { return { aspect: src.aspect, thickness: src.thick, mask: src.detected, vector: !!src.vector }; },
  set(o) { Object.assign(S, o); save(); buildPanel(); Object.keys(o).some(k => SOURCE_KEYS.has(k)) ? processSource() : schedule(); },
  svg: () => codeSVG(),
  open: openExport,
  export: doExport,
};

buildPanel();
document.fonts.ready.then(processSource);
processSource();

})();

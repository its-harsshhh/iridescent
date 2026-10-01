// Iridescent UI kit: synthesized interface sounds, custom dropdowns and a colour picker.
// Plain JS, no dependencies. Exposes window.Kit.
(() => {
'use strict';

// ---------------------------------------------------------------------------
// Sound — every sound is synthesized with Web Audio, quiet and low.
// ---------------------------------------------------------------------------
const SOUND_KEY = 'iridescent-sound';
let ctx = null, master = null, noiseBuf = null;
let enabled = true;
try { enabled = localStorage.getItem(SOUND_KEY) !== 'off'; } catch (e) {}

function audio() {
  if (!enabled) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function env(g, t, peak, attack, decay) {
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}
function tone({ freq, to, type = 'sine', peak = 0.2, attack = 0.002, decay = 0.08, delay = 0 }) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + attack + decay);
  env(g, t, peak, attack, decay);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + attack + decay + 0.02);
}
function noise({ freq = 2000, q = 1, type = 'bandpass', peak = 0.1, attack = 0.001, decay = 0.02, delay = 0, sweepTo }) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = noiseBuf;
  f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + attack + decay);
  env(g, t, peak, attack, decay);
  s.connect(f).connect(g).connect(master);
  s.start(t); s.stop(t + attack + decay + 0.02);
}

let lastTick = 0;
const sound = {
  get enabled() { return enabled; },
  set enabled(v) {
    enabled = !!v;
    try { localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off'); } catch (e) {}
  },
  // Key going down: a soft, low thump with a tiny click on top.
  press() {
    tone({ freq: 150, to: 70, peak: 0.22, decay: 0.09 });
    noise({ freq: 3200, q: 0.8, peak: 0.05, decay: 0.012 });
  },
  // Key coming back up: lighter and a touch higher.
  release() { noise({ freq: 1900, q: 1.2, peak: 0.035, decay: 0.014 }); tone({ freq: 240, to: 180, peak: 0.05, decay: 0.035 }); },
  // Slider detent, pitched by position (0–1).
  tick(p = 0.5) {
    const a = audio(); if (!a) return;
    if (a.currentTime - lastTick < 0.026) return;
    lastTick = a.currentTime;
    noise({ freq: 1400 + p * 1600, q: 6, peak: 0.07, decay: 0.012 });
    tone({ freq: 320 + p * 360, peak: 0.045, decay: 0.03 });
  },
  toggle(on) {
    tone({ freq: on ? 520 : 380, to: on ? 700 : 260, peak: 0.09, decay: 0.06 });
    noise({ freq: 2600, q: 2, peak: 0.05, decay: 0.01 });
  },
  // Glassy marble tap for swatches.
  select() {
    tone({ freq: 880, peak: 0.07, decay: 0.16, type: 'sine' });
    tone({ freq: 1760, peak: 0.025, decay: 0.09, type: 'sine' });
    tone({ freq: 160, to: 90, peak: 0.12, decay: 0.07 });
  },
  open() { noise({ type: 'lowpass', freq: 320, sweepTo: 1800, q: 0.7, peak: 0.08, attack: 0.04, decay: 0.16 }); tone({ freq: 196, to: 262, peak: 0.05, attack: 0.02, decay: 0.16 }); },
  close() { noise({ type: 'lowpass', freq: 1600, sweepTo: 300, q: 0.7, peak: 0.06, attack: 0.02, decay: 0.14 }); },
  success() { tone({ freq: 523.25, peak: 0.08, decay: 0.22 }); tone({ freq: 783.99, peak: 0.07, decay: 0.32, delay: 0.09 }); },
  error() { tone({ freq: 220, to: 180, peak: 0.1, decay: 0.16, type: 'triangle' }); tone({ freq: 165, to: 140, peak: 0.08, decay: 0.2, type: 'triangle', delay: 0.11 }); },
};

// Global wiring: tactile controls get press/release, sliders get detents.
const PRESSABLE = '.btn, .chip, .icon-btn, .seg button, .tabs button, .x-btn, .dd-btn, .toast-x';
const SELECTABLE = '.pal, .sw, .dd-opt, .cp-swatch';
document.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  const el = e.target.closest(PRESSABLE + ',' + SELECTABLE);
  if (!el || el.disabled) return;
  if (el.matches(SELECTABLE)) sound.select(); else sound.press();
}, true);
document.addEventListener('pointerup', e => {
  const el = e.target.closest(PRESSABLE);
  if (el && !el.disabled) sound.release();
}, true);
const lastDetent = new WeakMap();
document.addEventListener('input', e => {
  const el = e.target;
  if (el.type === 'range') {
    const min = +el.min || 0, max = +el.max || 1, p = (el.value - min) / (max - min);
    const step = Math.round(p * 32); // 32 detents across any slider
    if (lastDetent.get(el) !== step) { lastDetent.set(el, step); sound.tick(p); }
  } else if (el.type === 'checkbox') {
    sound.toggle(el.checked);
  }
}, true);
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches(PRESSABLE)) sound.press();
}, true);

// ---------------------------------------------------------------------------
// Dropdown — progressively enhances a native <select>. The select stays in
// the DOM (hidden) and keeps the value; choosing an option dispatches `input`.
// ---------------------------------------------------------------------------
const CHEVRON = '<svg class="dd-chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 6.5l3-3 3 3M5 9.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK = '<svg class="dd-check" viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
let uid = 0, openDD = null;

function enhanceSelect(sel) {
  if (sel.dataset.enhanced) return;
  sel.dataset.enhanced = '1';
  const id = 'dd' + (++uid);
  const font = sel.dataset.fontPreview != null;
  const wrap = document.createElement('div');
  wrap.className = 'dd';
  const label = sel.closest('label');
  const labelText = label ? (label.querySelector('.field-label') || {}).textContent : sel.getAttribute('aria-label');
  wrap.innerHTML =
    `<button type="button" class="dd-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}"><span class="dd-val"></span>${CHEVRON}</button>` +
    `<div class="dd-list" role="listbox" id="${id}" tabindex="-1" hidden></div>`;
  const btn = wrap.firstChild, list = wrap.lastChild, val = btn.firstChild;
  if (labelText) { btn.setAttribute('aria-label', `${labelText}: ${sel.selectedOptions[0]?.text || ''}`); list.setAttribute('aria-label', labelText); }
  [...sel.options].forEach((o, i) => {
    const opt = document.createElement('div');
    opt.className = 'dd-opt'; opt.id = `${id}-${i}`; opt.setAttribute('role', 'option');
    opt.dataset.value = o.value;
    opt.innerHTML = `<span>${o.textContent}</span>${CHECK}`;
    if (font) opt.firstChild.style.fontFamily = `"${o.value}", system-ui`;
    list.appendChild(opt);
  });
  sel.hidden = true;
  sel.after(wrap);
  // A wrapping <label> would forward clicks to the hidden select; route them to the button.
  if (label) label.addEventListener('click', e => { if (!wrap.contains(e.target)) { e.preventDefault(); btn.focus(); } });

  const opts = () => [...list.children];
  let active = -1;
  function sync() {
    const o = sel.selectedOptions[0];
    val.textContent = o ? o.textContent : '';
    if (font && o) val.style.fontFamily = `"${o.value}", system-ui`;
    opts().forEach(el => el.setAttribute('aria-selected', el.dataset.value === sel.value));
    if (labelText) btn.setAttribute('aria-label', `${labelText}: ${val.textContent}`);
  }
  function setActive(i) {
    const all = opts();
    active = (i + all.length) % all.length;
    all.forEach((el, k) => el.classList.toggle('active', k === active));
    list.setAttribute('aria-activedescendant', all[active].id);
    all[active].scrollIntoView({ block: 'nearest' });
  }
  function place() {
    const r = btn.getBoundingClientRect();
    list.style.minWidth = r.width + 'px';
    list.style.left = r.left + 'px';
    const want = Math.min(list.scrollHeight, 300);
    const below = window.innerHeight - r.bottom - 18, above = r.top - 18;
    const up = below < want && above > below;
    list.style.maxHeight = Math.max(120, Math.min(300, up ? above : below)) + 'px';
    if (up) { list.style.top = ''; list.style.bottom = (window.innerHeight - r.top + 6) + 'px'; list.dataset.side = 'top'; }
    else { list.style.bottom = ''; list.style.top = (r.bottom + 6) + 'px'; list.dataset.side = 'bottom'; }
  }
  function open() {
    if (openDD && openDD !== api) openDD.close(false);
    btn.scrollIntoView({ block: 'nearest' });
    list.hidden = false; place();
    btn.setAttribute('aria-expanded', 'true');
    setActive(Math.max(0, opts().findIndex(el => el.dataset.value === sel.value)));
    list.focus({ preventScroll: true });
    openDD = api;
    sound.open();
  }
  function close(refocus = true) {
    if (list.hidden) return;
    list.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (refocus) btn.focus();
    if (openDD === api) openDD = null;
  }
  function choose(i) {
    const v = opts()[i].dataset.value;
    if (v !== sel.value) {
      sel.value = v;
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    sync(); close();
  }
  const api = { close, sync };
  btn.addEventListener('click', () => (list.hidden ? open() : close()));
  btn.addEventListener('keydown', e => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(); }
  });
  let typed = '', typedT = 0;
  list.addEventListener('keydown', e => {
    const n = opts().length;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); sound.tick(active / n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); sound.tick(active / n); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(n - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sound.select(); choose(active); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'Tab') { close(false); }
    else if (e.key.length === 1) {
      clearTimeout(typedT); typed += e.key.toLowerCase(); typedT = setTimeout(() => { typed = ''; }, 600);
      const i = opts().findIndex(el => el.textContent.trim().toLowerCase().startsWith(typed));
      if (i >= 0) setActive(i);
    }
  });
  list.addEventListener('pointermove', e => {
    const o = e.target.closest('.dd-opt');
    if (o) { const i = opts().indexOf(o); if (i !== active) setActive(i); }
  });
  list.addEventListener('click', e => {
    const o = e.target.closest('.dd-opt');
    if (o) choose(opts().indexOf(o));
  });
  sync();
}
document.addEventListener('pointerdown', e => {
  if (openDD && !e.target.closest('.dd')) openDD.close(false);
});
window.addEventListener('resize', () => openDD && openDD.close(false));
document.addEventListener('scroll', e => { if (openDD && !(e.target.closest && e.target.closest('.dd-list'))) openDD.close(false); }, true);

function enhanceSelects(root = document) { root.querySelectorAll('select:not([data-enhanced])').forEach(enhanceSelect); }

// ---------------------------------------------------------------------------
// Colour picker — a small anchored dialog: saturation/value field, hue rail,
// hex input, eyedropper and quick swatches. Changes apply live.
// ---------------------------------------------------------------------------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
function hexToHsv(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let hue = 0;
  if (d) hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (hue * 60 + 360) % 360, s: mx ? d / mx : 0, v: mx };
}
function hsvToHex({ h, s, v }) {
  const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return '#' + [f(5), f(3), f(1)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}
const validHex = v => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
const normHex = v => { let h = v.trim().replace('#', '').toLowerCase(); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return '#' + h; };

const QUICK = ['#ffffff', '#f3efe6', '#e9e6ff', '#ffe9f2', '#e6fff7', '#0a0a0b', '#0b1026', '#1b0b3a', '#2c78e4', '#ff4b2f', '#ffa04a', '#ff52c8'];
const EYEDROP = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m11.5 5.5 3 3M13 4l3 3-1.5 1.5-3-3L13 4ZM12 7l-6.5 6.5-.75 2.75 2.75-.75L14 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

let cp = null;
function buildPicker() {
  const el = document.createElement('div');
  el.className = 'cp'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Choose a colour'); el.hidden = true;
  el.innerHTML = `
    <div class="cp-sv" tabindex="0" role="slider" aria-label="Saturation and brightness" aria-valuemin="0" aria-valuemax="100"><div class="cp-sv-thumb"></div></div>
    <div class="cp-row">
      <div class="cp-chip" aria-hidden="true"></div>
      <input type="range" class="cp-hue" min="0" max="360" step="1" aria-label="Hue">
    </div>
    <div class="cp-row">
      <label class="cp-hex"><span>#</span><input type="text" maxlength="7" spellcheck="false" autocomplete="off" aria-label="Hex colour"></label>
      ${'EyeDropper' in window ? `<button type="button" class="btn btn-sm cp-drop" aria-label="Pick a colour from the screen" title="Pick from screen">${EYEDROP}</button>` : ''}
    </div>
    <div class="cp-swatches">${QUICK.map(c => `<button type="button" class="cp-swatch" style="background:${c}" data-c="${c}" aria-label="${c}"></button>`).join('')}</div>
    <button type="button" class="btn btn-dark btn-sm cp-done">Done</button>`;
  document.body.appendChild(el);
  const sv = el.querySelector('.cp-sv'), thumb = el.querySelector('.cp-sv-thumb'), hue = el.querySelector('.cp-hue');
  const hex = el.querySelector('.cp-hex input'), chip = el.querySelector('.cp-chip');
  const state = { hsv: { h: 0, s: 0, v: 1 }, onInput: null, anchor: null, initial: null };

  function paint(from) {
    const c = hsvToHex(state.hsv);
    sv.style.setProperty('--hue', `hsl(${state.hsv.h} 100% 50%)`);
    thumb.style.left = state.hsv.s * 100 + '%';
    thumb.style.top = (1 - state.hsv.v) * 100 + '%';
    thumb.style.background = c;
    chip.style.background = c;
    sv.setAttribute('aria-valuetext', `Saturation ${Math.round(state.hsv.s * 100)}%, brightness ${Math.round(state.hsv.v * 100)}%`);
    if (from !== 'hue') { hue.value = state.hsv.h; }
    hue.style.setProperty('--p', (state.hsv.h / 360 * 100) + '%');
    if (from !== 'hex') hex.value = c.slice(1);
    el.querySelectorAll('.cp-swatch').forEach(b => b.setAttribute('aria-pressed', b.dataset.c === c));
    return c;
  }
  function emit(from) { const c = paint(from); state.onInput && state.onInput(c); }

  let dragging = false, lastP = -1;
  function fromPointer(e) {
    const r = sv.getBoundingClientRect();
    state.hsv.s = clamp((e.clientX - r.left) / r.width);
    state.hsv.v = clamp(1 - (e.clientY - r.top) / r.height);
    const p = Math.round((state.hsv.s + state.hsv.v) * 16);
    if (p !== lastP) { lastP = p; sound.tick((state.hsv.s + state.hsv.v) / 2); }
    emit();
  }
  sv.addEventListener('pointerdown', e => { dragging = true; sv.setPointerCapture(e.pointerId); sv.classList.add('dragging'); fromPointer(e); });
  sv.addEventListener('pointermove', e => dragging && fromPointer(e));
  sv.addEventListener('pointerup', () => { dragging = false; sv.classList.remove('dragging'); });
  sv.addEventListener('keydown', e => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (!d) return;
    e.preventDefault();
    state.hsv.s = clamp(state.hsv.s + d[0]); state.hsv.v = clamp(state.hsv.v + d[1]);
    sound.tick((state.hsv.s + state.hsv.v) / 2);
    emit();
  });
  hue.addEventListener('input', () => { state.hsv.h = +hue.value; emit('hue'); });
  hex.addEventListener('input', () => {
    const v = hex.value;
    hex.closest('.cp-hex').classList.toggle('invalid', !validHex(v));
    if (validHex(v)) { state.hsv = hexToHsv(normHex(v)); emit('hex'); }
  });
  hex.addEventListener('blur', () => { hex.closest('.cp-hex').classList.remove('invalid'); paint(); });
  el.addEventListener('click', async e => {
    const sw = e.target.closest('.cp-swatch');
    if (sw) { state.hsv = hexToHsv(sw.dataset.c); emit(); return; }
    if (e.target.closest('.cp-drop')) {
      try { const r = await new window.EyeDropper().open(); state.hsv = hexToHsv(r.sRGBHex); emit(); sound.select(); } catch (err) { /* dismissed */ }
      return;
    }
    if (e.target.closest('.cp-done')) close(true);
  });
  el.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      // Escape restores the colour the picker opened with.
      state.hsv = hexToHsv(state.initial); emit(); close(true);
    }
  });

  function place(anchor) {
    const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
    let left = r.left + r.width / 2 - w / 2;
    left = clamp(left, 12, window.innerWidth - w - 12);
    let top = r.bottom + 10;
    if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 10);
    el.style.left = left + 'px'; el.style.top = top + 'px';
  }
  function open(anchor, value, onInput) {
    state.anchor = anchor; state.onInput = onInput; state.initial = normHex(value);
    state.hsv = hexToHsv(state.initial);
    el.hidden = false; paint(); place(anchor);
    anchor.setAttribute('aria-expanded', 'true');
    sound.open();
    requestAnimationFrame(() => sv.focus());
  }
  function close(refocus) {
    if (el.hidden) return;
    el.hidden = true;
    if (state.anchor) { state.anchor.setAttribute('aria-expanded', 'false'); if (refocus) state.anchor.focus(); }
    sound.close();
  }
  document.addEventListener('pointerdown', e => {
    if (!el.hidden && !el.contains(e.target) && !(state.anchor && state.anchor.contains(e.target))) close(false);
  });
  window.addEventListener('resize', () => close(false));
  return { open, close, get isOpen() { return !el.hidden; }, get anchor() { return state.anchor; } };
}
const colorPicker = {
  open(anchor, value, onInput) { cp = cp || buildPicker(); if (cp.isOpen && cp.anchor === anchor) { cp.close(true); return; } cp.open(anchor, value, onInput); },
  close() { cp && cp.close(false); },
};

window.Kit = { sound, enhanceSelects, colorPicker };
})();

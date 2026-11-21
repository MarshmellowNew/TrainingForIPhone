'use strict';

const $ = (s, el = document) => el.querySelector(s);
const SPEED = Number(new URLSearchParams(location.search).get('speed')) || 1;
const KG_PER_KCAL = 20.4;

const store = {
  get(k, d) { try { const v = localStorage.getItem('tr:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('tr:' + k, JSON.stringify(v)); } catch (e) { } },
};
const settings = Object.assign({ warm: false, lang: 'ru', names: true, tips: true, dbv: true, vctl: false, count: 'voice', rate: 0.95, voice: '', swap: false, rec: true, aw: true, dish: true, freq: true, wrep: true, mch: true, pho: true }, store.get('settings', {}), { swap: true, rec: true, aw: true, dish: true, freq: true, wrep: true, mch: true, pho: true });
const saveSettings = () => store.set('settings', settings);
const hist = () => store.get('hist', []);
const PROFILE0 = { set: false, gender: 'male', h: 183, w: 67, goal: 75, exp: 2, act: 0 };
const profile = () => Object.assign({}, PROFILE0, store.get('profile', {}));
const expsList = g => [g === 'female' ? 'Не занималась' : 'Не занимался', 'До 6 месяцев', '6-24 месяца', 'Больше 2 лет'],
  DEF = { male: { h: 183, w: 67, goal: 75 }, female: { h: 159, w: 49, goal: 49 } }, ACTS = ['Сидячий', 'Лёгкая активность', 'Очень активный'];
function recommend(p = profile()) {
  const bmi = p.w / Math.pow(p.h / 100, 2), delta = p.goal - p.w, goal = delta >= 2 ? 'gain' : delta <= -2 ? 'lose' : 'tone';
  let level = Math.min(5, Math.max(1, Math.round((p.exp * 2 + p.act) / 8 * 4) + 1));
  if (p.test && p.test.k) level = p.test.k < 0.7 ? 1 : p.test.k < 1 ? 2 : p.test.k < 1.3 ? 3 : p.test.k < 1.6 ? 4 : 5;
  if (bmi >= 30) level = Math.min(level, 2);
  const out = [], add = (pid, why) => { if (!out.some(x => x.pid === pid)) out.push({ pid, why }); };
  const female = p.gender === 'female';
  const absId = level <= 2 ? 'abs-new' : level === 3 ? 'abs-adv' : 'abs-pro';
  add(absId, p.test ? 'подобрано по результату теста' : 'подходит по уровню подготовки');
  const dbId = level <= 1 ? 'db-new' : level === 2 ? 'db-all' : 'db-split';
  if (goal === 'gain') { add(female ? 'glutes-3' : dbId, female ? 'форма и рост мышц ягодиц и ног' : 'набор мышечной массы'); add(female ? dbId : 'legs-3', 'крупные группы мышц дают основной прирост'); }
  else if (goal === 'lose') { add(level <= 2 || female ? 'db-lose' : dbId, 'много повторений с лёгкими гантелями, больше расход калорий'); add(female ? 'glutes-3' : 'legs-3', 'крупные мышцы тратят больше всего калорий'); }
  else { add(female ? 'glutes-3' : dbId, 'тонус и форма'); add(female ? 'legs-3' : 'legs-3', 'ноги работают вместе с общим тонусом'); }
  if (goal === 'lose') { const i = out.findIndex(x => x.pid === 'abs-new' || x.pid === 'abs-adv' || x.pid === 'abs-pro'); if (i >= 0 && level <= 3) out[i] = { pid: 'abs-lose', why: 'кардио-интервалы и пресс для снижения веса' }; }
  if (!female && goal === 'gain') add(level <= 2 ? 'chest-new' : level === 3 ? 'chest-db' : 'chest-adv', 'грудь и спина растут вместе с общей массой');
  if (level >= 3) add(level >= 4 ? 'back-mix' : 'back-bar-new', 'турник и гантели для спины');
  if (female && level >= 4) add('glutes-adv', 'тяжёлые гантели для ягодиц');
  if (female && level <= 2) add('core', 'кор улучшает осанку и устойчивость');
  { const per = level >= 5 ? 5 : level >= 3 ? 3 : 2; add(`gym-${level}-${per}`, 'тренировка в зале по группам мышц'); }
  const notes = [];
  if (goal === 'gain') notes.push(`Цель +${num(Math.round(delta * 10) / 10)} кг: безопасный темп около 0,25-0,5 кг в неделю. Тренировки дают стимул, но нужен профицит калорий и белок в рационе.`);
  if (goal === 'lose') notes.push(`Цель ${num(Math.round(delta * 10) / 10)} кг: безопасный темп 0,5-1 кг в неделю. Нужен умеренный дефицит калорий, тренировки его поддерживают.`);
  if (goal === 'tone') notes.push('Цель: сохранить вес и улучшить форму. Увеличивай нагрузку постепенно: +1 повторение за неделю.');
  if (bmi < 18.5) notes.push('Индекс массы тела ниже нормы: следи за питанием, не гони нагрузку.');
  if (bmi >= 30) notes.push('Индекс массы тела высокий: начинай с лёгкого уровня, прыжки заменяй шагом и не спеши.');
  if (p.exp <= 1) notes.push(female ? 'На старте хватит 3 тренировок в неделю. Остальное добавляй, когда исчезнет сильная усталость.' : 'На старте хватит 3 тренировок в неделю. Остальное добавляй, когда исчезнет сильная усталость.');
  if (p.act === 0) notes.push('Сидячая работа: каждый час вставай и разминайся, это помогает спине и ягодицам.');
  if (female) notes.push('Для девушек гантели по умолчанию вдвое легче, а число повторений без веса ×0,85. Это можно подстроить тестом на максимум.');
  if (!p.test) notes.push('Хочешь точнее? Пройди «Тест на максимум»: приложение подгонит повторения под твои силы.');
  return { bmi, goal, level, items: out.slice(0, 5), notes };
}
const getW = (ex, def) => store.get('w:' + ex, def);
const setW = (ex, v) => store.set('w:' + ex, v);

const fmtT = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const fmtClock = s => { s = Math.max(0, Math.ceil(s)); return s >= 60 ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : String(s); };
const num = n => String(n).replace('.', ',');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const prog = id => PROGRAMS.find(p => p.id === id);
const dayData = (p, d) => p.day(d);
const thumb = ex => EX[ex].gif ? `gif/t_${EX[ex].gif}.jpg` : `img/t_${EX[ex].img}.jpg`;
const figHtml = (ex, nSets, mir) => {
  if (!ex) return '<div class="fig"></div>';
  const e = EX[ex], hasTip = !!e.tip, tip = hasTip ? `<button class="tipbtn" id="tipbtn" aria-label="Совет по технике">${I.info}</button>` : '';
  const plb = nSets ? `<button class="tipbtn plbtn" id="plbtn" aria-label="План тренировки">${I.list}<span>${nSets}</span></button>` : '';
  const swb = nSets !== undefined && settings.swap ? `<button class="tipbtn" id="swbtn" aria-label="Заменить упражнение">${XT.swI}</button>` : '';
  const dots = '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>';
  const acts = tip + plb + swb, menu = acts ? `<div class="fabs" id="fabs"><button class="tipbtn fmain" id="fmain" aria-label="Действия">${dots}</button><div class="fx">${acts}</div></div>` : '';
  const m = mir ? ' mir' : '';
  return e.gif ? `<div class="fig gif${m}"><img src="gif/${e.gif}.gif" alt="">${menu}</div>`
    : `<div class="fig${m}"><img class="a" src="img/${e.img}_0.jpg" alt=""><img class="b" src="img/${e.img}_1.jpg" alt="">${menu}</div>`;
};
const mediaUrls = ex => EX[ex].gif ? [`gif/${EX[ex].gif}.gif`, `gif/t_${EX[ex].gif}.jpg`] : [`img/${EX[ex].img}_0.jpg`, `img/${EX[ex].img}_1.jpg`, `img/t_${EX[ex].img}.jpg`];
const I = {
  food: '<svg viewBox="0 0 24 24"><path d="M7 3v8M4.5 3v5a2.5 2.5 0 005 0V3M7 11v10M17 21V3c-2.5 1-4 4-4 8h4"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  dumb: '<svg viewBox="0 0 24 24"><path d="M2 9v6M5 6v12M19 6v12M22 9v6M5 12h14"/></svg>',
  hist: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
  l: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  r: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
  flame: '<svg viewBox="0 0 24 24"><path d="M12 2.5c.6 3-1.2 4.6-3 6.5-1.8 1.9-3 3.6-3 6a6 6 0 0012 0c0-2.2-1-3.8-2.2-5.2-.3 1.4-1 2.3-1.9 2.7.5-3.6-.4-7.4-1.9-10z"/><path d="M12 21a2.6 2.6 0 01-2.6-2.6c0-1.7 1.4-2.5 2.6-4 1.2 1.5 2.6 2.3 2.6 4A2.6 2.6 0 0112 21z"/></svg>',
  timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9M9.5 2.5h5M12 2.5V6M18.6 7l1.4-1.4M12 6.5v.01M6 13.5h.01M18 13.5h.01"/></svg>',
  weight: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5.2" r="2.7"/><path d="M8.3 8.2h7.4a1 1 0 01.97.76l2.2 9a2 2 0 01-1.94 2.54H7.07a2 2 0 01-1.94-2.54l2.2-9a1 1 0 01.97-.76z"/><path d="M9.5 14.5h5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M7.8 12.4l3 3 5.4-6.3"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.01"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13.2 2.5L5 13.4h5.6l-1 8.1 8.4-11.2h-5.7z"/></svg>',
  male: '<svg viewBox="0 0 24 24"><circle cx="10" cy="14" r="5.5"/><path d="M14 10l6-6M14.5 4H20v5.5"/></svg>',
  female: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V22M8.5 18.5h7"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.9 6.7 19.6l1.1-5.8L3.5 9.7l5.9-.8z"/></svg>',
  starOn: '<svg viewBox="0 0 24 24" class="on"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.9 6.7 19.6l1.1-5.8L3.5 9.7l5.9-.8z"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 21.5z"/><path d="M4 21.5V5.5M8.5 7.5H16"/></svg>',
  help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 114 2c-.9.6-1.6 1.1-1.6 2.2M12 16.8v.01"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M3.5 20.5h17"/><rect x="5" y="12" width="3.4" height="8.5" rx="1"/><rect x="10.3" y="5" width="3.4" height="15.5" rx="1"/><rect x="15.6" y="9" width="3.4" height="11.5" rx="1"/></svg>',
};
const ic = (n, c = '') => `<span class="ic ${c}">${I[n]}</span>`;

const Snd = {
  ctx: null, buf: {}, hasVoice: false, loaded: false, voice: null,
  keepAlive() {
    try {
      if (!this.keep) {
        const n = 800, u = new Uint8Array(44 + n), dv = new DataView(u.buffer), w = (o, t) => [...t].forEach((c, i) => u[o + i] = c.charCodeAt(0));
        w(0, 'RIFF'); dv.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
        dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); w(36, 'data'); dv.setUint32(40, n, true); u.fill(128, 44);
        let bin = ''; u.forEach(b => bin += String.fromCharCode(b));
        this.keep = new Audio('data:audio/wav;base64,' + btoa(bin)); this.keep.loop = true; this.keep.volume = 0.01; this.keep.setAttribute('playsinline', '');
      }
      const p = this.keep.play(); if (p && p.catch) p.catch(() => { });
    } catch (e) { }
  },
  diag() {
    const ru = ('speechSynthesis' in window) ? speechSynthesis.getVoices().filter(v => /^ru/i.test(v.lang)).length : 0;
    return `Синтез речи: ${'speechSynthesis' in window ? 'есть' : 'нет'} · русских голосов: ${ru} · аудио: ${this.ctx ? this.ctx.state : 'нет'} · пакет голоса: ${this.hasVoice ? 'да' : 'нет'}`;
  },
  unlock() {
    this.keepAlive();
    try {
      if (!this.bp) { this.bp = new Audio(); this.bp.setAttribute('playsinline', ''); this.bp.src = this.toneUri(760, 0.05); this.bp.muted = true; const p = this.bp.play(); if (p && p.then) p.then(() => { this.bp.pause(); this.bp.muted = false; }).catch(() => { }); }
    } catch (e) { }
    try {
      if (!this.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) this.ctx = new C(); }
      if (this.ctx && this.ctx.state !== 'running') this.ctx.resume();
      if (this.ctx) { const s = this.ctx.createBufferSource(); s.buffer = this.ctx.createBuffer(1, 1, 22050); s.connect(this.ctx.destination); s.start(0); }
    } catch (e) { }
    try { if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } } catch (e) { }
    this.loadPack();
  },
  loadPack() {
    if (this.loaded || !this.ctx) return; this.loaded = true;
    ['n4', 'n3', 'n2', 'n1', 'stop'].forEach(k => fetch('voice/' + k + '.mp3').then(r => r.ok ? r.arrayBuffer() : Promise.reject())
      .then(ab => new Promise((ok, no) => this.ctx.decodeAudioData(ab, ok, no)))
      .then(b => { this.buf[k] = b; this.hasVoice = !!(this.buf.n4 && this.buf.n3 && this.buf.n2 && this.buf.n1); }).catch(() => { }));
  },
  tones: {},
  toneUri(f, d) {
    const k = f + '_' + d; if (this.tones[k]) return this.tones[k];
    const sr = 22050, n = Math.floor(sr * d), u = new Uint8Array(44 + n * 2), dv = new DataView(u.buffer), w = (o, t) => [...t].forEach((c, i) => u[o + i] = c.charCodeAt(0));
    w(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const e = Math.min(1, i / 200, (n - i) / (sr * 0.03)); dv.setInt16(44 + i * 2, Math.sin(2 * Math.PI * f * i / sr) * 0.85 * 32767 * e, true); }
    let bin = ''; for (let i = 0; i < u.length; i += 8192) bin += String.fromCharCode.apply(null, u.subarray(i, i + 8192));
    return (this.tones[k] = 'data:audio/wav;base64,' + btoa(bin));
  },
  beep(f = 760, d = 0.12, v = 0.3) {
    try {
      if (!this.bp) { this.bp = new Audio(); this.bp.setAttribute('playsinline', ''); }
      this.bp.muted = false; this.bp.src = this.toneUri(f, d); this.bp.currentTime = 0;
      const p = this.bp.play(); if (p && p.catch) p.catch(() => this.beepCtx(f, d, v));
    } catch (e) { this.beepCtx(f, d, v); }
  },
  beepCtx(f, d, v) {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + d + 0.02);
    } catch (e) { }
  },
  play(k) { if (!this.ctx || !this.buf[k]) return false; const s = this.ctx.createBufferSource(); s.buffer = this.buf[k]; s.connect(this.ctx.destination); s.start(0); return true; },
  pickVoice() {
    if (this.voice || !('speechSynthesis' in window)) return this.voice;
    const vs = speechSynthesis.getVoices().filter(v => /^ru/i.test(v.lang));
    const soft = /premium|enhanced|siri|улучш|расшир|премиум|natural|neural/i, fem = /milena|katya|alena|svetlana|irina|female|женск/i, id = v => v.name + ' ' + v.voiceURI;
    this.voice = (settings.voice && vs.find(v => v.voiceURI === settings.voice)) || vs.find(v => soft.test(id(v)) && fem.test(v.name)) || vs.find(v => soft.test(id(v))) || vs.find(v => fem.test(v.name)) || vs[0] || null; return this.voice;
  },
  _tok: 0, _q: [], _busy: false,
  speakList(items, cancel = true) {
    if (!('speechSynthesis' in window)) return;
    items = items.filter(Boolean);
    if (cancel) { this._tok++; this._q = []; this._busy = false; try { speechSynthesis.cancel(); } catch (e) { } }
    if (!items.length) return;
    this._q.push(...items);
    if (cancel || !this._busy) { const tok = this._tok; this._busy = true; setTimeout(() => this._pump(tok), cancel ? 90 : 0); }
  },
  _pump(tok) {
    if (tok !== this._tok) return;
    const t = this._q.shift(); if (!t) { this._busy = false; return; }
    let done = false, guard = null;
    const next = () => { if (done) return; done = true; clearTimeout(guard); if (tok === this._tok) setTimeout(() => this._pump(tok), 160); };
    try {
      const u = new SpeechSynthesisUtterance(t); u.lang = 'ru-RU'; u.rate = settings.rate; u.volume = 1;
      const v = this.pickVoice(); if (v) u.voice = v;
      u.onend = next; u.onerror = next;
      guard = setTimeout(next, 3000 + t.length * 120 / settings.rate);
      speechSynthesis.resume(); speechSynthesis.speak(u);
    } catch (e) { next(); }
  },
  say(text, cancel = true) { this.speakList([text], cancel); },
  stop() { this._tok++; this._q = []; this._busy = false; try { speechSynthesis.cancel(); } catch (e) { } },
};
if ('speechSynthesis' in window) { speechSynthesis.onvoiceschanged = () => { Snd.voice = null; }; try { speechSynthesis.getVoices(); } catch (e) { } }
const WORDS = { 4: 'четыре', 3: 'три', 2: 'два', 1: 'один' };
function cue(n) {
  if (settings.count === 'beep' || !('speechSynthesis' in window) && !Snd.buf['n' + n]) return Snd.beep(n === 1 ? 900 : 760, 0.13);
  if (!Snd.play('n' + n)) Snd.say(WORDS[n]);
}
function stopSound() { if (!Snd.play('stop')) Snd.beep(1150, 0.55, 0.4); }
function speakName(t) { if (settings.names) Snd.say(t); }

let wl = null;
async function wake() { try { if ('wakeLock' in navigator && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } } catch (e) { wl = null; } }
function unwake() { try { if (wl) wl.release(); } catch (e) { } wl = null; }
/* сигнал конца отдыха/таймера, если приложение свёрнуто: звук ставится в очередь заранее */
let bgNodes = [];
function bgCancel() { bgNodes.forEach(o => { try { o.stop(); } catch (e) { } }); bgNodes = []; }
function bgSchedule() {
  bgCancel(); if (!run || run.done || run.paused || !Snd.ctx) return;
  const s = run.steps[run.i]; if (!s || (s.k !== 'time' && s.k !== 'rest')) return;
  const L = leftV() / 1000; if (!(L > 0.5)) return;
  try { if (Snd.ctx.state !== 'running') Snd.ctx.resume(); } catch (e) { }
  [0, 0.28, 0.56].forEach((d, i) => { try { const t = Snd.ctx.currentTime + L + d, o = Snd.ctx.createOscillator(), g = Snd.ctx.createGain(); o.type = 'sine'; o.frequency.value = i === 2 ? 1000 : 780; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); o.connect(g); g.connect(Snd.ctx.destination); o.start(t); o.stop(t + 0.22); bgNodes.push(o); } catch (e) { } });
  try { if (navigator.vibrate) setTimeout(() => navigator.vibrate([200, 100, 200]), L * 1000); } catch (e) { }
}
document.addEventListener('visibilitychange', () => { if (!run || run.done) return; if (document.visibilityState === 'visible') { bgCancel(); wake(); } else bgSchedule(); });

let viewH = null;
const view = html => {
  const same = location.hash === viewH; viewH = location.hash;
  const y = window.scrollY, sc = [...document.querySelectorAll('#app .tabs, #app .ftabs, #app .xchips')].map(e => e.scrollLeft);
  $('#app').innerHTML = html;
  if (same) { document.querySelectorAll('#app .tabs, #app .ftabs, #app .xchips').forEach((e, i) => { if (sc[i]) e.scrollLeft = sc[i]; }); window.scrollTo(0, y); } else window.scrollTo(0, 0);
  guardImgs();
};
function guardImgs() {
  document.querySelectorAll('#app img:not([data-nr])').forEach(im => {
    let n = 0; const re = () => { if (n++ >= 3 || !im.isConnected) return; im.src = im.src.split('?')[0] + '?r=' + Date.now() + n; };
    im.onerror = re; setTimeout(() => { if (im.isConnected && (!im.complete || !im.naturalWidth)) re(); }, 3000);
  });
}
function keepView(fn) {
  const y = window.scrollY, tl = ($('.tabs') || {}).scrollLeft || 0;
  fn();
  const t = $('.tabs'); if (t) t.scrollLeft = tl;
  window.scrollTo(0, y);
}
const route = () => {
  const h = location.hash.slice(1), a = h.startsWith('prog-') ? 'p' : h === 'history' ? 'h' : h === 'stats' ? 's' : h === 'profile' ? 'f' : h === 'workout' ? 'w' : '', b = h.slice(5);
  if (reloadLater && a !== 'w') { location.reload(); return; }
  if (run && a !== 'w') { closePlan(); clearInterval(timer); Voice.stop(); Snd.stop(); unwake(); run = null; }
  if (a === 'p' && prog(b) && !prog(b).stub) return viewProgram(b);
  if (h === 'meas') return viewMeas();
  if (h === 'records') return XT.viewRecords();
  if (h === 'wrep') return XT.viewWrep();
  if (h === 'mchart') return XT.viewChart();
  if (h === 'photos') return XT.viewPhotos();
  if (h === 'food') return viewFood();
  if (h === 'fmeal') return viewMeal();
  if (h === 'build') return viewBuild();
  if (h === 'lib') return viewLib(false);
  if (h === 'libpick') return viewLib(true);
  if (h.startsWith('ex-')) return viewEx(h.slice(3));
  if (h === 'fadd') return viewFoodAdd();
  if (h === 'tips') return XT.viewBlog();
  if (h === 'tipsl') return XT.viewTipsList();
  if (h === 'recipes') return XT.viewRecipes();
  if (h.startsWith('art-') && ARTICLES.some(x => x.id === h.slice(4))) return viewArticle(h.slice(4));
  if (h.startsWith('sum-')) return viewSummary(+h.slice(4));
  if (a === 'h') return viewHistory();
  if (a === 's') return viewStats();
  if (a === 'f') return viewProfile();
  if (a === 'w') { if (run) return renderRun(); location.hash = '#home'; return; }
  return viewHome();
};
const navStk = [location.hash || '#home'];
function goBack(fb) { if (navStk.length > 1) history.back(); else go(fb); }
window.addEventListener('hashchange', () => { const h = location.hash || '#home'; if (navStk.length > 1 && navStk[navStk.length - 2] === h) navStk.pop(); else if (navStk[navStk.length - 1] !== h) navStk.push(h); route(); });
const go = h => { location.hash = h; };

const doneDays = pid => new Set(hist().filter(h => h.pid === pid).map(h => h.day));
function currentDay(p) {
  const saved = store.get('day:' + p.id, null); if (saved) return saved;
  const done = doneDays(p.id); let d = 1; while (done.has(d) && d < 100000) d++; return d;
}
function tonnage(day) { return day.items.reduce((s, it) => it.sets && !it.bw ? s + it.sets.reduce((a, b) => a + b, 0) * getW(it.ex, it.weight) * (EX[it.ex].one ? 1 : 2) : s, 0); }
const kcalOf = (day, ton) => Math.round(((ton > 0 ? 4.5 : 3.8) - 1) * profile().w * day.minutes * 0.0175);
function dayStats(p, d) {
  const day = dayData(p, d), ton = tonnage(day);
  return { kcal: kcalOf(day, ton), min: day.minutes, ton };
}

function nav(on) {
  return `<div class="nav"><div>
    <button class="${on === 'home' ? 'on' : ''}" data-go="#home">${I.dumb}Тренировки</button>
    <button class="${on === 'food' ? 'on' : ''}" data-go="#food">${I.food}Питание</button>
    <button class="${on === 'stats' ? 'on' : ''}" data-go="#stats">${I.chart}Аналитика</button>
    <button class="${on === 'tips' ? 'on' : ''}" data-go="#tips">${I.book}Блог</button>
    </div></div>`;
}
const bolts = lv => `<span class="bolts" aria-label="Сложность ${lv} из 5">${[1, 2, 3, 4, 5].map(k => `<span class="ic ${k <= lv ? 'on' : ''}">${I.bolt}</span>`).join('')}</span>`;
const sched = () => Object.assign({ rest: [5, 6], plan: 0 }, store.get('sched', {}));
const wdi = d => (d.getDay() + 6) % 7;
const WD = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
const pluralDays = n => { const a = n % 100, b = n % 10; return n + (a > 10 && a < 15 ? ' дней' : b === 1 ? ' день' : b > 1 && b < 5 ? ' дня' : ' дней'); };
const MASC = '<img class="emas" src="img/mascot.webp" alt="" onerror="this.remove()">';
function trainWeek() {
  const sc = sched(), h = hist(), days = new Set(h.map(x => dkey(x.ts))), now = new Date(), t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const first = h.length ? Math.min(...h.map(x => x.ts)) : Date.now();
  let streak = 0;
  for (let i = 0, d = new Date(t0); i < 800 && d.getTime() >= first - 864e5 * 8; i++, d.setDate(d.getDate() - 1)) {
    if (days.has(dkey(d))) streak++;
    else if (sc.rest.includes(wdi(d)) || i === 0) continue;
    else break;
  }
  const mon = new Date(t0); mon.setDate(mon.getDate() - wdi(t0));
  const cells = WD.map((n, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); const k = dkey(d), rest = sc.rest.includes(i), done = days.has(k), today = k === dkey(t0), future = d > t0; return { n, rest, done, today, future }; });
  const work = 7 - sc.rest.length, plan = sc.plan || Math.max(1, work), cnt = cells.filter(c => c.done).length;
  return { streak, cells, plan, cnt, restToday: sc.rest.includes(wdi(t0)) };
}
function weekStrip(cls) {
  const w = trainWeek();
  const mas = cls ? '' : '<img class="tmas" src="img/m_' + (!w.streak ? 'out' : w.restToday ? 'rest' : 'fire') + '.webp" alt="" onerror="this.remove()">';
  return `<div class="tws ${cls || ''}">${mas}<div class="twh"><b>${w.streak ? 'Серия: ' + pluralDays(w.streak) : 'Серии пока нет'}</b><small>за неделю ${w.cnt} из ${w.plan}</small></div><div class="twd">${w.cells.map(c => `<div class="twc ${c.done ? 'done' : ''} ${c.rest ? 'rest' : ''} ${c.today ? 'today' : ''} ${c.future ? 'fut' : ''}"><span>${c.n}</span><i>${c.done ? '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : c.rest ? '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/></svg>' : ''}</i></div>`).join('')}</div></div>`;
}
function viewHome() {
  const vg = visGroups(), g0 = store.get('grp', 'abs'), g = vg.some(x => x.id === g0) ? g0 : vg[0].id, P = profile(), rec = recommend(P), recIds = new Set(rec.items.map(x => x.pid));
  if (!P.set && !sessionStorage.getItem('tr-ask')) { try { sessionStorage.setItem('tr-ask', '1'); } catch (e) { } return go('#profile'); }
  const favs = store.get('fav', []);
  const cardPhoto = id => (P.gender === 'female' && (typeof FEM_PHOTOS !== 'undefined') && FEM_PHOTOS.includes(id)) ? id + '_f' : id;
  const card = p => {
    const done = doneDays(p.id), fv = favs.includes(p.id);
    return `<div class="pcard ${p.stub ? 'stub' : ''} ${p.custom ? 'cust' : ''}">${p.custom ? '' : `<img class="pph" src="img/c/${cardPhoto(p.id)}.jpg" alt="" loading="lazy">`}<button class="pmain" data-${p.stub ? 'stub' : 'go'}="${p.stub ? p.id : '#prog-' + p.id}"><b>${esc(p.title)}</b>${bolts(p.level)}
      <em>${p.stub ? 'скоро' : 'выполнено: ' + done.size}</em><span>${esc(p.card)}</span></button>
      ${recIds.has(p.id) ? '<i class="forme">Для тебя</i>' : ''}
      <button class="pfav ${fv ? 'on' : ''}" data-fav="${p.id}" aria-label="${fv ? 'Убрать из избранного' : 'В избранное'}" aria-pressed="${fv}">${fv ? I.starOn : I.star}</button>
      <button class="phelp" data-help="${p.id}" aria-label="Что нужно уметь">${I.help}</button>
      <div class="preq"><b>Что нужно уметь и знать</b>${esc(p.req)}</div></div>`;
  };
  const favCards = favs.map(id => PROGRAMS.find(p => p.id === id)).filter(p => p && !p.stub).map(card).join('');
  const cards = (favCards ? `<div class="sh favh">${I.starOn}Избранное</div>${favCards}<div class="sh favh dim">${esc(GROUPS.find(x => x.id === g).title)}</div>` : '') + (g === 'my' ? PROGRAMS.filter(p => p.group === g && passF(p)).map(p => card(p) + `<div class="cact"><button data-ce="${p.id}">Изменить</button><button data-cd="${p.id}">Удалить</button></div>`).join('') : PROGRAMS.filter(p => p.group === g && passF(p)).map(card).join('')) || '<div class="empty small">Ничего не найдено. Измени или сбрось фильтры.</div>';
  view(`<div class="screen has-nav">
    <div class="bar"><button class="rbtn" data-go="#profile" aria-label="Профиль">${P.gender === 'female' ? I.female : I.male}</button><h1>Тренер<small>${esc(GROUPS.find(x => x.id === g).title)}</small></h1><button class="rbtn" id="gear" aria-label="Настройки">${I.gear}</button></div>
    <div class="tabs">${vg.map(x => `<button class="tab ${x.id === g ? 'on' : ''}" data-grp="${x.id}">${x.title}</button>`).join('')}</div>
    ${weekStrip()}
    <div class="hact"><button id="hf" class="${pfCount(PF()) ? 'on' : ''}">Фильтры${pfCount(PF()) ? ' · ' + pfCount(PF()) : ''}</button><button id="hlib">Упражнения</button><button id="hed">Изменить экран</button></div>
    ${g === 'my' ? '<button class="wopt hnew" id="hnew"><div><b>Создать свою программу</b><small>выбери упражнения, подходы и повторения</small></div><span class="lpl">+</span></button>' : ''}
    ${HC().reco ? `<button class="recobar" data-go="#profile"><span>Подобрано для тебя</span><small>${rec.items.map(x => esc(prog(x.pid).title)).join(' · ')}</small>${I.r}</button>` : ''}
    ${cards}
    <div class="hint">Новые программы добавляются в файл data.js (см. README).<br>Анимации упражнений © Gym visual (gymvisual.com).</div>
    ${nav('home')}</div>`);
  bindHome();
  const on0 = $('.tab.on'); if (on0) { const tb = $('.tabs'); tb.scrollLeft = on0.offsetLeft - tb.offsetLeft - (tb.clientWidth - on0.offsetWidth) / 2; }
}

function viewTips() {
  view(`<div class="screen has-nav">
    <div class="bar"><span class="rbtn ghost"></span><h1>Советы<small>Питание, восстановление, техника</small></h1><span class="rbtn ghost"></span></div>
    ${ARTICLES.map(a => `<button class="acard" data-go="#art-${a.id}"><img src="img/a/${a.img}.jpg" alt="" loading="lazy"><span class="atag">${esc(a.tag)}</span><b>${esc(a.title)}</b><small>${esc(a.sub)}</small></button>`).join('')}
    ${nav('tips')}</div>`);
}
function viewArticle(id) {
  const a = ARTICLES.find(x => x.id === id);
  let list = false, out = '';
  a.body.forEach(t => {
    const li = t.startsWith('- ');
    if (list && !li) { out += '</ul>'; list = false; }
    if (li) { if (!list) { out += '<ul>'; list = true; } out += `<li>${esc(t.slice(2))}</li>`; }
    else if (t.startsWith('## ')) out += `<h3>${esc(t.slice(3))}</h3>`;
    else out += `<p>${esc(t)}</p>`;
  });
  if (list) out += '</ul>';
  view(`<div class="screen has-nav">
    <div class="bar"><button class="rbtn" data-back="#tipsl" aria-label="Назад">${I.back}</button><h1>Статья<small>${esc(a.tag)}</small></h1><span class="rbtn ghost"></span></div>
    <img class="ahero" src="img/a/${a.img}.jpg" alt="">
    <article class="art"><h2>${esc(a.title)}</h2>${out}</article>
    ${nav('tips')}</div>`);
}

function viewProfile() {
  const P = profile(), seg = (k, list) => `<div class="seg wide">${list.map(([v, t]) => `<button data-pk="${k}" data-pv="${v}" class="${String(P[k]) === String(v) ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  const pick = (k, v, t) => `<button class="opt pick ${String(P[k]) === String(v) ? 'on' : ''}" data-pk="${k}" data-pv="${v}"><div>${esc(t)}</div></button>`;
  const U = nutCfg().units || 'met', wpick = (k, v, t) => `<button class="wopt ${String(P[k]) === String(v) ? 'on' : ''}" data-pk="${k}" data-pv="${v}"><div><b>${esc(t)}</b></div><span class="wrad"></span></button>`;
  const num_ = (k, label, unit, step) => `<div class="opt"><div>${label}</div><div class="nin"><input type="number" inputmode="decimal" data-nk="${k}" step="${step}" value="${P[k]}"><span>${unit}</span></div></div>`;
  const rec = recommend(P), INV = getInv();
  view(`<div class="screen">
    <div class="bar"><button class="rbtn" data-back="#home" aria-label="Назад">${I.back}</button><h1>Профиль<small>Подбор программ</small></h1><span class="rbtn ghost"></span></div>
    <div class="pfw">
    <div class="wlab">Пол</div><div class="wgen">${[['female', 'Девушка', WI.fem], ['male', 'Мужчина', WI.mal]].map(([k, t, ic_]) => `<button class="${P.gender === k ? 'on' : ''}" data-pk="gender" data-pv="${k}">${ic_}${t}</button>`).join('')}</div>
    ${[['h', 'Рост', fmtH(P.h, U)], ['w', 'Вес', fmtW(P.w, U)], ['goal', 'Желаемый вес', fmtW(P.goal, U)]].map(([k, t, v]) => `<div class="wlab">${t}</div><button class="wrow" data-pr="${k}"><span>${v}</span></button>`).join('')}
    ${(() => { const bf = bodyFat(P, nutCfg().age); return bf ? `<div class="note" style="margin:14px 0 0">Оценка процента жира: около ${num(bf)}%. Ориентир по формуле Деуренберга, погрешность до 5%.</div>` : ''; })()}
    <div class="wlab">Сколько занимаешься спортом</div><div class="wlist">${expsList(P.gender).map((t, i) => wpick('exp', i, t)).join('')}</div>
    <div class="wlab">Повседневная активность</div><div class="wlist">${ACTS.map((t, i) => wpick('act', i, t)).join('')}</div>
    </div>
    <div class="glab">Замеры тела</div><div class="grp"><button class="opt pick chev" data-go="#meas"><div>Обхваты и динамика<small>${esc(measSummary())}</small></div><img class="mlm" src="img/m_${tapeKey()}.webp" alt="" onerror="this.remove()"></button></div>
    <div class="glab">Инвентарь</div><div class="grp"><button class="opt pick chev" id="invopen"><div>Что у тебя есть<small>${esc(invSummary(INV))}</small></div></button></div>
    <div class="gfoot">Нужен для программ с гантелями, турником и резинками. Для программ зала не нужен.</div>
    <div class="sh">${ic('chart')}Рекомендуем</div>
    <div class="recs">${rec.items.map(x => { const p = prog(x.pid); return `<button class="rrow" data-${p.stub ? 'stub' : 'go'}="${p.stub ? p.id : '#prog-' + p.id}"><div><b>${esc(p.title)}</b><small>${esc(GROUPS.find(g => g.id === p.group).title)} · ${esc(x.why)}</small></div>${bolts(p.level)}</button>`; }).join('')}</div>
    <div class="stat3"><div><b>${num(rec.bmi.toFixed(1))}</b><small>индекс массы тела</small></div><div><b>${rec.goal === 'gain' ? 'набор' : rec.goal === 'lose' ? 'снижение' : 'тонус'}</b><small>цель</small></div><div><b>${rec.level} / 5</b><small>уровень</small></div></div>
    ${rec.notes.map(n => `<div class="note">${esc(n)}</div>`).join('')}
    <button class="big sec" id="ptest" style="display:block;width:calc(100% - 28px);margin:12px 14px 0">Тест на максимум</button>
    <button class="big" id="psave">Сохранить</button>
  </div>`);
  const cur = Object.assign({}, P, { set: true }), rerender = () => { const y = window.scrollY; viewProfile(); window.scrollTo(0, y); };
  document.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => {
    const k = b.dataset.pk, v = b.dataset.pv;
    if (k === 'gender' && v !== cur.gender) {
      const old = DEF[cur.gender], nw = DEF[v]; ['h', 'w', 'goal'].forEach(f => { if (cur[f] === old[f]) cur[f] = nw[f]; });
      if (!P.set || cur.exp === PROFILE0.exp) cur.test = null;
    }
    cur[k] = (k === 'gender') ? v : Number(v); store.set('profile', cur); rerender();
  });
  document.querySelectorAll('[data-pr]').forEach(b => b.onclick = () => { const k = b.dataset.pr; (k === 'h' ? heightWheel(cur.h, U, v => { cur.h = v; store.set('profile', cur); rerender(); }) : weightWheel(k === 'w' ? 'Вес' : 'Желаемый вес', cur[k], U, v => { cur[k] = v; store.set('profile', cur); rerender(); })); });
  document.querySelectorAll('[data-nk]').forEach(i => i.onchange = () => { const v = parseFloat(String(i.value).replace(',', '.')); if (v > 0 && v < 400) { cur[i.dataset.nk] = v; store.set('profile', cur); rerender(); } });
  $('#invopen').onclick = () => openInventory(rerender);
  $('#psave').onclick = () => { store.set('profile', cur); go('#home'); };
  $('#ptest').onclick = () => openSheet(`<h3>Тест на максимум</h3><div class="opt"><small style="font-size:14px;color:#cfcfd2">Размяться 3 минуты. Засекай по 60 секунд на каждое упражнение, между ними отдых 2 минуты. Вводи, сколько получилось, приложение подстроит число повторений под тебя.${P.test ? ' Прошлый результат множитель ×' + num(P.test.k) + '.' : ''}</small></div>
    <div class="opt"><div>Скручивания за 60 с</div><input class="tin" id="t1" type="number" inputmode="numeric" value="${P.test ? P.test.crunch : ''}"></div>
    <div class="opt"><div>Приседания за 60 с</div><input class="tin" id="t2" type="number" inputmode="numeric" value="${P.test ? P.test.squat : ''}"></div>
    <div class="opt"><div>Планка, секунд</div><input class="tin" id="t3" type="number" inputmode="numeric" value="${P.test ? P.test.plank : ''}"></div>
    <button class="big" id="tok">Рассчитать</button><button class="big sec" id="tcl">Отмена</button>`, () => {
    $('#tcl').onclick = closeSheet;
    $('#tok').onclick = () => {
      const a = +$('#t1').value, b2 = +$('#t2').value, c = +$('#t3').value; if (!(a > 0 && b2 > 0 && c > 0)) return;
      const ref = cur.gender === 'female' ? [30, 30, 45] : [35, 35, 60], k = Math.min(1.8, Math.max(0.6, Math.round((a / ref[0] + b2 / ref[1] + c / ref[2]) / 3 * 100) / 100));
      cur.test = { crunch: a, squat: b2, plank: c, k, ts: Date.now() }; store.set('profile', cur); closeSheet(); viewProfile();
    };
  });
}

function viewProgram(pid) {
  const p = prog(pid), d = currentDay(p), day = dayData(p, d), st = dayStats(p, d), done = doneDays(pid);
  const rows = day.items.map(it => {
    const e = EX[it.ex];
    if (it.sets) return `<div class="it"><img src="${thumb(it.ex)}" alt=""><div class="t"><div>${esc(e.name)}</div><small>${it.sets.join(' + ')}</small></div>${it.bw ? '' : `<button class="kg" data-w="${it.ex}" data-def="${it.weight}">${num(getW(it.ex, it.weight))} кг</button>`}</div>`;
    return `<div class="it"><img src="${thumb(it.ex)}" alt=""><div class="t"><div>${esc(e.name)}</div><small>${it.time ? fmtT(it.time) : 'x ' + it.reps}</small></div></div>`;
  }).join('');
  const inf = p.info(d, done);
  const stNames = [...new Set(day.steps.filter(x => x.stretch).map(x => EX[x.ex].name.replace('Растяжка ', '')))];
  const stretchLine = stNames.length ? `<div class="hint">${ic('check')}В конце растяжка: ${esc(stNames.join(', '))}</div>` : '';
  const stats = `<span>${ic('flame')}${st.kcal} ккал</span>${st.ton ? `<span>${ic('weight')}${st.ton.toLocaleString('ru-RU')} кг</span>` : ''}<span>${ic('timer')}${st.min} мин.</span>`;
  const dm = dayMuscles(day), gs = grpSets(dm.mus), nEx = day.items.length, lvl = ['Новичок', 'Любитель', 'Средний', 'Продвинутый', 'Эксперт'][Math.min(4, Math.max(0, (p.level || 1) - 1))];
  const mnu = (id, cur, list) => `<div class="pgmw"><button class="pgm" id="${id}">${list.find(x => x[0] === cur)[1]}<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button></div>`;
  const info = `<div class="pgsh"><h3>Распределение объёма</h3>${mnu('pgviz', pgUi.viz, [['fig', 'Экорше'], ['ring', 'График']])}</div>
    <div class="pgvb">${pgUi.viz === 'fig' ? `<div class="smfig"><div class="smf">${figSvg(bodyLevels(dm.mus), 'dark')}</div><div class="smgl">${gs.map(g => `<div><span>${g[1]}</span><i><u style="width:${g[2] ? Math.max(14, g[2] / Math.max(1, ...gs.map(q => q[2])) * 100) : 0}%"></u></i><b>${g[2]}</b></div>`).join('')}</div></div>` : ringHtml(gs)}</div>
    <div class="pgsh"><h3>Статистика</h3><span class="pgdim">Месяц</span></div>${statBlock(pid)}`;
  view(`<div class="screen pg">
    <div class="bar"><button class="rbtn" data-back="#home" aria-label="Назад">${I.back}</button><h1>Тренировки</h1><span class="rbtn ghost"></span></div>
    ${weekStrip('pgw')}
    <div class="pgc pgtop"><small>Текущая программа</small><b>${esc(p.title)}</b><div class="pgch"><span>${lvl}</span><span>${esc(inf.sub)}</span></div></div>
    <div class="pgc pgcard" id="pgcard">
      <div class="pgnav"><button id="dprev" ${d <= 1 ? 'disabled' : ''} aria-label="Предыдущий день">${I.l}</button><div class="pgt"><b>${esc(inf.label)}</b>${done.has(d) ? `<span class="done">${ic('check')}выполнен</span>` : inf.note ? `<span class="done">${esc(inf.note)}</span>` : ''}</div><button id="dnext" aria-label="Следующий день">${I.r}</button></div>
      <div class="pgtiles"><div>${ic('timer')}<b>${st.min}</b> мин</div><div>${ic('check')}<b>${nEx}</b> упр.</div><div>${ic('flame')}<b>${dm.sets}</b> сетов</div></div>
      <div class="seg pgseg"><button data-pt="info" class="${pgUi.tab === 'info' ? 'on' : ''}">Инфо</button><button data-pt="ex" class="${pgUi.tab === 'ex' ? 'on' : ''}">Упражнения</button></div>
      ${pgUi.tab === 'info' ? info : `<div class="items">${rows}</div>${stretchLine}`}
    </div>
    <div class="pgfoot"><button class="big" id="start">${I.play}${done.has(d) ? 'Повторить тренировку' : 'Начать тренировку'}</button></div></div>`);
  document.querySelectorAll('[data-pt]').forEach(b => b.onclick = () => { pgUi.tab = b.dataset.pt; viewProgram(pid); });
  if ($('#pgviz')) $('#pgviz').onclick = e => popMenu(e.currentTarget, [['fig', 'Экорше'], ['ring', 'График']], pgUi.viz, v => { pgUi.viz = v; viewProgram(pid); });
  if ($('#pgmet')) $('#pgmet').onclick = e => popMenu(e.currentTarget, [['w', 'Вес'], ['s', 'Подходы'], ['t', 'Время']], pgUi.met, v => { pgUi.met = v; viewProgram(pid); });
  const cardEl = $('#pgcard'); let tx = null;
  cardEl.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  cardEl.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 70) { const nd = d + (dx < 0 ? 1 : -1); if (nd >= 1) { store.set('day:' + pid, nd); viewProgram(pid); } } });
  if (!store.get('hintStart', 0)) { store.set('hintStart', 1); const hb = document.createElement('div'); hb.className = 'pghint'; hb.innerHTML = '<button aria-label="Закрыть">' + I.close + '</button><b>Старт тренировки</b><p>«Начать тренировку» запускает выбранный день. Листай день стрелками или свайпом.</p>'; document.body.appendChild(hb); hb.querySelector('button').onclick = () => hb.remove(); setTimeout(() => hb.remove(), 9000); }
  $('#dprev').onclick = () => { store.set('day:' + pid, d - 1); viewProgram(pid); };
  $('#dnext').onclick = () => { store.set('day:' + pid, d + 1); viewProgram(pid); };
  $('#start').onclick = () => {
    const last = hist().filter(h => h.pid === pid).sort((a, b) => b.ts - a.ts)[0];
    const days = last ? Math.round((new Date().setHours(0, 0, 0, 0) - new Date(last.ts).setHours(0, 0, 0, 0)) / 864e5) : 99;
    if (p.restDays && days <= p.restDays) {
      openSheet(`<div class="mmid"><img class="rmas" src="img/m_rest.webp" alt="" onerror="this.remove()"></div><h3>Сегодня по плану отдых</h3><div class="opt"><small>${days === 0 ? 'Сегодня уже была тренировка.' : 'Вчера была тренировка.'} Между тренировками этой программы нужен день отдыха.</small></div><button class="big sec" id="rc">Отдохнуть</button><button class="big" id="rg">Всё равно начать</button>`, () => {
        $('#rc').onclick = closeSheet; $('#rg').onclick = () => { closeSheet(); chooseMode(); };
      });
    } else chooseMode();
  };
  const chooseMode = () => {
    const hasDb = p.group !== 'gym' && day.steps.some(st => st.db && !st.bw && !EX[st.ex].one);
    if (!hasDb) return startWorkout(pid, d);
    const list = dbList(), hasMix = new Set(list).size >= 2;
    openSheet(`<h3>Как берём гантели сегодня?</h3><div class="opt"><small>Если рука болит или удобнее с одной гантелью, выбери вариант. План и озвучка подстроятся.</small></div>
      <button class="big" id="m0">По моему инвентарю</button>
      <button class="big sec" id="m1">Одна гантель на обе руки</button>
      ${hasMix ? '<button class="big sec" id="m2">Две разные гантели</button>' : ''}`, () => {
      $('#m0').onclick = () => { closeSheet(); startWorkout(pid, d, 'auto'); };
      $('#m1').onclick = () => { closeSheet(); startWorkout(pid, d, 'single'); };
      const m2 = $('#m2'); if (m2) m2.onclick = () => { closeSheet(); startWorkout(pid, d, 'mix'); };
    });
  };

}

function viewHistory() {
  const h = hist().slice().sort((a, b) => b.ts - a.ts);
  const sec = h.reduce((s, x) => s + x.sec, 0), kcal = h.reduce((s, x) => s + x.kcal, 0), ton = h.reduce((s, x) => s + (x.ton || 0), 0);
  const hh = Math.floor(sec / 3600), mm = Math.floor(sec % 3600 / 60);
  let last = '', rows = '';
  h.forEach(x => {
    const lab = new Date(x.ts).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    if (lab !== last) { rows += `<div class="dh">${lab}</div>`; last = lab; }
    rows += `<div class="hrow" data-sum="${x.ts}"><div class="l"><div>${esc(x.title)}</div><small>День ${x.day}${x.ton ? ' · ' + x.ton.toLocaleString('ru-RU') + ' кг' : ''}</small></div><div class="r">${ic('flame')}${x.kcal}<br>${ic('timer')}${fmtT(x.sec)}</div></div>`;
  });
  view(`<div class="screen has-nav">
    <div class="bar"><button class="rbtn" data-back="#home" aria-label="Назад">${I.back}</button><h1>История<small>Статистика</small></h1><span class="rbtn ghost"></span></div>
    <div class="sum"><div class="c"><b>${hh}ч ${mm}м</b><small>время</small></div><div class="c"><b>${ton ? (ton / 1000).toFixed(1).replace('.', ',') + ' т' : h.length}</b><small>${ton ? 'вес' : 'тренировок'}</small></div><div class="c"><b>${kcal}</b><small>ккал</small></div></div>
    ${rows || '<div class="empty"><img class="emas" src="img/m_hist.webp" alt="" onerror="this.remove()"><br>Пока пусто. Закончи первую тренировку, она появится здесь.</div>'}
    <div style="text-align:center"><button class="link" id="exp">Скопировать историю</button><button class="link" id="imp">Восстановить из копии</button></div>
    ${nav('hist')}</div>`);
  $('#exp').onclick = XT.openBackup;
  $('#imp').onclick = XT.openRestore;
}

const GCOL = { abs: '#ff6b3d', db: '#f2f2f4', legs: '#f0b429', glutes: '#e86fa0', back: '#4aa8ff', chest: '#4cc38a', gym: '#a78bfa' };
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MSHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const dkey = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const gcol = x => { const p = prog(x.pid); return GCOL[p ? p.group : 'abs'] || GCOL.abs; };
const fmtDur = s => { const h = Math.floor(s / 3600), m = Math.round(s % 3600 / 60); return h ? `${h} ч ${m} мин` : `${m} мин`; };
const statUi = Object.assign({ period: 30 }, store.get('statui', {}));
let calMonth = null, calSel = null;

function ringSvg(items) {
  const n = items.length, R = 15, C = 2 * Math.PI * R, gap = n > 1 ? Math.min(6, C / n / 3) : 0, len = C / n - gap;
  return `<svg class="ring" viewBox="0 0 36 36" aria-hidden="true">${items.map((x, i) =>
    `<circle cx="18" cy="18" r="${R}" fill="none" stroke="${gcol(x)}" stroke-width="2.8" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" transform="rotate(${(-90 + (i * 360 / n) + gap / C * 180).toFixed(2)} 18 18)"/>`).join('')}</svg>`;
}

function calendarHtml(h) {
  const by = {}; h.forEach(x => (by[dkey(x.ts)] = by[dkey(x.ts)] || []).push(x));
  const y = calMonth.getFullYear(), m = calMonth.getMonth(), first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), today = dkey(Date.now());
  let cells = '';
  for (let i = 0; i < first; i++) cells += '<i></i>';
  for (let d = 1; d <= days; d++) {
    const k = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'), it = (by[k] || []).sort((a, b) => a.ts - b.ts);
    cells += `<button class="cd ${it.length ? 'has' : ''} ${k === today ? 'today' : ''} ${k === calSel ? 'sel' : ''}" data-k="${k}" aria-label="${d} ${MONTHS[m]}${it.length ? ', тренировок: ' + it.length : ''}">${it.length ? ringSvg(it) : ''}<span>${d}</span>${it.length > 1 ? `<b>${it.length}</b>` : ''}</button>`;
  }
  const list = (by[calSel] || []).sort((a, b) => a.ts - b.ts);
  const dt = calSel ? new Date(calSel + 'T12:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  const det = list.length
    ? list.map(x => `<div class="hrow"><div class="l"><div><i class="dot" style="background:${gcol(x)}"></i>${esc(x.title)}</div><small>День ${x.day} · ${new Date(x.ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}${x.ton ? ' · ' + x.ton.toLocaleString('ru-RU') + ' кг' : ''}</small></div><div class="r">${ic('flame')}${x.kcal}<br>${ic('timer')}${fmtT(x.sec)}</div></div>`).join('')
    : '<div class="empty small">В этот день тренировок не было.</div>';
  const leg = GROUPS.map(g => `<span><i class="dot" style="background:${GCOL[g.id]}"></i>${esc(g.title)}</span>`).join('');
  return `<div class="cal"><div class="calh"><button id="cprev" aria-label="Предыдущий месяц">${I.l}</button><b>${MONTHS[m]} ${y}</b><button id="cnext" aria-label="Следующий месяц">${I.r}</button></div>
    <div class="cw"><span>пн</span><span>вт</span><span>ср</span><span>чт</span><span>пт</span><span>сб</span><span>вс</span></div>
    <div class="cg">${cells}</div>
    <div class="cleg">${leg}<span class="cnote"><b class="cb">2</b> несколько тренировок: кольцо делится на части</span></div></div>
    <div class="dh">${esc(dt)}</div>${det}`;
}

function buckets(h, period) {
  const now = new Date(), out = []; now.setHours(0, 0, 0, 0);
  if (period === 7 || period === 30) {
    for (let i = period - 1; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); out.push({ from: +d, to: +d + 864e5, label: d.getDate() + ' ' + MSHORT[d.getMonth()], short: String(d.getDate()), long: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }) }); }
  } else {
    let n = 12;
    if (period === 0) { const mn = h.length ? Math.min(...h.map(x => x.ts)) : +now, f = new Date(mn); n = Math.min(36, Math.max(6, (now.getFullYear() - f.getFullYear()) * 12 + now.getMonth() - f.getMonth() + 1)); }
    for (let i = n - 1; i >= 0; i--) { const a = new Date(now.getFullYear(), now.getMonth() - i, 1), b = new Date(now.getFullYear(), now.getMonth() - i + 1, 1); out.push({ from: +a, to: +b, label: MSHORT[a.getMonth()] + ' ' + a.getFullYear(), short: MSHORT[a.getMonth()], long: MONTHS[a.getMonth()] + ' ' + a.getFullYear(), mon: 1 }); }
  }
  out.forEach(b => { b.items = h.filter(x => x.ts >= b.from && x.ts < b.to); });
  return out;
}

const niceMax = v => { if (v <= 0) return 4; const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
function barChart(id, bs, val, unit, color, what = 'тренировками') {
  const W = 340, H = 168, L = 34, T = 8, B = 22, pw = W - L - 6, ph = H - T - B, vals = bs.map(val), mx = niceMax(Math.max(...vals)), n = bs.length, step = pw / n, bw = Math.max(3, Math.min(22, step - 3));
  const every = Math.ceil(n / 7);
  let g = '';
  [0, 0.5, 1].forEach(f => { const y = T + ph - ph * f; g += `<line x1="${L}" x2="${W - 6}" y1="${y}" y2="${y}" class="gl ${f === 0 ? 'base' : ''}"/><text x="${L - 6}" y="${y + 3.5}" text-anchor="end" class="ax">${Math.round(mx * f)}</text>`; });
  bs.forEach((b, i) => {
    const x = L + step * i + step / 2, h = vals[i] / mx * ph, r = Math.min(4, bw / 2, h);
    if (vals[i] > 0) g += `<path class="bar" data-i="${i}" fill="${color}" d="M${x - bw / 2} ${T + ph}V${T + ph - h + r}Q${x - bw / 2} ${T + ph - h} ${x - bw / 2 + r} ${T + ph - h}H${x + bw / 2 - r}Q${x + bw / 2} ${T + ph - h} ${x + bw / 2} ${T + ph - h + r}V${T + ph}Z"/>`;
    if (i % every === (n - 1) % every) g += `<text x="${x}" y="${H - 6}" text-anchor="middle" class="ax">${b.short}</text>`;
    g += `<rect class="hit" data-i="${i}" x="${L + step * i}" y="${T}" width="${step}" height="${ph + B - 4}"/>`;
  });
  const tot = vals.reduce((a, c) => a + c, 0), act = vals.filter(v => v > 0).length;
  const dflt = tot ? `Среднее в ${bs[0].mon ? 'месяц' : 'день'} с ${what}: ${Math.round(tot / act)} ${unit} · максимум: ${Math.max(...vals)} ${unit}` : 'Нет данных за период';
  return `<div class="chart" id="${id}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Гистограмма: ${unit}">${g}</svg><div class="cap" data-d="${esc(dflt)}">${esc(dflt)}</div></div>`;
}
function bindChart(id, bs, val, unit) {
  const el = $('#' + id), cap = $('.cap', el), bars = el.querySelectorAll('.bar');
  const show = i => { const v = val(bs[i]); cap.textContent = `${bs[i].long}: ${v} ${unit}`; bars.forEach(b => b.classList.toggle('dim', +b.dataset.i !== i)); };
  const clear = () => { cap.textContent = cap.dataset.d; bars.forEach(b => b.classList.remove('dim')); };
  el.querySelectorAll('.hit').forEach(r => { r.onpointerenter = () => show(+r.dataset.i); r.onclick = () => show(+r.dataset.i); });
  el.onpointerleave = e => { if (e.pointerType === 'mouse') clear(); };
}

function viewStats() {
  if (statUi.mode === 'food') return viewStatsFood();
  const h = hist(), P = statUi.period;
  if (!calMonth) { calMonth = new Date(); calMonth.setDate(1); calMonth.setHours(0, 0, 0, 0); }
  if (!calSel) calSel = dkey(Date.now());
  const bs = buckets(h, P), inP = bs.reduce((a, b) => a.concat(b.items), []);
  const all = P === 0 ? h : inP;
  const sec = all.reduce((s, x) => s + x.sec, 0), kcal = all.reduce((s, x) => s + x.kcal, 0), ton = all.reduce((s, x) => s + (x.ton || 0), 0);
  const kc = b => b.items.reduce((s, x) => s + x.kcal, 0), mn = b => Math.round(b.items.reduce((s, x) => s + x.sec, 0) / 60);
  const seg = [[7, '7 дней'], [30, '30 дней'], [365, 'Год'], [0, 'Всё']].map(([v, t]) => `<button data-p="${v}" class="${P === v ? 'on' : ''}">${t}</button>`).join('');
  const tile = (i, v, l) => `<div class="tile">${ic(i)}<b>${v}</b><small>${l}</small></div>`;
  view(`<div class="screen has-nav">
    <div class="bar"><button class="rbtn" data-go="#history" aria-label="История">${I.timer}</button><h1>Аналитика<small>Календарь и итоги</small></h1><button class="rbtn" data-ach aria-label="Достижения">${ACH.icon()}</button></div>
    ${modeSwitch()}
    ${XT.statTiles(0)}
    <div id="calbox">${calendarHtml(h)}</div>
    <div class="sh">${ic('chart')}Итоги</div>
    <div class="seg wide">${seg}</div>
    <div class="tiles">${tile('check', all.length, 'тренировок')}${tile('timer', fmtDur(sec), 'общее время')}${tile('flame', kcal.toLocaleString('ru-RU'), 'ккал всего')}${tile('weight', ton ? (ton / 1000).toFixed(1).replace('.', ',') + ' т' : '0', 'общий вес')}</div>
    <div class="ch"><h3>Калории ${P === 365 || P === 0 ? 'по месяцам' : 'по дням'}</h3>${barChart('c1', bs, kc, 'ккал', '#ff6b3d')}</div>
    <div class="ch"><h3>Время ${P === 365 || P === 0 ? 'по месяцам' : 'по дням'}</h3>${barChart('c2', bs, mn, 'мин', '#ffffff')}</div>
    ${nav('stats')}</div>`);
  bindChart('c1', bs, kc, 'ккал'); bindChart('c2', bs, mn, 'мин'); bindMode();
  $('.seg.wide:not(.amode)').querySelectorAll('button').forEach(b => b.onclick = () => { statUi.period = +b.dataset.p; store.set('statui', statUi); keepView(viewStats); });
  const bindCal = () => {
    $('#cprev').onclick = () => { calMonth.setMonth(calMonth.getMonth() - 1); redraw(); };
    $('#cnext').onclick = () => { calMonth.setMonth(calMonth.getMonth() + 1); redraw(); };
    document.querySelectorAll('.cd').forEach(b => b.onclick = () => { calSel = b.dataset.k; redraw(); });
  };
  const redraw = () => { $('#calbox').innerHTML = calendarHtml(h); bindCal(); };
  bindCal();
}

function openSheet(html, bind) {
  const s = $('#sheet'), m = html.match(/^\s*<h3>([\s\S]*?)<\/h3>/);
  if (m) html = `<div class="grab"></div><div class="whd"><h3>${m[1]}</h3><button class="wx" id="wxc" aria-label="Закрыть">${I.close}</button></div>` + html.slice(m[0].length);
  s.hidden = false; s.innerHTML = `<div class="in">${html}</div>`;
  const x = $('#wxc'); if (x) x.onclick = closeSheet;
  if (bind) bind(s);
}
const closeSheet = () => { $('#sheet').hidden = true; };

const ruVoices = () => ('speechSynthesis' in window ? speechSynthesis.getVoices().filter(v => /^ru/i.test(v.lang)) : []);
function voiceQuality(v) { const t = (v.name + ' ' + v.voiceURI).toLowerCase(); return /premium|премиум/.test(t) ? 'премиум' : /enhanced|улучш|расшир/.test(t) ? 'улучшенный' : /siri/.test(t) ? 'Siri' : 'стандартный'; }
function voiceOptions() {
  const vs = ruVoices(), seen = {};
  return vs.map(v => { let l = `${v.name} · ${voiceQuality(v)}`; seen[l] = (seen[l] || 0) + 1; if (seen[l] > 1) l += ` (${seen[l]})`; return `<option value="${esc(v.voiceURI)}" ${settings.voice === v.voiceURI ? 'selected' : ''}>${esc(l)}</option>`; }).join('');
}

const EQ_SVG = {
  db: '<svg viewBox="0 0 160 90"><g fill="#2a2a2c" stroke="#e6e6ea" stroke-width="3" stroke-linejoin="round"><rect x="22" y="24" width="14" height="42" rx="5"/><rect x="36" y="31" width="9" height="28" rx="3"/><rect x="124" y="24" width="14" height="42" rx="5"/><rect x="115" y="31" width="9" height="28" rx="3"/></g><path d="M45 45H115" stroke="#e6e6ea" stroke-width="6" stroke-linecap="round"/><path d="M62 40v10M72 40v10M82 40v10M92 40v10M102 40v10" stroke="#8e8e93" stroke-width="1.6"/></svg>',
  bar: '<svg viewBox="0 0 160 90"><path d="M16 22H144" stroke="#e6e6ea" stroke-width="7" stroke-linecap="round"/><g fill="#2a2a2c" stroke="#e6e6ea" stroke-width="3"><rect x="14" y="14" width="10" height="16" rx="3"/><rect x="136" y="14" width="10" height="16" rx="3"/></g><g fill="none" stroke="#e6e6ea" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="80" cy="42" r="6"/><path d="M68 24L72 32M92 24L88 32"/><path d="M72 32v14M88 32v14M72 46h16M80 48v18M80 66l-8 14M80 66l8 14"/></g></svg>',
  bands: '<svg viewBox="0 0 160 90"><rect x="18" y="26" width="124" height="38" rx="19" fill="none" stroke="#e6e6ea" stroke-width="6"/><rect x="30" y="38" width="100" height="14" rx="7" fill="none" stroke="#8e8e93" stroke-width="2.5" stroke-dasharray="3 6"/></svg>',
};
const INV0 = { db: '', bands: false, mini: false, tread: false, bike: false, bar: true };
const getInv = () => Object.assign({}, INV0, profile().inv || {});
const eqImg = k => 'img/eq_' + k + '_' + (profile().gender === 'female' ? 'f' : 'm') + '.webp';
const dbMode = v => v.dbMode || (v.db ? 'own' : 'any');
function saveInv(patch) { const p = store.get('profile', {}); p.inv = Object.assign({}, INV0, p.inv || {}, patch); store.set('profile', p); }
function invSummary(v) {
  const parts = [dbMode(v) === 'own' && v.db ? 'гантели ' + v.db.replace(/\s+/g, ' ') + ' кг' : 'гантели любые', v.bar ? 'турник' : 'без турника'];
  if (v.bands) parts.push('резинка'); if (v.mini) parts.push('мини-резинка'); if (v.tread) parts.push('дорожка'); if (v.bike) parts.push('велотренажёр'); return parts.join(' · ');
}
function openInventory(onClose) {
  const s = $('#sheet'); s.hidden = false;
  const sw = (k, on) => `<button class="sw ${on ? 'on' : ''}" role="switch" aria-checked="${on}" data-eq="${k}" aria-label="${k}"></button>`;
  const draw = () => {
    const v = getInv(), mode = dbMode(v), list = mode === 'own' ? dbList() : [];
    const y = (s.querySelector('.in') || {}).scrollTop || 0;
    s.innerHTML = `<div class="in"><h3>Инвентарь</h3>
      <div class="eq"><div class="pic"><img src="${eqImg('db')}" alt=""></div><div class="eqh"><div>Гантели<small>какие есть дома</small></div></div>
        <div class="seg wide" style="margin:10px 0 0"><button data-dm="any" class="${mode === 'any' ? 'on' : ''}">Любые пары</button><button data-dm="own" class="${mode === 'own' ? 'on' : ''}">Свои</button></div>
        ${mode === 'own' ? `<div class="chips">${list.map((w, i) => `<button class="chp" data-rm="${i}">${num(w)} кг<i>×</i></button>`).join('') || '<small class="dim">Добавь вес каждой гантели</small>'}</div>
        <div class="addrow"><input id="dbw" type="text" inputmode="decimal" placeholder="Вес, кг"><button class="addbtn" id="dbadd">Добавить</button></div>
        <small class="dim">Две гантели одного веса: добавь вес дважды. Если есть разные гантели, подход делается в два захода со сменой рук.</small>` : '<small class="dim">Считаем, что есть пары гантелей любого веса.</small>'}</div>
      ${[['bar', 'Турник', 'подтягивания и висы', v.bar], ['bands', 'Резинка силовая', 'длинная, для тяги и жима', v.bands], ['mini', 'Резинка-петля', 'мини-петля для ног и ягодиц', v.mini], ['tread', 'Беговая дорожка', 'бег и ходьба', v.tread], ['bike', 'Велотренажёр', 'кардио', v.bike]].map(([k, t, s2, on]) => `<div class="eq"><div class="pic"><img src="${eqImg(k === 'bands' ? 'band' : k)}" alt=""></div><div class="eqh"><div>${t}<small>${s2}</small></div>${sw(k, on)}</div></div>`).join('')}
      <button class="big" id="eqdone">Готово</button></div>`;
    const inn = s.querySelector('.in'); if (inn) inn.scrollTop = y;
    s.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => { const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); saveInv({ [b.dataset.eq]: on }); });
    s.querySelectorAll('[data-dm]').forEach(b => b.onclick = () => { saveInv({ dbMode: b.dataset.dm }); draw(); });
    s.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { const l = dbList(); l.splice(+b.dataset.rm, 1); saveInv({ db: l.join(', ') }); draw(); });
    const add = () => { const w = parseFloat(String($('#dbw').value).replace(',', '.')); if (!(w > 0 && w < 200)) return; const l = dbList(); l.push(w); l.sort((x, y) => x - y); saveInv({ db: l.join(', '), dbMode: 'own' }); draw(); };
    const ab = $('#dbadd'); if (ab) { ab.onclick = add; $('#dbw').onkeydown = e => { if (e.key === 'Enter') add(); }; }
    $('#eqdone').onclick = () => { s.hidden = true; if (onClose) onClose(); };
  };
  draw();
}

function underRefresh() { const h = location.hash.slice(1); if (!run && (h === '' || h === 'home' || h.startsWith('prog-'))) keepView(route); }
function openSettings() {
  const s = $('#sheet'); s.hidden = false;
  const sw = (k, on) => `<button class="sw ${on ? 'on' : ''}" role="switch" aria-checked="${on}" data-sw="${k}" aria-label="${k}"></button>`;
  const draw = () => {
    const y = (s.querySelector('.in') || {}).scrollTop || 0;
    s.innerHTML = `<div class="in"><h3>Настройки</h3>
      <div class="glab">График тренировок</div><div class="grp"><div class="opt col"><div>Выходные дни<small>серию они не прерывают</small></div><div class="wdr">${WD.map((n, i) => `<button class="${sched().rest.includes(i) ? 'on' : ''}" data-rd="${i}">${n}</button>`).join('')}</div></div>
        <div class="opt"><div>Тренировок в неделю<small>для строки «за неделю»</small></div><select id="splan"><option value="0">Авто</option>${[1, 2, 3, 4, 5, 6, 7].map(n => `<option value="${n}" ${sched().plan === n ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>
      <div class="glab">Тренировка</div><div class="grp"><div class="opt"><div>Разминка перед тренировкой<small>кардио и лёгкие движения на нужные мышцы, 3-4 минуты</small></div>${sw('warm', settings.warm)}</div></div>
      ${XT.set(sw)}
      <div class="glab">Язык</div><div class="grp"><div class="opt"><div>Язык приложения<small>Language. Подсказки по технике, статьи и продукты пока только на русском</small></div><div class="seg"><button data-lang="ru" class="${settings.lang !== 'en' ? 'on' : ''}">RU</button><button data-lang="en" class="${settings.lang === 'en' ? 'on' : ''}">EN</button></div></div></div>
      <div class="glab">Озвучка</div><div class="grp">
        <div class="opt"><div>Названия упражнений<small>голос iPhone, русский</small></div>${sw('names', settings.names)}</div>
        <div class="opt"><div>Советы по технике<small>голосом, в конце фразы</small></div>${sw('tips', settings.tips)}</div>
        <div class="opt"><div>Гантели: вес и смена рук<small>«в правой, в левой, такой-то вес»</small></div>${sw('dbv', settings.dbv)}</div>
        <div class="opt"><div>Голосовое управление<small>${Voice.supported ? 'слушает всё время: скажи «дальше», «готово» или «Тренер, дальше», и шаг пропустится. Кнопка микрофона вверху экрана слушает 7 секунд, если постоянный режим не сработал. Нужны включённая диктовка (Настройки iPhone, Основные, Клавиатура) и интернет' : 'в этом браузере недоступно'}</small></div>${sw('vctl', settings.vctl && Voice.supported)}</div>
        <div class="opt"><div>Последние 4 секунды<small>${Snd.hasVoice ? 'найден пакет голоса' : 'голос iPhone или сигналы'}</small></div><div class="seg"><button data-k="count" data-v="voice" class="${settings.count === 'voice' ? 'on' : ''}">Голос</button><button data-k="count" data-v="beep" class="${settings.count === 'beep' ? 'on' : ''}">Сигналы</button></div></div>
        <div class="opt"><div>Скорость речи</div><input type="range" min="0.7" max="1.3" step="0.05" value="${settings.rate}" id="rate"></div>
      </div>
      <div class="glab">Голос</div><div class="grp"><div class="opt"><div>Голос</div><select id="vsel"><option value="">Авто (самый мягкий)</option>${voiceOptions()}</select></div></div>
      <div class="gfoot">Найдено русских голосов: ${ruVoices().length}. Мягче звучат «улучшенные» и «премиум». Скачать: Настройки iPhone → Универсальный доступ → VoiceOver → Речь → Основной голос → Русский (Россия). Включать VoiceOver не нужно. После скачивания закрой приложение смахиванием и открой снова. Голоса Siri сайтам недоступны.</div>
      <div class="glab">Звук</div><div class="grp"><div class="opt"><small id="diag" style="margin:0">${esc(Snd.diag())}</small></div></div>
      <button class="big sec" id="test">Проверить звук</button><button class="big" id="sclose">Готово</button></div>`;
    const inn = s.querySelector('.in'); if (inn) inn.scrollTop = y;
    s.querySelectorAll('[data-sw]').forEach(b => b.onclick = () => { const k = b.dataset.sw, on = !b.classList.contains('on'); settings[k] = on; saveSettings(); if (k === 'warm') { Object.keys(minCache).forEach(q => delete minCache[q]); underRefresh(); } if (k === 'vctl') { Voice.stop(); if (settings.vctl && Voice.supported && run && !run.done) Voice.start(); } b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
    XT.bind();
    s.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { settings.lang = b.dataset.lang; saveSettings(); location.reload(); });
    s.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { settings[b.dataset.k] = b.dataset.v; saveSettings(); b.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
    s.querySelectorAll('[data-rd]').forEach(b => b.onclick = () => { const c = sched(), i = +b.dataset.rd; c.rest = c.rest.includes(i) ? c.rest.filter(x => x !== i) : c.rest.concat(i); store.set('sched', c); underRefresh(); draw(); });
    $('#splan').onchange = e => { const c = sched(); c.plan = +e.target.value; store.set('sched', c); underRefresh(); };
    $('#vsel').onchange = e => { settings.voice = e.target.value; Snd.voice = null; saveSettings(); Snd.unlock(); Snd.say('Подъём коленей к локтю'); };
    $('#rate').oninput = e => { settings.rate = Number(e.target.value); saveSettings(); };
    $('#test').onclick = () => { Snd.unlock(); Snd.beep(660, 0.25, 0.4); setTimeout(() => { const d = $('#diag'); if (d) d.textContent = Snd.diag(); }, 300); setTimeout(() => Snd.say('Русский твист'), 450); setTimeout(() => { cue(3); setTimeout(() => cue(2), 1000); setTimeout(() => cue(1), 2000); setTimeout(stopSound, 3000); }, 2200); };
    $('#sclose').onclick = () => { s.hidden = true; };
  };
  draw();
  const n0 = ruVoices().length; [600, 1600].forEach(t => setTimeout(() => { if (!s.hidden && ruVoices().length !== n0 && $('#vsel')) draw(); }, t));
}

let run = null, timer = null, reloadLater = false;

const Voice = {
  rec: null, on: false, want: false, last: 0, lastSpeak: 0, err: '', heard: '',
  supported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  label() { return this.err ? ' · микрофон: ' + this.err : this.one ? ' · говори: дальше' + (this.heard ? ' «' + this.heard + '»' : '') : this.on ? ' · слушаю' + (this.heard ? ': «' + this.heard + '»' : '') : ''; },
  mark() { const sm = document.querySelector('.wk .bar h1 small'); if (sm && run) sm.textContent = 'День ' + run.d + this.label(); },
  start() {
    if (!settings.vctl || !this.supported || this.want) return;
    this.want = true; this.err = ''; this._open();
  },
  _open() {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition; let r;
    try { r = new R(); } catch (e) { this.want = false; this.err = 'не создан'; this.mark(); return; }
    r.lang = 'ru-RU'; r.continuous = true; r.interimResults = true; r.maxAlternatives = 3;
    let base = 0;
    r.onresult = e => {
      let t = '';
      for (let i = base; i < e.results.length; i++) for (let j = 0; j < e.results[i].length; j++) t += ' ' + String(e.results[i][j].transcript || '').toLowerCase();
      this.heard = String(e.results[e.results.length - 1][0].transcript || '').trim().slice(-26); this.mark();
      const speaking = ('speechSynthesis' in window && speechSynthesis.speaking), now = Date.now();
      if (speaking) this.lastSpeak = now;
      const wake = /(тренер|тренёр|трейнер|тренера|тренеру)/.test(t), cmd = /(дальше|далее|дале|следующ|пропуст|вперед|вперёд|скип|готово|сделал)/.test(t);
      if (cmd && (wake || (!speaking && now - (this.lastSpeak || 0) > 1200)) && now - this.last > 1500) {
        this.last = now; this.heard = ''; base = e.results.length; voiceNext();
      }
    };
    r.onstart = () => { this.on = true; this.err = ''; this.mark(); };
    r.onerror = e => {
      this.err = e.error === 'not-allowed' ? 'нет доступа' : e.error === 'service-not-allowed' ? 'запрещено системой' : e.error === 'network' ? 'нет сети' : e.error === 'audio-capture' ? 'нет звука' : e.error === 'language-not-supported' ? 'нет русского' : '';
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'language-not-supported') this.want = false;
      this.mark();
    };
    r.onend = () => { this.on = false; this.mark(); if (this.want && run && !run.done) setTimeout(() => { if (this.want && run && !run.done) { try { this._open(); } catch (e) { } } }, 0); };
    (this.all = this.all || []).push(r); this.rec = r; try { r.start(); } catch (e) { this.err = 'не запущен'; this.mark(); }
  },
  listen() {
    if (!this.supported || !run || run.done) return;
    if (this.one) { this.endOne(); return; }
    try { speechSynthesis.cancel(); Snd.stop(); } catch (e) { }
    const R = window.SpeechRecognition || window.webkitSpeechRecognition; let r;
    try { r = new R(); } catch (e) { this.err = 'не создан'; this.mark(); return; }
    r.lang = 'ru-RU'; r.continuous = false; r.interimResults = true; r.maxAlternatives = 3;
    const CMD = /(дальше|далее|дале|следующ|пропуст|вперед|вперёд|скип|готово|сделал)/;
    r.onresult = e => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) for (let j = 0; j < e.results[i].length; j++) t += ' ' + String(e.results[i][j].transcript || '').toLowerCase();
      this.heard = t.trim().slice(-26); this.mark();
      if (CMD.test(t)) { const o = this.one; this.endOne(); voiceNext(); }
    };
    r.onerror = e => { this.err = e.error === 'not-allowed' ? 'нет доступа' : e.error === 'service-not-allowed' ? 'запрещено системой' : e.error === 'network' ? 'нет сети' : e.error === 'audio-capture' ? 'нет звука' : e.error === 'language-not-supported' ? 'нет русского' : ''; this.endOne(); };
    r.onend = () => this.endOne();
    this.one = r; this.err = ''; this.heard = ''; this.mark(); this.btn();
    this.oneT = setTimeout(() => this.endOne(), 7000);
    try { r.start(); } catch (e) { this.err = 'не запущен'; this.endOne(); }
  },
  endOne() {
    clearTimeout(this.oneT); const r = this.one; this.one = null;
    if (r) { r.onend = null; r.onresult = null; r.onerror = null; try { r.abort(); } catch (e) { } }
    this.btn(); this.mark();
  },
  btn() { const b = document.getElementById('mic'); if (b) b.classList.toggle('on', !!this.one); },
  stop() {
    this.endOne();
    this.want = false; this.on = false; this.beeped = false; this.armed = 0; this.heard = '';
    (this.all || []).forEach(r => { try { r.onend = null; r.onresult = null; r.onerror = null; r.abort(); } catch (e) { } try { r.stop(); } catch (e) { } });
    this.all = []; this.rec = null;
  }
};
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') Voice.stop();
  else if (run && !run.done && location.hash === '#workout' && settings.vctl) Voice.start();
});
window.addEventListener('pagehide', () => Voice.stop());
window.addEventListener('beforeunload', () => Voice.stop());
function voiceNext() {
  if (!run || run.done || location.hash !== '#workout') return;
  const sh = $('#sheet'); if (sh && !sh.hidden) return;
  Snd.beep(880, 0.06, 0.2); stopSoundIfTimed(); enter(run.i + 1);
}

function dbPlan(p, st, mode = 'auto') {
  const list = dbList();
  if (p.group === 'gym' || st.bw || EX[st.ex].one) return null;
  if (!list.length && mode !== 'single') return null;
  const w = getW(st.ex, st.def), near = (arr, f) => arr.reduce((b, x) => (b === null || Math.abs(f(x) - w) < Math.abs(f(b) - w) ? x : b), null);
  if (SINGLE_DB.has(st.ex)) { const b = list.length ? near([...new Set(list)], x => x) : w; return { fm: 'single', fw: b, ld: b }; }
  if (mode === 'single') { const b = list.length ? near([...new Set(list)], x => x) : w; return { fm: 'mix', hv: [b, 0], ld: b }; }
  const pairs = [...new Set(list.filter(x => list.filter(y => y === x).length >= 2))], bp = pairs.length ? near(pairs, x => x) : null;
  if (mode !== 'mix' && bp !== null && Math.abs(bp - w) <= Math.max(2, w * 0.35)) return { fm: 'pair', fw: bp, ld: 2 * bp };
  const u = [...new Set(list)];
  if (u.length === 1) return { fm: 'mix', hv: [u[0], 0] };
  let best = null; for (let i = 0; i < u.length; i++) for (let j = i + 1; j < u.length; j++) { const c = [Math.max(u[i], u[j]), Math.min(u[i], u[j])]; if (!best || Math.abs((c[0] + c[1]) / 2 - w) < Math.abs((best[0] + best[1]) / 2 - w)) best = c; }
  return { fm: 'mix', hv: best };
}
function buildSteps(p, d, mode = 'auto') {
  const steps = [{ k: 'rest', sec: 15, prep: true }];
  dayData(p, d).steps.forEach(st => {
    const { rest, ...step } = st, pl = st.db ? dbPlan(p, st, mode) : null;
    if (pl && pl.fm === 'mix') {
      steps.push({ ...step, half: 1, hv: pl.hv, ld: pl.hv[0] + pl.hv[1] }); steps.push({ k: 'rest', sec: 10, swap: true });
      steps.push({ ...step, half: 2, hv: [pl.hv[1], pl.hv[0]], ld: pl.hv[0] + pl.hv[1] });
    } else steps.push(pl ? { ...step, ...pl } : step);
    if (rest) steps.push({ k: 'rest', sec: rest });
  });
  return steps;
}
function startWorkout(pid, d, mode = 'auto') {
  const p = prog(pid);
  Snd.unlock(); wake();
  run = { p, d, steps: buildSteps(p, d, mode), i: 0, paused: false, done: false, t0: performance.now(), pausedAt: 0, pausedTotal: 0 };
  run.tipped = new Set(); run.pre = [...new Set(run.steps.filter(x => x.ex).map(x => x.ex))].map(x => { const i = new Image(); i.src = mediaUrls(x)[0]; return i; });
  go('#workout');
  enter(0);
  clearInterval(timer); timer = setInterval(tick, 100);
  Voice.stop(); Voice.start();
}
const stepLoad = s => s.bw ? 0 : s.ld !== undefined ? s.ld : getW(s.ex, s.def) * (EX[s.ex].one ? 1 : 2);
function stepHands(s) {
  if (s.bw) return null;
  if (s.hv) { const a = Math.max(s.hv[0], s.hv[1]), b = Math.min(s.hv[0], s.hv[1]); return b ? { k: 'mix', a, b } : { k: 'one', a }; }
  if (s.fm === 'single') return { k: 'one', a: s.fw };
  if (s.fm === 'pair') return { k: 'pair', a: s.fw };
  const w = getW(s.ex, s.def); return EX[s.ex].one ? { k: 'one', a: w } : { k: 'pair', a: w };
}
const handsText = h => !h ? '' : h.k === 'mix' ? fmtKg(h.a) + ' + ' + fmtKg(h.b) + ' кг' : h.k === 'pair' ? 'по ' + fmtKg(h.a) + ' кг' : fmtKg(h.a) + ' кг';
function logStep(s) { if (!s || s.k === 'rest' || s.logged) return; s.logged = 1; if (s.k === 'reps' && s.db) { s.lw = stepLoad(s); s.hd = stepHands(s); } }
const liveTon = () => run.steps.reduce((t, x) => x.logged && x.db && !x.bw && x.k === 'reps' ? t + x.reps * x.lw : t, 0);
const liveSec = () => { const n = performance.now(); return Math.max(0, Math.round((n - run.t0 - run.pausedTotal - (run.paused ? n - run.pausedAt : 0)) * SPEED / 1000)); };
function liveStats() { const sec = liveSec(), ton = Math.round(liveTon()), hasW = run.steps.some(x => x.db && !x.bw && stepLoad(x) > 0), met = hasW ? 4.5 : 3.8; return { sec, ton, met, kcal: kcalCalc(met, profile().w, sec / 60).act }; }
const fmtLive = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), q = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(q).padStart(2, '0'); };
const fmtTon = t => t >= 1000 ? fmtKg(t / 1000) + ' т' : t + ' кг';
function hud() {
  const L = liveStats(), t = $('#lt'), k = $('#lk'); if (t) t.textContent = fmtLive(L.sec); if (k) k.textContent = L.kcal;
  const a = $('#plt'), b = $('#plk'), c = $('#plw'); if (a) a.textContent = fmtLive(L.sec); if (b) b.textContent = L.kcal; if (c) c.textContent = fmtTon(L.ton);
}
function planRows() {
  const rows = [];
  run.steps.forEach((s, i) => {
    if (s.k === 'rest' || !s.ex || (s.half && s.half !== 1)) return;
    let r = rows[rows.length - 1];
    if (!r || r.ex !== s.ex || r.part !== s.part || !!r.st !== !!s.stretch) rows.push(r = { ex: s.ex, part: s.part, st: !!s.stretch, items: [] });
    r.items.push({ s, i });
  });
  return rows;
}
function planHtml() {
  let st = false;
  return planRows().map(r => {
    const n = r.items.length, done = r.items.filter(x => x.i + (x.s.half === 1 ? 2 : 0) < run.i).length, cur = r.items.some(x => x.i === run.i || (x.s.half === 1 && run.i === x.i + 2) || (x.s.half === 1 && run.i === x.i + 1)), s0 = r.items[0].s;
    const reps = r.items.map(x => x.s.k === 'time' ? fmtT(x.s.sec) : x.s.reps);
    const same = reps.every(x => x === reps[0]), line = s0.k === 'time' ? n + ' × ' + fmtT(s0.sec) : (same ? n + ' × ' + reps[0] : n + ' подх.: ' + reps.join(' + ')) + (s0.db && !s0.bw ? ' · ' + handsText(r.items.find(x => x.s.logged && x.s.hd) ? r.items.find(x => x.s.logged && x.s.hd).s.hd : stepHands(s0)) : '');
    const head = r.st && !st ? (st = true, '<div class="plsh">Растяжка</div>') : '';
    return head + `<div class="plr ${done >= n ? 'done' : cur ? 'cur' : ''}"><img src="${thumb(r.ex)}" alt=""><div class="t"><div>${esc(EX[r.ex].name)}${r.part ? ' · ' + esc(r.part) : ''}</div><small>${line}</small></div><em>${Math.min(done, n)}/${n}</em></div>`;
  }).join('');
}
function openPlan() {
  if (!run || $('#pls')) return;
  const el = document.createElement('div'); el.id = 'pls'; el.className = 'pls';
  el.innerHTML = `<div class="pin"><div class="plh2"><b>План тренировки</b><button id="plx" aria-label="Закрыть">${I.close}</button></div>
    <div class="plst"><div><small>Время</small><b id="plt">0:00</b></div><div><small>Ккал</small><b id="plk">0</b></div><div><small>Вес</small><b id="plw">0 кг</b></div></div>
    <div class="plbody" id="plbody"></div></div>`;
  document.body.appendChild(el); document.body.classList.add('plopen');
  el.addEventListener('click', e => { if (e.target === el || e.target.closest('#plx')) closePlan(); });
  fillPlan(); hud();
  const cu = $('#plbody .plr.cur'); if (cu) cu.scrollIntoView({ block: 'center' });
}
function fillPlan() { const b = $('#plbody'); if (b) { const y = b.scrollTop; b.innerHTML = planHtml(); b.scrollTop = y; } }
function closePlan() { const el = $('#pls'); if (el) el.remove(); document.body.classList.remove('plopen'); }
function nextEx(i) { return run.steps.slice(i + 1).find(s => s.k !== 'rest'); }
function enter(i) {
  logStep(run.steps[run.i]);
  run.i = i; run.cued = {}; run.paused = false;
  const s = run.steps[i]; if (!s) return finish();
  if (s.k === 'time' || s.k === 'rest') { run.endAt = performance.now() + s.sec * 1000 / SPEED; run.dur = s.sec * 1000; }
  if (s.k === 'time' || s.k === 'reps') {
    const e = EX[s.ex], first = s.stretch && !run.steps.slice(0, i).some(x => x.stretch), side = e.side ? ' на каждую ' + e.side : '';
    const num2 = n => n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'секунда' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'секунды' : 'секунд');
    let say = (first ? 'Теперь растяжка. ' : '') + e.name + (s.part ? '. ' + s.part : '');
    const kg = w => { const n = Number(w); return num(n) + ' ' + (n % 1 ? 'килограмма' : n % 10 === 1 && n % 100 !== 11 ? 'килограмм' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'килограмма' : 'килограммов'); };
    let load = '', note = '';
    if (s.hv) { load = s.hv[1] ? `. Правая рука ${kg(s.hv[0])}, левая ${kg(s.hv[1])}` : s.hv[0] ? `. Гантель ${kg(s.hv[0])} в правой руке, левая свободна` : `. Гантель ${kg(s.hv[1])} в левой руке, правая свободна`; note = s.hv[1] ? 'У тебя гантели разного веса, поэтому каждый подход делаем в два захода: после первого поменяй гантели в руках и повтори. К следующему подходу переходи, когда обе руки поработали с обоими весами.' : 'Гантель одна, поэтому каждый подход делаем в два захода: сначала одной рукой, затем другой.'; }
    else if (s.fm === 'pair') load = `. По ${kg(s.fw)} в каждую руку`;
    else if (s.fm === 'single') { load = `. Одна гантель ${kg(s.fw)}`; note = EX[s.ex].side ? '' : 'Держи гантель двумя руками.'; }
    if (!settings.dbv) { load = ''; note = ''; }
    if (s.k === 'reps') say = `${s.db && (s.set > 1 || s.half === 2) ? '' : e.name + '. '}${s.db ? 'Подход ' + s.set + '. ' : ''}${s.half ? 'Заход ' + s.half + ' из 2. ' : ''}${s.reps} раз${side}${load}`;
    else say += '. ' + num2(s.sec) + (e.side && !s.stretch ? '. На каждую ' + e.side : '');
    const parts = [];
    if (settings.names) parts.push(say);
    if (settings.tips && note && !run.tipped.has('i' + s.ex)) { parts.push(note); run.tipped.add('i' + s.ex); }
    const bandTip = (inv().bands || inv().mini) && BAND[s.ex] ? ' ' + BAND[s.ex] : '';
    if (settings.tips && (e.tip || bandTip) && !run.tipped.has(s.ex)) parts.push((e.tip || '') + bandTip);
    Snd.speakList(parts);
    run.tipped.add(s.ex);
  } else {
    const n = nextEx(i), what = !n ? '' : EX[n.ex].name + (n.db && n.set > 1 ? ', подход ' + n.set : '');
    speakName(s.prep ? 'Приготовься. Первое упражнение: ' + what : s.swap && settings.dbv ? 'Поменяй гантели в руках' : 'Отдых. Дальше ' + what);
    if (!settings.names) Snd.stop();
  }
  const n = nextEx(i); if (n) new Image().src = mediaUrls(n.ex)[0];
  renderRun();
}
function advance() { stopSoundIfTimed(); enter(run.i + 1); }
function stopSoundIfTimed() { const s = run.steps[run.i]; if (s && (s.k === 'time' || s.k === 'rest')) stopSound(); }
function leftV() { return run.paused ? run.leftAtPause : (run.endAt - performance.now()) * SPEED; }

function tick() {
  if (run && !run.done) hud();
  if (!run || run.done || run.paused) return;
  const s = run.steps[run.i]; if (!s || (s.k !== 'time' && s.k !== 'rest')) return;
  const L = leftV(), lead = (settings.count === 'voice' && !Snd.hasVoice) ? 280 : 0;
  for (const n of [4, 3, 2, 1]) {
    if (!run.cued[n] && n < s.sec && L <= n * 1000 + lead) { run.cued[n] = 1; if (L > (n - 1) * 1000 - 150) { cue(n); pulse(); } }
  }
  if (L <= 0) return advance();
  paintTimer(L);
}
function paintTimer(L) {
  const n = $('#cnt'), c = $('#ring'); if (!n || !c) return;
  n.textContent = fmtClock(L / 1000);
  c.style.strokeDashoffset = String(603.19 * (1 - Math.max(0, L / run.dur)));
}
function pulse() { const b = $('.ringbox'); if (!b) return; b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }

function togglePause() {
  const s = run.steps[run.i]; if (!s || (s.k !== 'time' && s.k !== 'rest')) return;
  if (!run.paused) { run.leftAtPause = leftV(); run.paused = true; run.pausedAt = performance.now(); Snd.stop(); }
  else { run.endAt = performance.now() + run.leftAtPause / SPEED; run.pausedTotal += performance.now() - run.pausedAt; run.paused = false; }
  renderRun();
}

function renderRun() {
  const s = run.steps[run.i]; if (!s) return;
  const p = run.p, total = run.steps.filter(x => x.k !== 'rest'), cur = total.indexOf(s) >= 0 ? total.indexOf(s) : total.findIndex(x => run.steps.indexOf(x) > run.i) - 1;
  const n = nextEx(run.i), nlabel = n ? EX[n.ex].name + (n.part ? ' · ' + n.part : '') + (n.db ? ` · подход ${n.set}` + (n.half ? ` · заход ${n.half}` : '') : '') : 'Финиш';
  const dcls = k => k < cur ? 'done' : k === cur ? 'cur' : '', grp = [];
  for (let k = 0; k < total.length; k++) { if (total[k].half === 1 && total[k + 1] && total[k + 1].half === 2) { grp.push([k, k + 1]); k++; } else grp.push([k]); }
  const dsz = Math.max(3, Math.min(7, Math.floor(340 / (2 * grp.length))));
  const dots = `<div class="dots" style="--d:${dsz}px">${grp.map(g => g.length > 1 ? `<span class="dg"><i class="${dcls(g[0])}"></i><i class="${dcls(g[1])}"></i></span>` : `<i class="${dcls(g[0])}"></i>`).join('')}</div>`;
  const isRest = s.k === 'rest', exId = isRest ? (n ? n.ex : null) : s.ex;
  const title = isRest ? (s.prep ? 'Приготовься' : s.swap ? 'Поменяй гантели' : 'Отдых') : EX[s.ex].name + (s.part ? ' · ' + s.part : '');
  const sx = isRest ? n : s, mir = !!(sx && sx.ex && EX[sx.ex] && EX[sx.ex].side && (sx.half === 2 || (!sx.half && sx.set % 2 === 0)));
  const chip = exId && EX[exId].side ? `<span class="chip">на каждую ${EX[exId].side}</span>` : '';
  const fig = figHtml(exId, planRows().filter(r => !r.st).reduce((n, r) => n + r.items.length, 0), mir);
  let ring, line = '', btns = '';
  const C = 603.19;
  if (s.k === 'reps') {
    ring = `<div class="num"><b>${s.reps}</b><small>${s.db ? 'повторений' : 'раз'}</small></div>`;
    if (s.db) {
      const w = s.bw ? 0 : getW(s.ex, s.def);
      const kgs = x => num(x) + ' кг';
      line = s.hv ? `Подход ${s.set} из ${s.sets} · заход ${s.half} из 2<br><span class="wt"><b>${s.hv[1] ? 'правая ' + kgs(s.hv[0]) + ' · левая ' + kgs(s.hv[1]) : s.hv[0] ? 'правая ' + kgs(s.hv[0]) + ' · левая пусто' : 'правая пусто · левая ' + kgs(s.hv[1])}</b></span>`
        : s.fm ? `Подход ${s.set} из ${s.sets}<span class="wt"><b>${s.fm === 'pair' ? 'по ' + kgs(s.fw) + ' в руку' : 'одна гантель ' + kgs(s.fw)}</b></span>`
        : s.bw ? `Подход ${s.set} из ${s.sets}` : `Подход ${s.set} из ${s.sets}<span class="wt"><button id="wm" aria-label="Меньше">−</button><b>${num(w)} кг</b><button id="wp" aria-label="Больше">+</button></span>`;
    }
    if (s.db) line += XT.aw(s);
    btns = '<button class="big" id="ok">ГОТОВО</button>';
  } else {
    const L = leftV();
    ring = `<div class="num"><b id="cnt">${fmtClock(L / 1000)}</b></div><button class="pp" id="pp" aria-label="Пауза">${run.paused ? I.play : I.pause}</button>`;
    if (isRest) { btns = '<div class="row2"><button class="big sec" id="plus">+15 с</button><button class="big" id="skip">ПРОПУСТИТЬ</button></div>'; line = s.prep ? 'Занимай исходное положение' : s.swap ? 'Переложи гантели в другие руки' : 'Восстанавливаемся'; }
    else btns = '<div class="row2"><button class="big sec" id="skip">ДАЛЬШЕ</button></div>';
  }
  const off = s.k === 'reps' ? 0 : C * (1 - Math.max(0, leftV() / run.dur));
  view(`<div class="wk ${run.paused ? 'paused' : ''}">
    <div class="bar"><button class="rbtn" id="quit" aria-label="Выйти">${I.back}</button><h1>${esc(p.title)}<small>День ${run.d} · <span id="lt">${fmtLive(liveSec())}</span> · <span id="lk">${liveStats().kcal}</span> ккал${Voice.label()}</small></h1>${settings.vctl && Voice.supported ? '<button class="rbtn" id="mic" aria-label="Голос: дальше">' + I.mic + '</button>' : ''}<button class="rbtn" id="gear" aria-label="Настройки">${I.gear}</button></div>
    <div class="name"><span>${esc(title)}</span>${chip}</div>${fig}
    <div class="low"><div class="ringrow"><button class="adj ${isRest ? 'off' : ''}" id="am" aria-label="Меньше">−${s.k === 'reps' ? '' : '<small>5с</small>'}</button><div class="ringbox"><svg viewBox="0 0 210 210"><circle class="bg" cx="105" cy="105" r="96"/><circle id="ring" class="fgc" cx="105" cy="105" r="96" style="stroke-dasharray:${C};stroke-dashoffset:${off}"/></svg>${ring}</div><button class="adj ${isRest ? 'off' : ''}" id="ap" aria-label="Больше">+${s.k === 'reps' ? '' : '<small>5с</small>'}</button></div>
    <div class="setline">${line}</div><div class="btnslot">${btns}</div>
    <div class="next">Следующее упражнение:<b>${esc(nlabel)}</b></div>${dots}</div></div>`);
  if (run.paused) document.querySelectorAll('.fig img').forEach(i => { i.style.animationPlayState = 'paused'; });
  $('#quit').onclick = () => {
    if (!run.paused && (s.k === 'time' || s.k === 'rest')) togglePause();
    openSheet(`<h3>Прервать тренировку?</h3><div class="opt"><small>Прогресс этого дня не сохранится.</small></div><button class="big sec" id="qc">Продолжить</button><button class="big" id="qx">Прервать</button>`, () => {
      $('#qc').onclick = () => { closeSheet(); if (run.paused) togglePause(); };
      $('#qx').onclick = () => { closeSheet(); quit(); };
    });
  };
  $('#gear').onclick = openSettings;
  const fm = $('#fmain'), fa = $('#fabs'); if (fm) { clearTimeout(window._fabT); const arm = () => { clearTimeout(window._fabT); window._fabT = setTimeout(() => fa.classList.remove('open'), 8000); }; fm.onclick = () => { fa.classList.toggle('open'); if (fa.classList.contains('open')) arm(); }; fa.addEventListener('click', ev => { if (ev.target.closest('.fx button') && fa.classList.contains('open')) arm(); }); }
  const pb = $('#plbtn'); if (pb) pb.onclick = openPlan; const sbn = $('#swbtn'); if (sbn) sbn.onclick = () => XT.swap(exId); fillPlan();
  const mb = $('#mic'); if (mb) { mb.onclick = () => Voice.listen(); Voice.btn(); }
  const tb = $('#tipbtn'); if (tb) tb.onclick = () => { const e = EX[exId]; openSheet(`<h3>${esc(e.name)}</h3>${e.side ? `<div class="opt"><div>Выполняй на каждую ${e.side}</div></div>` : ''}<div class="opt"><div class="tiptext">${esc(e.tip)}</div></div><button class="big" id="tipx">Понятно</button>`, () => { $('#tipx').onclick = closeSheet; }); };
  const pp = $('#pp'); if (pp) pp.onclick = togglePause;
  const ok = $('#ok'); if (ok) ok.onclick = () => { Snd.beep(660, 0.08, 0.25); enter(run.i + 1); };
  const sk = $('#skip'); if (sk) sk.onclick = () => enter(run.i + 1);
  const pl = $('#plus'); if (pl) pl.onclick = () => { run.endAt += 15000 / SPEED; run.dur += 15000; run.cued = {}; if (run.paused) run.leftAtPause += 15000; };
  const adj = sign => {
    if (s.k === 'reps') { s.reps = Math.max(1, s.reps + sign); const b = $('.num b'); if (b) b.textContent = s.reps; return; }
    const L = leftV(); if (sign < 0 && L < 6000) return;
    const d = sign * 5000; s.sec = Math.max(5, s.sec + sign * 5); run.dur = Math.max(1000, run.dur + d); run.cued = {};
    if (run.paused) run.leftAtPause += d; else run.endAt += d / SPEED; paintTimer(leftV());
  };
  $('#am').onclick = () => adj(-1); $('#ap').onclick = () => adj(1);
  const wm = $('#wm'), wp = $('#wp'); if (wm) { wm.onclick = () => { setW(s.ex, Math.max(0, getW(s.ex, s.def) - 2.5)); renderRun(); }; wp.onclick = () => { setW(s.ex, getW(s.ex, s.def) + 2.5); renderRun(); }; }
}

function quit() { closePlan(); clearInterval(timer); Voice.stop(); Snd.stop(); unwake(); const pid = run.p.id; run = null; go('#prog-' + pid); }

function finish() {
  closePlan(); logStep(run.steps[run.i]); run.done = true; clearInterval(timer); Voice.stop(); unwake();
  const p = run.p, day = dayData(p, run.d), active = Math.round((performance.now() - run.t0 - run.pausedTotal) * SPEED / 1000);
  const ton = Math.round(liveTon());
  const sd = sessionData(), w = profile().w, met = metOf(ton), end = Date.now();
  const h = hist(); XT.markPr(sd.exs, h, end); h.push({ ts: end, st: end - Math.round((performance.now() - run.t0) * SPEED), pid: p.id, title: p.title, day: run.d, kcal: kcalCalc(met, w, active / 60).act, sec: active, ton, met, w, sets: sd.sets, exs: sd.exs, mus: sd.mus }); store.set('hist', h);
  store.set('day:' + p.id, run.d + 1);
  speakName('Тренировка завершена');
  sumFrom = '#prog-' + p.id; run = null;
  go('#sum-' + end);
  ACH.notify();
  setTimeout(() => openShare(end, true), 350);
}

document.addEventListener('click', e => {
  const bk = e.target.closest('[data-back]'); if (bk) { goBack(bk.dataset.back); return; }
  const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; }
  const sm = e.target.closest('[data-sum]'); if (sm) { sumFrom = '#history'; go('#sum-' + sm.dataset.sum); return; }
  const fv = e.target.closest('[data-fav]'); if (fv) { const id = fv.dataset.fav, l = store.get('fav', []), i = l.indexOf(id); if (i < 0) l.unshift(id); else l.splice(i, 1); store.set('fav', l); keepView(viewHome); return; }
  const hp = e.target.closest('[data-help]'); if (hp) { hp.closest('.pcard').classList.toggle('open'); return; }
  const sb = e.target.closest('[data-stub]'); if (sb) { const p = prog(sb.dataset.stub); openSheet(`<h3>${esc(p.title)}</h3><div class="opt"><div class="tiptext">Эта программа появится в одном из следующих обновлений.</div></div><div class="opt"><div class="tiptext"><b>Что нужно уметь и знать</b><br>${esc(p.req)}</div></div><button class="big" id="stx">Понятно</button>`, () => { $('#stx').onclick = closeSheet; }); return; }
  const t = e.target.closest('[data-grp]'); if (t) { store.set('grp', t.dataset.grp); keepView(viewHome); const on = $('.tab.on'); if (on) { const tb = $('.tabs'), l = on.offsetLeft - tb.offsetLeft; if (l < tb.scrollLeft || l + on.offsetWidth > tb.scrollLeft + tb.clientWidth) tb.scrollLeft = l - (tb.clientWidth - on.offsetWidth) / 2; } return; }
  if (e.target.closest('#gear') && !run) { openSettings(); return; }
  const w = e.target.closest('[data-w]'); if (w) {
    const cur = getW(w.dataset.w, Number(w.dataset.def));
    openSheet(`<h3>${esc(EX[w.dataset.w].name)}</h3><div class="opt"><div>Вес гантели, кг</div><input id="wv" type="number" inputmode="decimal" step="0.5" min="0" max="200" value="${cur}"></div><button class="big" id="wok">Сохранить</button>`, () => {
      $('#wok').onclick = () => { const n = parseFloat(String($('#wv').value).replace(',', '.')); if (n >= 0 && n < 200) { setW(w.dataset.w, n); closeSheet(); route(); } };
    });
  }
});
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') $('#sheet').hidden = true; });

const MR = { abs: 'Пресс', obl: 'Косые', glutes: 'Ягодицы', hams: 'Бицепс бедра', quads: 'Квадрицепсы', calves: 'Икры', chest: 'Грудь', triceps: 'Трицепс', biceps: 'Бицепс', lats: 'Спина', delts: 'Плечи', lowback: 'Поясница', cardio: 'Кардио' };
const POOLM = { quads: 'quads', hams: 'hams', calves: 'calves', chest: 'chest', back: 'lats', shoulders: 'delts', biceps: 'biceps', triceps: 'triceps', abs: 'abs', cond: 'cardio' };
const LIBM = (() => {
  const m = {};
  Object.keys(EX).forEach(k => { if (!/^st_/.test(k)) m[k] = (MUSC[k] || '').split(' ').filter(Boolean); });
  Object.entries(GYM_POOL).forEach(([pk, l]) => l.forEach(k => { if (EX[k] && !m[k].length) m[k] = [POOLM[pk] || pk]; }));
  Object.keys(m).forEach(k => { if (!m[k].length) m[k] = ['cardio']; });
  return m;
})();
const LIBG = [['all', 'Все', null], ['abs', 'Пресс', ['abs', 'obl']], ['chest', 'Грудь', ['chest']], ['back', 'Спина', ['lats', 'lowback']], ['sh', 'Плечи', ['delts']], ['arms', 'Руки', ['biceps', 'triceps']], ['legs', 'Ноги', ['quads', 'hams', 'calves']], ['glu', 'Ягодицы', ['glutes']], ['card', 'Кардио', ['cardio']]];
const DBX = new Set(DB_DAYS.flat().map(x => x[0]));
const exKind = ex => { const g = GYMW[ex]; if (g) return g[1] === 'T' ? 'time' : g[1] === 'W' ? 'bw' : 'w'; if (ex === 'plank' || ex === 'sideplank') return 'time'; return DBX.has(ex) ? 'w' : 'bw'; };
const exEquip = ex => ex.startsWith('g_') ? 'Зал' : exKind(ex) === 'w' ? 'Гантели' : 'Свой вес';
const exW0 = ex => GYMW[ex] ? gymWeight(ex, 2) : defW(10);
const exDef = ex => { const k = exKind(ex); return k === 'time' ? { ex, time: 30 } : k === 'w' ? { ex, sets: 3, reps: 10 } : { ex, sets: 3, reps: 15 }; };
const itemText = it => it.time ? fmtT(it.time) : it.sets + ' x ' + it.reps;

function finishCustom(items) {
  items = warmItems(items);
  const steps = expandItems(items); let work = 0, total = 0;
  steps.forEach(s => { const w = s.k === 'time' ? s.sec : s.reps * (s.db ? 3 : 2.5); total += w + s.rest; if (!s.db) work += w; });
  const st = stretchSteps(items);
  if (st.length && steps.length) { steps[steps.length - 1].rest = 20; total += 20; st.forEach(s => { total += s.sec + s.rest; }); steps.push(...st); }
  return { items, steps, workSec: work, minutes: Math.round(total / 60) };
}
function customDay(c, n) {
  const d = c.days[(n - 1) % c.days.length];
  const items = d.items.map(it => { const k = exKind(it.ex); if (k === 'time' || it.time) return { ex: it.ex, time: it.time || 30 }; if (k === 'w') return { ex: it.ex, sets: Array(it.sets).fill(it.reps), weight: exW0(it.ex) }; return { ex: it.ex, sets: Array(it.sets).fill(it.reps), bw: true }; });
  if (!items.length) items.push({ ex: 'plank', time: 30 });
  return finishCustom(items);
}
function regCustom(c) {
  const p = { id: c.id, group: 'my', level: 2, title: c.name, custom: true, card: `${c.days.length} дн. в неделю, ${c.days.reduce((s, d) => s + d.items.length, 0)} упражнений`, restDays: 0, req: 'Твоя собственная программа.', day: n => customDay(c, n),
    info: n => { const i = (n - 1) % c.days.length, w = Math.floor((n - 1) / c.days.length); return { sub: `${c.days.length} дн. в неделю · неделя ${w + 1}`, label: /^День \d+$/.test(c.days[i].name) ? `День ${n}` : `День ${n} · ${c.days[i].name}`, note: '' }; } };
  const i = PROGRAMS.findIndex(x => x.id === c.id); if (i >= 0) PROGRAMS[i] = p; else PROGRAMS.push(p);
  delete minCache[c.id];
}
GROUPS.push({ id: 'my', title: 'Мои' }); GCOL.my = '#8e8e93';
const minCache = {};
store.get('myprogs', []).forEach(regCustom);

const PF = () => Object.assign({ lv: [], t: 0, fav: false, mg: [] }, store.get('pfilt', {}));
const pfCount = f => f.lv.length + (f.t ? 1 : 0) + (f.fav ? 1 : 0) + f.mg.length;
const mgCache = {};
const progMg = p => mgCache[p.id] || (mgCache[p.id] = (() => { const tot = {}; try { for (let d = 1; d <= 3; d++) { const m = dayMuscles(dayData(p, d)).mus; Object.keys(m).forEach(k => { tot[k] = (tot[k] || 0) + m[k]; }); } } catch (e) { } const gs = grpSets(tot), mx = Math.max(1, ...gs.map(g => g[2])); return new Set(gs.filter(g => g[2] >= mx * 0.25).map(g => g[0])); })());
const progMin = p => minCache[p.id] !== undefined ? minCache[p.id] : (minCache[p.id] = (() => { try { return dayStats(p, 1).min; } catch (e) { return 0; } })());
const passF = (p, f0) => {
  const f = f0 || PF(); if (f.mg.length && !f.mg.some(g => progMg(p).has(g))) return false; if (f.lv.length && !f.lv.includes(p.level)) return false; if (f.fav && !store.get('fav', []).includes(p.id)) return false;
  if (f.t) { const m = progMin(p); if (f.t === 1 && m > 15) return false; if (f.t === 2 && (m <= 15 || m > 30)) return false; if (f.t === 3 && m <= 30) return false; }
  return true;
};
const HC = () => Object.assign({ order: [], hide: [], reco: true }, store.get('homecfg', {}));
function orderedGroups() { const c = HC(), ids = c.order.filter(id => GROUPS.some(g => g.id === id)); GROUPS.forEach(g => { if (!ids.includes(g.id)) ids.push(g.id); }); return ids.map(id => GROUPS.find(g => g.id === id)); }
function visGroups() { const c = HC(), l = orderedGroups().filter(g => !c.hide.includes(g.id)); return l.length ? l : [GROUPS[0]]; }
function openFilters() {
  const f = PF(), cur = { lv: f.lv.slice(), t: f.t, fav: f.fav, mg: f.mg.slice() };
  nSheet(`<h3>Фильтры</h3><div class="wlab" style="margin-top:0">Сложность</div>
    <div class="wchips" id="flv">${[1, 2, 3, 4, 5].map(l => `<button data-lv="${l}" class="${cur.lv.includes(l) ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="wlab">Длительность тренировки</div>
    <div class="wchips" id="fti">${[[0, 'Любая'], [1, 'до 15 мин'], [2, '15-30 мин'], [3, 'от 30 мин']].map(([k, t]) => `<button data-ti="${k}" class="${cur.t === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="wlab">Мышечная группа</div>
    <div class="fmg" id="fmg">${BODY_GROUPS.map(g => `<button data-mg="${g[0]}" class="${cur.mg.includes(g[0]) ? 'on' : ''}"><span>${figSvg(Object.fromEntries(g[2].map(k => [k, 0.85])), 'dark', { crop: BODY_CROP[g[0]], only: g[2] })}</span>${g[1]}</button>`).join('')}</div>
    <div class="opt" style="margin-top:14px"><div>Только избранные</div><button class="sw ${cur.fav ? 'on' : ''}" id="ffv" role="switch" aria-checked="${cur.fav}"></button></div>
    <button class="big" id="fok">Показать</button><button class="big sec" id="frs">Сбросить</button>`, () => {
    document.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => { const l = +b.dataset.lv, i = cur.lv.indexOf(l); if (i < 0) cur.lv.push(l); else cur.lv.splice(i, 1); b.classList.toggle('on'); });
    document.querySelectorAll('[data-ti]').forEach(b => b.onclick = () => { cur.t = +b.dataset.ti; document.querySelectorAll('[data-ti]').forEach(x => x.classList.toggle('on', x === b)); });
    $('#ffv').onclick = e => { cur.fav = !cur.fav; e.currentTarget.classList.toggle('on', cur.fav); e.currentTarget.setAttribute('aria-checked', String(cur.fav)); };
    const cnt = () => { const n = PROGRAMS.filter(q => !q.stub && passF(q, cur)).length; $('#fok').textContent = 'Показать (' + n + ')'; };
    document.querySelectorAll('[data-mg]').forEach(b => b.onclick = () => { const g = b.dataset.mg, i = cur.mg.indexOf(g); if (i < 0) cur.mg.push(g); else cur.mg.splice(i, 1); b.classList.toggle('on'); cnt(); });
    document.querySelectorAll('[data-lv],[data-ti],#ffv').forEach(b => b.addEventListener('click', () => setTimeout(cnt, 0)));
    cnt();
    $('#fok').onclick = () => { store.set('pfilt', cur); closeSheet(); viewHome(); };
    $('#frs').onclick = () => { store.set('pfilt', { lv: [], t: 0, fav: false, mg: [] }); closeSheet(); viewHome(); };
  });
}
function openHomeEdit() {
  const c = HC(), ids = orderedGroups().map(g => g.id);
  nSheet(`<h3>Главный экран</h3><div class="opt"><small>Порядок и видимость разделов. Скрытые разделы остаются в приложении, просто не показываются во вкладках.</small></div>
    ${ids.map((id, i) => `<div class="hedrow"><b>${esc(GROUPS.find(g => g.id === id).title)}</b><button class="bi" data-hu="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Выше">↑</button><button class="bi" data-hd="${i}" ${i === ids.length - 1 ? 'disabled' : ''} aria-label="Ниже">↓</button><button class="sw ${c.hide.includes(id) ? '' : 'on'}" data-hv="${id}" role="switch" aria-checked="${!c.hide.includes(id)}"></button></div>`).join('')}
    <div class="opt"><div>Блок «Подобрано для тебя»</div><button class="sw ${c.reco ? 'on' : ''}" id="hreco" role="switch" aria-checked="${c.reco}"></button></div>
    <button class="big" id="hok">Готово</button><button class="big sec" id="hrs">Вернуть как было</button>`, () => {
    const save = () => { store.set('homecfg', c); openHomeEdit(); };
    document.querySelectorAll('[data-hu]').forEach(b => b.onclick = () => { const i = +b.dataset.hu; [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]]; c.order = ids; save(); });
    document.querySelectorAll('[data-hd]').forEach(b => b.onclick = () => { const i = +b.dataset.hd; [ids[i + 1], ids[i]] = [ids[i], ids[i + 1]]; c.order = ids; save(); });
    document.querySelectorAll('[data-hv]').forEach(b => b.onclick = () => { const id = b.dataset.hv, i = c.hide.indexOf(id); if (i < 0) { if (ids.length - c.hide.length <= 1) return; c.hide.push(id); } else c.hide.splice(i, 1); c.order = ids; save(); });
    $('#hreco').onclick = () => { c.reco = !c.reco; c.order = ids; save(); };
    $('#hok').onclick = () => { closeSheet(); viewHome(); };
    $('#hrs').onclick = () => { store.set('homecfg', { order: [], hide: [], reco: true }); closeSheet(); viewHome(); };
  });
}
function bindHome() {
  const q = s => document.querySelectorAll(s);
  if ($('#hf')) $('#hf').onclick = openFilters;
  if ($('#hed')) $('#hed').onclick = openHomeEdit;
  if ($('#hlib')) $('#hlib').onclick = () => go('#lib');
  if ($('#hnew')) $('#hnew').onclick = () => newBuild();
  q('[data-ce]').forEach(b => b.onclick = () => { const c = store.get('myprogs', []).find(x => x.id === b.dataset.ce); if (c) newBuild(c); });
  q('[data-cd]').forEach(b => b.onclick = () => {
    const id = b.dataset.cd, p = prog(id);
    nSheet(`<h3>Удалить программу?</h3><div class="opt"><small>«${esc(p ? p.title : '')}» будет удалена. История тренировок останется.</small></div><button class="big" id="cdy" style="background:#ff6b3d;color:#fff">Удалить</button><button class="big sec" id="cdn">Отмена</button>`, () => {
      $('#cdn').onclick = closeSheet;
      $('#cdy').onclick = () => { store.set('myprogs', store.get('myprogs', []).filter(x => x.id !== id)); const i = PROGRAMS.findIndex(x => x.id === id); if (i >= 0) PROGRAMS.splice(i, 1); store.set('fav', store.get('fav', []).filter(x => x !== id)); closeSheet(); viewHome(); };
    });
  });
}

let bd = null;
function newBuild(c) {
  bd = c ? JSON.parse(JSON.stringify(c)) : { id: '', name: '', days: [0, 1, 2].map(i => ({ name: 'День ' + (i + 1), items: [] })) };
  bd.s = 0; bd.di = 0; go('#build');
}
function viewBuild() {
  if (!bd) return go('#home');
  const s = bd.s, ic3 = [WI.body, I.dumb, WI.target], d = bd.days[bd.di];
  const steps = `<div class="wsteps">${ic3.map((k, i) => `${i ? `<i class="wsl ${i <= s ? 'on' : ''}"></i>` : ''}<span class="wsd ${i < s ? 'done' : i === s ? 'cur' : ''}">${i < s ? WI.check : k}</span>`).join('')}</div>`;
  let h = '';
  if (s === 0) {
    h = `<h2>${bd.id ? 'Редактирование' : 'Своя программа'}</h2><p>Назови программу и выбери, сколько дней в неделю хочешь тренироваться</p>
      <div class="wlab" style="margin-top:0">Название</div><input id="bname" class="wrow wtxt" type="text" maxlength="40" placeholder="Например, Домашний сплит" autocomplete="off" value="${esc(bd.name)}">
      <div class="wlab">Тренировочных дней</div><div class="wchips big6">${[1, 2, 3, 4, 5, 6].map(k => `<button data-bn="${k}" class="${bd.days.length === k ? 'on' : ''}">${k}</button>`).join('')}</div>`;
  } else if (s === 1) {
    h = `<h2>Упражнения</h2><p>Наполни каждый день. Нажми на упражнение, чтобы изменить подходы и повторения.</p>
      <div class="wchips dtabs">${bd.days.map((x, i) => `<button data-bd="${i}" class="${i === bd.di ? 'on' : ''}">${i + 1}${x.items.length ? '' : ' •'}</button>`).join('')}</div>
      <input id="bdn" class="wrow wtxt" type="text" maxlength="30" placeholder="Название дня" value="${esc(d.name)}" style="margin-top:12px">
      <div class="blist">${d.items.length ? d.items.map((it, i) => `<div class="brow"><button class="bmain" data-be="${i}"><img src="${thumb(it.ex)}" alt=""><div><b>${esc(EX[it.ex].name)}</b><small>${itemText(it)}</small></div></button><button class="bi" data-bu="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Выше">↑</button><button class="bi" data-bw="${i}" ${i === d.items.length - 1 ? 'disabled' : ''} aria-label="Ниже">↓</button><button class="bi x" data-bx="${i}" aria-label="Убрать">✕</button></div>`).join('') : '<div class="empty small">В этом дне пока пусто</div>'}</div>
      <button class="wopt" id="badd" style="margin-top:12px;justify-content:center"><b>Добавить упражнение</b></button>`;
  } else {
    const tot = bd.days.reduce((a, x) => a + x.items.length, 0), c = { days: bd.days }, mins = bd.days.map((_, i) => customDay(c, i + 1).minutes);
    h = `<h2>${esc(bd.name.trim() || 'Моя программа')}</h2><p>Проверь программу перед сохранением</p>
      <div class="stat3"><div><b>${bd.days.length}</b><small>дн. в неделю</small></div><div><b>${tot}</b><small>упражнений</small></div><div><b>${Math.round(mins.reduce((a, b) => a + b, 0) / mins.length)}</b><small>мин. в среднем</small></div></div>
      ${bd.days.map((x, i) => `<div class="fgh"><b>${i + 1}. ${esc(x.name.trim() || 'День ' + (i + 1))}</b><span>${mins[i]} мин.</span></div><div class="flog">${x.items.map(it => `<div class="fe"><span class="mi sm"><img src="${thumb(it.ex)}" alt="" class="tm"></span><div><b>${esc(EX[it.ex].name)}</b><small>${itemText(it)}</small></div></div>`).join('')}</div>`).join('')}`;
  }
  view(`<div class="screen wz">${steps}${h}<div class="wfoot"><button class="big" id="bnext">${s === 2 ? 'Сохранить программу' : 'Далее'}</button><button class="link" id="bback">${s ? 'Назад' : 'Отмена'}</button></div></div>`);
  const redraw = () => { const y = window.scrollY; viewBuild(); window.scrollTo(0, y); };
  $('#bback').onclick = () => { if (s) { bd.s--; viewBuild(); } else { bd = null; go('#home'); } };
  $('#bnext').onclick = () => {
    if (s === 0) { bd.name = $('#bname').value.trim(); if (!bd.name) { $('#bname').focus(); return; } bd.s = 1; bd.di = 0; viewBuild(); }
    else if (s === 1) { const e = bd.days.findIndex(x => !x.items.length); if (e >= 0) { bd.di = e; toast('Добавь упражнения', 'День ' + (e + 1) + ' пока пустой'); viewBuild(); return; } bd.s = 2; viewBuild(); }
    else saveBuild();
  };
  if (s === 0) {
    $('#bname').oninput = e => { bd.name = e.target.value; };
    document.querySelectorAll('[data-bn]').forEach(b => b.onclick = () => { const k = +b.dataset.bn; while (bd.days.length < k) bd.days.push({ name: 'День ' + (bd.days.length + 1), items: [] }); bd.days.length = k; bd.name = $('#bname').value; redraw(); });
  } else if (s === 1) {
    $('#bdn').oninput = e => { d.name = e.target.value; };
    document.querySelectorAll('[data-bd]').forEach(b => b.onclick = () => { bd.di = +b.dataset.bd; redraw(); });
    $('#badd').onclick = () => go('#libpick');
    document.querySelectorAll('[data-bx]').forEach(b => b.onclick = () => { d.items.splice(+b.dataset.bx, 1); redraw(); });
    document.querySelectorAll('[data-bu]').forEach(b => b.onclick = () => { const i = +b.dataset.bu; [d.items[i - 1], d.items[i]] = [d.items[i], d.items[i - 1]]; redraw(); });
    document.querySelectorAll('[data-bw]').forEach(b => b.onclick = () => { const i = +b.dataset.bw; [d.items[i + 1], d.items[i]] = [d.items[i], d.items[i + 1]]; redraw(); });
    document.querySelectorAll('[data-be]').forEach(b => b.onclick = () => editItem(d.items[+b.dataset.be], redraw));
  }
}
function editItem(it, done) {
  if (exKind(it.ex) === 'time') {
    const m = Math.floor((it.time || 30) / 60), sx = Math.round(((it.time || 30) % 60) / 5);
    return openWheel(EX[it.ex].name, [{ items: range(0, 10).map(x => x + ' мин'), idx: m }, { items: range(0, 11).map(x => x * 5 + ' с'), idx: sx }], 'Готово', r => { it.time = Math.max(5, r[0] * 60 + r[1] * 5); done(); });
  }
  openWheel(EX[it.ex].name, [{ items: range(1, 10).map(x => x + ' подх.'), idx: it.sets - 1 }, { items: range(1, 60).map(x => x + ' повт.'), idx: it.reps - 1 }], 'Готово', r => { it.sets = r[0] + 1; it.reps = r[1] + 1; done(); });
}
function saveBuild() {
  const c = { id: bd.id || 'u' + Date.now().toString(36), name: bd.name.trim() || 'Моя программа', days: bd.days.map((d, i) => ({ name: d.name.trim() || 'День ' + (i + 1), items: d.items })) };
  const l = store.get('myprogs', []), i = l.findIndex(x => x.id === c.id); if (i >= 0) l[i] = c; else l.push(c);
  store.set('myprogs', l); regCustom(c); store.set('grp', 'my'); bd = null; go('#home'); toast('Программа сохранена', c.name);
}

const lib = { q: '', g: 'all', e: 'all' };
function viewLib(pick) {
  if (pick && !bd) return go('#home');
  const list = () => {
    const w = norm(lib.q).trim().split(/\s+/).filter(Boolean), grp = LIBG.find(x => x[0] === lib.g)[2];
    return Object.keys(LIBM).filter(k => (!grp || LIBM[k].some(m => grp.includes(m))) && (lib.e === 'all' || exEquip(k) === lib.e) && w.every(x => norm(EX[k].name).includes(x))).sort((a, b) => EX[a].name.localeCompare(EX[b].name, 'ru'));
  };
  view(`<div class="screen ${pick ? '' : 'has-nav'}">
    <div class="bar"><button class="rbtn" id="lback" aria-label="Назад">${I.back}</button><h1>${pick ? 'Добавить упражнение' : 'Упражнения'}<small>${pick ? 'день ' + (bd.di + 1) + ': ' + esc(bd.days[bd.di].name) : 'Библиотека'}</small></h1>${pick ? '<button class="rbtn dn" id="ldone">Готово</button>' : '<span class="rbtn ghost"></span>'}</div>
    <div class="fsearch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="lq" type="search" placeholder="Найти упражнение" value="${esc(lib.q)}"><button class="fclr" id="lqx" aria-label="Очистить" hidden><svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg></button></div>
    <div class="tabs lchips">${LIBG.map(([k, t]) => `<button class="tab ${lib.g === k ? 'on' : ''}" data-lg="${k}">${t}</button>`).join('')}</div>
    <div class="seg wide lseg">${[['all', 'Любое'], ['Свой вес', 'Свой вес'], ['Гантели', 'Гантели'], ['Зал', 'Зал']].map(([k, t]) => `<button data-le="${k}" class="${lib.e === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="flist" id="ll"></div>${pick ? '' : nav('home')}</div>`);
  const draw = () => {
    const l = list(); $('#ll').innerHTML = l.length ? l.map(k => `<button class="lrow" data-lx="${k}"><img src="${thumb(k)}" alt=""><div><b>${esc(EX[k].name)}</b><small>${LIBM[k].map(m => MR[m]).join(', ')} · ${exEquip(k)}</small></div><span class="lpl">${pick ? I.plus : '›'}</span></button>`).join('') : '<div class="empty small">Ничего не найдено</div>';
    document.querySelectorAll('[data-lg]').forEach(b => b.classList.toggle('on', b.dataset.lg === lib.g)); document.querySelectorAll('[data-le]').forEach(b => b.classList.toggle('on', b.dataset.le === lib.e));
  };
  draw();
  $('#lback').onclick = () => goBack(pick ? '#build' : '#tips');
  if (pick) $('#ldone').onclick = () => go('#build');
  const lqs = () => { $('#lqx').hidden = !$('#lq').value; };
  lqs();
  $('#lq').oninput = e => { lib.q = e.target.value; lqs(); draw(); };
  $('#lqx').onclick = () => { $('#lq').value = ''; lib.q = ''; lqs(); draw(); $('#lq').focus(); };
  document.querySelectorAll('[data-lg]').forEach(b => b.onclick = () => { lib.g = b.dataset.lg; draw(); });
  document.querySelectorAll('[data-le]').forEach(b => b.onclick = () => { lib.e = b.dataset.le; draw(); });
  $('#ll').onclick = e => { const r = e.target.closest('[data-lx]'); if (!r) return; const k = r.dataset.lx; if (pick) { bd.days[bd.di].items.push(exDef(k)); toast('Добавлено', EX[k].name + ' · день ' + (bd.di + 1)); } else go('#ex-' + k); };
}
function viewEx(id) {
  const e = EX[id]; if (!e || /^st_/.test(id)) return go('#lib');
  const k = exKind(id), tip = TIPS[id] || '', kinds = { time: 'на время', bw: 'повторения', w: 'с весом' };
  const hero = e.gif ? `<img src="gif/${e.gif}.gif" alt="">` : `<img src="img/${e.img}_0.jpg" alt=""><img class="b" src="img/${e.img}_1.jpg" alt="">`;
  view(`<div class="screen">
    <div class="bar"><button class="rbtn" id="xback" aria-label="Назад">${I.back}</button><h1>${esc(e.name)}<small>${exEquip(id)}</small></h1><span class="rbtn ghost"></span></div>
    <div class="exhero">${hero}</div>
    <div class="exchips">${LIBM[id].map(m => `<span>${MR[m]}</span>`).join('')}<span class="alt">${exEquip(id)}</span><span class="alt">${kinds[k]}</span></div>
    ${tip ? `<div class="sh">Техника</div><div class="note" style="margin-top:0">${esc(tip)}</div>` : ''}
    ${k === 'w' ? `<div class="wlab" style="padding-left:24px">Рабочий вес</div><div style="padding:0 20px"><button class="wrow" id="xw"><span>${num(getW(id, exW0(id)))} кг</span></button></div>` : ''}
    ${XT.exRec(id)}
    <div class="mact"><button class="big" id="xadd">Добавить в свою программу</button></div></div>`);
  $('#xback').onclick = () => goBack('#lib');
  if ($('#xw')) $('#xw').onclick = () => weightWheel(e.name, getW(id, exW0(id)), 'met', v => { setW(id, v); viewEx(id); });
  $('#xadd').onclick = () => {
    const my = store.get('myprogs', []);
    if (!my.length) return nSheet(`<h3>Нет своих программ</h3><div class="opt"><small>Сначала создай свою программу, потом добавляй в неё упражнения.</small></div><button class="big" id="xn">Создать программу</button>`, () => { $('#xn').onclick = () => { closeSheet(); newBuild(); }; });
    nSheet(`<h3>Куда добавить</h3>${my.map(c => `<div class="wlab" style="margin-top:8px">${esc(c.name)}</div><div class="wchips">${c.days.map((d, i) => `<button data-xp="${c.id}:${i}">${i + 1}. ${esc(d.name)}</button>`).join('')}</div>`).join('')}`, () => {
      document.querySelectorAll('[data-xp]').forEach(b => b.onclick = () => { const [cid, di] = b.dataset.xp.split(':'), l = store.get('myprogs', []), c = l.find(x => x.id === cid); c.days[+di].items.push(exDef(id)); store.set('myprogs', l); regCustom(c); closeSheet(); toast('Добавлено', c.name + ' · ' + c.days[+di].name); });
    });
  };
}

const modeSwitch = () => `<div class="seg wide amode"><button data-sm="train" class="${statUi.mode !== 'food' ? 'on' : ''}">Тренировки</button><button data-sm="food" class="${statUi.mode === 'food' ? 'on' : ''}">Питание</button></div>`;
function bindMode() { document.querySelectorAll('[data-sm]').forEach(b => b.onclick = () => { statUi.mode = b.dataset.sm; store.set('statui', statUi); viewStats(); }); }
const foodDay = k => { const l = dayLog(k), s = sumLog(l); return { k: Math.round(s.k), p: Math.round(s.p), f: Math.round(s.f), c: Math.round(s.c), w: waterDay(k), st: stepsDay(k), z: sleepDay(k), n: l.length, l, meals: new Set(l.map(e => e.meal).filter(x => x < 4)).size }; };
const BADGE_MEDAL = '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/></svg>';
function calCells(y, m, sel, fd, G, wk) {
  const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), today = dkey(Date.now());
  const arc = (r, f, col) => { const C = 2 * Math.PI * r; return `<circle cx="22" cy="22" r="${r}" fill="none" stroke="${col}" stroke-opacity=".22" stroke-width="3.4"/>${f > 0 ? `<circle cx="22" cy="22" r="${r}" fill="none" stroke="${col}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="${(C * Math.min(1, f)).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 22 22)"/>` : ''}`; };
  let cells = '';
  for (let i = 0; i < first; i++) cells += '<i></i>';
  for (let d = 1; d <= days; d++) {
    const k = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'), x = fd(k), tr = wk.has(k), perfect = tr && x.meals >= 3;
    cells += `<button class="cd2 ${k === today ? 'today' : ''} ${k === sel ? 'sel' : ''}" data-k="${k}" aria-label="${d} ${MONTHS[m]}"><span>${d}</span><svg class="r3" viewBox="0 0 44 44" aria-hidden="true">${arc(19, x.st / STEP_GOAL, '#ff6b3d')}${arc(14, x.k / Math.max(1, G.kcal), x.k > G.kcal * 1.05 ? '#ff6b3d' : '#c7c7cc')}${arc(9, x.z / SLEEP_GOAL, '#8e8e93')}</svg>${perfect ? `<i class="bd gold"></i>` : tr ? `<i class="bd"></i>` : ''}</button>`;
  }
  return cells;
}
const calLegend = () => `<div class="cleg2"><span><i class="dot" style="background:#ff6b3d"></i>Шаги</span><span><i class="dot" style="background:#c7c7cc"></i>Питание</span><span><i class="dot" style="background:#8e8e93"></i>Сон</span><div><i class="bd gold"></i>идеальный день: тренировка + 3 приёма пищи</div><div><i class="bd"></i>тренировка</div></div>`;
const workoutDays = () => new Set(hist().map(x => dkey(x.ts)));
function openCalSheet() {
  let cm = fdateObj(fdate); cm.setDate(1);
  const G = nutGoal(), wk = workoutDays(), cache = {}, fd = k => cache[k] || (cache[k] = foodDay(k));
  const draw = () => {
    openSheet(`<h3>Календарь</h3><div class="calh"><button id="cqp" aria-label="Предыдущий месяц">${I.l}</button><b>${MONTHS[cm.getMonth()]} ${cm.getFullYear()} г.</b><button id="cqn" aria-label="Следующий месяц">${I.r}</button></div>
      <div class="cw"><span>пн</span><span>вт</span><span>ср</span><span>чт</span><span>пт</span><span>сб</span><span>вс</span></div><div class="cg cg2">${calCells(cm.getFullYear(), cm.getMonth(), fdate, fd, G, wk)}</div>${calLegend()}`, () => {
      $('#cqp').onclick = () => { cm.setMonth(cm.getMonth() - 1); draw(); };
      $('#cqn').onclick = () => { cm.setMonth(cm.getMonth() + 1); draw(); };
      document.querySelectorAll('.cd2').forEach(b => b.onclick = () => { fdate = b.dataset.k; closeSheet(); if (location.hash === '#food') viewFood(); else go('#food'); });
    });
  };
  draw();
}
function viewStatsFood() {
  if (!calMonth) { calMonth = new Date(); calMonth.setDate(1); calMonth.setHours(0, 0, 0, 0); }
  if (!calSel) calSel = dkey(Date.now());
  const P = statUi.period, bs = buckets([], P), G = nutGoal(), cache = {}, fd = k => cache[k] || (cache[k] = foodDay(k));
  bs.forEach(b => { b.days = []; for (let t = b.from; t < b.to; t += 864e5) { const d = fd(dkey(t)); if (d.n || d.w || d.st || d.z) b.days.push(d); } });
  const avg = (b, key) => { const l = b.days.filter(d => key === 'w' || key === 'st' || key === 'z' ? d[key] > 0 : d.n > 0); return l.length ? Math.round(l.reduce((s, d) => s + d[key], 0) / l.length) : 0; };
  const logged = bs.reduce((s, b) => s + b.days.filter(d => d.n > 0).length, 0), allDays = bs.reduce((a, b) => a.concat(b.days.filter(d => d.n > 0)), []);
  const mean = key => allDays.length ? Math.round(allDays.reduce((s, d) => s + d[key], 0) / allDays.length) : 0;
  const wd = bs.reduce((a, b) => a.concat(b.days.filter(d => d.w > 0)), []), wavg = wd.length ? Math.round(wd.reduce((s, d) => s + d.w, 0) / wd.length) : 0;
  const seg = [[7, '7 дней'], [30, '30 дней'], [365, 'Год'], [0, 'Всё']].map(([v, t]) => `<button data-p="${v}" class="${P === v ? 'on' : ''}">${t}</button>`).join('');
  const tile = (svg, v, l) => `<div class="tile"><span class="ic">${svg}</span><b>${v}</b><small>${l}</small></div>`;
  const y = calMonth.getFullYear(), m = calMonth.getMonth(), first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), today = dkey(Date.now());
  const wk = workoutDays();
  const calHtml = () => {
    const cells = calCells(y, m, calSel, fd, G, wk);
    const s = fd(calSel), dt = new Date(calSel + 'T12:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    const byMeal = MEALS.map((mn, mi) => { const l = s.l.filter(e => e.meal === mi); if (!l.length) return ''; const t = sumLog(l); return `<div class="hrow"><div class="l"><div><span class="mi sm" style="display:inline-grid;vertical-align:middle;margin-right:8px">${MEAL_IC[mi]}</span>${mn}</div><small>${l.map(e => esc(e.name)).slice(0, 3).join(', ')}${l.length > 3 ? ' и ещё ' + (l.length - 3) : ''}</small></div><div class="r">${fmt0(t.k)} ккал<br><small>Б ${fmt0(t.p)} · Ж ${fmt0(t.f)} · У ${fmt0(t.c)}</small></div></div>`; }).join('');
    const det = s.n ? `<div class="stat3"><div><b>${fmt0(s.k)}</b><small>ккал из ${fmt0(G.kcal)}</small></div><div><b>${s.p} / ${s.f} / ${s.c}</b><small>Б / Ж / У, г</small></div><div><b>${fmt0(s.w)}</b><small>мл воды</small></div></div><div class="stat3"><div><b>${fmt0(s.st)}</b><small>шагов</small></div><div><b>${s.z ? fmtSleep(s.z) : "0"}</b><small>сон</small></div><div><b>${wk.has(calSel) ? "да" : "нет"}</b><small>тренировка</small></div></div>${byMeal}` : `<div class="empty small">В этот день записей нет.${s.w || s.st || s.z ? ' Вода: ' + fmt0(s.w) + ' мл, шаги: ' + fmt0(s.st) + ', сон: ' + (s.z ? fmtSleep(s.z) : 'не записан') + '.' : ''}</div>`;
    return `<div class="cal"><div class="calh"><button id="cprev" aria-label="Предыдущий месяц">${I.l}</button><b>${MONTHS[m]} ${y}</b><button id="cnext" aria-label="Следующий месяц">${I.r}</button></div>
      <div class="cw"><span>пн</span><span>вт</span><span>ср</span><span>чт</span><span>пт</span><span>сб</span><span>вс</span></div><div class="cg cg2">${cells}</div>${calLegend()}</div>
      <div class="dh">${esc(dt)}</div>${det}${s.n ? '<div style="text-align:center"><button class="link" id="copen">Открыть этот день</button></div>' : ''}`;
  };
  const kc = b => avg(b, 'k'), pr = b => avg(b, 'p'), wt = b => avg(b, 'w'), stp = b => avg(b, 'st'), slp = b => Math.round(avg(b, 'z') / 6) / 10;
  const per = P === 365 || P === 0 ? 'по месяцам' : 'по дням';
  view(`<div class="screen has-nav">
    <div class="bar"><button class="rbtn" data-go="#history" aria-label="История">${I.timer}</button><h1>Аналитика<small>Питание</small></h1><button class="rbtn" data-ach aria-label="Достижения">${ACH.icon()}</button></div>
    ${modeSwitch()}${XT.statTiles(1)}
    <div id="calbox">${calHtml()}</div>
    <div class="sh">${ic('chart')}Итоги</div>
    <div class="seg wide pseg">${seg}</div>
    <div class="tiles">${tile(I.food, logged, 'дней с записями')}${tile(I.flame, fmt0(mean('k')), 'ккал в день')}${tile(I.food, mean('p') + ' г', 'белка в день')}${tile(WI.drop, wavg ? fmt0(wavg) + ' мл' : '0', 'воды в день')}</div>
    <div class="ch"><h3>Калории ${per}</h3>${barChart('f1', bs, kc, 'ккал', '#ffffff', 'записями')}</div>
    <div class="ch"><h3>Белки ${per}</h3>${barChart('f2', bs, pr, 'г', '#ff6b3d', 'записями')}</div>
    <div class="ch"><h3>Вода ${per}</h3>${barChart('f3', bs, wt, 'мл', '#ffffff', 'водой')}</div>
    <div class="ch"><h3>Шаги ${per}</h3>${barChart('f4', bs, stp, 'шагов', '#7c7c80', 'шагами')}</div>
    <div class="ch"><h3>Сон ${per}</h3>${barChart('f5', bs, slp, 'ч', '#8e8e93', 'записью сна')}</div>
    <div class="hint">Норма калорий сейчас ${fmt0(G.kcal)} ккал. На графиках среднее за дни с записями.</div>
    ${nav('stats')}</div>`);
  bindChart('f1', bs, kc, 'ккал'); bindChart('f2', bs, pr, 'г'); bindChart('f3', bs, wt, 'мл'); bindChart('f4', bs, stp, 'шагов'); bindChart('f5', bs, slp, 'ч'); bindMode();
  $('.pseg').querySelectorAll('button').forEach(b => b.onclick = () => { statUi.period = +b.dataset.p; store.set('statui', statUi); keepView(viewStats); });
  const bindCal = () => {
    $('#cprev').onclick = () => { calMonth.setMonth(calMonth.getMonth() - 1); viewStats(); };
    $('#cnext').onclick = () => { calMonth.setMonth(calMonth.getMonth() + 1); viewStats(); };
    document.querySelectorAll('.cd2').forEach(b => b.onclick = () => { calSel = b.dataset.k; keepView(viewStats); });
    if ($('#copen')) $('#copen').onclick = () => { fdate = calSel; go('#food'); };
  };
  bindCal();
}

const BODY_GROUPS = [
  ['back', 'Спина', ['lats', 'lowback']], ['chest', 'Грудь', ['chest']], ['arms', 'Руки', ['biceps', 'triceps', 'forearm']],
  ['sh', 'Плечи', ['delts']], ['legs', 'Ноги', ['quads', 'hams', 'calves', 'glutes']], ['core', 'Кор', ['abs', 'obl']]
];
const BODY_CROP = { back: [250, 44, 120, 130], chest: [46, 56, 108, 100], arms: [10, 84, 180, 150], sh: [14, 20, 172, 172], legs: [40, 196, 120, 230], core: [56, 112, 88, 104] };
const BODY_TH = {
  dark: { base: '#3d3d43', body: '#35353b', line: 'rgba(255,255,255,.8)', w: 1.3, hair: '#5a5a62' },
  light: { base: '#fbfbf9', body: '#eceae4', line: '#1b2330', w: 1.5, hair: '#3a3d46' },
  clear: { base: 'rgba(255,255,255,.13)', body: 'rgba(255,255,255,.06)', line: '#ffffff', w: 1.5, hair: 'rgba(255,255,255,.38)' }
};
function bodyColor(v) {
  if (!(v > 0)) return null;
  const t = Math.max(0, Math.min(1, v)), a = [246, 190, 160], b = [205, 40, 40];
  return 'rgb(' + a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',') + ')';
}
function figSvg(lv, th, opt) {
  opt = opt || {}; const T = BODY_TH[th || 'dark'], hl = opt.only ? new Set(opt.only) : null;
  const B = BODIES[opt.g || (profile().gender === 'female' ? 'f' : 'm')];
  const lev = c => hl && !hl.has(c) ? 0 : c === 'forearm' ? Math.max(lv.biceps || 0, lv.triceps || 0, lv.forearm || 0) * 0.6 : lv[c] || 0;
  const fill = (c, w) => bodyColor(lev(c) * (w || 1)) || T.base;
  const st = `stroke="${T.line}" stroke-width="${T.w * 0.55}" stroke-linejoin="round" stroke-linecap="round"`;
  const m = 'transform="matrix(-1 0 0 1 200 0)"', sh = th === 'light' ? [.2, .3] : [.18, .34];
  const mir = p => p + p.replace(/<(path|rect|ellipse)/, `<$1 ${m}`);
  const fem = B === BODIES.f;
  const HAIR_M = 'M100.2 3.9C103.3 4.0 106.9 4.2 109.9 5.3C112.9 6.5 116.0 8.4 118.2 11.0C120.4 13.6 122.1 17.2 123.1 20.6C124.1 24.1 123.9 28.1 124.3 31.8C124.7 35.7 124.9 39.4 125.7 43.2C126.4 46.9 128.0 50.9 128.7 54.4C129.3 58.0 129.5 61.5 129.4 64.0C129.3 66.8 129.2 68.8 128.2 70.5C127.2 72.3 125.2 73.8 123.4 74.6C121.6 75.4 119.4 75.4 117.4 75.0C115.4 74.7 113.0 74.0 111.4 72.9C109.8 71.9 108.5 71.0 107.8 68.9C107.0 66.9 106.8 62.8 106.9 60.8C107.1 58.9 107.8 58.8 108.7 57.4C109.7 55.9 111.4 54.1 112.6 52.1C113.8 49.9 115.2 47.2 115.9 44.7C116.6 42.4 117.8 38.9 116.8 37.4C115.8 35.8 112.3 36.5 109.9 35.5C107.5 34.4 104.5 32.9 102.4 31.1C100.3 29.3 98.4 26.7 97.2 24.6C95.9 22.7 96.2 19.7 94.9 19.1C93.7 18.3 91.3 19.5 89.7 20.6C88.0 21.8 86.2 24.3 85.2 26.3C84.2 28.2 84.0 30.9 83.7 32.8C83.3 34.4 83.0 34.9 83.2 36.7C83.4 38.5 84.0 40.9 84.7 43.2C85.5 45.5 86.6 48.2 87.7 50.4C88.8 52.7 90.4 55.0 91.2 56.8C92.0 58.8 92.3 59.7 92.5 61.7C92.7 63.7 93.1 66.9 92.5 68.9C91.9 71.0 90.4 72.7 88.9 73.7C87.4 74.9 85.7 75.4 83.7 75.4C81.7 75.4 78.8 74.6 76.9 73.7C75.0 72.9 73.5 72.2 72.4 70.5C71.3 68.9 70.5 66.8 70.3 64.0C70.0 61.5 70.4 58.0 70.9 54.4C71.5 50.9 73.1 47.2 73.6 43.2C74.1 39.2 73.5 34.3 73.9 30.3C74.3 26.3 74.7 22.6 76.2 19.1C77.7 15.5 80.4 11.8 82.9 9.4C85.4 7.0 88.3 5.8 91.2 4.9C94.0 3.9 97.0 3.8 100.2 3.9Z';
  const HAIR_BK = 'M100.2 3.9C103.3 4.0 106.9 4.2 109.9 5.3C112.9 6.5 116.0 8.4 118.2 11.0C120.4 13.6 122.1 17.2 123.1 20.6C124.1 24.1 123.9 28.1 124.3 31.8C124.7 35.7 124.9 39.4 125.7 43.2C126.4 46.9 128.0 50.9 128.7 54.4C129.3 58.0 129.5 61.5 129.4 64.0C129.3 66.8 129.2 68.8 128.2 70.5C127.2 72.3 125.2 73.7 123.4 74.6C121.6 75.4 121.3 75.3 117.4 75.5C113.5 75.8 105.6 76.0 100.0 76.0C94.4 76.0 87.5 75.9 83.7 75.5C79.8 75.1 78.8 74.6 76.9 73.7C75.0 72.9 73.5 72.2 72.4 70.5C71.3 68.9 70.5 66.8 70.3 64.0C70.0 61.5 70.4 58.0 70.9 54.4C71.5 50.9 73.1 47.2 73.6 43.2C74.1 39.2 73.5 34.3 73.9 30.3C74.3 26.3 74.7 22.6 76.2 19.1C77.7 15.5 80.4 11.8 82.9 9.4C85.4 7.0 88.3 5.8 91.2 4.9C94.0 3.9 97.0 3.8 100.2 3.9Z';
  const HAIR_HL = ['M115.2 47.2C115.6 48.7 116.7 53.0 117.7 56.1C118.7 59.2 120.0 62.8 121.2 65.7C122.4 68.7 124.3 72.4 124.9 73.7', 'M112.6 54.1C112.9 55.7 113.8 60.3 114.7 63.3C115.6 66.4 117.2 70.7 117.7 72.2', 'M119.7 48.3C120.2 50.1 122.1 55.8 123.1 59.3C124.1 62.8 125.3 67.7 125.8 69.2', 'M81.4 38.3C80.7 39.7 78.3 43.2 77.2 46.4C76.1 49.6 75.3 53.9 74.8 57.6C74.3 61.5 74.3 67.3 74.2 69.2', 'M83.8 40.2C83.2 42.2 81.0 47.6 80.2 51.2C79.5 54.9 79.1 59.2 79.3 62.5C79.5 65.9 81.1 69.8 81.4 71.4', 'M86.8 51.2C86.7 52.8 85.8 57.5 85.9 60.8C86.1 64.3 87.4 69.6 87.7 71.4', 'M76.6 66.0C76.2 66.8 74.3 69.2 74.5 70.5C74.7 71.8 77.2 73.2 77.8 73.7', 'M81.4 21.4C81.1 22.4 80.0 25.0 79.3 27.3C78.6 29.8 77.8 34.6 77.5 36.0', 'M83.2 22.2C82.9 23.3 81.9 26.2 81.4 28.6C80.9 31.2 80.3 35.7 80.0 37.0', 'M102.4 24.6C103.2 25.5 105.0 28.0 107.2 29.7C109.5 31.3 114.5 33.7 115.9 34.4', 'M104.7 22.8C105.6 23.6 107.9 25.5 110.2 27.1C112.5 28.6 117.0 31.3 118.3 32.2', 'M111.7 20.0C112.7 20.8 116.1 22.8 117.7 24.8C119.3 26.8 120.7 30.9 121.3 32.2', 'M114.1 20.0C115.0 21.0 118.3 23.7 119.8 26.4C121.2 29.1 122.3 34.8 122.8 36.4', 'M108.4 21.3C109.5 22.3 112.9 25.4 114.7 27.3C116.5 29.4 118.5 32.5 119.2 33.5'];
  const HAIR_BHL = ['M115.2 47.2C115.6 48.7 116.7 53.0 117.7 56.1C118.7 59.2 120.0 62.8 121.2 65.7C122.4 68.7 124.3 72.4 124.9 73.7', 'M81.4 38.3C80.7 39.7 78.3 43.2 77.2 46.4C76.1 49.6 75.3 53.9 74.8 57.6C74.3 61.5 74.3 67.3 74.2 69.2', 'M83.8 40.2C83.2 42.2 81.0 47.6 80.2 51.2C79.5 54.9 79.1 59.2 79.3 62.5C79.5 65.9 81.1 69.8 81.4 71.4', 'M119.7 48.3C120.2 50.1 122.1 55.8 123.1 59.3C124.1 62.8 125.3 67.7 125.8 69.2', 'M88.9 14.2C88.4 18.2 86.3 30.0 85.9 38.3C85.5 46.7 86.2 58.3 86.7 64.0C87.2 70.0 88.5 72.2 88.9 73.7', 'M100.2 7.8C100.1 12.9 99.7 27.9 99.7 38.3C99.7 48.9 100.0 65.2 100.0 70.5', 'M111.4 14.2C111.8 18.2 113.4 30.0 113.7 38.3C113.9 46.7 113.3 58.3 112.9 64.0C112.5 70.0 111.7 72.2 111.4 73.7', 'M103.9 9.4C104.0 14.2 104.7 28.1 104.7 38.3C104.7 48.6 104.0 65.2 103.9 70.5', 'M95.7 10.2C95.5 14.8 95.0 28.2 94.9 38.3C94.8 48.5 95.2 65.2 95.2 70.5'];
  const BUST = 'M66.3 104C64.7 112.5 66.7 120.5 72.1 125.5C78.4 130.5 89.4 130.5 95.6 126.5C98.2 124.5 99.1 121.5 99.1 118C99.1 108.5 92.8 100 83.8 99C74.7 98 67.6 99 66.3 104Z', BUST_FOLD = 'M67.4 113C68.5 120 73 125.5 78.8 128C85.9 130.5 93.4 128.5 97.8 123.5';
  const ARM = new Set(['forearm', 'biceps', 'triceps', 'delts']), LEG = new Set(['quads', 'hams', 'calves', 'glutes']), sil = !!opt.sil;
  const view = (V, id, back) => {
    let o = '';
    const part = (d, f) => sil
      ? `<path d="${d}" fill="${T.base}" stroke="none"/><path d="${d}" fill="url(#bshd)" stroke="none" opacity=".4"/>`
      : `<path d="${d}" fill="${f}" ${st}/><path d="${d}" fill="url(#bshd)" stroke="none"/>`;
    const mg = s => s + `<g ${m}>${s}</g>`;
    let neu = '', mus = '', ab = '', ln = '';
    if (!sil) V.neu.forEach(d => { neu += part(d, T.base); });
    V.list.forEach(r => { if (sil && fem && !back && r[1] === 'chest') return; const c = ARM.has(r[1]) ? 'a' : LEG.has(r[1]) ? 'l' : '', p = part(r[2], fill(r[1], r[3])); mus += c ? `<g clip-path="url(#${id}${c})">${p}</g>` : p; });
    if (V.abs) V.abs.forEach(d => { ab += sil ? `<path d="${d}" fill="${T.base}" stroke="none"/><path d="${d}" fill="url(#bshd)" opacity=".35"/>` : `<path d="${d}" fill="${fill('abs')}" ${st}/><path d="${d}" fill="url(#bshd)"/>`; });
    V.lines.forEach(d => { ln += `<path d="${d}" fill="none" stroke="${T.line}" stroke-width=".55" opacity="${sil ? .16 : .38}" stroke-linecap="round"/>`; });
    o = mg(neu) + mg(mus) + mg(ab) + mg(ln);
    if (fem && !back) o += mg(sil ? `<path d="${BUST}" fill="url(#bbust)" stroke="none"/><path d="${BUST_FOLD}" fill="none" stroke="${T.line}" stroke-width=".5" stroke-linecap="round" opacity=".4"/>` : `<path d="${BUST}" fill="url(#bshd)" stroke="none" opacity=".38"/><path d="${BUST_FOLD}" fill="none" stroke="${T.line}" stroke-width=".55" stroke-linecap="round" opacity=".62"/>`);
    const hair = fem ? (() => { const M = back ? HAIR_BK : HAIR_M;
      return `<path d="${M}" fill="${T.hair}" ${st}/>` + (back ? HAIR_BHL : HAIR_HL).map(d => `<path d="${d}" fill="none" stroke="${T.line}" stroke-width=".55" stroke-linecap="round" opacity=".6"/>`).join('') + `<path d="${M}" fill="url(#bshd)" stroke="none" opacity=".5"/>`; })() : '';
    const pony = '';
    const clip = `<clipPath id="${id}"><path d="${V.sil}Z"/><path d="${V.sil}Z" ${m}/></clipPath><clipPath id="${id}a"><path d="${V.ca}"/><path d="${V.ca}" ${m}/></clipPath><clipPath id="${id}l"><path d="${V.cl}"/><path d="${V.cl}" ${m}/></clipPath>`;
    const base = mir(`<path d="${V.sil}Z" fill="${sil ? T.base : T.body}" stroke="none"/>`) + (sil ? mir(`<path d="${V.sil}Z" fill="url(#bshd)" stroke="none" opacity=".5"/>`) : '');
    const outline = mir(`<path d="${V.sil}" fill="none" stroke="${T.line}" stroke-width="${T.w * 1.1}" stroke-linejoin="round" stroke-linecap="round"/>`);
    return { clip, svg: base + `<g clip-path="url(#${id})">${o}</g>` + outline + hair + pony };
  };
  const f = view(B.front, 'bcf', 0), b = view(B.back, 'bcb', 1);
  const defs = `<defs><radialGradient id="bbust" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></radialGradient><radialGradient id="bshd" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#fff" stop-opacity="${sh[0]}"/><stop offset="1" stop-color="#000" stop-opacity="${sh[1]}"/></radialGradient>${f.clip}${b.clip}</defs>`;
  const c = opt.crop, vb = c ? c.join(' ') : '8 0 394 428', cls = opt.cls ? ` class="${opt.cls}"` : '';
  return `<svg${cls} viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid ${c ? 'slice' : 'meet'}">${defs}<g>${opt.back || ''}${f.svg}${opt.extra || ''}</g>${opt.view === 'front' ? '' : `<g transform="translate(210 0)">${b.svg}</g>`}</svg>`;
}

Object.assign(I, {
  pen: '<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>',
  help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 115 .8c0 1.6-2.5 1.8-2.5 3.4M12 17v.1"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 15V3M8 7l4-4 4 4M5 12v8h14v-8"/></svg>',
  dl: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 11l5 5 5-5M5 20h14"/></svg>',
  dumb: '<svg viewBox="0 0 24 24"><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/></svg>',
  fire: '<svg viewBox="0 0 24 24"><path d="M12 3c1 3.500 5 5.500 5 10a5 5 0 01-10 0c0-2 1-3.500 2-4.500 0 1.500.7 2.300 1.500 2.500C10.200 8 10.500 5.500 12 3z"/></svg>',
  bmr: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.500"/><path d="M13 6l-4 7h4l-1 5 4-7h-4z"/></svg>'
});

const metOf = ton => ton > 0 ? 4.5 : 3.8;
const kcalCalc = (met, w, min) => ({ act: Math.round((met - 1) * w * min * 0.0175), bmr: Math.round(w * min * 0.0175), tot: Math.round(met * w * min * 0.0175) });
const musOf = ex => /curl|hammer/.test(ex) ? ['biceps'] : (LIBM[ex] || []).filter(m => m !== 'cardio');
const grpSets = mus => BODY_GROUPS.map(g => [g[0], g[1], Math.round(g[2].reduce((s, c) => s + (mus[c] || 0), 0))]);
const bodyLevels = mus => { const mx = Math.max(1, ...Object.values(mus)), lv = {}; Object.keys(mus).forEach(c => { lv[c] = mus[c] > 0 ? 0.28 + 0.72 * mus[c] / mx : 0; }); return lv; };
const fmtKg = n => String(Math.round(n * 10) / 10).replace('.', ',');
const fmtDurS = s => { const m = Math.max(1, Math.round(s / 60)); return m >= 60 ? { n: Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'), u: 'ч' } : { n: String(m), u: 'мин' }; };
const hhmm = d => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
const bestText = e => e.t ? fmtT(e.t) : e.w ? (e.hk === 'mix' ? fmtKg(e.w) + ' + ' + fmtKg(e.w2) + ' кг' : e.hk === 'pair' ? 'по ' + fmtKg(e.w) + ' кг' : fmtKg(e.w) + ' кг') + ' × ' + e.r : e.r ? e.r + ' повт.' : '';
const pgUi = { tab: 'info', viz: 'fig', met: 'w' };
Object.assign(I, { play: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>' });
function dayMuscles(day) {
  const mus = {}; let sets = 0;
  day.items.forEach(it => { const n = it.sets ? it.sets.length : 1; sets += n; musOf(it.ex).forEach((m, i) => { mus[m] = (mus[m] || 0) + n * (i ? 0.5 : 1); }); });
  return { mus, sets };
}
function popMenu(btn, list, cur, cb) {
  document.querySelectorAll('.pgpop').forEach(x => x.remove());
  const m = document.createElement('div'); m.className = 'pgpop';
  m.innerHTML = list.map(l => `<button data-v="${l[0]}"><i>${l[0] === cur ? '✓' : ''}</i>${l[1]}</button>`).join('');
  btn.parentNode.appendChild(m);
  const off = e => { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('click', off, true); } };
  setTimeout(() => document.addEventListener('click', off, true), 0);
  m.querySelectorAll('button').forEach(b => b.onclick = () => { m.remove(); document.removeEventListener('click', off, true); cb(b.dataset.v); });
}
function ringHtml(gs) {
  const mx = Math.max(1, ...gs.map(g => g[2])), ang = { back: -90, chest: -30, arms: 30, sh: 90, legs: 150, core: 210 }, R = [34, 48, 62, 76], sh = ['#6b6b70', '#8e8e93', '#bdbdc2', '#f0f0f2'];
  const pt = (r, a) => [150 + r * Math.cos(a * Math.PI / 180), 150 + r * Math.sin(a * Math.PI / 180)];
  let arcs = '', ic = '';
  gs.forEach(g => {
    const a = ang[g[0]], L = g[2] ? Math.max(1, Math.ceil(g[2] / mx * 4)) : 0;
    R.forEach((r, i) => { const p1 = pt(r, a - 22), p2 = pt(r, a + 22); arcs += `<path d="M${p1[0].toFixed(1)} ${p1[1].toFixed(1)}A${r} ${r} 0 0 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}" fill="none" stroke="${i < L ? sh[i + 4 - L] : '#2c2c2f'}" stroke-width="9" stroke-linecap="round"/>`; });
    const c = pt(122, a), codes = BODY_GROUPS.find(q => q[0] === g[0])[2], lv = {}; codes.forEach(k => { lv[k] = g[2] ? 0.85 : 0; });
    const right = Math.cos(a * Math.PI / 180) >= -0.1;
    ic += `<div class="rgi ${right ? '' : 'l'}" style="left:${(c[0] / 3).toFixed(2)}%;top:${(c[1] / 3).toFixed(2)}%"><span>${figSvg(lv, 'dark', { crop: BODY_CROP[g[0]], only: codes })}</span><em>${g[2]}</em></div>`;
  });
  return `<div class="ringw"><svg viewBox="0 0 300 300">${arcs}</svg>${ic}</div>`;
}
function statBlock(pid) {
  const now = new Date(), y = now.getFullYear(), mo = now.getMonth(), n = new Date(y, mo + 1, 0).getDate(), vals = Array(n).fill(0);
  hist().filter(h => h.pid === pid).forEach(h => { const dt = new Date(h.ts); if (dt.getFullYear() === y && dt.getMonth() === mo) vals[dt.getDate() - 1] += pgUi.met === 'w' ? (h.ton || 0) : pgUi.met === 's' ? (h.sets || 0) : Math.round(h.sec / 60); });
  const sum = vals.reduce((a, b) => a + b, 0), mx = Math.max(1, ...vals), unit = pgUi.met === 'w' ? ' кг' : pgUi.met === 's' ? '' : ' мин', top = Math.max(2, Math.ceil(mx / 2) * 2);
  return `<div class="pgst"><div class="pgsr"><div><small>Всего</small><b>${sum.toLocaleString('ru-RU')}<u>${unit}</u></b><small>${MONTHS[mo].toLowerCase()} ${y} г.</small></div><div class="pgmw"><button class="pgm dk" id="pgmet">${{ w: 'Вес', s: 'Подходы', t: 'Время' }[pgUi.met]}<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button></div></div>
    <div class="pgbars">${[0, 1, 2].map(i => `<span style="bottom:${i * 50}%"><i>${Math.round(top * i / 2)}</i></span>`).join('')}${vals.map((v, i) => `<u style="left:${(i + 0.5) / n * 100}%;height:${v / top * 100}%"></u>`).join('')}</div>
    <div class="pgx">${[1, 8, 15, 22, n].map(x => `<span>${x}</span>`).join('')}</div></div>`;
}
let sumFrom = '#history';

/* мышцы тренировки: основная группа целиком, вторичные с весом 0,5 (как в плане дня); для старых записей пересчёт по списку упражнений */
function recMus(x) {
  if (x.exs && x.exs.length) { const m = {}; x.exs.forEach(e => musOf(e.ex).forEach((k, i) => { m[k] = (m[k] || 0) + (e.n || 1) * (i ? 0.5 : 1); })); if (Object.keys(m).length) return m; }
  return x.mus || null;
}
function sessionData() {
  const exs = [], mus = {}; let sets = 0;
  run.steps.forEach(s => {
    if (!s.ex || s.k === 'rest' || /^st_/.test(s.ex) || (s.half && s.half !== 1)) return;
    let e = exs.find(q => q.ex === s.ex); if (!e) exs.push(e = { ex: s.ex, n: 0, best: null });
    e.n++; sets++;
    const t = s.k === 'time' ? s.sec : 0, r = s.reps || 0, hd = s.db && !s.bw ? (s.hd || stepHands(s)) : null, lw = s.lw !== undefined ? s.lw : stepLoad(s), sc = t || lw * r || r;
    if (!e.best || sc > e.best.sc) e.best = { r, t, sc, hd };
    musOf(s.ex).forEach((m, i) => { mus[m] = (mus[m] || 0) + (i ? 0.5 : 1); });
  });
  return { exs: exs.map(e => { const h = e.best.hd, o = { ex: e.ex, n: e.n, r: e.best.r, w: h ? Math.round(h.a * 10) / 10 : 0, t: e.best.t }; if (h) { o.hk = h.k; if (h.k === 'mix') o.w2 = Math.round(h.b * 10) / 10; } return o; }), mus, sets };
}
function updHist(ts, fn) { const h = hist(), x = h.find(q => q.ts === ts); if (!x) return; fn(x); store.set('hist', h); }
function refit(x) {
  if (x.kM) return;
  x.kcal = kcalCalc(x.met || metOf(x.ton), x.w || profile().w, x.sec / 60).act;
}

function viewSummary(ts) {
  const x = hist().find(q => q.ts === ts); if (!x) return go('#history');
  const w = x.w || profile().w, met = x.met || metOf(x.ton), c = kcalCalc(met, w, x.sec / 60), tot = x.kcal + c.bmr;
  const st = new Date(x.st || x.ts - x.sec * 1000), dur = fmtDurS(x.sec), gs = recMus(x) ? grpSets(recMus(x)) : [], mx = Math.max(1, ...gs.map(g => g[2]));
  const exs = x.exs || [], tonS = x.ton ? (x.ton >= 1000 ? fmtKg(x.ton / 1000) + '<u> т</u>' : x.ton + '<u> кг</u>') : '0<u> кг</u>';
  view(`<div class="screen sm">
    <div class="bar"><button class="rbtn" id="smb" aria-label="Назад">${I.back}</button><h1>Итог тренировки</h1><button class="rbtn dng" id="smd" aria-label="Удалить">${I.trash}</button></div>
    ${/^#prog/.test(sumFrom) ? '<div class="smwin"><img src="img/win.webp" alt="" onerror="this.remove()"></div>' : ''}
    ${XT.sumPr(ts)}${XT.sumWeek(ts)}${XT.sumFeel(ts, x)}
    <div class="smc"><div class="smh"><span class="smi">${I.dumb}</span><div><small>Силовая тренировка</small><b>${esc(x.title)}</b></div></div>
      <div class="smg"><button class="smt" id="sdur"><small>Длительность<i>${I.pen}</i></small><b>${dur.n}<u> ${dur.u}</u></b></button>
      <button class="smt" id="sst"><small>Начало<i>${I.pen}</i></small><b>${hhmm(st)}</b></button>
      <div class="smt"><small>Поднятый вес</small><b>${tonS}</b></div>
      <div class="smt"><small>Подходы</small><b>${x.sets || 0}${x.sets ? '<u> из ' + x.sets + '</u>' : ''}</b></div></div></div>
    <div class="smsh"><h2>Расход энергии</h2><button id="shw">Как мы считаем<span>${I.help}</span></button></div>
    <div class="smc"><button class="sma" id="sact"><div class="smal"><span>${I.fire}</span>Активные</div><i>${I.pen}</i><b>${x.kcal}<u> ккал</u></b><small>Дополнительно к дневному расходу</small></button>
      <div class="smb"><div class="smal dim"><span>${I.bmr}</span>Базовый обмен</div><b>${c.bmr}<u> ккал</u></b><small>Уже заложено</small></div>
      <div class="smtot"><span>Всего за тренировку</span><b>${tot}<u> ккал</u></b></div></div>
    ${recMus(x) ? `<div class="smsh"><h2>Нагрузка по мышцам</h2></div><div class="smc smfig"><div class="smf">${figSvg(bodyLevels(recMus(x)), 'dark')}</div><div class="smgl">${gs.map(g => `<div><span>${g[1]}</span><i><u style="width:${g[2] ? Math.max(14, g[2] / mx * 100) : 0}%"></u></i><b>${g[2]}</b></div>`).join('')}</div></div>` : ''}
    ${exs.length ? `<div class="smsh"><h2>Упражнения</h2><span class="smdim">Лучший сет</span></div><div class="smc smex">${exs.map(e => `<div><span>${e.n} ×</span><b>${esc(EX[e.ex] ? EX[e.ex].name : e.ex)}</b><em>${bestText(e)}</em></div>`).join('')}</div>` : ''}
    <div class="smfoot"><button class="big sec" id="smshare">${I.share}Поделиться</button><button class="big" id="smsave">Сохранить</button></div></div>`);
  const back = () => go(sumFrom);
  $('#smb').onclick = back; $('#smsave').onclick = back;
  $('#smshare').onclick = () => openShare(ts, false);
  $('#smd').onclick = () => openSheet(`<h3>Удалить тренировку?</h3><div class="opt"><small>Она пропадёт из истории и статистики.</small></div><button class="big dngb" id="smdy">Удалить</button>`, () => {
    $('#smdy').onclick = () => { store.set('hist', hist().filter(q => q.ts !== ts)); closeSheet(); go('#history'); };
  });
  $('#sdur').onclick = () => { const m = Math.max(1, Math.round(x.sec / 60)); openWheel('Длительность', [{ items: range(0, 12).map(v => v + ' ч'), idx: Math.floor(m / 60) }, { items: range(0, 59).map(v => v + ' мин'), idx: m % 60 }], 'Готово', r => { const n = Math.max(1, r[0] * 60 + r[1]); updHist(ts, q => { q.sec = n * 60; refit(q); }); viewSummary(ts); }); };
  $('#sst').onclick = () => openWheel('Начало', [{ items: range(0, 23).map(v => String(v).padStart(2, '0')), idx: st.getHours() }, { items: range(0, 59).map(v => String(v).padStart(2, '0')), idx: st.getMinutes() }], 'Готово', r => { const d = new Date(st); d.setHours(r[0], r[1], 0, 0); updHist(ts, q => { q.st = d.getTime(); }); viewSummary(ts); });
  $('#sact').onclick = () => openSheet(`<h3>Активные калории</h3><div class="opt"><input id="kv" type="number" inputmode="numeric" min="0" max="5000" value="${x.kcal}"></div><button class="big" id="kok">Сохранить</button><button class="big sec" id="krs">Пересчитать автоматически</button>`, () => {
    $('#kok').onclick = () => { const n = Math.round(parseFloat($('#kv').value)); if (n >= 0 && n < 5000) { updHist(ts, q => { q.kcal = n; q.kM = 1; }); closeSheet(); viewSummary(ts); } };
    $('#krs').onclick = () => { updHist(ts, q => { q.kM = 0; refit(q); }); closeSheet(); viewSummary(ts); };
  });
  $('#shw').onclick = () => openSheet(`<h3>Как мы считаем?</h3>
    <div class="hw hwa"><b class="hwt">Активные</b><div class="hwi"><small>Сверх базового обмена</small><b>${x.kcal}<u> ккал</u></b>
      <div class="hwf"><span>(MET ${String(met).replace('.', ',')}) − 1</span>×<span>Вес ${fmtKg(w)} кг</span>×<span>Минуты ${Math.round(x.sec / 60)}</span>×<span>0,0175</span></div></div>
      <div class="hwo"><small>Всего активных</small><b>${x.kcal}<u> ккал</u></b><p>Это калории сверх базового обмена, их тренировка добавила к твоему дню.</p></div></div>
    <div class="hwp">+</div>
    <div class="hw"><b>Базовый обмен</b><b class="hwn">${c.bmr}<u> ккал</u></b><p>Столько тело потратило бы за это время и в покое. Это часть твоего базового обмена, он уже учтён в норме дня.</p></div>
    <div class="hwp">=</div>
    <div class="hw"><b>Всего за тренировку</b><b class="hwn">${tot}<u> ккал</u></b><p>Сколько энергии ушло за занятие целиком. Цифра для понимания масштаба, а не для зачёта в день.</p></div>
    <div class="hws"><h4>Источники</h4><div>Compendium of Physical Activities (Ainsworth и др.)<small>значения MET для силовых тренировок</small></div><div>Формула энергозатрат по MET<small>ккал = MET × вес (кг) × минуты × 0,0175</small></div></div>
    <button class="big" id="hwok">Понятно</button>`, () => { $('#hwok').onclick = closeSheet; });
}

const FONT = '-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function fit(ctx, t, maxW) { if (ctx.measureText(t).width <= maxW) return t; while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1); return t + '…'; }
function loadSvg(svg, w, h) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', `<svg width="${w}" height="${h}" `)); }); }
const APPLOGO = new Image(); APPLOGO.src = 'icons/180.png';
function cardHead(ctx, W, th, x, num) {
  const ink = th === 'light' ? '#141a22' : '#fff', dim = th === 'light' ? '#7d806c' : 'rgba(255,255,255,.72)';
  ctx.save(); rr(ctx, 72, 60, 96, 96, 24); ctx.clip(); if (APPLOGO.complete && APPLOGO.naturalWidth) ctx.drawImage(APPLOGO, 72, 60, 96, 96); else { ctx.fillStyle = '#000'; ctx.fillRect(72, 60, 96, 96); } ctx.restore();
  ctx.fillStyle = ink; ctx.font = `800 66px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('ТРЕНЕР', 190, 130);
  ctx.fillStyle = dim; ctx.font = `500 38px ${FONT}`; ctx.fillText(new Date(x.ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }), 72, 188);
  if (num) { ctx.textAlign = 'right'; ctx.fillStyle = ink; ctx.font = `800 150px ${FONT}`; ctx.fillText(String(num), W - 72, 150); ctx.fillStyle = dim; ctx.font = `500 40px ${FONT}`; ctx.fillText('Тренировка', W - 72, 204); ctx.textAlign = 'left'; }
}
function cardBg(ctx, W, H, th) { ctx.clearRect(0, 0, W, H); if (th === 'light') { ctx.fillStyle = '#fbfbfa'; rr(ctx, 0, 0, W, H, 96); ctx.fill(); } }
async function drawCard1(cv, x, th, num) {
  const W = 1080, H = 1350; cv.width = W; cv.height = H; const ctx = cv.getContext('2d'); cardBg(ctx, W, H, th); cardHead(ctx, W, th, x, num);
  const ink = th === 'light' ? '#141a22' : '#fff', dim = th === 'light' ? '#7d806c' : 'rgba(255,255,255,.72)';
  const fh = 900, fw = Math.round(fh * 394 / 428), im = await loadSvg(figSvg(recMus(x) ? bodyLevels(recMus(x)) : {}, th === 'light' ? 'light' : 'clear'), fw, fh);
  if (im) ctx.drawImage(im, (W - fw) / 2, 240, fw, fh);
  const cols = [['Длительность', fmtT(x.sec)], ['Упражнения', String((x.exs || []).length)], ['Подходы', String(x.sets || 0)]];
  cols.forEach((c, i) => { const cx = 190 + i * 350; ctx.textAlign = 'center'; ctx.fillStyle = dim; ctx.font = `500 38px ${FONT}`; ctx.fillText(c[0], cx, 1210); ctx.fillStyle = ink; ctx.font = `800 70px ${FONT}`; ctx.fillText(c[1], cx, 1292); });
}
function drawCard2(cv, x, th) {
  const exs = (x.exs || []).slice(0, 14), W = 1080, H = 470 + exs.length * 92 + 50; cv.width = W; cv.height = H; const ctx = cv.getContext('2d'); cardBg(ctx, W, H, th); cardHead(ctx, W, th, x, 0);
  const ink = th === 'light' ? '#141a22' : '#fff', dim = th === 'light' ? '#7d806c' : 'rgba(255,255,255,.72)';
  ctx.textAlign = 'left'; ctx.fillStyle = dim; ctx.font = `500 52px ${FONT}`; ctx.fillText(fit(ctx, `${x.title}, день ${x.day}`, W - 144), 72, 268);
  const dur = fmtDurS(x.sec), tn = x.ton ? (x.ton >= 1000 ? fmtKg(x.ton / 1000) + ' т' : x.ton + ' кг') : '0 кг', row = [[dur.n + ' ' + dur.u], [tn], [String(x.sets || 0) + ' подх.']];
  ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.fillStyle = ink; ctx.font = `700 46px ${FONT}`;
  let px = 72;
  row.forEach((r, i) => { ctx.beginPath(); if (i === 0) { ctx.arc(px + 24, 342, 24, 0, 7); ctx.moveTo(px + 24, 328); ctx.lineTo(px + 24, 342); ctx.lineTo(px + 34, 348); } else if (i === 1) { rr(ctx, px + 4, 322, 40, 40, 8); ctx.moveTo(px + 14, 322); ctx.lineTo(px + 14, 314); ctx.lineTo(px + 34, 314); ctx.lineTo(px + 34, 322); } else { ctx.arc(px + 24, 342, 22, 0.4, 5.2); ctx.moveTo(px + 38, 318); ctx.lineTo(px + 46, 330); ctx.lineTo(px + 32, 334); } ctx.stroke(); ctx.fillText(r[0], px + 64, 358); px += 64 + ctx.measureText(r[0]).width + 54; });
  ctx.fillStyle = dim; ctx.font = `500 42px ${FONT}`; ctx.fillText('Упражнения', 72, 450); ctx.textAlign = 'right'; ctx.fillText('Лучший сет', W - 72, 450); ctx.textAlign = 'left';
  exs.forEach((e, i) => { const y = 530 + i * 92, nm = EX[e.ex] ? EX[e.ex].name : e.ex; ctx.fillStyle = dim; ctx.font = `500 52px ${FONT}`; ctx.fillText(e.n + ' ×', 72, y); ctx.fillStyle = ink; ctx.font = `500 52px ${FONT}`; ctx.fillText(fit(ctx, nm, 600), 190, y); const bt = bestText(e); if (bt) { ctx.textAlign = 'right'; ctx.fillStyle = dim; ctx.font = `600 42px ${FONT}`; ctx.fillText(bt, W - 72, y); ctx.textAlign = 'left'; } });
}
function openShare(ts, fresh) {
  const x = hist().find(q => q.ts === ts); if (!x) return;
  const num = hist().slice().sort((a, b) => a.ts - b.ts).findIndex(q => q.ts === ts) + 1;
  const el = document.createElement('div'); el.className = 'shr'; let th = 'light';
  el.innerHTML = `<button class="rbtn shx" id="shx" aria-label="Закрыть">${I.close}</button><h2>Отличная работа!</h2><p>Не забудь поделиться результатами</p>
    <div class="seg shseg"><button data-th="light" class="on">Заливка</button><button data-th="clear">Прозрачный</button></div>
    <div class="shpg" id="shpg"><div class="shp"><canvas id="cv1"></canvas></div><div class="shp"><canvas id="cv2"></canvas></div></div>
    <div class="shdots"><i class="on"></i><i></i></div>
    <div class="shact"><button class="big sec" id="shdl">${I.dl}Скачать</button><button class="big" id="shsh">${I.share}Поделиться</button></div>`;
  document.body.appendChild(el);
  const draw = async () => { el.classList.toggle('clr', th === 'clear'); await drawCard1($('#cv1'), x, th, num); drawCard2($('#cv2'), x, th); };
  draw();
  const pg = $('#shpg'), cur = () => Math.round(pg.scrollLeft / Math.max(1, pg.clientWidth));
  pg.onscroll = () => el.querySelectorAll('.shdots i').forEach((d, i) => d.classList.toggle('on', i === cur()));
  el.querySelectorAll('[data-th]').forEach(b => b.onclick = () => { th = b.dataset.th; el.querySelectorAll('[data-th]').forEach(q => q.classList.toggle('on', q === b)); draw(); });
  $('#shx').onclick = () => el.remove();
  const blob = () => new Promise(r => $(cur() ? '#cv2' : '#cv1').toBlob(r, 'image/png'));
  $('#shsh').onclick = async () => {
    const b = await blob(); if (!b) return; const f = new File([b], 'trening.png', { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f] }); else toast('Поделиться не получилось', 'Нажми «Скачать»'); } catch (e) { }
  };
  $('#shdl').onclick = async () => { const b = await blob(); if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'trening.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
}

route();
setTimeout(() => { try { ACH.notify(); } catch (e) { } }, 600);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const hadSW = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!hadSW) return; if (run && !run.done) reloadLater = true; else location.reload(); });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    const chk = () => { try { reg.update(); } catch (e) { } };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') chk(); });
    setInterval(chk, 5 * 60 * 1000);
    const urls = [...new Set(Object.keys(EX).flatMap(mediaUrls))].concat([...Array(16)].map((_, i) => 'img/r/r' + (i + 1) + '.jpg'), ['db', 'bar', 'tread', 'bike', 'band', 'mini'].flatMap(k => ['m', 'f'].map(g => 'img/eq_' + k + '_' + g + '.webp')), ['fire', 'rest', 'flex', 'food', 'cup', 'hist', 'ex', 'tapem', 'tapef', 'out', 'suit'].map(k => 'img/m_' + k + '.webp'));
    (window.requestIdleCallback || (f => setTimeout(f, 1500)))(() => urls.forEach(u => fetch(u).catch(() => { })));
  }).catch(() => { });
}

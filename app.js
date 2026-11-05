'use strict';
/* Тренер — PWA без сервера. Всё хранится на телефоне (localStorage). */

const $ = (s, el = document) => el.querySelector(s);
const SPEED = Number(new URLSearchParams(location.search).get('speed')) || 1; // для проверки: ?speed=10
const KG_PER_KCAL = 20.4;

/* ---------- хранилище ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('tr:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('tr:' + k, JSON.stringify(v)); } catch (e) { /* приватный режим */ } },
};
const settings = Object.assign({ names: true, tips: true, count: 'voice', rate: 1 }, store.get('settings', {}));
const saveSettings = () => store.set('settings', settings);
const hist = () => store.get('hist', []);
const PROFILE0 = { set: false, gender: 'male', h: 183, w: 67, goal: 75, exp: 2, act: 0 };
const profile = () => Object.assign({}, PROFILE0, store.get('profile', {}));
const EXPS = ['Не занимался', 'До 6 месяцев', '6–24 месяца', 'Больше 2 лет'], ACTS = ['Сидячий', 'Лёгкая активность', 'Очень активный'];
/* Подбор программ по росту, весу, цели, опыту и активности */
function recommend(p = profile()) {
  const bmi = p.w / Math.pow(p.h / 100, 2), delta = p.goal - p.w, goal = delta >= 2 ? 'gain' : delta <= -2 ? 'lose' : 'tone';
  let level = Math.min(5, Math.max(1, Math.round((p.exp * 2 + p.act) / 8 * 4) + 1));
  if (bmi >= 30) level = Math.min(level, 2);
  const out = [], add = (pid, why) => { if (!out.some(x => x.pid === pid)) out.push({ pid, why }); };
  const absId = level === 1 ? 'abs-new' : level === 2 ? (goal === 'lose' ? 'abs-lose' : 'abs-new') : level === 3 ? 'abs-adv' : level === 4 ? 'abs-pro' : 'abs-ins';
  if (prog(absId).stub) { add(absId, 'самая подходящая по уровню, появится позже'); if (level >= 3) add('abs-adv', 'пока ближайшая из готовых'); } else add(absId, 'подходит по уровню подготовки');
  const male = p.gender === 'male';
  if (goal === 'gain') { add('db-split', 'набор мышечной массы'); add(male ? 'legs-3' : 'glutes-3', 'крупные группы мышц дают основной прирост'); }
  else if (goal === 'lose') { add(male ? 'legs-3' : 'glutes-3', 'крупные мышцы тратят больше всего калорий'); add('db-split', 'сохраняет мышцы при похудении'); }
  else { add(male ? 'db-split' : 'glutes-3', 'тонус и форма'); add('legs-3', 'ноги работают вместе с общим тонусом'); }
  const notes = [];
  if (goal === 'gain') notes.push(`Цель +${num(Math.round(delta * 10) / 10)} кг: безопасный темп около 0,25–0,5 кг в неделю. Тренировки дают стимул, но нужен профицит калорий и белок в рационе.`);
  if (goal === 'lose') notes.push(`Цель ${num(Math.round(delta * 10) / 10)} кг: безопасный темп 0,5–1 кг в неделю. Нужен умеренный дефицит калорий, тренировки его поддерживают.`);
  if (bmi < 18.5) notes.push('Индекс массы тела ниже нормы: следи за питанием, не гони нагрузку.');
  if (bmi >= 30) notes.push('Индекс массы тела высокий: начинай с лёгкого уровня, прыжки заменяй шагом и не спеши.');
  if (p.exp <= 1) notes.push('На старте хватит 3 тренировок в неделю. Остальное добавляй, когда исчезнет сильная усталость.');
  if (p.act === 0) notes.push('Сидячая работа: каждый час вставай и разминайся, это помогает спине и ягодицам.');
  return { bmi, goal, level, items: out.slice(0, 3), notes };
}
const getW = (ex, def) => store.get('w:' + ex, def);
const setW = (ex, v) => store.set('w:' + ex, v);

/* ---------- утилиты ---------- */
const fmtT = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const fmtClock = s => { s = Math.max(0, Math.ceil(s)); return s >= 60 ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : String(s); };
const num = n => String(n).replace('.', ',');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const prog = id => PROGRAMS.find(p => p.id === id);
const dayData = (p, d) => p.day(d);
const thumb = ex => EX[ex].gif ? `gif/t_${EX[ex].gif}.jpg` : `img/t_${EX[ex].img}.jpg`;
const figHtml = ex => {
  if (!ex) return '<div class="fig"></div>';
  const e = EX[ex], tip = e.tip ? `<button class="tipbtn" id="tipbtn" aria-label="Совет по технике">${I.info}</button>` : '', chip = e.side ? '<span class="chip">на каждую ногу</span>' : '';
  return e.gif ? `<div class="fig gif"><img src="gif/${e.gif}.gif" alt="">${chip}${tip}</div>`
    : `<div class="fig"><img class="a" src="img/${e.img}_0.jpg" alt=""><img class="b" src="img/${e.img}_1.jpg" alt="">${chip}${tip}</div>`;
};
const mediaUrls = ex => EX[ex].gif ? [`gif/${EX[ex].gif}.gif`, `gif/t_${EX[ex].gif}.jpg`] : [`img/${EX[ex].img}_0.jpg`, `img/${EX[ex].img}_1.jpg`, `img/t_${EX[ex].img}.jpg`];
const I = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
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
  help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 114 2c-.9.6-1.6 1.1-1.6 2.2M12 16.8v.01"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M3.5 20.5h17"/><rect x="5" y="12" width="3.4" height="8.5" rx="1"/><rect x="10.3" y="5" width="3.4" height="15.5" rx="1"/><rect x="15.6" y="9" width="3.4" height="11.5" rx="1"/></svg>',
};
const ic = (n, c = '') => `<span class="ic ${c}">${I[n]}</span>`;

/* ---------- звук ---------- */
const Snd = {
  ctx: null, buf: {}, hasVoice: false, loaded: false, voice: null,
  keepAlive() { // беззвучный фоновый <audio>: на iPhone звук приложения перестаёт глушиться кнопкой «без звука»
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
    try { // «разблокируем» элемент для сигналов жестом пользователя
      if (!this.bp) { this.bp = new Audio(); this.bp.setAttribute('playsinline', ''); this.bp.src = this.toneUri(760, 0.05); this.bp.muted = true; const p = this.bp.play(); if (p && p.then) p.then(() => { this.bp.pause(); this.bp.muted = false; }).catch(() => { }); }
    } catch (e) { }
    try {
      if (!this.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) this.ctx = new C(); }
      if (this.ctx && this.ctx.state !== 'running') this.ctx.resume();
      if (this.ctx) { const s = this.ctx.createBufferSource(); s.buffer = this.ctx.createBuffer(1, 1, 22050); s.connect(this.ctx.destination); s.start(0); }
    } catch (e) { /* без звука */ }
    try { if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } } catch (e) { }
    this.loadPack();
  },
  loadPack() { // необязательные файлы voice/n4.mp3 … voice/stop.mp3 (см. tools/make_voice.py)
    if (this.loaded || !this.ctx) return; this.loaded = true;
    ['n4', 'n3', 'n2', 'n1', 'stop'].forEach(k => fetch('voice/' + k + '.mp3').then(r => r.ok ? r.arrayBuffer() : Promise.reject())
      .then(ab => new Promise((ok, no) => this.ctx.decodeAudioData(ab, ok, no)))
      .then(b => { this.buf[k] = b; this.hasVoice = !!(this.buf.n4 && this.buf.n3 && this.buf.n2 && this.buf.n1); }).catch(() => { }));
  },
  tones: {},
  toneUri(f, d) { // короткий звуковой сигнал в виде wav (обычный аудио-элемент на iPhone надёжнее WebAudio)
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
    this.voice = vs.find(v => /milena|yuri|enhanced|premium/i.test(v.name)) || vs[0] || null; return this.voice;
  },
  say(text, cancel = true) {
    if (!('speechSynthesis' in window)) return;
    try {
      const busy = speechSynthesis.speaking || speechSynthesis.pending;
      if (cancel && busy) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'ru-RU'; u.rate = settings.rate; u.volume = 1;
      const v = this.pickVoice(); if (v) u.voice = v;
      const go = () => { try { speechSynthesis.resume(); speechSynthesis.speak(u); } catch (e) { } };
      if (cancel && busy) setTimeout(go, 60); else go();
    } catch (e) { }
  },
};
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { Snd.voice = null; };
const WORDS = { 4: 'четыре', 3: 'три', 2: 'два', 1: 'один' };
function cue(n) {
  if (settings.count === 'beep' || !('speechSynthesis' in window) && !Snd.buf['n' + n]) return Snd.beep(n === 1 ? 900 : 760, 0.13);
  if (!Snd.play('n' + n)) Snd.say(WORDS[n]);
}
function stopSound() { if (!Snd.play('stop')) Snd.beep(1150, 0.55, 0.4); }
function speakName(t) { if (settings.names) Snd.say(t); }

/* ---------- экран не гаснет ---------- */
let wl = null;
async function wake() { try { if ('wakeLock' in navigator && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } } catch (e) { wl = null; } }
function unwake() { try { if (wl) wl.release(); } catch (e) { } wl = null; }
document.addEventListener('visibilitychange', () => { if (run && !run.done && document.visibilityState === 'visible') wake(); });

/* ---------- роутер ---------- */
const view = html => { $('#app').innerHTML = html; window.scrollTo(0, 0); guardImgs(); };
/* картинки иногда грузятся не сразу: повторяем загрузку, если не пришла */
function guardImgs() {
  document.querySelectorAll('#app img').forEach(im => {
    let n = 0; const re = () => { if (n++ >= 3 || !im.isConnected) return; im.src = im.src.split('?')[0] + '?r=' + Date.now() + n; };
    im.onerror = re; setTimeout(() => { if (im.isConnected && (!im.complete || !im.naturalWidth)) re(); }, 3000);
  });
}
const route = () => {
  const h = location.hash.slice(1), a = h.startsWith('prog-') ? 'p' : h === 'history' ? 'h' : h === 'stats' ? 's' : h === 'profile' ? 'f' : h === 'workout' ? 'w' : '', b = h.slice(5);
  if (run && a !== 'w') { clearInterval(timer); try { speechSynthesis.cancel(); } catch (e) { } unwake(); run = null; } // ушли назад из тренировки
  if (a === 'p' && prog(b) && !prog(b).stub) return viewProgram(b);
  if (a === 'h') return viewHistory();
  if (a === 's') return viewStats();
  if (a === 'f') return viewProfile();
  if (a === 'w') { if (run) return renderRun(); location.hash = '#home'; return; }
  return viewHome();
};
window.addEventListener('hashchange', route);
const go = h => { location.hash = h; };

/* ---------- прогресс программ ---------- */
const doneDays = pid => new Set(hist().filter(h => h.pid === pid).map(h => h.day));
function currentDay(p) {
  const saved = store.get('day:' + p.id, null); if (saved) return saved;
  const done = doneDays(p.id); let d = 1; while (done.has(d) && d < 100000) d++; return d;
}
function tonnage(day) { return day.items.reduce((s, it) => it.sets ? s + it.sets.reduce((a, b) => a + b, 0) * getW(it.ex, it.weight) * 2 : s, 0); }
const kcalOf = (day, ton) => Math.round(day.workSec * 0.133 * (profile().w / 70) + ton / KG_PER_KCAL);
function dayStats(p, d) {
  const day = dayData(p, d), ton = tonnage(day);
  return { kcal: kcalOf(day, ton), min: day.minutes, ton };
}

/* ---------- главная ---------- */
function nav(on) {
  return `<div class="nav"><div>
    <button class="${on === 'home' ? 'on' : ''}" data-go="#home">${I.dumb}Тренировки</button>
    <button class="${on === 'stats' ? 'on' : ''}" data-go="#stats">${I.chart}Аналитика</button>
    <button class="${on === 'hist' ? 'on' : ''}" data-go="#history">${I.hist}История</button></div></div>`;
}
const bolts = lv => `<span class="bolts" aria-label="Сложность ${lv} из 5">${[1, 2, 3, 4, 5].map(k => `<span class="ic ${k <= lv ? 'on' : ''}">${I.bolt}</span>`).join('')}</span>`;
function viewHome() {
  const g = store.get('grp', 'abs'), P = profile(), rec = recommend(P), recIds = new Set(rec.items.map(x => x.pid));
  if (!P.set && !sessionStorage.getItem('tr-ask')) { try { sessionStorage.setItem('tr-ask', '1'); } catch (e) { } return go('#profile'); }
  const cards = PROGRAMS.filter(p => p.group === g).map(p => {
    const done = doneDays(p.id);
    return `<div class="pcard ${p.stub ? 'stub' : ''}"><button class="pmain" data-${p.stub ? 'stub' : 'go'}="${p.stub ? p.id : '#prog-' + p.id}"><b>${esc(p.title)}</b>${bolts(p.level)}
      <em>${p.stub ? 'скоро' : 'выполнено: ' + done.size}</em><span>${esc(p.card)}</span></button>
      ${recIds.has(p.id) ? '<i class="forme">Для тебя</i>' : ''}
      <button class="phelp" data-help="${p.id}" aria-label="Что нужно уметь">${I.help}</button>
      <div class="preq"><b>Что нужно уметь и знать</b>${esc(p.req)}</div></div>`;
  }).join('');
  view(`<div class="screen has-nav">
    <div class="bar"><button class="rbtn" data-go="#profile" aria-label="Профиль">${P.gender === 'female' ? I.female : I.male}</button><h1>Тренер<small>${esc(GROUPS.find(x => x.id === g).title)}</small></h1><button class="rbtn" id="gear" aria-label="Настройки">${I.gear}</button></div>
    <div class="tabs">${GROUPS.map(x => `<button class="tab ${x.id === g ? 'on' : ''}" data-grp="${x.id}">${x.title}</button>`).join('')}</div>
    <button class="recobar" data-go="#profile"><span>Подобрано для тебя</span><small>${rec.items.map(x => esc(prog(x.pid).title)).join(' · ')}</small>${I.r}</button>
    ${cards}
    <div class="hint">Новые программы добавляются в файл data.js (см. README).<br>Анимации упражнений © Gym visual (gymvisual.com).</div>
    ${nav('home')}</div>`);
}

/* ---------- профиль и рекомендации ---------- */
function viewProfile() {
  const P = profile(), seg = (k, list) => `<div class="seg wide">${list.map(([v, t]) => `<button data-pk="${k}" data-pv="${v}" class="${String(P[k]) === String(v) ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  const num_ = (k, label, unit, step) => `<div class="opt"><div>${label}</div><div class="nin"><input type="number" inputmode="decimal" data-nk="${k}" step="${step}" value="${P[k]}"><span>${unit}</span></div></div>`;
  const rec = recommend(P);
  view(`<div class="screen">
    <div class="bar"><button class="rbtn" data-go="#home" aria-label="Назад">${I.back}</button><h1>Профиль<small>Подбор программ</small></h1><span class="rbtn ghost"></span></div>
    <div class="form">
      <div class="lab">Пол</div>${seg('gender', [['male', 'Мужчина'], ['female', 'Девушка']])}
      ${num_('h', 'Рост', 'см', 1)}${num_('w', 'Вес', 'кг', 0.5)}${num_('goal', 'Желаемый вес', 'кг', 0.5)}
      <div class="lab">Сколько занимаешься спортом</div>${seg('exp', EXPS.map((t, i) => [i, t]))}
      <div class="lab">Повседневная активность</div>${seg('act', ACTS.map((t, i) => [i, t]))}
    </div>
    <div class="sh">${ic('chart')}Рекомендуем</div>
    <div class="recs">${rec.items.map(x => { const p = prog(x.pid); return `<button class="rrow" data-${p.stub ? 'stub' : 'go'}="${p.stub ? p.id : '#prog-' + p.id}"><div><b>${esc(p.title)}</b><small>${esc(GROUPS.find(g => g.id === p.group).title)} · ${esc(x.why)}</small></div>${bolts(p.level)}</button>`; }).join('')}</div>
    <div class="stat3"><div><b>${num(rec.bmi.toFixed(1))}</b><small>индекс массы тела</small></div><div><b>${rec.goal === 'gain' ? 'набор' : rec.goal === 'lose' ? 'снижение' : 'тонус'}</b><small>цель</small></div><div><b>${rec.level} / 5</b><small>уровень</small></div></div>
    ${rec.notes.map(n => `<div class="note">${esc(n)}</div>`).join('')}
    <button class="big" id="psave">Сохранить</button>
  </div>`);
  const cur = Object.assign({}, P, { set: true });
  document.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { cur[b.dataset.pk] = b.dataset.pv === 'male' || b.dataset.pv === 'female' ? b.dataset.pv : Number(b.dataset.pv); store.set('profile', cur); viewProfile(); });
  document.querySelectorAll('[data-nk]').forEach(i => i.onchange = () => { const v = parseFloat(String(i.value).replace(',', '.')); if (v > 0 && v < 400) { cur[i.dataset.nk] = v; store.set('profile', cur); viewProfile(); } });
  $('#psave').onclick = () => { store.set('profile', cur); go('#home'); };
}

/* ---------- программа ---------- */
function viewProgram(pid) {
  const p = prog(pid), d = currentDay(p), day = dayData(p, d), st = dayStats(p, d), done = doneDays(pid);
  const rows = day.items.map(it => {
    const e = EX[it.ex];
    if (it.sets) return `<div class="it"><img src="${thumb(it.ex)}" alt=""><div class="t"><div>${esc(e.name)}</div><small>${it.sets.join(' + ')}</small></div><button class="kg" data-w="${it.ex}" data-def="${it.weight}">${num(getW(it.ex, it.weight))} кг</button></div>`;
    return `<div class="it"><img src="${thumb(it.ex)}" alt=""><div class="t"><div>${esc(e.name)}</div><small>${it.time ? fmtT(it.time) : 'x ' + it.reps}</small></div></div>`;
  }).join('');
  const inf = p.info(d, done);
  const stNames = [...new Set(day.steps.filter(x => x.stretch).map(x => EX[x.ex].name.replace('Растяжка ', '')))];
  const stretchLine = stNames.length ? `<div class="hint">${ic('check')}В конце растяжка: ${esc(stNames.join(', '))}</div>` : '';
  const stats = `<span>${ic('flame')}${st.kcal} ккал</span>${st.ton ? `<span>${ic('weight')}${st.ton.toLocaleString('ru-RU')} кг</span>` : ''}<span>${ic('timer')}${st.min} мин.</span>`;
  view(`<div class="screen">
    <div class="bar" style="position:relative"><button class="rbtn" data-go="#home" aria-label="Назад">${I.back}</button><h1>${esc(p.title)}</h1><span class="rbtn ghost"></span></div>
    <div class="hero"><div class="sub">${esc(inf.sub)}</div><div class="stats">${stats}</div></div>
    <button class="start" id="start">${done.has(d) ? 'ПОВТОРИТЬ ТРЕНИРОВКУ' : 'НАЧАТЬ ТРЕНИРОВКУ'}</button>
    <div class="days"><button id="dprev" ${d <= 1 ? 'disabled' : ''} aria-label="Предыдущий день">${I.l}</button><div class="dl">${esc(inf.label)}${done.has(d) ? `<span class="done">${ic('check')}выполнен</span>` : inf.note ? `<span class="done">${esc(inf.note)}</span>` : ''}</div><button id="dnext" aria-label="Следующий день">${I.r}</button></div>
    <div class="items">${rows}</div>${stretchLine}</div>`);
  $('#dprev').onclick = () => { store.set('day:' + pid, d - 1); viewProgram(pid); };
  $('#dnext').onclick = () => { store.set('day:' + pid, d + 1); viewProgram(pid); };
  $('#start').onclick = () => {
    const last = hist().filter(h => h.pid === pid).sort((a, b) => b.ts - a.ts)[0];
    const days = last ? Math.round((new Date().setHours(0, 0, 0, 0) - new Date(last.ts).setHours(0, 0, 0, 0)) / 864e5) : 99;
    if (p.restDays && days <= p.restDays) {
      openSheet(`<h3>Сегодня по плану отдых</h3><div class="opt"><small>${days === 0 ? 'Сегодня уже была тренировка.' : 'Вчера была тренировка.'} Между тренировками этой программы нужен день отдыха.</small></div><button class="big sec" id="rc">Отдохнуть</button><button class="big" id="rg">Всё равно начать</button>`, () => {
        $('#rc').onclick = closeSheet; $('#rg').onclick = () => { closeSheet(); startWorkout(pid, d); };
      });
    } else startWorkout(pid, d);
  };
}

/* ---------- история ---------- */
function viewHistory() {
  const h = hist().slice().sort((a, b) => b.ts - a.ts);
  const sec = h.reduce((s, x) => s + x.sec, 0), kcal = h.reduce((s, x) => s + x.kcal, 0), ton = h.reduce((s, x) => s + (x.ton || 0), 0);
  const hh = Math.floor(sec / 3600), mm = Math.floor(sec % 3600 / 60);
  let last = '', rows = '';
  h.forEach(x => {
    const lab = new Date(x.ts).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    if (lab !== last) { rows += `<div class="dh">${lab}</div>`; last = lab; }
    rows += `<div class="hrow"><div class="l"><div>${esc(x.title)}</div><small>День ${x.day}${x.ton ? ' · ' + x.ton.toLocaleString('ru-RU') + ' кг' : ''}</small></div><div class="r">${ic('flame')}${x.kcal}<br>${ic('timer')}${fmtT(x.sec)}</div></div>`;
  });
  view(`<div class="screen has-nav">
    <div class="bar"><span class="rbtn ghost"></span><h1>История<small>Статистика</small></h1><span class="rbtn ghost"></span></div>
    <div class="sum"><div class="c"><b>${hh}ч ${mm}м</b><small>время</small></div><div class="c"><b>${ton ? (ton / 1000).toFixed(1).replace('.', ',') + ' т' : h.length}</b><small>${ton ? 'вес' : 'тренировок'}</small></div><div class="c"><b>${kcal}</b><small>ккал</small></div></div>
    ${rows || '<div class="empty">Пока пусто. Закончи первую тренировку — она появится здесь.</div>'}
    <div style="text-align:center"><button class="link" id="exp">Скопировать историю</button><button class="link" id="imp">Восстановить из копии</button></div>
    ${nav('hist')}</div>`);
  $('#exp').onclick = () => {
    const t = JSON.stringify({ hist: hist(), w: Object.fromEntries(Object.keys(EX).map(k => [k, getW(k, null)]).filter(x => x[1] != null)) });
    openSheet(`<h3>Копия истории</h3><div class="opt"><small>Скопируй текст и сохрани в заметках.</small></div><textarea id="bk" readonly rows="6">${esc(t)}</textarea><button class="big sec" id="bkc">Скопировать</button><button class="big" id="bkx">Закрыть</button>`, () => {
      $('#bk').onfocus = e => e.target.select(); $('#bkx').onclick = closeSheet;
      $('#bkc').onclick = async () => { try { await navigator.clipboard.writeText(t); $('#bkc').textContent = 'Скопировано'; } catch (e) { $('#bk').focus(); $('#bk').select(); $('#bkc').textContent = 'Выдели текст и скопируй'; } };
    });
  };
  $('#imp').onclick = () => openSheet(`<h3>Восстановить из копии</h3><textarea id="bk" rows="6" placeholder="Вставь сюда скопированный текст"></textarea><div class="opt" id="bkmsg"><small></small></div><button class="big" id="bkok">Восстановить</button><button class="big sec" id="bkx">Отмена</button>`, () => {
    $('#bkx').onclick = closeSheet;
    $('#bkok').onclick = () => { try { const o = JSON.parse($('#bk').value); if (!Array.isArray(o.hist)) throw 0; store.set('hist', o.hist); Object.entries(o.w || {}).forEach(([k, v]) => setW(k, v)); closeSheet(); viewHistory(); } catch (e) { $('#bkmsg').innerHTML = '<small>Не получилось прочитать копию. Проверь, что вставлен весь текст.</small>'; } };
  });
}

/* ---------- аналитика: календарь и гистограммы ---------- */
const GCOL = { abs: '#ff9f0a', db: '#0a84ff', legs: '#30d158', glutes: '#ff5fa2' }; // цвет группы программ (кольцо в календаре)
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

/* период → корзины (дни или месяцы) */
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
function barChart(id, bs, val, unit, color) {
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
  const dflt = tot ? `Среднее в ${bs[0].mon ? 'месяц с тренировками' : 'день с тренировками'}: ${Math.round(tot / act)} ${unit} · максимум: ${Math.max(...vals)} ${unit}` : 'Нет данных за период';
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
    <div class="bar"><span class="rbtn ghost"></span><h1>Аналитика<small>Календарь и итоги</small></h1><span class="rbtn ghost"></span></div>
    <div id="calbox">${calendarHtml(h)}</div>
    <div class="sh">${ic('chart')}Итоги</div>
    <div class="seg wide">${seg}</div>
    <div class="tiles">${tile('check', all.length, 'тренировок')}${tile('timer', fmtDur(sec), 'общее время')}${tile('flame', kcal.toLocaleString('ru-RU'), 'ккал всего')}${tile('weight', ton ? (ton / 1000).toFixed(1).replace('.', ',') + ' т' : '0', 'общий вес')}</div>
    <div class="ch"><h3>Калории ${P === 365 || P === 0 ? 'по месяцам' : 'по дням'}</h3>${barChart('c1', bs, kc, 'ккал', '#ff9f0a')}</div>
    <div class="ch"><h3>Время ${P === 365 || P === 0 ? 'по месяцам' : 'по дням'}</h3>${barChart('c2', bs, mn, 'мин', '#0a84ff')}</div>
    ${nav('stats')}</div>`);
  bindChart('c1', bs, kc, 'ккал'); bindChart('c2', bs, mn, 'мин');
  $('.seg.wide').querySelectorAll('button').forEach(b => b.onclick = () => { statUi.period = +b.dataset.p; store.set('statui', statUi); viewStats(); });
  const bindCal = () => {
    $('#cprev').onclick = () => { calMonth.setMonth(calMonth.getMonth() - 1); redraw(); };
    $('#cnext').onclick = () => { calMonth.setMonth(calMonth.getMonth() + 1); redraw(); };
    document.querySelectorAll('.cd').forEach(b => b.onclick = () => { calSel = b.dataset.k; redraw(); });
  };
  const redraw = () => { $('#calbox').innerHTML = calendarHtml(h); bindCal(); };
  bindCal();
}

/* ---------- окна внутри страницы (confirm/prompt недоступны во встроенных просмотрах) ---------- */
function openSheet(html, bind) { const s = $('#sheet'); s.hidden = false; s.innerHTML = `<div class="in">${html}</div>`; if (bind) bind(s); }
const closeSheet = () => { $('#sheet').hidden = true; };

/* ---------- настройки ---------- */
function openSettings() {
  const s = $('#sheet'); s.hidden = false;
  const draw = () => {
    s.innerHTML = `<div class="in"><h3>Настройки</h3>
      <div class="opt"><div>Озвучка названий<small>голос iPhone, русский</small></div><div class="seg"><button data-k="names" data-v="1" class="${settings.names ? 'on' : ''}">Вкл</button><button data-k="names" data-v="0" class="${!settings.names ? 'on' : ''}">Выкл</button></div></div>
      <div class="opt"><div>Советы по технике голосом<small>во время упражнения</small></div><div class="seg"><button data-k="tips" data-v="1" class="${settings.tips ? 'on' : ''}">Вкл</button><button data-k="tips" data-v="0" class="${!settings.tips ? 'on' : ''}">Выкл</button></div></div>
      <div class="opt"><div>Последние 4 секунды<small>${Snd.hasVoice ? 'найден пакет голоса' : 'голос iPhone или сигналы'}</small></div><div class="seg"><button data-k="count" data-v="voice" class="${settings.count === 'voice' ? 'on' : ''}">Голос</button><button data-k="count" data-v="beep" class="${settings.count === 'beep' ? 'on' : ''}">Сигналы</button></div></div>
      <div class="opt"><div>Скорость речи</div><input type="range" min="0.7" max="1.3" step="0.05" value="${settings.rate}" id="rate"></div>
      <div class="opt"><small id="diag">${esc(Snd.diag())}</small></div>
      <button class="big sec" id="test">Проверить звук</button><button class="big" id="sclose">Готово</button></div>`;
    s.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = b.dataset.k, v = b.dataset.v; settings[k] = (k === 'names' || k === 'tips') ? v === '1' : v; saveSettings(); draw(); });
    $('#rate').oninput = e => { settings.rate = Number(e.target.value); saveSettings(); };
    $('#test').onclick = () => { Snd.unlock(); Snd.beep(660, 0.25, 0.4); setTimeout(() => { const d = $('#diag'); if (d) d.textContent = Snd.diag(); }, 300); setTimeout(() => Snd.say('Русский твист'), 450); setTimeout(() => { cue(3); setTimeout(() => cue(2), 1000); setTimeout(() => cue(1), 2000); setTimeout(stopSound, 3000); }, 2200); };
    $('#sclose').onclick = () => { s.hidden = true; };
  };
  draw();
}

/* ---------- тренировка ---------- */
let run = null, timer = null;

function buildSteps(p, d) {
  const steps = [];
  dayData(p, d).steps.forEach(st => { const { rest, ...step } = st; steps.push(step); if (rest) steps.push({ k: 'rest', sec: rest }); });
  return steps;
}
function startWorkout(pid, d) {
  const p = prog(pid);
  Snd.unlock(); wake();
  run = { p, d, steps: buildSteps(p, d), i: 0, paused: false, done: false, t0: performance.now(), pausedAt: 0, pausedTotal: 0 };
  run.tipped = new Set(); run.pre = [...new Set(run.steps.filter(x => x.ex).map(x => x.ex))].map(x => { const i = new Image(); i.src = mediaUrls(x)[0]; return i; });
  go('#workout');
  enter(0);
  clearInterval(timer); timer = setInterval(tick, 100);
}
function nextEx(i) { return run.steps.slice(i + 1).find(s => s.k !== 'rest'); }
function enter(i) {
  run.i = i; run.cued = {}; run.paused = false;
  const s = run.steps[i]; if (!s) return finish();
  if (s.k === 'time' || s.k === 'rest') { run.endAt = performance.now() + s.sec * 1000 / SPEED; run.dur = s.sec * 1000; }
  if (s.k === 'time' || s.k === 'reps') {
    const e = EX[s.ex], first = s.stretch && !run.steps.slice(0, i).some(x => x.stretch), side = e.side ? ' на каждую ногу' : '';
    let say = (first ? 'Теперь растяжка. ' : '') + e.name + (s.part ? '. ' + s.part : '');
    if (s.k === 'reps') say = s.db ? `${s.set === 1 ? e.name + '. ' : ''}Подход ${s.set}. ${s.reps} раз${side}` : `${e.name}. ${s.reps} раз${side}`;
    else if (e.side && !s.stretch) say += '. На каждую ногу';
    speakName(say);
    if (settings.tips && e.tip && !run.tipped.has(s.ex)) { Snd.say(e.tip, !settings.names); }
    run.tipped.add(s.ex);
  } else { const n = nextEx(i); speakName('Отдых' + (n ? '. Дальше ' + EX[n.ex].name : '')); }
  const n = nextEx(i); if (n) new Image().src = mediaUrls(n.ex)[0];
  renderRun();
}
function advance() { stopSoundIfTimed(); enter(run.i + 1); }
function stopSoundIfTimed() { const s = run.steps[run.i]; if (s && (s.k === 'time' || s.k === 'rest')) stopSound(); }
function leftV() { return run.paused ? run.leftAtPause : (run.endAt - performance.now()) * SPEED; }

function tick() {
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
  if (!run.paused) { run.leftAtPause = leftV(); run.paused = true; run.pausedAt = performance.now(); try { speechSynthesis.cancel(); } catch (e) { } }
  else { run.endAt = performance.now() + run.leftAtPause / SPEED; run.pausedTotal += performance.now() - run.pausedAt; run.paused = false; }
  renderRun();
}

function renderRun() {
  const s = run.steps[run.i]; if (!s) return;
  const p = run.p, total = run.steps.filter(x => x.k !== 'rest'), cur = total.indexOf(s) >= 0 ? total.indexOf(s) : total.findIndex(x => run.steps.indexOf(x) > run.i) - 1;
  const n = nextEx(run.i), nlabel = n ? EX[n.ex].name + (n.part ? ' · ' + n.part : '') + (n.db ? ` · подход ${n.set}` : '') : 'Финиш';
  const dots = total.map((x, k) => `<i class="${k < cur ? 'done' : k === cur ? 'cur' : ''}"></i>`).join('');
  const isRest = s.k === 'rest', exId = isRest ? (n ? n.ex : null) : s.ex;
  const title = isRest ? 'Отдых' : EX[s.ex].name + (s.part ? ' · ' + s.part : '');
  const fig = figHtml(exId);
  let ring, line = '', btns = '';
  const C = 603.19;
  if (s.k === 'reps') {
    ring = `<div class="num"><b>${s.reps}</b><small>${s.db ? 'повторений' : 'раз'}</small></div>`;
    if (s.db) {
      const w = getW(s.ex, s.def);
      line = `Подход ${s.set} из ${s.sets}<span class="wt"><button id="wm" aria-label="Меньше">−</button><b>${num(w)} кг</b><button id="wp" aria-label="Больше">+</button></span>`;
    }
    btns = '<button class="big" id="ok">ГОТОВО</button>';
  } else {
    const L = leftV();
    ring = `<div class="num"><b id="cnt">${fmtClock(L / 1000)}</b></div><button class="pp" id="pp" aria-label="Пауза">${run.paused ? I.play : I.pause}</button>`;
    if (isRest) { btns = '<div class="row2"><button class="big sec" id="plus">+15 с</button><button class="big" id="skip">ПРОПУСТИТЬ</button></div>'; line = 'Восстанавливаемся'; }
    else btns = '<div class="row2"><button class="big sec" id="skip">ДАЛЬШЕ</button></div>';
  }
  const off = s.k === 'reps' ? 0 : C * (1 - Math.max(0, leftV() / run.dur));
  view(`<div class="wk ${run.paused ? 'paused' : ''}">
    <div class="bar"><button class="rbtn" id="quit" aria-label="Выйти">${I.back}</button><h1>${esc(p.title)}<small>День ${run.d}</small></h1><button class="rbtn" id="gear" aria-label="Настройки">${I.gear}</button></div>
    <div class="name">${esc(title)}</div>${fig}
    <div class="ringrow"><button class="adj ${isRest ? 'off' : ''}" id="am" aria-label="Меньше">−${s.k === 'reps' ? '' : '<small>5с</small>'}</button><div class="ringbox"><svg viewBox="0 0 210 210"><circle class="bg" cx="105" cy="105" r="96"/><circle id="ring" class="fgc" cx="105" cy="105" r="96" style="stroke-dasharray:${C};stroke-dashoffset:${off}"/></svg>${ring}</div><button class="adj ${isRest ? 'off' : ''}" id="ap" aria-label="Больше">+${s.k === 'reps' ? '' : '<small>5с</small>'}</button></div>
    <div class="setline">${line}</div>${btns}
    <div class="next">Следующее упражнение:<b>${esc(nlabel)}</b></div><div class="dots">${dots}</div></div>`);
  if (run.paused) document.querySelectorAll('.fig img').forEach(i => { i.style.animationPlayState = 'paused'; });
  $('#quit').onclick = () => {
    if (!run.paused && (s.k === 'time' || s.k === 'rest')) togglePause();
    openSheet(`<h3>Прервать тренировку?</h3><div class="opt"><small>Прогресс этого дня не сохранится.</small></div><button class="big sec" id="qc">Продолжить</button><button class="big" id="qx">Прервать</button>`, () => {
      $('#qc').onclick = () => { closeSheet(); if (run.paused) togglePause(); };
      $('#qx').onclick = () => { closeSheet(); quit(); };
    });
  };
  $('#gear').onclick = openSettings;
  const tb = $('#tipbtn'); if (tb) tb.onclick = () => { const e = EX[exId]; openSheet(`<h3>${esc(e.name)}</h3>${e.side ? '<div class="opt"><div>Выполняй на каждую ногу</div></div>' : ''}<div class="opt"><div class="tiptext">${esc(e.tip)}</div></div><button class="big" id="tipx">Понятно</button>`, () => { $('#tipx').onclick = closeSheet; }); };
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

function quit() { clearInterval(timer); try { speechSynthesis.cancel(); } catch (e) { } unwake(); const pid = run.p.id; run = null; go('#prog-' + pid); }

function finish() {
  run.done = true; clearInterval(timer); unwake();
  const p = run.p, day = dayData(p, run.d), active = Math.round((performance.now() - run.t0 - run.pausedTotal) * SPEED / 1000);
  const ton = tonnage(day), kcal = kcalOf(day, ton);
  const h = hist(); h.push({ ts: Date.now(), pid: p.id, title: p.title, day: run.d, kcal, sec: active, ton }); store.set('hist', h);
  store.set('day:' + p.id, run.d + 1);
  speakName('Тренировка завершена');
  const pid = p.id; run = null;
  view(`<div class="fin"><h2>Тренировка завершена</h2>
    <div class="g"><div><b>${fmtT(active)}</b><small>время</small></div><div><b>${kcal}</b><small>ккал</small></div>${ton ? `<div><b>${(ton / 1000).toFixed(1).replace('.', ',')} т</b><small>вес</small></div>` : ''}</div>
    <button class="big" id="fdone">ГОТОВО</button></div>`);
  $('#fdone').onclick = () => go('#prog-' + pid);
}

/* ---------- общие клики ---------- */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; }
  const hp = e.target.closest('[data-help]'); if (hp) { hp.closest('.pcard').classList.toggle('open'); return; }
  const sb = e.target.closest('[data-stub]'); if (sb) { const p = prog(sb.dataset.stub); openSheet(`<h3>${esc(p.title)}</h3><div class="opt"><div class="tiptext">Эта программа появится в одном из следующих обновлений.</div></div><div class="opt"><div class="tiptext"><b>Что нужно уметь и знать</b><br>${esc(p.req)}</div></div><button class="big" id="stx">Понятно</button>`, () => { $('#stx').onclick = closeSheet; }); return; }
  const t = e.target.closest('[data-grp]'); if (t) { store.set('grp', t.dataset.grp); viewHome(); return; }
  if (e.target.closest('#gear') && !run) { openSettings(); return; }
  const w = e.target.closest('[data-w]'); if (w) {
    const cur = getW(w.dataset.w, Number(w.dataset.def));
    openSheet(`<h3>${esc(EX[w.dataset.w].name)}</h3><div class="opt"><div>Вес гантели, кг</div><input id="wv" type="number" inputmode="decimal" step="0.5" min="0" max="200" value="${cur}"></div><button class="big" id="wok">Сохранить</button>`, () => {
      $('#wok').onclick = () => { const n = parseFloat(String($('#wv').value).replace(',', '.')); if (n >= 0 && n < 200) { setW(w.dataset.w, n); closeSheet(); route(); } };
    });
  }
});
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') $('#sheet').hidden = true; });

/* ---------- старт ---------- */
route();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').then(() => {
    // заранее кладём все картинки в кэш, чтобы работало без интернета
    const urls = [...new Set(Object.keys(EX).flatMap(mediaUrls))];
    (window.requestIdleCallback || (f => setTimeout(f, 1500)))(() => urls.forEach(u => fetch(u).catch(() => { })));
  }).catch(() => { });
}

/* ---------- дополнительные функции: включаются в настройках ---------- */
const XF = [
  ['swap', 'Замена упражнения', 'кнопка на экране тренировки: аналог на ту же мышцу'],
  ['rec', 'Рекорды', 'лучшие веса и повторения, плашка за новый рекорд'],
  ['aw', 'Подсказка веса', 'в прошлый раз и во сколько попробовать сейчас'],
  ['dish', 'Свои блюда', 'собрать блюдо из продуктов один раз'],
  ['freq', 'Частые продукты', 'вкладка с тем, что ты добавляешь чаще всего'],
  ['wrep', 'Недельный отчёт питания', 'среднее за 7 дней и дни в норме'],
  ['mch', 'Графики замеров', 'динамика обхватов, было и стало'],
  ['pho', 'Фото прогресса', 'снимки хранятся только на этом телефоне']
];

const tapeKey = () => 'tapem';
const wrepKey = () => profile().gender === 'female' ? 'tapef' : 'suit';
const MAC = {
  p: { c: '#e8704a', i: '<svg class="mi2" viewBox="0 0 24 24"><path d="M15 3.4c3.4 0 5.7 2.4 5.7 5.3 0 3-2.5 5.2-5.4 5.2-.9 0-1.7-.2-2.4-.6l-3.1 3 .9.9a1.4 1.4 0 01-2 2l-.4-.4a1.4 1.4 0 01-2-2l-.4-.4a1.4 1.4 0 012-2l.9.9 3-3.1a5.4 5.4 0 01-.6-2.5c0-3 2.4-5.3 5.8-5.3z" fill="#e8704a" stroke="#151515" stroke-width="1.5" stroke-linejoin="round"/><path d="M13.4 6.2c1.2-.8 2.8-.8 3.8.1" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.2" stroke-linecap="round"/></svg>' },
  f: { c: '#f1d27a', i: '<svg class="mi2" viewBox="0 0 24 24"><path d="M12 2.8c3.3 4 5.7 6.9 5.7 10.2a5.7 5.7 0 01-11.4 0c0-3.3 2.4-6.2 5.7-10.2z" fill="#f1d27a" stroke="#151515" stroke-width="1.5" stroke-linejoin="round"/><path d="M9.3 13.3a3 3 0 001.5 2.8" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1.3" stroke-linecap="round"/></svg>' },
  c: { c: '#d9a05b', i: '<svg class="mi2" viewBox="0 0 24 24"><path d="M12 21V9" stroke="#151515" stroke-width="3" stroke-linecap="round"/><path d="M12 21V9" stroke="#d9a05b" stroke-width="1.1" stroke-linecap="round"/><g fill="#d9a05b" stroke="#151515" stroke-width="1.4"><ellipse cx="12" cy="5.4" rx="2" ry="3"/><ellipse cx="8.6" cy="9.4" rx="2" ry="3.1" transform="rotate(-38 8.6 9.4)"/><ellipse cx="15.4" cy="9.4" rx="2" ry="3.1" transform="rotate(38 15.4 9.4)"/><ellipse cx="8.8" cy="14.2" rx="2" ry="3.1" transform="rotate(-38 8.8 14.2)"/><ellipse cx="15.2" cy="14.2" rx="2" ry="3.1" transform="rotate(38 15.2 14.2)"/></g></svg>' }
};

const XT = (() => {
  const on = k => !!settings[k];
  const back = () => goBack('#home');
  const dfmt = (ts, y) => new Date(ts).toLocaleDateString('ru-RU', y ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' });
  const WDS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const mas = (n, c) => `<img class="${c}" src="img/m_${n}.webp" alt="" onerror="this.remove()">`;
  const bar = (t, sub) => `<div class="bar"><button class="rbtn" id="xback" aria-label="Назад">${I.back}</button><h1>${t}${sub ? `<small>${sub}</small>` : ''}</h1><span class="rbtn ghost"></span></div>`;
  const row = (go_, t, s, m) => `<button class="opt pick chev" data-go="${go_}"><div>${t}<small>${s}</small></div>${m ? mas(m, 'mlm') : ''}</button>`;

  /* ---- выгрузка и загрузка ---- */
  const dump = () => { const o = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('tr:') === 0) o[k] = localStorage.getItem(k); } } catch (e) { } return JSON.stringify({ app: 'trainer', v: 2, ts: Date.now(), ls: o }); };
  const applyBackup = txt => {
    let o; try { o = JSON.parse(txt); } catch (e) { return false; }
    if (o && o.ls && typeof o.ls === 'object') {
      const del = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('tr:') === 0) del.push(k); }
      del.forEach(k => localStorage.removeItem(k));
      Object.keys(o.ls).forEach(k => { if (k.indexOf('tr:') === 0) { try { localStorage.setItem(k, o.ls[k]); } catch (e) { } } });
    } else if (o && Array.isArray(o.hist)) {
      store.set('hist', o.hist); Object.entries(o.w || {}).forEach(([k, v]) => setW(k, v)); foodRestore(o.food); if (Array.isArray(o.my)) store.set('myprogs', o.my);
    } else return false;
    location.hash = '#home'; location.reload(); return true;
  };
  function openBackup() {
    const t = dump(), name = 'trainer-' + dkey(Date.now()) + '.json';
    openSheet(`<h3>Выгрузка данных</h3><div class="opt"><small>Тренировки, питание, замеры, настройки и фото. Файл можно сохранить в «Файлы» или отправить себе.</small></div><button class="big" id="xbf">Сохранить файл</button><button class="big sec" id="xbc">Скопировать текст</button>`, () => {
      $('#xbf').onclick = () => {
        const blob = new Blob([t], { type: 'application/json' });
        try { const f = new File([blob], name, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f] }).catch(() => { }); return; } } catch (e) { }
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      };
      $('#xbc').onclick = async () => { try { await navigator.clipboard.writeText(t); $('#xbc').textContent = 'Скопировано'; } catch (e) { $('#xbc').textContent = 'Не получилось, используй файл'; } };
    });
  }
  function openRestore() {
    openSheet(`<h3>Загрузка данных</h3><div class="opt"><small>Выбери файл, который сохранял раньше. Текущие данные на этом телефоне будут заменены.</small></div><label class="big sec xfile">Выбрать файл<input type="file" id="xbi" accept=".json,application/json,text/plain" hidden></label><textarea id="xbt" rows="4" placeholder="или вставь сюда скопированный текст"></textarea><div class="opt" id="xbm"><small></small></div><button class="big" id="xbok">Загрузить из текста</button>`, () => {
      const fail = () => { $('#xbm').innerHTML = '<small>Не получилось прочитать данные. Проверь файл или текст.</small>'; };
      $('#xbi').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { if (!applyBackup(String(r.result))) fail(); }; r.readAsText(f); };
      $('#xbok').onclick = () => { if (!applyBackup($('#xbt').value)) fail(); };
    });
  }

  /* ---- сканер штрихкодов (Open Food Facts) ---- */
  let scStream = null;
  const scStop = () => { try { if (scStream) scStream.getTracks().forEach(t => t.stop()); } catch (e) { } scStream = null; };
  const loadZx = () => window.ZXing ? Promise.resolve() : new Promise((res, rej) => { const el = document.createElement('script'); el.src = 'zxing.min.js'; el.onload = res; el.onerror = rej; document.head.appendChild(el); });
  async function offLookup(code) {
    const vars = [code]; if (code.length === 12) vars.push('0' + code); if (code.length === 13 && code[0] === '0') vars.push(code.slice(1));
    for (const c of vars) {
      let j = null;
      try { const ac = new AbortController(), tm = setTimeout(() => ac.abort(), 9000); const r = await fetch('https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(c) + '.json?fields=product_name,product_name_ru,generic_name,brands,nutriments,serving_quantity', { signal: ac.signal }); clearTimeout(tm); j = await r.json(); } catch (e) { throw e; }
      if (!j || j.status !== 1 || !j.product) continue;
      const p = j.product, n = p.nutriments || {}, name = (p.product_name_ru || p.product_name || p.generic_name || '').trim(); if (!name) continue;
      const k = n['energy-kcal_100g'] != null ? +n['energy-kcal_100g'] : n['energy_100g'] != null ? +n['energy_100g'] / 4.184 : null; if (k == null || isNaN(k)) { offNoKcal = name; continue; }
      const g = +p.serving_quantity;
      return { id: 'bc' + code, name: name + (p.brands ? ' (' + String(p.brands).split(',')[0].trim() + ')' : ''), k: Math.round(k), p: Math.round((+n.proteins_100g || 0) * 10) / 10, f: Math.round((+n.fat_100g || 0) * 10) / 10, c: Math.round((+n.carbohydrates_100g || 0) * 10) / 10, u: g > 0 ? { n: 'порция', g } : null, d: false };
    }
    return null;
  }
  let offNoKcal = '';
  async function scanDone(code) {
    scStop(); const m = $('#scm'); if (m) m.textContent = 'Ищем ' + code + '...';
    try {
      const f = await offLookup(code);
      if (!f) { if (m) m.textContent = offNoKcal ? 'Продукт «' + offNoKcal + '» есть в базе, но без калорийности. Создай его вручную.' : 'Продукта ' + code + ' нет в открытой базе (в ней мало российских товаров). Создай его вручную.'; offNoKcal = ''; const b = $('#scn'); if (b) b.hidden = false; return; }
      const l = customFoods().filter(x => x.id !== f.id); l.unshift(f); store.set('foods', l); closeSheet(); fa.tab = 'my'; fa.q = ''; viewFoodAdd(); openPortion(f.id);
    } catch (e) { if (m) m.textContent = 'Нет связи с базой. Проверь интернет.'; }
  }
  function scan() {
    openSheet(`<h3>Штрихкод</h3><div class="scv"><video id="scvid" playsinline muted></video><i></i></div><div class="opt"><small id="scm">Наведи камеру на штрихкод упаковки.</small></div>
      <div class="opt"><div>Номер вручную</div><div class="nin"><input id="scc" type="number" inputmode="numeric" placeholder="4600..."><span></span></div></div>
      <button class="big sec" id="scok">Найти по номеру</button><button class="big" id="scn" hidden>Создать продукт вручную</button>`, () => {
      $('#scok').onclick = () => { const c = $('#scc').value.replace(/\D/g, ''); if (c.length >= 8) scanDone(c); else $('#scm').textContent = 'В штрихкоде 8 или 13 цифр.'; };
      $('#scn').onclick = () => { closeSheet(); openCustom(); };
      const sh = $('#sheet'); new MutationObserver((_, ob) => { if (sh.hidden) { scStop(); ob.disconnect(); } }).observe(sh, { attributes: true, attributeFilter: ['hidden'] });
      (async () => {
        const msg = t => { const m = $('#scm'); if (m) m.textContent = t; };
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw { name: 'NoApi' };
          scStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        } catch (e) { scStop(); const v = $('.scv'); if (v) v.hidden = true; msg(e && e.name === 'NotAllowedError' ? 'Нет доступа к камере. Разреши камеру для сайта в настройках iPhone, либо введи номер вручную.' : 'Камера недоступна. Введи номер вручную.'); return; }
        const v = $('#scvid'); if (!v) return scStop();
        v.muted = true; v.setAttribute('playsinline', ''); v.srcObject = scStream; try { await v.play(); } catch (e) { }
        let done = false; const hit = c => { if (done) return; done = true; if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) { } scanDone(c); };
        let det = null; if ('BarcodeDetector' in window) { try { det = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }); } catch (e) { det = null; } }
        let rd = null, cv = null, cx = null;
        if (!det) { try { await loadZx(); const Z = ZXing, hints = new Map(); hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E]); hints.set(Z.DecodeHintType.TRY_HARDER, true); rd = new Z.MultiFormatReader(); rd.setHints(hints); cv = document.createElement('canvas'); cx = cv.getContext('2d', { willReadFrequently: true }); } catch (e) { msg('Не удалось запустить распознавание. Введи номер вручную.'); return; } }
        const loop = async () => {
          if (!scStream || done || !$('#scvid')) return;
          try {
            if (det) { const r = await det.detect(v); if (r.length) return hit(r[0].rawValue); }
            else if (v.videoWidth) {
              const W = v.videoWidth, H = v.videoHeight, cw = Math.min(W, 960), ch = Math.round(cw * H / W); cv.width = cw; cv.height = ch; cx.drawImage(v, 0, 0, cw, ch);
              const bm = new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(new ZXing.HTMLCanvasElementLuminanceSource(cv)));
              try { const r = rd.decode(bm); if (r) return hit(r.getText()); } catch (e) { }
            }
          } catch (e) { }
          setTimeout(loop, 160);
        };
        loop();
      })();
    });
  }

  /* ---- календарь (.ics) ---- */
  function openIcs() {
    const sc = store.get('sched', { rest: [5, 6] }), rest = sc.rest || [5, 6], days = [0, 1, 2, 3, 4, 5, 6].filter(i => !rest.includes(i));
    openSheet(`<h3>Календарь</h3><div class="opt"><small>Создадим файл с тренировками по твоему графику. Дни: ${days.map(i => tr(WD[i])).join(', ') || tr('не выбраны')}. Открой его, и iPhone предложит добавить события в календарь.</small></div>
      <div class="opt"><div>Время<small>начало тренировки</small></div><input type="time" id="xit" value="${store.get('icsTime', '18:00')}"></div>
      <div class="opt"><div>Сколько недель</div><select id="xiw">${[2, 4, 8, 12].map(n => `<option value="${n}" ${n === 4 ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <button class="big" id="xig">Создать файл</button>`, () => {
      $('#xig').onclick = () => {
        const tm = $('#xit').value || '18:00', wk = +$('#xiw').value, [hh, mm] = tm.split(':').map(Number); store.set('icsTime', tm);
        const p2 = n => String(n).padStart(2, '0'), utc = d => d.getUTCFullYear() + p2(d.getUTCMonth() + 1) + p2(d.getUTCDate()) + 'T' + p2(d.getUTCHours()) + p2(d.getUTCMinutes()) + p2(d.getUTCSeconds()) + 'Z', stamp = d => d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + 'T' + p2(d.getHours()) + p2(d.getMinutes()) + '00';
        let out = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Trainer//RU\r\nCALSCALE:GREGORIAN\r\nX-WR-CALNAME:Тренировки\r\n', n = 0;
        for (let i = 0; i < wk * 7; i++) {
          const d = new Date(); d.setDate(d.getDate() + i); d.setHours(hh, mm, 0, 0); if (d.getTime() < Date.now() || !days.includes((d.getDay() + 6) % 7)) continue;
          const e = new Date(d.getTime() + 60 * 6e4);
          out += `BEGIN:VEVENT\r\nUID:trainer-${stamp(d)}@trainer\r\nDTSTAMP:${utc(new Date())}\r\nDTSTART:${stamp(d)}\r\nDTEND:${stamp(e)}\r\nSUMMARY:Тренировка\r\nBEGIN:VALARM\r\nTRIGGER:-PT30M\r\nACTION:DISPLAY\r\nDESCRIPTION:Тренировка через 30 минут\r\nEND:VALARM\r\nEND:VEVENT\r\n`; n++;
        }
        out += 'END:VCALENDAR\r\n';
        if (!n) { toast('Нет подходящих дней', 'выбери рабочие дни в графике'); return; }
        icsReady(out, n);
      };
    });
  }

  function icsReady(out, n) {
    openSheet(`<h3>Файл готов</h3><div class="opt"><small>Событий: ${n}. Лучше всего нажать «Сохранить или поделиться файлом» и в меню выбрать «Календарь». Если календаря нет, выбери «Сохранить в Файлы», потом открой файл и внизу нажми «Добавить все». Кнопка «Добавить в Календарь» пробует открыть файл напрямую.</small></div>
      <button class="big" id="xio">Добавить в Календарь</button><button class="big sec" id="xis">Сохранить или поделиться файлом</button>`, () => {
      $('#xio').onclick = () => { const blob = new Blob([out], { type: 'text/calendar;charset=utf-8' }), u = URL.createObjectURL(blob); const w = window.open(u, '_blank'); if (!w) location.href = u; };
      $('#xis').onclick = () => {
        const blob = new Blob([out], { type: 'text/calendar;charset=utf-8' });
        try { const f = new File([blob], 'trainer.ics', { type: 'text/calendar' }); if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f] }).catch(() => { }); return; } } catch (er) { }
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'trainer.ics'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      };
    });
  }

  /* ---- настройки ---- */
  const setHtml = sw => `<div class="glab">Календарь</div><div class="grp"><button class="opt pick chev" id="xics"><div>Тренировки в календарь<small>файл .ics: события и напоминание за 30 минут</small></div></button></div>
    <div class="glab">Данные</div><div class="grp"><button class="opt pick chev" id="xexp"><div>Выгрузить данные<small>файл со всем: тренировки, питание, замеры, фото</small></div></button><button class="opt pick chev" id="ximp"><div>Загрузить данные<small>из файла или текста</small></div></button></div>`;
  const setBind = () => { $('#xics').onclick = openIcs; $('#xexp').onclick = openBackup; $('#ximp').onclick = openRestore; };

  /* ---- рекорды ---- */
  const load = e => e.hk === 'pair' ? (e.w || 0) * 2 : e.hk === 'mix' ? (e.w || 0) + (e.w2 || 0) : (e.w || 0);
  const hlab = e => e.hk === 'pair' ? 'по ' + fmtKg(e.w) + ' кг' : e.hk === 'mix' ? fmtKg(e.w) + ' + ' + fmtKg(e.w2 || 0) + ' кг' : fmtKg(e.w) + ' кг';
  const lab = e => load(e) > 0 ? hlab(e) + ' × ' + (e.r || 0) : e.t > 0 ? e.t + ' с' : (e.r || 0) + ' повт.';
  const recs = h => {
    const m = {};
    (h || hist()).slice().sort((a, b) => a.ts - b.ts).forEach(x => (x.exs || []).forEach(e => {
      const q = m[e.ex] || (m[e.ex] = { l: 0, r: 0, t: 0 }), L = load(e), r = e.r || 0, t = e.t || 0;
      if (L > 0 && (L > q.l || (L === q.l && r > (q.lr || 0)))) { q.l = L; q.lr = r; q.lab = lab(e); q.ts = x.ts; }
      if (r > q.r) { q.r = r; if (!(q.l > 0)) { q.lab = lab(e); q.ts = x.ts; } }
      if (t > q.t) { q.t = t; if (!(q.l > 0)) { q.lab = lab(e); q.ts = x.ts; } }
    }));
    return m;
  };
  const markPr = (exs, h, ts) => {
    if (!on('rec')) { store.set('lastpr', null); return; }
    const prev = recs(h), out = [];
    exs.forEach(e => { const p = prev[e.ex]; if (!p) return; const L = load(e); const up = L > 0 ? L > p.l : e.t > 0 ? e.t > p.t : (e.r || 0) > p.r; if (up) out.push({ ex: e.ex, lab: lab(e) }); });
    store.set('lastpr', { ts, list: out });
  };
  const sumPr = ts => {
    if (!on('rec')) return '';
    const p = store.get('lastpr', null); if (!p || p.ts !== ts || !p.list.length) return '';
    return `<div class="xpr">${mas('cup', 'xprm')}<div><b>${p.list.length > 1 ? 'Новые рекорды' : 'Новый рекорд'}</b>${p.list.map(q => `<small>${esc((EX[q.ex] || { name: q.ex }).name)}: ${esc(q.lab)}</small>`).join('')}</div></div>`;
  };
  /* ---- прогрессия: как далась тренировка ---- */
  const incOf = w => w < 8 ? 1 : w < 20 ? 2 : w < 50 ? 2.5 : 5;
  const upList = x => { const L = dbList(), out = []; (x.exs || []).forEach(e => { if (!e.w || e.t || !(e.hk === 'pair' || e.hk === 'single')) return; let nw = e.w + incOf(e.w); if (L.length) { const b = L.filter(v => v > e.w).sort((a, c) => a - c)[0]; if (!b) return; nw = b; } out.push({ ex: e.ex, from: e.w, to: nw }); }); return out; };
  const sumFeel = (ts, x) => {
    if (!x || !(x.exs || []).some(e => e.w > 0)) return '';
    const f = x.feel, L = upList(x);
    const btn = (k, t) => `<button data-xfeel="${k}" class="${f === k ? 'on' : ''}">${t}</button>`;
    const note = f === 'easy' ? (x.up && x.up.length ? `<div class="xfn"><b>Веса повышены на следующий раз</b>${x.up.map(q => `<small>${esc((EX[q.ex] || { name: q.ex }).name)}: ${fmtKg(q.from)} → ${fmtKg(q.to)} кг</small>`).join('')}</div>` : '<div class="xfn"><small>Выше веса пока нет, оставили как есть.</small></div>') : f === 'ok' ? '<div class="xfn"><small>Веса остаются прежними.</small></div>' : f === 'hard' ? '<div class="xfn"><small>Веса остаются прежними. Если было слишком тяжело, снизь вес в упражнении.</small></div>' : '';
    return `<div class="xfeel"><b>Как далась тренировка?</b><div class="xfb">${btn('easy', 'Легко')}${btn('ok', 'Нормально')}${btn('hard', 'Тяжело')}</div>${note}</div>`;
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-xfeel]'); if (!b) return;
    const m = location.hash.match(/^#sum-(\d+)/); if (!m) return;
    const ts = +m[1], h = hist(), x = h.find(q => q.ts === ts); if (!x) return;
    const k = b.dataset.xfeel; if (x.feel === 'easy' && x.up) x.up.forEach(q => { if (getW(q.ex, 0) === q.to) setW(q.ex, q.from); });
    x.feel = k; x.up = [];
    if (k === 'easy') { x.up = upList(x); x.up.forEach(q => setW(q.ex, q.to)); }
    store.set('hist', h); route();
  });
  const exRec = id => { if (!on('rec')) return ''; const q = recs()[id]; if (!q || !q.lab) return ''; return `<div class="sh">Рекорд</div><div class="note xrec" style="margin-top:0"><b>${esc(q.lab)}</b><small>${dfmt(q.ts, 1)}</small></div>`; };
  function viewRecords() {
    const m = recs(), ids = Object.keys(m).filter(k => EX[k] && m[k].lab).sort((a, b) => EX[a].name.localeCompare(EX[b].name, 'ru'));
    view(`<div class="screen">${bar('Рекорды', ids.length ? ids.length + ' упражнений' : '')}
      ${ids.length ? `<div class="mmid">${mas('cup', 'rmas')}</div><div class="grp">${ids.map(k => `<button class="opt xrow" data-go="#ex-${k}"><div>${esc(EX[k].name)}<small>${dfmt(m[k].ts, 1)}</small></div><b>${esc(m[k].lab)}</b></button>`).join('')}</div>`
        : `<div class="empty small">${mas('cup', 'fmas')}<br>Рекорды появятся после первых тренировок.</div>`}</div>`);
    $('#xback').onclick = back;
  }

  /* ---- подсказка веса ---- */
  const aw = s => {
    if (!on('aw') || !s.db || s.bw || s.k !== 'reps') return '';
    let e = null; const h = hist().slice().sort((a, b) => b.ts - a.ts);
    for (const x of h) { const f = (x.exs || []).find(q => q.ex === s.ex && load(q) > 0); if (f) { e = f; break; } }
    if (!e) return '';
    if (e.hk === 'mix') return `<small class="awh">В прошлый раз ${fmtKg(load(e))} кг × ${e.r}</small>`;
    const w = e.w, inc = w < 8 ? 1 : w < 20 ? 2 : w < 50 ? 2.5 : 5, base = `В прошлый раз ${fmtKg(w)} кг × ${e.r}`;
    return `<small class="awh">${base}. ${e.r >= s.reps ? 'Попробуй ' + fmtKg(w + inc) + ' кг' : e.r >= s.reps - 2 ? 'Держи этот вес' : 'Можно чуть легче'}</small>`;
  };

  /* ---- замена упражнения ---- */
  const swI = '<svg viewBox="0 0 24 24"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>';
  let resume = false;
  function swap(old) {
    if (!run || !old || !EX[old]) return;
    const k = exKind(old), gym = old.indexOf('g_') === 0, m0 = (LIBM[old] || [])[0], m1 = (LIBM[old] || [])[1];
    const base = Object.keys(EX).filter(id => id !== old && !/^st_/.test(id) && LIBM[id] && exKind(id) === k && (id.indexOf('g_') === 0) === gym);
    let c = base.filter(id => LIBM[id][0] === m0);
    if (c.length < 3) c = c.concat(base.filter(id => !c.includes(id) && (LIBM[id] || []).includes(m0)));
    c.sort((a, b) => ((LIBM[b][1] === m1) - (LIBM[a][1] === m1)));
    c = c.slice(0, 10);
    const s0 = run.steps[run.i];
    if (!run.paused && s0 && (s0.k === 'time' || s0.k === 'rest')) { togglePause(); resume = true; }
    const done = () => { if (resume && run && run.paused) togglePause(); resume = false; };
    openSheet(`<h3>Чем заменить</h3><div class="opt"><small>${esc(EX[old].name)}. Подобрал на ту же мышцу.</small></div>${c.length ? '<div class="grp">' + c.map(id => `<button class="opt xrow" data-sw="${id}"><div>${esc(EX[id].name)}<small>${(LIBM[id] || []).map(q => MR[q]).filter(Boolean).join(', ')}</small></div></button>`).join('') + '</div>' : '<div class="opt"><small>Подходящих упражнений не нашлось.</small></div>'}<button class="big sec" id="xsc">Отмена</button>`, s => {
      $('#wxc').onclick = $('#xsc').onclick = () => { closeSheet(); done(); };
      s.querySelectorAll('[data-sw]').forEach(b => b.onclick = () => {
        const nw = b.dataset.sw; run.steps.forEach((st, i) => { if (i >= run.i && st.ex === old) st.ex = nw; });
        new Image().src = mediaUrls(nw)[0]; closeSheet(); resume = false; speakName(EX[nw].name); renderRun();
      });
    });
  }

  /* ---- ссылки на экраны ---- */
  const links = food => {
    const l = food ? (on('wrep') ? row('#wrep', 'Недельный отчёт', 'среднее за 7 дней', 'food') : '') : (on('rec') ? row('#records', 'Рекорды', 'лучшие веса и повторения', 'cup') : '');
    return l ? `<div class="grp mlink">${l}</div>` : '';
  };
  const measLinks = () => { const l = (on('mch') ? row('#mchart', 'Динамика', 'графики и было / стало', '') : '') + (on('pho') ? row('#photos', 'Фото прогресса', 'только на этом телефоне', '') : ''); return l ? `<div class="grp mlink">${l}</div>` : ''; };
  const wlink = () => on('wrep') ? `<div class="grp mlink">${row('#wrep', 'Недельный отчёт', 'среднее за 7 дней и дни в норме', '')}</div>` : '';

  /* ---- блюда и частые продукты ---- */
  const tabs = () => (on('dish') ? [['dish', 'Блюда']] : []).concat(on('freq') ? [['freq', 'Частые']] : []);
  const dishBtn = () => on('dish') ? '<button id="fdish">Собрать блюдо</button>' : '';
  const freq = () => {
    const cnt = {}, t = fkey(new Date());
    for (let i = 0; i < 60; i++) dayLog(shiftDay(t, -i)).forEach(e => { if (e.fid) cnt[e.fid] = (cnt[e.fid] || 0) + 1; });
    return Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).slice(0, 25).map(foodById).filter(Boolean);
  };
  function dish() {
    const items = [];
    nSheet(`<h3>Новое блюдо</h3>
      <div class="opt"><div>Название</div><input id="dn" class="tin wide" type="text" placeholder="Например, борщ" autocomplete="off"></div>
      <div class="glab">Ингредиенты</div><div id="dl"></div>
      <div class="opt"><input id="dq" class="tin wide" type="search" placeholder="Найти и добавить продукт" autocomplete="off"></div><div id="dres" class="dres"></div>
      <div class="opt"><div>Порций в блюде<small>вес блюда делится на столько частей</small></div><div class="nin"><input id="dsv" type="number" inputmode="decimal" value="1"><span>шт</span></div></div>
      <div class="opt"><small id="dsum"></small></div><button class="big" id="dok">Сохранить блюдо</button>`, () => {
      const tot = () => { const t = { g: 0, k: 0, p: 0, f: 0, c: 0 }; items.forEach(i => { const m = i.g / 100; t.g += i.g; t.k += i.k * m; t.p += i.p * m; t.f += i.f * m; t.c += i.c * m; }); return t; };
      const sum = () => { const t = tot(), n = Math.max(1, pn($('#dsv').value) || 1); $('#dsum').textContent = t.g ? `Всего ${fmt0(t.g)} г, ${fmt0(t.k)} ккал. На порцию: ${fmt0(t.k / n)} ккал · Б ${num(r1(t.p / n))} · Ж ${num(r1(t.f / n))} · У ${num(r1(t.c / n))}` : 'Добавь хотя бы один продукт.'; };
      const list = () => {
        $('#dl').innerHTML = items.map((i, n) => `<div class="opt"><div>${esc(i.name)}</div><div class="nin"><input data-dg="${n}" type="number" inputmode="decimal" value="${i.g}"><span>г</span></div><button class="dx" data-dx="${n}" aria-label="Убрать">${I.close}</button></div>`).join('');
        $('#dl').querySelectorAll('[data-dg]').forEach(e => e.oninput = () => { items[+e.dataset.dg].g = pn(e.value); sum(); });
        $('#dl').querySelectorAll('[data-dx]').forEach(b => b.onclick = () => { items.splice(+b.dataset.dx, 1); list(); });
        sum();
      };
      $('#dq').oninput = e => {
        const q = norm(e.target.value).trim(), r = $('#dres'); if (!q) { r.innerHTML = ''; return; }
        const w = q.split(/\s+/), l = allFoods().filter(f => !f.d && w.every(x => norm(f.name).includes(x))).slice(0, 6);
        r.innerHTML = l.map(f => `<button class="opt xrow" data-da="${f.id}"><div>${esc(f.name)}<small>${fmt0(f.k)} ккал на 100 г</small></div></button>`).join('');
        r.querySelectorAll('[data-da]').forEach(b => b.onclick = () => { const f = foodById(b.dataset.da); items.push({ name: f.name, g: f.u ? f.u.g : 100, k: f.k, p: f.p, f: f.f, c: f.c }); $('#dq').value = ''; r.innerHTML = ''; list(); });
      };
      $('#dsv').oninput = sum; list();
      $('#dok').onclick = () => {
        const name = $('#dn').value.trim(), t = tot(); if (!name) { $('#dn').focus(); return; } if (!(t.g > 0)) { $('#dq').focus(); return; }
        const n = Math.max(1, pn($('#dsv').value) || 1), per = x => r1(x / t.g * 100);
        const f = { id: 'd' + Date.now(), name, k: Math.round(t.k / t.g * 100), p: per(t.p), f: per(t.f), c: per(t.c), u: { n: 'порция', g: Math.round(t.g / n) }, d: false, dish: 1 };
        const l = customFoods(); l.unshift(f); store.set('foods', l); closeSheet(); fa.tab = 'dish'; fa.q = ''; viewFoodAdd(); toast('Блюдо сохранено', name);
      };
    });
  }

  /* ---- вес ---- */
  const wtLog = () => store.get('wt', []);
  function weigh() {
    const l = wtLog(), cur = l.length ? l[l.length - 1].w : profile().w;
    weightWheel('Вес', cur, 'met', v => { const a = wtLog(); a.push({ ts: Date.now(), w: v }); store.set('wt', a); const p = store.get('profile', {}); p.w = v; store.set('profile', p); toast('Вес записан', fmtKg(v) + ' кг'); route(); });
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-xwt]')) weigh(); });

  /* ---- недельный разбор (накопительный) ---- */
  let wo = 0;
  const weekDays = off => { const t = new Date(); t.setHours(0, 0, 0, 0); const mon = new Date(t); mon.setDate(t.getDate() - ((t.getDay() + 6) % 7) + off * 7); return [...Array(7)].map((_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; }); };
  function viewWrep() {
    const days = weekDays(wo), today = new Date(); today.setHours(0, 0, 0, 0);
    const H = hist(), G = nutGoal(), ms = x => x.getTime();
    const rows = days.map(d => { const k = dkey(ms(d)), ws = H.filter(x => dkey(x.ts) === k), s = sumLog(dayLog(k)); return { d, k, fut: d > today, n: ws.length, min: ws.reduce((a, x) => a + (x.sec || 0), 0) / 60, kc: ws.reduce((a, x) => a + (x.kcal || 0), 0), ton: ws.reduce((a, x) => a + (x.ton || 0), 0), s }; });
    let c = 0; const cum = rows.map(r => r.fut ? null : (c += r.kc)), tot = rows.reduce((a, r) => ({ n: a.n + r.n, min: a.min + r.min, kc: a.kc + r.kc, ton: a.ton + r.ton }), { n: 0, min: 0, kc: 0, ton: 0 });
    const plan = trainWeek().plan, fl = rows.filter(r => r.s.k > 0), av = key => fl.length ? fl.reduce((a, r) => a + r.s[key], 0) / fl.length : 0;
    const inR = fl.filter(r => r.s.k >= G.kcal * 0.9 && r.s.k <= G.kcal * 1.1).length;
    const W = 340, H1 = 150, bw = 30, gap = (W - 7 * bw) / 8, mxc = Math.max(1, ...cum.filter(v => v !== null), ...rows.map(r => r.kc));
    const cy = v => H1 - 22 - (H1 - 40) * v / mxc, cx = i => gap + i * (bw + gap) + bw / 2;
    const pts = cum.map((v, i) => v === null ? null : [cx(i), cy(v)]).filter(Boolean);
    const svgT = `<svg class="xbars" viewBox="0 0 ${W} ${H1}">${rows.map((r, i) => `<rect x="${(cx(i) - bw / 2).toFixed(1)}" y="${cy(r.kc).toFixed(1)}" width="${bw}" height="${(H1 - 22 - cy(r.kc)).toFixed(1)}" rx="5" fill="#3a3a3c"/><text x="${cx(i).toFixed(1)}" y="${H1 - 6}" text-anchor="middle" fill="#8e8e93" font-size="11">${WDS[r.d.getDay()]}</text>`).join('')}${pts.length > 1 ? `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('')}" fill="none" stroke="#ff6b3d" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` : ''}${pts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.2" fill="#ff6b3d"/>`).join('')}</svg>`;
    const mxn = Math.max(G.kcal * 1.25, ...rows.map(r => r.s.k), 1), gy = H1 - 22 - (H1 - 40) * G.kcal / mxn;
    const svgN = `<svg class="xbars" viewBox="0 0 ${W} ${H1}"><path d="M0 ${gy.toFixed(1)}H${W}" stroke="#ffffff" stroke-opacity=".5" stroke-dasharray="3 4"/>${rows.map((r, i) => { const h = Math.max(r.s.k ? 3 : 0, (H1 - 40) * r.s.k / mxn), ok = r.s.k >= G.kcal * 0.9 && r.s.k <= G.kcal * 1.1; return `<rect x="${(cx(i) - bw / 2).toFixed(1)}" y="${(H1 - 22 - h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="5" fill="${ok ? '#ff6b3d' : '#636366'}"/><text x="${cx(i).toFixed(1)}" y="${H1 - 6}" text-anchor="middle" fill="#8e8e93" font-size="11">${WDS[r.d.getDay()]}</text>`; }).join('')}</svg>`;
    const t0 = ms(days[0]), t1 = ms(days[6]) + 864e5, wl = wtLog(), inW = wl.filter(x => x.ts >= t0 && x.ts < t1), before = wl.filter(x => x.ts < t0).slice(-1)[0];
    const wNow = inW.length ? inW[inW.length - 1].w : null, wd = wNow !== null && before ? wNow - before.w : null;
    const mAll = measAll(), mRows = MEAS.map(M => { const a = mAll.filter(e => e.ts >= t0 && e.ts < t1 && e.v[M.k] > 0).slice(-1)[0]; if (!a) return ''; const b = mAll.filter(e => e.ts < t0 && e.v[M.k] > 0).slice(-1)[0], d = b ? a.v[M.k] - b.v[M.k] : 0; return `<div class="opt xrow"><div>${M.n}</div><b>${fmtCm(a.v[M.k])} см${d ? ' <i class="xd">' + (d > 0 ? '+' : '−') + fmtCm(Math.abs(d)) + '</i>' : ''}</b></div>`; }).join('');
    const tile = (v, l) => `<div class="tile"><b>${v}</b><small>${l}</small></div>`, rng = `${days[0].getDate()} ${MSHORT[days[0].getMonth()]} - ${days[6].getDate()} ${MSHORT[days[6].getMonth()]}`;
    view(`<div class="screen">${bar('Разбор недели', rng)}
      <div class="xwn"><button id="xwp" aria-label="Прошлая неделя">${I.back}</button><b>${wo === 0 ? 'Эта неделя' : wo === -1 ? 'Прошлая неделя' : -wo + ' нед. назад'}</b><button id="xwx" class="nx" aria-label="Следующая неделя" ${wo === 0 ? 'disabled' : ''}>${I.back}</button></div>
      <div class="sh">Тренировки</div>
      <div class="tiles">${tile(tot.n + (wo === 0 ? ' из ' + plan : ''), 'тренировок')}${tile(fmtDur(tot.min * 60), 'время')}${tile(fmt0(tot.kc), 'ккал потрачено')}${tile(tot.ton ? (tot.ton >= 1000 ? fmtKg(tot.ton / 1000) + ' т' : fmt0(tot.ton) + ' кг') : '0 кг', 'поднято')}</div>
      <div class="ch"><h3>Накопительно, ккал</h3>${svgT}<div class="xleg"><span><i style="background:#ff6b3d"></i>с начала недели</span><span><i style="background:#3a3a3c"></i>за день</span></div></div>
      <div class="sh">Питание</div>
      ${fl.length ? `<div class="tiles">${tile(fmt0(av('k')), 'ккал в среднем, цель ' + fmt0(G.kcal))}${tile(fmt0(av('p')) + ' г', 'белка в среднем, цель ' + G.p)}${tile(fl.length + ' из 7', 'дней с записями')}${tile(inR + ' из ' + fl.length, 'дней в норме, ±10%')}</div><div class="ch"><h3>Калории по дням</h3>${svgN}<div class="xleg"><span><i style="background:#ff6b3d"></i>в норме</span><span><i style="background:#636366"></i>вне нормы</span><span>пунктир: цель</span></div></div>` : `<div class="empty small">${mas('food', 'fmas')}<br>На этой неделе нет записей в дневнике питания.</div>`}
      <div class="sh">Тело</div>
      <div class="grp xlist"><div class="opt xrow"><div>Вес<small>${wNow === null ? 'на этой неделе не записан' : wd === null ? 'первая запись' : 'изменение за неделю: ' + (wd > 0 ? '+' : wd < 0 ? '−' : '') + fmtKg(Math.abs(wd)) + ' кг'}</small></div><b>${wNow === null ? '—' : fmtKg(wNow) + ' кг'}</b></div>${mRows}</div>
      <div class="mact"><button class="big" data-xwt>Записать вес</button><button class="big sec" data-go="#meas">Замеры тела</button></div></div>`);
    $('#xback').onclick = () => goBack('#stats');
    $('#xwp').onclick = () => { wo--; viewWrep(); };
    $('#xwx').onclick = () => { if (wo < 0) { wo++; viewWrep(); } };
  }
  const sumWeek = ts => {
    if (!on('wrep')) return '';
    const H = hist(), last = H.reduce((a, x) => x.ts > a ? x.ts : a, 0); if (ts !== last || Date.now() - ts > 6 * 36e5) return '';
    const d = new Date(ts); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const cnt = new Set(H.filter(x => x.ts >= d.getTime()).map(x => dkey(x.ts))).size; if (cnt < trainWeek().plan) return '';
    return `<div class="xwk">${mas(wrepKey(), 'xwm')}<div><b>Неделя закончена</b><small>Взвесься и сделай замеры тела: они попадут в разбор недели.</small><div class="xwb"><button data-xwt>Записать вес</button><button data-go="#meas">Замеры</button></div></div></div>`;
  };
  const statTiles = food => {
    const t = (g, a, b, m) => `<button class="stile" data-go="${g}"><b>${a}</b><small>${b}</small>${m ? mas(m, 'stm') : ''}</button>`, tw = trainWeek();
    const l = (on('wrep') ? t('#wrep', 'Разбор недели', food ? 'питание, вес, замеры' : tw.cnt + ' из ' + tw.plan + ' тренировок', wrepKey()) : '') + (!food && on('rec') ? t('#records', 'Рекорды', 'лучшие веса', 'cup') : '') + (!food ? t('#history', 'История', hist().length + ' тренировок', 'hist') : '') + t('#meas', 'Замеры', measSummary(), tapeKey());
    return `<div class="sgrid">${l}</div>`;
  };

  /* ---- блог ---- */
  const RECIPES = [
    {"n": "Овсянка с бананом и орехами", "m": 0, "t": 10, "sv": 1, "k": 440, "p": 15, "f": 15, "c": 67, "d": "Тёплая сытная каша: медленные углеводы на утро и немного полезных жиров из орехов.", "i": ["овсяные хлопья (не быстрого приготовления) 50 г", "молоко 2,5% 200 мл", "банан 1 средний (около 100 г)", "грецкие орехи 10 г", "щепотка соли", "корица по желанию"], "s": ["Налей молоко в небольшую кастрюлю, добавь щепотку соли и доведи до лёгкого кипения на среднем огне.", "Всыпь хлопья, убавь огонь до минимального и вари 5 минут, помешивая каждые 30 секунд, чтобы не прилипло.", "Сними с огня, накрой крышкой и оставь на 2 минуты: каша дойдёт и станет гуще.", "Половину банана разомни вилкой и вмешай в кашу, это даст сладость без сахара.", "Вторую половину нарежь кружками, орехи крупно порубли ножом.", "Выложи кашу в тарелку, сверху банан и орехи, посыпь корицей."], "tip": "Для плотной каши берут меньше молока (150 мл), для жидкой больше (250 мл). Орехи можно подсушить на сухой сковороде 2 минуты.", "ph": "Тарелка овсяной каши с нарезанными кружками банана и грецкими орехами, вид сверху"},
    {"n": "Омлет с овощами и сыром", "m": 0, "t": 12, "sv": 1, "k": 440, "p": 31, "f": 31, "c": 9, "d": "Белковый завтрак на сковороде: быстро, сытно, почти без углеводов.", "i": ["яйца 3 шт", "помидор 100 г", "болгарский перец 60 г", "твёрдый сыр 30 г", "оливковое масло 1 ч. ложка (5 г)", "соль, чёрный перец, зелень"], "s": ["Помидор и перец нарежь мелкими кубиками, сыр натри на тёрке.", "Разбей яйца в миску, добавь щепотку соли и перца, взбей вилкой до однородности, без пены.", "Разогрей сковороду с маслом на среднем огне, обжарь перец 2 минуты, затем помидор 1 минуту.", "Залей овощи яйцами, равномерно распредели и готовь 2 минуты, не мешая.", "Посыпь сыром, убавь огонь до минимума, накрой крышкой и готовь 4 минуты до схватывания верха.", "Сложи омлет пополам, посыпь зеленью и подавай сразу."], "tip": "Если хочешь меньше жира, используй 2 цельных яйца и 2 белка: калорий станет примерно на 90 меньше.", "ph": "Складчатый омлет с кусочками помидора, перца и сыра на тарелке"},
    {"n": "Творог с ягодами и мёдом", "m": 0, "t": 3, "sv": 1, "k": 300, "p": 35, "f": 10, "c": 17, "d": "Самый быстрый белковый завтрак или перекус без готовки.", "i": ["творог 5% 200 г", "ягоды (свежие или замороженные) 80 г", "мёд 1 ч. ложка (7 г)", "мята по желанию"], "s": ["Замороженные ягоды заранее разморозь в тёплой воде 5 минут или в микроволновке 40 секунд и слей лишний сок.", "Выложи творог в глубокую миску и разомни вилкой, если он зернистый.", "Сверху выложи ягоды и полей мёдом.", "Аккуратно перемешай или ешь слоями."], "tip": "Если творог кислый, добавь 2 ложки кефира и взбей вилкой до кремовой текстуры.", "ph": "Миска творога с красными ягодами и тонкой струйкой мёда"},
    {"n": "Сырники без муки", "m": 0, "t": 25, "sv": 2, "k": 280, "p": 26, "f": 12, "c": 16, "d": "Нежные сырники на овсяных хлопьях вместо муки, рецепт на 2 порции (по 3 сырника).", "i": ["творог 5% 250 г", "яйцо 1 шт", "овсяные хлопья 30 г", "мёд 1 ч. ложка (7 г)", "масло для сковороды 1 ч. ложка (5 г)", "ванилин, щепотка соли"], "s": ["Хлопья перемели в блендере или измельчи скалкой в мелкую крошку.", "Смешай в миске творог, яйцо, хлопья, мёд, соль и ванилин. Тесто должно быть густым, но липким.", "Оставь тесто на 10 минут, чтобы хлопья набухли и сырники не растекались.", "Мокрыми руками сформируй 6 небольших лепёшек толщиной около 1,5 см.", "Разогрей сковороду с маслом на среднем огне. Жарь по 3 минуты с каждой стороны до золотистой корочки.", "Для готовности внутри накрой крышкой на последние 2 минуты на минимальном огне.", "Подавай со сметаной или ягодами (калории не посчитаны)."], "tip": "Не клади много хлопьев, иначе сырники будут сухими. Для варианта без масла жарь на антипригарной сковороде.", "ph": "Три золотистых сырника на тарелке с ягодами"},
    {"n": "Греческий йогурт с гранолой", "m": 3, "t": 3, "sv": 1, "k": 350, "p": 24, "f": 10, "c": 41, "d": "Хрустящий и сладкий перекус с белком, готов за пару минут.", "i": ["греческий йогурт 2% 200 г", "гранола 40 г", "ягоды 50 г"], "s": ["Выложи йогурт в стакан или миску.", "Сверху насыпь гранолу, чтобы она оставалась хрустящей.", "Добавь ягоды и подавай сразу."], "tip": "Выбирай гранолу с составом без сиропов и сахара в начале списка, иначе калорий будет больше.", "ph": "Стакан йогурта слоями с гранолой и ягодами"},
    {"n": "Куриная грудка с рисом и брокколи", "m": 1, "t": 30, "sv": 1, "k": 520, "p": 44, "f": 9, "c": 63, "d": "Классика для набора и сушки: чистый белок, медленные углеводы и овощи.", "i": ["куриная грудка 150 г (сырая)", "рис 70 г (сухой)", "брокколи 150 г", "оливковое масло 1 ч. ложка (5 г)", "соль, паприка, чеснок гранулированный"], "s": ["Рис промой 3 раза до прозрачной воды. Залей 140 мл воды (1 к 2), посоли, доведи до кипения, убавь огонь, накрой и вари 15 минут, потом оставь под крышкой на 5 минут.", "Грудку разрежь вдоль на два тонких пласта, слегка отбей, посоли, посыпь паприкой и чесноком.", "Разогрей сковороду с маслом на среднем огне и обжарь куриную грудку по 4 минуты с каждой стороны (внутри не должно быть розового).", "Дай мясу отдохнуть 3 минуты под фольгой и нарежь поперёк волокон.", "Брокколи разбери на соцветия, отвари в подсоленной воде 3 минуты, сразу переложи в холодную воду, чтобы сохранить цвет.", "Подавай рис, сверху курицу, сбоку брокколи."], "tip": "Чтобы грудка была сочной, не жарь её дольше 8 минут суммарно и дай отдохнуть перед нарезкой.", "ph": "Тарелка с нарезанной куриной грудкой, рисом и ярко-зелёной брокколи"},
    {"n": "Гречка с говядиной и овощами", "m": 1, "t": 35, "sv": 1, "k": 510, "p": 36, "f": 18, "c": 55, "d": "Сытный обед с железом и медленными углеводами.", "i": ["гречка 70 г (сухая)", "говядина (вырезка или лопатка) 130 г", "морковь 80 г", "лук репчатый 50 г", "растительное масло 1 ч. ложка (5 г)", "соль, перец, лавровый лист"], "s": ["Гречку переберни, промой, залей 140 мл кипятка, посоли, накрой и оставь на 20 минут (или свари 15 минут на огне).", "Говядину нарежь маленькими кусочками 2 на 2 см, лук мелко, морковь натри на крупной тёрке.", "Разогрей сковороду с маслом на сильном огне и обжарь мясо 3 минуты до корочки.", "Добавь лук и морковь, перемешай, убавь огонь до среднего и жарь 4 минуты.", "Влей 100 мл горячей воды, добавь лавровый лист, соль и перец, накрой и туши 20 минут до мягкости мяса.", "Смешай гречку с мясом и овощами, прогрей 1 минуту."], "tip": "Жёсткую лопатку туши 40 минут, вырезка готова за 15. Чтобы не засушить, не жарь мясо дольше 3 минут вначале.", "ph": "Тарелка рассыпчатой гречки с кусочками тушёной говядины, морковью и луком"},
    {"n": "Паста с индейкой и томатами", "m": 1, "t": 25, "sv": 1, "k": 585, "p": 40, "f": 19, "c": 63, "d": "Домашняя паста с фаршем: много белка и вкус настоящей болоньезе.", "i": ["паста 80 г (сухая)", "фарш индейки 150 г", "томаты в собственном соку 150 г", "чеснок 1 зубчик", "оливковое масло 1 ч. ложка (5 г)", "соль, орегано или базилик"], "s": ["Воду посоли (10 г соли на литр), отвари пасту на 1 минуту меньше, чем указано на упаковке. Оставь 50 мл воды от варки.", "Разогрей сковороду с маслом, обжарь фарш 5 минут на среднем огне, разбивая лопаткой на мелкие кусочки.", "Добавь измельчённый чеснок, жарь 30 секунд.", "Томаты разомни вилкой, влей в сковороду, добавь орегано, соль и перец, туши 8 минут на небольшом огне.", "Отправь пасту в соус, влей воду от варки и перемешай 1 минуту, чтобы соус обволок макароны.", "Подавай горячей, сверху свежий базилик."], "tip": "Вода от варки пасты содержит крахмал и делает соус бархатным, не выливай её сразу.", "ph": "Тарелка спагетти с густым мясным томатным соусом и листиком базилика"},
    {"n": "Овощной суп с курицей", "m": 1, "t": 35, "sv": 1, "k": 290, "p": 31, "f": 3, "c": 35, "d": "Лёгкий суп-порция на 400 мл: много белка и мало жира.", "i": ["куриная грудка 120 г", "картофель 150 г", "морковь 70 г", "лук 40 г", "вода 500 мл", "соль, лавровый лист, зелень"], "s": ["Грудку залей холодной водой, доведи до кипения, сними пену, убавь огонь и вари 20 минут с лавровым листом и солью.", "Достань мясо, остуди 3 минуты и нарежь кубиками или разбери на волокна.", "Картофель нарежь кубиками 1,5 см, морковь кружками, лук мелко.", "Добавь овощи в бульон и вари 12 минут до мягкости картофеля.", "Верни курицу в кастрюлю, прогрей 2 минуты, добавь зелень.", "Оставь суп под крышкой на 5 минут, потом разливай."], "tip": "Чтобы бульон был прозрачным, держи слабое кипение и сразу снимай пену в первые минуты.", "ph": "Тарелка прозрачного супа с картофелем, морковью и кусочками курицы"},
    {"n": "Лосось с картофелем", "m": 2, "t": 30, "sv": 1, "k": 510, "p": 34, "f": 25, "c": 34, "d": "Запечённая красная рыба с омега-3 и хрустящим картофелем.", "i": ["лосось (стейк или филе) 150 г", "картофель 200 г", "оливковое масло 1 ч. ложка (5 г)", "лимон 1/4", "соль, перец, чеснок, укроп"], "s": ["Разогрей духовку до 200 градусов. Картофель вымой и нарежь дольками толщиной 1 см (кожуру можно оставить).", "Смешай картофель с половиной масла, солью, перцем и чесноком, выложи на противень с пергаментом в один слой.", "Запекай картофель 15 минут.", "Рыбу обсуши салфеткой, посоли, поперчи, сбрызни лимонным соком и смажь остатком масла.", "Подвинь картофель, положи лосось кожей вниз и запекай ещё 10 минут (внутри рыба должна легко разделяться вилкой).", "Подавай с долькой лимона и укропом."], "tip": "Для сочной рыбы не передерживай: 10 минут на стейк толщиной 3 см достаточно. Кожа должна отделяться легко.", "ph": "Запечённый стейк лосося с картофельными дольками, долькой лимона и укропом"},
    {"n": "Салат с тунцом и яйцом", "m": 2, "t": 10, "sv": 1, "k": 365, "p": 45, "f": 18, "c": 5, "d": "Холодный белковый салат на ужин без плиты, почти без углеводов.", "i": ["тунец в собственном соку 130 г (1 банка)", "яйца 2 шт", "листья салата 80 г", "огурец 1 шт (70 г)", "оливковое масло 1 ч. ложка (5 г)", "лимонный сок, соль, перец"], "s": ["Яйца положи в кипящую воду на 9 минут (вкрутую), затем в холодную на 3 минуты, очисти.", "Салат вымой и обсуши, порви руками на крупные куски, огурец нарежь полукружками.", "С тунца слей жидкость и разомни вилкой на крупные куски.", "Смешай лимонный сок, масло, соль и перец.", "Собери салат: листья, огурец, тунец, яйца четвертинками. Полей заправкой перед подачей."], "tip": "Заправляй в последний момент, чтобы листья не стали мокрыми.", "ph": "Миска зелёного салата с тунцом, половинками яиц и огурцом"},
    {"n": "Протеиновый смузи", "m": 3, "t": 5, "sv": 1, "k": 330, "p": 32, "f": 8, "c": 37, "d": "Быстрый коктейль после тренировки.", "i": ["банан 1 шт (100 г)", "молоко 2,5% 250 мл", "протеин (порошок) 1 мерная ложка (30 г)", "лёд 4 кубика"], "s": ["Банан очисти и нарежь кружками (замороженный банан даёт густую текстуру).", "Влей в блендер молоко, затем добавь банан, протеин и лёд.", "Взбей 40 секунд до однородности.", "Перелей в стакан и выпей сразу, чтобы протеин не осел."], "tip": "Жидкость кладут вниз, иначе порошок прилипает ко дну блендера.", "ph": "Высокий стакан кремового бананового смузи с соломинкой"},
    {"n": "Треска с овощами в духовке", "m": 2, "t": 30, "sv": 1, "k": 250, "p": 39, "f": 7, "c": 9, "d": "Нежная белая рыба с кабачком и помидорами: мало калорий, много белка.", "i": ["филе трески 200 г (сырое)", "кабачок 150 г", "помидор 100 г", "оливковое масло 1 ч. ложка (5 г)", "лимонный сок, соль, перец, сушёный чеснок, петрушка"], "s": ["Разогрей духовку до 200 градусов.", "Кабачок нарежь полукружками 5 мм, помидор дольками.", "Рыбу обсуши, посоли, поперчи, сбрызни лимонным соком.", "На противне с пергаментом выложи кабачок, сверху рыбу, вокруг и сверху помидоры. Сбрызни маслом, посыпь чесноком.", "Запекай 18 минут до лёгкого румянца овощей, филе должно разделяться на пласты.", "Подавай с рубленой петрушкой."], "tip": "Подойдёт любая белая рыба (минтай, хек, судак), время то же для филе до 2 см толщиной.", "ph": "Запечённое филе трески с кабачком и помидорами на противне с петрушкой"},
    {"n": "Бутерброд с яйцом и авокадо", "m": 0, "t": 10, "sv": 1, "k": 400, "p": 22, "f": 21, "c": 33, "d": "Сытный тост с полезными жирами, подойдёт и как лёгкий обед.", "i": ["цельнозерновой хлеб 60 г (2 тоста)", "авокадо 50 г (1/3 плода)", "яйца 2 шт", "соль, перец, лимонный сок, хлопья чили"], "s": ["Хлеб подсуши в тостере или на сухой сковороде по 2 минуты с каждой стороны.", "Авокадо разомни вилкой с лимонным соком и щепоткой соли.", "Закипяти воду, убавь до слабого кипения, добавь ложку уксуса, сделай воронку и осторожно вылей яйцо. Вари 3 минуты (пашот). Повтори со вторым.", "Намажь авокадо на тосты, сверху положи яйца.", "Поперчи, добавь хлопья чили."], "tip": "Если пашот не получается, пожарь яичницу-глазунью на антипригарной сковороде без масла под крышкой.", "ph": "Два тоста с авокадо и яйцом-пашот на деревянной доске"},
    {"n": "Протеиновые панкейки с бананом", "m": 0, "t": 20, "sv": 1, "k": 410, "p": 22, "f": 15, "c": 50, "d": "Пышные панкейки без муки и сахара.", "i": ["банан 1 шт (100 г)", "яйца 2 шт", "овсяные хлопья 40 г", "разрыхлитель 1/2 ч. ложки", "масло для сковороды 1/2 ч. ложки", "корица, щепотка соли"], "s": ["Хлопья перемели в блендере в муку.", "Добавь банан, яйца, разрыхлитель, корицу и соль и взбей до гладкого теста, оставь на 5 минут.", "Разогрей антипригарную сковороду с каплей масла на среднем огне.", "Выливай по 2 столовые ложки теста, жарь по 2 минуты до пузырьков на поверхности, переверни и жарь ещё 1,5 минуты.", "Подавай стопкой с ягодами или йогуртом (калории не посчитаны)."], "tip": "Не делай панкейки большими, иначе сложно переворачивать. Огонь не выше среднего, чтобы не подгорели.", "ph": "Стопка небольших панкейков с ломтиками банана"},
    {"n": "Яблоко с арахисовой пастой", "m": 3, "t": 3, "sv": 1, "k": 205, "p": 5, "f": 11, "c": 23, "d": "Быстрый перекус с клетчаткой и полезными жирами.", "i": ["яблоко 150 г", "арахисовая паста без сахара 20 г (1 ст. ложка)", "корица по желанию"], "s": ["Яблоко вымой, вынь сердцевину и нарежь дольками.", "Паста должна быть комнатной температуры, при необходимости подогрей 10 секунд.", "Выложи пасту в пиалу, обмакивай дольки или намажь на них."], "tip": "Выбирай пасту, где в составе только арахис и соль.", "ph": "Дольки яблока рядом с пиалой арахисовой пасты"}
  ];
  const MEALN = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];
  let rm = -1;
  const bcard = (g, t, s, m) => `<button class="bcard" data-go="${g}"><div><b>${t}</b><small>${s}</small></div>${mas(m, 'bm')}</button>`;
  function viewBlog() {
    view(`<div class="screen has-nav"><div class="bar"><span class="rbtn ghost"></span><h1>Блог<small>Советы, рецепты, упражнения</small></h1><span class="rbtn ghost"></span></div>
      <div class="bcards">${bcard('#tipsl', 'Советы', ARTICLES.length + ' статей про питание, восстановление и технику', 'rest')}${bcard('#recipes', 'Рецепты', RECIPES.length + ' блюд с пошаговым приготовлением и БЖУ', 'food')}${bcard('#lib', 'Упражнения', 'каталог с техникой и мышцами', 'ex')}</div>${nav('tips')}</div>`);
  }
  function viewTipsList() {
    view(`<div class="screen has-nav"><div class="bar"><button class="rbtn" id="xback" aria-label="Назад">${I.back}</button><h1>Советы<small>Питание, восстановление, техника</small></h1><span class="rbtn ghost"></span></div>
      ${ARTICLES.map(a => `<button class="acard" data-go="#art-${a.id}"><img src="img/a/${a.img}.jpg" alt="" loading="lazy"><span class="atag">${esc(a.tag)}</span><b>${esc(a.title)}</b><small>${esc(a.sub)}</small></button>`).join('')}${nav('tips')}</div>`);
    $('#xback').onclick = () => goBack('#tips');
  }
  const rpic = i => `<div class="rpic"><img data-nr="1" src="img/r/r${i + 1}.jpg" alt="" onerror="this.parentNode.classList.add('nop');this.remove()"></div>`;
  function viewRecipes() {
    const l = RECIPES.map((r, i) => [r, i]).filter(([r]) => rm < 0 || r.m === rm);
    view(`<div class="screen has-nav"><div class="bar"><button class="rbtn" id="xback" aria-label="Назад">${I.back}</button><h1>Рецепты<small>калории на одну порцию, примерно</small></h1><span class="rbtn ghost"></span></div>
      <div class="tabs">${[[-1, 'Все']].concat(MEALN.map((n, i) => [i, n])).map(([v, n]) => `<button class="tab ${rm === v ? 'on' : ''}" data-rm="${v}">${n}</button>`).join('')}</div>
      ${l.map(([r, i]) => `<button class="rcard" data-rc="${i}">${rpic(i)}<span class="rtag">${MEALN[r.m]} · ${r.t} мин</span><b>${esc(r.n)}</b><small><u>${r.k} ккал</u>Б ${r.p} · Ж ${r.f} · У ${r.c}</small></button>`).join('')}${nav('tips')}</div>`);
    $('#xback').onclick = () => goBack('#tips');
    document.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { rm = +b.dataset.rm; viewRecipes(); });
    document.querySelectorAll('[data-rc]').forEach(b => b.onclick = () => {
      const r = RECIPES[+b.dataset.rc];
      openSheet(`${rpic(+b.dataset.rc)}<h3>${esc(r.n)}</h3><div class="opt"><small>${esc(r.d)}</small></div>
        <div class="rmac"><div><b>${r.k}</b><small>ккал</small></div><div><b>${r.p}</b><small>белки</small></div><div><b>${r.f}</b><small>жиры</small></div><div><b>${r.c}</b><small>углеводы</small></div></div>
        <div class="opt"><small>${r.t} мин · ${r.sv > 1 ? 'рецепт на ' + r.sv + ' порции, БЖУ на 1 порцию' : '1 порция'}. Значения примерные.</small></div>
        <div class="glab">Ингредиенты</div><div class="note xnote">${r.i.map(x => '• ' + esc(x)).join('<br>')}</div>
        <div class="glab">Как готовить</div><div class="note xnote">${r.s.map((x, n) => '<b>' + (n + 1) + '.</b> ' + esc(x)).join('<br><br>')}</div>
        <div class="glab">Совет</div><div class="note xnote">${esc(r.tip)}</div>
        <div class="glab">Добавить в дневник</div><div class="seg wide xmeal">${MEALN.map((n, i) => `<button data-xm="${i}" class="${i === r.m ? 'on' : ''}">${n}</button>`).join('')}</div><button class="big" id="xradd">Добавить</button>`, () => {
        let ml = r.m; document.querySelectorAll('[data-xm]').forEach(x => x.onclick = () => { ml = +x.dataset.xm; document.querySelectorAll('[data-xm]').forEach(y => y.classList.toggle('on', y === x)); });
        $('#xradd').onclick = () => { if (!fdate) fdate = fkey(new Date()); fa.meal = ml; addEntry({ fid: '', name: r.n, g: 0, b: null, k: r.k, p: r.p, f: r.f, c: r.c }); closeSheet(); };
      });
    });
  }

  /* ---- графики замеров ---- */
  let cm = '', cp = 90;
  function lineSvg(pts) {
    const W = 340, H = 200, pl = 36, pr = 14, pt = 16, pb = 26, xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs); let y0 = Math.min(...ys), y1 = Math.max(...ys); const pad = Math.max(0.5, (y1 - y0) * 0.2); y0 -= pad; y1 += pad;
    const X = t => pl + (W - pl - pr) * (x1 === x0 ? .5 : (t - x0) / (x1 - x0)), Y = v => H - pb - (H - pt - pb) * (v - y0) / (y1 - y0);
    const ticks = [0, 1, 2, 3].map(i => y0 + (y1 - y0) * i / 3);
    const d = pts.map((q, i) => (i ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1)).join('');
    return `<svg class="xline" viewBox="0 0 ${W} ${H}">${ticks.map(v => `<path d="M${pl} ${Y(v).toFixed(1)}H${W - pr}" stroke="#ffffff" stroke-opacity=".1"/><text x="${pl - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" fill="#8e8e93" font-size="10">${fmtCm(v)}</text>`).join('')}
      <path d="${d}" fill="none" stroke="#ff6b3d" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>${pts.map(q => `<circle cx="${X(q[0]).toFixed(1)}" cy="${Y(q[1]).toFixed(1)}" r="3.2" fill="#ff6b3d"/>`).join('')}
      <text x="${pl}" y="${H - 6}" fill="#8e8e93" font-size="10">${dfmt(x0)}</text><text x="${W - pr}" y="${H - 6}" text-anchor="end" fill="#8e8e93" font-size="10">${dfmt(x1)}</text></svg>`;
  }
  function viewChart() {
    const MX = MEAS.concat([{ k: 'wt', n: 'Вес' }, { k: 'ht', n: 'Рост' }]), all = measAll().concat(store.get('wt', []).map(x => ({ ts: x.ts, v: { wt: x.w } })), store.get('ht', []).map(x => ({ ts: x.ts, v: { ht: x.h } }))).sort((a, b) => a.ts - b.ts), has = M => all.some(e => e.v[M.k] > 0);
    if (!cm || !MX.some(M => M.k === cm)) cm = (MEAS.find(has) || MEAS[4]).k;
    const un = cm === 'wt' ? 'кг' : 'см', M = MX.find(q => q.k === cm), lim = cp ? Date.now() - cp * 864e5 : 0, pts = all.filter(e => e.v[cm] > 0 && e.ts >= lim).map(e => [e.ts, e.v[cm]]);
    const f = pts[0], l = pts[pts.length - 1], dl = pts.length > 1 ? l[1] - f[1] : 0;
    const tile = (v, t) => `<div class="tile"><b>${v}</b><small>${t}</small></div>`;
    view(`<div class="screen">${bar('Динамика замеров', M.n)}
      <div class="tabs xchips">${MX.map(q => `<button class="tab ${q.k === cm ? 'on' : ''}" data-cm="${q.k}">${q.n}${has(q) ? '' : ' ·'}</button>`).join('')}</div>
      <div class="seg wide xper">${[[30, '30 дней'], [90, '3 месяца'], [180, '6 месяцев'], [0, 'Всё']].map(([v, t]) => `<button data-cp="${v}" class="${cp === v ? 'on' : ''}">${t}</button>`).join('')}</div>
      ${pts.length > 1 ? `<div class="ch">${lineSvg(pts)}</div><div class="tiles x3">${tile(fmtCm(f[1]), 'было, ' + un)}${tile(fmtCm(l[1]), 'стало, ' + un)}${tile((dl > 0 ? '+' : dl < 0 ? '−' : '') + fmtCm(Math.abs(dl)), 'изменение, ' + un)}</div><div class="gfoot">${dfmt(f[0], 1)} и ${dfmt(l[0], 1)}</div>`
        : `<div class="empty small">${mas('tapem', 'fmas')}<br>${pts.length ? 'Нужно хотя бы два замера за этот период.' : 'Пока нет замеров для этого обхвата.'}</div>`}
      <div class="mact"><button class="big sec" data-go="#meas">Записать замер</button></div></div>`);
    $('#xback').onclick = back;
    document.querySelectorAll('[data-cm]').forEach(b => b.onclick = () => { cm = b.dataset.cm; viewChart(); });
    document.querySelectorAll('[data-cp]').forEach(b => b.onclick = () => { cp = +b.dataset.cp; viewChart(); });
  }

  /* ---- фото прогресса ---- */
  const photos = () => store.get('photos', []);
  const savePhotos = l => { try { localStorage.setItem('tr:photos', JSON.stringify(l)); return true; } catch (e) { return false; } };
  const shrink = file => new Promise((res, rej) => {
    const fr = new FileReader(); fr.onerror = rej;
    fr.onload = () => { const im = new Image(); im.onerror = rej; im.onload = () => { const k = Math.min(1, 720 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .72)); }; im.src = fr.result; };
    fr.readAsDataURL(file);
  });
  function viewPhotos() {
    const l = photos().slice().sort((a, b) => b.ts - a.ts);
    view(`<div class="screen">${bar('Фото прогресса', l.length ? l.length + ' фото' : 'хранятся только на телефоне')}
      <div class="mact"><label class="big xfile">Добавить фото<input type="file" id="xpi" accept="image/*" hidden></label>${l.length > 1 ? '<button class="big sec" id="xcmp">Было и стало</button>' : ''}</div>
      ${l.length ? `<div class="xgrid">${l.map(p => `<button data-ph="${p.id}"><img src="${p.d}" alt=""><small>${dfmt(p.ts)}</small></button>`).join('')}</div>`
        : `<div class="empty small">${mas('rest', 'fmas')}<br>Фото помогают увидеть изменения, которых не видно в зеркале. Снимай при одинаковом свете и в одной позе.</div>`}</div>`);
    $('#xback').onclick = back;
    $('#xpi').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { const d = await shrink(f), li = photos(); li.push({ id: 'p' + Date.now(), ts: Date.now(), d }); if (!savePhotos(li)) toast('Не хватило места', 'удали старые фото'); } catch (er) { toast('Не получилось открыть фото', ''); }
      viewPhotos();
    };
    document.querySelectorAll('[data-ph]').forEach(b => b.onclick = () => {
      const p = photos().find(q => q.id === b.dataset.ph); if (!p) return;
      openSheet(`<h3>${dfmt(p.ts, 1)}</h3><img class="xbig" src="${p.d}" alt=""><button class="big sec" id="xpd">Удалить фото</button>`, () => { $('#xpd').onclick = () => { savePhotos(photos().filter(q => q.id !== p.id)); closeSheet(); viewPhotos(); }; });
    });
    if ($('#xcmp')) $('#xcmp').onclick = () => {
      const a = l[l.length - 1], z = l[0]; const opt = sel => l.slice().reverse().map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${dfmt(p.ts, 1)}</option>`).join('');
      openSheet(`<h3>Было и стало</h3><div class="xcmp2"><div><small>Было</small><select id="xa">${opt(a.id)}</select></div><div><small>Стало</small><select id="xz">${opt(z.id)}</select></div></div>
        <div class="xsl"><img id="xiz" alt=""><div class="xslt"><img id="xia" alt=""></div><i id="xsh"></i></div><input type="range" id="xsr" min="0" max="100" value="50" aria-label="Сравнение">`, () => {
        const fill = () => { $('#xia').src = photos().find(q => q.id === $('#xa').value).d; $('#xiz').src = photos().find(q => q.id === $('#xz').value).d; };
        const mv = () => { const v = $('#xsr').value; $('.xslt').style.clipPath = `inset(0 ${100 - v}% 0 0)`; $('#xsh').style.left = v + '%'; };
        $('#xa').onchange = $('#xz').onchange = fill; $('#xsr').oninput = mv; fill(); mv();
      });
    };
  }

  return { scan, sumFeel, weigh, sumWeek, statTiles, viewBlog, viewTipsList, viewRecipes, set: setHtml, bind: setBind, openBackup, openRestore, markPr, sumPr, exRec, aw, swap, swI, links, measLinks, wlink, tabs, dishBtn, freq, dish, viewRecords, viewWrep, viewChart, viewPhotos };
})();

/* кнопки действий в окнах всегда видны: последние .big уходят в липкую панель */
(() => {
  const wrap = () => {
    const s = document.getElementById('sheet'); if (!s || s.hidden) return; const inn = s.querySelector('.in'); if (!inn || inn.querySelector(':scope > .sbar')) return;
    const kids = [...inn.children], tail = []; for (let i = kids.length - 1; i >= 0 && kids[i].classList.contains('big'); i--) tail.unshift(kids[i]);
    if (!tail.length) return; const bar = document.createElement('div'); bar.className = 'sbar'; inn.appendChild(bar); tail.forEach(k => bar.appendChild(k));
  };
  const start = () => { const s = document.getElementById('sheet'); if (s) new MutationObserver(wrap).observe(s, { childList: true, attributes: true, attributeFilter: ['hidden'] }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

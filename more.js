/* ---------- дополнения v100+: лёгкая неделя, прогресс упражнения, заметки, паузы отдыха ---------- */
const MORE = (() => {
  const DAY = 864e5, fd = ts => { const d = new Date(ts); return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0'); };
  const wrapFn = (name, fn) => { try { const old = window[name]; if (typeof old !== 'function') return; window[name] = function () { const r = old.apply(this, arguments); try { fn.apply(this, arguments); } catch (e) { } return r; }; } catch (e) { } };

  /* ---- лёгкая неделя (только с согласия) ---- */
  const deload = () => { const d = store.get('deload', null); return d && d.until > Date.now() ? d : null; };
  const offerDeload = () => {
    if (deload()) return false;
    const no = store.get('deloadNo', 0); if (Date.now() - no < 7 * DAY) return false;
    const h = hist().slice().sort((a, b) => b.ts - a.ts); return h.length >= 2 && h[0].feel === 'hard' && h[1].feel === 'hard';
  };
  const dlCard = ts => `<div class="xfeel mdl"><b>Две тяжёлые тренировки подряд</b><small>Предлагаем лёгкую неделю: объём упражнений на 20% меньше, 7 дней. Включится только после твоего согласия.</small><div class="xpb"><button data-mdl="y">Включить</button><button class="sec" data-mdl="n">Не сейчас</button></div></div>`;
  wrapFn('viewSummary', ts => {
    const h = hist(), x = h.find(q => q.ts === ts); if (!x || !x.feel || !offerDeload()) return;
    const f = document.querySelector('.xfeel'); if (f) f.insertAdjacentHTML('afterend', dlCard(ts));
  });
  wrapFn('viewHome', () => {
    const d = deload(), a = document.querySelector('.hact'); if (!d || !a) return;
    a.insertAdjacentHTML('afterend', `<div class="wipc mdl"><div class="wtx"><b>Лёгкая неделя до ${fd(d.until)}</b><small>Объём упражнений снижен на 20%, чтобы восстановиться.</small></div><div class="xpb"><button class="sec" data-mdl="off">Выключить</button></div></div>`);
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-mdl]'); if (!b) return;
    const v = b.dataset.mdl;
    if (v === 'y') { store.set('deload', { from: Date.now(), until: Date.now() + 7 * DAY }); toast('Лёгкая неделя включена', 'до ' + fd(Date.now() + 7 * DAY)); }
    else if (v === 'n') store.set('deloadNo', Date.now());
    else if (v === 'off') { store.set('deload', null); toast('Лёгкая неделя выключена', ''); }
    route();
  });

  /* ---- свои паузы и лёгкая неделя в сборке тренировки ---- */
  const RD = { restSet: 60, restEx: 120, restAbs: 30, restWu: 30, restSt: 5 };
  const rMin = k => Math.ceil(RD[k] / 2), rMax = k => RD[k] * 4, rStep = k => RD[k] <= 10 ? 1 : 5;
  const restVal = k => { const v = +(settings[k] || 0); return v > 0 ? Math.min(rMax(k), Math.max(rMin(k), v)) : 0; };
  wrapFnRet('buildSteps', steps => {
    const dl = deload() || store.get('lt:' + fkey(new Date()), 0);
    steps.forEach((s, i) => {
      if (dl && s.k === 'reps' && !s.warm && !s.stretch) { s.reps = Math.max(3, Math.round(s.reps * 0.8)); if (s.rp !== undefined) s.rp = s.reps; }
      if (s.k !== 'rest' || s.prep || s.swap || i === 0) return;
      const pv = steps[i - 1]; if (!pv || !pv.ex) return;
      if (!pv.stretch && !pv.warm) { const ov = +store.get('restx:' + pv.ex, 0); if (ov > 0) { s.sec = ov; return; } }
      const g = pv.stretch ? 'restSt' : pv.warm ? 'restWu' : pv.db ? (pv.set < pv.sets ? 'restSet' : 'restEx') : 'restAbs';
      if (restVal(g) > 0) s.sec = restVal(g);
    });
    return superset(splitSides(steps));
  });

  /* ---- упражнения «на каждую сторону»: правая и левая по очереди ---- */
  function splitSides(steps) {
    if (settings.sides === false) return steps;
    const out = [];
    steps.forEach(s => {
      if (s.k === 'reps' && s.ex && EX[s.ex] && EX[s.ex].side && !s.warm && !s.stretch && !s.half && !s.hv) out.push({ ...s, half: 1, sd: 1 }, { k: 'rest', sec: 6, swap: true, sd: 1 }, { ...s, half: 2, sd: 1 });
      else out.push(s);
    });
    return out;
  }
  /* ---- суперсеты: два упражнения с весом чередуются, отдых только после пары ---- */
  const prim = ex => ((typeof MUSC !== 'undefined' && MUSC[ex]) || '').split(' ')[0];
  function superset(steps) {
    if (!settings.superset) return steps;
    const units = []; let cur = [];
    for (let i = 1; i < steps.length; i++) {
      const s = steps[i]; cur.push(s);
      if (s.k === 'rest' && !s.swap && !s.prep) { units.push({ main: cur.slice(0, -1), rest: s }); cur = []; }
    }
    if (cur.length) units.push({ main: cur, rest: null });
    units.forEach(u => { const m = u.main.find(x => x.ex) || {}; u.ex = m.ex; u.db = !!m.db && !m.warm && !m.stretch; });
    const blocks = [];
    units.forEach(u => { const b = blocks[blocks.length - 1]; if (b && b.ex === u.ex && u.db) b.u.push(u); else blocks.push({ ex: u.ex, db: u.db, u: [u] }); });
    const out = [steps[0]];
    for (let i = 0; i < blocks.length; i++) {
      const A = blocks[i], B = blocks[i + 1];
      if (B && A.db && B.db && A.u.length > 1 && A.u.length === B.u.length && A.ex !== B.ex && prim(A.ex) !== prim(B.ex)) {
        A.u.forEach((ua, k) => {
          const ub = B.u[k];
          ua.main.concat(ub.main).forEach(x => { x.ss = 1; x.ssp = x.ex === A.ex ? B.ex : A.ex; });
          out.push(...ua.main, { k: 'rest', sec: 10, ss: 1 }, ...ub.main); if (ub.rest) out.push(ub.rest);
        });
        i++;
      } else A.u.forEach(u => { out.push(...u.main); if (u.rest) out.push(u.rest); });
    }
    return out;
  }
  function wrapFnRet(name, fn) { try { const old = window[name]; window[name] = function () { return fn(old.apply(this, arguments)); }; } catch (e) { } }

  /* ---- страница упражнения: прогресс, заметка, пауза ---- */
  let met = 'main';
  const series = id => {
    const out = []; hist().slice().sort((a, b) => a.ts - b.ts).forEach(x => { const e = (x.exs || []).find(q => q.ex === id); if (e) out.push({ ts: x.ts, e }); }); return out;
  };
  function chart(id) {
    const s = series(id); if (!s.length) return '<div class="sh">Прогресс</div><div class="note" style="margin-top:0"><small>График появится после тренировок с этим упражнением.</small></div>';
    const weighted = s.some(q => q.e.w > 0), tim = s.some(q => q.e.t > 0);
    const m = weighted && met === 'reps' ? 'reps' : weighted ? 'w' : tim ? 't' : 'reps';
    const val = q => m === 'w' ? q.e.w || 0 : m === 't' ? q.e.t || 0 : q.e.r || 0, unit = m === 'w' ? ' кг' : m === 't' ? ' с' : ' повт.';
    const pts = s.slice(-12), vs = pts.map(val), mx = Math.max(...vs), mn = Math.min(...vs), W = 340, H = 140, px = 34, py = 18;
    const lo = mn === mx ? Math.max(0, mn - 1) : mn, hi = mx === mn ? mx + 1 : mx;
    const X = i => pts.length === 1 ? W / 2 : px + (W - px - 12) * i / (pts.length - 1), Y = v => H - py - (H - py - 16) * (v - lo) / (hi - lo);
    const line = pts.map((q, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(vs[i]).toFixed(1)).join('');
    const svg = `<svg class="xbars" viewBox="0 0 ${W} ${H}"><path d="M${px} ${Y(hi).toFixed(1)}H${W - 8}M${px} ${Y(lo).toFixed(1)}H${W - 8}" stroke="#2c2c2e"/><text x="${px - 6}" y="${(Y(hi) + 4).toFixed(1)}" text-anchor="end" fill="#8e8e93" font-size="11">${fmtKg(hi)}</text><text x="${px - 6}" y="${(Y(lo) + 4).toFixed(1)}" text-anchor="end" fill="#8e8e93" font-size="11">${fmtKg(lo)}</text>${pts.length > 1 ? `<path d="${line}" fill="none" stroke="#ff6b3d" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` : ''}${pts.map((q, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(vs[i]).toFixed(1)}" r="4" fill="#ff6b3d" stroke="#000" stroke-width="1.5"/>`).join('')}<text x="${px}" y="${H - 3}" fill="#8e8e93" font-size="11">${fd(pts[0].ts)}</text><text x="${W - 8}" y="${H - 3}" text-anchor="end" fill="#8e8e93" font-size="11">${fd(pts[pts.length - 1].ts)}</text></svg>`;
    const last = vs[vs.length - 1], best = Math.max(...s.map(val)), d = pts.length > 1 ? last - vs[0] : 0;
    return `<div class="sh">Прогресс</div><div class="ch">${weighted ? `<div class="seg wide" style="margin-bottom:8px"><button data-mmet="w" class="${m === 'w' ? 'on' : ''}">Вес</button><button data-mmet="reps" class="${m === 'reps' ? 'on' : ''}">Повторы</button></div>` : ''}${svg}<div class="xleg"><span>Последний: ${fmtKg(last)}${unit}</span><span>Лучший: ${fmtKg(best)}${unit}</span>${pts.length > 1 ? `<span>${d > 0 ? '+' : d < 0 ? '−' : ''}${fmtKg(Math.abs(d))}${unit} за период</span>` : ''}</div></div>`;
  }
  const RV = [0, 30, 45, 60, 90, 120, 180];
  wrapFn('viewEx', id => {
    if (!EX[id] || /^st_/.test(id)) return;
    const m = document.querySelector('.mact'); if (!m) return;
    const note = store.get('note:' + id, ''), rv = +store.get('restx:' + id, 0);
    m.insertAdjacentHTML('beforebegin', chart(id) + `<div class="sh">Моя заметка</div><div class="note" style="margin-top:0"><textarea id="mnote" class="mnote" rows="3" maxlength="300" placeholder="Например: скамья на третье отверстие, хват уже">${esc(note)}</textarea><small>Показывается на экране тренировки под названием.</small></div>
      <div class="sh">Пауза после подхода</div><div class="grp"><div class="opt"><div>Отдых в этом упражнении<small>переопределяет общие настройки</small></div><select id="mrest">${RV.map(v => `<option value="${v}" ${v === rv ? 'selected' : ''}>${v ? v + ' с' : 'Авто'}</option>`).join('')}</select></div></div>`);
    $('#mnote').oninput = e => store.set('note:' + id, e.target.value);
    $('#mrest').onchange = e => store.set('restx:' + id, +e.target.value);
    document.querySelectorAll('[data-mmet]').forEach(b => b.onclick = () => { met = b.dataset.mmet; const sy = scrollY; viewEx(id); scrollTo(0, sy); });
  });
  /* заметка на экране тренировки */
  wrapFn('renderRun', () => {
    if (typeof run === 'undefined' || !run) return; const s = run.steps[run.i]; if (!s || !s.ex) return;
    if (s.ss && s.ssp && EX[s.ssp]) { const nm0 = document.querySelector('.wk .name'); if (nm0 && !document.querySelector('.mxss')) nm0.insertAdjacentHTML('afterend', `<div class="mxss">Суперсет: ${esc(EX[s.ssp].name)}</div>`); }
    const n = store.get('note:' + s.ex, ''); if (!n) return;
    const nm = document.querySelector('.wk .name'); if (nm && !document.querySelector('.mxnote')) nm.insertAdjacentHTML('afterend', `<div class="mxnote">${esc(n)}</div>`);
  });

  /* ---- настройки: паузы ---- */
  const RL = [['restSet', 'Между подходами с весом', ''], ['restEx', 'После упражнения с весом', ''], ['restAbs', 'Между упражнениями без веса', ''], ['restWu', 'Между упражнениями разминки', ''], ['restSt', 'Между упражнениями растяжки', '']];
  const rrow = ([k, t]) => { const v = restVal(k) || RD[k]; return `<div class="opt rsr" data-rk="${k}"><div>${t}<small>обычно ${RD[k]} с, минимум ${rMin(k)} с</small></div><div class="rstp"><button data-mrd="-1" aria-label="Меньше">−</button><b>${v} с</b><button data-mrd="1" aria-label="Больше">+</button><button class="rrs" data-rr="1" aria-label="Сбросить" ${restVal(k) && restVal(k) !== RD[k] ? '' : 'hidden'}>↺</button></div></div>`; };
  const setHtml = () => `<div class="glab">Паузы отдыха</div><div class="grp">${RL.map(rrow).join('')}<div class="opt"><div>Суперсеты<small>два упражнения с весом чередуются, отдых после пары</small></div><button class="sw ${settings.superset ? 'on' : ''}" role="switch" aria-checked="${!!settings.superset}" data-sw="superset" aria-label="Переключатель"></button></div><div class="opt"><div>Стороны по очереди<small>выпады, ступеньки и подобное: сначала правая, потом левая</small></div><button class="sw ${settings.sides !== false ? 'on' : ''}" role="switch" aria-checked="${settings.sides !== false}" data-sw="sides" aria-label="Переключатель"></button></div><button class="opt pick" id="mrall">Сбросить паузы</button></div>`;
  const setBind = () => {
    const upd = r => { const k = r.dataset.rk, v = restVal(k) || RD[k]; r.querySelector('b').textContent = v + ' с'; r.querySelector('[data-rr]').hidden = !(restVal(k) && restVal(k) !== RD[k]); };
    document.querySelectorAll('.rsr').forEach(r => {
      r.querySelectorAll('[data-mrd]').forEach(b => b.onclick = () => { const k = r.dataset.rk, cur = restVal(k) || RD[k], n = Math.min(rMax(k), Math.max(rMin(k), cur + (+b.dataset.mrd) * rStep(k))); settings[k] = n === RD[k] ? 0 : n; saveSettings(); upd(r); });
      r.querySelector('[data-rr]').onclick = () => { settings[r.dataset.rk] = 0; saveSettings(); upd(r); };
    });
    const ra = $('#mrall'); if (ra) ra.onclick = () => { RL.forEach(([k]) => { settings[k] = 0; }); saveSettings(); document.querySelectorAll('.rsr').forEach(upd); toast('Паузы сброшены', 'вернулись значения по умолчанию'); };
  };
  return { set: setHtml, bind: setBind, deload };
})();


const MORE2 = (() => {
  const bar = (t, sub, fb) => `<div class="bar"><button class="rbtn" id="m2back" aria-label="Назад">${I.back}</button><h1>${t}${sub ? `<small>${sub}</small>` : ''}</h1><span class="rbtn ghost"></span></div>`;
  const wrapFn = (name, fn) => { try { const old = window[name]; if (typeof old !== 'function') return; window[name] = function () { const r = old.apply(this, arguments); try { fn.apply(this, arguments); } catch (e) { } return r; }; } catch (e) { } };
  const num0 = v => parseFloat(String(v).replace(',', '.'));

  /* ---- список покупок ---- */
  const shop = () => store.get('shop', []);
  function shopAdd(list, src) {
    const l = shop(), have = new Set(l.map(x => x.t.toLowerCase())); let n = 0;
    list.forEach(t => { t = String(t).trim(); if (t && !have.has(t.toLowerCase())) { l.push({ id: 'p' + Date.now().toString(36) + n, t, done: 0 }); have.add(t.toLowerCase()); n++; } });
    store.set('shop', l); toast('Список покупок', n ? 'Добавлено: ' + n : 'Всё уже в списке');
  }
  function viewShop() {
    const l = shop(), left = l.filter(x => !x.done).length;
    view(`<div class="screen">${bar('Список покупок', l.length ? 'осталось купить: ' + left : '')}
      <div class="fsearch"><input id="shin" type="text" placeholder="Добавить продукт" maxlength="60" autocomplete="off"><button class="fclr" id="shadd" aria-label="Добавить">${I.plus}</button></div>
      ${l.length ? `<div class="grp shl">${l.map(x => `<div class="opt shr2 ${x.done ? 'dn' : ''}"><button class="shc" data-shc="${x.id}" aria-label="Отметить">${x.done ? '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : ''}</button><span data-shc="${x.id}">${esc(x.t)}</span><button class="sx" data-shd="${x.id}" aria-label="Удалить">${I.close}</button></div>`).join('')}</div>` : '<div class="empty small">Список пуст. Добавь продукты вручную, из шаблонов приёмов пищи или из рецепта.</div>'}
      <div class="mact">${l.length ? '<button class="big sec" id="shcp">Скопировать список</button>' : ''}<button class="big sec" id="shtp">Добавить из шаблонов</button>${l.some(x => x.done) ? '<button class="big sec" id="shcl">Убрать купленное</button>' : ''}</div></div>`);
    $('#m2back').onclick = () => goBack('#food');
    const add = () => { const v = $('#shin').value.trim(); if (!v) return; shopAdd([v]); viewShop(); };
    $('#shadd').onclick = add; $('#shin').onkeydown = e => { if (e.key === 'Enter') add(); };
    document.querySelectorAll('[data-shc]').forEach(b => b.onclick = () => { const q = shop(), x = q.find(z => z.id === b.dataset.shc); if (x) { x.done = x.done ? 0 : 1; store.set('shop', q); viewShop(); } });
    document.querySelectorAll('[data-shd]').forEach(b => b.onclick = () => { store.set('shop', shop().filter(x => x.id !== b.dataset.shd)); viewShop(); });
    if ($('#shcl')) $('#shcl').onclick = () => { store.set('shop', shop().filter(x => !x.done)); viewShop(); };
    if ($('#shcp')) $('#shcp').onclick = () => { const t = shop().map(x => (x.done ? '✓ ' : '• ') + x.t).join('\n'); try { navigator.clipboard.writeText(t); toast('Скопировано', 'Список покупок'); } catch (e) { toast('Не удалось скопировать', ''); } };
    $('#shtp').onclick = () => {
      const tp = store.get('ftpl', []); if (!tp.length) return openSheet('<h3>Шаблонов нет</h3><div class="opt"><small>Сохрани приём пищи как шаблон в разделе питания, и его продукты можно будет добавить в список.</small></div><button class="big" id="shok">Понятно</button>', () => { $('#shok').onclick = closeSheet; });
      openSheet(`<h3>Добавить из шаблона</h3>${tp.map(t => `<button class="opt pick" data-stp="${t.id}"><div>${esc(t.name)}<small>${t.items.length} продуктов</small></div></button>`).join('')}<button class="big sec" id="shok">Закрыть</button>`, () => {
        $('#shok').onclick = closeSheet; document.querySelectorAll('[data-stp]').forEach(b => b.onclick = () => { const t = tp.find(x => x.id === b.dataset.stp); shopAdd(t.items.map(e => e.name)); closeSheet(); viewShop(); });
      });
    };
  }
  wrapFn('viewFood', () => {
    const a = document.querySelector('.mlink'); const n = shop().filter(x => !x.done).length;
    const html = `<div class="grp mlink"><button class="opt xrow" data-go="#shop"><div>Список покупок<small>${n ? 'осталось купить: ' + n : 'продукты на неделю'}</small></div><b>${I.r}</b></button><button class="opt xrow" id="mmenu"><div>Меню на день<small>предложение из твоих шаблонов</small></div><b>${I.r}</b></button><button class="opt xrow" data-go="#goals"><div>Мои цели<small>вес тела, упражнения, тренировки</small></div><b>${I.r}</b></button></div>`;
    if (a) a.insertAdjacentHTML('afterend', html); else { const h = document.querySelector('.screen .hint'); if (h) h.insertAdjacentHTML('beforebegin', html); }
    const mm = $('#mmenu'); if (mm) mm.onclick = openMenu;
  });

  /* ---- меню на день из шаблонов (добавляется только после подтверждения) ---- */
  let menuSeed = 0;
  const tsum = t => t.items.reduce((a, e) => ({ k: a.k + (e.k || 0), p: a.p + (e.p || 0) }), { k: 0, p: 0 });
  function buildMenu() {
    const tp = store.get('ftpl', []), G = nutGoal(), eaten = sumLog(dayLog(fdate)), left = Math.max(0, G.kcal - eaten.k), shares = [[0, .25], [1, .35], [2, .30], [3, .10]], used = new Set(), out = [];
    shares.forEach(([m, sh]) => {
      const pool = tp.filter(t => !used.has(t.id)); if (!pool.length) return;
      const tg = left * sh, score = t => { const s = tsum(t), own = t.items[0] && t.items[0].meal === m ? 0 : tg * 0.25; return Math.abs(s.k - tg) + own - s.p * 0.5; };
      const ord = pool.slice().sort((a, b) => score(a) - score(b)), t = ord[menuSeed % ord.length]; used.add(t.id); out.push({ m, t });
    });
    return { out, G, eaten, left };
  }
  function openMenu() {
    if (!fdate) fdate = fkey(new Date());
    if (!store.get('ftpl', []).length) return openSheet('<h3>Меню на день</h3><div class="opt"><small>Меню собирается из твоих шаблонов. Открой приём пищи, добавь продукты и сохрани их кнопкой «Шаблоны». Потом вернись сюда.</small></div><button class="big" id="mok">Понятно</button>', () => { $('#mok').onclick = closeSheet; });
    const M = buildMenu(), tk = M.out.reduce((a, x) => a + tsum(x.t).k, 0), tp = M.out.reduce((a, x) => a + tsum(x.t).p, 0);
    openSheet(`<h3>Меню на день</h3><div class="opt"><small>Осталось до нормы: ${fmt0(M.left)} ккал. Предложение из твоих шаблонов, в день ничего не добавится без твоего подтверждения.</small></div>
      <div class="grp">${M.out.map(x => `<div class="opt"><div>${MEALS[x.m]}: ${esc(x.t.name)}<small>${fmt0(tsum(x.t).k)} ккал · белок ${fmt0(tsum(x.t).p)} г</small></div></div>`).join('')}</div>
      <div class="opt"><small>Итого: ${fmt0(tk)} ккал и ${fmt0(tp)} г белка. Цель дня: ${fmt0(M.G.kcal)} ккал, белок ${M.G.p} г.</small></div>
      <button class="big" id="mmadd">Добавить в день</button><button class="big sec" id="mmoth">Другой вариант</button><button class="big sec" id="mmcl">Закрыть</button>`, () => {
      $('#mmcl').onclick = closeSheet; $('#mmoth').onclick = () => { menuSeed++; openMenu(); };
      $('#mmadd').onclick = () => { const lg = dayLog(fdate), base = Date.now(); let n = 0; M.out.forEach(x => x.t.items.forEach(e => { lg.push(Object.assign({}, e, { id: base + '' + n + Math.floor(Math.random() * 1000), ts: base + n, meal: x.m })); n++; })); saveLog(fdate, lg); closeSheet(); toast('Меню добавлено', n + ' записей'); viewFood(true); };
    });
  }

  /* ---- виджет «Сегодня» ---- */
  wrapFn('viewHome', () => {
    const t = document.querySelector('.recobar, .sh.favh, .pcard, .wopt'); if (!t || !store.get('profile', {}).set || store.get('homecfg', {}).today === false) return;
    const tw = trainWeek(), td = tw.cells.find(c => c.today), G = nutGoal(), k = fkey(new Date()), S = sumLog(dayLog(k)), su = supStat(k), wt = waterDay(k), wg = waterGoal();
    const tr = td ? (td.done ? 'выполнена' : td.rest ? 'выходной' : 'по плану') : '';
    const tile = (go, v, l, p) => `<button class="mtl" data-go="${go}"><b>${v}</b><small>${l}</small><i class="wbar"><u style="width:${Math.min(100, p)}%"></u></i></button>`;
    t.insertAdjacentHTML('beforebegin', `<div class="sh">Сегодня</div><div class="mtiles2">${tile('#home', tr || '-', 'тренировка', td && td.done ? 100 : 0)}${tile('#food', fmt0(S.k) + ' / ' + fmt0(G.kcal), 'ккал', S.k / Math.max(1, G.kcal) * 100)}${tile('#food', fmt0(wt) + ' мл', 'вода, цель ' + fmt0(wg), wt / wg * 100)}${typeof MORE3 !== 'undefined' ? `<button class="mtl" id="mfeel"><b>${MORE3.flText(MORE3.flGet())}</b><small>самочувствие</small><i class="wbar"><u style="width:${({ bad: 30, ok: 65, good: 100, '': 0 })[MORE3.flScore(MORE3.flGet())]}%"></u></i></button>` : ''}${su.plan ? tile('#food', su.done + ' / ' + su.plan, 'добавки', su.done / su.plan * 100) : ''}${tile('#goals', 'Цели', 'открыть', 0)}</div>`);
  });

  /* ---- цели ---- */
  const goals = () => store.get('goals', []);
  const wtNow = () => { const l = store.get('wt', []); return l.length ? l[l.length - 1].w : profile().w; };
  const exBest = (id, m) => { let b = 0; hist().forEach(x => (x.exs || []).forEach(e => { if (e.ex === id) b = Math.max(b, m === 'w' ? e.w || 0 : m === 't' ? e.t || 0 : e.r || 0); })); return b; };
  function gProg(g) {
    if (g.k === 'wt') { const cur = wtNow(), fr = g.target === g.start ? 1 : (cur - g.start) / (g.target - g.start); return { fr: Math.max(0, Math.min(1, fr)), txt: `${fmtKg(g.start)} → ${fmtKg(g.target)} кг, сейчас ${fmtKg(cur)} кг` }; }
    if (g.k === 'ex') { const b = exBest(g.ex, g.m), u = g.m === 'w' ? ' кг' : g.m === 't' ? ' с' : ' повт.'; return { fr: Math.min(1, b / g.target), txt: `лучший результат ${fmtKg(b)} из ${fmtKg(g.target)}${u}` }; }
    const n = hist().filter(x => x.ts >= g.created).length; return { fr: Math.min(1, n / g.target), txt: `${n} из ${g.target} тренировок` };
  }
  function checkGoals() {
    const l = goals(); let ch = false; l.forEach(g => { if (!g.done && gProg(g).fr >= 1) { g.done = Date.now(); ch = true; toast('Цель достигнута', g.title); } }); if (ch) store.set('goals', l);
  }
  wrapFn('finish', () => setTimeout(checkGoals, 600));
  wrapFn('viewHome', () => { try { checkGoals(); } catch (e) { } });
  function viewGoals() {
    checkGoals();
    const l = goals(), act = l.filter(g => !g.done), dn = l.filter(g => g.done);
    const row = g => { const p = gProg(g); return `<div class="opt gr ${g.done ? 'dn' : ''}"><div><b>${esc(g.title)}</b><small>${g.done ? 'достигнута ' + new Date(g.done).toLocaleDateString('ru-RU') : p.txt}</small><i class="wbar"><u style="width:${p.fr * 100}%"></u></i></div><button class="sx" data-gd="${g.id}" aria-label="Удалить цель">${I.close}</button></div>`; };
    view(`<div class="screen">${bar('Мои цели', act.length ? 'в работе: ' + act.length : '')}
      ${act.length ? `<div class="grp">${act.map(row).join('')}</div>` : '<div class="empty small">Целей пока нет. Поставь первую: вес тела, число повторов или количество тренировок.</div>'}
      ${dn.length ? `<div class="sh">Достигнуто</div><div class="grp">${dn.map(row).join('')}</div>` : ''}
      <div class="mact"><button class="big" id="gadd">Новая цель</button></div></div>`);
    $('#m2back').onclick = () => goBack('#food');
    document.querySelectorAll('[data-gd]').forEach(b => b.onclick = () => openSheet('<h3>Удалить цель?</h3><button class="big sec" id="gn">Оставить</button><button class="big dngb" id="gy">Удалить</button>', () => { $('#gn').onclick = closeSheet; $('#gy').onclick = () => { store.set('goals', goals().filter(x => x.id !== b.dataset.gd)); closeSheet(); viewGoals(); }; }));
    $('#gadd').onclick = openGoalNew;
  }
  function openGoalNew() {
    const exs = Object.keys(EX).filter(k => !/^st_/.test(k) && k !== 'jack' && k !== 'highknees').sort((a, b) => EX[a].name.localeCompare(EX[b].name, 'ru'));
    let k = 'wt';
    const draw = () => {
      const el = $('#gform'); if (!el) return;
      el.innerHTML = k === 'wt' ? `<div class="opt"><div>Желаемый вес</div><div class="nin"><input id="gv" type="number" inputmode="decimal" value="${profile().goal || ''}"><span>кг</span></div></div><div class="opt"><small>Сейчас ${fmtKg(wtNow())} кг.</small></div>`
        : k === 'ex' ? `<div class="opt"><div>Упражнение</div><select id="gex">${exs.map(x => `<option value="${x}">${esc(EX[x].name)}</option>`).join('')}</select></div><div class="opt"><div>Что считать</div><select id="gm"><option value="r">Повторы</option><option value="w">Вес гантели, кг</option><option value="t">Время, сек</option></select></div><div class="opt"><div>Цель</div><div class="nin"><input id="gv" type="number" inputmode="decimal" placeholder="10"></div></div>`
        : `<div class="opt"><div>Сколько тренировок</div><div class="nin"><input id="gv" type="number" inputmode="numeric" placeholder="12"><span>шт.</span></div></div><div class="opt"><small>Считаются тренировки с сегодняшнего дня.</small></div>`;
      document.querySelectorAll('[data-gk]').forEach(b => b.classList.toggle('on', b.dataset.gk === k));
    };
    openSheet(`<h3>Новая цель</h3><div class="seg wide"><button data-gk="wt" class="on">Вес тела</button><button data-gk="ex">Упражнение</button><button data-gk="cnt">Тренировки</button></div><div id="gform"></div><button class="big" id="gok">Создать</button><button class="big sec" id="gcl">Отмена</button>`, () => {
      draw(); document.querySelectorAll('[data-gk]').forEach(b => b.onclick = () => { k = b.dataset.gk; draw(); }); $('#gcl').onclick = closeSheet;
      $('#gok').onclick = () => {
        const v = num0($('#gv').value); if (!(v > 0)) { $('#gv').focus(); return; }
        const g = { id: 'g' + Date.now().toString(36), k, created: Date.now(), target: v };
        if (k === 'wt') { g.start = wtNow(); g.title = 'Вес ' + fmtKg(v) + ' кг'; }
        else if (k === 'ex') { g.ex = $('#gex').value; g.m = $('#gm').value; g.title = EX[g.ex].name + ': ' + fmtKg(v) + (g.m === 'w' ? ' кг' : g.m === 't' ? ' с' : ' повт.'); }
        else g.title = v + ' ' + (v % 10 === 1 && v % 100 !== 11 ? 'тренировка' : [2, 3, 4].includes(v % 10) && ![12, 13, 14].includes(v % 100) ? 'тренировки' : 'тренировок');
        store.set('goals', goals().concat(g)); closeSheet(); viewGoals();
      };
    });
  }
  /* строка «Цели» в аналитике */
  wrapFn('viewStats', () => { const g = document.querySelector('.sgrid'); if (g && !document.querySelector('[data-go="#goals"]')) { const n = goals().filter(x => !x.done).length; g.insertAdjacentHTML('beforeend', `<button class="stile" data-go="#goals"><b>Цели</b><small>${n ? 'в работе: ' + n : 'поставить цель'}</small></button>`); } });
  return { viewShop, viewGoals, shopAdd, checkGoals };
})();
const MORE3 = (() => {
  const wrapFn = (name, fn) => { try { const old = window[name]; if (typeof old !== 'function') return; window[name] = function () { const r = old.apply(this, arguments); try { fn.apply(this, arguments); } catch (e) { } return r; }; } catch (e) { } };
  const bar = (t, sub) => `<div class="bar"><button class="rbtn" id="m3back" aria-label="Назад">${I.back}</button><h1>${t}${sub ? `<small>${sub}</small>` : ''}</h1><span class="rbtn ghost"></span></div>`;
  const today = () => fkey(new Date());

  /* ---- самочувствие ---- */
  const FL = { sl: ['плохо', 'нормально', 'хорошо'], ti: ['низкая', 'средняя', 'высокая'], pa: ['нет', 'в мышцах', 'в суставе'] };
  const flGet = k => store.get('fl:' + (k || today()), null);
  const flScore = f => !f ? '' : (f.sl === 1 || f.ti === 3 || f.pa === 2) ? 'bad' : (f.sl >= 2 && f.ti <= 2 && f.pa === 0) ? 'good' : 'ok';
  const flText = f => ({ bad: 'лучше легче', ok: 'нормально', good: 'отлично', '': 'отметить' })[flScore(f)];
  function openFeel() {
    const f = Object.assign({ sl: 2, ti: 2, pa: 0 }, flGet() || {});
    const row = (k, t, vals, off) => `<div class="glab">${t}</div><div class="seg wide" data-fk="${k}">${vals.map((v, i) => `<button data-fv="${i + off}" class="${f[k] === i + off ? 'on' : ''}">${v}</button>`).join('')}</div>`;
    openSheet(`<h3>Самочувствие сегодня</h3>${row('sl', 'Сон', FL.sl, 1)}${row('ti', 'Усталость', FL.ti, 1)}${row('pa', 'Боль', FL.pa, 0)}<button class="big" id="flok">Сохранить</button>`, () => {
      document.querySelectorAll('[data-fk]').forEach(g => g.querySelectorAll('[data-fv]').forEach(b => b.onclick = () => { f[g.dataset.fk] = +b.dataset.fv; g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); }));
      $('#flok').onclick = () => { store.set('fl:' + today(), f); const sc = flScore(f); if (sc === 'bad') openFeelAdv(f); else { closeSheet(); toast('Самочувствие записано', flText(f)); if (/^#(home)?$/.test(location.hash || '#')) route(); } };
    });
  }
  function openFeelAdv(f) {
    const lt = store.get('lt:' + today(), 0);
    openSheet(`<h3>Сегодня лучше мягче</h3><div class="opt"><small>${f.pa === 2 ? 'Боль в суставе: силовую лучше пропустить или заменить растяжкой. Если всё же тренируешься, снизь нагрузку.' : 'Сон или усталость не в лучшей форме. На сегодняшней тренировке можно снизить объём на 20% (меньше повторений), остальное не меняется.'}</small></div>
      ${lt ? '<div class="opt"><small>Лёгкий режим на сегодня уже включён.</small></div>' : '<button class="big" id="fllt">Снизить объём на сегодня</button>'}<button class="big sec" id="flno">Оставить как есть</button>`, () => {
      if ($('#fllt')) $('#fllt').onclick = () => { store.set('lt:' + today(), 1); closeSheet(); toast('Лёгкий режим на сегодня', 'объём тренировки снижен на 20%'); route(); };
      $('#flno').onclick = () => { closeSheet(); route(); };
    });
  }

  /* ---- плато: нет роста три тренировки подряд ---- */
  function plateaus(x) {
    const out = [], hs = hist().slice().sort((a, b) => a.ts - b.ts);
    (x.exs || []).forEach(e => {
      if (/^st_/.test(e.ex) || /^(jack|highknees)$/.test(e.ex) || !EX[e.ex]) return;
      const ser = []; hs.filter(h => h.ts <= x.ts).forEach(h => { const q = (h.exs || []).find(z => z.ex === e.ex); if (q) ser.push(q); });
      if (ser.length < 3) return;
      const sc = q => (q.t || 0) || ((q.w || 0) || 1) * (q.r || 0), l = ser.slice(-3), a = sc(l[0]);
      if (a > 0 && sc(l[1]) <= a && sc(l[2]) <= a && store.get('plx:' + e.ex, 0) < x.ts - 7 * 864e5) out.push(e.ex);
    });
    return out.slice(0, 3);
  }
  wrapFn('viewSummary', ts => {
    const x = hist().find(q => q.ts === ts); if (!x) return;
    const pl = plateaus(x); if (!pl.length || document.querySelector('.mpl')) return;
    const t = document.querySelector('.smc'); if (!t) return;
    t.insertAdjacentHTML('beforebegin', `<div class="wipc mpl"><div class="wtx"><b>Нет роста: ${pl.map(i => esc(EX[i].name)).join(', ')}</b><small>Три тренировки подряд без прибавки. Можно добавить повторение, поднять вес на шаг или взять лёгкую неделю.</small></div><div class="xpb"><button class="sec" data-mdl="y">Лёгкая неделя</button><button class="sec" id="mplx">Позже</button></div></div>`);
    const b = $('#mplx'); if (b) b.onclick = () => { pl.forEach(i => store.set('plx:' + i, x.ts)); const c = document.querySelector('.mpl'); if (c) c.remove(); };
  });

  /* ---- итоги месяца ---- */
  let mOff = 0;
  const MN = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  function mStats(y, m) {
    const a = new Date(y, m, 1).getTime(), b = new Date(y, m + 1, 1).getTime(), hs = hist().filter(h => h.ts >= a && h.ts < b);
    let days = 0, kc = 0, pr = 0; const nd = new Date(y, m + 1, 0).getDate(), now = Date.now();
    for (let d = 1; d <= nd; d++) { const dt = new Date(y, m, d); if (dt.getTime() > now) break; const l = store.get('food:' + fkey(dt), []); if (l.length) { const s = sumLog(l); days++; kc += s.k; pr += s.p; } }
    const wt = store.get('wt', []).slice().sort((p, q) => p.ts - q.ts), inM = wt.filter(q => q.ts >= a && q.ts < b), before = wt.filter(q => q.ts < a);
    const base = before.length ? before[before.length - 1].w : (inM.length ? inM[0].w : 0), last = inM.length ? inM[inM.length - 1].w : 0;
    return { n: hs.length, sec: hs.reduce((s, h) => s + (h.sec || 0), 0), sets: hs.reduce((s, h) => s + (h.sets || 0), 0), ton: hs.reduce((s, h) => s + (h.ton || 0), 0), kcal: days ? Math.round(kc / days) : 0, prot: days ? Math.round(pr / days) : 0, fdays: days, dw: last && base ? Math.round((last - base) * 10) / 10 : null };
  }
  const sg = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v);
  function monthData() {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + mOff); const y = d.getFullYear(), m = d.getMonth(), p = new Date(y, m - 1, 1);
    return { y, m, cur: mStats(y, m), prev: mStats(p.getFullYear(), p.getMonth()), pm: p.getMonth() };
  }
  const hrs = s => { const h = Math.floor(s / 3600), mi = Math.round(s % 3600 / 60); return h ? h + ' ч ' + mi + ' мин' : mi + ' мин'; };
  function viewMonth() {
    const D = monthData(), c = D.cur, p = D.prev;
    const row = (t, v, dv, u) => `<div class="opt"><div>${t}${p.n || p.fdays ? `<small>${dv === null ? 'в прошлом месяце: нет данных' : 'к прошлому месяцу: ' + sg(dv) + (u || '')}</small>` : ''}</div><b>${v}</b></div>`;
    view(`<div class="screen">${bar('Итоги месяца', MN[D.m] + ' ' + D.y)}
      <div class="seg wide" style="margin:0 14px 12px"><button id="mmprev">${MN[D.pm]}</button><button id="mmnext" ${mOff >= 0 ? 'disabled' : ''}>Следующий</button></div>
      <div class="grp">${row('Тренировок', c.n, c.n - p.n)}${row('Время', hrs(c.sec), Math.round((c.sec - p.sec) / 60), ' мин')}${row('Подходов', c.sets, c.sets - p.sets)}${row('Тоннаж', c.ton >= 1000 ? fmtKg(c.ton / 1000) + ' т' : c.ton + ' кг', Math.round((c.ton - p.ton) / 100) / 10, ' т')}</div>
      <div class="grp">${row('Питание, ккал в день', c.fdays ? fmt0(c.kcal) : 'нет данных', c.fdays && p.fdays ? c.kcal - p.kcal : null)}${row('Белок в день', c.fdays ? c.prot + ' г' : 'нет данных', c.fdays && p.fdays ? c.prot - p.prot : null, ' г')}${row('Вес за месяц', c.dw === null ? 'нет данных' : sg(c.dw) + ' кг', null)}</div>
      <div class="mact"><button class="big" id="mmsh">Карточка для публикации</button></div></div>`);
    $('#m3back').onclick = () => { mOff = 0; goBack('#stats'); };
    $('#mmprev').onclick = () => { mOff--; viewMonth(); }; if (mOff < 0) { $('#mmnext').onclick = () => { mOff++; viewMonth(); }; }
    $('#mmsh').onclick = () => shareMonth(D);
  }
  async function shareMonth(D) {
    const cv = document.createElement('canvas'), W = 1080, H = 1350; cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
    ctx.fillStyle = '#0b0b0c'; rr(ctx, 0, 0, W, H, 96); ctx.fill();
    ctx.save(); rr(ctx, 72, 60, 96, 96, 24); ctx.clip(); if (APPLOGO.complete && APPLOGO.naturalWidth) ctx.drawImage(APPLOGO, 72, 60, 96, 96); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = `800 66px ${FONT}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillText('ТРЕНЕР', 190, 130);
    ctx.fillStyle = 'rgba(255,255,255,.72)'; ctx.font = `500 40px ${FONT}`; ctx.fillText('Итоги месяца', 72, 230);
    ctx.fillStyle = '#fff'; ctx.font = `800 120px ${FONT}`; const mt = MN[D.m]; ctx.fillText(mt.charAt(0).toUpperCase() + mt.slice(1), 72, 360);
    const c = D.cur, items = [[String(c.n), 'тренировок'], [hrs(c.sec), 'в зале'], [String(c.sets), 'подходов'], [c.ton >= 1000 ? fmtKg(c.ton / 1000) + ' т' : c.ton + ' кг', 'тоннаж']];
    if (c.fdays) items.push([fmt0(c.kcal), 'ккал в день']); if (c.dw !== null) items.push([sg(c.dw) + ' кг', 'вес за месяц']);
    items.forEach((it, i) => { const x = 72 + (i % 2) * 480, y = 520 + Math.floor(i / 2) * 250; ctx.fillStyle = '#ff6b3d'; ctx.font = `800 96px ${FONT}`; ctx.fillText(it[0], x, y); ctx.fillStyle = 'rgba(255,255,255,.72)'; ctx.font = `500 42px ${FONT}`; ctx.fillText(it[1], x, y + 60); });
    const b = await new Promise(r => cv.toBlob(r, 'image/png')); if (!b) return; const f = new File([b], 'month.png', { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); return; } } catch (e) { return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'month.png'; document.body.appendChild(a); a.click(); a.remove();
  }
  wrapFn('viewStats', () => { const g = document.querySelector('.sgrid'); if (g && !document.querySelector('[data-go="#month"]')) g.insertAdjacentHTML('beforeend', `<button class="stile" data-go="#month"><b>Итоги месяца</b><small>сравнение с прошлым</small></button>`); });

  /* ---- ввод еды текстом ---- */
  const UNITS = [[/^(г|гр|грамм\w*)\.?$/, 1], [/^(мл|миллилитр\w*)\.?$/, 1], [/^(ст\.?\s?л\.?|столов\w*|ложк\w*)$/, 15], [/^(ч\.?\s?л\.?|чайн\w*)$/, 5], [/^(чашк\w*|стакан\w*)$/, 200], [/^(шт\.?|штук\w*|штуки|кусок|куска|кусочк\w*|ломтик\w*|долька|дольки)$/, 0]];
  const stem = w => w.length <= 4 ? w.slice(0, 3) : w.slice(0, w.length - 2);
  const nrm = s => String(s).toLowerCase().replace(/ё/g, 'е');
  function parseLine(seg) {
    let t = nrm(seg).replace(/\s+/g, ' ').trim(); if (!t) return null;
    let qty = null, unit = null; const NUMW = { пару: 2, пара: 2, полтора: 1.5, пол: 0.5, половину: 0.5, половинку: 0.5 };
    let mm = t.match(/^(\d+(?:[.,]\d+)?)\s*([а-я.]+)?\s+(.*)$/);
    if (mm) { qty = parseFloat(mm[1].replace(',', '.')); const u = UNITS.find(x => x[0].test(mm[2] || '#')); if (u) { unit = u; t = mm[3]; } else t = ((mm[2] || '') + ' ' + mm[3]).trim(); }
    else { mm = t.match(/^(.*?)\s+(\d+(?:[.,]\d+)?)\s*([а-я.]+)?$/); if (mm) { qty = parseFloat(mm[2].replace(',', '.')); const u = UNITS.find(x => x[0].test(mm[3] || '#')); t = mm[1]; if (u) unit = u; else if (mm[3]) t += ' ' + mm[3]; } }
    if (qty === null) { const w0 = t.split(' ')[0]; if (NUMW[w0] !== undefined) { qty = NUMW[w0]; t = t.split(' ').slice(1).join(' '); } }
    const words = t.split(' ').filter(w => w.length >= 3 && !/^(из|для|без|или|the)$/.test(w)); if (!words.length) return null;
    return { raw: seg.trim(), qty, unit, words };
  }
  function findFoods(words, qty) {
    const fav = store.get('ffav', []), rec = store.get('frecent', []), all = allFoods(), sts = words.map(stem);
    const tries = []; for (let n = sts.length; n >= 1; n--) tries.push(sts.slice(0, n));
    for (const ss of tries) {
      const hit = all.filter(f => { const nm = nrm(f.name).split(/[\s,()%-]+/); return ss.every(s => nm.some(w => w.startsWith(s))); });
      if (hit.length) return hit.map(f => ({ f, s: (nrm(f.name).startsWith(ss[0]) ? 0 : 5) + all.indexOf(f) / 60 + nrm(f.name).length / 80 - (fav.includes(f.id) ? 3 : 0) - (rec.includes(f.id) ? 2 : 0) + (f.d ? 1 : 0) + (qty !== null && qty < 10 && !f.u ? 4 : 0) })).sort((a, b) => a.s - b.s).slice(0, 4).map(x => x.f);
    }
    return [];
  }
  function gramsOf(p, f) {
    if (p.qty === null) return f.u ? f.u.g : 100;
    if (p.unit && p.unit[1] > 0) return p.qty * p.unit[1];
    if (p.unit && p.unit[1] === 0) return p.qty * (f.u ? f.u.g : 100);
    return p.qty >= 10 ? p.qty : p.qty * (f.u ? f.u.g : 100);
  }
  function openTextAdd() {
    const hr = new Date().getHours(), mealDef = hr < 11 ? 0 : hr < 16 ? 1 : hr < 20 ? 2 : 3;
    openSheet(`<h3>Еда текстом</h3><div class="opt"><small>Напиши, что съел, через запятую. Например: 2 яйца, тост, кофе с молоком, 150 г творога.</small></div><textarea id="mtx" class="mnote" rows="3" maxlength="300" placeholder="2 яйца, тост, кофе с молоком"></textarea><button class="big" id="mtgo">Разобрать</button>`, () => {
      $('#mtgo').onclick = () => {
        const parts = $('#mtx').value.split(/[,;\n+]|\sи\s/).map(parseLine).filter(Boolean); if (!parts.length) { $('#mtx').focus(); return; }
        const rows = parts.map(p => { const c = findFoods(p.words, p.unit ? null : p.qty); return { p, c, i: 0 }; });
        const draw = () => {
          const tot = rows.reduce((a, r) => { if (r.c.length && !r.off) { const f = r.c[r.i], g = gramsOf(r.p, f), e = foodEntry(f, g); a.k += e.k; a.p += e.p; } return a; }, { k: 0, p: 0 });
          openSheet(`<h3>Проверь список</h3><div class="grp">${rows.map((r, n) => { if (!r.c.length) return `<div class="opt"><div>${esc(r.p.raw)}<small>не нашёл в базе, можно добавить вручную позже</small></div></div>`; const f = r.c[r.i], g = gramsOf(r.p, f), e = foodEntry(f, g); return `<div class="opt ${r.off ? 'dn' : ''}"><button class="mtr" data-mtr="${n}"><b>${esc(f.name)}</b><small>${fmt0(g)} г · ${fmt0(e.k)} ккал${r.c.length > 1 ? ' · нажми, чтобы сменить' : ''}</small></button><button class="sx" data-mto="${n}" aria-label="Убрать">${r.off ? I.plus : I.close}</button></div>`; }).join('')}</div>
            <div class="opt"><small>Итого: ${fmt0(tot.k)} ккал, белок ${fmt0(tot.p)} г</small></div>
            <div class="seg wide" id="mtm">${MEALS.slice(0, 4).map((m, i) => `<button data-mm="${i}" class="${i === (rows.meal ?? mealDef) ? 'on' : ''}">${m}</button>`).join('')}</div>
            <button class="big" id="mtadd">Добавить в день</button><button class="big sec" id="mtcl">Отмена</button>`, () => {
            document.querySelectorAll('[data-mtr]').forEach(b => b.onclick = () => { const r = rows[+b.dataset.mtr]; r.i = (r.i + 1) % r.c.length; draw(); });
            document.querySelectorAll('[data-mto]').forEach(b => b.onclick = () => { const r = rows[+b.dataset.mto]; r.off = !r.off; draw(); });
            document.querySelectorAll('[data-mm]').forEach(b => b.onclick = () => { rows.meal = +b.dataset.mm; draw(); });
            $('#mtcl').onclick = closeSheet;
            $('#mtadd').onclick = () => {
              if (!fdate) fdate = fkey(new Date()); const lg = dayLog(fdate), base = Date.now(), meal = rows.meal ?? mealDef; let n = 0;
              rows.forEach(r => { if (!r.c.length || r.off) return; const f = r.c[r.i]; lg.push(Object.assign(foodEntry(f, gramsOf(r.p, f)), { id: base + '' + n + Math.floor(Math.random() * 1000), ts: base + n, meal })); pushRecent(f.id); n++; });
              saveLog(fdate, lg); closeSheet(); toast('Добавлено в день', 'продуктов: ' + n); foodRefresh();
            };
          });
        };
        draw();
      };
    });
  }

  /* ---- меню на неделю из шаблонов ---- */
  const tsum3 = t => t.items.reduce((a, e) => ({ k: a.k + (e.k || 0), p: a.p + (e.p || 0) }), { k: 0, p: 0 });
  function weekPlan() {
    const tp = store.get('ftpl', []), G = nutGoal(), shares = [[0, .25], [1, .35], [2, .30], [3, .10]], days = [];
    const last = {};
    for (let d = 0; d < 7; d++) {
      const used = new Set(), meals = [];
      shares.forEach(([m, sh]) => {
        const pool = tp.filter(t => !used.has(t.id)); if (!pool.length) return;
        const tg = G.kcal * sh, score = t => Math.abs(tsum3(t).k - tg) + (t.items[0] && t.items[0].meal === m ? 0 : tg * 1.2) - tsum3(t).p * .5 + (last[m] === t.id ? tg * .6 : 0) + ((d * 7 + m * 3) % 5) * 4 * (pool.indexOf(t) % 2);
        const t = pool.slice().sort((a, b) => score(a) - score(b))[0]; used.add(t.id); last[m] = t.id; meals.push({ m, t });
      });
      days.push(meals);
    }
    return days;
  }
  function openWeek() {
    const tp = store.get('ftpl', []);
    if (!tp.length) return openSheet('<h3>Меню на неделю</h3><div class="opt"><small>Меню собирается из твоих шаблонов. Открой приём пищи, добавь продукты и сохрани их кнопкой «Шаблоны». Лучше 4 шаблона и больше, тогда дни будут разными.</small></div><button class="big" id="wkok">Понятно</button>', () => { $('#wkok').onclick = closeSheet; });
    const pl = weekPlan(), base = new Date(), tot = {};
    pl.forEach(day => day.forEach(x => x.t.items.forEach(e => { const k = e.name; tot[k] = (tot[k] || 0) + (e.g || 0); })));
    const dl = pl.map((day, i) => { const d = new Date(base); d.setDate(d.getDate() + i); const k = day.reduce((a, x) => a + tsum3(x.t).k, 0), p = day.reduce((a, x) => a + tsum3(x.t).p, 0); return `<div class="opt"><div>${d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}<small>${day.map(x => esc(x.t.name)).join(' · ')}</small><small>${fmt0(k)} ккал · белок ${fmt0(p)} г</small></div></div>`; }).join('');
    const prod = Object.keys(tot).sort((a, b) => a.localeCompare(b, 'ru'));
    openSheet(`<h3>Меню на неделю</h3><div class="opt"><small>Собрано из твоих шаблонов под норму ${fmt0(nutGoal().kcal)} ккал в день. Ничего не добавится без твоего подтверждения.</small></div><div class="grp">${dl}</div>
      <div class="sh" style="padding-left:16px">Продукты на неделю</div><div class="grp">${prod.map(n => `<div class="opt"><div>${esc(n)}</div><b>${tot[n] ? fmt0(tot[n]) + ' г' : ''}</b></div>`).join('')}</div>
      <button class="big" id="wkshop">Продукты в список покупок</button><button class="big sec" id="wkdays">Добавить в пустые дни</button><button class="big sec" id="wkoth">Другой вариант</button><button class="big sec" id="wkcl">Закрыть</button>`, () => {
      $('#wkcl').onclick = closeSheet; $('#wkoth').onclick = () => { const a = store.get('ftpl', []); a.push(a.shift()); store.set('ftpl', a); openWeek(); };
      $('#wkshop').onclick = () => { MORE2.shopAdd(prod.map(n => n + (tot[n] ? ', ' + fmt0(tot[n]) + ' г' : ''))); closeSheet(); };
      $('#wkdays').onclick = () => {
        let nd = 0; pl.forEach((day, i) => { const d = new Date(base); d.setDate(d.getDate() + i); const k = fkey(d); if (store.get('food:' + k, []).length) return; const lg = []; let n = 0, b = d.getTime() + 8 * 3600e3; day.forEach(x => x.t.items.forEach(e => { lg.push(Object.assign({}, e, { id: b + '' + n + Math.floor(Math.random() * 1000), ts: b + n * 1000, meal: x.m })); n++; })); saveLog(k, lg); nd++; });
        closeSheet(); toast('Меню добавлено', nd ? 'дней: ' + nd : 'все дни уже заполнены'); foodRefresh();
      };
    });
  }
  wrapFn('viewFood', () => {
    if (document.querySelector('#mwmenu')) return; const a = document.querySelector('#mmenu'); if (!a) return;
    a.insertAdjacentHTML('afterend', `<button class="opt xrow" id="mwmenu"><div>Меню на неделю<small>из шаблонов, с продуктами</small></div><b>${I.r}</b></button><button class="opt xrow" id="mtxt"><div>Еда текстом<small>«2 яйца, тост, кофе»</small></div><b>${I.r}</b></button>`);
    $('#mwmenu').onclick = openWeek; $('#mtxt').onclick = openTextAdd;
  });

  document.addEventListener('click', e => { if (e.target.closest('#mfeel')) openFeel(); });
  return { viewMonth, flGet, flScore, flText };
})();
if (/^#(ex-.*|home)?$/.test(location.hash || '#')) route();

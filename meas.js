/* ---------- замеры тела ---------- */
const MEAS = [
  { k: 'neck', n: 'Шея', s: 'r', y: 62, h: 'Под кадыком, лента строго горизонтально, не стягивай.', m: [82, 118], f: [87, 113] },
  { k: 'sh', n: 'Плечи', s: 'l', y: 86, h: 'По самым широким точкам плеч, лента идёт через грудь и лопатки.', m: [42, 158], f: [47, 153] },
  { k: 'chest', n: 'Грудь', s: 'r', y: 108, h: 'На уровне сосков, на выдохе, лента ровно вокруг спины.', m: [60, 140], f: [62, 138] },
  { k: 'bicep', n: 'Бицепс', s: 'l', y: 132, h: 'В самом толстом месте плеча. Каждый раз одинаково: расслабленная или напряжённая рука.', m: [34, 58], f: [43.4, 62.6] },
  { k: 'waist', n: 'Талия', s: 'r', y: 160, h: 'В самом узком месте, на выдохе, живот не втягивай.', m: [68.5, 131.5], f: [69, 129] },
  { k: 'forearm', n: 'Предплечье', s: 'l', y: 172, h: 'В самом толстом месте предплечья, рука расслаблена.', m: [25.4, 49.4], f: [31.6, 52.4] },
  { k: 'hip', n: 'Бёдра', s: 'r', y: 206, h: 'По самым выступающим точкам ягодиц, ноги вместе.', m: [59.5, 139.5], f: [56.4, 141.2] },
  { k: 'thigh', n: 'Бедро', s: 'l', y: 250, h: 'В самом толстом месте бедра, стоя, нога расслаблена.', m: [55.5, 97.6], f: [57, 96.5] },
  { k: 'calf', n: 'Икра', s: 'l', y: 335, h: 'В самом толстом месте икры, стоя.', m: [57.5, 88.2], f: [66, 92.4] },
];
const measAll = () => store.get('meas', []).slice().sort((a, b) => a.ts - b.ts);
const measLast = k => { const l = measAll().filter(e => e.v[k] > 0); return l.length ? l[l.length - 1] : null; };
const fmtCm = v => String(Math.round(v * 10) / 10).replace('.', ',');
function measSummary() {
  const all = measAll(); if (!all.length) return 'Ещё нет замеров';
  const d = new Date(all[all.length - 1].ts);
  return 'Последний замер ' + d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}
function measSave(k, v) {
  const all = store.get('meas', []), day = dkey(Date.now());
  let e = all.find(x => dkey(x.ts) === day);
  if (!e) all.push(e = { ts: Date.now(), v: {} });
  if (v > 0) e.v[k] = v; else delete e.v[k];
  store.set('meas', all.filter(x => Object.keys(x.v).length));
}
function measChart(k) {
  const pts = measAll().filter(e => e.v[k] > 0).map(e => [e.ts, e.v[k]]); if (pts.length < 2) return '';
  const W = 320, H = 110, p = 10, xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys) - 1, y1 = Math.max(...ys) + 1;
  const X = t => p + (W - 2 * p) * (x1 === x0 ? .5 : (t - x0) / (x1 - x0)), Y = v => H - p - (H - 2 * p) * (v - y0) / (y1 - y0);
  const d = pts.map((q, i) => (i ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1)).join('');
  return `<svg class="mchart" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="none" stroke="#ff6b3d" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>${pts.map(q => `<circle cx="${X(q[0]).toFixed(1)}" cy="${Y(q[1]).toFixed(1)}" r="3" fill="#ff6b3d"/>`).join('')}<text x="${p}" y="12" fill="#8e8e93" font-size="10">${fmtCm(y1 - 1)}</text><text x="${p}" y="${H - 2}" fill="#8e8e93" font-size="10">${fmtCm(y0 + 1)}</text></svg>`;
}
function measSheet(k) {
  const M = MEAS.find(q => q.k === k), last = measLast(k), hist_ = measAll().filter(e => e.v[k] > 0).reverse();
  let v = last ? last.v[k] : (k === 'waist' ? 80 : k === 'hip' ? 95 : k === 'chest' ? 95 : k === 'sh' ? 110 : k === 'neck' ? 36 : k === 'thigh' ? 55 : k === 'calf' ? 36 : k === 'forearm' ? 26 : 32);
  openSheet(`<h3>${esc(M.n)}</h3>
    <div class="note" style="margin:0 0 12px">${esc(M.h)}</div>
    <div class="mstep"><button id="mm" aria-label="Меньше">−</button><div class="nin"><input id="mv" type="number" inputmode="decimal" step="0.5" value="${v}"><span>см</span></div><button id="mp" aria-label="Больше">+</button></div>
    ${measChart(k)}
    ${hist_.length ? `<div class="glab" style="padding-left:0">История</div>` + hist_.slice(0, 8).map((e, i) => { const prev = hist_[i + 1], dl = prev ? e.v[k] - prev.v[k] : 0; return `<div class="mhr"><span>${new Date(e.ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span><b>${fmtCm(e.v[k])} см${prev && dl ? ` <small>${dl > 0 ? '+' : '−'}${fmtCm(Math.abs(dl))}</small>` : ''}</b></div>`; }).join('') : ''}
    <button class="big" id="msave">Сохранить</button>${last ? '<button class="big sec" id="mdel">Удалить последний замер</button>' : ''}`, s => {
    const inp = $('#mv'), set = n => { v = Math.max(5, Math.round(n * 2) / 2); inp.value = v; };
    $('#mm').onclick = () => set((parseFloat(String(inp.value).replace(',', '.')) || v) - 0.5);
    $('#mp').onclick = () => set((parseFloat(String(inp.value).replace(',', '.')) || v) + 0.5);
    $('#msave').onclick = () => { const n = parseFloat(String(inp.value).replace(',', '.')); if (n > 5 && n < 300) { measSave(k, n); closeSheet(); viewMeas(); } };
    const d = $('#mdel'); if (d) d.onclick = () => { const all = store.get('meas', []), e = all.slice().sort((a, b) => b.ts - a.ts).find(x => x.v[k] > 0); if (e) { delete e.v[k]; store.set('meas', all.filter(x => Object.keys(x.v).length)); } closeSheet(); viewMeas(); };
  });
}
const MB_W = 362, MB_H = 470, FT_Y = 412, HD_Y = 6, RL_X = 270;
/* весы под ногами, в перспективе: верхняя грань трапецией, спереди табло */
function measScale() {
  const P = profile(), l = store.get('wt', []), w = l.length ? l[l.length - 1].w : P.w, y = FT_Y - 12;
  const top = `M40 ${y}H160Q168 ${y} 172 ${y + 6}L192 ${y + 28}Q194 ${y + 32} 188 ${y + 32}H12Q6 ${y + 32} 8 ${y + 28}L28 ${y + 6}Q32 ${y} 40 ${y}Z`;
  return `<g class="msc"><path d="M8 ${y + 30}H192V${y + 48}Q192 ${y + 54} 186 ${y + 54}H14Q8 ${y + 54} 8 ${y + 48}Z" fill="#2a2a2d" stroke="#555" stroke-width="1"/><path d="${top}" fill="#d9d9de" stroke="#fff" stroke-width="1"/><path d="M44 ${y + 5}H156L176 ${y + 27}H24Z" fill="#000" fill-opacity=".08"/><text x="100" y="${y + 46}" text-anchor="middle" fill="#ff6b3d" font-size="15" font-weight="600" font-family="-apple-system,Helvetica,Arial">${w ? fmtCm(w) + ' кг' : 'вес'}</text></g>`;
}
/* ростовая линейка справа */
function measRuler() {
  const P = profile(), h = P.h || 170, Y = c => FT_Y - c / h * (FT_Y - HD_Y), x = RL_X;
  let g = `<path d="M${x} ${Y(0)}V${HD_Y}" stroke="#8e8e93" stroke-width="1.4"/>`;
  for (let c = 0; Y(c) >= HD_Y - 2; c += 10) { const big = c % 50 === 0, mid = c % 20 === 0; g += `<path d="M${x} ${Y(c).toFixed(1)}h${big ? 12 : mid ? 8 : 5}" stroke="${big ? '#fff' : '#8e8e93'}" stroke-width="1.2"/>`; if (c && mid) g += `<text x="${x + 14}" y="${(Y(c) + 3).toFixed(1)}" fill="#8e8e93" font-size="8" font-family="-apple-system,Helvetica,Arial">${c}</text>`; }
  const my = Y(h);
  g += `<path d="M${x - 6} ${my.toFixed(1)}H${x + 12}" stroke="#ff6b3d" stroke-width="2.2" stroke-linecap="round"/><path d="M${x - 10} ${(my - 4).toFixed(1)}L${x - 3} ${my.toFixed(1)}L${x - 10} ${(my + 4).toFixed(1)}Z" fill="#ff6b3d"/><text x="${x + 14}" y="${(my + 14).toFixed(1)}" fill="#ff6b3d" font-size="11" font-weight="600" font-family="-apple-system,Helvetica,Arial">${fmtCm(h)}</text>`;
  return `<g class="mrl">${g}</g>`;
}
function measBmi() {
  const P = profile(), h = P.h, wl = store.get('wt', []), w = wl.length ? wl[wl.length - 1].w : P.w; if (!(h > 80 && w > 20)) return '';
  const b = w / Math.pow(h / 100, 2), cat = b < 18.5 ? 'ниже нормы' : b < 25 ? 'норма' : b < 30 ? 'выше нормы' : 'ожирение';
  const tile = (v, t) => `<div class="tile"><b>${v}</b><small>${t}</small></div>`;
  const d = P.goal > 20 ? P.goal - w : null, sg = x => (x > 0 ? '+' : x < 0 ? '−' : '') + fmtCm(Math.abs(x));
  const t0 = Date.now() - 30 * 864e5, r = wl.filter(x => x.ts >= t0);
  let pace = '', sub = 'за 30 дней';
  if (r.length > 1) { const dd = (r[r.length - 1].ts - r[0].ts) / 864e5 / 7; if (dd >= 0.5) pace = sg((r[r.length - 1].w - r[0].w) / dd); }
  return `<div class="tiles x3 mbmi"><div class="tile bmit"><button class="bmih" data-bmih aria-label="Что такое ИМТ">${I.help}</button><b>${fmtCm(b)}</b><small>ИМТ, ${cat}</small></div>${tile(d === null ? '' : (Math.abs(d) < 0.3 ? 'цель' : sg(d) + ' кг'), 'до цели')}${tile(pace ? pace + ' кг' : '', pace ? 'в неделю, ' + sub : 'нужно 2 взвешивания')}</div>`;
}
function bmiInfo() {
  const P = profile(), h = P.h, wl = store.get('wt', []), w = wl.length ? wl[wl.length - 1].w : P.w; if (!(h > 80 && w > 20)) return;
  const b = w / Math.pow(h / 100, 2), cat = b < 18.5 ? 'ниже нормы' : b < 25 ? 'в норме' : b < 30 ? 'выше нормы' : 'ожирение';
  const lo = 18.5 * Math.pow(h / 100, 2), hi = 24.9 * Math.pow(h / 100, 2), f = x => String(Math.round(x * 10) / 10).replace('.', ',');
  const why = b < 18.5 ? 'Твой вес меньше нижней границы нормы (' + f(lo) + ' кг при росте ' + h + ' см).' : b < 25 ? 'Твой вес ' + f(w) + ' кг при росте ' + h + ' см попадает в диапазон ' + f(lo) + '–' + f(hi) + ' кг. Для него индекс получается от 18,5 до 24,9, это и есть норма.' : 'Твой вес больше верхней границы нормы (' + f(hi) + ' кг при росте ' + h + ' см).';
  const row = (a, t, on) => '<div class="opt' + (on ? ' bon' : '') + '"><div>' + a + '<small>' + t + '</small></div></div>';
  openSheet('<h3>Что такое ИМТ</h3><div class="opt"><small>Индекс массы тела: вес в килограммах, делённый на рост в метрах в квадрате. Твой сейчас ' + fmtCm(b) + ', это ' + cat + '. ' + why + '</small></div><div class="grp">' + row('Меньше 18,5', 'ниже нормы', b < 18.5) + row('18,5 – 24,9', 'норма', b >= 18.5 && b < 25) + row('25 – 29,9', 'выше нормы', b >= 25 && b < 30) + row('30 и больше', 'ожирение', b >= 30) + '</div><div class="opt"><small>Зачем нужен: это быстрый ориентир, насколько вес соответствует росту, и удобно следить за динамикой. Ограничения: он не отличает мышцы от жира, поэтому у тех, кто много тренируется, индекс может быть выше нормы при низком проценте жира. Это не диагноз; смотри ещё на обхват талии, самочувствие и фото.</small></div><button class="big" id="bmix">Понятно</button>', () => { $('#bmix').onclick = closeSheet; });
}
function viewMeas() {
  const g = profile().gender === 'female' ? 'f' : 'm', all = measAll();
  const lines = MEAS.map(M => { const [a0, b0] = M[g], a = g === 'f' ? Math.round(fWarp(a0, M.y) * 10) / 10 : a0, b = g === 'f' ? Math.round(fWarp(b0, M.y) * 10) / 10 : b0, leftS = M.s === 'l', ex = leftS ? -8 : 208;
    return `<path d="M${a} ${M.y}L${b} ${M.y}" stroke="#ff6b3d" stroke-width="1.4" stroke-linecap="round"/><circle cx="${a}" cy="${M.y}" r="1.8" fill="#ff6b3d"/><circle cx="${b}" cy="${M.y}" r="1.8" fill="#ff6b3d"/><path d="M${leftS ? a : b} ${M.y}L${ex} ${M.y}" stroke="#ff6b3d" stroke-width=".6" stroke-dasharray="1.5 2.5" opacity=".7"/>`; }).join('');
  const svg = figSvg({}, 'dark', { view: 'front', sil: 1, crop: [-58, 0, MB_W, MB_H], back: measScale(), extra: lines + measRuler(), cls: 'mfig' });
  const chips = MEAS.map(M => { const l = measLast(M.k), left = M.s === 'l' ? 0.5 : 73.5;
    return `<button class="mch ${M.s}" data-m="${M.k}" style="left:${left.toFixed(2)}%;top:${(M.y / MB_H * 100).toFixed(2)}%"><small>${esc(M.n)}</small><b>${l ? fmtCm(l.v[M.k]) : '+'}</b></button>`; }).join('');
  const rows = MEAS.map(M => { const pts = all.filter(e => e.v[M.k] > 0); const l = pts[pts.length - 1], f = pts[0]; const dl = l && pts.length > 1 ? l.v[M.k] - f.v[M.k] : 0;
    return `<button class="mrow" data-m="${M.k}"><span>${esc(M.n)}</span><b>${l ? fmtCm(l.v[M.k]) + ' см' : 'добавить'}</b><small>${dl ? (dl > 0 ? '+' : '−') + fmtCm(Math.abs(dl)) : ''}</small></button>`; }).join('');
  view(`<div class="screen">
    <div class="bar"><button class="rbtn" id="mback" aria-label="Назад">${I.back}</button><h1>Замеры тела<small>${esc(measSummary())}</small></h1><span class="rbtn ghost"></span></div>
    <div class="mwrap"><div class="mbox">${svg}${chips}<button class="mhit mhw" id="mwt" aria-label="Вес"></button><button class="mhit mhh" id="mht" aria-label="Рост"></button></div></div>
    ${measBmi()}<div class="mnote"><div class="gfoot">Нажми на обхват, на весы или на линейку справа, чтобы записать значение. Измеряй утром, в одно и то же время, мягкой лентой по коже.</div><img class="tmas2" src="img/m_${tapeKey()}.webp" alt="" onerror="this.remove()"></div>
    ${XT.measLinks()}
    <div class="glab">Все замеры</div><div class="grp mlist">${rows}</div>
    <div class="gfoot">Справа от значения показано изменение с первого замера.</div>
  </div>`);
  $('#mback').onclick = () => goBack('#stats');
  document.querySelectorAll('[data-m]').forEach(b => b.onclick = () => measSheet(b.dataset.m));
  const bh = document.querySelector('[data-bmih]'); if (bh) bh.onclick = bmiInfo;
  $('#mwt').onclick = () => { const l = store.get('wt', []), cur = l.length ? l[l.length - 1].w : profile().w; weightWheel('Вес', cur, nutCfg().units || 'met', v => { const a = store.get('wt', []); a.push({ ts: Date.now(), w: v }); store.set('wt', a); const p = store.get('profile', {}); p.w = v; store.set('profile', p); viewMeas(); }); };
  $('#mht').onclick = () => { heightWheel(profile().h || 170, nutCfg().units || 'met', v => { const a = store.get('ht', []); a.push({ ts: Date.now(), h: v }); store.set('ht', a); const p = store.get('profile', {}); p.h = v; store.set('profile', p); viewMeas(); }); };
}

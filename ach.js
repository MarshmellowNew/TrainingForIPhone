/* достижения, первый запуск, офлайн */
const ACH = (() => {
  const dayKeys = () => new Set(hist().map(x => dkey(x.ts)));
  const streakBest = () => {
    const days = dayKeys(); if (!days.size) return 0; const rest = (store.get('sched', { rest: [5, 6] }).rest || []);
    const ts = [...days].map(k => new Date(k + 'T12:00:00').getTime()).sort((a, b) => a - b); let best = 1, cur = 1;
    for (let i = 1; i < ts.length; i++) {
      let d = new Date(ts[i - 1]), ok = false; for (let g = 0; g < 8; g++) { d = new Date(d.getTime() + 864e5); if (dkey(d) === dkey(ts[i])) { ok = true; break; } if (!rest.includes((d.getDay() + 6) % 7)) break; }
      cur = ok ? cur + 1 : 1; best = Math.max(best, cur);
    }
    return best;
  };
  const foodDays = () => { let n = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('tr:food:')) { const v = JSON.parse(localStorage.getItem(k) || '[]'); if (Array.isArray(v) && v.length) n++; } } } catch (e) { } return n; };
  const BADGES = [
    ['first', 'Первый шаг', 'Заверши первую тренировку', () => [hist().length, 1]],
    ['w10', 'Десятка', '10 тренировок', () => [hist().length, 10]],
    ['w50', 'Полтинник', '50 тренировок', () => [hist().length, 50]],
    ['w100', 'Сотня', '100 тренировок', () => [hist().length, 100]],
    ['s7', 'Неделя без пропусков', 'Серия 7 дней подряд', () => [streakBest(), 7]],
    ['s30', 'Месяц в ритме', 'Серия 30 дней подряд', () => [streakBest(), 30]],
    ['t10', '10 тонн', 'Суммарно поднято 10 тонн', () => [Math.round(hist().reduce((s, x) => s + (x.ton || 0), 0) / 1000), 10]],
    ['t100', '100 тонн', 'Суммарно поднято 100 тонн', () => [Math.round(hist().reduce((s, x) => s + (x.ton || 0), 0) / 1000), 100]],
    ['h10', '10 часов', '10 часов тренировок', () => [Math.round(hist().reduce((s, x) => s + x.sec, 0) / 3600), 10]],
    ['k10', '10 000 ккал', 'Сожжено 10 000 ккал', () => [hist().reduce((s, x) => s + x.kcal, 0), 10000]],
    ['early', 'Жаворонок', 'Тренировка до 7 утра', () => [hist().some(x => new Date(x.st || x.ts).getHours() < 7) ? 1 : 0, 1]],
    ['night', 'Сова', 'Тренировка после 22:00', () => [hist().some(x => new Date(x.st || x.ts).getHours() >= 22) ? 1 : 0, 1]],
    ['m1', 'Первый замер', 'Запиши любой обхват', () => [store.get('meas', []).length ? 1 : 0, 1]],
    ['mall', 'Полный замер', 'Заполни все 9 обхватов', () => { const e = {}; store.get('meas', []).forEach(x => Object.keys(x.v || {}).forEach(k => { if (x.v[k] > 0) e[k] = 1; })); return [Object.keys(e).length, 9]; }],
    ['p1', 'Первое фото', 'Добавь фото прогресса', () => [(store.get('photos', []) || []).length ? 1 : 0, 1]],
    ['f7', 'Дневник: неделя', '7 дней с записями о питании', () => [foodDays(), 7]],
    ['f30', 'Дневник: месяц', '30 дней с записями о питании', () => [foodDays(), 30]],
    ['goal', 'Цель достигнута', 'Вес в пределах 0,5 кг от желаемого', () => { const l = store.get('wt', []), g = profile().goal; return [l.length > 1 && g > 20 && Math.abs(l[l.length - 1].w - g) <= 0.5 ? 1 : 0, 1]; }],
  ];
  const state = () => BADGES.map(([id, t, d, f]) => { let v = 0, m = 1; try { [v, m] = f(); } catch (e) { } return { id, t, d, v: Math.min(v, m), m, ok: v >= m }; });
  const fb = ok => `<span class='bfb ${ok ? 'on' : ''}'><svg viewBox='0 0 24 24'><circle cx='12' cy='9' r='6'/><path d='M8.5 14l-1.5 7 5-3 5 3-1.5-7'/><path d='M12 6.2l.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1L9 8.4l2.1-.3z'/></svg></span>`;
  const icon = b => `<img data-nr="1" src="img/b/${b.id}.webp" alt="" onerror="this.outerHTML=ACH.fb(${b.ok ? 1 : 0})">`;
  const trophy = () => `<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8.5 20h7M10 17h4"/></svg>`;
  const openList = () => {
    const st = state(), n = st.filter(b => b.ok).length;
    openSheet(`<h3>Достижения</h3><div class="opt"><small>Получено ${n} из ${st.length}. Нажми на значок, чтобы увидеть условие.</small></div><div class="bgrid">${st.map(b => `<button class="bdg ${b.ok ? 'on' : ''}" data-bd="${b.id}">${icon(b)}<small>${esc(b.t)}</small></button>`).join('')}</div>`);
  };
  const html = () => '';
  const notify = () => {
    const st = state(), had = store.get('bd', null), now = st.filter(b => b.ok).map(b => b.id);
    store.set('bd', now); if (had === null) return;
    const fresh = st.filter(b => b.ok && !had.includes(b.id)); if (fresh.length && typeof toast === 'function') toast('Новое достижение', fresh.map(b => b.t).join(', '));
  };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-ach]')) { openList(); return; }
    const b = e.target.closest('[data-bd]'); if (!b) return; const x = state().find(q => q.id === b.dataset.bd); if (!x) return;
    openSheet(`<h3>${esc(x.t)}</h3><div class="bbig ${x.ok ? 'on' : ''}">${icon(x)}</div><div class="opt"><small>${esc(x.d)}</small></div><div class="opt"><div>${x.ok ? 'Получено' : 'Прогресс'}</div><b>${x.v.toLocaleString('ru-RU')} / ${x.m.toLocaleString('ru-RU')}</b></div>`);
  });

  /* первый запуск */
  function firstRun() {
    if (store.get('profile', null) !== null || store.get('intro', 0) || hist().length) return;
    let g = 'male';
    openSheet(`<h3>Давай познакомимся</h3><div class="opt"><small>Нужно для расчёта калорий и подбора программ. Потом всё можно поменять в профиле.</small></div>
      <div class="seg wide" id="fg"><button data-g="male" class="on">Парень</button><button data-g="female">Девушка</button></div>
      <div class="opt"><div>Рост</div><div class="nin"><input id="fh" type="number" inputmode="decimal" value="175"><span>см</span></div></div>
      <div class="opt"><div>Вес</div><div class="nin"><input id="fw" type="number" inputmode="decimal" value="70"><span>кг</span></div></div>
      <div class="opt"><div>Желаемый вес</div><div class="nin"><input id="fgl" type="number" inputmode="decimal" value="70"><span>кг</span></div></div>
      <button class="big" id="fok">Готово</button>`, () => {
      store.set('intro', 1);
      document.querySelectorAll('#fg [data-g]').forEach(b => b.onclick = () => { g = b.dataset.g; document.querySelectorAll('#fg [data-g]').forEach(x => x.classList.toggle('on', x === b)); });
      $('#fok').onclick = () => {
        const n = id => parseFloat(String($(id).value).replace(',', '.')), h = n('#fh'), w = n('#fw'), gl = n('#fgl');
        const p = { gender: g }; if (h > 100 && h < 250) p.h = h; if (w > 25 && w < 300) { p.w = w; store.set('wt', [{ ts: Date.now(), w }]); } if (gl > 25 && gl < 300) p.goal = gl;
        store.set('profile', Object.assign({}, PROFILE0, p)); closeSheet(); route();
      };
    });
  }

  /* офлайн */
  window.addEventListener('offline', () => { if (typeof toast === 'function') toast('Нет сети', 'тренировки и дневник работают без интернета'); });
  window.addEventListener('online', () => { if (typeof toast === 'function') toast('Сеть появилась', ''); });
  return { icon: trophy, fb, html, notify, firstRun, state, BADGES };
})();

'use strict';
/* ===== Данные тренировок =====
   EX — упражнения (gif = номер анимации в папке gif/, img = запасное бесплатное фото в img/).
   PROGRAMS — программы. day(n) возвращает тренировку для n-го дня и растёт без предела.   */

const ABS_REST = 30;                       // «Пресс» и упражнения без веса: отдых между упражнениями, сек
const DB_REST_SET = 60, DB_REST_EX = 120;  // гантели: между подходами / между упражнениями, сек

const EX = {
  // --- Без веса ---
  jack:        { name: 'Джек попрыгунчик',                gif: '3223', img: 'Star_Jump' },
  highknees:   { name: 'Бег с высоко поднятыми коленями', gif: '3221' },
  climber:     { name: 'Скалолаз',                         gif: '0630', img: 'Mountain_Climbers' },
  punch:       { name: 'Ударные скручивания',              gif: '0570' },
  hipraise:    { name: 'Подъёмы таза',                     gif: '3013' },
  bicycle:     { name: 'Велосипед',                        gif: '0003', img: 'Air_Bike' },
  crunch:      { name: 'Скручивания',                      gif: '0274', img: 'Crunches' },
  kneeelbow:   { name: 'Подъём коленей к локтю',           gif: '3221' },
  revcrunch:   { name: 'Обратные скручивания',             gif: '0872', img: 'Reverse_Crunch' },
  dblcrunch:   { name: 'Двойные скручивания',              gif: '0871', img: 'Tuck_Crunch' },
  bug:         { name: 'Жук на спине',                     gif: '0276', img: 'Dead_Bug' },
  russian:     { name: 'Русский твист',                    gif: '0687', img: 'Russian_Twist' },
  situp:       { name: 'Подъём корпуса',                   gif: '0735', img: 'Sit-Up' },
  legraise:    { name: 'Подъём ног лёжа',                  gif: '0620', img: 'Flat_Bench_Lying_Leg_Raise' },
  heel:        { name: 'Касание пяток',                    gif: '0006', img: 'Alternate_Heel_Touchers' },
  bentlegtwist:{ name: 'Твист согнутыми ногами',           gif: '3639', img: 'Oblique_Crunches_-_On_The_Floor' },
  plank:       { name: 'Планка',                           gif: '2135', img: 'Plank' },
  flutter:     { name: 'Ножницы',                          gif: '0459' },
  jackknife:   { name: 'Складка',                          gif: '0507' },
  kneetouch:   { name: 'Скручивания с касанием коленей',   gif: '3640' },
  twistleg:    { name: 'Подъём ног с поворотом',           gif: '2802' },
  splitsq:     { name: 'Выпады на месте',                  gif: '2368' },
  fwdlunge:    { name: 'Выпады вперёд',                    gif: '3470' },
  curtsy:      { name: 'Реверанс',                         gif: '3769' },
  jumpsq:      { name: 'Приседания с прыжком',             gif: '0514' },
  bridge:      { name: 'Ягодичный мостик',                 gif: '3013' },
  sbridge:     { name: 'Мостик на одной ноге',             gif: '3645' },
  calfbw:      { name: 'Подъём на носки стоя',             gif: '1373' },
  // --- Гантели ---
  bench:       { name: 'Жим лёжа на скамье',        gif: '0289', img: 'Dumbbell_Bench_Press' },
  flyes:       { name: 'Разведение лёжа на скамье', gif: '0308', img: 'Dumbbell_Flyes' },
  pullover:    { name: 'Пулловер',                  gif: '0375', img: 'Bent-Arm_Dumbbell_Pullover' },
  closepress:  { name: 'Жим лёжа узким хватом',     gif: '0296', img: 'Close-Grip_Dumbbell_Press' },
  reardelt:    { name: 'Разведение в наклоне',      gif: '0380', img: 'Seated_Bent-Over_Rear_Delt_Raise' },
  bentrow:     { name: 'Тяга в наклоне',            gif: '0293', img: 'Bent_Over_Two-Dumbbell_Row_With_Palms_In' },
  widerow:     { name: 'Широкая тяга в наклоне',    gif: '0377' },
  shrug:       { name: 'Шраги',                     gif: '0406', img: 'Dumbbell_Shrug' },
  curl:        { name: 'Подъём на бицепс',          gif: '0294', img: 'Dumbbell_Bicep_Curl' },
  hammer:      { name: 'Молот',                     gif: '0313', img: 'Hammer_Curls' },
  lyingcurl:   { name: 'Подъём на бицепс лёжа',     gif: '0374', img: 'Lying_Supine_Dumbbell_Curl' },
  kickback:    { name: 'Разгибание рук в наклоне',  gif: '0333', img: 'Tricep_Dumbbell_Kickback' },
  skull:       { name: 'Французский жим лёжа',      gif: '0351', img: 'Lying_Dumbbell_Tricep_Extension' },
  frenchpress: { name: 'Французский жим',           gif: '0430', img: 'Standing_Dumbbell_Triceps_Extension' },
  ohpress:     { name: 'Жим над головой',           gif: '0405', img: 'Dumbbell_Shoulder_Press' },
  lateral:     { name: 'Разведение в стороны',      gif: '0334', img: 'Side_Lateral_Raise' },
  arnold:      { name: 'Жим Арнольда',              gif: '2137', img: 'Arnold_Dumbbell_Press' },
  frontraise:  { name: 'Подъём перед собой',        gif: '0310', img: 'Front_Dumbbell_Raise' },
  deadlift:    { name: 'Мёртвая тяга',              gif: '0432', img: 'Stiff-Legged_Dumbbell_Deadlift' },
  lunge:       { name: 'Выпады',                    gif: '0336', img: 'Dumbbell_Lunges' },
  squat:       { name: 'Приседания',                gif: '0413', img: 'Dumbbell_Squat' },
  calf:        { name: 'Подъём на носки',           gif: '0417', img: 'Standing_Dumbbell_Calf_Raise' },
  goblet:      { name: 'Гоблет-приседания',         gif: '1760' },
  rdl:         { name: 'Румынская тяга',            gif: '1459' },
  rearlunge:   { name: 'Выпады назад',              gif: '0381' },
  bulgarian:   { name: 'Болгарские выпады',         gif: '0410' },
  sumo:        { name: 'Сумо-приседания',           gif: '0371' },
  stepup:      { name: 'Заходы на платформу',       gif: '0431' },
  sldl:        { name: 'Тяга на одной ноге',        gif: '1757' },
  // --- Ягодицы ---
  bridgemarch: { name: 'Мостик с подъёмом колен',   gif: '3561' },
  donkey:      { name: 'Махи ногой назад',          gif: '0130' },
  abduct:      { name: 'Отведение ноги в сторону',  gif: '0710' },
  sumopull:    { name: 'Сумо-тяга с гантелью',      gif: '2808' },
  // --- Растяжка (в конце каждой тренировки) ---
  st_abs:      { name: 'Растяжка пресса',            gif: '1366' },
  st_chest:    { name: 'Растяжка груди и бицепса',   gif: '1271' },
  st_lats:     { name: 'Растяжка спины',             gif: '1346' },
  st_lowback:  { name: 'Растяжка поясницы',          gif: '1363' },
  st_delts:    { name: 'Растяжка плеча',             gif: '0669' },
  st_triceps:  { name: 'Растяжка трицепса',          gif: '0643' },
  st_quads:    { name: 'Растяжка бедра спереди',     gif: '1512' },
  st_hams:     { name: 'Растяжка бедра сзади',       gif: '1511' },
  st_glutes:   { name: 'Растяжка ягодиц',            gif: '1424' },
  st_calves:   { name: 'Растяжка икр',               gif: '1377' },
};

/* ---------- подсказки по технике (показываются и озвучиваются во время упражнения) ---------- */
const TIPS = {
  jack: 'Приземляйся мягко на носки, дыши ровно, руки вытягивай полностью.',
  highknees: 'Поднимай колени до уровня таза, спина ровная, корпус не заваливай назад.',
  climber: 'Спина прямая, таз не поднимай. Колени тяни к груди по очереди, пресс напряжён.',
  punch: 'Лёжа на спине, подтягивай колени к груди и выпрямляй ноги вперёд. Поясница прижата к полу.',
  hipraise: 'В верхней точке напряги ягодицы и пресс. Поясницу не прогибай, пятки прижаты.',
  bicycle: 'Локоть тянется к противоположному колену. Поясница прижата, шею руками не тяни.',
  crunch: 'Отрывай от пола только лопатки, пресс напряжён. Выдох на подъёме, шею не тяни.',
  kneeelbow: 'Стоя, поочерёдно тяни колено к противоположному локтю. Пресс напряжён, не наклоняйся.',
  revcrunch: 'Подтягивай колени к груди, отрывая таз от пола. Без раскачки, медленно.',
  dblcrunch: 'Одновременно тяни колени и корпус друг к другу. Выдох в верхней точке.',
  bug: 'Опускай противоположные руку и ногу, поясница прижата к полу. Двигайся медленно, дыши ровно.',
  russian: 'Поворачивай корпус, а не только руки. Спина прямая, ноги можно приподнять.',
  situp: 'Поднимайся плавно, без рывка, пресс напряжён. Можно закрепить стопы.',
  legraise: 'Ноги почти прямые, поясница прижата к полу. Опускай медленно, не касаясь пола.',
  heel: 'Тянись боком к пяткам, лопатки приподняты, пресс напряжён.',
  bentlegtwist: 'Колени согнуты. Поворачивай корпус в каждую сторону, поясница прижата.',
  plank: 'Тело прямая линия. Пресс и ягодицы напряжены, поясницу не прогибай, дыши.',
  flutter: 'Ноги прямые, поочерёдно вверх и вниз. Поясница прижата к полу.',
  jackknife: 'Одновременно поднимай прямые ноги и корпус, тянись руками к стопам.',
  kneetouch: 'Тянись рукой к колену, лопатки над полом, пресс напряжён.',
  twistleg: 'Поднимай ноги и опускай их набок. Плечи прижаты к полу, не раскачивайся.',
  splitsq: 'Колено передней ноги над стопой, корпус прямой. Опускайся, пока бедро не станет параллельно полу.',
  fwdlunge: 'Шаг вперёд, колено не выходит за носок, корпус прямой. Отталкивайся пяткой.',
  curtsy: 'Заводи ногу назад по диагонали, бёдра развёрнуты вперёд. Колено не заваливай внутрь.',
  jumpsq: 'Колени в стороны по носкам. Приземляйся мягко, сразу садись в присед.',
  bridge: 'В верхней точке напряги ягодицы. Поясницу не прогибай, пятки прижаты к полу.',
  sbridge: 'Вторая нога вытянута, таз ровный, не заваливай его набок. Вверху напряги ягодицу.',
  calfbw: 'Поднимайся на носки до упора и задержись на секунду. Внизу полностью растягивай икры.',
  bench: 'Лопатки сведены, локти под углом около 45 градусов к корпусу. Внизу растяни грудь, вверху не распрямляй локти до конца.',
  flyes: 'Локти слегка согнуты и зафиксированы. Опускай до растяжения груди, не ниже уровня плеч.',
  pullover: 'Локти слегка согнуты. Опускай гантель за голову до растяжения мышц, поясницу не прогибай. Можно двумя гантелями или одной в обе руки.',
  closepress: 'Локти прижаты к корпусу, трицепс напряжён. Можно делать двумя гантелями или одной в обе руки.',
  reardelt: 'Наклонись, спина прямая. Разводи локти в стороны до линии спины, лопатки сводятся.',
  bentrow: 'Спина прямая, наклон корпуса около 45 градусов. Тяни гантели к поясу, локти идут вдоль корпуса.',
  widerow: 'Локти согнуты и разведены примерно на 45 градусов от корпуса. Тяни к нижней части груди, лопатки сводятся. Можно по очереди, опираясь свободной рукой на скамью.',
  shrug: 'Поднимай плечи к ушам, наверху задержись на секунду. Плечами не крути, руки прямые.',
  curl: 'Локти прижаты к корпусу, не раскачивайся. Внизу почти выпрямляй руку, чтобы растянуть бицепс. Локти слегка выводи вперёд только в верхней точке.',
  hammer: 'Хват нейтральный, локти прижаты к корпусу. Поднимай без раскачки.',
  lyingcurl: 'Лёжа на спине, локти прижаты к корпусу. Поднимай и медленно опускай. Можно делать и стоя.',
  kickback: 'Корпус в наклоне, локоть прижат к боку. Разгибай руку полностью, до конца, чтобы напрячь трицепс.',
  skull: 'Локти смотрят вверх и неподвижны. Опускай гантели к вискам и выпрямляй руки до конца.',
  frenchpress: 'Локти держи ближе к голове. Двигается только предплечье, внизу как следует растяни трицепс.',
  ohpress: 'Пресс и ягодицы напряжены, поясницу не прогибай. Вверху локти не выпрямляй до конца.',
  lateral: 'Локти слегка согнуты. Поднимай до уровня плеч, локти чуть выше кистей, без рывка.',
  arnold: 'Разворачивай ладони по ходу жима. Пресс напряжён, поясница не прогибается.',
  frontraise: 'Поднимай до уровня плеч, не раскачивайся. Пресс напряжён, локти чуть согнуты.',
  deadlift: 'Колени слегка согнуты, около 15 градусов, и так остаются. Спина прямая, таз назад, гантели скользят вдоль ног. Если тяжело, возьми одну гантель в обе руки.',
  lunge: 'Колено передней ноги над стопой, корпус прямой. Опускайся плавно.',
  squat: 'Колени идут по направлению носков, спина прямая, таз назад. Садись до параллели бёдер с полом.',
  calf: 'Поднимайся на носки до предела, внизу полностью растягивай икры.',
  goblet: 'Держи одну гантель двумя руками у груди, локти внутри коленей. Спина прямая.',
  rdl: 'Колени чуть согнуты, таз уходит назад, спина прямая. Чувствуй растяжение задней поверхности бедра. Если тяжело, возьми одну гантель в обе руки.',
  rearlunge: 'Шаг назад, переднее колено над стопой, корпус прямой.',
  bulgarian: 'Задняя нога на опоре, корпус слегка вперёд. Если тяжело, возьми одну гантель в обе руки.',
  sumo: 'Ноги широко, носки в стороны, колени по носкам. Если тяжело, возьми одну гантель в обе руки.',
  stepup: 'Ставь стопу на платформу целиком и вставай за счёт ноги, не отталкиваясь от пола.',
  sldl: 'Спина прямая, свободная нога идёт назад на одной линии с корпусом. Держи равновесие.',
  bridgemarch: 'Таз держи на месте и не заваливай набок. Поочерёдно поднимай колени, пресс и ягодицы напряжены.',
  donkey: 'На четвереньках поднимай согнутую ногу вверх, напрягая ягодицу. Поясницу не прогибай, корпус неподвижен.',
  abduct: 'Опора на предплечье и ногу, таз высоко. Поднимай прямую ногу вверх и медленно опускай, корпус не качай.',
  sumopull: 'Широкая стойка, гантель между ног. Таз назад, спина прямая, вставай, сжимая ягодицы. Если тяжело, возьми гантель полегче.',
  st_abs: 'Лёжа на животе, поднимись на прямых руках, таз прижат к полу. Прогибайся плавно, без боли в пояснице.',
  st_chest: 'Руки отведи назад, раскрывай грудь, плечи опущены.',
  st_lats: 'Сядь на пятки, вытяни руки вперёд и тянись грудью к полу.',
  st_lowback: 'Сидя, округли спину и тянись руками к стопам. Дыши глубоко.',
  st_delts: 'Руку веди поперёк груди и прижимай другой рукой.',
  st_triceps: 'Локоть за голову, второй рукой мягко тяни его назад.',
  st_quads: 'Пятку тяни к ягодице, колени вместе, таз подкручен.',
  st_hams: 'Нога тянется к тебе, колено почти прямое, спина не горбится.',
  st_glutes: 'Голень на колено, наклоняйся вперёд с прямой спиной.',
  st_calves: 'Пятка стоит на полу, наклоняйся к опоре.',
};
// упражнения «на каждую сторону» (говорим об этом голосом и показываем на экране)
const SIDE = new Set(['splitsq', 'fwdlunge', 'curtsy', 'sbridge', 'lunge', 'rearlunge', 'bulgarian', 'stepup', 'sldl', 'donkey', 'abduct']);
// растяжка на одну сторону: 2 шага (правая/левая)
const ST_SIDE = new Set(['st_delts', 'st_triceps', 'st_quads', 'st_hams', 'st_glutes', 'st_calves']);
// какие мышцы работают → какая растяжка
const MUSC = {
  climber: 'abs', punch: 'abs', bicycle: 'abs', crunch: 'abs', kneeelbow: 'abs', revcrunch: 'abs', dblcrunch: 'abs', bug: 'abs', russian: 'abs', situp: 'abs',
  legraise: 'abs', heel: 'abs', bentlegtwist: 'abs', plank: 'abs', flutter: 'abs', jackknife: 'abs', kneetouch: 'abs', twistleg: 'abs',
  hipraise: 'glutes', bridge: 'glutes hams', sbridge: 'glutes hams', splitsq: 'quads glutes', fwdlunge: 'quads glutes', curtsy: 'glutes quads', jumpsq: 'quads calves', calfbw: 'calves',
  bench: 'chest triceps', flyes: 'chest', pullover: 'chest lats', closepress: 'triceps chest', reardelt: 'delts lats', bentrow: 'lats', widerow: 'lats delts', shrug: 'lats',
  curl: 'chest', hammer: 'chest', lyingcurl: 'chest', kickback: 'triceps', skull: 'triceps', frenchpress: 'triceps', ohpress: 'delts', lateral: 'delts', arnold: 'delts', frontraise: 'delts',
  deadlift: 'hams lowback glutes', lunge: 'quads glutes', squat: 'quads glutes', calf: 'calves', goblet: 'quads glutes', rdl: 'hams glutes lowback', rearlunge: 'quads glutes',
  bridgemarch: 'glutes hams', donkey: 'glutes', abduct: 'glutes', sumopull: 'glutes hams lowback',
  bulgarian: 'quads glutes', sumo: 'quads glutes', stepup: 'quads glutes', sldl: 'hams glutes',
};
const ST_ORDER = ['abs', 'chest', 'lats', 'delts', 'triceps', 'lowback', 'quads', 'hams', 'glutes', 'calves'];
Object.keys(EX).forEach(k => { if (TIPS[k]) EX[k].tip = TIPS[k]; if (SIDE.has(k)) EX[k].side = true; });
const ST_SEC = 30, ST_SEC_SIDE = 25, ST_REST = 5;

/* ---------- общее: шаги и оценка времени ---------- */
// Превращает упражнения дня в плоский список шагов; rest — пауза после шага (сек).
// Правило: после подхода с гантелями — DB_REST_SET (последний подход упражнения — DB_REST_EX), после остального — ABS_REST.
function expandItems(items) {
  const out = [];
  items.forEach(it => {
    if (it.sets) it.sets.forEach((r, si) => out.push({ k: 'reps', ex: it.ex, reps: r, set: si + 1, sets: it.sets.length, db: true, def: it.weight, rest: si < it.sets.length - 1 ? DB_REST_SET : DB_REST_EX }));
    else out.push(it.time ? { k: 'time', ex: it.ex, sec: it.time, rest: ABS_REST } : { k: 'reps', ex: it.ex, reps: it.reps, rest: ABS_REST });
  });
  if (out.length) out[out.length - 1].rest = 0;
  return out;
}
// Растяжка для мышц, которые работали в этот день (в конце тренировки)
function stretchSteps(items) {
  const set = new Set(); items.forEach(it => (MUSC[it.ex] || '').split(' ').filter(Boolean).forEach(m => set.add(m)));
  const out = [];
  ST_ORDER.filter(m => set.has(m)).forEach(m => {
    const id = 'st_' + m;
    if (ST_SIDE.has(id)) ['правая сторона', 'левая сторона'].forEach(part => out.push({ k: 'time', ex: id, sec: ST_SEC_SIDE, part, stretch: true, rest: ST_REST }));
    else out.push({ k: 'time', ex: id, sec: ST_SEC, stretch: true, rest: ST_REST });
  });
  if (out.length) out[out.length - 1].rest = 0;
  return out;
}
function finishDay(items) {
  const steps = expandItems(items); let work = 0, total = 0;
  steps.forEach(s => { const w = s.k === 'time' ? s.sec : s.reps * (s.db ? 3 : 2.5); total += w + s.rest; if (!s.db) work += w; });
  const st = stretchSteps(items);
  if (st.length && steps.length) { steps[steps.length - 1].rest = 20; total += 20; st.forEach(s => { total += s.sec + s.rest; }); steps.push(...st); }
  return { items, steps, workSec: work, minutes: Math.round(total / 60) };
}
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function pick(rnd, pool, n) { const out = []; while (out.length < Math.min(n, pool.length)) { const k = pool[Math.floor(rnd() * pool.length)]; if (!out.includes(k)) out.push(k); } return out; }

/* ---------- Пресс: марафоны по 30 дней, нагрузка растёт каждый день ----------
   Марафон 1: круг из 6 упражнений ×2. Круги дней 1–7 и 27–30 перенесены со скриншотов дословно.
   Дальше каждый новый марафон добавляет упражнение в круг (до 8), с 3-го — ещё и третий круг.
   Повторения растут с каждым днём, планка +2 секунды в день.                                   */
const MARATHON = 30;
const ABS_BASE = { // повторения в день 1
  climber: 21, punch: 19, hipraise: 20, bicycle: 20, crunch: 20, kneeelbow: 20, dblcrunch: 20,
  bug: 19, russian: 19, situp: 20, legraise: 20, heel: 20, revcrunch: 19, bentlegtwist: 21,
};
const ABS_EXTRA = { flutter: 20, jackknife: 14, kneetouch: 20, twistleg: 16 }; // появляются со 2-го марафона
const ABS_GROWTH = { crunch: 9 }; // прибавка за 29 дней (по умолчанию 12)
const ABS_KNOWN = {
  1:  ['climber', 'punch', 'hipraise', 'bicycle', 'crunch', 'kneeelbow'],
  2:  ['dblcrunch', 'bug', 'russian', 'situp', 'legraise', 'heel'],
  3:  ['punch', 'revcrunch', 'legraise', 'climber', 'kneeelbow', 'hipraise'],
  4:  ['bug', 'bicycle', 'bentlegtwist', 'dblcrunch', 'situp', 'revcrunch'],
  5:  ['heel', 'bicycle', 'legraise', 'punch', 'kneeelbow', 'hipraise'],
  6:  ['situp', 'dblcrunch', 'bug', 'russian', 'revcrunch', 'climber'],
  7:  ['crunch', 'situp', 'heel', 'legraise', 'bentlegtwist', 'hipraise'],
  27: ['russian', 'hipraise', 'legraise', 'bicycle', 'climber', 'kneeelbow'],
  28: ['dblcrunch', 'revcrunch', 'punch', 'bentlegtwist', 'russian', 'crunch'],
  29: ['bug', 'heel', 'situp', 'crunch', 'kneeelbow', 'hipraise'],
  30: ['climber', 'heel', 'bug', 'situp', 'legraise', 'bicycle'],
};
function absDay(n) {
  const t = n - 1, m = Math.floor(t / MARATHON), base = Object.assign({}, ABS_BASE, m ? ABS_EXTRA : {});
  const reps = id => Math.min(50, base[id] + Math.round(t * (ABS_GROWTH[id] ?? 12) / 29));
  const circuit = m === 0 ? (ABS_KNOWN[n] || pick(mulberry32(n * 7919), Object.keys(ABS_BASE), 6)) : pick(mulberry32(n * 7919), Object.keys(base), Math.min(6 + m, 8));
  const rounds = m >= 2 ? 3 : 2, items = [{ ex: 'jack', time: 30 }, { ex: 'highknees', time: 30 }];
  for (let r = 0; r < rounds; r++) circuit.forEach(ex => items.push({ ex, reps: reps(ex) }));
  items.push({ ex: 'plank', time: Math.min(300, 60 + 2 * t) });
  return finishDay(items);
}

/* ---------- Гантели: «Полный сплит», 5 дней в неделю ----------
   Каждую неделю +1 повторение в каждом подходе (4 недели), потом новый блок: +1 подход
   (до +2) и повторения начинаются заново. В новом блоке стоит поднять вес на 2,5 кг.  */
const DB_DAYS = [
  [['bench', [12, 10, 10, 8]], ['flyes', [12, 10, 10, 8]], ['pullover', [12, 10, 10, 8]], ['closepress', [12, 10, 10, 8]]],
  [['reardelt', [12, 10, 10, 8]], ['bentrow', [12, 10, 10, 8]], ['widerow', [12, 10, 10, 8]], ['shrug', [15, 12, 12, 10]]],
  [['curl', [12, 10, 8]], ['hammer', [12, 10, 8]], ['lyingcurl', [12, 10, 8]], ['kickback', [12, 12, 10, 10]], ['skull', [12, 10, 8]], ['frenchpress', [12, 10, 8]]],
  [['ohpress', [12, 10, 10, 8]], ['lateral', [12, 10, 10, 8]], ['arnold', [12, 10, 10, 8]], ['frontraise', [12, 10, 10, 8]]],
  [['deadlift', [12, 10, 10, 8]], ['lunge', [12, 12, 10, 10]], ['squat', [12, 10, 10, 8]], ['calf', [15, 12, 12, 10]]],
];
// обёртка для программ с повторяющейся неделей: даёт номер недели и блока (4 недели)
const weekInfo = (n, perWeek) => { const w = Math.floor((n - 1) / perWeek); return { w, wk: w % 4, b: Math.floor(w / 4), i: (n - 1) % perWeek }; };
const defW = () => { try { return (JSON.parse(localStorage.getItem('tr:profile')) || {}).gender === 'female' ? 5 : 10; } catch (e) { return 10; } };
function dbItems(list, wk, b) {
  return list.map(([ex, sets]) => {
    const s = sets.slice(); for (let k = 0; k < Math.min(b, 2); k++) s.push(sets[sets.length - 1]);
    return { ex, sets: s.map(r => r + wk), weight: defW() };
  });
}
function dbDay(n) { const { wk, b, i } = weekInfo(n, 5); return finishDay(dbItems(DB_DAYS[i], wk, b)); }

/* ---------- Ноги: 3 дня в неделю, между тренировками день отдыха ----------
   День 1 — без веса (отдых как у пресса), день 2 — с гантелями (отдых как у гантелей),
   день 3 — смешанный: каждый шаг отдыхает по своему правилу.                              */
const LEG_A = [['splitsq', 12], ['fwdlunge', 12], ['curtsy', 12], ['jumpsq', 12], ['bridge', 15], ['calfbw', 20]];
const LEG_B = [['goblet', [12, 10, 10, 8]], ['rdl', [12, 10, 10, 8]], ['rearlunge', [12, 10, 10]], ['bulgarian', [10, 10, 8]], ['calf', [15, 12, 12, 10]]];
const LEG_C = [['sumo', [12, 10, 10]], ['stepup', [12, 10, 10]], ['sldl', [10, 10, 8]]];
function legsDay(n) {
  const { w, wk, b, i } = weekInfo(n, 3), up = Math.min(w, 30);
  const warm = [{ ex: 'jack', time: 30 }, { ex: 'highknees', time: 30 }];
  if (i === 0) {
    const items = warm.slice(), rounds = 2 + (b >= 2 ? 1 : 0);
    for (let r = 0; r < rounds; r++) LEG_A.forEach(([ex, base]) => items.push({ ex, reps: Math.min(60, base + up) }));
    return finishDay(items);
  }
  if (i === 1) return finishDay(dbItems(LEG_B, wk, b));
  return finishDay([...warm, ...dbItems(LEG_C, wk, b), { ex: 'sbridge', reps: Math.min(40, 12 + up) }, { ex: 'calfbw', reps: Math.min(60, 20 + up) }]);
}


/* ---------- Ягодицы: 3 дня в неделю через день (как «Ноги»: без веса / с гантелями / смешанный) ---------- */
const GL_A = [['bridgemarch', 16], ['bridge', 15], ['donkey', 12], ['abduct', 12], ['curtsy', 12], ['sbridge', 10]];
const GL_B = [['sumopull', [12, 10, 10, 8]], ['rdl', [12, 10, 10, 8]], ['bulgarian', [10, 10, 8]], ['sumo', [12, 10, 10]], ['stepup', [12, 10, 10]]];
const GL_C = [['sldl', [10, 10, 8]], ['rearlunge', [12, 10, 10]], ['sumopull', [12, 10, 10]]];
function glutesDay(n) {
  const { w, wk, b, i } = weekInfo(n, 3), up = Math.min(w, 30);
  const warm = [{ ex: 'jack', time: 30 }, { ex: 'highknees', time: 30 }];
  if (i === 0) { const items = warm.slice(), rounds = 2 + (b >= 2 ? 1 : 0); for (let r = 0; r < rounds; r++) GL_A.forEach(([ex, base]) => items.push({ ex, reps: Math.min(60, base + up) })); return finishDay(items); }
  if (i === 1) return finishDay(dbItems(GL_B, wk, b));
  return finishDay([...warm, ...dbItems(GL_C, wk, b), { ex: 'bridgemarch', reps: Math.min(40, 16 + up) }, { ex: 'donkey', reps: Math.min(40, 12 + up) }, { ex: 'abduct', reps: Math.min(40, 12 + up) }]);
}

/* ---------- программы ---------- */
const doneIn = (done, from, to) => [...done].filter(d => d >= from && d <= to).length;
const legsInfo = n => { const { w, wk, b, i } = weekInfo(n, 3); return { sub: `Через день · неделя ${w + 1}`, label: `День ${n} · ${['без веса', 'с гантелями', 'смешанный'][i]}`, note: wk === 0 && b > 0 ? 'Новый блок: подними вес на 2,5 кг' : `Блок ${b + 1}, неделя ${wk + 1} из 4` }; };
// level — сложность (1–5 молний), req — что нужно уметь и знать; stub — заглушка (программа появится позже)
const PROGRAMS = [
  { id: 'abs-new', group: 'abs', level: 1, stub: true, title: 'Новичок', card: 'в разработке',
    req: 'Подойдёт, если раньше не тренировался или был долгий перерыв. Нужно: лежать на спине, не прогибая поясницу, и держать планку хотя бы 20 секунд. Знать: выдох на усилии, шею руками не тянуть.' },
  { id: 'abs-lose', group: 'abs', level: 2, stub: true, title: 'Похудение', card: 'в разработке',
    req: 'Пресс плюс кардио-блоки для снижения веса. Нужно: без боли в спине и коленях сделать 15 скручиваний и 30 секунд бега на месте. Знать: пресс не сжигает жир только на животе, для снижения веса нужен дефицит калорий.' },
  { id: 'abs-adv', group: 'abs', level: 3, title: 'Продвинутый', day: absDay, card: 'марафоны по 30 дней',
    req: 'Нужно: уверенно делать 20 скручиваний и держать планку минуту. Знать технику: поясница прижата к полу, шея расслаблена. Ритм: 3–4 тренировки в неделю.',
    info: (n, done) => { const m = Math.floor((n - 1) / MARATHON); return { sub: `Марафон ${m + 1} · ${doneIn(done, m * MARATHON + 1, (m + 1) * MARATHON)} / ${MARATHON}`, label: `День ${n}`, note: m ? `${(n - 1) % MARATHON + 1}-й день марафона` : '' }; } },
  { id: 'abs-pro', group: 'abs', level: 4, stub: true, title: 'Опытный', card: 'в разработке',
    req: 'Нужно: планка 2 минуты, 30 подъёмов ног без рывка и опыт силовых тренировок от 6 месяцев. Знать: как держать темп и дыхание, когда пресс устал.' },
  { id: 'abs-ins', group: 'abs', level: 5, stub: true, title: 'Невероятный', card: 'в разработке',
    req: 'Нужно: планка 3 минуты и дольше, 40 подъёмов прямых ног, регулярные тренировки от года и здоровая спина. Знать: чем усталость мышц отличается от боли и когда остановиться.' },
  { id: 'db-split', group: 'db', level: 3, title: 'Полный сплит', day: dbDay, card: '5 дней в неделю',
    req: 'Нужно: знать технику базовых упражнений с гантелями (жим, тяга, приседания) и подбирать вес так, чтобы последние 2 повторения шли тяжело. Нужны гантели, лучше скамья. Ритм: 5 дней в неделю.',
    info: n => { const { w, wk, b } = weekInfo(n, 5); return { sub: `5 дней в неделю · неделя ${w + 1}`, label: `День ${n}`, note: wk === 0 && b > 0 ? `Новый блок: подними вес на 2,5 кг, подходов стало больше` : `Блок ${b + 1}, неделя ${wk + 1} из 4` }; } },
  { id: 'legs-3', group: 'legs', level: 2, title: 'Ноги', day: legsDay, card: '3 дня в неделю через день', restDays: 1,
    req: 'Нужно: приседать и делать выпады без боли в коленях, держа спину прямо. Ритм: 3 дня в неделю через день. Гантели нужны в двух из трёх дней.', info: legsInfo },
  { id: 'glutes-3', group: 'glutes', level: 2, title: 'Ягодицы', day: glutesDay, card: '3 дня в неделю через день', restDays: 1,
    req: 'Нужно: делать ягодичный мостик, напрягая ягодицы (без прогиба в пояснице), и стоять на одной ноге 20 секунд. Ритм: 3 дня в неделю через день. Гантели нужны в двух из трёх дней.', info: legsInfo },
];
const GROUPS = [{ id: 'abs', title: 'Пресс' }, { id: 'db', title: 'Гантели' }, { id: 'legs', title: 'Ноги' }, { id: 'glutes', title: 'Ягодицы' }];

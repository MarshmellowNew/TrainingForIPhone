'use strict';
/* ===== Данные тренировок =====
   EX — упражнения (gif = номер анимации в папке gif/, img = запасное бесплатное фото в img/).
   PROGRAMS — программы. day(n) возвращает тренировку для n-го дня и растёт без предела.   */

/* профиль читаем напрямую из localStorage (data.js грузится раньше app.js) */
const prof = () => { try { return JSON.parse(localStorage.getItem('tr:profile')) || {}; } catch (e) { return {}; } };
const isF = () => prof().gender === 'female';
const KREP = () => { const t = prof().test; return t && t.k ? t.k : (isF() ? 0.85 : 1); }; // множитель повторений для упражнений без веса
const sc = r => Math.max(3, Math.round(r * KREP()));
const ABS_REST = 30;                       // «Пресс» и упражнения без веса: отдых между упражнениями, сек
const DB_REST_SET = 60, DB_REST_EX = 120;  // гантели: между подходами / между упражнениями, сек

const EX = {
  // --- Зал ---
  g_squat: { name: 'Приседания со штангой', gif: '0043' },
  g_fsquat: { name: 'Фронтальные приседания', gif: '0042' },
  g_legpress: { name: 'Жим ногами', gif: '0739' },
  g_hack: { name: 'Гакк-присед в тренажёре', gif: '0743' },
  g_legext: { name: 'Разгибание ног в тренажёре', gif: '0585' },
  g_smith: { name: 'Присед в тренажёре Смита', gif: '0770' },
  g_lunge: { name: 'Выпады со штангой', gif: '0054' },
  g_rdl: { name: 'Румынская тяга', gif: '0085' },
  g_hipth: { name: 'Ягодичный мост со штангой', gif: '1409' },
  g_legcurl: { name: 'Сгибание ног лёжа', gif: '0586' },
  g_gm: { name: 'Наклоны со штангой', gif: '0044' },
  g_hipabd: { name: 'Разведение ног в тренажёре', gif: '0597' },
  g_calf: { name: 'Подъёмы на икры в тренажёре', gif: '0605' },
  g_scalf: { name: 'Подъёмы на икры сидя', gif: '0594' },
  g_bench: { name: 'Жим штанги лёжа', gif: '0025' },
  g_incl: { name: 'Жим штанги на наклонной', gif: '0047' },
  g_decl: { name: 'Жим штанги головой вниз', gif: '0033' },
  g_chestm: { name: 'Жим от груди в тренажёре', gif: '0577' },
  g_pec: { name: 'Сведение рук в тренажёре', gif: '0596' },
  g_cross: { name: 'Кроссовер на блоках', gif: '0155' },
  g_dip: { name: 'Отжимания на брусьях', gif: '0251' },
  g_dead: { name: 'Становая тяга', gif: '0032' },
  g_row: { name: 'Тяга штанги в наклоне', gif: '0027' },
  g_pulldown: { name: 'Тяга верхнего блока', gif: '2330' },
  g_cabrow: { name: 'Тяга нижнего блока', gif: '0861' },
  g_tbar: { name: 'Тяга Т-грифа', gif: '0606' },
  g_hirow: { name: 'Тяга в тренажёре', gif: '0581' },
  g_straight: { name: 'Пуловер на блоке', gif: '0238' },
  g_backext: { name: 'Разгибание спины в тренажёре', gif: '0573' },
  g_shrug: { name: 'Шраги со штангой', gif: '0095' },
  g_ohp: { name: 'Жим штанги сидя', gif: '0091' },
  g_shp: { name: 'Жим в тренажёре на плечи', gif: '0603' },
  g_upright: { name: 'Тяга штанги к подбородку', gif: '0120' },
  g_rear: { name: 'Задние дельты на блоке', gif: '0203' },
  g_curl: { name: 'Подъём штанги на бицепс', gif: '0031' },
  g_ez: { name: 'Подъём EZ-штанги на бицепс', gif: '0447' },
  g_preach: { name: 'Сгибания на скамье Скотта', gif: '0070' },
  g_cabcurl: { name: 'Подъём на бицепс на блоке', gif: '0868' },
  g_push: { name: 'Разгибание рук на блоке', gif: '0201' },
  g_skull: { name: 'Французский жим лёжа', gif: '0060' },
  g_cgbench: { name: 'Жим узким хватом', gif: '0030' },
  g_tdip: { name: 'Отжимания на трицепс в тренажёре', gif: '0591' },
  g_ohtri: { name: 'Разгибание рук из-за головы на блоке', gif: '1724' },
  g_cabcr: { name: 'Скручивания на блоке', gif: '0226' },
  g_kb: { name: 'Махи гирей', gif: '0549' },
  g_jump: { name: 'Скакалка', gif: '2612' },
  g_ropes: { name: 'Боевые канаты', gif: '0128' },
  g_farm: { name: 'Прогулка фермера', gif: '2133' },
  g_tread: { name: 'Беговая дорожка в горку', gif: '3666' },
  g_ellip: { name: 'Эллипс', gif: '2141' },
  g_bike: { name: 'Велотренажёр', gif: '2138' },
  g_goblet: { name: 'Гоблет-присед с гирей', gif: '0534' },
  // --- Без веса ---
  pullup:      { name: 'Подтягивания',                     gif: '0652' },
  scapull:     { name: 'Лопаточные подтягивания',          gif: '0688' },
  hangknee:    { name: 'Подъём коленей в висе',            gif: '0472' },
  hangleg:     { name: 'Подъём прямых ног в висе',         gif: '0475' },
  hangpike:    { name: 'Складка в висе',                   gif: '0473' },
  pushup:      { name: 'Отжимания',                        gif: '0662' },
  kneepush:    { name: 'Отжимания с колен',                gif: '3211' },
  inclpush:    { name: 'Отжимания от опоры',               gif: '0493' },
  closepush:   { name: 'Отжимания узким хватом',           gif: '0259' },
  diamond:     { name: 'Алмазные отжимания',               gif: '0283' },
  declpush:    { name: 'Отжимания ноги на опоре',          gif: '0279' },
  superman:    { name: 'Супермен',                         gif: '1352' },
  sideplank:   { name: 'Боковая планка',                   gif: '0705' },
  hyperext:    { name: 'Гиперэкстензия на скамье',         gif: '0489' },
  onerow:      { name: 'Тяга гантели одной рукой',         gif: '0292' },
  incfly:      { name: 'Разведение лёжа на наклонной',     gif: '0319' },
  incpress:    { name: 'Жим гантелей на наклонной',        gif: '0314' },
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
  jackknife:   { name: 'Уголок',                          gif: '0507' },
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
  kickback:    { name: 'Разгибание руки в наклоне',  gif: '0333', img: 'Tricep_Dumbbell_Kickback' },
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
  altcurl:     { name: 'Попеременный подъём на бицепс', gif: '0285' },
  benchrow:    { name: 'Тяга в наклоне на скамье',  gif: '0327' },
  ohext1:      { name: 'Жим гантели из-за головы одной рукой', gif: '0362' },
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
  altcurl: 'Гантели поднимай по очереди, локти прижаты к корпусу, не раскачивайся. Внизу почти выпрямляй руку для растяжения бицепса.',
  benchrow: 'Грудью упрись в наклонную скамью, шею держи ровно. Тяги к поясу, локти идут назад, лопатки сводятся. Вверху задержись на секунду.',
  ohext1: 'Локоть смотрит вверх и неподвижен. Опускай гантель за голову до растяжения трицепса и выпрямляй руку до конца. Другой рукой можно придерживать локоть.',
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
Object.assign(TIPS, {
  g_squat: 'Штанга на трапециях, не на шее. Колени идут по линии носков, спина прямая, садись до параллели бёдер с полом. Для тяжёлых весов нужна страховка.',
  g_fsquat: 'Штанга на передних дельтах, локти высоко. Корпус вертикально, садись глубоко без округления спины.',
  g_legpress: 'Поясница прижата к спинке, колени не своди и не выпрямляй до щелчка. Опускай платформу плавно.',
  g_hack: 'Спина прижата, ноги на ширине плеч. Опускайся плавно до угла 90° в коленях.',
  g_legext: 'Не раскачивайся, в верхней точке задержись на секунду. Вес выбирай так, чтобы движение было чистым.',
  g_smith: 'Ноги чуть впереди грифа, спина прямая. Тренажёр помогает держать траекторию, но колени вперёд не выносит.',
  g_lunge: 'Шаг достаточно длинный, колено передней ноги над стопой. Корпус прямо, штанга на трапециях.',
  g_rdl: 'Штанга близко к ногам, таз уходит назад, колени слегка согнуты, спина прямая. Тянись, пока не почувствуешь заднюю поверхность бедра.',
  g_hipth: 'Лопатки на скамье или лёжа на полу, штанга на бёдрах (подложи коврик). Вверху сильно напряги ягодицы, поясницу не прогибай.',
  g_legcurl: 'Таз прижат к скамье, движение плавное. Внизу не бросай вес, держи напряжение.',
  g_gm: 'Штанга на трапециях, таз назад, спина прямая. Опускай корпус до параллели с полом. Вес небольшой.',
  g_hipabd: 'Спина прижата, разводи колени плавно. Нагрузка на внешнюю часть ягодиц.',
  g_calf: 'Опускайся до растяжения, поднимайся на носки до конца. Пауза вверху секунду.',
  g_scalf: 'Колени согнуты, подъём плавный, внизу полное растяжение икры.',
  g_bench: 'Лопатки сведены, стопы на полу. Опускай штангу к нижней части груди, локти под 45°. Тяжёлый вес жми со страховкой.',
  g_incl: 'Скамья под углом 30–45°. Штанга опускается к верху груди, лопатки сведены.',
  g_decl: 'Фиксируй ноги в упорах. Опускай к низу груди, толкай без рывка. Нужна страховка.',
  g_chestm: 'Спина прижата, локти немного ниже плеч. Жми плавно, в конце руки не блокируй.',
  g_pec: 'Локти слегка согнуты, сводишь руки перед грудью и задерживаешься на секунду. Плечи не поднимай.',
  g_cross: 'Шаг вперёд, корпус чуть наклонён. Сводишь руки перед грудью по дуге, локти слегка согнуты.',
  g_dip: 'Корпус чуть наклонён вперёд для нагрузки на грудь. Опускайся до угла 90° в локтях. Если тяжело, используй гравитрон.',
  g_dead: 'Штанга над серединой стопы, спина прямая, лопатки вниз. Тяни ногами и тазом, не рывком. Тяжёлый вес без пояса не бери новичкам.',
  g_row: 'Спина ровная, корпус под углом около 45°. Тяни штангу к низу живота, локти вдоль корпуса.',
  g_pulldown: 'Тяни рукоять к верху груди, лопатки сводишь вниз. Не отклоняйся сильно назад. Хват чуть шире плеч.',
  g_cabrow: 'Спина прямая, тяни рукоять к животу, лопатки сводишь вместе. Корпус не раскачивай.',
  g_tbar: 'Корпус наклонён, спина прямая. Тяни к груди, сводя лопатки. Опускай вес под контролем.',
  g_hirow: 'Грудь прижата к упору, тяни локти назад. Внизу не отпускай лопатки полностью.',
  g_straight: 'Руки почти прямые, тяни рукоять вниз к бёдрам. Корпус немного наклонён, работает широчайшая.',
  g_backext: 'Поднимайся плавно до прямой линии, без чрезмерного прогиба. Вес небольшой.',
  g_shrug: 'Плечи поднимай вверх к ушам, не вращай. Пауза в верхней точке, руки прямые.',
  g_ohp: 'Спина прижата, штанга идёт от плеч вверх, локти чуть впереди. Поясницу не прогибай.',
  g_shp: 'Спина прижата, жми вверх без рывка, локти не блокируй полностью.',
  g_upright: 'Хват чуть уже плеч, тяни локти вверх и в стороны, штанга скользит близко к телу.',
  g_rear: 'Тяни канат к лицу, локти в стороны. Вес небольшой, движение плавное.',
  g_curl: 'Локти прижаты, плечи неподвижны. Поднимай без раскачки и опускай полностью.',
  g_ez: 'Изогнутый гриф легче для запястий. Локти прижаты, корпус не качай.',
  g_preach: 'Локти на подушке, опускай до почти прямых рук. Вес небольшой, чтобы не травмировать локоть.',
  g_cabcurl: 'Локти прижаты, движение плавное. Постоянное напряжение благодаря блоку.',
  g_push: 'Локти прижаты к корпусу, разгибай руки вниз до конца. Плечи неподвижны.',
  g_skull: 'Локти смотрят вверх и не разъезжаются. Опускай гриф ко лбу или за голову плавно.',
  g_cgbench: 'Хват на ширине плеч, локти прижаты к корпусу. Нагрузка на трицепс.',
  g_tdip: 'Корпус вертикально, локти вдоль тела. Разгибай руки до конца без рывка.',
  g_ohtri: 'Локти направлены вверх и не разъезжаются. Разгибай руки полностью.',
  g_cabcr: 'Скручивай корпус, приближая локти к бёдрам, а не тяни руками. Таз неподвижен.',
  g_kb: 'Движение идёт от таза, а не от рук. Гиря взлетает до уровня груди, спина прямая.',
  g_jump: 'Прыгай невысоко на носках, локти прижаты, запястья крутят скакалку.',
  g_ropes: 'Корпус слегка присед, чередуй руки, колебания волнами. Работает всё тело.',
  g_farm: 'Гантели в руках, плечи опущены, спина прямая. Иди ровными шагами.',
  g_tread: 'Ходьба в подъём, шаг ровный, руками не держись. Скорость комфортная, дыхание ровное.',
  g_ellip: 'Корпус прямо, плавное движение, руки и ноги работают вместе.',
  g_bike: 'Сиденье по высоте таза, ноги почти выпрямляются внизу. Держи темп.',
  g_goblet: 'Гиря у груди, локти внутри колен, спина прямая, садись глубоко.',

  pullup: 'Хват чуть шире плеч, тяни локти вниз и к корпусу, подбородок выше перекладины. Если сил мало, делай меньше повторений, но чисто. Опускайся медленно до прямых рук. Не раскачивайся.',
  scapull: 'Вис на прямых руках. Не сгибая локти, опусти плечи вниз и сведи лопатки, затем расслабь. Это основа подтягиваний.',
  hangknee: 'Вис на перекладине, подтягивай колени к груди за счёт пресса, не раскачивайся. Опускай медленно.',
  hangleg: 'Прямые ноги поднимай до уровня таза или выше, без рывка. Если тяжело, сгибай колени.',
  hangpike: 'Из виса поднимай прямые ноги до касания перекладины носками. Движение медленное, без раскачки.',
  pushup: 'Тело прямая линия, локти под углом 45° к корпусу. Опускайся до касания грудью почти пола.',
  kneepush: 'Корпус прямой от колен до головы, таз не отставляй. Опускайся медленно.',
  inclpush: 'Руки на устойчивой опоре (стол, диван). Чем ниже опора, тем тяжелее. Тело прямое.',
  closepush: 'Ладони под грудью, локти прижаты к корпусу. Основная нагрузка на трицепс.',
  diamond: 'Ладони образуют ромб под грудью. Если тяжело, делай с колен.',
  declpush: 'Ноги на опоре, тело прямое. Нагрузка уходит на верх груди и плечи.',
  superman: 'Лёжа на животе, одновременно поднимай руки и ноги, в верхней точке задержись на секунду. Шею не запрокидывай.',
  sideplank: 'Упор на предплечье, тело прямая линия, таз не проваливай. Сначала одна сторона, затем другая.',
  hyperext: 'Поднимайся до прямой линии с ногами, не прогибай поясницу сверх этого. Движение плавное.',
  onerow: 'Опора рукой о скамью, спина прямая. Тяни локоть вдоль корпуса к поясу, внизу полностью выпрямляй руку.',
  incfly: 'Лёгкие гантели, локти слегка согнуты. Разводи до растяжения груди, не опуская ниже линии плеч.',
  incpress: 'Скамья под углом 30–45°. Гантели выжимай над грудью, лопатки сведены.',
});
const SIDE = {};
['splitsq', 'fwdlunge', 'curtsy', 'sbridge', 'lunge', 'rearlunge', 'bulgarian', 'stepup', 'sldl', 'donkey', 'abduct'].forEach(k => SIDE[k] = 'ногу');
SIDE.ohext1 = 'руку'; SIDE.onerow = 'руку'; SIDE.bug = 'сторону';
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
  altcurl: 'chest', benchrow: 'lats', ohext1: 'triceps',
  bridgemarch: 'glutes hams', donkey: 'glutes', abduct: 'glutes', sumopull: 'glutes hams lowback',
  bulgarian: 'quads glutes', sumo: 'quads glutes', stepup: 'quads glutes', sldl: 'hams glutes',
};
Object.assign(MUSC, { g_squat: 'quads glutes', g_fsquat: 'quads glutes', g_legpress: 'quads glutes', g_hack: 'quads glutes', g_legext: 'quads', g_smith: 'quads glutes', g_lunge: 'quads glutes', g_rdl: 'hams glutes lowback', g_hipth: 'glutes hams', g_legcurl: 'hams', g_gm: 'hams glutes lowback', g_hipabd: 'glutes', g_calf: 'calves', g_scalf: 'calves', g_bench: 'chest triceps', g_incl: 'chest triceps', g_decl: 'chest triceps', g_chestm: 'chest triceps', g_pec: 'chest', g_cross: 'chest', g_dip: 'chest triceps', g_dead: 'hams glutes lowback lats', g_row: 'lats lowback', g_pulldown: 'lats', g_cabrow: 'lats', g_tbar: 'lats', g_hirow: 'lats', g_straight: 'lats', g_backext: 'lowback glutes', g_shrug: 'lats', g_ohp: 'delts triceps', g_shp: 'delts triceps', g_upright: 'delts lats', g_rear: 'delts lats', g_curl: 'chest', g_ez: 'chest', g_preach: 'chest', g_cabcurl: 'chest', g_push: 'triceps', g_skull: 'triceps', g_cgbench: 'triceps chest', g_tdip: 'triceps', g_ohtri: 'triceps', g_cabcr: 'abs', g_kb: 'hams glutes', g_jump: '', g_ropes: 'delts', g_farm: 'lats', g_tread: 'calves glutes', g_ellip: 'quads', g_bike: 'quads', g_goblet: 'quads glutes', pullup: 'lats', scapull: 'lats delts', hangknee: 'abs', hangleg: 'abs', hangpike: 'abs', pushup: 'chest triceps', kneepush: 'chest triceps', inclpush: 'chest triceps', closepush: 'triceps chest', diamond: 'triceps chest', declpush: 'chest delts', superman: 'lowback', sideplank: 'abs', hyperext: 'lowback glutes', onerow: 'lats', incfly: 'chest', incpress: 'chest triceps' });
const ST_ORDER = ['abs', 'chest', 'lats', 'delts', 'triceps', 'lowback', 'quads', 'hams', 'glutes', 'calves'];
Object.keys(EX).forEach(k => { if (TIPS[k]) EX[k].tip = TIPS[k]; if (SIDE[k]) EX[k].side = SIDE[k]; });
const ST_SEC = 30, ST_SEC_SIDE = 25, ST_REST = 5;

/* ---------- общее: шаги и оценка времени ---------- */
// Превращает упражнения дня в плоский список шагов; rest — пауза после шага (сек).
// Правило: после подхода с гантелями — DB_REST_SET (последний подход упражнения — DB_REST_EX), после остального — ABS_REST.
function expandItems(items) {
  const out = [];
  items.forEach(it => {
    if (it.sets) it.sets.forEach((r, si) => out.push({ k: 'reps', ex: it.ex, reps: r, set: si + 1, sets: it.sets.length, db: true, bw: it.bw, def: it.weight, rest: si < it.sets.length - 1 ? DB_REST_SET : DB_REST_EX }));
    else out.push(it.time ? { k: 'time', ex: it.ex, sec: it.time, rest: ABS_REST } : { k: 'reps', ex: it.ex, reps: it.reps, rest: it.rest || ABS_REST });
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
  items = items.map(it => it.sets ? (it.bw ? { ...it, sets: it.sets.map(sc) } : it) : it.reps ? { ...it, reps: sc(it.reps) } : (it.ex === 'plank' || it.ex === 'sideplank') ? { ...it, time: sc(it.time) } : it);
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
  [['pullup', 5], ['reardelt', [12, 10, 10, 8]], ['bentrow', [12, 10, 10, 8]], ['widerow', [12, 10, 10, 8]], ['shrug', [15, 12, 12, 10]]],
  [['pullup', 5], ['curl', [12, 10, 8]], ['hammer', [12, 10, 8]], ['lyingcurl', [12, 10, 8]], ['kickback', [12, 12, 10, 10]], ['skull', [12, 10, 8]], ['frenchpress', [12, 10, 8]]],
  [['ohpress', [12, 10, 10, 8]], ['lateral', [12, 10, 10, 8]], ['arnold', [12, 10, 10, 8]], ['frontraise', [12, 10, 10, 8]]],
  [['deadlift', [12, 10, 10, 8]], ['lunge', [12, 12, 10, 10]], ['squat', [12, 10, 10, 8]], ['calf', [15, 12, 12, 10]]],
];
// обёртка для программ с повторяющейся неделей: даёт номер недели и блока (4 недели)
const weekInfo = (n, perWeek) => { const w = Math.floor((n - 1) / perWeek); return { w, wk: w % 4, b: Math.floor(w / 4), i: (n - 1) % perWeek }; };
const defW = (base = 10) => isF() ? Math.max(2, Math.round(base * 0.5 * 2) / 2) : base; // девушкам вес гантелей вдвое меньше
const barSets = (ex, reps, n) => ({ ex, sets: Array(n).fill(reps), bw: true }); // упражнение без веса в несколько подходов (отдых как у гантелей)
function dbItems(list, wk, b, base = 10) {
  return list.flatMap(([ex, sets]) => {
    if (typeof sets === 'number') return barSets(ex, sets + Math.min(wk + 2 * b, 6), 3 + Math.min(b, 1)); // подтягивания и т.п.: одно упражнение, несколько подходов
    const s = sets.slice(); for (let k = 0; k < Math.min(b, 2); k++) s.push(sets[sets.length - 1]);
    return { ex, sets: s.map(r => r + wk), weight: defW(base) };
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


/* ---------- общий построитель круговых тренировок без веса ----------
   lists — дни по кругу; запись [упражнение, повторения] или [упражнение, секунды, 't'].
   Повторения растут на step за неделю (но не больше cap), с 3-го блока добавляется круг.            */
function bwDay(lists, n, o = {}) {
  const { w, b, i } = weekInfo(n, lists.length), up = Math.min(Math.floor(w * (o.step || 1)), o.cap || 30);
  const items = o.warm === false ? [] : [{ ex: 'jack', time: o.warm || 30 }, { ex: 'highknees', time: o.warm || 30 }];
  const rounds = (o.rounds || 2) + (b >= 2 ? 1 : 0);
  for (let r = 0; r < rounds; r++) lists[i].forEach(([ex, base, t]) => {
    if (t) { items.push({ ex, time: Math.min(o.tmax || 180, base + up * 2) }); if (ex === 'sideplank') items.push({ ex, time: Math.min(o.tmax || 180, base + up * 2) }); }
    else items.push({ ex, reps: Math.min(o.max || 60, base + up) });
  });
  return finishDay(items);
}
const wkInfo = (per, names, note) => n => { const { w, wk, b, i } = weekInfo(n, per); return { sub: `${per} дн. в неделю · неделя ${w + 1}`, label: `День ${n}${names ? ' · ' + names[i] : ''}`, note: note && wk === 0 && b > 0 ? note : `Блок ${b + 1}, неделя ${wk + 1} из 4` }; };
const NEWBLOCK = 'Новый блок: подними вес на 2,5 кг, подходов стало больше';

/* ---------- Пресс: «Похудение» (ежедневно) — кардио-интервалы между блоками пресса ---------- */
const LOSE_K = [
  [['crunch', 12], ['bicycle', 12], ['legraise', 10], ['russian', 12]],
  [['revcrunch', 10], ['heel', 12], ['kneeelbow', 12], ['dblcrunch', 10]],
  [['punch', 10], ['hipraise', 12], ['situp', 10], ['bug', 10]],
  [['bicycle', 14], ['crunch', 14], ['climber', 14], ['russian', 14]],
];
const LOSE_C = ['jack', 'highknees', 'climber', 'jumpsq'];
function absLoseDay(n) {
  const t = n - 1, j = t % 4, rounds = n > 30 ? 4 : 3, cardio = Math.min(60, 30 + Math.floor(t / 2)), up = Math.floor(t / 2);
  const items = [{ ex: 'jack', time: 30 }, { ex: 'highknees', time: 30 }];
  for (let r = 0; r < rounds; r++) {
    items.push({ ex: LOSE_C[(j + r) % 4], ...(LOSE_C[(j + r) % 4] === 'jumpsq' ? { reps: 12 + Math.min(up, 20) } : { time: cardio }) });
    LOSE_K[j].forEach(([ex, base]) => items.push({ ex, reps: Math.min(45, base + up) }));
  }
  items.push({ ex: 'plank', time: Math.min(240, 40 + t) });
  return finishDay(items);
}
/* ---------- Пресс: «Невероятный» (ежедневно) — 8 упражнений ×3 круга, планка от 3 минут ---------- */
const INS_K = [
  [['flutter', 40], ['situp', 40], ['crunch', 40], ['jackknife', 36], ['hipraise', 40], ['heel', 40], ['punch', 38], ['twistleg', 30]],
  [['legraise', 38], ['bicycle', 40], ['kneeelbow', 40], ['climber', 40], ['russian', 40], ['bug', 40], ['revcrunch', 40], ['kneetouch', 36]],
  [['hipraise', 42], ['dblcrunch', 38], ['punch', 40], ['jackknife', 38], ['bicycle', 42], ['revcrunch', 42], ['flutter', 42], ['twistleg', 32]],
  [['heel', 42], ['bug', 40], ['kneeelbow', 42], ['crunch', 42], ['russian', 42], ['legraise', 40], ['situp', 42], ['kneetouch', 38]],
];
function absInsDay(n) {
  const t = n - 1, j = t % 4, extra = Math.floor(t / 2) - Math.floor(j / 2), rounds = n > 30 ? 4 : 3;
  const items = [{ ex: 'jack', time: 45 }, { ex: 'highknees', time: 45 }];
  for (let r = 0; r < rounds; r++) INS_K[j].forEach(([ex, reps]) => items.push({ ex, reps: Math.min(100, reps + Math.max(0, extra)) }));
  items.push(barSets('hangleg', 10 + Math.min(Math.floor(t / 3), 20), 3));
  items.push({ ex: 'plank', time: Math.min(420, 180 + 5 * t) });
  items.push({ ex: 'sideplank', time: Math.min(120, 45 + t) }); items.push({ ex: 'sideplank', time: Math.min(120, 45 + t) });
  return finishDay(items);
}

/* ---------- Ноги: «Начинающий» (без веса) и «Продвинутый» (гантели тяжелее, больше подходов) ---------- */
const LEG_N = [
  [['splitsq', 8], ['fwdlunge', 8], ['bridge', 12], ['calfbw', 15]],
  [['curtsy', 8], ['jumpsq', 8], ['sbridge', 6], ['calfbw', 15]],
  [['splitsq', 10], ['bridgemarch', 12], ['fwdlunge', 10], ['calfbw', 18]],
];
const LEG_P = [
  [['goblet', [10, 8, 8, 8]], ['bulgarian', [10, 8, 8, 8]], ['rearlunge', [10, 10, 10]], ['calf', [15, 15, 12, 12]]],
  [['rdl', [10, 8, 8, 8]], ['sldl', [10, 8, 8]], ['sumo', [10, 10, 8, 8]], ['stepup', [10, 10, 10]]],
  [['squat', [12, 10, 8, 8]], ['lunge', [12, 12, 10, 10]], ['sumopull', [12, 10, 10]], ['calf', [20, 15, 15]]],
];
const legsNewDay = n => bwDay(LEG_N, n, { step: 1, cap: 25 });
const legsAdvDay = n => { const { wk, b, i } = weekInfo(n, 3); return finishDay(dbItems(LEG_P[i], wk, b, 14)); };

/* ---------- Ягодицы и кор ---------- */
const GL_N = [
  [['bridge', 12], ['donkey', 10], ['abduct', 10], ['bridgemarch', 12]],
  [['hipraise', 12], ['curtsy', 8], ['abduct', 12], ['bridge', 14]],
  [['donkey', 12], ['sbridge', 6], ['bridgemarch', 14], ['abduct', 12]],
];
const GL_P = [
  [['sumopull', [10, 8, 8, 8]], ['rdl', [10, 8, 8, 8]], ['bulgarian', [10, 8, 8, 8]], ['sldl', [10, 8, 8]]],
  [['deadlift', [10, 8, 8, 8]], ['stepup', [10, 10, 10, 10]], ['sumo', [12, 10, 10, 8]], ['rearlunge', [12, 10, 10]]],
  [['sldl', [10, 8, 8, 8]], ['sumopull', [12, 10, 10]], ['bulgarian', [10, 8, 8]], ['goblet', [12, 10, 10]]],
];
const glutesNewDay = n => bwDay(GL_N, n, { step: 1, cap: 25 });
const glutesAdvDay = n => { const { wk, b, i } = weekInfo(n, 3); return finishDay(dbItems(GL_P[i], wk, b, 14)); };
const CORE_K = [
  [['plank', 30, 't'], ['bug', 10], ['bridgemarch', 12], ['sideplank', 20, 't'], ['superman', 10]],
  [['climber', 14], ['russian', 14], ['plank', 30, 't'], ['revcrunch', 10], ['superman', 10]],
  [['hipraise', 14], ['sideplank', 20, 't'], ['bug', 12], ['bridge', 14], ['plank', 30, 't']],
];
const coreDay = n => bwDay(CORE_K, n, { step: 1, cap: 20, tmax: 120 });

/* ---------- Спина ---------- */
const BACK_N = [
  [['superman', 10], ['bridge', 12], ['bug', 8], ['plank', 25, 't']],
  [['superman', 12], ['hipraise', 12], ['bridgemarch', 12], ['sideplank', 15, 't']],
];
const BACK_D = [
  [['bentrow', [12, 10, 10]], ['onerow', [12, 10, 10]], ['reardelt', [15, 12, 12]], ['shrug', [15, 12, 12]]],
  [['widerow', [12, 10, 10]], ['pullover', [12, 10, 10]], ['rdl', [12, 10, 10]], ['onerow', [10, 10, 8]]],
];
const backNewDay = n => bwDay(BACK_N, n, { step: 1, cap: 20, tmax: 120 });
const backDbDay = n => { const { wk, b, i } = weekInfo(n, 2); return finishDay([...dbItems(BACK_D[i], wk, b, 8), { ex: 'superman', reps: 12 + Math.min(wk * 2, 8) }]); };
const backHyperDay = n => { const { w } = weekInfo(n, 3), up = Math.min(w, 20); return finishDay([{ ex: 'superman', reps: 12 + up }, { ex: 'hyperext', reps: 12 + up }, { ex: 'bridge', reps: 14 + up }, { ex: 'superman', reps: 12 + up }, { ex: 'hyperext', reps: 12 + up }, { ex: 'plank', time: Math.min(120, 40 + 2 * w) }]); };

/* ---------- Грудь ---------- */
const CHEST_N = [
  [['kneepush', 6], ['inclpush', 6], ['plank', 25, 't']],
  [['inclpush', 8], ['kneepush', 8], ['plank', 25, 't']],
  [['kneepush', 8], ['inclpush', 8], ['pushup', 3]],
];
const CHEST_A = [
  [['pushup', 15], ['closepush', 10], ['declpush', 10], ['diamond', 8]],
  [['pushup', 18], ['diamond', 10], ['inclpush', 20], ['declpush', 10]],
  [['declpush', 12], ['pushup', 16], ['closepush', 12], ['diamond', 8]],
];
const CHEST_D = [
  [['bench', [12, 10, 10]], ['incpress', [12, 10, 10]], ['flyes', [12, 12, 10]], ['pullover', [12, 10, 10]]],
  [['incpress', [12, 10, 10]], ['bench', [12, 10, 10]], ['incfly', [12, 12, 10]], ['closepress', [12, 10, 10]]],
];
const chestNewDay = n => bwDay(CHEST_N, n, { step: 0.7, cap: 14, tmax: 90, warm: 20 });
const chestAdvDay = n => bwDay(CHEST_A, n, { step: 1, cap: 25, max: 60 });
const chestDbDay = n => { const { wk, b, i } = weekInfo(n, 2); return finishDay(dbItems(CHEST_D[i], wk, b, 8)); };


/* ---------- Турник: подтягивания — одно упражнение в несколько подходов ----------
   Запись [упражнение, повторения, число подходов] — подходы с отдыхом как у гантелей; [упражнение, секунды, 't'] — время; [упражнение, повторения] — один подход. */
function setsDay(lists, n, o = {}) {
  const { w, b, i } = weekInfo(n, lists.length), up = Math.min(Math.floor(w * (o.step || 0.5)), o.cap || 8);
  const items = [{ ex: 'jack', time: 30 }, { ex: 'highknees', time: 30 }];
  lists[i].forEach(([ex, base, k]) => {
    if (k === 't') items.push({ ex, time: Math.min(o.tmax || 120, base + up * 2) });
    else if (k) items.push(barSets(ex, Math.min(o.max || 30, base + up), k + (b >= 2 ? 1 : 0)));
    else items.push({ ex, reps: Math.min(o.max || 30, base + up) });
  });
  return finishDay(items);
}
const BAR_N = [
  [['scapull', 6, 3], ['pullup', 2, 3], ['hangknee', 6, 3], ['superman', 10]],
  [['scapull', 8, 3], ['pullup', 2, 3], ['hangknee', 6, 3], ['bridge', 12]],
  [['scapull', 8, 3], ['pullup', 3, 3], ['hangknee', 8, 3], ['superman', 12]],
];
const BAR_A = [
  [['pullup', 6, 4], ['hangleg', 8, 3], ['plank', 40, 't']],
  [['pullup', 6, 4], ['hangpike', 5, 3], ['plank', 40, 't']],
  [['pullup', 6, 4], ['hangknee', 10, 3], ['plank', 40, 't']],
];
const BAR_MIX = [
  [['pullup', 6, 4]], [['pullup', 6, 4]], [['pullup', 6, 4]],
];
const BAR_DB = [
  [['bentrow', [12, 10, 10]], ['reardelt', [15, 12, 12]], ['curl', [12, 10, 10]]],
  [['onerow', [12, 10, 10]], ['pullover', [12, 10, 10]], ['hammer', [12, 10, 10]]],
  [['widerow', [12, 10, 10]], ['shrug', [15, 12, 12]], ['skull', [12, 10, 10]]],
];
const HANG_K = [
  [['hangknee', 10, 3], ['hangleg', 8, 3], ['crunch', 20], ['plank', 40, 't']],
  [['hangknee', 12, 3], ['hangpike', 6, 3], ['revcrunch', 14], ['sideplank', 25, 't']],
  [['hangleg', 10, 3], ['hangknee', 12, 3], ['russian', 20], ['plank', 40, 't']],
];
const barNewDay = n => setsDay(BAR_N, n, { step: 0.4, cap: 6, max: 14 });
const barAdvDay = n => setsDay(BAR_A, n, { step: 0.5, cap: 10, max: 25 });
const hangAbsDay = n => setsDay(HANG_K, n, { step: 0.7, cap: 12, tmax: 120, max: 30 });
function barMixDay(n) {
  const { w, wk, b, i } = weekInfo(n, 3), up = Math.min(Math.floor(w / 2), 6);
  return finishDay([{ ex: 'jack', time: 30 }, { ex: 'scapull', reps: 8 }, barSets('pullup', 6 + up, 4), ...dbItems(BAR_DB[i], wk, b, 8)]);
}

/* ---------- программы ---------- */
const doneIn = (done, from, to) => [...done].filter(d => d >= from && d <= to).length;
/* ---------- Пресс: «Начинающий» (ежедневно, дни 1–5 со скриншотов) ----------
   Круг из 5 упражнений ×2, планка +1 с в день. Повторения растут примерно на 1 раз за 2 дня.
   После 5-го дня пять кругов повторяются по порядку, а повторения продолжают расти. После 30-го дня добавляется третий круг. */
const NEW_K = [
  [['dblcrunch', 9], ['climber', 7], ['russian', 7], ['hipraise', 9], ['crunch', 8]],
  [['revcrunch', 8], ['bicycle', 8], ['kneeelbow', 8], ['bug', 7], ['heel', 8]],
  [['dblcrunch', 10], ['climber', 8], ['crunch', 9], ['situp', 7], ['russian', 8]],
  [['kneeelbow', 9], ['heel', 9], ['legraise', 9], ['situp', 8], ['hipraise', 10]],
  [['crunch', 10], ['climber', 9], ['russian', 9], ['heel', 10], ['kneeelbow', 10]],
];
function absNewDay(n) {
  const t = n - 1, j = t % 5, extra = Math.floor(t / 2) - Math.floor(j / 2), rounds = n > 30 ? 3 : 2;
  const items = [{ ex: 'jack', time: 20 }, { ex: 'highknees', time: 20 }];
  for (let r = 0; r < rounds; r++) NEW_K[j].forEach(([ex, reps]) => items.push({ ex, reps: Math.min(40, reps + Math.max(0, n > 5 ? extra : 0)) }));
  items.push({ ex: 'plank', time: Math.min(180, 30 + t) });
  return finishDay(items);
}
/* ---------- Пресс: «Опытный» (ежедневно, дни 1–4 со скриншотов) ----------
   Круг из 7 упражнений ×2, планка с 2:00 и +4 с в день, повторения растут на 1 раз за 2 дня. */
const PRO_K = [
  [['flutter', 32], ['situp', 32], ['crunch', 33], ['jackknife', 31], ['hipraise', 33], ['heel', 33], ['punch', 31]],
  [['legraise', 31], ['bicycle', 31], ['kneeelbow', 32], ['climber', 31], ['russian', 32], ['bug', 32], ['revcrunch', 33]],
  [['hipraise', 34], ['dblcrunch', 31], ['punch', 32], ['jackknife', 32], ['bicycle', 32], ['revcrunch', 34], ['flutter', 33]],
  [['heel', 34], ['bug', 33], ['kneeelbow', 33], ['crunch', 34], ['russian', 33], ['legraise', 32], ['situp', 33]],
];
function absProDay(n) {
  const t = n - 1, j = t % 4, extra = Math.floor(t / 2) - Math.floor(j / 2), rounds = n > 30 ? 3 : 2;
  const items = [{ ex: 'jack', time: 40 }, { ex: 'highknees', time: 40 }];
  for (let r = 0; r < rounds; r++) PRO_K[j].forEach(([ex, reps]) => items.push({ ex, reps: Math.min(80, reps + Math.max(0, n > 4 ? extra : 0)) }));
  items.push(barSets('hangknee', 8 + Math.min(Math.floor(t / 3), 12), 2));
  items.push({ ex: 'plank', time: Math.min(300, 120 + 4 * t) });
  return finishDay(items);
}

/* ---------- Гантели: «Начинающий», «Сброс вес» (ежедневно) и «Всё тело» (3 дня в неделю) ----------
   Списки со скриншотов — это неделя 1. Далее каждую неделю +1 повторение, раз в 4 недели добавляется подход (до +2). */
const DB_NEW = [['frenchpress', [12, 12]], ['ohpress', [12, 12]], ['lateral', [12, 12]], ['altcurl', [12, 12]], ['squat', [10, 10]], ['calf', [15, 15]]];
const DB_LOSE = [['lunge', [12, 12, 12]], ['squat', [10, 10, 10]], ['reardelt', [15, 15, 15]], ['flyes', [15, 15, 15]], ['bench', [15, 15, 15]], ['lateral', [12, 12, 12]], ['ohpress', [15, 15, 15]], ['curl', [12, 12, 12]], ['frenchpress', [12, 12, 12]], ['calf', [20, 20, 20]]];
const DB_ALL = [
  [['bench', [12, 12, 12]], ['flyes', [12, 12, 12]], ['lunge', [12, 12, 12, 12]], ['curl', [12, 12, 12]], ['hammer', [12, 12, 12]], ['squat', [10, 10, 10]], ['frenchpress', [12, 12, 12]]],
  [['pullup', 5], ['ohpress', [12, 12, 12]], ['bentrow', [12, 12, 12]], ['lateral', [10, 10, 10]], ['arnold', [12, 12, 12]], ['benchrow', [12, 12, 12, 12]], ['frontraise', [10, 10, 10]], ['shrug', [15, 15, 15]]],
  [['bench', [12, 12, 12]], ['skull', [12, 12, 12]], ['squat', [10, 10, 10]], ['kickback', [12, 12, 12, 12]], ['altcurl', [12, 12, 12]], ['ohext1', [12, 12, 12, 12]], ['pullup', 4], ['calf', [15, 15, 15]]],
];
const dbNewDay = n => { const { wk, b } = weekInfo(n, 7); return finishDay(dbItems(DB_NEW, wk, b, 6)); };
const dbLoseDay = n => { const { wk, b } = weekInfo(n, 7); return finishDay(dbItems(DB_LOSE, wk, b, 5)); };
const dbAllDay = n => { const { wk, b, i } = weekInfo(n, 3); return finishDay(dbItems(DB_ALL[i], wk, b, 8)); };
const dailyInfo = n => { const { w, wk, b } = weekInfo(n, 7); return { sub: `Ежедневно · неделя ${w + 1}`, label: `День ${n}`, note: wk === 0 && b > 0 ? 'Новый блок: подними вес на 2,5 кг, подходов стало больше' : `Блок ${b + 1}, неделя ${wk + 1} из 4` }; };
const absDailyInfo = n => ({ sub: `Ежедневно · день ${n}`, label: `День ${n}`, note: '' });

const legsInfo = n => { const { w, wk, b, i } = weekInfo(n, 3); return { sub: `Через день · неделя ${w + 1}`, label: `День ${n} · ${['без веса', 'с гантелями', 'смешанный'][i]}`, note: wk === 0 && b > 0 ? 'Новый блок: подними вес на 2,5 кг' : `Блок ${b + 1}, неделя ${wk + 1} из 4` }; };
// level — сложность (1–5 молний), req — что нужно уметь и знать; stub — заглушка (программа появится позже)
const PROGRAMS = [
  { id: 'abs-new', group: 'abs', level: 1, title: 'Начинающий', day: absNewDay, card: 'ежедневно, около 10 минут', info: absDailyInfo,
    req: 'Подойдёт, если раньше не тренировался или был долгий перерыв. Нужно: лежать на спине, не прогибая поясницу, и держать планку хотя бы 20 секунд. Знать: выдох на усилии, шею руками не тянуть.' },
  { id: 'abs-lose', group: 'abs', level: 2, title: 'Похудение', day: absLoseDay, card: 'ежедневно, кардио + пресс', info: absDailyInfo,
    req: 'Пресс плюс кардио-блоки для снижения веса. Нужно: без боли в спине и коленях сделать 15 скручиваний и 30 секунд бега на месте. Знать: пресс не сжигает жир только на животе, для снижения веса нужен дефицит калорий.' },
  { id: 'abs-adv', group: 'abs', level: 3, title: 'Продвинутый', day: absDay, card: 'марафоны по 30 дней',
    req: 'Нужно: уверенно делать 20 скручиваний и держать планку минуту. Знать технику: поясница прижата к полу, шея расслаблена. Ритм: 3–4 тренировки в неделю.',
    info: (n, done) => { const m = Math.floor((n - 1) / MARATHON); return { sub: `Марафон ${m + 1} · ${doneIn(done, m * MARATHON + 1, (m + 1) * MARATHON)} / ${MARATHON}`, label: `День ${n}`, note: m ? `${(n - 1) % MARATHON + 1}-й день марафона` : '' }; } },
  { id: 'abs-pro', group: 'abs', level: 4, title: 'Опытный', day: absProDay, card: 'ежедневно, около 27 минут', info: absDailyInfo,
    req: 'Нужно: турник (в конце подъёмы коленей в висе), планка 2 минуты, 30 подъёмов ног без рывка и опыт силовых тренировок от 6 месяцев. Знать: как держать темп и дыхание, когда пресс устал.' },
  { id: 'abs-ins', group: 'abs', level: 5, title: 'Невероятный', day: absInsDay, card: 'ежедневно, около 65 минут', info: absDailyInfo,
    req: 'Нужно: турник (в конце подъёмы прямых ног в висе), планка 3 минуты и дольше, 40 подъёмов прямых ног, регулярные тренировки от года и здоровая спина. Знать: чем усталость мышц отличается от боли и когда остановиться.' },
  { id: 'db-new', group: 'db', level: 1, title: 'Начинающий', day: dbNewDay, card: 'ежедневно, около 30 минут', info: dailyInfo,
    req: 'Подойдёт, если с гантелями ещё не занимался. Нужно: подобрать вес, с которым последние 2 повторения даются с усилием, и знать технику приседа. Нужны лёгкие гантели.' },
  { id: 'db-lose', group: 'db', level: 2, title: 'Сброс вес', day: dbLoseDay, card: 'ежедневно, около 65 минут', info: dailyInfo,
    req: 'Лёгкие гантели, много повторений, без пауз внимания. Нужно: делать приседы и выпады без боли в коленях. Знать: для снижения веса нужен дефицит калорий, тренировки его поддерживают. Нужны гантели и скамья.' },
  { id: 'db-all', group: 'db', level: 2, title: 'Всё тело', day: dbAllDay, card: '3 дня в неделю', info: n => { const { w, wk, b, i } = weekInfo(n, 3); return { sub: `3 дня в неделю · неделя ${w + 1}`, label: `День ${n} · ${['грудь и руки', 'плечи и спина', 'руки и грудь'][i]}`, note: wk === 0 && b > 0 ? 'Новый блок: подними вес на 2,5 кг, подходов стало больше' : `Блок ${b + 1}, неделя ${wk + 1} из 4` }; },
    req: 'Нужно: турник (подтягивания по 5 раз), знать технику базовых упражнений с гантелями (жим, тяга, присед) и 3 раза в неделю уделять тренировке около 45 минут. Нужны гантели, скамья и турник.' },
  { id: 'db-split', group: 'db', level: 3, title: 'Полный сплит', day: dbDay, card: '5 дней в неделю',
    req: 'Нужно: турник для подтягиваний в дни спины и рук (5 подтягиваний подряд), знать технику базовых упражнений с гантелями (жим, тяга, приседания) и подбирать вес так, чтобы последние 2 повторения шли тяжело. Нужны гантели, лучше скамья. Ритм: 5 дней в неделю.',
    info: n => { const { w, wk, b } = weekInfo(n, 5); return { sub: `5 дней в неделю · неделя ${w + 1}`, label: `День ${n}`, note: wk === 0 && b > 0 ? `Новый блок: подними вес на 2,5 кг, подходов стало больше` : `Блок ${b + 1}, неделя ${wk + 1} из 4` }; } },
  { id: 'legs-3', group: 'legs', level: 2, title: 'Ноги', day: legsDay, card: '3 дня в неделю через день', restDays: 1,
    req: 'Нужно: приседать и делать выпады без боли в коленях, держа спину прямо. Ритм: 3 дня в неделю через день. Гантели нужны в двух из трёх дней.', info: legsInfo },
  { id: 'glutes-3', group: 'glutes', level: 2, title: 'Ягодицы', day: glutesDay, card: '3 дня в неделю через день', restDays: 1,
    req: 'Нужно: делать ягодичный мостик, напрягая ягодицы (без прогиба в пояснице), и стоять на одной ноге 20 секунд. Ритм: 3 дня в неделю через день. Гантели нужны в двух из трёх дней.', info: legsInfo },

  { id: 'legs-new', group: 'legs', level: 1, title: 'Ноги: начинающий', day: legsNewDay, card: '3 дня, без веса', restDays: 1, info: wkInfo(3, ['выпады', 'реверанс и прыжки', 'мостики'], ''),
    req: 'Подойдёт, если раньше не тренировал ноги. Нужно: приседать без боли в коленях. Ничего, кроме коврика, не нужно. Ритм: 3 дня в неделю через день.' },
  { id: 'legs-adv', group: 'legs', level: 4, title: 'Ноги: продвинутый', day: legsAdvDay, card: '3 дня, тяжёлые гантели', restDays: 1, info: wkInfo(3, ['квадрицепс', 'задняя поверхность', 'всё вместе'], NEWBLOCK),
    req: 'Нужно: уверенная техника приседа, выпада и румынской тяги, колени и спина без боли, опыт с гантелями от 3 месяцев. Гантели тяжёлые, подбери вес, при котором последние повторения идут с усилием.' },
  { id: 'glutes-new', group: 'glutes', level: 1, title: 'Ягодицы: начинающий', day: glutesNewDay, card: '3 дня, без веса', restDays: 1, info: wkInfo(3, null, ''),
    req: 'Подойдёт, если никогда не качал ягодицы. Нужно: лежать на спине и поднимать таз без боли в пояснице. Нужен только коврик.' },
  { id: 'glutes-adv', group: 'glutes', level: 4, title: 'Ягодицы: продвинутый', day: glutesAdvDay, card: '3 дня, тяжёлые гантели', restDays: 1, info: wkInfo(3, ['тяга и выпады', 'становая и ступеньки', 'один вес на ногу'], NEWBLOCK),
    req: 'Нужно: чувствовать ягодицы в мостике, держать равновесие на одной ноге, знать технику румынской тяги. Опыт с гантелями от 3 месяцев.' },
  { id: 'core', group: 'glutes', level: 2, title: 'Кор', day: coreDay, card: '3 дня в неделю', info: wkInfo(3, ['планка и жук', 'скалолаз и твист', 'мостики и планка'], ''),
    req: 'Кор — глубокие мышцы живота, поясницы и ягодиц, они держат корпус. Нужно: планка хотя бы 20 секунд. Знать: не прогибай поясницу, дыши ровно.' },
  { id: 'back-new', group: 'back', level: 1, title: 'Начинающий', day: backNewDay, card: '3 дня, без веса', info: wkInfo(2, ['спина и мостик', 'супермен и мостики'], ''),
    req: 'Укрепление мышц спины без снарядов: поясница, ягодицы и мышцы вдоль позвоночника. Нужно: коврик. Ритм: через день. Если боль в позвоночнике, лучше сначала к врачу.' },
  { id: 'back-hyper', group: 'back', level: 2, title: 'Спина и поясница', day: backHyperDay, card: '3 дня в неделю', restDays: 1,
    info: n => { const { w } = weekInfo(n, 3); return { sub: `Через день · неделя ${w + 1}`, label: `День ${n}`, note: '' }; },
    req: 'Нужно: скамья или устойчивая опора для гиперэкстензии. Подъёмы делай плавно, без рывка и без чрезмерного прогиба. Подойдёт, когда суперmен на полу даётся легко.' },
  { id: 'back-db', group: 'back', level: 3, title: 'Гантели', day: backDbDay, card: '2 дня по кругу', info: wkInfo(2, ['тяги', 'ширина и низ'], NEWBLOCK),
    req: 'Нужно: гантели и скамья, спина ровная в наклоне, знание техники тяги. Тяни локтями, а не кистями. Ритм: 3–4 раза в неделю.' },
  { id: 'chest-new', group: 'chest', level: 1, title: 'Начинающий', day: chestNewDay, card: '3 дня в неделю, с колен', info: wkInfo(3, null, ''),
    req: 'Подойдёт, если не можешь отжаться 10 раз. Нужно: коврик и устойчивая опора (стол, диван). Знать: тело прямое, локти под углом 45°.' },
  { id: 'chest-adv', group: 'chest', level: 3, title: 'Отжимания', day: chestAdvDay, card: '3 дня, разные хваты', info: wkInfo(3, ['классика и ромб', 'ромб и опора', 'ноги на опоре'], ''),
    req: 'Нужно: уметь отжаться 12–15 раз подряд с прямым корпусом. Хваты меняются каждый день, чтобы нагрузка шла на разные части груди и трицепс.' },
  { id: 'chest-db', group: 'chest', level: 3, title: 'Гантели', day: chestDbDay, card: '2 дня по кругу', info: wkInfo(2, ['жим', 'наклонная'], NEWBLOCK),
    req: 'Нужно: гантели и скамья, лучше с регулировкой угла. Знать технику жима и разведения, сводить лопатки. Ритм: 2–3 раза в неделю.' },

  { id: 'back-bar-new', group: 'back', level: 2, title: 'Турник: начинающий', day: barNewDay, card: '3 дня, лопаточные', info: wkInfo(3, null, ''),
    req: 'Нужен турник. Если ещё не подтягиваешься, оставляй в подтягиваниях по 1–2 повторения или пропускай их, начни с лопаточных подтягиваний в висе, они готовят спину и плечи. Нужно: уверенно висеть на перекладине 20–30 секунд.' },
  { id: 'back-bar', group: 'back', level: 4, title: 'Турник', day: barAdvDay, card: '3 дня, 4 подхода', info: wkInfo(3, ['с планкой', 'складка', 'колени'], ''),
    req: 'Нужно: турник и 5–8 подтягиваний подряд. Подтягивания 4 подхода, в конце пресс в висе. Отдыхай между подходами полностью.' },
  { id: 'back-mix', group: 'back', level: 4, title: 'Турник + гантели', day: barMixDay, card: '3 дня в неделю', info: wkInfo(3, ['тяга и бицепс', 'пуловер и молот', 'тяга и трицепс'], NEWBLOCK),
    req: 'Нужно: турник, гантели, скамья и 5 подтягиваний подряд. Сначала подтягивания, затем тяги с гантелями. Вес гантелей выбирай так, чтобы последние повторения шли с усилием.' },
  { id: 'abs-bar', group: 'abs', level: 4, title: 'Турник', day: hangAbsDay, card: '3 дня, пресс в висе', info: wkInfo(3, ['колени и ноги', 'складка', 'прямые ноги'], ''),
    req: 'Нужен турник и сильный хват: вис 30 секунд. Подъёмы в висе нагружают нижний пресс. Делай без раскачки, плечи в висе не поднимай к ушам.' },
];

/* ---------- Зал: 5 уровней × 2 / 3 / 5 тренировок в неделю ----------
   Типы упражнений: B штанга, M тренажёр или блок, D гантели, K гиря, W свой вес (подходы), T время.
   Веса считаются от «среднего» мужского веса; уровень множит его, для девушек вес вдвое меньше.
   Каждую неделю +1 повторение, раз в 4 недели добавляется подход (до +2) и вес растёт.            */
const GYMW = {
  g_squat: [60, 'B'], g_fsquat: [45, 'B'], g_legpress: [120, 'M'], g_hack: [70, 'M'], g_legext: [40, 'M', 1], g_smith: [50, 'M'], g_lunge: [35, 'B'],
  g_rdl: [60, 'B'], g_hipth: [70, 'B'], g_legcurl: [35, 'M', 1], g_gm: [35, 'B'], g_hipabd: [35, 'M', 1], g_calf: [60, 'M', 1], g_scalf: [40, 'M', 1],
  g_bench: [60, 'B'], g_incl: [50, 'B'], g_decl: [50, 'B'], g_chestm: [45, 'M'], g_pec: [35, 'M', 1], g_cross: [15, 'M', 1], incpress: [24, 'D'], g_dip: [0, 'W'],
  g_dead: [80, 'B'], g_row: [50, 'B'], g_pulldown: [50, 'M'], g_cabrow: [45, 'M'], g_tbar: [40, 'M'], g_hirow: [40, 'M'], g_straight: [25, 'M', 1], g_backext: [40, 'M', 1], g_shrug: [50, 'B', 1], onerow: [26, 'D'], pullup: [0, 'W'],
  g_ohp: [35, 'B'], g_shp: [30, 'M'], g_upright: [30, 'B', 1], g_rear: [15, 'M', 1], lateral: [10, 'D', 1], reardelt: [10, 'D', 1],
  g_curl: [30, 'B', 1], g_ez: [25, 'B', 1], g_preach: [20, 'B', 1], g_cabcurl: [20, 'M', 1], hammer: [14, 'D', 1],
  g_push: [25, 'M', 1], g_skull: [25, 'B', 1], g_cgbench: [45, 'B'], g_tdip: [30, 'M'], g_ohtri: [20, 'M', 1],
  g_cabcr: [30, 'M', 1], hangknee: [0, 'W'], hangleg: [0, 'W'], russian: [0, 'W'], revcrunch: [0, 'W'],
  g_kb: [16, 'K'], g_goblet: [16, 'K'], g_jump: [60, 'T'], g_ropes: [30, 'T'], g_farm: [40, 'T'],
  g_tread: [300, 'T'], g_ellip: [300, 'T'], g_bike: [300, 'T'],
};
Object.keys(GYMW).forEach(k => { if (EX[k] && 'BMK'.includes(GYMW[k][1])) EX[k].one = true; }); // вес одного снаряда, в тоннаже не удваивается
const GYM_POOL = {
  quads: ['g_squat', 'g_legpress', 'g_lunge', 'g_legext', 'g_hack', 'g_fsquat', 'g_smith', 'g_goblet'],
  hams: ['g_rdl', 'g_hipth', 'g_legcurl', 'g_gm', 'g_hipabd'],
  calves: ['g_calf', 'g_scalf'],
  chest: ['g_bench', 'g_incl', 'g_chestm', 'g_pec', 'g_dip', 'g_cross', 'incpress', 'g_decl'],
  back: ['g_row', 'g_pulldown', 'g_cabrow', 'pullup', 'g_tbar', 'g_hirow', 'onerow', 'g_straight', 'g_dead'],
  shoulders: ['g_ohp', 'g_shp', 'lateral', 'g_rear', 'g_upright', 'reardelt'],
  biceps: ['g_curl', 'g_cabcurl', 'g_ez', 'hammer', 'g_preach'],
  triceps: ['g_push', 'g_cgbench', 'g_skull', 'g_ohtri', 'g_tdip'],
  abs: ['g_cabcr', 'hangknee', 'russian', 'hangleg', 'revcrunch'],
  cond: ['g_kb', 'g_ropes', 'g_jump', 'g_farm'],
};
const GYM_LM = [0.45, 0.65, 0.85, 1.05, 1.3];
const GYM_COMP = [[12, 12, 12], [12, 10, 10], [10, 10, 8, 8], [10, 8, 8, 6], [8, 6, 6, 5, 5]];
const GYM_ISO = [[15, 15, 12], [15, 12, 12], [12, 12, 10], [12, 12, 10, 10], [12, 10, 10, 8]];
const GYM_BW = [[6, 3], [8, 3], [10, 3], [12, 4], [15, 4]]; // свой вес: повторения, подходы
function gymWeight(ex, L) {
  const [base, t] = GYMW[ex], f = isF() ? 0.5 : 1, min = t === 'B' ? (isF() ? 15 : 20) : t === 'D' ? 2 : 5;
  return Math.max(min, Math.round(base * GYM_LM[L - 1] * f / 2.5) * 2.5);
}
function gymBlock(spec, L, wk, b, off) {
  const items = [];
  spec.forEach(([m, cnt]) => {
    const k = cnt[L - 1] || 0, pool = GYM_POOL[m];
    for (let j = 0; j < k; j++) {
      const ex = pool[(off + j) % pool.length], [, t, iso] = GYMW[ex];
      if (t === 'T') items.push({ ex, time: GYMW[ex][0] });
      else if (t === 'W') { const [r, n] = GYM_BW[L - 1]; items.push(barSets(ex, r + wk, n + Math.min(b, 2))); }
      else { const sc0 = (iso ? GYM_ISO : GYM_COMP)[L - 1], sets = sc0.slice(); for (let q = 0; q < Math.min(b, 2); q++) sets.push(sc0[sc0.length - 1]); items.push({ ex, sets: sets.map(r => r + wk), weight: gymWeight(ex, L) }); }
    }
  });
  return items;
}
const SP = {
  full: [['quads', [1, 1]], ['hams', [0, 1]], ['chest', [1, 1]], ['back', [1, 2]], ['shoulders', [1, 1]], ['biceps', [0, 1]], ['triceps', [0, 1]], ['abs', [1, 1]]],
  upper: [['chest', [0, 0, 2, 3, 3]], ['back', [0, 0, 2, 3, 3]], ['shoulders', [0, 0, 1, 2, 2]], ['biceps', [0, 0, 1, 1, 2]], ['triceps', [0, 0, 1, 1, 2]]],
  lower: [['quads', [0, 0, 2, 3, 3]], ['hams', [0, 0, 2, 2, 3]], ['calves', [0, 0, 1, 1, 2]], ['abs', [0, 0, 1, 2, 2]], ['cond', [0, 0, 1, 1, 1]]],
  push: [['chest', [0, 0, 2, 3, 4]], ['shoulders', [0, 0, 1, 2, 2]], ['triceps', [0, 0, 1, 2, 2]]],
  pull: [['back', [0, 0, 2, 3, 4]], ['biceps', [0, 0, 1, 2, 2]], ['abs', [0, 0, 1, 1, 1]]],
  legs: [['quads', [0, 0, 2, 3, 3]], ['hams', [0, 0, 2, 2, 3]], ['calves', [0, 0, 1, 1, 2]], ['abs', [0, 0, 1, 1, 2]], ['cond', [0, 0, 1, 1, 1]]],
  chest5: [['chest', [2, 3, 3, 4, 4]], ['triceps', [1, 1, 2, 2, 3]]],
  back5: [['back', [2, 3, 3, 4, 4]], ['biceps', [1, 1, 2, 2, 3]]],
  legs5: [['quads', [2, 2, 3, 3, 4]], ['hams', [1, 2, 2, 2, 3]], ['calves', [1, 1, 1, 2, 2]]],
  sh5: [['shoulders', [2, 2, 3, 3, 4]], ['abs', [1, 2, 2, 3, 3]]],
  arms5: [['biceps', [2, 2, 2, 3, 3]], ['triceps', [2, 2, 2, 3, 3]], ['abs', [1, 1, 2, 2, 2]], ['cond', [1, 1, 1, 1, 1]]],
  glutes5: [['hams', [0, 0, 0, 3, 4]], ['quads', [0, 0, 0, 1, 2]], ['calves', [0, 0, 0, 1, 1]], ['abs', [0, 0, 0, 1, 2]], ['cond', [0, 0, 0, 1, 1]]],
};
const GYM_WARM = ['g_tread', 'g_ellip', 'g_bike'];
function gymPlan(L, per) {
  if (per === 2) return L <= 2 ? { names: ['Всё тело A', 'Всё тело B'], specs: [SP.full, SP.full], cond: -1 } : { names: ['Верх тела', 'Низ тела и пресс'], specs: [SP.upper, SP.lower] };
  if (per === 3) return L <= 2 ? { names: ['Всё тело A', 'Всё тело B', 'Всё тело C'], specs: [SP.full, SP.full, SP.full] } : { names: ['Грудь, плечи, трицепс', 'Спина и бицепс', 'Ноги и пресс'], specs: [SP.push, SP.pull, SP.legs] };
  return { names: ['Грудь и трицепс', 'Спина и бицепс', 'Ноги', 'Плечи и пресс', L <= 3 ? 'Руки и пресс' : 'Ягодицы и задняя поверхность'], specs: [SP.chest5, SP.back5, SP.legs5, SP.sh5, L <= 3 ? SP.arms5 : SP.glutes5] };
}
function gymDay(L, per, n) {
  const { w, wk, b, i } = weekInfo(n, per), plan = gymPlan(L, per), off = L <= 2 ? i : b; // в блоке упражнения те же (прогрессия), со следующего блока основной подбор сдвигается
  const warm = { ex: GYM_WARM[(n - 1) % 3], time: L <= 2 ? 300 : 240 };
  return finishDay([warm, ...gymBlock(plan.specs[i], L, wk, b, off)]);
}
const GYM_NAMES = ['Новичок', 'Любитель', 'Средний', 'Продвинутый', 'Профи'];
const GYM_REQ = [
  'Для тех, кто в зале впервые или вернулся после долгого перерыва. Нужно: пройти вводное занятие с тренером зала и освоить технику основных движений. Вес подбирай так, чтобы в запасе оставалось 3 повторения.',
  'Нужно: 2–3 месяца регулярных занятий, уверенная техника приседа, жима и тяги. Вес подбирай так, чтобы в запасе оставалось 2 повторения.',
  'Нужно: полгода регулярных тренировок, жим лёжа около своего веса, присед с весом тела и больше. Знать, как работать со страховкой и когда делать разгрузку.',
  'Нужно: от полутора лет силового опыта, свои рабочие веса во всех базовых упражнениях, страхующий партнёр на тяжёлых подходах. Следить за сном, питанием и восстановлением.',
  'Нужно: от 3 лет серьёзного опыта, хорошее восстановление и здоровые суставы. Тяжёлые подходы в 5–8 повторений, обязательно страховка. Не пропускай разминку и разгрузочные недели.',
];
const GYM_PROGS = [];
for (let L = 1; L <= 5; L++) [2, 3, 5].forEach(per => {
  const plan = gymPlan(L, per);
  GYM_PROGS.push({
    id: `gym-${L}-${per}`, group: 'gym', level: L, title: `${GYM_NAMES[L - 1]} · ${per} дн.`,
    card: per === 5 ? '5 дней, по группам мышц' : per === 3 ? (L <= 2 ? '3 дня, всё тело' : '3 дня, жим / тяга / ноги') : (L <= 2 ? '2 дня, всё тело' : '2 дня, верх / низ'),
    restDays: per === 5 ? 0 : 1, day: n => gymDay(L, per, n),
    req: `${GYM_REQ[L - 1]} Ритм: ${per} ${per === 5 ? 'дней' : 'дня'} в неделю. ${per === 5 ? 'Каждая группа мышц отдыхает 6 дней.' : per === 3 ? 'Между тренировками день отдыха.' : 'Между тренировками минимум 2 дня отдыха.'} Зал: штанга, тренажёры, блоки, гантели, гири, брусья, беговая дорожка.`,
    info: n => { const { w, wk, b, i } = weekInfo(n, per); return { sub: `${per} дн. в неделю · неделя ${w + 1}`, label: `День ${n} · ${plan.names[i]}`, note: wk === 0 && b > 0 ? 'Новый блок: подними вес на 2,5–5 кг, подходов стало больше' : `Блок ${b + 1}, неделя ${wk + 1} из 4` }; },
  });
});
PROGRAMS.push(...GYM_PROGS);
const GROUPS = [{ id: 'abs', title: 'Пресс' }, { id: 'db', title: 'Гантели' }, { id: 'legs', title: 'Ноги' }, { id: 'glutes', title: 'Ягодицы и кор' }, { id: 'back', title: 'Спина' }, { id: 'chest', title: 'Грудь' }, { id: 'gym', title: 'Зал' }];

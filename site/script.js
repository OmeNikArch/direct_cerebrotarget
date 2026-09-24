import { buildLeadPayload, validateLeadForm } from './form-logic.mjs'
import { createHeroCompositionController } from './hero-composition.mjs'
import { createInitialScrollController, createMobileMenuController, createPathDrawOnViewController, createRevealOnceController, createStickyHeaderController } from './ui-behavior.mjs'
import { createCountUpController, protectHeadingOrphans } from './content-polish.mjs'

const landingData = {
  facts: [
    ['budget', 'Рекламный бюджет от 100 000 ₽ в месяц'],
    ['fee', 'Ведение от 50 000 ₽ в месяц, с НДС'],
    ['included', 'Аудит, стратегия и запуск включены'],
    ['access', 'Кабинет и наработки остаются у вас'],
  ],
  fit: [
    ['01', 'Нужен подрядчик на ведение', 'Ищете не разовый запуск, а команду, которая ведёт рекламу и принимает решения по данным'],
    ['02', 'Есть бюджет от 100 000 ₽', 'Готовы ежемесячно вкладывать в рекламный бюджет, чтобы проверить и развивать канал спроса'],
    ['03', 'Важны заявки, а не клики', 'Хотите видеть качество обращений, стоимость лида и связь рекламы с продажами'],
    ['04', 'Нужен открытый процесс', 'Хотите сохранять контроль над кабинетом, доступами, задачами и историей работы'],
  ],
  problems: [
    ['Платите за клики, но не понимаете, есть ли продажи', 'Настраиваем цели, аналитику и CRM-логику, чтобы смотреть на качественные обращения, а не на красивые показатели кабинета'],
    ['Бюджет уходит на мусорный трафик', 'Отслеживаем запросы, площадки и источники, отключаем то, что не приводит к целевым обращениям'],
    ['Отчёты есть, но решений по рекламе нет', 'Показываем динамику, качество лидов и следующие действия — чтобы было понятно, что меняем и зачем'],
    ['Посадочная страница не помогает конвертировать спрос', 'Проверяем сайт до запуска и даём рекомендации, которые помогают трафику превращаться в заявки'],
  ],
  serviceScope: [
    ['01', 'Стратегия и аудит', 'Разбираем спрос, сайт и точки роста перед запуском'],
    ['02', 'Запуск и оптимизация', 'Настраиваем кампании, объявления и регулярно улучшаем их по данным'],
    ['03', 'Аналитика и отчёты', 'Связываем рекламу с обращениями и показываем понятную динамику'],
    ['04', 'Рекомендации по сайту', 'Подсказываем, что на посадочной странице мешает заявкам'],
  ],
  process: [
    ['01', 'Оставляете заявку', 'Указываете удобный способ связи и информацию о вашем проекте'],
    ['02', 'Связываемся с вами', 'Звоним в удобное для вас время — без навязчивого сценария'],
    ['03', 'Заполняете бриф', 'Переходите в VK-бот и отвечаете на вопросы о проекте в удобное время'],
    ['04', 'Готовим стратегию и запускаем', 'Формируем план работ, настраиваем аналитику и запускаем кампании'],
    ['05', 'Ведём и улучшаем рекламу', 'Регулярно оптимизируем кампании, обсуждаем динамику и следующие точки роста'],
  ],
  transparency: [
    ['01', 'У вас есть доступ к кабинету', 'Доступы, история и наработки остаются у вас даже после завершения сотрудничества'],
    ['02', 'Согласовываем изменения', 'Объясняем, что меняем в рекламе и на каких данных основаны решения'],
    ['03', 'Консультируем по продвижению', 'Помогаем решать ваши задачи по продвижению'],
    ['04', 'Мы всегда на связи', 'Синхронизируемся по динамике, качеству обращений и приоритетам на следующий период'],
    ['05', 'Не скрываем расходы', 'Рекламный бюджет и работа агентства разделены — вы знаете, сколько денег потрачено'],
  ],
  cases: [
    {
      category: 'medicine',
      label: 'Медицина',
      title: 'В 2 раза больше конверсий для стоматологий',
      context: 'Уфа и Стерлитамак · Яндекс Директ · 5 месяцев',
      task: 'Получать стабильный поток реальных обращений по двум клиникам и сделать результаты рекламы прозрачными для собственников.',
      solution: [
        'Доработали посадочные страницы, настроили конверсионные цели, коллтрекинг и Метрику.',
        'Разделили кампании по услугам и площадкам, затем еженедельно оптимизировали их по фактической стоимости обращений.',
      ],
      results: [
        ['161 → 316', 'конверсий в Уфе'],
        ['108', 'конверсий в Стерлитамаке'],
        ['+3,9%', 'к стоимости конверсии в Уфе'],
      ],
    },
    {
      category: 'education',
      label: 'Онлайн-образование',
      title: '1 000+ регистраций на бесплатный курс',
      context: 'Проект по нутрициологии · Яндекс Директ · 6 месяцев',
      task: 'Расширить воронку холодным трафиком, хотя основной курс за 29 900 ₽ практически не продавался с первого касания.',
      solution: [
        'Отказались от продажи «в лоб» и направили аудиторию на бесплатный вводный курс с дальнейшим прогревом.',
        'Исследовали аудиторию и перенесли в Директ уже проверенные клиентом заголовки и визуальные приёмы.',
      ],
      results: [
        ['1 000+', 'регистраций'],
        ['42,5%', 'трафика сайта из Директа'],
        ['10,64%', 'из прошедших курс купили полный'],
      ],
    },
    {
      category: 'manufacturing',
      label: 'Производство',
      title: 'Увеличили продажи квадроциклов в 4 раза',
      context: 'RB Motors · Яндекс Директ · 6 месяцев',
      task: 'Вернуть стоимость лида в KPI до 2 800 ₽ и масштабировать рекламу перед сезоном без потери качества обращений.',
      solution: [
        'Провели аудит всей воронки, исправили аналитику и собрали сегменты на основе базы покупателей.',
        'Протестировали 37 кампаний, разделяя запросы, площадки и аудитории, затем масштабировали результативные связки.',
      ],
      results: [
        ['×4', 'продажи из Директа'],
        ['479', 'заявок за полгода'],
        ['2 758 ₽', 'стоимость лида'],
      ],
    },
    {
      category: 'e-commerce',
      label: 'Маркетплейсы',
      title: '78 332 перехода в магазин на Wildberries',
      context: '«Своя Культура» · Яндекс Директ · 6 месяцев',
      task: 'Проверить новый источник трафика для Wildberries без собственного сайта и добиться стоимости перехода ниже рекламы во ВКонтакте.',
      solution: [
        'Направили рекламу на страницу бренда и карточки товаров, объединив прямой спрос и знакомство с ассортиментом.',
        'Внедрили пакетную стратегию и протестировали 74 кампании с разными аудиториями, офферами и форматами объявлений.',
      ],
      results: [
        ['78 332', 'перехода на Wildberries'],
        ['2,26 ₽', 'средняя цена клика'],
        ['29 ₽', 'средняя цена лайка'],
      ],
    },
    {
      category: 'e-commerce',
      label: 'Интернет-магазины',
      title: 'В 1,5 раза выше конверсия в заказ',
      context: '«Форвард-мебель» · Яндекс Директ · 3,5 месяца',
      task: 'Разобраться в непрозрачной работе прежнего подрядчика и получать больше реальных заказов, а не дорогих добавлений в корзину.',
      solution: [
        'Обучили кампании на добавлениях в корзину, чтобы быстрее находить аудиторию при длинном цикле покупки.',
        'Оставили эффективные товарные кампании, перезапустили РСЯ после оптимизации и подключили ретаргетинг.',
      ],
      results: [
        ['×1,5', 'конверсия корзины в заказ'],
        ['−57,2%', 'стоимость корзины'],
        ['−44%', 'стоимость заказа'],
      ],
    },
  ],
  reviewSlides: [
    ['Яркий Феникс', 'Химчистка ковров · Санкт-Петербург', ['Стираем много ковров в Питере, работаем уже 4 года. За это время в Директе пытались запускаться трижды. Два раза — с разными директологами с опытом в нише, один раз — самостоятельно на автоматических стратегиях. Как итог — даже рекламный бюджет не окупали.', 'Так как уже достаточно плотно и успешно работали с Церебро по таргету, решили попробовать и Директ.', 'На данный момент работаем больше года: <strong>окупаемость бюджета примерно ×2, лиды по 700–1 300 ₽</strong>. Для нас это ультрарезультат. Инструмент глобально недешёвый, но <strong>работает в плюс и стабильно приводит новых клиентов</strong> — а для нас это самое главное.']],
    ['Сказка моя', 'Сказки для детей с помощью ИИ', ['Обратились в Церебро с запросом на настройку Яндекс Директа: до этого пробовали и сами, и через других подрядчиков. Но результат не устраивал — реклама то работала, то переставала.', 'Работаем уже несколько месяцев, показатели радуют: <strong>реклама окупается, а команда помогла обнаружить эффективный конвертящий формат</strong>. Позднее обратились и за настройкой VK Таргета.']],
    ['Dichshop.ru', 'Мясные деликатесы в подарок', ['С Церебро работаем уже больше года. Радует инициативность в вопросах увеличения прибыли моей компании. Специалисты действительно специалисты: решения разных задач либо уже есть, либо быстро появляются.', '<strong>Особенно радует честность.</strong> Нет ощущения, что к твоим бюджетам относятся как к цифрам. Всё по-человечески. Работать будем ещё долго.']],
    ['Киномакс', 'Сеть кинотеатров · почти два года сотрудничества', ['Очень рекомендую Церебро к сотрудничеству. Для меня это единственное агентство, которое не просто «делает, как сказали», а <strong>действительно думает о результате</strong>. Здесь готовы обсуждать, спорить, доказывать и даже отстаивать свою позицию, если понимают, что так для проекта будет лучше.', 'Для меня важным моментом доверия стало то, как команда повела себя после первого неудачного запуска. Никто не стал делать вид, что всё нормально, или перекладывать ответственность. <strong>Ребята разобрались в ситуации, заменили специалиста — и после этого всё действительно полетело.</strong>', 'Наш текущий специалист — настоящий профи. Если чего-то не знает, то идёт и узнаёт. Если знает, что идея не сработает, то прямо об этом скажет и объяснит, как будет лучше.', 'Мы работаем вместе уже почти два года, и всё это время Церебро помогает удерживать сильный результат. Мы много тестировали, пробовали, ошибались, находили рабочие решения. И каждый раз, когда изменчивый рынок пытается всё сломать, <strong>специалист находит новые возможности и способы сохранить эффективность.</strong>']],
    ['Проект в сфере образования', 'Название клиента не публикуем до получения согласия', ['Мы обратились к Церебро с задачей сбора лидов через Яндекс Директ для информационных продуктов: справочных платформ, журналов и курсов для руководителей в бюджетной сфере. Это узкая специфичная ниша с жёсткой регламентацией.', 'После тестов, которые заняли около двух месяцев, специалист Церебро помог <strong>организовать постоянный поток качественных лидов по цене от 200 ₽</strong>. Кроме того, он наладил стабильный приток подписчиков в канал MAX, в котором также происходят продажи продуктов.']],
  ],
  startOptions: [
    ['Обсудим ваш проект', 'Основной путь', 'Изучим заполненный бриф, при необходимости уточним детали и подготовим предложение по ведению рекламы', 'Обсудить ведение', 'start-promotion'],
    ['Получить медиаплан по вашей задаче', 'Если пока сравниваете', 'Ответьте на несколько вопросов — так мы поймём контекст и подготовим основу для прогноза', 'Получить медиаплан', 'start-audit'],
  ],
  faq: [
    ['Кому подходит ведение Яндекс Директ?', 'Бизнесу с понятным продуктом или услугой, готовому ежемесячно инвестировать в рекламу от 100 000 ₽ и принимать обращения. На основе заполненного брифа честно оценим, подходит ли канал вашей задаче.'],
    ['Как рассчитывается стоимость ведения?', 'При рекламном бюджете до 500 000 ₽ включительно работа агентства стоит 50 000 ₽ в месяц. От 501 000 ₽ — 50 000 ₽ плюс 7% от рекламного бюджета. Все суммы указаны с НДС.'],
    ['Что входит в стоимость агентства?', 'В стоимость входят аудит, стратегия, запуск, настройка и оптимизация кампаний, аналитика, отчёты, объявления и рекомендации по посадочным страницам.'],
    ['Смогу ли я заходить в рекламный кабинет?', 'Да. Рекламный кабинет, доступы, история кампаний и наработки остаются у вас.'],
    ['Что произойдёт после заявки?', 'После отправки заявки вы сможете перейти в VK-бот и заполнить бриф. Специалист изучит ответы, позвонит вам и подготовит предложение по дальнейшей работе.'],
    ['Когда появятся первые выводы по рекламе?', 'Срок зависит от спроса, конкуренции, сайта и объёма данных. В начале проверяем гипотезы и качество обращений, а затем принимаем решения по оптимизации.'],
  ],
}

const render = (id, html) => { document.getElementById(id).innerHTML = html }
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

createInitialScrollController({})

const siteHeader = document.querySelector('[data-site-header]')
const mobileMenuButton = document.getElementById('menu-button')
const mobileMenu = document.getElementById('mobile-menu')
if (siteHeader) createStickyHeaderController({ header: siteHeader })
if (mobileMenuButton && mobileMenu) createMobileMenuController({ button: mobileMenuButton, menu: mobileMenu, body: document.body })

render('hero-facts', landingData.facts.map(([, item], index) => `<div data-hero-fact class="border-b border-white/20 py-3 last:border-b-0 md:px-4 md:even:border-l md:even:border-white/20 lg:border-b-0 lg:border-l lg:border-white/20 lg:first:border-l-0 lg:px-6"><span class="text-xs font-medium text-accent">${String(index + 1).padStart(2, '0')}</span><p class="mt-2 max-w-[13rem] text-sm leading-5 text-white/70">${item}</p></div>`).join(''))

const heroComposition = document.querySelector('[data-hero-composition]')
if (heroComposition) {
  const heroMotion = createHeroCompositionController({
    root: heroComposition,
    reduceMotion,
  })
  heroMotion.start()
}

createPathDrawOnViewController({
  paths: [...document.querySelectorAll('[data-draw-line]')],
  reduceMotion,
})

const fitImages = [
  './assets/fit/01-management.png',
  './assets/fit/02-budget.png?v=fit-approved-1',
  './assets/fit/03-leads.png',
  './assets/fit/04-transparency.png?v=fit-approved-1',
]
render('fit-cards', landingData.fit.map(([n, t, d], index) => `<article class="relative overflow-hidden bg-white"><figure data-fit-art class="pointer-events-none absolute inset-y-0 right-0 w-full" aria-hidden="true"><img data-fit-image class="absolute z-[1] h-auto max-w-none select-none object-contain" src="${fitImages[index]}" alt="" width="1254" height="1254" loading="lazy" decoding="async" /></figure><div class="relative z-10 w-[62%]"><p class="text-sm text-ink/45">${n}</p><h3 class="mt-5 font-display text-xl font-semibold leading-tight tracking-[-.025em]">${t}</h3><p class="mt-3 max-w-md text-sm leading-6 text-ink/60">${d}</p></div></article>`).join(''))
render('problems', landingData.problems.map(([problem, solution]) => `<article class="grid overflow-hidden border border-border bg-white text-ink md:grid-cols-2"><div class="p-5 md:p-6"><p class="text-xs text-ink/45">Было</p><h3 class="mt-3 font-display text-lg font-semibold tracking-[-.02em]">${problem}</h3></div><div class="bg-blue-soft/80 p-5 text-ink md:p-6"><p class="text-xs text-brand">Станет</p><p class="mt-3 text-sm leading-6 text-ink/70">${solution}</p></div></article>`).join(''))
const serviceIcons = [
  './assets/service-icons/01-strategy.svg',
  './assets/service-icons/02-launch.svg',
  './assets/service-icons/03-analytics.svg',
  './assets/service-icons/04-site-recommendations.svg',
]
render('service-scope-cards', landingData.serviceScope.map(([, t, d], index) => `<article class="service-card min-h-[260px] border border-border bg-white p-6 text-ink md:p-7" style="--service-delay:${index * 60}ms"><span data-service-icon aria-hidden="true" class="block h-7 w-7 bg-accent [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]" style="mask-image:url('${serviceIcons[index]}');-webkit-mask-image:url('${serviceIcons[index]}')"></span><h3 class="mt-10 font-display text-xl font-semibold leading-tight tracking-[-.025em]">${t}</h3><p class="mt-3 text-sm leading-6 text-ink/60">${d}</p></article>`).join(''))
createRevealOnceController({ elements: [...document.querySelectorAll('.service-card')], reduceMotion })
render('process-cards', landingData.process.map(([n, t, d]) => `<article class="relative min-h-[248px] bg-white/85 p-5 pt-20 md:p-6 md:pt-20"><span data-process-number class="absolute left-5 top-5 flex h-[30px] w-[30px] items-center justify-center rounded-[5px] bg-blue-soft font-display text-sm font-semibold text-white md:left-6 md:top-6">${n}</span><h3 class="font-display text-lg font-semibold leading-tight tracking-[-.025em]">${t}</h3><p class="mt-3 max-w-sm text-sm leading-6 text-ink/60">${d}</p></article>`).join(''))
const transparencyImages = [
  './assets/transparency/01-dashboard-access.png',
  './assets/transparency/02-approving-changes.png',
  './assets/transparency/03-promotion-consultation.png',
  './assets/transparency/04-always-in-touch.png',
  './assets/transparency/05-transparent-expenses.png',
]
render('transparency-cards', landingData.transparency.map(([, t, d], index) => `<article data-transparency-card class="transparency-card relative min-h-[220px] overflow-hidden bg-white/65 text-ink md:min-h-[260px] ${index === 0 ? 'md:col-span-2 lg:col-span-8' : 'lg:col-span-4'} ${index === 0 ? 'lg:min-h-[286px]' : 'lg:min-h-[252px]'}"><div class="relative z-10 max-w-[72%] p-5 md:p-6 ${index === 0 ? 'lg:max-w-[58%]' : 'lg:max-w-[90%]'}"><h3 class="font-display text-lg font-semibold leading-tight">${t}</h3><p class="mt-3 max-w-sm text-sm leading-6 text-ink/65">${d}</p></div><img data-transparency-image class="transparency-art transparency-art-${index + 1}" src="${transparencyImages[index]}" alt="" width="1254" height="1254" loading="lazy" decoding="async" /></article>`).join(''))
const caseFilters = [
  ['all', 'Все'],
  ['medicine', 'Медицина'],
  ['e-commerce', 'Интернет-магазины'],
  ['education', 'Онлайн-образование'],
  ['manufacturing', 'Производство'],
]
const caseFiltersElement = document.getElementById('case-filters')
const caseCardsElement = document.getElementById('case-cards')
const caseViewport = document.getElementById('case-viewport')
const casePrevious = document.getElementById('case-prev')
const caseNext = document.getElementById('case-next')
let activeCaseFilter = 'all'
const caseImages = [
  './assets/cases/dentistry.png',
  './assets/cases/education.png',
  './assets/cases/atv.png',
  './assets/cases/marketplace.png',
  './assets/cases/furniture.png',
]

const getFilteredCases = () => landingData.cases.filter(({ category }) => activeCaseFilter === 'all' || category === activeCaseFilter)

const renderCaseFilters = () => {
  caseFiltersElement.innerHTML = caseFilters.map(([id, label]) => `<button class="button-press px-4 py-2 text-sm font-medium ${activeCaseFilter === id ? 'bg-brand text-white' : 'bg-white text-ink/70'}" type="button" data-case-filter="${id}" aria-pressed="${activeCaseFilter === id}">${label}</button>`).join('')
}

const updateCaseControls = () => {
  const maxScroll = Math.max(caseViewport.scrollWidth - caseViewport.clientWidth, 0)
  const atStart = caseViewport.scrollLeft <= 2
  const atEnd = caseViewport.scrollLeft >= maxScroll - 2
  ;[casePrevious, ...document.querySelectorAll('[data-case-step="-1"]')].forEach((button) => { button.disabled = atStart })
  ;[caseNext, ...document.querySelectorAll('[data-case-step="1"]')].forEach((button) => { button.disabled = atEnd })
}

const renderCaseCards = () => {
  const filteredCases = getFilteredCases()
  caseCardsElement.innerHTML = filteredCases.map(({ label, title, context, task, solution, results }) => {
    const image = caseImages[landingData.cases.findIndex((item) => item.title === title)]
    return `<article class="flex min-w-0 flex-[0_0_92%] snap-start flex-col overflow-hidden bg-white sm:flex-[0_0_82%] lg:flex-[0_0_72%] xl:flex-[0_0_68%]"><div data-case-header class="grid md:grid-cols-[minmax(0,1fr)_320px]"><div class="min-w-0 p-5 md:p-7"><p class="text-sm font-medium text-brand">${label}</p><p data-case-context class="mt-2 min-w-0 text-xs leading-5 text-ink/45">${context}</p><h3 class="mt-5 max-w-xl font-display text-2xl font-semibold leading-[1.15] tracking-[-.03em] md:text-3xl">${title}</h3></div><div data-case-image class="aspect-[4/3] w-full overflow-hidden bg-blue-soft md:w-80" aria-hidden="true"><img class="h-full w-full object-cover" src="${image}" alt="" width="1024" height="768" /></div></div><div data-case-body class="grid gap-5 border-t border-ink/10 p-5 text-sm leading-6 md:p-7 xl:grid-cols-[2fr_3fr] xl:gap-0"><div data-case-task class="xl:pr-7"><p class="font-medium text-ink">Задача</p><p class="mt-1 text-ink/65">${task}</p></div><div data-case-solution class="xl:border-l xl:border-ink/10 xl:pl-7"><p class="font-medium text-ink">Решение</p><ul class="mt-2 grid gap-2 text-ink/65">${solution.map((item) => `<li class="grid grid-cols-[8px_1fr] gap-2"><span class="mt-[9px] h-1.5 w-1.5 bg-accent" aria-hidden="true"></span><span>${item}</span></li>`).join('')}</ul></div></div><div data-case-results class="mt-auto border-t border-ink/10 p-5 md:p-7"><p class="text-sm font-medium text-ink">Результат</p><dl class="mt-3 grid border-y border-border bg-white sm:grid-cols-3">${results.map(([value, caption]) => `<div data-case-result class="flex min-h-[104px] flex-col justify-between border-t border-border bg-white py-4 first:border-t-0 sm:border-l sm:border-t-0 sm:px-4 sm:first:border-l-0"><dt class="font-display text-2xl font-semibold leading-none tracking-[-.04em] text-brand md:text-3xl">${value}</dt><dd class="mt-3 text-xs leading-5 text-ink/55">${caption}</dd></div>`).join('')}</dl></div></article>`
  }).join('')
  caseViewport.scrollLeft = 0
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(updateCaseControls)
  else updateCaseControls()
}

const slideCases = (direction) => {
  const firstCase = caseCardsElement.querySelector('article')
  if (!firstCase) return
  const gap = Number.parseFloat(getComputedStyle(caseCardsElement).gap) || 0
  caseViewport.scrollBy({ left: direction * (firstCase.getBoundingClientRect().width + gap), behavior: reduceMotion ? 'auto' : 'smooth' })
}

caseFiltersElement.addEventListener('click', (event) => {
  const button = event.target.closest('[data-case-filter]')
  if (!button) return
  activeCaseFilter = button.dataset.caseFilter
  renderCaseFilters()
  renderCaseCards()
})
casePrevious.addEventListener('click', () => slideCases(-1))
caseNext.addEventListener('click', () => slideCases(1))
document.querySelectorAll('[data-case-step]').forEach((button) => button.addEventListener('click', () => slideCases(Number(button.dataset.caseStep))))
caseViewport.addEventListener('scroll', updateCaseControls, { passive: true })
window.addEventListener?.('resize', updateCaseControls)
renderCaseFilters()
renderCaseCards()
render('start-options', landingData.startOptions.map(([title, label, text, ctaLabel, ctaId]) => `<article class="flex min-h-[286px] overflow-hidden bg-white/90 text-left"><div class="flex min-w-0 flex-col p-6 md:p-7"><p class="text-sm text-brand">${label}</p><h3 class="mt-10 font-display text-xl font-semibold leading-tight tracking-[-.025em]">${title}</h3><p class="mt-3 max-w-sm text-sm leading-6 text-ink/60">${text}</p><a data-cta="${ctaId}" class="button-press mt-6 inline-flex w-fit px-5 py-3 text-sm font-medium ${ctaId === 'start-promotion' ? 'bg-accent text-ink' : 'border border-brand text-brand'}" href="${ctaId === 'start-promotion' ? '#contact' : '#quiz'}">${ctaLabel}</a></div></article>`).join(''))
render('faq-list', landingData.faq.map(([question, answer], index) => `<article class="faq-item border-b border-ink/10" data-open="false"><button class="flex w-full items-center justify-between gap-6 py-6 text-left font-display text-lg font-semibold leading-tight" id="faq-button-${index}" aria-expanded="false" aria-controls="faq-answer-${index}"><span>${question}</span><span class="faq-plus text-2xl font-normal text-brand">+</span></button><div class="faq-answer" id="faq-answer-${index}" role="region" aria-labelledby="faq-button-${index}"><div><p class="max-w-2xl pb-6 text-sm leading-6 text-ink/65">${answer}</p></div></div></article>`).join(''))

document.querySelectorAll('.faq-item button').forEach((button) => button.addEventListener('click', () => {
  const item = button.closest('.faq-item'); const willOpen = item.dataset.open !== 'true'; document.querySelectorAll('.faq-item').forEach((other) => { other.dataset.open = 'false'; other.querySelector('button').setAttribute('aria-expanded', 'false') }); item.dataset.open = String(willOpen); button.setAttribute('aria-expanded', String(willOpen))
}))

const reviewSlides = document.getElementById('review-slides')
const reviewCounter = document.getElementById('review-counter')
const reviewPrevious = document.getElementById('review-prev')
const reviewNext = document.getElementById('review-next')
let reviewIndex = 0

const renderReviewSlide = () => {
  const [label, detail, paragraphs] = landingData.reviewSlides[reviewIndex]
  reviewSlides.innerHTML = `<div data-review-message class="max-w-2xl rounded-[8px] rounded-tl-[3px] bg-white p-5 md:p-6"><div class="flex items-start justify-between gap-4"><div><p class="text-sm font-medium text-brand">${label}</p><p class="mt-1 text-xs leading-5 text-ink/50">${detail}</p></div><span class="shrink-0 rounded-full border border-ink/10 bg-white px-3 py-1 text-xs text-ink/50">Сообщение клиента Ц</span></div><div class="mt-5 grid gap-4 text-sm leading-6 text-ink/70">${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div></div>`
  reviewCounter.textContent = `${reviewIndex + 1} / ${landingData.reviewSlides.length}`
}

reviewPrevious.addEventListener('click', () => { reviewIndex = (reviewIndex - 1 + landingData.reviewSlides.length) % landingData.reviewSlides.length; renderReviewSlide() })
reviewNext.addEventListener('click', () => { reviewIndex = (reviewIndex + 1) % landingData.reviewSlides.length; renderReviewSlide() })
renderReviewSlide()

protectHeadingOrphans()
createCountUpController({
  element: document.querySelector('[data-count-up]'),
  target: 3000,
  suffix: '+',
  duration: 1000,
  reduceMotion,
})
const form = document.getElementById('lead-form')
const formFields = document.getElementById('lead-form-fields')
const successPanel = document.getElementById('lead-success')
const vkBriefLink = document.getElementById('vk-brief-link')
const vkLinkStatus = document.getElementById('vk-link-status')
const formButton = form.querySelector('button[type="submit"]')
const formStatus = document.getElementById('form-status')

const setError = (field, message) => {
  const target = form.querySelector(`[data-error="${field}"]`)
  const control = form.elements.namedItem(field)
  target.textContent = message || ''
  target.classList.toggle('hidden', !message)
  control?.setAttribute('aria-invalid', String(Boolean(message)))
}

const setFormState = (state, message = '') => {
  form.dataset.state = state
  form.setAttribute('aria-busy', String(state === 'submitting'))
  formButton.disabled = state === 'submitting'
  formButton.textContent = state === 'submitting' ? 'Отправляем…' : 'Отправить заявку'
  formStatus.hidden = !message
  formStatus.textContent = message
  formStatus.className = `rounded-lg px-4 py-3 text-sm md:col-span-2 ${state === 'error' ? 'bg-red-50 text-red-800' : 'bg-paper text-ink'}`
}

const configureVkBriefLink = () => {
  const botUrl = String(form.dataset.vkBotUrl || '').trim()
  if (!botUrl) return
  vkBriefLink.href = botUrl
  vkBriefLink.removeAttribute('aria-disabled')
  vkBriefLink.removeAttribute('tabindex')
  vkLinkStatus.hidden = true
}

configureVkBriefLink()

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const values = { ...Object.fromEntries(new FormData(form)), consent: form.consent.checked }
  const errors = validateLeadForm(values)
  ;['name', 'phone', 'budget', 'consent'].forEach((field) => setError(field, errors[field]))
  if (Object.keys(errors).length) {
    const firstInvalid = form.elements.namedItem(Object.keys(errors)[0])
    firstInvalid?.focus()
    return
  }

  setFormState('submitting')
  try {
    if (!form.dataset.endpoint) throw new Error('Lead form endpoint is not configured')
    const response = await fetch(form.dataset.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildLeadPayload(values)),
    })
    if (!response.ok) throw new Error(`Lead form request failed: ${response.status}`)
    form.reset()
    setFormState('success')
    formFields.hidden = true
    successPanel.hidden = false
    successPanel.focus?.()
  } catch (error) {
    console.error(error)
    setFormState('error', 'Не удалось отправить заявку. Попробуйте ещё раз позже.')
  }
})

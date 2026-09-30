import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8')
const script = await readFile(new URL('./script.js', import.meta.url), 'utf8')
const quiz = await readFile(new URL('./quiz.mjs', import.meta.url), 'utf8')

test('leads media-plan CTAs to the quiz while preserving the consultation route', () => {
  for (const cta of ['header-quiz', 'hero-quiz', 'problems', 'transparency', 'cases']) assert.equal(new RegExp(`<a[^>]*data-cta="${cta}"[^>]*href="#quiz"`, 'u').test(html), true, `CTA ${cta} should lead to the quiz`)
  for (const cta of ['start-promotion', 'start-audit']) assert.equal(script.includes(`'${cta}'`), true, `CTA ${cta} should be defined`)
  assert.equal(/ctaId === 'start-promotion' \? '#contact' : '#quiz'/u.test(script), true, 'Start options should retain separate routes')
})

test('uses the pricing CTA for the standalone audit without duplicating its offer', () => {
  const conditions = html.match(/<section id="conditions"[\s\S]*?<\/section>/u)?.[0] || ''
  assert.match(conditions, /data-cta="audit"[^>]*href="#contact"[^>]*>Заказать аудит<\/a>/u)
  assert.match(conditions, /<h3[^>]*>Нужен только аудит рекламы\?<\/h3>/u)
  assert.match(conditions, /Разберём действующие кампании, найдём точки роста и подготовим рекомендации\. Разовый аудит — 5 000 ₽/u)
  assert.doesNotMatch(conditions, /Аудит включён в стоимость ведения рекламы/u)
  assert.equal(conditions.indexOf('Нужен только аудит рекламы?') < conditions.indexOf('data-cta="audit"'), true, 'Pricing copy should precede the right-aligned audit action')
  assert.doesNotMatch(conditions, /Получить бесплатный медиаплан/u)
  assert.doesNotMatch(html, /data-audit-offer/u)
})

test('adapts the contact copy for an audit while keeping the media-plan route available', () => {
  assert.match(html, /data-contact-eyebrow[^>]*>Нужна консультация<\/p>/u)
  assert.match(html, /data-contact-title[^>]*>Обсудим вашу задачу и следующий шаг<\/h2>/u)
  assert.match(html, /data-contact-description[^>]*>Позвоним, уточним детали и согласуем дальнейшие действия<\/p>/u)
  assert.match(html, /href="#quiz">Нужен бесплатный медиаплан\?<\/a>/u)
  assert.match(html, /data-audit-form-intro[\s\S]*?Заявка на разовый аудит рекламы/u)
  assert.doesNotMatch(html, /data-audit-form-intro[\s\S]*?Оставьте контакты — уточним детали/u)
  assert.match(script, /Покажем, что мешает рекламе приносить больше заявок/u)
  assert.match(script, /Разберём действующие кампании и найдём точки роста\. Подготовим понятные рекомендации: что исправить в первую очередь, чтобы реклама работала эффективнее\./u)
})

test('makes the free media plan explicit and uses the approved higher-budget fee', () => {
  assert.equal(html.includes('Получить бесплатный медиаплан'), true)
  assert.equal(html.includes('Бесплатный медиаплан'), true)
  assert.equal(html.includes('50 000 ₽ / месяц + 7% рекламного бюджета'), true)
  assert.equal(script.includes('50 000 ₽ плюс 7% от рекламного бюджета'), true)
  assert.equal(html.includes('50 000 ₽ / месяц + 5% рекламного бюджета'), false)
})

test('frames the media plan as a free, useful outcome rather than only a quiz', () => {
  assert.equal(html.includes('Получите бесплатный медиаплан'), true)
  assert.equal(html.includes('Подготовим бесплатно — без обязательств'), true)
  assert.equal(html.includes('Поймёте, какой бюджет и сценарий продвижения подойдут вашей задаче'), true)
})

test('places a visual media-plan quiz after fit and moves directly from cases to conditions', () => {
  const fitPosition = html.indexOf('Вам подойдёт, если:')
  const quizPosition = html.indexOf('id="quiz"')
  const problemsPosition = html.indexOf('Типичные проблемы рынка')
  const proofPosition = html.indexOf('id="proof"')
  const conditionsPosition = html.indexOf('id="conditions"')

  assert.equal(fitPosition < quizPosition && quizPosition < problemsPosition, true)
  assert.equal(proofPosition < conditionsPosition, true)
  assert.equal(html.includes('Получите бесплатный медиаплан'), true)
  assert.equal(/data-quiz-form/u.test(html), true)
  assert.equal(/quiz-placeholder-lines/u.test(html), false)
  assert.equal(html.includes('id="before-after"'), false)
})

test('places the supplied trust proof after conditions and before reviews', () => {
  const conditionsPosition = html.indexOf('id="conditions"')
  const trustPosition = html.indexOf('id="trust"')
  const reviewsPosition = html.indexOf('id="reviews"')

  assert.equal(conditionsPosition < trustPosition && trustPosition < reviewsPosition, true)
  assert.equal(html.includes('3000+'), true)
  assert.equal(html.includes('Больше 10 лет'), true)
  assert.equal(html.includes('VK'), true)
  assert.equal(html.includes('Яндекс'), true)
  assert.equal(html.includes('Авито'), true)
})

test('combines agency proof with supplied client reviews while keeping the pending brand anonymous', () => {
  const trustPosition = html.indexOf('id="trust"')
  const reviewsPosition = html.indexOf('id="reviews"')

  assert.equal(trustPosition < reviewsPosition, true)
  for (const client of ['Яркий Феникс', 'Сказка моя', 'Dichshop.ru', 'Киномакс', 'Проект в сфере образования']) assert.equal(script.includes(client), true)
  assert.equal(script.includes('Актион Образование'), false)
})

test('keeps the fee transition and future proof sections explicit', () => {
  assert.match(html, /data-pricing-table/u)
  assert.match(html, /от 100 000 до 500 000 ₽/u)
  assert.match(html, /от 501 000 ₽/u)
  assert.match(html, /id="proof"/u)
  assert.match(html, /Наши кейсы/u)
  assert.match(html, /Отзывы/u)
})

test('uses a compact desktop form and a responsive hero facts grid', () => {
  assert.equal(/<div[^>]*id="lead-form"[^>]*role="form"[^>]*md:grid-cols-2/u.test(html), true)
  assert.match(html, /id="hero-facts"[^>]*grid-cols-1[^>]*md:grid-cols-2[^>]*lg:grid-cols-4/u)
})

test('offers both hero actions and keeps fact copy away from its divider', () => {
  assert.match(html, /data-cta="hero-quiz"[^>]*href="#quiz"[^>]*>Получить медиаплан бесплатно<\/a>/u)
  assert.match(html, /data-cta="hero-consultation"[^>]*href="#contact"[^>]*>Обсудить продвижение<\/a>/u)
  assert.equal(script.includes('sm:first:pl-0'), false)
})

test('keeps both hero buttons equal in width and removes the top facts divider', () => {
  const heroActions = html.match(/<div data-hero-actions[^>]*>[\s\S]*?<\/div>/u)?.[0] || ''
  assert.match(heroActions, /data-hero-actions[^>]*flex-col[^>]*md:max-w-\[292px\]/u)
  assert.equal((heroActions.match(/data-cta="hero-(?:quiz|consultation)"[^>]*\bw-full\b/gu) || []).length, 2)
  assert.doesNotMatch(heroActions, /sm:w-auto/u)
  assert.doesNotMatch(html, /id="hero-facts"[^>]*border-t/u)
})

test('puts the locked composition above copy on mobile and keeps the CTA stack below it', () => {
  assert.match(html, /min-h-16[^"']*sm:min-h-20/u)
  assert.match(html, /data-hero-layout[^>]*min-h-\[calc\(100svh-4rem\)\][^>]*gap-3[^>]*pt-0/u)
  assert.match(html, /data-hero-composition[^>]*order-1[^>]*lg:order-2/u)
  assert.match(html, /<h1[^>]*text-\[2rem\][^>]*md:text-\[clamp\(2\.5rem,5\.1vw,4\.65rem\)\]/u)
  assert.match(html, /data-cta="hero-quiz"[^>]*whitespace-nowrap/u)
  assert.match(html, /data-hero-title[^>]*order-2[^>]*lg:order-1/u)
  assert.match(html, /data-hero-actions[^>]*order-3/u)
  assert.match(html, /id="hero-facts"[^>]*order-4/u)
  assert.match(html, /data-hero-actions[^>]*flex-col/u)
})

test('keeps mobile compact and gives the desktop hero lower row a 64px bottom inset', () => {
  assert.match(html, /data-hero-layout[^>]*\bpb-8\b[^>]*md:pb-16[^>]*lg:pb-16/u)
})

test('lifts the whole locked composition six pixels beneath the header clipping edge', () => {
  assert.match(html, /\.hero-composition\s*\{[^}]*transform:\s*translateY\(calc\(-10% - 6px\)\)/su)
  assert.match(html, /@media \(min-width: 768px\)[\s\S]*?\.hero-composition\s*\{[^}]*transform:\s*translateY\(calc\(-12% - 6px\)\)/su)
  assert.match(html, /@media \(min-width: 1024px\)[\s\S]*?\.hero-composition\s*\{[^}]*transform:\s*translateY\(calc\(-12% - 6px\)\)/su)
})

test('places copy at left and the same scaled composition at right from desktop upward', () => {
  assert.match(html, /data-hero-layout[^>]*lg:min-h-\[calc\(100svh-5rem\)\][^>]*lg:grid-cols-12[^>]*lg:grid-rows-\[minmax\(0,1fr\)_auto\][^>]*lg:items-center/u)
  assert.match(html, /data-hero-title[^>]*lg:order-1[^>]*lg:col-span-6/u)
  assert.match(html, /data-hero-composition[^>]*lg:order-2[^>]*lg:col-span-6/u)
  assert.match(html, /data-hero-proof-copy[^>]*max-w-\[38rem\]/u)
  assert.match(html, /data-hero-actions[^>]*lg:col-span-3/u)
  assert.match(html, /id="hero-facts"[^>]*lg:col-span-9/u)
})

test('keeps the description immediately under the hero title', () => {
  const titlePosition = html.indexOf('data-hero-title')
  const proofPosition = html.indexOf('data-hero-proof-copy')
  const actionsPosition = html.indexOf('data-hero-actions')
  assert.equal(titlePosition < proofPosition && proofPosition < actionsPosition, true)
})

test('makes consultation an outlined secondary button', () => {
  assert.match(html, /data-cta="hero-consultation"[^>]*rounded-xl[^>]*border[^>]*border-white\/70/u)
  assert.doesNotMatch(html, /data-cta="hero-consultation"[^>]*underline/u)
})

test('does not use breakpoint-specific negative margins to position the desktop lower row', () => {
  assert.doesNotMatch(html, /data-hero-actions[^>]*2xl:-mt-20/u)
  assert.doesNotMatch(html, /id="hero-facts"[^>]*2xl:-mt-20/u)
})

test('removes the redundant hero scroll indicator', () => {
  assert.doesNotMatch(html, /hero-scroll-indicator|Прокрутить к следующему разделу/u)
})

test('uses the locked hero illustration instead of the retired lower line and compact badges', () => {
  assert.match(html, /data-hero-composition/u)
  assert.match(html, /hero-composition-line/u)
  assert.doesNotMatch(html, /data-hero-line|hero-line-path|data-hero-logos/u)
})

test('keeps the final form as the consultation route and points media-plan seekers to the quiz', () => {
  assert.equal(html.includes('Нужна консультация'), true)
  assert.equal(html.includes('Обсудим вашу задачу и следующий шаг'), true)
  assert.equal(html.includes('Отправить заявку'), true)
  assert.equal(/href="#quiz"[^>]*>Нужен бесплатный медиаплан\?/u.test(html), true)
  assert.equal(html.includes('Оставьте заявку на продвижение'), false)
})

test('shows conditions as one concise pricing table and keeps the audit CTA on one line', () => {
  assert.equal(/<table[^>]*data-pricing-table/u.test(html), true)
  assert.equal((html.match(/<tr\b/gu) || []).length >= 3, true)
  assert.equal(/pricing-cards/u.test(html), false)
  assert.equal(/data-cta="audit"[^>]*whitespace-nowrap/u.test(html), true)
})

test('uses stacked pricing rows instead of horizontal scrolling on mobile', () => {
  assert.equal(/data-pricing-mobile/u.test(html), true)
  assert.equal(/hidden md:block/u.test(html), true)
  assert.equal(/md:hidden/u.test(html), true)
  assert.equal(/min-w-\[560px\]/u.test(html), false)
})

test('visually separates mobile pricing options', () => {
  assert.equal(/data-pricing-mobile[^>]*flex[^>]*gap-3/u.test(html), true)
  const pricingMobile = html.match(/<div data-pricing-mobile[\s\S]*?<div class="hidden md:block">/u)?.[0] || ''
  assert.equal((pricingMobile.match(/<article class="bg-surface[^>]*text-ink"/gu) || []).length, 2)
  assert.equal((pricingMobile.match(/border-border/gu) || []).length, 5)
})

test('renders the work process as responsive airy cards', () => {
  assert.equal(/id="process-cards"[^>]*gap-3/u.test(html), true)
  assert.equal(/lg:grid-cols-5/u.test(html), true)
  assert.equal(/data-process-number[^>]*h-\[30px\] w-\[30px\]/u.test(script), true)
})

test('keeps the approved heading language varied', () => {
  for (const heading of ['Вы оставили заявку. Что дальше?', 'Стоимость ведения', 'Важные вопросы до старта', 'С чего начнём работу']) assert.equal(html.includes(heading), true)
  for (const heading of ['Как начинается и продолжается работа', 'Прозрачная модель работы', 'Отвечаем до начала работы']) assert.equal(html.includes(heading), false)
})

test('adds example case cards and an accessible review slider without invented proof', () => {
  assert.equal(/id="case-cards"/u.test(html), true)
  assert.equal(/id="reviews"/u.test(html), true)
  assert.equal(/id="review-prev"/u.test(html), true)
  assert.equal(/id="review-next"/u.test(html), true)
  assert.equal(script.includes('reviewSlides'), true)
  assert.equal(html.includes('Рейтинг Рунета'), false)
  assert.equal(html.includes('Сертификат'), false)
})

test('uses full supplied testimonials in messenger-style review bubbles', () => {
  assert.equal(script.includes('Стираем много ковров в Питере, работаем уже 4 года.'), true)
  assert.equal(script.includes('Очень рекомендую Церебро к сотрудничеству.'), true)
  assert.equal(script.includes('<strong>'), true)
  assert.equal(/data-review-message/u.test(script), true)
})

test('uses the approved title for promotion consulting', () => {
  assert.equal(script.includes('Консультируем по продвижению'), true)
  assert.equal(script.includes('Единое окно'), false)
})

test('stages service scope cards as one icon-led dark grid', () => {
  assert.equal(/id="service-scope-cards"[^>]*lg:grid-cols-4/u.test(html), true)
  assert.equal(/serviceScope\.map\(\(\[, t, d, partnerLogo\], index\)/u.test(script), true)
  assert.equal(script.includes('data-service-icon aria-hidden="true"'), true)
  assert.equal(script.includes('lg:translate-y-20'), false)
})

test('renders the five supplied published cases without sending visitors to external pages', () => {
  for (const detail of ['161 → 316', '1 000+', '×4', '78 332', '−57,2%']) assert.equal(script.includes(detail), true)
  assert.equal(/target="_blank"[^>]*rel="noreferrer"/u.test(script), false)
  assert.equal(script.includes('https://blog.церебро.рф/'), false)
  assert.equal(script.includes('Пример формата'), false)
})

test('gives every case a scannable context, task, solution, and three-result structure', () => {
  assert.equal(script.includes('data-case-context'), true)
  assert.equal(script.includes('data-case-task'), true)
  assert.equal(script.includes('data-case-solution'), true)
  assert.equal(script.includes('data-case-results'), true)
  assert.equal(script.includes('Решение'), true)
  assert.equal(script.includes('Результат'), true)
  assert.match(script, /data-case-context class="mt-2 min-w-0/u)
  assert.match(script, /data-case-body[^>]*xl:grid-cols-\[2fr_3fr\]/u)
  assert.match(script, /data-case-solution[^>]*xl:border-l/u)
  assert.match(script, /sm:grid-cols-3/u)
})

test('uses the new case-slider structure without the retired explanatory copy', () => {
  assert.equal(html.includes('Выберите нишу и посмотрите, как мы разбирали задачу'), false)
  assert.equal(html.includes('Наши кейсы'), true)
  assert.equal(/id="case-viewport"/u.test(html), true)
  assert.equal(/id="case-prev"/u.test(html), true)
  assert.equal(/id="case-next"/u.test(html), true)
  assert.equal(/data-case-placeholder/u.test(html), false)
  assert.equal(script.includes("caseViewport.scrollBy"), true)
})

test('keeps a longer case portfolio compact with filters and one-card slider navigation', () => {
  assert.equal(/id="case-filters"/u.test(html), true)
  assert.equal(/id="case-cards"[^>]*flex/u.test(html), true)
  assert.equal(script.includes('casePrevious'), true)
  assert.equal(script.includes('caseNext'), true)
  assert.equal(script.includes('activeCaseFilter'), true)
  assert.equal(html.includes('Не нашли свою нишу?'), true)
})

test('keeps case controls close to cards on mobile and uses a compact case follow-up', () => {
  assert.equal(/data-case-controls[^>]*md:order-2/u.test(html), true)
  assert.equal(html.includes('Подберём кейсы под вашу задачу'), true)
  assert.equal(/data-case-follow-up[^>]*border/u.test(html), true)
})

test('continues the brief in the VK bot and keeps video calls out of the active landing copy', () => {
  assert.equal(script.includes('Заполняете бриф'), true)
  assert.equal(script.includes('Переходите в VK-бот и отвечаете на вопросы о проекте в удобное время'), true)
  assert.equal(script.includes('Специалист изучит ответы, позвонит вам'), true)
  assert.equal(/видеобрифинг|видеозвонок/iu.test(`${html}\n${script}`), false)
  assert.equal(html.includes('На первой встрече'), false)
})

test('uses the approved static gradient and numbered hero facts without a background video', () => {
  assert.equal(script.includes('Было 0${index + 1}'), false)
  assert.equal(script.includes("${label} · ${String(index + 1).padStart(2, '0')}"), false)
  assert.equal(/landingData\.transparency\.map\(\(\[n, t, d\]\)/u.test(script), false)
  assert.doesNotMatch(html, /<video/u)
  assert.doesNotMatch(html, /hero-light-wave\.mp4/u)
  for (const color of ['#2f63f5', '#0a238b', '#06195f']) assert.equal(html.toLowerCase().includes(color), true)
  assert.match(html, /src="\.\/assets\/cerebro-logo\.svg"/u)
  assert.equal(script.includes('data-fact-icon='), false)
  assert.equal((script.match(/data-hero-fact/gu) || []).length, 1)
})

test('keeps the supplied rounded yellow path inside the fixed scene', () => {
  assert.match(html, /hero-composition-line[^>]*viewBox="0 0 410 432"/u)
  assert.match(html, /stroke="#FFD400"[^>]*stroke-width="5"[^>]*stroke-linecap="round"[^>]*stroke-linejoin="round"/u)
  assert.match(html, /M89 404\.637C116\.5 424\.515/u)
})

test('initializes the one-time composition controller instead of the retired line controller', () => {
  assert.match(script, /createHeroCompositionController/u)
  assert.doesNotMatch(script, /createHeroLineMotionController|createHeroMotionController|heroVideo/u)
})

test('places review navigation before the review message', () => {
  assert.equal(html.indexOf('id="review-counter"') < html.indexOf('id="review-slides"'), true)
})

test('collects only the project lead fields and both required legal consents', () => {
  for (const field of ['name', 'phone', 'budget', 'privacyConsent', 'personalDataConsent']) assert.match(html, new RegExp(`name="${field}"`, 'u'))
  for (const removedField of ['email', 'request_type', 'contact_method', 'profile']) assert.doesNotMatch(html, new RegExp(`name="${removedField}"`, 'u'))
})

test('shows the approved bot follow-up only after a valid demo or successful backend submission', async () => {
  assert.match(html, /id="lead-form"[^>]*data-endpoint=""/u)
  assert.match(html, /id="form-status"[^>]*role="status"[^>]*aria-live="polite"/u)
  assert.match(html, /id="lead-success"[^>]*hidden/u)
  assert.match(html, /data-quiz-lead-success[^>]*hidden/u)
  for (const bot of ['vk', 'telegram', 'max']) {
    assert.match(html, new RegExp(`assets/bots/${bot}-bot\\.svg`, 'u'))
    await access(new URL(`./assets/bots/${bot}-bot.svg`, import.meta.url))
  }
  for (const label of ['VK-бот', 'Telegram-бот', 'MAX-бот']) assert.equal((html.match(new RegExp(`>${label}<`, 'gu')) || []).length, 2)
  assert.match(script, /showLeadSuccess/u)
  assert.match(quiz, /showQuizLeadSuccess/u)
  assert.doesNotMatch(html, /<form\b/u)
  assert.equal(script.includes("setFormState('submitting')"), true)
  assert.equal(script.includes("setFormState('success'"), true)
  assert.equal(script.includes("setFormState('error'"), true)
  assert.equal(script.includes('fetch(form.dataset.endpoint'), true)
})

test('keeps conditionally hidden form fields hidden despite Tailwind display utilities', () => {
  assert.match(html, /\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/u)
})

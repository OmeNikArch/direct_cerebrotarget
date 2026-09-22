import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8')
const script = await readFile(new URL('./script.js', import.meta.url), 'utf8')

test('leads media-plan CTAs to the quiz while preserving the consultation route', () => {
  for (const cta of ['header-quiz', 'hero-quiz', 'problems', 'transparency', 'cases', 'pricing']) assert.equal(new RegExp(`<a[^>]*data-cta="${cta}"[^>]*href="#quiz"`, 'u').test(html), true, `CTA ${cta} should lead to the quiz`)
  for (const cta of ['start-promotion', 'start-audit']) assert.equal(script.includes(`'${cta}'`), true, `CTA ${cta} should be defined`)
  assert.equal(/ctaId === 'start-promotion' \? '#contact' : '#quiz'/u.test(script), true, 'Start options should retain separate routes')
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
  assert.equal(/id="quiz-placeholder-lines"/u.test(html), true)
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

test('uses a compact desktop form and padded hero facts', () => {
  assert.equal(/<form[^>]*id="lead-form"[^>]*md:grid-cols-2/u.test(html), true)
  assert.equal(/lg:px-6/u.test(script), true)
})

test('offers both hero actions and keeps fact copy away from its divider', () => {
  assert.match(html, /data-cta="hero-quiz"[^>]*href="#quiz"[^>]*>Получить медиаплан бесплатно<\/a>/u)
  assert.match(html, /data-cta="hero-consultation"[^>]*href="#contact"[^>]*>Обсудить продвижение<\/a>/u)
  assert.equal(script.includes('sm:first:pl-0'), false)
})

test('packs the mobile hero into one viewport with compact proof before the CTA', () => {
  assert.match(html, /min-h-16[^"']*sm:min-h-20/u)
  assert.match(html, /min-h-\[calc\(100svh-4rem\)\][^"']*md:min-h-\[calc\(100svh-5rem\)\]/u)
  assert.match(html, /<h1[^>]*text-\[2rem\][^>]*md:text-\[clamp\(2\.5rem,5\.3vw,4\.65rem\)\]/u)
  assert.match(html, /data-cta="hero-quiz"[^>]*whitespace-nowrap/u)
  assert.match(html, /data-hero-title[^>]*order-1/u)
  assert.match(html, /<aside[^>]*order-2/u)
  assert.match(html, /data-hero-actions[^>]*order-3/u)
  assert.match(html, /id="hero-facts"[^>]*order-4/u)
  assert.equal((html.match(/order-(?:1|2|3|4)[^"']*md:order-none/gu) || []).length, 4)
})

test('stretches the wide-desktop hero across the full container without CTA collisions', () => {
  assert.match(html, /data-hero-layout[^>]*md:grid[^>]*md:grid-cols-12[^>]*lg:grid-cols-12[^>]*xl:grid-cols-12/u)
  assert.match(html, /data-hero-title[^>]*md:col-span-12[^>]*md:row-start-1[^>]*lg:col-span-8[^>]*xl:col-span-7/u)
  assert.match(html, /<aside[^>]*md:col-span-6[^>]*md:col-start-7[^>]*md:row-start-2[^>]*lg:col-span-4[^>]*lg:col-start-9[^>]*lg:row-start-1[^>]*xl:col-span-5[^>]*xl:col-start-8/u)
  assert.match(html, /data-hero-proof-copy[^>]*max-w-none/u)
  assert.match(html, /data-hero-actions[^>]*md:col-span-5[^>]*md:row-start-2[^>]*lg:col-span-4[^>]*lg:row-start-3[^>]*xl:col-span-3/u)
  assert.match(html, /id="hero-facts"[^>]*md:col-span-12[^>]*md:row-start-3[^>]*lg:col-span-8[^>]*lg:col-start-5[^>]*xl:col-span-9[^>]*xl:col-start-4/u)
})

test('aligns the proof directly to its compact and wide desktop grid edge', () => {
  const proof = html.match(/<aside data-hero-reveal[^>]*class="([^"]*)"/u)?.[1] || ''
  assert.doesNotMatch(proof, /lg:-ml-4|lg:pl-9/u)
})

test('uses a fixed 80 pixel gap throughout the desktop layout', () => {
  assert.match(html, /data-hero-layout[^>]*lg:grid-rows-\[auto_5rem_auto\]/u)
  assert.doesNotMatch(html, /2xl:grid-rows-\[auto_1fr_auto\]/u)
  assert.match(html, /data-hero-proof-copy[^>]*lg:text-lg/u)
})

test('does not use breakpoint-specific negative margins to position the desktop lower row', () => {
  assert.doesNotMatch(html, /data-hero-actions[^>]*2xl:-mt-20/u)
  assert.doesNotMatch(html, /id="hero-facts"[^>]*2xl:-mt-20/u)
})

test('removes the redundant hero scroll indicator', () => {
  assert.doesNotMatch(html, /hero-scroll-indicator|Прокрутить к следующему разделу/u)
})

test('removes decorative line and reduces partner badges only on mobile', () => {
  assert.match(html, /data-hero-line[^>]*hidden[^>]*md:block/u)
  assert.equal((html.match(/h-14 w-14[^"']*lg:h-24 lg:w-24/gu) || []).length, 2)
})

test('keeps the final form as the consultation route and points media-plan seekers to the quiz', () => {
  assert.equal(html.includes('Нужна консультация'), true)
  assert.equal(html.includes('Обсудим вашу задачу и следующий шаг'), true)
  assert.equal(html.includes('Отправить заявку'), true)
  assert.equal(/href="#quiz"[^>]*>Нужен бесплатный медиаплан\?/u.test(html), true)
  assert.equal(html.includes('Оставьте заявку на продвижение'), false)
})

test('shows conditions as one concise pricing table and keeps the CTA on one line', () => {
  assert.equal(/<table[^>]*data-pricing-table/u.test(html), true)
  assert.equal((html.match(/<tr\b/gu) || []).length >= 3, true)
  assert.equal(/pricing-cards/u.test(html), false)
  assert.equal(/data-cta="pricing"[^>]*whitespace-nowrap/u.test(html), true)
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
  assert.equal(/serviceScope\.map\(\(\[, t, d\], index\)/u.test(script), true)
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

test('uses the supplied 10 pixel gradient path inside a reserved lower hero band', () => {
  const path = html.match(/<path class="hero-line-path"[^>]*d="([^"]+)"/u)

  assert.ok(path, 'hero line path should exist')
  assert.equal((path[1].match(/M/gu) || []).length, 1)
  assert.equal(path[1], 'M1926.85 6.05902C1693.35 141.23 1698.35 -8.8743 1589.85 6.05963C1481.35 20.9936 1381.85 93.7478 1325.35 86.2135C1268.85 78.6792 1326.85 23.496 1246.85 14.1003C1150.35 2.76666 979.352 45.8834 850.608 78.2405C721.864 110.598 567.852 114.043 550.069 86.2135C532.286 58.3836 571.352 6.05963 629.852 24.5C688.352 42.9404 547.854 94.0564 440.311 72.039C332.767 50.0215 306.352 6.05963 207.852 6.05963C109.352 6.05963 29.5375 67.0736 0.851562 72.039')
  assert.match(html, /data-hero-line[^>]*h-\[110px\][^>]*viewBox="0 0 1930 110"/u)
  assert.match(html, /class="hero-line-path"[^>]*stroke="url\(#hero-line-gradient\)"[^>]*stroke-width="10"/u)
  assert.match(html, /<stop stop-color="#FFD400"\s*\/>/u)
  assert.match(html, /<stop offset="1" stop-color="#FFD400"\s*\/>/u)
  assert.match(html, /data-hero-layout[^>]*md:pb-36/u)
  assert.doesNotMatch(html, /data-hero-line[^>]*translate-y/u)
  assert.match(html, /id="hero"[^>]*overflow-hidden/u)
})

test('initializes the reversible line controller instead of the retired video controller', () => {
  assert.match(script, /createHeroLineMotionController/u)
  assert.doesNotMatch(script, /createHeroMotionController|heroVideo/u)
})

test('places review navigation before the review message', () => {
  assert.equal(html.indexOf('id="review-counter"') < html.indexOf('id="review-slides"'), true)
})

test('collects only the project lead fields and consent', () => {
  for (const field of ['name', 'phone', 'budget', 'consent']) assert.match(html, new RegExp(`name="${field}"`, 'u'))
  for (const removedField of ['email', 'request_type', 'contact_method', 'profile']) assert.doesNotMatch(html, new RegExp(`name="${removedField}"`, 'u'))
})

test('prepares honest Bitrix submission and a VK brief success state', () => {
  assert.match(html, /id="lead-form"[^>]*data-endpoint=""/u)
  assert.match(html, /id="lead-form"[^>]*data-vk-bot-url=""/u)
  assert.match(html, /id="form-status"[^>]*role="status"[^>]*aria-live="polite"/u)
  assert.match(html, /id="lead-success"[^>]*hidden/u)
  assert.match(html, /id="vk-brief-link"[^>]*bg-\[#0077FF\]/u)
  assert.equal(script.includes("setFormState('submitting')"), true)
  assert.equal(script.includes("setFormState('success'"), true)
  assert.equal(script.includes("setFormState('error'"), true)
  assert.equal(script.includes('fetch(form.dataset.endpoint'), true)
})

test('keeps conditionally hidden form fields hidden despite Tailwind display utilities', () => {
  assert.match(html, /\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/u)
})

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const redesignHtml = await readFile(new URL('./index.html', import.meta.url), 'utf8')
const redesignScript = await readFile(new URL('./script.js', import.meta.url), 'utf8')

test('keeps the approved hero offer while reserving a safe lower band for the line', () => {
  const hero = redesignHtml.match(/<section id="hero"[\s\S]*?<\/section>/u)?.[0] || ''
  assert.match(hero, /Приведём целевые заявки из Яндекс Директа/u)
  assert.match(hero, /Получить медиаплан бесплатно/u)
  assert.match(hero, /data-hero-layout[^>]*md:pb-36/u)
  assert.doesNotMatch(hero, /hero-scroll-indicator|Прокрутить к следующему разделу/u)
  assert.match(hero, /data-hero-line[^>]*h-\[110px\][^>]*viewBox="0 0 1930 110"/u)
})

test('adds a sticky header state layer without changing its height', () => {
  assert.match(redesignHtml, /<header[^>]*data-site-header[^>]*fixed/u)
  assert.match(redesignHtml, /data-header-backdrop/u)
  assert.match(redesignScript, /createStickyHeaderController/u)
})

test('groups problems and service scope into one dark chapter', () => {
  const chapter = redesignHtml.match(/<section id="experience-dark"[\s\S]*?<\/section>/u)?.[0] || ''
  assert.match(chapter, /Ваша реклама часто не окупается\?/u)
  assert.match(chapter, /Как мы работаем с вашим проектом/u)
})

test('uses the four supplied decorative service icons without visible service numbers', () => {
  for (const name of ['01-strategy.svg', '02-launch.svg', '03-analytics.svg', '04-site-recommendations.svg']) {
    assert.equal(redesignScript.includes(`./assets/service-icons/${name}`), true)
  }
  assert.match(redesignScript, /data-service-icon[^>]*aria-hidden="true"/u)
  assert.doesNotMatch(redesignScript, /serviceScope\.map\(\(\[n, t, d\]/u)
})

test('renders five real case images inside a swipeable scroll-snap carousel', () => {
  for (const name of ['dentistry.png', 'education.png', 'atv.png', 'marketplace.png', 'furniture.png']) {
    assert.equal(redesignScript.includes(`./assets/cases/${name}`), true)
  }
  assert.match(redesignHtml, /id="case-viewport"[^>]*snap-x/u)
  assert.match(redesignScript, /data-case-image[\s\S]*?<img/u)
})

test('provides the required footer links on a seamless dark continuation', () => {
  assert.match(redesignHtml, /Политика конфиденциальности/u)
  assert.match(redesignHtml, /Согласие на обработку персональных данных/u)
  assert.match(redesignHtml, /href="#top"[^>]*>Наверх/u)
  assert.equal((redesignHtml.match(/data-legal-placeholder/gu) || []).length, 2)
  assert.match(redesignHtml, /<footer[^>]*bg-night[^>]*text-white/u)
  assert.doesNotMatch(redesignHtml, /<footer[\s\S]*?<a[^>]*bg-night[^>]*aria-label="Церебро — к началу страницы"/u)
})

test('connects form errors to controls and focuses the first invalid field', () => {
  assert.match(redesignHtml, /name="name"[^>]*aria-describedby="name-error"/u)
  assert.match(redesignHtml, /id="name-error"[^>]*data-error="name"/u)
  assert.match(redesignScript, /control\?\.setAttribute\('aria-invalid'/u)
  assert.match(redesignScript, /firstInvalid\?\.focus/u)
})

test('keeps reduced-motion interactions informative without positional movement', () => {
  assert.match(redesignHtml, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.mobile-menu \{ transform: none/u)
  assert.match(redesignHtml, /\.button-press:active \{ transform: none/u)
  assert.match(redesignScript, /behavior: reduceMotion \? 'auto' : 'smooth'/u)
})

test('keeps the header visually merged with hero until scrolling starts', () => {
  assert.match(redesignHtml, /<header[^>]*bg-transparent/u)
  assert.match(redesignHtml, /data-header-backdrop/u)
  assert.match(redesignHtml, /\[data-site-header\]\.is-scrolled \[data-header-backdrop\] \{ opacity: 1/u)
  assert.match(redesignHtml, /\.hero-top-fill \{ background: #3c5cdd; \}/u)
  assert.match(redesignHtml, /<div[^>]*header-hero-bridge[^>]*hero-top-fill/u)
})

test('removes the retired before-after section and its runtime hookup', () => {
  assert.doesNotMatch(redesignHtml, /id="before-after"/u)
  assert.doesNotMatch(redesignScript, /createBeforeAfterToggle/u)
})

test('applies the refined spacing, CTA, pricing, contact, and review treatments', () => {
  assert.match(redesignHtml, /id="problems"[^>]*gap-3/u)
  assert.match(redesignHtml, /id="service-scope-cards"[^>]*gap-3/u)
  assert.match(redesignHtml, /data-problems-cta[^>]*text-white/u)
  assert.match(redesignHtml, /data-case-follow-up[^>]*bg-night/u)
  assert.match(redesignHtml, /data-pricing-cta[^>]*bg-sky/u)
  assert.match(redesignHtml, /data-pricing-table[^>]*pricing-table/u)
  assert.match(redesignHtml, /id="contact"[^>]*hero-gradient/u)
  assert.match(redesignHtml, /id="reviews"[^>]*review-pattern/u)
  assert.match(redesignHtml, /id="reviews"[^>]*rounded-\[var\(--radius-card\)\]/u)
  assert.match(redesignHtml, /review-pattern\.png/u)
})

test('uses square sky process numbers and a fade hint on the case carousel', () => {
  assert.match(redesignScript, /data-process-number/u)
  assert.match(redesignScript, /h-10 w-10[^`]*bg-sky[^`]*text-white/u)
  assert.match(redesignHtml, /case-stage/u)
})

test('uses dot tiles only to complete intentional empty grid cells', () => {
  assert.doesNotMatch(redesignHtml, /absolute right-0 top-0[^>]*dot-field-dark/u)
  assert.match(redesignHtml, /data-problems-pattern[^>]*dot-field-dark/u)
  assert.match(redesignScript, /data-process-pattern[^>]*dot-field-light/u)
  assert.match(redesignScript, /data-transparency-pattern[^>]*dot-field-light/u)
  assert.doesNotMatch(redesignHtml, /data-problems-pattern[^>]*bg-/u)
  assert.doesNotMatch(redesignScript, /data-process-pattern[^>]*bg-/u)
  assert.doesNotMatch(redesignScript, /data-transparency-pattern[^>]*bg-/u)
  assert.match(redesignHtml, /@media \(max-width: 767px\)[\s\S]*?\[data-layout-pattern\] \{ display: none/u)
})

test('finishes the highlighted cards with the shared visual system', () => {
  assert.match(redesignHtml, /data-quiz-card[^>]*rounded-\[var\(--radius-card\)\]/u)
  assert.match(redesignScript, /bg-sky\/80 p-5 text-ink[^`]*text-xs text-brand">Станет/u)
  assert.match(redesignScript, /bg-white\/\[\.055\][^`]*text-white/u)
  assert.match(redesignHtml, /data-pricing-table[^>]*pricing-table[^>]*text-white/u)
  assert.match(redesignHtml, /\.pricing-table th \{ background: rgb\(31 55 101 \/ \.96\)/u)
  assert.match(redesignHtml, /\.pricing-table td \{ background: rgb\(12 32 73 \/ \.96\)/u)
})

test('lets the problems CTA sit directly on the section background', () => {
  const cta = redesignHtml.match(/<div data-problems-cta[^>]*class="([^"]*)"/u)?.[1] || ''
  assert.doesNotMatch(cta, /\bbg-/u)
  assert.doesNotMatch(cta, /(?:^|\s)(?:p|px|pl|pr)-/u)
  assert.match(redesignHtml, /data-cta="problems"[^>]*bg-accent[^>]*text-ink/u)
})

test('aligns the hero proof with its grid edge without decoration', () => {
  const proof = redesignHtml.match(/<aside data-hero-reveal[^>]*class="([^"]*)"/u)?.[1] || ''
  assert.doesNotMatch(proof, /border-l|(?:^|\s)(?:pl|ml)-/u)
  assert.doesNotMatch(redesignHtml, /data-hero-logos[^>]*dot-field/u)
})

test('moves the pricing note inside desktop and mobile pricing surfaces', () => {
  assert.match(redesignHtml, /data-pricing-table[\s\S]*?<tfoot>[\s\S]*?Аудит, стратегия и запуск включены/u)
  assert.match(redesignHtml, /data-pricing-note-mobile[^>]*bg-night[^>]*>Аудит, стратегия и запуск включены/u)
  assert.doesNotMatch(redesignHtml, /<\/table><\/div><p class="mt-5[^>]*">Аудит, стратегия/u)
})

test('uses full-width start cards with reserved illustration slots and no side images', () => {
  assert.doesNotMatch(redesignHtml, /class="start-media|assets\/cases\/(?:dentistry|furniture)\.png/u)
  assert.match(redesignHtml, /id="start-options"[^>]*container-page[^>]*md:grid-cols-2/u)
  assert.match(redesignScript, /data-start-media-slot/u)
  assert.match(redesignScript, /grid-cols-\[minmax\(0,1fr\)_96px\][^`]*sm:grid-cols-\[minmax\(0,1fr\)_144px\]/u)
})

test('presents the agency statistic in a wide hero-gradient card', () => {
  const trust = redesignHtml.match(/<section id="trust"[\s\S]*?<section id="faq"/u)?.[0] || ''
  assert.doesNotMatch(trust, /border-l-4 border-accent/u)
  assert.match(trust, /data-trust-stat[^>]*hero-gradient[^>]*text-white/u)
  assert.match(trust, /data-trust-stat[\s\S]*?cerebro-badge\.png[\s\S]*?data-count-up="3000"/u)
})

test('matches the contact form to the quiz card and offsets the select arrow', () => {
  assert.match(redesignHtml, /id="lead-form"[^>]*data-contact-form-card[^>]*border[^>]*bg-white/u)
  assert.match(redesignHtml, /<select[^>]*appearance-none[^>]*pr-12[^>]*name="budget"/u)
  assert.match(redesignHtml, /data-select-arrow[^>]*right-4/u)
  assert.match(redesignHtml, /<button[^>]*bg-accent[^>]*type="submit"/u)
})

test('styles the quiz next control like the shared project buttons', () => {
  assert.match(redesignHtml, /data-quiz-next[^>]*button-press[^>]*bg-brand[^>]*disabled/u)
  assert.doesNotMatch(redesignHtml, /data-quiz-next[^>]*rounded-full/u)
})

test('uses compact yellow service icons without separator bars', () => {
  assert.match(redesignScript, /data-service-icon[^>]*h-7 w-7[^>]*bg-accent/u)
  assert.doesNotMatch(redesignScript, /mt-8 block h-1 w-8 bg-accent/u)
})

test('uses a clean sky case chapter and borderless niche filters', () => {
  const proof = redesignHtml.match(/<section id="proof"[\s\S]*?<\/section>/u)?.[0] || ''
  assert.match(proof, /surface-sky/u)
  assert.doesNotMatch(proof, /dot-field-light/u)
  assert.match(redesignHtml, /\.case-stage::after \{[^}]*rgb\(198 226 255 \/ \.96\)/u)
  assert.match(redesignScript, /<button class="button-press px-4 py-2[^`]*bg-brand text-white/u)
  assert.doesNotMatch(redesignScript, /<button class="button-press[^"`]*border(?:-|\s)[^"`]*"[^>]*data-case-filter/u)
})

test('adds a dot tile to pricing and uses the blue media-plan action', () => {
  assert.match(redesignHtml, /data-pricing-pattern[^>]*dot-field-light/u)
  assert.match(redesignHtml, /data-cta="pricing"[^>]*bg-brand[^>]*text-white/u)
})

test('makes the messenger treatment more visible and uses the approved label', () => {
  assert.match(redesignHtml, /\.review-pattern \{[^}]*linear-gradient\(145deg/u)
  assert.match(redesignScript, />Сообщение клиента Ц<\/span>/u)
})

test('shows full navigation from the tablet breakpoint', () => {
  assert.match(redesignHtml, /<nav[^>]*hidden[^>]*md:flex[^>]*aria-label="Основная навигация"/u)
  assert.match(redesignHtml, /id="menu-button"[^>]*md:hidden/u)
  assert.match(redesignHtml, /id="mobile-menu"[^>]*md:hidden/u)
})

test('stacks the fit reasons beside a sticky heading until the mobile breakpoint', () => {
  assert.match(redesignHtml, /data-fit-layout[^>]*md:grid-cols-12[^>]*md:items-start/u)
  assert.match(redesignHtml, /data-fit-heading[^>]*md:sticky[^>]*md:top-28[^>]*md:col-span-4/u)
  assert.match(redesignHtml, /id="fit-cards"[^>]*md:col-span-8/u)
  assert.doesNotMatch(redesignHtml, /id="fit-cards"[^>]*md:grid-cols-2/u)
})

test('integrates a compact white illustration inside every fit card', () => {
  assert.match(redesignScript, /const fitImages = \[/u)
  assert.equal((redesignScript.match(/\.\/assets\/fit\//gu) || []).length, 4)
  assert.match(redesignScript, /data-fit-image/u)
  assert.match(redesignScript, /grid-cols-\[minmax\(0,1fr\)_104px\][^`]*sm:grid-cols-\[minmax\(0,1fr\)_144px\]/u)
  assert.match(redesignScript, /<figure class="order-2[^"]*bg-white/u)
  assert.doesNotMatch(redesignScript, /order-first[^`]*data-fit-image/u)
  assert.match(redesignScript, /data-fit-image[^>]*object-contain/u)
})

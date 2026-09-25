import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const redesignHtml = await readFile(new URL('./index.html', import.meta.url), 'utf8')
const redesignScript = await readFile(new URL('./script.js', import.meta.url), 'utf8')

test('uses the approved right-side composition and retains hero CTA routes', () => {
  const hero = redesignHtml.match(/<section id="hero"[\s\S]*?<\/section>/u)?.[0] || ''
  assert.match(hero, /Приведём целевые заявки из Яндекс Директа/u)
  assert.match(hero, /data-hero-composition/u)
  assert.match(hero, /yandex-medallion\.png/u)
  assert.match(hero, /cerebro-medallion\.png/u)
  assert.match(hero, /href="#quiz"[^>]*>Получить медиаплан бесплатно/u)
  assert.match(hero, /href="#contact"[^>]*>Обсудить продвижение/u)
  assert.doesNotMatch(hero, /data-hero-line|hero-line-path|joltaya_line2|hero-scroll-indicator/u)
})

test('keeps the scene geometry invariant below desktop', () => {
  assert.match(redesignHtml, /\.hero-composition\s*\{[^}]*aspect-ratio:\s*451\s*\/\s*460/su)
  const mobileCss = redesignHtml.match(/@media \(max-width: 767px\) \{([\s\S]*?)\n\s*\}/u)?.[1] || ''
  assert.doesNotMatch(mobileCss, /hero-composition-(?:line|yandex|cerebro)/u)
})

test('adds a sticky header state layer without changing its height', () => {
  assert.match(redesignHtml, /<header[^>]*data-site-header[^>]*fixed/u)
  assert.match(redesignHtml, /data-header-backdrop/u)
  assert.match(redesignScript, /createStickyHeaderController/u)
})

test('groups problems and service scope into one light chapter', () => {
  const chapter = redesignHtml.match(/<section id="experience-dark"[\s\S]*?<\/section>/u)?.[0] || ''
  assert.match(chapter, /Ваша реклама часто не окупается\?/u)
  assert.match(chapter, /Как мы работаем с вашим проектом/u)
  assert.match(chapter, /surface-paper[^>]*text-ink/u)
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
  assert.match(redesignHtml, /<footer[^>]*py-10[^>]*text-white/u)
  assert.doesNotMatch(redesignHtml, /<footer[\s\S]*?<a[^>]*bg-brand-deep[^>]*aria-label="Церебро — к началу страницы"/u)
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
  assert.match(redesignHtml, /\.hero-top-fill \{ background: #2F63F5; \}/u)
  assert.match(redesignHtml, /<div[^>]*header-hero-bridge[^>]*hero-top-fill/u)
})

test('removes the retired before-after section and its runtime hookup', () => {
  assert.doesNotMatch(redesignHtml, /id="before-after"/u)
  assert.doesNotMatch(redesignScript, /createBeforeAfterToggle/u)
})

test('applies the refined spacing, CTA, pricing, contact, and review treatments', () => {
  assert.match(redesignHtml, /id="problems"[^>]*gap-6/u)
  assert.match(redesignHtml, /id="service-scope-cards"[^>]*gap-3/u)
  assert.match(redesignHtml, /data-problems-cta[^>]*text-ink/u)
  assert.match(redesignHtml, /data-case-follow-up[^>]*bg-brand-deep/u)
  assert.match(redesignHtml, /data-pricing-cta[^>]*bg-blue-soft/u)
  assert.match(redesignHtml, /data-pricing-table[^>]*pricing-table/u)
  assert.match(redesignHtml, /contact-footer-gradient[\s\S]*?id="contact"/u)
  assert.match(redesignHtml, /id="reviews"[^>]*review-pattern/u)
  assert.match(redesignHtml, /id="reviews"[^>]*rounded-\[var\(--radius-card\)\]/u)
  assert.match(redesignHtml, /review-pattern-v2\.png/u)
})

test('uses square sky process numbers and a fade hint on the case carousel', () => {
  assert.match(redesignScript, /data-process-number/u)
  assert.match(redesignScript, /h-\[30px\] w-\[30px\][^`]*bg-blue-soft[^`]*text-white/u)
  assert.match(redesignHtml, /case-stage/u)
})

test('removes all decorative dot tiles while preserving the review artwork', () => {
  assert.doesNotMatch(redesignHtml, /dot-field-(?:light|dark)|data-(?:layout|problems|pricing)-pattern/u)
  assert.doesNotMatch(redesignScript, /dot-field-(?:light|dark)|data-process-pattern|data-start-media-slot/u)
  assert.match(redesignHtml, /id="reviews"[^>]*review-pattern/u)
  assert.match(redesignHtml, /review-pattern-v2\.png/u)
})

test('finishes the highlighted cards with the shared visual system', () => {
  assert.match(redesignHtml, /data-quiz-card[^>]*rounded-\[var\(--radius-card\)\]/u)
  assert.match(redesignScript, /data-problem-card[^`]*grid-cols-\[26px_1fr\][^`]*bg-blue-soft/u)
  assert.match(redesignScript, /data-problem-solution[^`]*bg-white[^`]*Решение/u)
  assert.match(redesignHtml, /data-pricing-table[^>]*pricing-table[^>]*text-ink/u)
  assert.match(redesignHtml, /\.pricing-table th \{ background: #E9EEFF; \}/u)
  assert.match(redesignHtml, /\.pricing-table td \{ background: #FFFFFF; \}/u)
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
  assert.match(redesignHtml, /data-pricing-note-mobile[^>]*bg-surface[^>]*>Аудит, стратегия и запуск включены/u)
  assert.doesNotMatch(redesignHtml, /<\/table><\/div><p class="mt-5[^>]*">Аудит, стратегия/u)
})

test('uses full-width start cards without decorative side slots or side images', () => {
  const startCards = redesignScript.match(/render\('start-options',[\s\S]*?\.join\(''\)\)/u)?.[0] || ''
  assert.doesNotMatch(redesignHtml, /class="start-media|assets\/cases\/(?:dentistry|furniture)\.png/u)
  assert.match(redesignHtml, /id="start-options"[^>]*container-page[^>]*md:grid-cols-2/u)
  assert.doesNotMatch(startCards, /data-start-media-slot|grid-cols-\[minmax\(0,1fr\)_/u)
  assert.match(startCards, /<article class="flex min-h-\[286px\][^`]*bg-white\/90/u)
})

test('presents the agency statistic in a wide hero-gradient card', () => {
  const trust = redesignHtml.match(/<section id="trust"[\s\S]*?<section id="faq"/u)?.[0] || ''
  assert.doesNotMatch(trust, /border-l-4 border-accent/u)
  assert.match(trust, /data-trust-stat[^>]*hero-gradient[^>]*text-white/u)
  assert.match(trust, /data-trust-stat[\s\S]*?trust-logo\.svg[\s\S]*?data-count-up="3000"/u)
  assert.match(trust, /data-draw-line[^>]*trust-line-path/u)
})

test('keeps the promotion form independent and offsets its select arrow', () => {
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
  assert.match(proof, /surface-paper/u)
  assert.doesNotMatch(proof, /dot-field-light/u)
  assert.match(redesignHtml, /\.case-stage::after \{[^}]*rgb\(244 246 250 \/ \.96\)/u)
  assert.match(redesignScript, /<button class="button-press px-4 py-2[^`]*bg-brand text-white/u)
  assert.doesNotMatch(redesignScript, /<button class="button-press[^"`]*border(?:-|\s)[^"`]*"[^>]*data-case-filter/u)
})

test('keeps pricing free of decorative dot tiles and uses the blue media-plan action', () => {
  assert.doesNotMatch(redesignHtml, /data-pricing-pattern|dot-field-light/u)
  assert.match(redesignHtml, /data-cta="pricing"[^>]*bg-brand[^>]*text-white/u)
})

test('makes the messenger treatment more visible and uses the approved label', () => {
  assert.match(redesignHtml, /\.review-pattern \{[^}]*background-color: #E9EEFF/u)
  assert.match(redesignHtml, /\.review-pattern::before \{[^}]*opacity: \.18/u)
  assert.match(redesignHtml, /\.review-pattern::before \{[^}]*background-position: left top/u)
  assert.match(redesignHtml, /\.review-pattern::before \{[^}]*background-size: 640px auto/u)
  assert.match(redesignHtml, /\.review-pattern > \* \{[^}]*z-index: 1/u)
  assert.match(redesignScript, />Сообщение клиента Ц<\/span>/u)
})

test('uses the hero gradient for quiz and the shared contact/footer surface', () => {
  assert.match(redesignHtml, /<section id="quiz"[^>]*hero-gradient[^>]*text-white/u)
  assert.match(redesignHtml, /\.contact-footer-gradient \{ background: linear-gradient\(135deg, #2F63F5 0%, #0A238B 60%, #06195F 100%\); \}/u)
  assert.match(redesignHtml, /data-hero-proof-copy[^>]*text-white\/75/u)
  assert.match(redesignHtml, /id="contact"[\s\S]*?text-white\/75/u)
})

test('draws the supplied yellow lines along their SVG paths', () => {
  assert.match(redesignHtml, /data-case-follow-up[^>]*relative[^>]*overflow-hidden/u)
  assert.match(redesignHtml, /data-case-line[^>]*left-\[26%\][^>]*-top-7[^>]*h-\[calc\(100%\+28px\)\][^>]*w-\[49%\]/u)
  assert.match(redesignHtml, /data-trust-line[^>]*inset-y-0[^>]*right-0[^>]*h-full[^>]*w-\[46%\][^>]*preserveAspectRatio="none"/u)
  assert.match(redesignHtml, /class="draw-line-path case-cta-line-path"[^>]*pathLength="1"/u)
  assert.match(redesignHtml, /class="draw-line-path trust-line-path"[^>]*pathLength="1"/u)
  assert.match(redesignScript, /createPathDrawOnViewController/u)
})

test('uses white result cells with larger aligned case figures', () => {
  assert.match(redesignScript, /data-case-result[^>]*bg-white/u)
  assert.match(redesignScript, /data-case-result[^>]*flex[^>]*flex-col/u)
  assert.match(redesignScript, /text-2xl[^`]*md:text-3xl/u)
  assert.doesNotMatch(redesignScript, /data-case-results[^`]*bg-paper/u)
})

test('keeps the top header transparent and removes the scrolled divider', () => {
  const headerBackdrop = redesignHtml.match(/<div data-header-backdrop[^>]*class="([^"]*)"/u)?.[1] || ''
  assert.doesNotMatch(headerBackdrop, /border-b|border-border/u)
})

test('shows full navigation from the tablet breakpoint', () => {
  assert.match(redesignHtml, /<nav[^>]*hidden[^>]*md:flex[^>]*aria-label="Основная навигация"/u)
  assert.match(redesignHtml, /id="menu-button"[^>]*md:hidden/u)
  assert.match(redesignHtml, /id="mobile-menu"[^>]*md:hidden/u)
})

test('keeps the fit heading beside cards on desktop and above them on tablet and mobile', () => {
  assert.match(redesignHtml, /data-fit-layout[^>]*lg:grid-cols-12[^>]*lg:items-start/u)
  assert.match(redesignHtml, /data-fit-heading[^>]*lg:sticky[^>]*lg:top-28[^>]*lg:col-span-4/u)
  assert.match(redesignHtml, /id="fit-cards"[^>]*lg:col-span-8/u)
  assert.doesNotMatch(redesignHtml, /id="fit-cards"[^>]*md:grid-cols-2/u)
})

test('uses the approved fit preview composition without upscaling on wider cards', () => {
  assert.match(redesignScript, /const fitImages = \[/u)
  assert.equal((redesignScript.match(/\.\/assets\/fit\//gu) || []).length, 4)
  assert.match(redesignScript, /data-fit-image/u)
  assert.match(redesignScript, /<article class="relative overflow-hidden bg-white"><figure data-fit-art/u)
  assert.match(redesignScript, /data-fit-art[^>]*inset-y-0 right-0 w-full/u)
  assert.match(redesignHtml, /#fit-cards \[data-fit-art\] \{ max-width: 764px; \}/u)
  assert.match(redesignScript, /data-fit-image[^>]*absolute[^>]*object-contain/u)
  assert.doesNotMatch(redesignScript, /data-fit-card-number|text-ink\/45">\$\{n\}/u)
  assert.match(redesignHtml, /#fit-cards \[data-fit-image\] \{ top: 50%; bottom: auto; right: -8%; width: 41%; opacity: \.5; transform: translateY\(-50%\); \}/u)
  assert.match(redesignHtml, /#fit-cards > article:nth-child\(3\) \[data-fit-image\] \{ top: 41%; \}/u)
  assert.match(redesignHtml, /#fit-cards > article:nth-child\(4\) \[data-fit-image\] \{ transform: translateY\(-50%\) scaleX\(-1\); \}/u)
  assert.match(redesignHtml, /#fit-cards > article:nth-child\(n\) \[data-fit-image\] \{ top: 50%; right: calc\(-28% \+ 30px\); width: 68%; \}/u)
})

test('renders the approved responsive transparency bento with five edge-positioned illustrations', () => {
  assert.match(redesignHtml, /script\.js\?v=problems-layout-5/u)
  const expectedImages = [
    '01-dashboard-access.png',
    '02-approving-changes.png',
    '03-promotion-consultation.png',
    '04-always-in-touch.png',
    '05-transparent-expenses.png',
  ]

  for (const name of expectedImages) {
    assert.equal(redesignScript.includes(`./assets/transparency/${name}`), true)
  }

  assert.match(redesignHtml, /id="transparency-cards"[^>]*md:grid-cols-2[^>]*lg:grid-cols-12/u)
  assert.match(redesignScript, /data-transparency-card/u)
  assert.match(redesignScript, /data-transparency-image/u)
  assert.match(redesignScript, /transparency-card[^`]*relative[^`]*overflow-hidden/u)
  assert.match(redesignScript, /index === 0 \? 'md:col-span-2 lg:col-span-8' : 'lg:col-span-4'/u)
  assert.doesNotMatch(redesignScript, /data-transparency-pattern/u)
  assert.match(redesignHtml, /@media \(min-width: 1024px\)[\s\S]*?\.transparency-art-1 \{ bottom: -22%; \}[\s\S]*?\.transparency-art-5 \{ bottom: -20%; \}/u)
  assert.match(redesignHtml, /@media \(min-width: 768px\) and \(max-width: 1023px\)[\s\S]*?\.transparency-art-1 \{[^}]*bottom: -16%;/u)
  assert.match(redesignHtml, /@media \(min-width: 560px\) and \(max-width: 767px\)[\s\S]*?\.transparency-art \{ width: 52%;[^}]*\}[\s\S]*?\.transparency-art-1 \{ width: 46%;/u)
  assert.match(redesignHtml, /@media \(max-width: 559px\)[\s\S]*?\.transparency-art \{ right: -12%; \}[\s\S]*?\.transparency-art-1 \{ right: -8%; \}/u)
})

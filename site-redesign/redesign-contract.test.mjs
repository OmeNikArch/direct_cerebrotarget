import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const sourceHtml = await readFile(new URL('../site/index.html', import.meta.url), 'utf8')
const redesignHtml = await readFile(new URL('./index.html', import.meta.url), 'utf8')
const redesignScript = await readFile(new URL('./script.js', import.meta.url), 'utf8')

const heroFragment = (html) => html.match(/<section id="hero"[\s\S]*?<\/section>/u)?.[0]

test('keeps the complete hero section unchanged', () => {
  assert.equal(heroFragment(redesignHtml), heroFragment(sourceHtml))
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

test('provides the required light footer links without inventing legal URLs', () => {
  assert.match(redesignHtml, /Политика конфиденциальности/u)
  assert.match(redesignHtml, /Согласие на обработку персональных данных/u)
  assert.match(redesignHtml, /href="#top"[^>]*>Наверх/u)
  assert.equal((redesignHtml.match(/data-legal-placeholder/gu) || []).length, 2)
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
  assert.match(redesignHtml, /data-problems-cta[^>]*bg-sky/u)
  assert.match(redesignHtml, /data-case-follow-up[^>]*bg-night/u)
  assert.match(redesignHtml, /data-pricing-cta[^>]*bg-sky/u)
  assert.match(redesignHtml, /data-pricing-table[^>]*pricing-table/u)
  assert.match(redesignHtml, /id="contact"[^>]*hero-gradient/u)
  assert.match(redesignHtml, /id="reviews"[^>]*review-pattern/u)
  assert.match(redesignHtml, /review-pattern\.png/u)
})

test('uses square blue process numbers and a fade hint on the case carousel', () => {
  assert.match(redesignScript, /data-process-number/u)
  assert.match(redesignScript, /h-10 w-10[^`]*bg-sky/u)
  assert.match(redesignHtml, /case-stage/u)
})

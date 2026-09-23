import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const page = await readFile(new URL('./index.html', import.meta.url), 'utf8')
const decorativeSvgs = await Promise.all([
  './assets/case-cta-line.svg',
  './assets/trust-line.svg',
  './assets/trust-logo.svg',
].map((path) => readFile(new URL(path, import.meta.url), 'utf8')))
const reviewPattern = await readFile(new URL('./assets/review-pattern-v2.png', import.meta.url))

test('uses the approved redesign palette and one approved gradient', () => {
  for (const color of ['#0a238b', '#2f63f5', '#ffd400', '#f4f6fa', '#ffffff', '#152038', '#526078', '#dce3ee', '#e9eeff', '#fff7cc', '#06195f']) {
    assert.match(page, new RegExp(color, 'i'))
  }

  assert.match(page, /linear-gradient\(135deg, #2F63F5 0%, #0A238B 60%, #06195F 100%\)/)
  for (const legacyColor of ['#06133a', '#0c2049', '#c6e2ff', '#1f7cff', '#3c5cdd', '#d9ecff', '#bcdcff', '#edf3fa', '#f7f9fd']) {
    assert.doesNotMatch(page, new RegExp(legacyColor, 'i'))
  }
})

test('keeps decorative SVG colors inside the approved palette', () => {
  const allowedColors = new Set(['#ffffff', '#ffd400'])

  for (const svg of decorativeSvgs) {
    const colors = svg.match(/#[0-9a-f]{6}/gi) ?? []
    for (const color of colors) {
      assert.ok(allowedColors.has(color.toLowerCase()), `unexpected decorative color: ${color}`)
    }
    assert.doesNotMatch(svg, /<linearGradient\b/i)
  }

  assert.doesNotMatch(page, /#(?:FDD101|FFAF00)/i)
  assert.doesNotMatch(page, /id="case-cta-line-gradient"/)
})

test('keeps the review artwork transparent so blue-soft remains the true base color', () => {
  const pngColorType = reviewPattern[25]
  assert.ok([4, 6].includes(pngColorType), `review pattern PNG must include alpha, got color type ${pngColorType}`)
})

test('keeps CTA contrast and a visible keyboard focus style', () => {
  assert.match(page, /bg-accent[^\n]*text-ink/)
  assert.match(page, /\.button-press:focus-visible/)
  assert.match(page, /outline: 2px solid #2F63F5/)
})

test('maps the existing landing sections to the approved surface rhythm', () => {
  for (const fragment of [
    '<section id="hero" class="hero-gradient',
    '<section id="fit" class="surface-paper',
    '<section id="quiz" class="hero-gradient',
    '<section id="experience-dark" class="surface-paper',
    '<section id="process" class="surface-paper',
    '<section data-transparency-section class="surface-blue-soft',
    '<section id="conditions" class="surface-white',
    '<div class="contact-footer-gradient"><section id="contact"',
    '<footer class="py-10 text-white'
  ]) {
    assert.ok(page.includes(fragment), `missing surface role: ${fragment}`)
  }
})

test('keeps the contact and footer as one surface and pricing as a light section', async () => {
  const script = await readFile(new URL('./script.js', import.meta.url), 'utf8')

  assert.match(page, /<div class="contact-footer-gradient">[\s\S]*?<section id="contact"[\s\S]*?<footer class="py-10 text-white">/)
  assert.match(page, /\.case-stage::after \{[^}]*rgb\(244 246 250 \/ \.96\)/)
  assert.match(page, /\[data-site-header\]\.is-scrolled \[data-header-backdrop\] \{ opacity: 1; \}/)
  assert.match(page, /<section id="conditions" class="surface-white py-20 md:py-28">/)
  assert.match(page, /data-pricing-table class="pricing-table w-full text-left text-ink"/)
  assert.match(script, /data-process-number class="[^`]*h-\[30px\] w-\[30px\][^`]*text-sm/)
})

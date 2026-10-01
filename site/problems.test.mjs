import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8')
const script = await readFile(new URL('./script.js', import.meta.url), 'utf8')

test('keeps market-problems copy in a sticky reading zone above a bottom CTA and layers compact cards below their headers', () => {
  assert.match(html, /id="experience-dark"[^>]*overflow-hidden[^>]*lg:overflow-visible/u)
  assert.match(html, /data-problems-layout[^>]*lg:items-stretch/u)
  assert.match(html, /data-problems-column[^>]*contents[^>]*lg:flex/u)
  assert.match(html, /data-problems-intro[^>]*self-start[^>]*lg:sticky[^>]*lg:top-28/u)
  assert.match(html, /Церебро знает, как превратить проблемы рекламы в понятный план действий/u)
  assert.match(html, /data-problems-sticky-track[^>]*order-1[^>]*lg:flex-1/u)
  assert.match(html, /data-problems-intro[\s\S]*?data-problems-cta[^>]*mt-5/u)
  assert.match(html, /data-problems-layout[^>]*lg:grid-cols-12/u)
  assert.match(html, /data-problems-column[^>]*lg:col-span-6/u)
  assert.match(html, /id="problems"[^>]*order-2[^>]*lg:col-span-6/u)
  assert.match(script, /assets\/problems\/problem-mark\.svg/u)
  assert.match(script, /assets\/problems\/solution-mark\.svg/u)
  assert.match(script, /data-problem-card[^`]*bg-blue-soft/u)
  assert.match(script, /data-problem-solution[^`]*bg-white/u)
  assert.match(script, /data-problem-card[^`]*md:grid-cols-\[26px_1fr\]/u)
  assert.match(script, /data-problem-header[^`]*rounded-\[var\(--radius-card\)\]/u)
  assert.match(script, /data-problem-solution[^`]*-mt-1[^`]*rounded-b-\[var\(--radius-card\)\]/u)
  assert.match(html, /—&nbsp;и&nbsp;подготовим основу медиаплана/u)
})

test('uses a compact outlined problems CTA and borderless service cards', () => {
  assert.match(html, /data-problems-cta[^>]*border[^>]*border-ink\/15[^>]*md:flex-row[^>]*md:items-center[^>]*md:justify-between/u)
  assert.doesNotMatch(html, /data-problems-cta[^>]*bg-/u)
  assert.match(html, /data-problems-cta[\s\S]*?data-cta="problems"[^>]*md:shrink-0/u)
  assert.doesNotMatch(script, /service-card[^`]*border-border/u)
})

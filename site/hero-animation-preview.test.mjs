import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const preview = await readFile(new URL('./hero-animation-preview.html', import.meta.url), 'utf8')
const production = await readFile(new URL('./index.html', import.meta.url), 'utf8')

test('matches the supplied 451 by 460 composition and begins logo motion without a noticeable pause', () => {
  assert.match(preview, /aspect-ratio:\s*451\s*\/\s*460/)
  assert.match(preview, /\.line\s*\{[^}]*top:\s*4%[^}]*left:\s*4%[^}]*width:\s*90%[^}]*height:\s*90%/s)
  assert.match(preview, /\.mark-yandex\s*\{[^}]*top:\s*16\.5%[^}]*right:\s*9%[^}]*width:\s*40%/s)
  assert.match(preview, /\.mark-cerebro\s*\{[^}]*top:\s*54\.5%[^}]*left:\s*16%[^}]*width:\s*28%/s)
  assert.match(preview, /rotate\(21deg\)/)
  assert.match(preview, /rotate\(4\.65deg\)/)
  assert.match(preview, /drop-in-yandex\s+720ms\s+0ms/)
  assert.match(preview, /drop-in-cerebro\s+680ms\s+0ms/)
  assert.match(preview, /stroke-linecap="round"\s+stroke-linejoin="round"/)
})

test('uses the same locked scene constants in the production hero', () => {
  assert.match(production, /\.hero-composition\s*\{[^}]*aspect-ratio:\s*451\s*\/\s*460/su)
  assert.match(production, /\.hero-composition-line\s*\{[^}]*top:\s*4%[^}]*left:\s*4%[^}]*width:\s*90%[^}]*height:\s*90%/su)
  assert.match(production, /rotate\(21deg\)/u)
  assert.match(production, /rotate\(4\.65deg\)/u)
  assert.match(production, /stroke-linecap="round"\s+stroke-linejoin="round"/u)
})

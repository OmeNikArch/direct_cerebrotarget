import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8')
const script = await readFile(new URL('./script.js', import.meta.url), 'utf8')

test('presents five bare square team portraits and supports hidden-scrollbar drag navigation', () => {
  const teamPosition = html.indexOf('id="team"')
  assert.equal(html.indexOf('id="proof"') < teamPosition && teamPosition < html.indexOf('id="conditions"'), true)
  assert.match(html, /<section id="team"[^>]*surface-blue-soft/u)
  assert.match(html, /data-team-viewport[^>]*cursor-grab[^>]*overflow-x-auto/u)
  assert.match(html, /\[data-team-viewport\] \{ scrollbar-width: none; \}/u)
  assert.match(html, /id="team-cards"[^>]*flex[^>]*gap-3/u)
  assert.doesNotMatch(script, /data-team-card[^`]*bg-white/u, 'team entries should not have white card backing')
  assert.match(script, /data-team-card[^`]*lg:w-\[calc\(\(100%-64px\)\/5\)\]/u)
  assert.match(script, /data-team-photo-placeholder[^`]*aspect-square/u)
  assert.match(html, /id="team-next"[^>]*aria-label="Следующие эксперты"/u)
  assert.match(script, /teamViewport\.scrollBy/u)
  assert.match(script, /teamViewport\.addEventListener\('pointerdown'/u)
  assert.match(script, /const teamMembers = \[/u)
  assert.equal((script.match(/data-team-photo-placeholder/gu) || []).length, 1)
  for (const name of ['Анна Соколова', 'Максим Орлов', 'Елена Миронова', 'Дмитрий Волков', 'Мария Белова', 'Алексей Ковалёв']) assert.equal(script.includes(name), true)
})

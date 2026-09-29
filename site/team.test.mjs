import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8')
const script = await readFile(new URL('./script.js', import.meta.url), 'utf8')

test('presents the five current team members in the requested order with portraits above white photo panels', () => {
  const teamPosition = html.indexOf('id="team"')
  assert.equal(html.indexOf('id="proof"') < teamPosition && teamPosition < html.indexOf('id="conditions"'), true)
  assert.match(html, /<section id="team"[^>]*surface-blue-soft/u)
  assert.match(html, /data-team-viewport[^>]*cursor-grab[^>]*overflow-x-auto/u)
  assert.match(html, /\[data-team-viewport\] \{ scrollbar-width: none; \}/u)
  assert.match(html, /id="team-cards"[^>]*flex[^>]*gap-3/u)
  assert.match(script, /data-team-card[^`]*w-\[calc\(48\.1%-12px\)\][^`]*md:w-\[calc\(32\.5%-16px\)\][^`]*lg:w-\[calc\(19\.7%-16px\)\]/u)
  assert.match(script, /data-team-photo[^`]*aspect-\[5\.5\/7\]/u)
  assert.match(script, /data-team-photo-panel[^`]*aspect-square[^`]*rounded-\[var\(--radius-card\)\][^`]*bg-white/u)
  assert.match(script, /data-team-portrait[^`]*rounded-b-\[var\(--radius-card\)\][^`]*object-cover/u)
  assert.match(html, /id="team-next"[^>]*aria-label="Следующие эксперты"/u)
  assert.match(script, /teamViewport\.scrollBy/u)
  assert.match(script, /querySelector\('\[data-team-card\]'\)[\s\S]*?offsetWidth/u)
  assert.match(script, /teamViewport\.addEventListener\('pointerdown'/u)
  assert.match(script, /const teamMembers = \[/u)
  assert.equal((script.match(/data-team-photo-placeholder/gu) || []).length, 0)

  const members = [
    ['Феликс Зинатуллин', 'CEO', 'felix-zinatullin.png'],
    ['Виктор Потапов', 'Руководитель агентского направления', 'viktor-potapov.png'],
    ['Екатерина Тютюнникова', 'Руководитель направления Яндекс Директ', 'ekaterina-tyutyunnikova.png'],
    ['Михаил Прозоров', 'Руководитель направления Яндекс ПромоСтраницы', 'mihail-prozorov.png'],
    ['Андрей Плешаков', 'Руководитель товарного направления', 'andrey-pleshakov.png'],
  ]
  let previousPosition = -1
  for (const [name, role, photo] of members) {
    const position = script.indexOf(name)
    assert.ok(position > previousPosition, `${name} should follow the prior team member`)
    assert.equal(script.includes(role), true)
    assert.equal(existsSync(new URL(`./assets/team/graded/${photo}`, import.meta.url)), true)
    assert.equal(script.includes('./assets/team/graded/${photo}'), true)
    previousPosition = position
  }
  assert.equal(script.includes('Алексей Ковалёв'), false)
})

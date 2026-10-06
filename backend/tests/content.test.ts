import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parseHTML } from 'linkedom'
import { extractConst, replaceConst } from '@/lib/jsConst'
import { collectSlotElements, collectSlots, fieldName, setOwnText } from '@/lib/slots'
import { applyPalette } from '@/lib/palette'
import { buildQuizJs, buildScriptJs, defaultBlocks } from '@/lib/landingContent'
import slotsJson from '@/content/slots.json'

const site = (f: string) => readFileSync(path.resolve(__dirname, '../../site', f), 'utf8')

describe('jsConst', () => {
  const src = "import x from './x.mjs'\nconst data = {\n  a: ['b}', \"c]\"],\n  t: `x{y`,\n}\nconst other = [1, 2]\n"
  it('извлекает литерал со скобками внутри строк', () => {
    expect(extractConst(src, 'data')).toEqual({ a: ['b}', 'c]'], t: 'x{y' })
    expect(extractConst(src, 'other')).toEqual([1, 2])
    expect(extractConst(src, 'missing')).toBeNull()
  })
  it('заменяет только нужную константу', () => {
    const out = replaceConst(src, 'other', [3])
    expect(extractConst(out, 'other')).toEqual([3])
    expect(extractConst(out, 'data')).toEqual({ a: ['b}', 'c]'], t: 'x{y' })
    expect(out.startsWith("import x from './x.mjs'")).toBe(true)
  })
  it('читает данные реального script.js и quiz.mjs', () => {
    const d = extractConst<{ cases: unknown[]; faq: unknown[] }>(site('script.js'), 'landingData')
    expect(d?.cases.length).toBeGreaterThan(5)
    expect(extractConst<unknown[]>(site('quiz.mjs'), 'quizSteps')).toHaveLength(5)
  })
})

describe('текстовые слоты', () => {
  it('slots.json совпадает с текущим site/index.html (иначе: npm run slots + миграция)', () => {
    const { document } = parseHTML(site('index.html'))
    expect(collectSlots(document as never)).toEqual(slotsJson)
  })
  it('замена текста не трогает вложенные элементы', () => {
    const { document } = parseHTML('<html><body><section id="hero"><label>Имя<input name="name"></label><h1>Старый</h1></section></body></html>')
    const slots = collectSlotElements(document as never)
    expect(slots.map((s) => s.text)).toEqual(['Имя', 'Старый'])
    setOwnText(slots[0].el, 'Ваше имя')
    expect(document.querySelector('label')!.outerHTML).toBe('<label>Ваше имя<input name="name"></label>')
    expect(fieldName(slots[1].key)).toMatch(/^t_hero_[0-9a-z]{7}$/)
  })
})

describe('палитра', () => {
  it('меняет HEX и rgb-форму, игнорирует неверный цвет', () => {
    const html = "brand: '#0A238B' x rgb(6 25 95 / .98) #0a238b"
    expect(applyPalette(html, { colorBrand: '#112233', colorBrandDeep: '#010203', colorAccent: 'red' })).toBe(
      "brand: '#112233' x rgb(1 2 3 / .98) #112233",
    )
  })
})

describe('сборка script.js и quiz.mjs из админки', () => {
  // defaultBlocks читает site-template/ — подставляем исходники site/.
  process.chdir(path.resolve(__dirname, '..'))
  const blocks = { ...defaultBlocks(), seeded: true }

  it('без правок данные совпадают с исходными', () => {
    const js = buildScriptJs(blocks)
    for (const name of ['landingData', 'teamMembers', 'caseImages', 'caseFilters', 'contactCopy']) {
      expect(extractConst(js, name)).toEqual(extractConst(site('script.js'), name))
    }
    expect(extractConst(buildQuizJs(blocks), 'quizSteps')).toEqual(extractConst(site('quiz.mjs'), 'quizSteps'))
  })

  it('правки попадают в данные фронта', () => {
    const edited = structuredClone(blocks)
    edited.faq![0].question = 'Новый вопрос?'
    edited.cases![0].image = { url: '/api/media/file/case.png' }
    edited.team![0].photo = { url: '/api/media/file/me.png' }
    edited.quizSteps![4].options![0].label = '100–600 тыс. ₽'
    const js = buildScriptJs(edited)
    expect(extractConst<{ faq: string[][] }>(js, 'landingData')!.faq[0][0]).toBe('Новый вопрос?')
    expect(extractConst<string[]>(js, 'caseImages')![0]).toBe('/api/media/file/case.png')
    expect(extractConst<string[][]>(js, 'teamMembers')![0][2]).toBe('../../../api/media/file/me.png')
    const quiz = extractConst<{ options: unknown[] }[]>(buildQuizJs(edited), 'quizSteps')!
    expect(quiz[4].options[0]).toEqual(['100-500', '100–600 тыс. ₽'])
  })

  it('пока блоки не заполнены — отдаётся исходник', () => {
    expect(buildScriptJs({})).toBe(site('script.js'))
  })
})

describe('кнопки ботов', () => {
  it('ставит ссылку только тем ботам, у кого она задана', async () => {
    const { applyBotLinks } = await import('@/lib/renderSite')
    const { document } = parseHTML(site('index.html'))
    applyBotLinks(document as never, { botVkUrl: 'https://vk.ru/app5898182_-73662138#s=4054320&force=1' })
    const links = [...document.querySelectorAll('[data-bot-actions] a')]
    expect(links).toHaveLength(2)
    expect(links[0].getAttribute('href')).toBe('https://vk.ru/app5898182_-73662138#s=4054320&force=1')
    expect(links[0].textContent).toContain('VK-бот')
    expect(links[0].getAttribute('class')).not.toContain('disabled:')
    expect(document.querySelectorAll('[data-bot-actions] button[disabled]')).toHaveLength(4)
  })
})

// «Текстовые слоты» статичного HTML лендинга: каждый собственный текст элемента
// (заголовок, подпись, кнопка…) получает стабильный ключ «секция + хэш исходного текста».
// Одинаковые тексты в одной секции (пункты меню в шапке и мобильном меню) — один слот.
// Тот же алгоритм используют генератор полей админки (scripts/gen-slots.ts) и рендер страницы.

export const BLOCK_SELECTOR = 'header, section[id], footer'

export const BLOCK_LABELS: Record<string, string> = {
  header: 'Шапка и меню',
  hero: 'Первый экран',
  fit: 'Кому подходит',
  quiz: 'Квиз медиаплана',
  'experience-dark': 'Проблемы и состав работ',
  process: 'Что дальше',
  proof: 'Кейсы',
  team: 'Команда',
  conditions: 'Стоимость',
  trust: 'О Церебро и отзывы',
  faq: 'Вопросы',
  contact: 'Форма заявки',
  'lead-success': 'Экран «Спасибо»',
  footer: 'Подвал',
}

// Эти элементы заполняет JS фронта — их тексты редактируются в «Блоках лендинга».
const EXCLUDE = [
  '#hero-facts', '#fit-cards', '#problems', '#service-scope-cards', '#process-cards', '#transparency-cards',
  '#case-filters', '#case-cards', '#team-cards', '#start-options', '#faq-list', '#review-slides', '#review-counter',
  '[data-count-up]', '[data-quiz-step]', '[data-quiz-topic]', '[data-quiz-question]', '[data-quiz-next]',
  '[data-quiz-summary]', '[data-quiz-progress]', '[data-contact-eyebrow]', '[data-contact-title]',
  '[data-contact-description]', '[data-form-status]', '#form-status', 'script', 'style', 'svg', 'select', 'noscript',
].join(',')

const TAG_KIND: Record<string, string> = {
  h1: 'Главный заголовок',
  h2: 'Заголовок секции',
  h3: 'Подзаголовок',
  a: 'Ссылка / кнопка',
  button: 'Кнопка',
  label: 'Подпись поля',
  th: 'Шапка таблицы',
  td: 'Ячейка таблицы',
}

export type Slot = { key: string; block: string; tag: string; kind: string; text: string; count: number }

// Минимальный интерфейс DOM, чтобы работать и с linkedom, и с браузерным DOM.
type El = {
  tagName: string
  childNodes: ArrayLike<{ nodeType: number; textContent: string | null }>
  closest(sel: string): El | null
  getAttribute(name: string): string | null
}
type Doc = { querySelectorAll(sel: string): ArrayLike<El> }

const norm = (s: string) => s.replace(/\s+/g, ' ').trim()

// FNV-1a 32 бит → base36: короткий детерминированный хэш без зависимостей.
function hash(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36).padStart(7, '0').slice(0, 7)
}

export const ownText = (el: El) =>
  norm(
    Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent || '')
      .join(' '),
  )

export const blockId = (block: El) => (block.tagName.toLowerCase() === 'section' ? block.getAttribute('id') || '' : block.tagName.toLowerCase())

export const fieldName = (key: string) => `t_${key}`

// Все текстовые элементы страницы с ключами (элемент → слот).
export function collectSlotElements(document: Doc): { el: El; key: string; block: string; text: string }[] {
  const out: { el: El; key: string; block: string; text: string }[] = []
  for (const el of Array.from(document.querySelectorAll('body *'))) {
    const text = ownText(el)
    if (text.length < 2 || !/[\p{L}\p{N}]/u.test(text)) continue
    if (el.closest(EXCLUDE)) continue
    const block = el.closest(BLOCK_SELECTOR)
    if (!block) continue
    const id = blockId(block)
    if (!id) continue
    const key = `${id.replace(/-/g, '_')}_${hash(id + '|' + text)}`
    out.push({ el, key, block: id, text })
  }
  return out
}

export function collectSlots(document: Doc): Slot[] {
  const map = new Map<string, Slot>()
  for (const { el, key, block, text } of collectSlotElements(document)) {
    const prev = map.get(key)
    if (prev) {
      prev.count++
      continue
    }
    const tag = el.tagName.toLowerCase()
    map.set(key, { key, block, tag, kind: TAG_KIND[tag] || 'Текст', text, count: 1 })
  }
  return [...map.values()]
}

// Заменяет собственный текст элемента, не трогая вложенные элементы (иконки, поля ввода).
export function setOwnText(el: El, value: string) {
  const nodes = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && norm(n.textContent || '') !== '')
  nodes.forEach((n, i) => {
    if (i === 0) {
      const raw = n.textContent || ''
      const lead = raw.match(/^\s*/)?.[0] || ''
      const trail = raw.match(/\s*$/)?.[0] || ''
      n.textContent = lead + value + trail
    } else {
      n.textContent = ' '
    }
  })
}

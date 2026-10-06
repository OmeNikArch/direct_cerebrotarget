// Сборка страниц лендинга из шаблона + данных админки (с кэшем до следующего сохранения).
import { getPayload } from 'payload'
import config from '@payload-config'
import { parseHTML } from 'linkedom'
import { collectSlotElements, fieldName, setOwnText } from './slots'
import { applyPalette } from './palette'
import { buildQuizJs, buildScriptJs, readTemplate, type Blocks } from './landingContent'
import { getCached, setCached } from './siteCache'

async function payloadClient() {
  return getPayload({ config })
}

async function loadBlocks(): Promise<Blocks> {
  const payload = await payloadClient()
  return (await payload.findGlobal({ slug: 'landing-blocks', depth: 1, overrideAccess: true })) as unknown as Blocks
}

export async function renderIndexHtml(): Promise<string> {
  const hit = getCached('index')
  if (hit) return hit
  const payload = await payloadClient()
  const [texts, settings] = await Promise.all([
    payload.findGlobal({ slug: 'page-texts', overrideAccess: true }) as unknown as Promise<Record<string, unknown>>,
    payload.findGlobal({ slug: 'site-settings', overrideAccess: true }) as unknown as Promise<Record<string, unknown>>,
  ])

  const { document } = parseHTML(readTemplate('index.html'))
  for (const { el, key, text } of collectSlotElements(document as never)) {
    const v = texts[fieldName(key)]
    if (typeof v === 'string' && v.trim() && v.trim() !== text) setOwnText(el, v.trim())
  }

  const seoTitle = typeof settings.seoTitle === 'string' ? settings.seoTitle.trim() : ''
  const seoDescription = typeof settings.seoDescription === 'string' ? settings.seoDescription.trim() : ''
  if (seoTitle) {
    const t = document.querySelector('title')
    if (t) t.textContent = seoTitle
  }
  if (seoDescription) document.querySelector('meta[name="description"]')?.setAttribute('content', seoDescription)

  applyBotLinks(document as never, settings)

  const html = applyPalette('<!doctype html>\n' + document.documentElement.outerHTML, settings)
  setCached('index', html)
  return html
}

// Кнопки ботов на экранах «Спасибо» во фронте — неактивные <button disabled>. Если в настройках
// задана ссылка, кнопка становится ссылкой с тем же оформлением (открывается в новой вкладке).
const BOTS: [RegExp, string][] = [
  [/VK/i, 'botVkUrl'],
  [/Telegram/i, 'botTelegramUrl'],
  [/MAX/i, 'botMaxUrl'],
]

type BotDoc = {
  querySelectorAll(sel: string): ArrayLike<{
    textContent: string | null
    innerHTML: string
    getAttribute(n: string): string | null
    replaceWith(n: unknown): void
  }>
  createElement(tag: string): {
    setAttribute(n: string, v: string): void
    innerHTML: string
  }
}

export function applyBotLinks(document: BotDoc, settings: Record<string, unknown>) {
  for (const button of Array.from(document.querySelectorAll('[data-bot-actions] button'))) {
    const bot = BOTS.find(([re]) => re.test(button.textContent || ''))
    const url = bot && typeof settings[bot[1]] === 'string' ? (settings[bot[1]] as string).trim() : ''
    if (!url) continue
    const link = document.createElement('a')
    link.setAttribute('class', (button.getAttribute('class') || '').replace(/\bdisabled:\S+/g, '').trim())
    link.setAttribute('href', url)
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener')
    link.setAttribute('data-bot-link', bot![1])
    link.innerHTML = button.innerHTML
    button.replaceWith(link)
  }
}

export async function renderScriptJs(): Promise<string> {
  const hit = getCached('script')
  if (hit) return hit
  const js = buildScriptJs(await loadBlocks())
  setCached('script', js)
  return js
}

export async function renderQuizJs(): Promise<string> {
  const hit = getCached('quiz')
  if (hit) return hit
  const js = buildQuizJs(await loadBlocks())
  setCached('quiz', js)
  return js
}

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

  const html = applyPalette('<!doctype html>\n' + document.documentElement.outerHTML, settings)
  setCached('index', html)
  return html
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

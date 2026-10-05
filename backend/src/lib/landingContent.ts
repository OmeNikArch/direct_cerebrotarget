// Связка «исходники фронта ↔ админка».
// Шаблоны index.html / script.js / quiz.mjs лежат в site-template/ (копия ../site, scripts/sync-site.mjs).
// Отсюда же берутся исходные данные для первого заполнения «Блоков лендинга».
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { extractConst, replaceConst } from './jsConst'

export const CASE_CATEGORIES: [string, string][] = [
  ['medicine', 'Медицина'],
  ['e-commerce', 'Интернет-магазины'],
  ['education', 'Онлайн-образование'],
  ['manufacturing', 'Производство'],
  ['services', 'Услуги'],
  ['culture', 'Культура'],
]

const TEMPLATE_DIR = path.join(process.cwd(), 'site-template')
export const readTemplate = (file: string) => readFileSync(path.join(TEMPLATE_DIR, file), 'utf8')

type Tuple = string[]
type QuizOption = string | [string, string]
type LandingData = {
  facts: Tuple[]
  fit: Tuple[]
  problems: Tuple[]
  serviceScope: Tuple[]
  process: Tuple[]
  transparency: Tuple[]
  cases: {
    category: string
    label: string
    title: string
    context: string
    task: string
    solution: string[]
    results: Tuple[]
  }[]
  reviewSlides: [string, string, string[]][]
  startOptions: Tuple[]
  faq: Tuple[]
}
type ContactCopy = Record<'promotion' | 'audit', { eyebrow: string; title: string; description: string }>
type QuizStep = { id: string; topic: string; question: string; options: QuizOption[] }

// Форма «Блоков лендинга» в админке (то, что лежит в БД).
export type Blocks = {
  seeded?: boolean | null
  facts?: { key?: string | null; text: string }[] | null
  fit?: { title: string; text?: string | null }[] | null
  problems?: { problem: string; solution?: string | null }[] | null
  serviceScope?: { title: string; text?: string | null; partnerLogo?: string | null }[] | null
  process?: { title: string; text?: string | null }[] | null
  transparency?: { title: string; text?: string | null }[] | null
  caseFilters?: { id?: string | null; label: string }[] | null
  cases?:
    | {
        category: string
        label?: string | null
        context?: string | null
        title: string
        task?: string | null
        solution?: { text: string }[] | null
        results?: { value: string; label?: string | null }[] | null
        image?: unknown
        defaultImage?: string | null
      }[]
    | null
  team?: { name: string; role?: string | null; photo?: unknown; photoFile?: string | null }[] | null
  reviews?: { name: string; detail?: string | null; paragraphs?: { text: string }[] | null }[] | null
  startOptions?: { label?: string | null; title: string; text?: string | null; cta?: string | null; ctaId?: string | null }[] | null
  faq?: { question: string; answer?: string | null }[] | null
  contactCopy?: Partial<Record<'promotion' | 'audit', { eyebrow?: string | null; title?: string | null; description?: string | null }>> | null
  quizSteps?: { id?: string | null; topic?: string | null; question: string; options?: { value?: string | null; label: string }[] | null }[] | null
}

const num = (i: number) => String(i + 1).padStart(2, '0')
const s = (v: unknown) => (typeof v === 'string' ? v : '')

// URL загруженной в админку картинки (upload с depth ≥ 1).
export function mediaUrl(m: unknown): string | null {
  if (m && typeof m === 'object' && 'url' in m && typeof (m as { url?: unknown }).url === 'string') {
    return (m as { url: string }).url.replace(/^https?:\/\/[^/]+/, '')
  }
  return null
}

// ── Исходник → админка (первое заполнение) ───────────────────────────────────
export function defaultBlocks(): Blocks {
  const script = readTemplate('script.js')
  const quiz = readTemplate('quiz.mjs')
  const d = extractConst<LandingData>(script, 'landingData')
  const team = extractConst<Tuple[]>(script, 'teamMembers') || []
  const caseImages = extractConst<string[]>(script, 'caseImages') || []
  const filters = extractConst<Tuple[]>(script, 'caseFilters') || []
  const contact = extractConst<ContactCopy>(script, 'contactCopy')
  const steps = extractConst<QuizStep[]>(quiz, 'quizSteps') || []
  if (!d) throw new Error('В site-template/script.js не найден landingData')

  return {
    facts: d.facts.map(([key, text]) => ({ key, text })),
    fit: d.fit.map(([, title, text]) => ({ title, text })),
    problems: d.problems.map(([problem, solution]) => ({ problem, solution })),
    serviceScope: d.serviceScope.map(([, title, text, partnerLogo]) => ({ title, text, partnerLogo: partnerLogo || '' })),
    process: d.process.map(([, title, text]) => ({ title, text })),
    transparency: d.transparency.map(([, title, text]) => ({ title, text })),
    caseFilters: filters.map(([id, label]) => ({ id, label })),
    cases: d.cases.map((c, i) => ({
      category: c.category,
      label: c.label,
      context: c.context,
      title: c.title,
      task: c.task,
      solution: c.solution.map((text) => ({ text })),
      results: c.results.map(([value, label]) => ({ value, label })),
      defaultImage: caseImages[i] || '',
    })),
    team: team.map(([name, role, photoFile]) => ({ name, role, photoFile })),
    reviews: d.reviewSlides.map(([name, detail, paragraphs]) => ({ name, detail, paragraphs: paragraphs.map((text) => ({ text })) })),
    startOptions: d.startOptions.map(([title, label, text, cta, ctaId]) => ({ title, label, text, cta, ctaId })),
    faq: d.faq.map(([question, answer]) => ({ question, answer })),
    contactCopy: contact || undefined,
    quizSteps: steps.map((st) => ({
      id: st.id,
      topic: st.topic,
      question: st.question,
      options: st.options.map((o) => (Array.isArray(o) ? { value: o[0], label: o[1] } : { value: o, label: o })),
    })),
  }
}

// ── Админка → исходник фронта ────────────────────────────────────────────────
const list = <T,>(v: T[] | null | undefined) => (Array.isArray(v) && v.length ? v : null)

export function buildScriptJs(b: Blocks): string {
  let src = readTemplate('script.js')
  const def = extractConst<LandingData>(src, 'landingData')
  if (!def || !b.seeded) return src

  const cases = list(b.cases)
  const landingData: LandingData = {
    facts: list(b.facts)?.map((f, i) => [s(f.key) || def.facts[i]?.[0] || `fact-${i}`, f.text]) ?? def.facts,
    fit: list(b.fit)?.map((f, i) => [num(i), f.title, s(f.text)]) ?? def.fit,
    problems: list(b.problems)?.map((p) => [p.problem, s(p.solution)]) ?? def.problems,
    serviceScope:
      list(b.serviceScope)?.map((x, i) => {
        const row = [num(i), x.title, s(x.text)]
        if (x.partnerLogo) row.push(x.partnerLogo)
        return row
      }) ?? def.serviceScope,
    process: list(b.process)?.map((x, i) => [num(i), x.title, s(x.text)]) ?? def.process,
    transparency: list(b.transparency)?.map((x, i) => [num(i), x.title, s(x.text)]) ?? def.transparency,
    cases:
      cases?.map((c) => ({
        category: c.category,
        label: s(c.label),
        title: c.title,
        context: s(c.context),
        task: s(c.task),
        solution: (c.solution || []).map((p) => p.text),
        results: (c.results || []).map((r) => [r.value, s(r.label)]),
      })) ?? def.cases,
    reviewSlides:
      list(b.reviews)?.map((r) => [r.name, s(r.detail), (r.paragraphs || []).map((p) => p.text)] as [string, string, string[]]) ??
      def.reviewSlides,
    startOptions:
      list(b.startOptions)?.map((o, i) => [o.title, s(o.label), s(o.text), s(o.cta), s(o.ctaId) || def.startOptions[i]?.[4] || '']) ??
      def.startOptions,
    faq: list(b.faq)?.map((f) => [f.question, s(f.answer)]) ?? def.faq,
  }
  src = replaceConst(src, 'landingData', landingData)

  // Картинки кейсов: фронт берёт их по индексу кейса в landingData.cases.
  if (cases) src = replaceConst(src, 'caseImages', cases.map((c) => mediaUrl(c.image) || s(c.defaultImage) || ''))

  const team = list(b.team)
  if (team) {
    // Фронт склеивает путь './assets/team/graded/' + файл — для загруженных фото поднимаемся к корню.
    src = replaceConst(
      src,
      'teamMembers',
      team.map((m) => {
        const url = mediaUrl(m.photo)
        return [m.name, s(m.role), url ? `../../..${url}` : s(m.photoFile)]
      }),
    )
  }

  const filters = list(b.caseFilters)
  if (filters) src = replaceConst(src, 'caseFilters', filters.map((f) => [s(f.id), f.label]))

  const defContact = extractConst<ContactCopy>(src, 'contactCopy')
  if (defContact && b.contactCopy) {
    const merged = { ...defContact }
    for (const mode of ['promotion', 'audit'] as const) {
      const c = b.contactCopy[mode] || {}
      merged[mode] = {
        eyebrow: s(c.eyebrow) || defContact[mode].eyebrow,
        title: s(c.title) || defContact[mode].title,
        description: s(c.description) || defContact[mode].description,
      }
    }
    src = replaceConst(src, 'contactCopy', merged)
  }
  return src
}

export function buildQuizJs(b: Blocks): string {
  const src = readTemplate('quiz.mjs')
  const steps = list(b.quizSteps)
  if (!b.seeded || !steps) return src
  const def = extractConst<QuizStep[]>(src, 'quizSteps') || []
  return replaceConst(
    src,
    'quizSteps',
    steps.map((st, i) => {
      const id = s(st.id) || def[i]?.id || `step${i}`
      const keepValue = def[i]?.options.some((o) => Array.isArray(o))
      return {
        id,
        topic: s(st.topic),
        question: st.question,
        // У бюджета значения технические (100-500…) — сохраняем их, у остальных шагов значение = подпись.
        options: (st.options || []).map((o) => (keepValue ? [s(o.value) || o.label, o.label] : o.label)),
      }
    }),
  )
}

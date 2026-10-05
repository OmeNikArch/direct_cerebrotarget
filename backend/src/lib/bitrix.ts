// Отправка заявки в Битрикс24 через входящий вебхук (как на clickout и vk-ads).
// Два режима: Сделка (в воронке CATEGORY_ID, с контактом) или Лид (раздел «Лиды»).
// Если bitrixEnabled=false или нет вебхука — статус 'skipped', заявка остаётся только в админке.
import type { ParsedLead } from './lead'

export type BitrixLead = ParsedLead & {
  sourceLabel?: string
  source?: {
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmContent?: string
    utmTerm?: string
    page?: string
  }
}

export type BitrixSettings = {
  bitrixEnabled?: boolean | null
  bitrixWebhookUrl?: string | null
  bitrixEntity?: 'deal' | 'lead' | null
  bitrixCategoryId?: string | null
  bitrixStageId?: string | null
  bitrixAssignedById?: string | null
}

export type BitrixResult =
  | { status: 'skipped' }
  | { status: 'sent'; id: string }
  | { status: 'failed'; error: string }

const MAX_RETRIES = 3

// Приводим вебхук к базовому виду: убираем случайно добавленный метод (…/crm.lead.add.json)
// и лишние слэши, оставляем https://portal.bitrix24.ru/rest/1/КОД/
export function normalizeBase(raw: string): string {
  let url = raw.trim()
  url = url.replace(/\/[a-z0-9_.]+\.json\/?$/i, '')
  url = url.replace(/\/+$/, '')
  return url + '/'
}

const utmFields = (lead: BitrixLead) => ({
  UTM_SOURCE: lead.source?.utmSource || undefined,
  UTM_MEDIUM: lead.source?.utmMedium || undefined,
  UTM_CAMPAIGN: lead.source?.utmCampaign || undefined,
  UTM_CONTENT: lead.source?.utmContent || undefined,
  UTM_TERM: lead.source?.utmTerm || undefined,
})

export const buildTitle = (lead: BitrixLead) => `Лендинг Директ: ${lead.requestType} — ${lead.name}`

export const buildComments = (lead: BitrixLead) =>
  [
    `Заявка: ${lead.requestType}`,
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.budget ? `Рекламный бюджет: ${lead.budget}` : '',
    lead.site ? `Сайт / соцсети: ${lead.site}` : '',
    ...(lead.quiz
      ? [
          '\nОтветы квиза:',
          lead.quiz.business ? `• Что продвигаем: ${lead.quiz.business}` : '',
          lead.quiz.geography ? `• География: ${lead.quiz.geography}` : '',
          lead.quiz.goal ? `• Главная задача: ${lead.quiz.goal}` : '',
          lead.quiz.situation ? `• Ситуация с рекламой: ${lead.quiz.situation}` : '',
          lead.quiz.budget ? `• Бюджет в месяц: ${lead.quiz.budget}` : '',
        ]
      : []),
    lead.sourceLabel ? `${lead.quiz ? '\n' : ''}Источник: ${lead.sourceLabel}` : '',
    lead.source?.utmCampaign ? `Кампания: ${lead.source.utmCampaign}` : '',
    lead.source?.page ? `Страница: ${lead.source.page}` : '',
  ]
    .filter(Boolean)
    .join('\n')

const sourceDescription = (lead: BitrixLead) => lead.sourceLabel || lead.source?.utmSource || 'Лендинг Яндекс Директ'

// Один вызов метода Битрикс с ретраями.
async function callBitrix(
  base: string,
  method: string,
  payload: Record<string, unknown>,
): Promise<{ ok: true; result: unknown } | { ok: false; error: string }> {
  let lastError = ''
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${base}${method}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      })
      const json = (await res.json()) as { result?: unknown; error_description?: string; error?: string }
      if (res.ok && json.result) return { ok: true, result: json.result }
      lastError = json.error_description || json.error || `HTTP ${res.status}`
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e)
    }
    if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, 400 * attempt))
  }
  return { ok: false, error: lastError }
}

export async function sendLeadToBitrix(lead: BitrixLead, settings: BitrixSettings): Promise<BitrixResult> {
  if (!settings?.bitrixEnabled || !settings?.bitrixWebhookUrl) {
    return { status: 'skipped' }
  }

  const base = normalizeBase(settings.bitrixWebhookUrl)
  // ASSIGNED_BY_ID — только числовой ID (иначе Битрикс ругается на email/строку).
  const assigned =
    settings.bitrixAssignedById && /^\d+$/.test(settings.bitrixAssignedById.trim())
      ? Number(settings.bitrixAssignedById.trim())
      : undefined
  const title = buildTitle(lead)
  const comments = buildComments(lead)
  const web = lead.site ? [{ VALUE: lead.site, VALUE_TYPE: 'WORK' }] : undefined

  // ── Режим «Лид» ────────────────────────────────────────────────────────────
  if (settings.bitrixEntity === 'lead') {
    const r = await callBitrix(base, 'crm.lead.add', {
      fields: {
        TITLE: title,
        NAME: lead.name,
        PHONE: [{ VALUE: lead.phone, VALUE_TYPE: 'WORK' }],
        ...(web ? { WEB: web } : {}),
        COMMENTS: comments,
        SOURCE_ID: 'WEB',
        SOURCE_DESCRIPTION: sourceDescription(lead),
        ...utmFields(lead),
        ...(assigned ? { ASSIGNED_BY_ID: assigned } : {}),
      },
      params: { REGISTER_SONET_EVENT: 'Y' },
    })
    return r.ok ? { status: 'sent', id: String(r.result) } : { status: 'failed', error: r.error }
  }

  // ── Режим «Сделка» — в выбранной воронке ───────────────────────────────────
  // 1) Контакт с телефоном, чтобы у сделки был кликабельный контакт.
  let contactId: number | undefined
  const contact = await callBitrix(base, 'crm.contact.add', {
    fields: {
      NAME: lead.name,
      PHONE: [{ VALUE: lead.phone, VALUE_TYPE: 'WORK' }],
      ...(web ? { WEB: web } : {}),
      SOURCE_ID: 'WEB',
      ...(assigned ? { ASSIGNED_BY_ID: assigned } : {}),
      ...utmFields(lead),
    },
  })
  if (contact.ok) contactId = Number(contact.result)

  // 2) Сделка в воронке.
  const dealFields: Record<string, unknown> = {
    TITLE: title,
    COMMENTS: comments,
    SOURCE_ID: 'WEB',
    SOURCE_DESCRIPTION: sourceDescription(lead),
    ...utmFields(lead),
    ...(assigned ? { ASSIGNED_BY_ID: assigned } : {}),
    ...(contactId ? { CONTACT_ID: contactId } : {}),
  }
  const catId =
    settings.bitrixCategoryId && /^\d+$/.test(settings.bitrixCategoryId.trim())
      ? settings.bitrixCategoryId.trim()
      : undefined
  if (catId) dealFields.CATEGORY_ID = catId
  if (settings.bitrixStageId && settings.bitrixStageId.trim()) dealFields.STAGE_ID = settings.bitrixStageId.trim()

  const deal = await callBitrix(base, 'crm.deal.add', {
    fields: dealFields,
    params: { REGISTER_SONET_EVENT: 'Y' },
  })
  return deal.ok ? { status: 'sent', id: String(deal.result) } : { status: 'failed', error: deal.error }
}

import type { CollectionConfig, Endpoint } from 'payload'
import { headersWithCors } from 'payload'

import { FORM_TYPES, LEAD_STATUSES, PROCESSING_STATUSES } from '@/lib/constants'
import { parseLead, sourceFromReferer } from '@/lib/lead'
import { rateLimited } from '@/lib/rateLimit'
import { classifySource } from '@/lib/source'
import { sendLeadToBitrix, type BitrixLead } from '@/lib/bitrix'
import type { Lead } from '@/payload-types'

const MAX_BODY_BYTES = 10_000

// Восстанавливаем из сохранённой заявки то, что уходит в Битрикс (для повторной отправки из админки).
const toBitrixLead = (doc: Partial<Lead>): BitrixLead => ({
  formType: (doc.formType as BitrixLead['formType']) || 'contact',
  requestType: doc.requestType || '',
  name: doc.name || '',
  phone: doc.phone || '',
  budget: doc.budget || undefined,
  site: doc.site || undefined,
  quiz: doc.formType === 'quiz' ? { ...doc.quiz } as BitrixLead['quiz'] : undefined,
  privacyConsent: Boolean(doc.privacyConsent),
  personalDataConsent: Boolean(doc.personalDataConsent),
  sourceLabel: doc.sourceLabel || undefined,
  source: {
    utmSource: doc.source?.utmSource || undefined,
    utmMedium: doc.source?.utmMedium || undefined,
    utmCampaign: doc.source?.utmCampaign || undefined,
    utmContent: doc.source?.utmContent || undefined,
    utmTerm: doc.source?.utmTerm || undefined,
    page: doc.source?.page || undefined,
  },
})

// POST /api/leads/submit — публичный приём заявок с обеих форм лендинга (data-endpoint).
// Заявка сохраняется всегда; в Битрикс24 уходит, если интеграция включена в «Настройках сайта».
const submit: Endpoint = {
  path: '/submit',
  method: 'post',
  handler: async (req) => {
    const reply = (status: number, body: Record<string, unknown>) =>
      Response.json(body, { status, headers: headersWithCors({ headers: new Headers(), req }) })

    if (Number(req.headers.get('content-length') || 0) > MAX_BODY_BYTES) {
      return reply(413, { ok: false, message: 'Слишком большой запрос' })
    }

    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local').split(',')[0].trim()
    if (rateLimited(ip)) {
      return reply(429, { ok: false, message: 'Слишком много заявок подряд. Попробуйте через несколько минут.' })
    }

    let body: unknown
    try {
      body = await req.json?.()
    } catch {
      return reply(400, { ok: false, message: 'Ожидается JSON' })
    }

    const parsed = parseLead(body)
    if (!parsed.ok) return reply(422, { ok: false, errors: parsed.errors })
    const lead = parsed.lead

    const fromReferer = sourceFromReferer(req.headers.get('referer'))
    const source = { ...fromReferer, origin: (req.headers.get('origin') || '').slice(0, 200) }
    const sourceLabel = classifySource({ utmSource: source.utmSource, utmMedium: source.utmMedium, referrer: '' })

    try {
      const settings = await req.payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
      const bitrix = await sendLeadToBitrix({ ...lead, sourceLabel, source }, settings)
      if (bitrix.status === 'failed') req.payload.logger.error(`Битрикс24: заявка не отправлена — ${bitrix.error}`)

      const doc = await req.payload.create({
        collection: 'leads',
        overrideAccess: true,
        data: {
          ...lead,
          sourceLabel,
          source,
          userAgent: (req.headers.get('user-agent') || '').slice(0, 300),
          bitrixStatus: bitrix.status,
          bitrixId: bitrix.status === 'sent' ? bitrix.id : undefined,
          bitrixError: bitrix.status === 'failed' ? bitrix.error : undefined,
        },
      })
      return reply(201, { ok: true, id: doc.id })
    } catch (e) {
      req.payload.logger.error({ err: e }, 'Не удалось сохранить заявку')
      return reply(500, { ok: false, message: 'Не удалось отправить заявку. Попробуйте позже.' })
    }
  },
}

// Заявки с лендинга. Создаются только через /api/leads/submit (overrideAccess).
// Чтение и правка — только авторизованным (админка). Публичного create через REST нет.
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Заявка', plural: 'Заявки' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'requestType', 'budget', 'status', 'bitrixStatus', 'createdAt'],
    listSearchableFields: ['name', 'phone', 'site'],
    group: 'Заявки',
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  endpoints: [submit],
  hooks: {
    // Галочка «Отправить в Битрикс24 ещё раз» в карточке заявки: отправляем и снимаем галочку.
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        if (operation !== 'update' || !data.resendToBitrix) return data
        data.resendToBitrix = false
        const settings = await req.payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
        const result = await sendLeadToBitrix(toBitrixLead({ ...originalDoc, ...data }), {
          ...settings,
          bitrixEnabled: true, // ручная отправка работает, даже если автоматическая выключена
        })
        if (result.status === 'sent') {
          data.bitrixStatus = 'sent'
          data.bitrixId = result.id
          data.bitrixError = null
        } else if (result.status === 'failed') {
          data.bitrixStatus = 'failed'
          data.bitrixError = result.error
        } else {
          data.bitrixStatus = 'skipped'
          data.bitrixError = 'Не указан вебхук в «Настройках сайта» → «Интеграция Битрикс24»'
        }
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Имя', admin: { width: '50%' } },
        { name: 'phone', type: 'text', required: true, label: 'Телефон', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'formType',
          type: 'select',
          label: 'Форма',
          options: [...FORM_TYPES],
          required: true,
          admin: { width: '33%' },
        },
        { name: 'requestType', type: 'text', label: 'Тип заявки', admin: { width: '33%' } },
        { name: 'budget', type: 'text', label: 'Рекламный бюджет', admin: { width: '34%' } },
      ],
    },
    { name: 'site', type: 'text', label: 'Сайт или соцсети' },
    {
      name: 'quiz',
      type: 'group',
      label: 'Ответы квиза',
      admin: { condition: (data) => data?.formType === 'quiz' },
      fields: [
        { name: 'business', type: 'text', label: 'Что продвигаем' },
        { name: 'geography', type: 'text', label: 'География' },
        { name: 'goal', type: 'text', label: 'Главная задача' },
        { name: 'situation', type: 'text', label: 'Ситуация с рекламой' },
        { name: 'budget', type: 'text', label: 'Бюджет в месяц' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Обработка',
      options: [...PROCESSING_STATUSES],
      defaultValue: 'new',
      admin: { position: 'sidebar' },
    },
    { name: 'managerComment', type: 'textarea', label: 'Комментарий менеджера', admin: { position: 'sidebar' } },
    {
      type: 'row',
      fields: [
        { name: 'privacyConsent', type: 'checkbox', label: 'Политика конфиденциальности', admin: { readOnly: true } },
        { name: 'personalDataConsent', type: 'checkbox', label: 'Обработка персональных данных', admin: { readOnly: true } },
      ],
    },
    {
      name: 'sourceLabel',
      type: 'text',
      label: 'Источник',
      admin: { readOnly: true, description: 'Определяется по UTM-меткам страницы, с которой отправлена заявка.' },
    },
    {
      name: 'source',
      type: 'group',
      label: 'Источник (метки)',
      admin: { readOnly: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'utmSource', type: 'text', label: 'utm_source', admin: { width: '33%' } },
            { name: 'utmMedium', type: 'text', label: 'utm_medium', admin: { width: '33%' } },
            { name: 'utmCampaign', type: 'text', label: 'utm_campaign', admin: { width: '34%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'utmContent', type: 'text', label: 'utm_content', admin: { width: '33%' } },
            { name: 'utmTerm', type: 'text', label: 'utm_term', admin: { width: '33%' } },
            { name: 'yclid', type: 'text', label: 'yclid (Яндекс Директ)', admin: { width: '34%' } },
          ],
        },
        { name: 'page', type: 'text', label: 'Страница' },
        { name: 'origin', type: 'text', label: 'Домен фронта' },
      ],
    },
    {
      name: 'bitrixStatus',
      type: 'select',
      label: 'Статус в Битрикс24',
      options: [...LEAD_STATUSES],
      defaultValue: 'pending',
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'bitrixId', type: 'text', label: 'ID лида/сделки в Битрикс24', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'landingSource', type: 'text', label: 'Метка формы', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'userAgent', type: 'text', label: 'Браузер', admin: { readOnly: true, position: 'sidebar' } },
    {
      type: 'collapsible',
      label: 'Битрикс24',
      fields: [
        { name: 'bitrixError', type: 'textarea', label: 'Ошибка отправки', admin: { readOnly: true } },
        {
          name: 'resendToBitrix',
          type: 'checkbox',
          label: 'Отправить в Битрикс24 ещё раз',
          defaultValue: false,
          admin: { description: 'Отметьте и сохраните заявку — она уйдёт в Битрикс24 по текущим настройкам вебхука.' },
        },
      ],
    },
  ],
  timestamps: true,
}

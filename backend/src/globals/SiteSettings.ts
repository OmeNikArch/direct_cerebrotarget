import type { Field, GlobalConfig } from 'payload'
import { adminOnlyField, loggedIn } from '@/lib/access'
import { PALETTE } from '@/lib/palette'
import { invalidateHook } from '@/lib/siteCache'

// Поля Битрикс24 видит и меняет только администратор (там вебхук).
const bitrixAccess = { read: adminOnlyField, update: adminOnlyField }
const colorField = (p: (typeof PALETTE)[number]): Field => ({
  name: p.field,
  type: 'text',
  label: p.label,
  defaultValue: p.hex,
  validate: (v: unknown) => !v || /^#[0-9a-f]{6}$/i.test(String(v).trim()) || 'Цвет в формате #RRGGBB',
  admin: { width: '50%', placeholder: p.hex, description: `Исходный: ${p.hex}` },
})

// Настройки: оформление (цвета), SEO и интеграция Битрикс24 (как на clickout и vk-ads).
// ВАЖНО: read закрыт для публики — здесь вебхук Битрикс24.
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Настройки сайта',
  admin: { group: 'Настройки' },
  access: { read: loggedIn, update: loggedIn },
  hooks: { afterChange: [invalidateHook] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Оформление',
          description: 'Цвета сайта в формате #RRGGBB. Меняются сразу на всей странице: фоны секций, кнопки, текст.',
          fields: [
            {
              type: 'row',
              fields: PALETTE.slice(0, 4).map(colorField),
            },
            {
              type: 'row',
              fields: PALETTE.slice(4, 8).map(colorField),
            },
            {
              type: 'row',
              fields: PALETTE.slice(8).map(colorField),
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'seoTitle', type: 'text', label: 'Заголовок вкладки (title)', admin: { placeholder: 'Церебро — Яндекс Директ под заявки и продажи' } },
            { name: 'seoDescription', type: 'textarea', label: 'Описание для поисковиков (description)', maxLength: 200 },
          ],
        },
        {
          label: 'Интеграция Битрикс24',
          fields: [
            {
              name: 'bitrixEnabled',
              access: bitrixAccess,
              type: 'checkbox',
              label: 'Включить отправку заявок в Битрикс24',
              defaultValue: false,
              admin: { description: 'Пока выключено — заявки только сохраняются в админке, в Битрикс не уходят.' },
            },
            {
              name: 'bitrixWebhookUrl',
              access: bitrixAccess,
              type: 'text',
              label: 'Базовый URL входящего вебхука',
              admin: {
                description:
                  'БАЗОВЫЙ адрес вебхука без метода, например: https://ваш-портал.bitrix24.ru/rest/1/xxxxxxxx/ — метод подставляется автоматически. Права вебхука: crm.',
              },
            },
            {
              name: 'bitrixEntity',
              access: bitrixAccess,
              type: 'select',
              label: 'Что создавать в Битрикс24',
              defaultValue: 'lead',
              options: [
                { label: 'Сделку (в выбранной воронке)', value: 'deal' },
                { label: 'Лид (раздел «Лиды», без воронки)', value: 'lead' },
              ],
              admin: { description: 'Воронки есть только у Сделок. Для попадания в конкретную воронку выбирайте «Сделку».' },
            },
            {
              name: 'bitrixCategoryId',
              access: bitrixAccess,
              type: 'text',
              label: 'ID воронки (CATEGORY_ID)',
              admin: {
                description:
                  'Числовой ID воронки сделок: CRM → Сделки → воронка, ID виден в URL (…/category/7/). Пусто = воронка по умолчанию.',
                condition: (data) => data?.bitrixEntity === 'deal',
              },
            },
            {
              name: 'bitrixStageId',
              access: bitrixAccess,
              type: 'text',
              label: 'ID стадии (необязательно)',
              admin: {
                description: 'Напр. C7:NEW для первой стадии воронки 7. Пусто — первая стадия воронки.',
                condition: (data) => data?.bitrixEntity === 'deal',
              },
            },
            {
              name: 'bitrixAssignedById',
              access: bitrixAccess,
              type: 'text',
              label: 'ID ответственного (число)',
              admin: {
                description: 'ЧИСЛОВОЙ ID сотрудника Битрикс24 (напр. 1), не email. Виден в URL профиля (…/user/1/).',
              },
            },
          ],
        },
      ],
    },
  ],
}

import type { GlobalConfig } from 'payload'

// Настройки: интеграция Битрикс24 (как на clickout и vk-ads).
// ВАЖНО: read закрыт для публики — здесь вебхук Битрикс24.
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Настройки сайта',
  admin: { group: 'Настройки' },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Интеграция Битрикс24',
          fields: [
            {
              name: 'bitrixEnabled',
              type: 'checkbox',
              label: 'Включить отправку заявок в Битрикс24',
              defaultValue: false,
              admin: { description: 'Пока выключено — заявки только сохраняются в админке, в Битрикс не уходят.' },
            },
            {
              name: 'bitrixWebhookUrl',
              type: 'text',
              label: 'Базовый URL входящего вебхука',
              admin: {
                description:
                  'БАЗОВЫЙ адрес вебхука без метода, например: https://ваш-портал.bitrix24.ru/rest/1/xxxxxxxx/ — метод подставляется автоматически. Права вебхука: crm.',
              },
            },
            {
              name: 'bitrixEntity',
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
              type: 'text',
              label: 'ID стадии (необязательно)',
              admin: {
                description: 'Напр. C7:NEW для первой стадии воронки 7. Пусто — первая стадия воронки.',
                condition: (data) => data?.bitrixEntity === 'deal',
              },
            },
            {
              name: 'bitrixAssignedById',
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

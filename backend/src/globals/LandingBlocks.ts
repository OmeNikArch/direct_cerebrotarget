import type { Field, GlobalConfig } from 'payload'
import { loggedIn } from '@/lib/access'
import { invalidateHook } from '@/lib/siteCache'
import { CASE_CATEGORIES } from '@/lib/landingContent'

// Карточки и списки, которые фронт рисует из script.js / quiz.mjs (landingData, команда, кейсы, квиз).
// Заполняется исходным контентом сайта при первом запуске (onInit → seedLandingBlocks).
const hidden = (name: string): Field => ({ name, type: 'text', admin: { hidden: true } })
const title = (label = 'Заголовок'): Field => ({ name: 'title', type: 'text', label, required: true })
const text = (label = 'Текст'): Field => ({ name: 'text', type: 'textarea', label })
const fixedCount = (n: number) => ({ minRows: n, maxRows: n })
const htmlHint = 'Можно выделить жирным: <strong>текст</strong>.'

export const LandingBlocks: GlobalConfig = {
  slug: 'landing-blocks',
  label: 'Блоки лендинга',
  admin: {
    group: 'Контент сайта',
    description: 'Карточки, кейсы, отзывы, вопросы, команда и квиз. Порядок меняется перетаскиванием.',
  },
  access: { read: loggedIn, update: loggedIn },
  hooks: { afterChange: [invalidateHook] },
  fields: [
    { name: 'seeded', type: 'checkbox', admin: { hidden: true } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Первый экран',
          fields: [
            {
              name: 'facts',
              type: 'array',
              label: 'Факты под кнопками',
              ...fixedCount(4),
              fields: [hidden('key'), { name: 'text', type: 'text', label: 'Текст', required: true }],
            },
          ],
        },
        {
          label: 'Кому подходит',
          fields: [
            {
              name: 'fit',
              type: 'array',
              label: 'Карточки «Вам подойдёт, если»',
              ...fixedCount(4),
              admin: { description: 'Ровно 4 карточки — под каждую своя иллюстрация.' },
              fields: [title(), text()],
            },
          ],
        },
        {
          label: 'Проблемы и работы',
          fields: [
            {
              name: 'problems',
              type: 'array',
              label: 'Проблемы и решения',
              minRows: 1,
              fields: [
                { name: 'problem', type: 'text', label: 'Проблема', required: true },
                { name: 'solution', type: 'textarea', label: 'Решение' },
              ],
            },
            {
              name: 'serviceScope',
              type: 'array',
              label: 'Состав работы',
              ...fixedCount(4),
              admin: { description: 'Ровно 4 карточки — под каждую своя иконка.' },
              fields: [title(), text(), hidden('partnerLogo')],
            },
          ],
        },
        {
          label: 'Этапы и прозрачность',
          fields: [
            {
              name: 'process',
              type: 'array',
              label: 'Что дальше (этапы)',
              minRows: 1,
              fields: [title(), text()],
            },
            {
              name: 'transparency',
              type: 'array',
              label: 'Прозрачность работы',
              ...fixedCount(5),
              admin: { description: 'Ровно 5 карточек — под каждую своя иллюстрация.' },
              fields: [title(), text()],
            },
          ],
        },
        {
          label: 'Кейсы',
          fields: [
            {
              name: 'caseFilters',
              type: 'array',
              label: 'Названия фильтров',
              ...fixedCount(CASE_CATEGORIES.length + 1),
              fields: [hidden('id'), { name: 'label', type: 'text', label: 'Название', required: true }],
            },
            {
              name: 'cases',
              type: 'array',
              label: 'Кейсы',
              minRows: 1,
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'category',
                      type: 'select',
                      label: 'Фильтр',
                      required: true,
                      options: CASE_CATEGORIES.map(([value, label]) => ({ value, label })),
                      admin: { width: '33%' },
                    },
                    { name: 'label', type: 'text', label: 'Ниша (подпись)', admin: { width: '33%' } },
                    { name: 'context', type: 'text', label: 'Контекст (город · канал · срок)', admin: { width: '34%' } },
                  ],
                },
                title(),
                { name: 'task', type: 'textarea', label: 'Задача' },
                {
                  name: 'solution',
                  type: 'array',
                  label: 'Решение (абзацы)',
                  fields: [{ name: 'text', type: 'textarea', label: 'Абзац', required: true }],
                },
                {
                  name: 'results',
                  type: 'array',
                  label: 'Результаты',
                  maxRows: 4,
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'value', type: 'text', label: 'Цифра', required: true, admin: { width: '35%' } },
                        { name: 'label', type: 'text', label: 'Подпись', admin: { width: '65%' } },
                      ],
                    },
                  ],
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Картинка (4:3)',
                  admin: { description: 'Если не загружена — остаётся картинка с сайта.' },
                },
                hidden('defaultImage'),
              ],
            },
          ],
        },
        {
          label: 'Команда',
          fields: [
            {
              name: 'team',
              type: 'array',
              label: 'Команда',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', label: 'Имя', required: true, admin: { width: '50%' } },
                    { name: 'role', type: 'text', label: 'Должность', admin: { width: '50%' } },
                  ],
                },
                {
                  name: 'photo',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Фото (PNG без фона, 550×700)',
                  admin: { description: 'Если не загружено — остаётся фото с сайта.' },
                },
                hidden('photoFile'),
              ],
            },
          ],
        },
        {
          label: 'Отзывы',
          fields: [
            {
              name: 'reviews',
              type: 'array',
              label: 'Отзывы',
              minRows: 1,
              maxRows: 5,
              admin: { initCollapsed: true, description: 'До 5 отзывов — по числу аватарок.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', label: 'Клиент', required: true, admin: { width: '40%' } },
                    { name: 'detail', type: 'text', label: 'Подпись', admin: { width: '60%' } },
                  ],
                },
                {
                  name: 'paragraphs',
                  type: 'array',
                  label: 'Текст отзыва (абзацы)',
                  admin: { description: htmlHint },
                  fields: [{ name: 'text', type: 'textarea', label: 'Абзац', required: true }],
                },
              ],
            },
          ],
        },
        {
          label: 'Первый шаг',
          fields: [
            {
              name: 'startOptions',
              type: 'array',
              label: 'Карточки «С чего начать»',
              ...fixedCount(2),
              fields: [
                { name: 'label', type: 'text', label: 'Надпись над заголовком' },
                title(),
                text(),
                { name: 'cta', type: 'text', label: 'Текст кнопки' },
                hidden('ctaId'),
              ],
            },
          ],
        },
        {
          label: 'Вопросы',
          fields: [
            {
              name: 'faq',
              type: 'array',
              label: 'Вопросы и ответы',
              minRows: 1,
              fields: [
                { name: 'question', type: 'text', label: 'Вопрос', required: true },
                { name: 'answer', type: 'textarea', label: 'Ответ' },
              ],
            },
          ],
        },
        {
          label: 'Форма заявки',
          fields: [
            {
              name: 'contactCopy',
              type: 'group',
              label: 'Тексты над формой',
              fields: (['promotion', 'audit'] as const).map((mode) => ({
                name: mode,
                type: 'group' as const,
                label: mode === 'promotion' ? 'Обычная заявка (консультация)' : 'После кнопки «Заказать аудит»',
                fields: [
                  { name: 'eyebrow', type: 'text' as const, label: 'Надпись' },
                  { name: 'title', type: 'text' as const, label: 'Заголовок' },
                  { name: 'description', type: 'textarea' as const, label: 'Описание' },
                ],
              })),
            },
          ],
        },
        {
          label: 'Квиз',
          fields: [
            {
              name: 'quizSteps',
              type: 'array',
              label: 'Шаги квиза',
              ...fixedCount(5),
              admin: { description: 'Пять шагов; меняются тексты вопросов и вариантов.' },
              fields: [
                hidden('id'),
                {
                  type: 'row',
                  fields: [
                    { name: 'topic', type: 'text', label: 'Тема шага', admin: { width: '35%' } },
                    { name: 'question', type: 'text', label: 'Вопрос', required: true, admin: { width: '65%' } },
                  ],
                },
                {
                  name: 'options',
                  type: 'array',
                  label: 'Варианты ответа',
                  minRows: 2,
                  fields: [hidden('value'), { name: 'label', type: 'text', label: 'Вариант', required: true }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

import type { Field, GlobalConfig, Tab } from 'payload'
import slots from '@/content/slots.json'
import { BLOCK_LABELS, fieldName, type Slot } from '@/lib/slots'
import { loggedIn } from '@/lib/access'
import { invalidateHook } from '@/lib/siteCache'

// Все статичные тексты страницы (заголовки, подписи, кнопки) — по вкладкам секций.
// Список полей генерируется из site/index.html: npm run slots (см. README).
const short = (s: string, n = 70) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

const tabs: Tab[] = Object.entries(BLOCK_LABELS)
  .map(([block, label]) => {
    const fields: Field[] = (slots as Slot[])
      .filter((s) => s.block === block)
      .map((s) => ({
        name: fieldName(s.key),
        type: s.text.length > 70 ? 'textarea' : 'text',
        label: `${s.kind}: «${short(s.text, 50)}»`,
        defaultValue: s.text,
        admin: {
          description: s.count > 1 ? `Встречается на странице ${s.count} раза — меняется везде.` : undefined,
        },
      })) as Field[]
    return { label, fields }
  })
  .filter((t) => t.fields.length)

export const PageTexts: GlobalConfig = {
  slug: 'page-texts',
  label: 'Тексты страницы',
  admin: {
    group: 'Контент сайта',
    description: 'Заголовки, подписи и кнопки. Пустое поле — на сайте остаётся исходный текст.',
  },
  access: { read: loggedIn, update: loggedIn },
  hooks: { afterChange: [invalidateHook] },
  fields: [{ type: 'tabs', tabs }],
}

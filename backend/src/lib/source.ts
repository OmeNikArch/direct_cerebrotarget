// Классификация источника заявки в читаемую метку по UTM/referrer.
// Канонические значения utm_source, которые проставляются в рекламных ссылках:
//   yandex_direct → Яндекс Директ
//   vk_ads        → VK.Ads
//   avito         → Авито
//   email         → Пришедшие с информационной рассылки
//   (без utm)     → Органика
// Помимо точных значений есть нечёткие фолбэки, чтобы метка определялась даже при
// неточной разметке (yandex/vk/рассылочные сервисы/реферал с avito.ru и т.п.).

export type LeadSourceInput = {
  utmSource?: string | null
  utmMedium?: string | null
  referrer?: string | null
}

const has = (v: string, ...keys: string[]) => keys.some((k) => v.includes(k))

export function classifySource(s: LeadSourceInput): string {
  const src = (s.utmSource || '').toLowerCase().trim()
  const med = (s.utmMedium || '').toLowerCase().trim()
  const ref = (s.referrer || '').toLowerCase().trim()

  // Рассылка (включая популярные ESP).
  if (has(src, 'email', 'e-mail', 'newsletter', 'rassylka', 'mailing') || has(med, 'email', 'newsletter'))
    return 'Пришедшие с информационной рассылки'

  // Авито (рекламная метка или переход с avito.ru).
  if (has(src, 'avito') || has(ref, 'avito.ru')) return 'Авито'

  // VK.Ads.
  if (has(src, 'vk_ads', 'vkads', 'vk-ads', 'vk.ads', 'vkontakte') || src === 'vk') return 'VK.Ads'

  // Яндекс Директ (явная метка либо yandex + платный medium).
  if (has(src, 'yandex_direct', 'yandexdirect', 'yandex-direct', 'direct')) return 'Яндекс Директ'
  if (has(src, 'yandex') && has(med, 'cpc', 'paid', 'ppc', 'ads')) return 'Яндекс Директ'

  // Органика: нет utm и переход с поисковика (или прямой заход).
  if (!src) {
    if (!ref || has(ref, 'yandex.', 'google.', 'bing.', 'mail.ru', 'duckduckgo', 'rambler')) return 'Органика'
    return `Реферал: ${s.referrer}`
  }

  // Прочее — отдаём как есть (utm_source), чтобы не терять данные.
  return s.utmSource as string
}

// Справочник источников для подсказки в админке / отчётов.
export const SOURCE_LABELS = [
  'Яндекс Директ',
  'VK.Ads',
  'Авито',
  'Органика',
  'Пришедшие с информационной рассылки',
] as const

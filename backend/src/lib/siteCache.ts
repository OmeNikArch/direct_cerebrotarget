// Кэш собранных страниц (index.html, script.js, quiz.mjs). Сбрасывается при сохранении
// текстов, блоков, настроек и картинок в админке (хуки afterChange).
const cache = new Map<string, string>()

export const getCached = (key: string) => cache.get(key)
export const setCached = (key: string, value: string) => void cache.set(key, value)
export const invalidateSiteCache = () => cache.clear()
export const invalidateHook = () => {
  invalidateSiteCache()
}

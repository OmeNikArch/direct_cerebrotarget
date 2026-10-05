// Простейший rate-limit по IP: не более 5 заявок за 10 минут с одного адреса.
// In-memory (per-process) — достаточно против примитивного спама формы.
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5
const rateMap = new Map<string, number[]>()

export function rateLimited(ip: string, now = Date.now()): boolean {
  const hits = (rateMap.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
  if (hits.length >= RATE_MAX) return true
  hits.push(now)
  rateMap.set(ip, hits)
  if (rateMap.size > 5000) rateMap.clear() // защита от разрастания памяти
  return false
}

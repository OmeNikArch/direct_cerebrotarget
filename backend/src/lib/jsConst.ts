// Поиск и замена литерала константы в исходнике JS фронта: `const NAME = {…}` / `[…]`.
// Нужен, чтобы отдавать script.js и quiz.mjs с данными из админки, не меняя исходники site/.

function literalBounds(source: string, name: string): { start: number; end: number } | null {
  const m = new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?const\\s+${name}\\s*=\\s*`).exec(source)
  if (!m) return null
  const start = m.index + m[0].length
  const open = source[start]
  if (open !== '{' && open !== '[') return null
  let depth = 0
  for (let i = start; i < source.length; i++) {
    const ch = source[i]
    if (ch === "'" || ch === '"' || ch === '`') {
      // пропускаем строку целиком (с учётом экранирования)
      for (i++; i < source.length && source[i] !== ch; i++) if (source[i] === '\\') i++
      continue
    }
    if (ch === '{' || ch === '[') depth++
    else if (ch === '}' || ch === ']') {
      depth--
      if (depth === 0) return { start, end: i + 1 }
    }
  }
  return null
}

export function extractConst<T = unknown>(source: string, name: string): T | null {
  const b = literalBounds(source, name)
  if (!b) return null
  // Литерал из собственного репозитория (данные лендинга) — вычисляем как выражение.
  return new Function(`return (${source.slice(b.start, b.end)})`)() as T
}

export function replaceConst(source: string, name: string, value: unknown): string {
  const b = literalBounds(source, name)
  if (!b) return source
  return source.slice(0, b.start) + JSON.stringify(value, null, 1) + source.slice(b.end)
}

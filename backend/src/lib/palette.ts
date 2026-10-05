// Цвета лендинга = токены tailwind.config в site/index.html. В админке меняется значение токена,
// на сервере все вхождения исходного HEX (и его rgb-формы) в странице заменяются на новый.
export const PALETTE: { token: string; field: string; label: string; hex: string }[] = [
  { token: 'brand', field: 'colorBrand', label: 'Фирменный синий (заголовки, кнопки-контуры, фон секций)', hex: '#0A238B' },
  { token: 'brand-bright', field: 'colorBrandBright', label: 'Яркий синий (градиент формы, фокус)', hex: '#2F63F5' },
  { token: 'brand-deep', field: 'colorBrandDeep', label: 'Тёмный синий (шапка при прокрутке, меню, низ градиента)', hex: '#06195F' },
  { token: 'accent', field: 'colorAccent', label: 'Акцент (жёлтые кнопки и метки)', hex: '#FFD400' },
  { token: 'paper', field: 'colorPaper', label: 'Фон страницы', hex: '#F4F6FA' },
  { token: 'surface', field: 'colorSurface', label: 'Белые карточки', hex: '#FFFFFF' },
  { token: 'blue-soft', field: 'colorBlueSoft', label: 'Светло-голубой фон (карточки, таблица)', hex: '#E9EEFF' },
  { token: 'yellow-soft', field: 'colorYellowSoft', label: 'Светло-жёлтый фон', hex: '#FFF7CC' },
  { token: 'ink', field: 'colorInk', label: 'Основной текст', hex: '#152038' },
  { token: 'ink-muted', field: 'colorInkMuted', label: 'Второстепенный текст', hex: '#526078' },
  { token: 'border', field: 'colorBorder', label: 'Линии и рамки', hex: '#DCE3EE' },
]

const HEX = /^#[0-9a-f]{6}$/i
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ')

export function applyPalette(html: string, values: Record<string, unknown>): string {
  let out = html
  for (const p of PALETTE) {
    const v = typeof values[p.field] === 'string' ? (values[p.field] as string).trim() : ''
    if (!HEX.test(v) || v.toLowerCase() === p.hex.toLowerCase()) continue
    out = out.replace(new RegExp(p.hex, 'gi'), v.toUpperCase())
    out = out.split(`rgb(${rgb(p.hex)} `).join(`rgb(${rgb(v)} `)
  }
  return out
}

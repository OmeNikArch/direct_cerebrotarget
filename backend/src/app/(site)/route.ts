import { renderIndexHtml } from '@/lib/renderSite'

export const dynamic = 'force-dynamic'

// Главная — лендинг из site/ с текстами, цветами и SEO из админки.
export async function GET() {
  return new Response(await renderIndexHtml(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}

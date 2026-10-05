import { renderScriptJs } from '@/lib/renderSite'

export const dynamic = 'force-dynamic'

// script.js фронта с данными «Блоков лендинга» (карточки, кейсы, отзывы, FAQ, команда).
export async function GET() {
  return new Response(await renderScriptJs(), {
    headers: { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}

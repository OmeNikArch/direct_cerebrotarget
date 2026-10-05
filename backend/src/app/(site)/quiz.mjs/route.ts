import { renderQuizJs } from '@/lib/renderSite'

export const dynamic = 'force-dynamic'

// quiz.mjs фронта с вопросами и вариантами квиза из админки.
export async function GET() {
  return new Response(await renderQuizJs(), {
    headers: { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}

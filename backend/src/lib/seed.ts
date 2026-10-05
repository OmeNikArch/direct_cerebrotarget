import type { Payload } from 'payload'
import { defaultBlocks } from './landingContent'

// Первое заполнение «Блоков лендинга» исходным контентом сайта, чтобы в админке было что править.
export async function seedLandingBlocks(payload: Payload) {
  try {
    const current = (await payload.findGlobal({ slug: 'landing-blocks', overrideAccess: true })) as { seeded?: boolean }
    if (current?.seeded) return
    await payload.updateGlobal({
      slug: 'landing-blocks',
      overrideAccess: true,
      data: { ...defaultBlocks(), seeded: true } as never,
    })
    payload.logger.info('Блоки лендинга заполнены исходным контентом сайта')
  } catch (e) {
    payload.logger.warn({ err: e }, 'Не удалось заполнить блоки лендинга (нет site-template? запустите npm run sync-site)')
  }
}

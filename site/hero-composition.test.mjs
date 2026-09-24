import assert from 'node:assert/strict'
import test from 'node:test'
import { createHeroCompositionController } from './hero-composition.mjs'

test('plays the scene once on the next frame', () => {
  const root = { dataset: {} }
  let nextFrame
  const controller = createHeroCompositionController({
    root,
    reduceMotion: false,
    windowObject: { requestAnimationFrame: (callback) => { nextFrame = callback } },
  })

  controller.start()
  assert.equal(root.dataset.heroScene, 'ready')
  nextFrame()
  assert.equal(root.dataset.heroScene, 'playing')
})

test('shows the final scene immediately for reduced motion', () => {
  const root = { dataset: {} }
  createHeroCompositionController({ root, reduceMotion: true, windowObject: {} }).start()
  assert.equal(root.dataset.heroScene, 'complete')
})

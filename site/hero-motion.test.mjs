import assert from 'node:assert/strict'
import test from 'node:test'
import { createHeroLineMotionController, getHeroLineScrollProgress } from './hero-motion.mjs'

const createFixture = ({ reduceMotion = false, top = 0, height = 800, scrollY = 0 } = {}) => {
  const listeners = new Map()
  const animation = { cancelled: false, cancel() { this.cancelled = true } }
  const path = {
    style: {},
    animation: null,
    animate(frames, options) {
      this.animation = { frames, options, instance: animation }
      return animation
    },
  }
  const rect = { top, height }
  const root = { getBoundingClientRect: () => ({ ...rect }) }
  const windowObject = {
    scrollY,
    addEventListener(name, handler) { listeners.set(name, handler) },
    removeEventListener(name) { listeners.delete(name) },
    requestAnimationFrame(handler) { handler(); return 1 },
    cancelAnimationFrame() {},
  }
  const controller = createHeroLineMotionController({ root, path, reduceMotion, windowObject })

  return { animation, controller, listeners, path, rect }
}

test('maps the first 45 percent of hero scroll to a clamped line progress', () => {
  assert.equal(getHeroLineScrollProgress({ top: 0, height: 800 }), 0)
  assert.equal(getHeroLineScrollProgress({ top: -180, height: 800 }), 0.5)
  assert.equal(getHeroLineScrollProgress({ top: -360, height: 800 }), 1)
  assert.equal(getHeroLineScrollProgress({ top: -500, height: 800 }), 1)
})

test('draws the right-to-left SVG path visually from left to right on entry', () => {
  const fixture = createFixture()

  fixture.controller.start()

  assert.equal(fixture.path.style.strokeDashoffset, '-1')
  assert.deepEqual(fixture.path.animation.frames, [{ strokeDashoffset: -1 }, { strokeDashoffset: 0 }])
  assert.deepEqual(fixture.path.animation.options, { duration: 1600, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' })
})

test('erases left to right while scrolling down and restores on reverse scroll', () => {
  const fixture = createFixture()
  fixture.controller.start()

  fixture.rect.top = -360
  fixture.listeners.get('scroll')()
  assert.equal(fixture.animation.cancelled, true)
  assert.equal(fixture.path.style.strokeDashoffset, '1')
  assert.equal(fixture.path.style.opacity, '0')

  fixture.rect.top = -180
  fixture.listeners.get('scroll')()
  assert.equal(fixture.path.style.strokeDashoffset, '0.5')
  assert.equal(fixture.path.style.opacity, '1')

  fixture.rect.top = 0
  fixture.listeners.get('scroll')()
  assert.equal(fixture.path.style.strokeDashoffset, '0')
  assert.equal(fixture.path.style.opacity, '1')
})

test('skips the timed intro for reduced motion while preserving direct scroll state', () => {
  const fixture = createFixture({ reduceMotion: true })

  fixture.controller.start()
  assert.equal(fixture.path.animation, null)
  assert.equal(fixture.path.style.strokeDashoffset, '0')

  fixture.rect.top = -360
  fixture.listeners.get('scroll')()
  assert.equal(fixture.path.style.strokeDashoffset, '1')
})

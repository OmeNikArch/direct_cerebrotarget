import assert from 'node:assert/strict'
import test from 'node:test'
import { createInertialCaseScroller } from './case-carousel-physics.mjs'

test('carries release velocity before requesting a snap target', () => {
  let position = 0
  let frame = null
  let settledPosition = null
  const scroller = createInertialCaseScroller({
    getPosition: () => position,
    setPosition: (nextPosition) => { position = nextPosition },
    requestFrame: (callback) => { frame = callback; return 1 },
    cancelFrame: () => { frame = null },
    onInertiaEnd: (finalPosition) => { settledPosition = finalPosition },
  })

  scroller.begin(0, 0)
  position = 96
  scroller.track(96, 96)
  scroller.release()

  frame(112)
  assert.ok(position > 96, 'the carousel continues moving after release')

  for (let time = 128; time < 2400 && settledPosition === null; time += 16) frame(time)

  assert.ok(settledPosition > 96, 'the final snap is calculated after inertia, not at release')
})

test('stops active inertia as soon as a new drag begins', () => {
  let position = 0
  let frame = null
  const scroller = createInertialCaseScroller({
    getPosition: () => position,
    setPosition: (nextPosition) => { position = nextPosition },
    requestFrame: (callback) => { frame = callback; return 1 },
    cancelFrame: () => { frame = null },
    onInertiaEnd: () => { throw new Error('interrupted inertia must not settle') },
  })

  scroller.begin(0, 0)
  position = 72
  scroller.track(72, 72)
  scroller.release()
  scroller.begin(72, 80)

  assert.equal(frame, null)
})

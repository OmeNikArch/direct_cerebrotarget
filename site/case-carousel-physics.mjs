const frameDuration = 1000 / 60
const maxFrameDuration = 32
const velocityThreshold = 0.02
const velocityDecayPerFrame = 0.92

export const createInertialCaseScroller = ({ getPosition, setPosition, requestFrame, cancelFrame, onInertiaEnd }) => {
  let velocity = 0
  let lastPosition = 0
  let lastTime = 0
  let lastFrameTime = 0
  let frame = null

  const stop = () => {
    if (frame !== null) cancelFrame(frame)
    frame = null
    velocity = 0
  }

  const step = (timestamp) => {
    const elapsed = Math.min(Math.max(timestamp - lastFrameTime, 0), maxFrameDuration)
    lastFrameTime = timestamp
    const nextPosition = getPosition() + velocity * elapsed
    setPosition(nextPosition)
    velocity *= Math.pow(velocityDecayPerFrame, elapsed / frameDuration)

    if (Math.abs(velocity) <= velocityThreshold) {
      frame = null
      onInertiaEnd(getPosition())
      return
    }

    frame = requestFrame(step)
  }

  return {
    begin(position, timestamp) {
      stop()
      lastPosition = position
      lastTime = timestamp
    },
    track(position, timestamp) {
      const elapsed = Math.max(timestamp - lastTime, 1)
      velocity = (position - lastPosition) / elapsed
      lastPosition = position
      lastTime = timestamp
    },
    release() {
      if (Math.abs(velocity) <= velocityThreshold) {
        onInertiaEnd(getPosition())
        return
      }
      lastFrameTime = lastTime
      frame = requestFrame(step)
    },
    stop,
  }
}

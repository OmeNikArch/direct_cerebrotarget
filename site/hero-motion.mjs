const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const getHeroLineScrollProgress = ({ top, height }) => {
  const travel = Math.max(height * 0.45, 1)
  return clamp(-top / travel, 0, 1)
}

export const createHeroLineMotionController = ({ root, path, reduceMotion = false, windowObject = window }) => {
  let introAnimation = null
  let framePending = false

  const update = () => {
    const { top, height } = root.getBoundingClientRect()
    const progress = getHeroLineScrollProgress({ top, height })
    path.style.strokeDashoffset = String(progress)
    path.style.opacity = progress >= 1 ? '0' : '1'
  }

  const scheduleUpdate = () => {
    if (framePending) return
    framePending = true
    windowObject.requestAnimationFrame(() => {
      framePending = false
      update()
    })
  }

  const handleScroll = () => {
    introAnimation?.cancel()
    introAnimation = null
    scheduleUpdate()
  }

  return {
    start() {
      windowObject.addEventListener('scroll', handleScroll, { passive: true })
      windowObject.addEventListener('resize', scheduleUpdate)

      if (reduceMotion || windowObject.scrollY > 0) {
        update()
        return
      }

      path.style.opacity = '1'
      path.style.strokeDashoffset = '-1'
      introAnimation = path.animate(
        [{ strokeDashoffset: -1 }, { strokeDashoffset: 0 }],
        { duration: 1600, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' },
      )
    },
    destroy() {
      introAnimation?.cancel()
      windowObject.removeEventListener('scroll', handleScroll)
      windowObject.removeEventListener('resize', scheduleUpdate)
    },
  }
}

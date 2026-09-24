export const createHeroCompositionController = ({ root, reduceMotion = false, windowObject = window }) => ({
  start() {
    if (reduceMotion) {
      root.dataset.heroScene = 'complete'
      return
    }

    root.dataset.heroScene = 'ready'
    windowObject.requestAnimationFrame(() => { root.dataset.heroScene = 'playing' })
  },
})

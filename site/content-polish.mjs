const shortWords = 'а|без|в|во|для|до|за|и|из|или|к|на|над|не|ни|но|о|об|от|перед|по|под|при|про|с|со|у|через'
const shortWordPattern = new RegExp(`(^|[\\s(«„"—-])(${shortWords})\\s+`, 'giu')

export const protectShortWords = (text) => text.replace(shortWordPattern, '$1$2\u00a0')

export const protectHeadingOrphans = ({
  root = document,
  documentObject = document,
  nodeFilter = { SHOW_TEXT: 4 },
} = {}) => {
  root.querySelectorAll('h1, h2, h3').forEach((heading) => {
    const walker = documentObject.createTreeWalker(heading, nodeFilter.SHOW_TEXT)
    const textNodes = []
    while (walker.nextNode()) textNodes.push(walker.currentNode)
    textNodes.forEach((node) => { node.nodeValue = protectShortWords(node.nodeValue) })
  })
}

export const createCountUpController = ({
  element,
  target,
  suffix = '',
  duration = 1000,
  reduceMotion = false,
  requestFrame = (callback) => requestAnimationFrame(callback),
  cancelFrame = (id) => cancelAnimationFrame(id),
  observerFactory = (callback, options) => new IntersectionObserver(callback, options),
}) => {
  if (!element) return { destroy() {} }
  const finalValue = `${target}${suffix}`
  if (reduceMotion) {
    element.textContent = finalValue
    return { destroy() {} }
  }

  element.textContent = `0${suffix}`
  let frameId
  let startTime = null
  let finished = false
  const tick = (timestamp) => {
    if (startTime === null) startTime = timestamp
    const progress = Math.min((timestamp - startTime) / duration, 1)
    element.textContent = `${Math.round(target * progress)}${suffix}`
    if (progress < 1) frameId = requestFrame(tick)
    else finished = true
  }

  const observer = observerFactory(([entry]) => {
    if (!entry?.isIntersecting || finished || frameId) return
    observer.unobserve(entry.target)
    frameId = requestFrame(tick)
  }, { threshold: 0.45 })
  observer.observe(element)

  return {
    destroy() {
      observer.disconnect()
      if (frameId && !finished) cancelFrame(frameId)
    },
  }
}

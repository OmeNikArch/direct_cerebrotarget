const shortWords = 'а|без|в|во|для|до|за|и|из|или|к|на|над|не|ни|но|о|об|от|перед|по|под|при|про|с|со|у|через'
const shortWordPattern = new RegExp(`(^|[\\s(«„"—-])(${shortWords})\\s+`, 'giu')

export const protectShortWords = (text) => text.replace(shortWordPattern, '$1$2\u00a0')

const groupedNumberPattern = /(\d{1,3})\s(?=\d{3}\b)/gu
const currencyPattern = /(\d+(?:[.,]\d+)?(?:[+%])?)\s+(?=₽)/gu
const numberUnitPattern = /(\d+(?:[.,]\d+)?(?:[+%])?)\s+(?=(?:р\.|руб(?:\.|лей|ля)?|тыс\.|млн|млрд|месяц(?:а|ев)?|год(?:а|лет)|дн(?:я|ей)|недел[ьи]|раз(?:а)?|заяв(?:ка|ки|ок)|лид(?:а|ов)?|билет(?:а|ов)?|клиент(?:а|ов)?|кампани(?:я|и|й)|конверси(?:я|и|й)|продаж(?:а|и|й))(?:\s|$|[,.!?;:]))/giu

export const protectNumberGroups = (text) => text
  .replace(groupedNumberPattern, '$1\u00a0')
  .replace(currencyPattern, '$1\u00a0')
  .replace(numberUnitPattern, '$1\u00a0')

export const protectTypography = ({
  root = document.body,
  documentObject = document,
  nodeFilter = { SHOW_TEXT: 4 },
} = {}) => {
  if (!root?.querySelectorAll) return
  const visualTextSelectors = 'h1, h2, h3, p, li, a, button, label, td, th, figcaption, summary'
  root.querySelectorAll(visualTextSelectors).forEach((element) => {
    const walker = documentObject.createTreeWalker(element, nodeFilter.SHOW_TEXT)
    const textNodes = []
    while (walker.nextNode()) textNodes.push(walker.currentNode)
    textNodes.forEach((node) => { node.nodeValue = protectShortWords(protectNumberGroups(node.nodeValue)) })
  })
}

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

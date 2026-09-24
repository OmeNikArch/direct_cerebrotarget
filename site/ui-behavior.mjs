export const createInitialScrollController = ({
  windowObject = globalThis.window,
  historyObject = globalThis.history,
  locationObject = globalThis.location,
}) => {
  if (historyObject && 'scrollRestoration' in historyObject) historyObject.scrollRestoration = 'manual'

  const resetToTop = () => {
    if (!locationObject?.hash && typeof windowObject?.scrollTo === 'function') windowObject.scrollTo(0, 0)
  }

  resetToTop()
  windowObject?.addEventListener?.('pageshow', resetToTop)

  return {
    destroy: () => windowObject?.removeEventListener?.('pageshow', resetToTop),
  }
}

export const createStickyHeaderController = ({
  header,
  windowObject = window,
}) => {
  const update = () => header.classList.toggle('is-scrolled', windowObject.scrollY > 8)
  update()
  windowObject.addEventListener('scroll', update, { passive: true })
  return { destroy: () => windowObject.removeEventListener('scroll', update) }
}

export const createMobileMenuController = ({
  button,
  menu,
  body,
  documentObject = document,
}) => {
  const setOpen = (open, { restoreFocus = false } = {}) => {
    button.setAttribute('aria-expanded', String(open))
    menu.dataset.open = String(open)
    menu.setAttribute('aria-hidden', String(!open))
    body.classList.toggle('menu-open', open)
    if (restoreFocus) button.focus()
  }

  const toggle = () => setOpen(button.getAttribute('aria-expanded') !== 'true')
  const onKeydown = (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false, { restoreFocus: true })
    }
  }
  const onMenuClick = (event) => {
    if (event.target.closest?.('a')) setOpen(false)
  }

  button.addEventListener('click', toggle)
  menu.addEventListener?.('click', onMenuClick)
  documentObject.addEventListener?.('keydown', onKeydown)

  return {
    close: () => setOpen(false),
    destroy() {
      button.removeEventListener('click', toggle)
      menu.removeEventListener?.('click', onMenuClick)
      documentObject.removeEventListener?.('keydown', onKeydown)
      body?.classList.toggle('menu-open', false)
    },
  }
}

export const createRevealOnceController = ({
  elements,
  reduceMotion = false,
  observerFactory = (callback, options) => new IntersectionObserver(callback, options),
}) => {
  const reveal = (element) => element.classList.add('is-revealed')
  if (elements.length === 0) return { destroy() {} }
  if (reduceMotion) {
    elements.forEach(reveal)
    return { destroy() {} }
  }

  const observer = observerFactory((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      reveal(entry.target)
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.18 })
  elements.forEach((element) => observer.observe(element))
  return { destroy: () => observer.disconnect() }
}

export const createPathDrawOnViewController = ({
  paths,
  reduceMotion = false,
  observerFactory = (callback, options) => new IntersectionObserver(callback, options),
}) => {
  const animations = new Set()
  paths.forEach((path) => {
    path.style.strokeDasharray = '1 1'
    path.style.strokeDashoffset = reduceMotion ? '0' : '1'
  })

  if (paths.length === 0 || reduceMotion) return { destroy() {} }

  const observer = observerFactory((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const animation = entry.target.animate(
        [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
        { duration: 1600, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' },
      )
      animations.add(animation)
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.18 })

  paths.forEach((path) => observer.observe(path))
  return {
    destroy() {
      animations.forEach((animation) => animation.cancel())
      observer.disconnect()
    },
  }
}

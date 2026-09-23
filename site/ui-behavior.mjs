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

import assert from 'node:assert/strict'
import test from 'node:test'

const ui = await import('./ui-behavior.mjs').catch(() => ({}))

const createClassList = () => {
  const values = new Set()
  return {
    contains: (value) => values.has(value),
    toggle(value, force) {
      if (force) values.add(value)
      else values.delete(value)
    },
  }
}

test('sticky header gains its background as soon as scrolling starts', () => {
  assert.equal(typeof ui.createStickyHeaderController, 'function')
  const header = { classList: createClassList() }
  let scrollHandler
  let removed = false
  const windowObject = {
    scrollY: 0,
    addEventListener(name, handler) { if (name === 'scroll') scrollHandler = handler },
    removeEventListener(name, handler) { if (name === 'scroll' && handler === scrollHandler) removed = true },
  }
  const controller = ui.createStickyHeaderController({ header, windowObject })
  assert.equal(header.classList.contains('is-scrolled'), false)
  windowObject.scrollY = 12
  scrollHandler()
  assert.equal(header.classList.contains('is-scrolled'), true)
  windowObject.scrollY = 0
  scrollHandler()
  assert.equal(header.classList.contains('is-scrolled'), false)
  controller.destroy()
  assert.equal(removed, true)
})

test('mobile menu locks page scroll and closes on Escape', () => {
  assert.equal(typeof ui.createMobileMenuController, 'function')
  const listeners = new Map()
  const button = {
    attrs: new Map([['aria-expanded', 'false']]),
    addEventListener(name, handler) { listeners.set(`button:${name}`, handler) },
    removeEventListener() {},
    getAttribute(name) { return this.attrs.get(name) },
    setAttribute(name, value) { this.attrs.set(name, value) },
    focusCalled: false,
    focus() { this.focusCalled = true },
  }
  const menu = {
    dataset: { open: 'false' },
    attrs: new Map([['aria-hidden', 'true']]),
    addEventListener() {},
    removeEventListener() {},
    setAttribute(name, value) { this.attrs.set(name, value) },
  }
  const body = { classList: createClassList() }
  const documentObject = {
    addEventListener(name, handler) { listeners.set(`document:${name}`, handler) },
    removeEventListener() {},
  }
  ui.createMobileMenuController({ button, menu, body, documentObject })

  listeners.get('button:click')()
  assert.equal(menu.dataset.open, 'true')
  assert.equal(menu.attrs.get('aria-hidden'), 'false')
  assert.equal(body.classList.contains('menu-open'), true)

  listeners.get('document:keydown')({ key: 'Escape' })
  assert.equal(menu.dataset.open, 'false')
  assert.equal(menu.attrs.get('aria-hidden'), 'true')
  assert.equal(body.classList.contains('menu-open'), false)
  assert.equal(button.focusCalled, true)
})

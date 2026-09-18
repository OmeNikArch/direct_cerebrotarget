import assert from 'node:assert/strict'
import test from 'node:test'
import { createBeforeAfterToggle } from './before-after-toggle.mjs'

const createButton = () => {
  const listeners = new Map()

  return {
    textContent: '',
    attributes: new Map(),
    setAttribute(name, value) { this.attributes.set(name, value) },
    addEventListener(name, handler) { listeners.set(name, handler) },
    click() { listeners.get('click')() },
  }
}

test('starts the before-after example collapsed and reveals it from its button', () => {
  const button = createButton()
  const panel = { hidden: false }

  createBeforeAfterToggle({ button, panel })

  assert.equal(button.attributes.get('aria-expanded'), 'false')
  assert.equal(button.textContent, 'Показать пример')
  assert.equal(panel.hidden, true)

  button.click()

  assert.equal(button.attributes.get('aria-expanded'), 'true')
  assert.equal(button.textContent, 'Скрыть пример')
  assert.equal(panel.hidden, false)
})

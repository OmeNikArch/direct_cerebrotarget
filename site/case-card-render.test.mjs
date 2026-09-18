import test from 'node:test'
import assert from 'node:assert/strict'

class FakeElement {
  constructor() {
    this.innerHTML = ''
    this.textContent = ''
    this.value = ''
    this.checked = false
    this.hidden = false
    this.required = false
    this.disabled = false
    this.scrollLeft = 0
    this.dataset = {}
    this.classList = { toggle() {} }
  }

  addEventListener() {}
  setAttribute() {}
  querySelector() { return new FakeElement() }
  querySelectorAll() { return [] }
}

test('reserves a responsive image slot in the upper-right corner of every case card', async () => {
  const elements = new Map()
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, new FakeElement())
    return elements.get(id)
  }

  globalThis.document = {
    getElementById: getElement,
    querySelector: () => null,
    querySelectorAll: () => [],
  }
  globalThis.window = { matchMedia: () => ({ matches: false }) }

  await import(new URL('./script.js?case-image-slot', import.meta.url).href)

  const caseCards = getElement('case-cards').innerHTML
  assert.match(caseCards, /data-case-header/u)
  assert.match(caseCards, /data-case-image/u)
  assert.match(caseCards, /grid-cols-\[minmax\(0,1fr\)_80px\]/u)
  assert.match(caseCards, /sm:grid-cols-\[minmax\(0,1fr\)_120px\]/u)
})

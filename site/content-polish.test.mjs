import assert from 'node:assert/strict'
import test from 'node:test'

const polish = await import('./content-polish.mjs').catch(() => ({}))

test('protects short Russian prepositions in headings', () => {
  assert.equal(typeof polish.protectShortWords, 'function')
  assert.equal(
    polish.protectShortWords('Обсудим вашу задачу и следующий шаг'),
    'Обсудим вашу задачу и\u00a0следующий шаг',
  )
  assert.equal(
    polish.protectShortWords('Строим работу прозрачно и понятно — ничего не скрываем'),
    'Строим работу прозрачно и\u00a0понятно — ничего не\u00a0скрываем',
  )
})

test('keeps grouped numbers, prices and units on one line', () => {
  assert.equal(typeof polish.protectNumberGroups, 'function')
  assert.equal(
    polish.protectNumberGroups('Бюджет от 100 000 ₽ в месяц'),
    'Бюджет от 100\u00a0000\u00a0₽ в месяц',
  )
  assert.equal(
    polish.protectNumberGroups('Работаем 6 месяцев и получили 72 заявки'),
    'Работаем 6\u00a0месяцев и получили 72\u00a0заявки',
  )
})

test('shows the final counter value immediately for reduced motion', () => {
  assert.equal(typeof polish.createCountUpController, 'function')
  const element = { textContent: '' }
  const controller = polish.createCountUpController({
    element,
    target: 3000,
    suffix: '+',
    reduceMotion: true,
    observerFactory: () => { throw new Error('observer should not run') },
  })
  assert.equal(element.textContent, '3000+')
  controller.destroy()
})

test('counts once when the statistic enters the viewport', () => {
  const element = { textContent: '' }
  const frames = []
  let observerCallback
  let unobserved = false
  polish.createCountUpController({
    element,
    target: 3000,
    suffix: '+',
    duration: 1000,
    requestFrame: (callback) => { frames.push(callback); return frames.length },
    observerFactory: (callback) => {
      observerCallback = callback
      return { observe() {}, unobserve() { unobserved = true }, disconnect() {} }
    },
  })

  observerCallback([{ isIntersecting: true, target: element }])
  assert.equal(unobserved, true)
  frames.shift()(0)
  frames.shift()(500)
  assert.equal(element.textContent, '1500+')
  frames.shift()(1000)
  assert.equal(element.textContent, '3000+')
})

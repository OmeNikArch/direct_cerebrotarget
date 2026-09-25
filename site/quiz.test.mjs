import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8')
const script = await readFile(new URL('./script.js', import.meta.url), 'utf8')
const quiz = await readFile(new URL('./quiz.mjs', import.meta.url), 'utf8')

test('turns the media-plan card into a five-step qualification quiz', () => {
  assert.match(html, /data-quiz-form/u)
  assert.match(html, /data-quiz-question/u)
  assert.match(html, /data-quiz-back/u)
  assert.match(html, /data-quiz-next/u)
  assert.match(html, /data-quiz-complete/u)
  assert.doesNotMatch(html, /quiz-placeholder-lines/u)
  assert.match(script, /createQuizController/u)
})

test('shows a separate contact form inside the completed quiz', () => {
  const completion = html.match(/<section data-quiz-complete[\s\S]*?<\/section>/u)?.[0] || ''
  assert.match(completion, /<form id="quiz-lead-form"[^>]*data-quiz-lead-form/u)
  for (const field of ['name', 'phone', 'site', 'consent']) assert.match(completion, new RegExp(`name="${field}"`, 'u'))
  assert.match(completion, /name="site"[^>]*type="url"/u)
  assert.match(completion, />Оставить заявку<\/button>/u)
  assert.doesNotMatch(completion, /href="#contact"/u)
})

test('keeps quiz answers inside the quiz form instead of changing the promotion form', () => {
  assert.match(quiz, /data-quiz-field="\$\{step\.id\}"/u)
  assert.match(quiz, /const quizLeadForm = root\.querySelector\('\[data-quiz-lead-form\]'\)/u)
  assert.match(quiz, /quizLeadForm\.querySelector/u)
  assert.doesNotMatch(quiz, /root\.ownerDocument\.querySelector/u)
  assert.doesNotMatch(script, /quizLeadFields|onAnswer: \(field, value\)/u)
})

test('uses the supplied quiz artwork on tablet and desktop while keeping mobile text-only', async () => {
  await Promise.all([
    access(new URL('./assets/quiz/media-plan-desktop.png', import.meta.url)),
    access(new URL('./assets/quiz/media-plan-tablet.png', import.meta.url)),
  ])

  const section = html.match(/<section id="quiz"[\s\S]*?<section id="experience-dark"/u)?.[0] || ''
  const artwork = section.match(/<picture data-quiz-illustration[\s\S]*?<\/picture>/u)?.[0] || ''

  assert.match(artwork, /class="[^"]*hidden[^"]*md:block/u)
  assert.match(artwork, /<source media="\(min-width: 1024px\)" srcset="\.\/assets\/quiz\/media-plan-desktop\.png"/u)
  assert.match(artwork, /<img[^>]*src="\.\/assets\/quiz\/media-plan-tablet\.png"/u)
  assert.match(artwork, /alt=""[^>]*aria-hidden="true"/u)
})

export const quizSteps = [
  {
    id: 'business',
    topic: 'Контекст бизнеса',
    question: 'Что вы хотите продвигать?',
    options: ['Услуги', 'Интернет-магазин', 'Производство / B2B', 'Онлайн-образование', 'Другое'],
  },
  {
    id: 'geography',
    topic: 'География',
    question: 'Где хотите находить клиентов?',
    options: ['В одном городе', 'В нескольких регионах', 'По всей России', 'Нужна помощь с выбором географии'],
  },
  {
    id: 'goal',
    topic: 'Цель продвижения',
    question: 'Какая задача сейчас главная?',
    options: ['Больше заявок', 'Снизить стоимость заявки', 'Запустить рекламу с нуля', 'Масштабировать работающие кампании'],
  },
  {
    id: 'situation',
    topic: 'Текущая ситуация',
    question: 'Что уже происходит с рекламой?',
    options: ['Ещё не запускали', 'Реклама есть, но результат нестабильный', 'Нужен аудит или смена подрядчика', 'Реклама работает, хотим масштабироваться'],
  },
  {
    id: 'budget',
    topic: 'Бюджет',
    question: 'Какой рекламный бюджет рассматриваете в месяц?',
    options: [
      ['100-500', '100–500 тыс. ₽'],
      ['501-1000', '501 тыс.–1 млн ₽'],
      ['1000-plus', 'Более 1 млн ₽'],
      ['calculate', 'Нужен расчёт'],
    ],
  },
]

const optionDetails = (option) => Array.isArray(option) ? { value: option[0], label: option[1] } : { value: option, label: option }

export const createQuizController = ({ root }) => {
  const question = root.querySelector('[data-quiz-question]')
  const stepLabel = root.querySelector('[data-quiz-step]')
  const topic = root.querySelector('[data-quiz-topic]')
  const progress = root.querySelector('[data-quiz-progress]')
  const next = root.querySelector('[data-quiz-next]')
  const back = root.querySelector('[data-quiz-back]')
  const quizForm = root.querySelector('[data-quiz-form]')
  const completion = root.querySelector('[data-quiz-complete]')
  const summary = root.querySelector('[data-quiz-summary]')
  const quizLeadForm = root.querySelector('[data-quiz-lead-form]')
  const answers = {}
  let index = 0

  const saveAnswersForLead = () => {
    const fieldNames = { business: 'quizBusiness', geography: 'quizGeography', goal: 'quizGoal', situation: 'quizSituation', budget: 'quizBudget' }
    Object.entries(fieldNames).forEach(([answer, field]) => {
      const input = quizLeadForm.querySelector(`[name="${field}"]`)
      if (input) input.value = answers[answer] || ''
    })
  }

  const render = () => {
    const step = quizSteps[index]
    stepLabel.textContent = `Шаг ${index + 1} из ${quizSteps.length}`
    topic.textContent = step.topic
    progress.innerHTML = quizSteps.map((_, progressIndex) => `<span class="h-1 rounded-full ${progressIndex <= index ? 'bg-brand' : 'bg-border'}"></span>`).join('')
    question.innerHTML = `<legend class="font-display text-2xl font-semibold leading-tight tracking-[-.03em] md:text-3xl">${step.question}</legend><div class="mt-6 grid gap-3">${step.options.map((option) => {
      const { value, label } = optionDetails(option)
      const checked = answers[step.id] === value ? ' checked' : ''
      return `<label class="flex cursor-pointer items-center gap-3 border border-ink/10 bg-paper/50 px-4 py-3 text-sm font-medium text-ink transition hover:border-brand/40 has-[:checked]:border-brand has-[:checked]:bg-blue-soft"><input class="accent-brand" type="radio" name="quiz-option" data-quiz-field="${step.id}" value="${value}"${checked} /><span>${label}</span></label>`
    }).join('')}</div>`
    back.hidden = index === 0
    next.disabled = !answers[step.id]
    next.textContent = index === quizSteps.length - 1 ? 'Завершить' : 'Далее'
  }

  question.addEventListener('change', (event) => {
    const selected = event.target
    if (selected.name !== 'quiz-option') return
    answers[quizSteps[index].id] = selected.value
    next.disabled = false
  })

  quizForm.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!answers[quizSteps[index].id]) return
    if (index < quizSteps.length - 1) {
      index += 1
      render()
      question.querySelector('input')?.focus()
      return
    }
    saveAnswersForLead()
    quizForm.hidden = true
    completion.hidden = false
    summary.textContent = 'Готово: мы учли ваш контекст и бюджет. Оставьте контакты — подготовим медиаплан.'
  })

  back.addEventListener('click', () => {
    if (index === 0) return
    index -= 1
    render()
    question.querySelector('input:checked, input')?.focus()
  })

  render()
  return { answers }
}

# Церебро — первая версия лендинга: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать адаптивный одностраничный прототип лендинга Церебро для услуги Яндекс Директ.

**Architecture:** React-приложение на Vite разделяет контент, примитивы интерфейса и смысловые секции. Tailwind задаёт токены палитры, типографику и адаптивную сетку; интерактивность ограничена навигацией, FAQ и локальной валидацией формы.

**Tech Stack:** React, Vite, Tailwind CSS, Lucide React, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-03-cerebro-yandex-direct-landing-design.md`

## Global Constraints

- Tailwind CSS используется для палитры и классов.
- Основной шрифт — Roboto, заголовочный — Onest.
- Не использовать градиенты, фоновую анимацию, фотографии, сгенерированные иллюстрации, вымышленные кейсы или результаты.
- Не ставить точку в конце заголовков; отступы кратны 4 px.
- Секции должны быть самостоятельны для будущего переноса в Tilda.
- Проверить desktop, tablet и mobile; на мобильном нет горизонтальной прокрутки.

---

## File Structure

- `site/package.json` — скрипты разработки, сборки и тестов.
- `site/src/main.jsx` — точка монтирования приложения.
- `site/src/App.jsx` — композиция лендинга.
- `site/src/data/landing.js` — контент карточек, FAQ и навигации.
- `site/src/components/ui/Button.jsx` — переиспользуемая кнопка.
- `site/src/components/ui/SectionHeading.jsx` — подпись и заголовок секции.
- `site/src/components/ui/LeadForm.jsx` — локальная валидация и форма заявки.
- `site/src/components/sections/*.jsx` — отдельные смысловые секции страницы.
- `site/src/lib/leadForm.js` — чистая функция валидации формы.
- `site/src/index.css` — базовые токены, шрифты и редкие базовые правила.
- `site/src/lib/leadForm.test.js` — тест валидации формы.
- `site/src/App.test.jsx` — тест доступности главных сценариев FAQ и CTA.

### Task 1: Создать приложение и дизайн-токены

**Files:**
- Create: `site/package.json`, `site/vite.config.js`, `site/index.html`, `site/src/main.jsx`, `site/src/index.css`, `site/src/App.jsx`

**Interfaces:**
- Produces: React-приложение, которое запускается командой `npm run dev` и собирается командой `npm run build`.

- [ ] **Step 1: Создать проект Vite с React и установить Tailwind, Lucide, Vitest и Testing Library**

Run: `npm create vite@latest site -- --template react && cd site && npm install && npm install -D tailwindcss @tailwindcss/vite vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event && npm install lucide-react`

- [ ] **Step 2: Настроить Tailwind-тему**

Create tokens for `ink` (#06133a), `brand` (#0a238b), `signal` (#1f7cff), `accent` (#ffd400), `paper` (#f4f6fa), `mist` (#e7ebf3). Import Onest and Roboto from Google Fonts in `src/index.css` and set `font-sans` to Roboto. Configure the `test` script as `vitest run` and configure Vitest with a `jsdom` environment and `@testing-library/jest-dom/vitest` setup.

- [ ] **Step 3: Проверить сборку до наполнения**

Run: `npm run build`

Expected: build completes without errors.

### Task 2: Создать данные, базовые компоненты и тест формы

**Files:**
- Create: `src/data/landing.js`, `src/components/ui/Button.jsx`, `src/components/ui/SectionHeading.jsx`, `src/components/ui/LeadForm.jsx`, `src/lib/leadForm.js`, `src/lib/leadForm.test.js`

**Interfaces:**
- Produces: `validateLeadForm(values)` returns `{ name?: string, phone?: string, budget?: string, consent?: string }`; `LeadForm` accepts `compact?: boolean`.

- [ ] **Step 1: Написать падающий тест валидации**

```js
import { describe, expect, it } from 'vitest'
import { validateLeadForm } from './leadForm'

it('requires name, phone, budget and consent', () => {
  expect(validateLeadForm({ name: '', phone: '', budget: '', consent: false })).toEqual({
    name: 'Укажите имя',
    phone: 'Укажите телефон',
    budget: 'Выберите бюджет',
    consent: 'Нужно согласие',
  })
})
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает из-за отсутствующей функции**

Run: `npm run test -- src/lib/leadForm.test.js`

Expected: FAIL with an import error for `validateLeadForm`.

- [ ] **Step 3: Реализовать минимальную валидацию и форму**

`validateLeadForm` trims name and phone; accepts only nonempty `budget`; requires checked consent. `LeadForm` renders accessible errors and replaces submit control with «Заявка принята» only after valid local submission.

- [ ] **Step 4: Запустить тест повторно**

Run: `npm run test -- src/lib/leadForm.test.js`

Expected: PASS.

### Task 3: Собрать структуру и контент лендинга

**Files:**
- Create: `src/components/sections/Header.jsx`, `Hero.jsx`, `FitSection.jsx`, `ProblemsSection.jsx`, `ProcessSection.jsx`, `TransparencySection.jsx`, `CasesSection.jsx`, `BudgetSection.jsx`, `StartSection.jsx`, `FaqSection.jsx`, `Footer.jsx`
- Modify: `src/App.jsx`, `src/data/landing.js`

**Interfaces:**
- Consumes: `Button`, `SectionHeading`, `LeadForm` and arrays in `landing.js`.
- Produces: one anchor-linked page with sections `#process`, `#cases`, `#faq` and `#contact`.

- [ ] **Step 1: Написать падающий тест ключевых сценариев**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

it('opens a FAQ answer and shows the audit CTA', async () => {
  const user = userEvent.setup()
  render(<App />)
  expect(screen.getAllByRole('link', { name: /аудит|медиаплан/i }).length).toBeGreaterThan(0)
  await user.click(screen.getByRole('button', { name: /как быстро появятся заявки/i }))
  expect(screen.getByText(/первые недели нужны для тестирования/i)).toBeVisible()
})
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `npm run test -- src/App.test.jsx`

Expected: FAIL because the page sections are absent.

- [ ] **Step 3: Реализовать секции из спецификации**

Use real copy from the approved specification. Cases show only the labels «ниша», «задача», «формат» and «результат добавим после подтверждения»; do not fabricate values. Process section contains six cards and transparency section contains five cards.

- [ ] **Step 4: Реализовать FAQ как доступный accordion**

Each question is a native button with `aria-expanded` and `aria-controls`; only one item may stay open.

- [ ] **Step 5: Запустить компонентный тест**

Run: `npm run test -- src/App.test.jsx`

Expected: PASS.

### Task 4: Оформить адаптивную композицию

**Files:**
- Modify: `src/index.css`, all files in `src/components/sections`, `src/components/ui/*.jsx`

**Interfaces:**
- Consumes: sections from Task 3.
- Produces: desktop/tablet/mobile layouts without horizontal overflow.

- [ ] **Step 1: Оформить hero и тёмные блоки**

Use the deep blue background, white text, yellow main CTA and compact condition grid. Keep artwork absent; only thin borders, numbered labels and typographic hierarchy may create rhythm.

- [ ] **Step 2: Оформить светлые сетки**

Use restrained `border` and `bg-mist` card surfaces. The process grid has six cells on desktop, three cells on medium widths and one column on mobile. Preserve 4 px spacing increments.

- [ ] **Step 3: Добавить адаптивность и состояния**

At mobile width make nav collapsible, cards single-column, CTA buttons full-width, and section margins smaller. Add only `transform` and `opacity` feedback transitions; respect `prefers-reduced-motion`; give pressable controls `active:scale-[0.97]`.

- [ ] **Step 4: Запустить все тесты и production build**

Run: `npm run test && npm run build`

Expected: all tests pass and the build completes without errors.

### Task 5: Проверить страницу и подготовить Tilda-ориентиры

**Files:**
- Create: `TILDA-MAP.md`

**Interfaces:**
- Consumes: completed page sections.
- Produces: mapping of each section to native Tilda block or Zero Block and notes on editable content.

- [ ] **Step 1: Открыть первую рабочую версию и проверить страницу на desktop, tablet и mobile**

Verify: no cropped text, horizontal page scroll, inaccessible CTA, or broken menu/FAQ/form behavior.

- [ ] **Step 2: Записать карту переноса**

For every section list: suggested Tilda implementation, editable fields, and whether custom code is needed. All blocks in this first version should require no custom code.

- [ ] **Step 3: Повторить production build**

Run: `npm run build`

Expected: build completes without errors.

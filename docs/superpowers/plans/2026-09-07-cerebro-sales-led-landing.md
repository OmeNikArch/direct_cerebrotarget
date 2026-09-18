# Cerebro Sales-Led Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Пересобрать лендинг Церебро вокруг заявки на ведение Яндекс Директ, оставив аудит и медиаплан вторичным входом.

**Architecture:** Сайт остаётся статичным HTML с Tailwind CDN. `site/index.html` отвечает за семантические секции, форму и стили, а `site/script.js` — за структурированные данные карточек, FAQ и условную логику формы. Каждый смысловой раздел остаётся независимым, чтобы его можно было перенести из Figma в отдельный Zero Block Tilda.

**Tech Stack:** HTML, Tailwind CSS CDN, vanilla JavaScript, Node.js static syntax check, browser preview.

**Spec:** `docs/superpowers/specs/2026-09-07-cerebro-landing-restructure-design.md`

## Global Constraints

- Использовать Tailwind CSS для классов и палитры; не добавлять случайные градиенты, свечение или декоративные эффекты.
- Основной CTA: «Обсудить продвижение» / «Получить предложение по продвижению»; аудит и медиаплан — вторичный сценарий в той же форме.
- Не выдумывать кейсы, отзывы, метрики, клиентов, гарантии или сертификации.
- Указывать месячную стоимость с НДС: рекламный бюджет от 100 000 ₽; до 500 000 ₽ — 50 000 ₽ за ведение; от 501 000 ₽ — 50 000 ₽ + 5% бюджета.
- Аудит, стратегия и запуск входят в стоимость ведения.
- Поля формы: имя, телефон, email, цель обращения, предпочитаемый канал связи; ник/ссылка обязательны только для Telegram и MAX; согласие на обработку данных.
- Отступы кратны 4 px; заголовки без точки; adaptive desktop/tablet/mobile обязателен.
- Один будущий Figma Frame шириной 1200 px соответствует одному будущему Zero Block Tilda.

---

### Task 1: Переписать данные и тексты конверсионных блоков

**Files:**
- Modify: `site/script.js`
- Test: browser preview of all rendered sections

**Interfaces:**
- Consumes: approved offer, pricing, form and proof rules from the spec.
- Produces: `landingData` with final card copy for fit, problems, service scope, process, transparency, pricing, start paths and FAQ.

- [ ] **Step 1: Заменить тестовую логику «управляемого теста» на продажу ведения**

  Hero facts and fit cards must communicate monthly service, minimum advertising budget, ownership of the account, and transparent lead-focused reporting. Do not promise launch timing unless a verified condition remains in the approved brief.

- [ ] **Step 2: Сформировать отдельные наборы данных для «Что входит» и «Условия и стоимость»**

  Create explicit arrays with these facts:

  ```js
  serviceScope: [
    ['01', 'Стратегия и аудит', 'Разбираем спрос, сайт и точки роста перед запуском'],
    ['02', 'Запуск и оптимизация', 'Настраиваем кампании, объявления и регулярно улучшаем их по данным'],
    ['03', 'Аналитика и отчёты', 'Связываем рекламу с обращениями и показываем понятную динамику'],
    ['04', 'Рекомендации по сайту', 'Подсказываем, что на посадочной странице мешает заявкам'],
  ]
  ```

  Pricing text must include the exact thresholds and phrase «в месяц, с НДС».

- [ ] **Step 3: Переписать процесс в пять понятных шагов**

  The rendered copy must describe: application, contact through chosen channel, video briefing, strategy and launch, regular management. It must not describe an unnamed "test" as the customer’s final deliverable.

- [ ] **Step 4: Обновить FAQ реальными решениями покупателя**

  Include questions covering: fit and 100 000 ₽ minimum ad budget, cost calculation, what is included, account ownership, what happens after form submission, and when to expect first conclusions. Avoid promised outcomes and invented guarantees.

- [ ] **Step 5: Проверить rendered data in browser**

  Run the local static preview and verify that every card, price and FAQ answer renders without an empty field, broken tag or residual draft phrase.

### Task 2: Перестроить HTML-секции и CTA

**Files:**
- Modify: `site/index.html`
- Test: desktop and mobile browser preview

**Interfaces:**
- Consumes: the new data IDs and copy from `site/script.js`.
- Produces: 11-section semantic page with matching section anchors and containers for all dynamic content.

- [ ] **Step 1: Replace hero and header CTAs**

  Change navigation and hero buttons to the primary sales action. Link them to `#contact`; text should identify the next step, for example `Обсудить продвижение`.

- [ ] **Step 2: Add a separate "Что входит в ведение" section**

  Place it after the problems/solutions section. Add a dedicated `service-scope-cards` container which is rendered from `landingData.serviceScope`.

- [ ] **Step 3: Replace the existing budget block with a pricing-and-conditions block**

  Retain a concise three-card layout, but make it express: minimum ad budget, the 50 000 ₽ flat monthly management fee through 500 000 ₽, and the 50 000 ₽ + 5% formula from 501 000 ₽. Add a plain-language note that the price includes VAT, audit, strategy and launch.

- [ ] **Step 4: Update the proof module without fake content**

  Keep an optional cases/reviews section with an honest editorial message that verified cases and reviews will be added after approval. Do not call placeholder cards "results" or show invented niches/figures.

- [ ] **Step 5: Rewrite the secondary audit moment**

  Rename the near-form explanatory block to "Что получите на старте". State that the default path is discussion of monthly management; audit and media plan are available to visitors who need an initial assessment.

- [ ] **Step 6: Verify anchor targets**

  Confirm every header, mobile menu and CTA anchor references an existing `id` and that the page has one clear primary action.

### Task 3: Implement the two-path form and validation

**Files:**
- Modify: `site/index.html`
- Modify: `site/script.js`
- Test: local browser interaction test

**Interfaces:**
- Consumes: form IDs `lead-form`, `form-success`, and form data validation in `site/script.js`.
- Produces: a form that adapts required fields to the selected contact channel and preserves a local-only success state.

- [ ] **Step 1: Replace current budget-only form with approved fields**

  Add required inputs `name`, `phone`, `email`; radio or select field `request_type` with values `promotion` and `audit`; select `contact_method` with values `telegram`, `max`, `phone`, `email`; conditionally visible input `profile`; consent checkbox.

- [ ] **Step 2: Add conditional profile logic**

  Implement a function that toggles the profile input wrapper and its `required` attribute:

  ```js
  const requiresProfile = (method) => method === 'telegram' || method === 'max'
  ```

  The field label must change to explain that a Telegram or MAX username/link is needed only for the chosen messenger.

- [ ] **Step 3: Extend submit validation**

  Validate all required fields and show per-field errors. `profile` must only be validated when `requiresProfile(values.contact_method)` returns true. Keep submission local; no recipient or CRM is configured until Tilda publishing.

- [ ] **Step 4: Write the exact success state**

  Use an honest confirmation: `Заявка принята. Мы свяжемся выбранным способом, чтобы договориться о видеобрифинге.` Do not promise a callback time that has not been approved.

- [ ] **Step 5: Test both branches**

  Test 1: choose phone, fill fields, consent, submit; expect success without profile.

  Test 2: choose Telegram, omit profile, submit; expect only profile validation error. Fill profile and submit; expect success.

### Task 4: Validate transfer-readiness and responsive behavior

**Files:**
- Modify: `TILDA-MAP.md`
- Modify: `TILDA-BUILD-RULES.md` only if the new form fields require a new explicit mapping
- Test: browser desktop and mobile preview; JavaScript syntax check

**Interfaces:**
- Consumes: final HTML section ordering and field names.
- Produces: an updated transfer map and verified responsive prototype.

- [ ] **Step 1: Update Tilda transfer map**

  Replace audit-first language with sales-led CTA language. List all native form fields and dynamic profile-field condition. Mark the cases/reviews module as unpublished until real assets are supplied.

- [ ] **Step 2: Run static checks**

  Run:

  ```powershell
  & 'C:\Program Files\nodejs\node.exe' --check 'site\script.js'
  ```

  Expected: no output and exit code 0.

- [ ] **Step 3: Verify desktop behavior**

  At approximately 1280 px wide, confirm no horizontal overflow, all card grids are legible, prices do not wrap awkwardly, links work and the form succeeds in the phone branch.

- [ ] **Step 4: Verify mobile behavior**

  At 390 px wide, confirm no horizontal overflow, the menu opens and closes, form controls remain tap-friendly, conditional profile input is usable, FAQ opens, and the messenger branch validates correctly.

- [ ] **Step 5: Record verification outcome**

  Note results in the final handoff with the local preview URL and the updated Tilda map link.

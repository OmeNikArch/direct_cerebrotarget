# Hero Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current hero with the approved animated composition while keeping CTA routes, accessibility, and responsive behaviour.

**Architecture:** CSS owns the 451 × 460 scene, its final fallback state, responsive scaling, and entrance sequence. A small ES module changes only `data-hero-scene` from the static fallback to the one-time playing state. The retired scroll-driven lower line is removed without affecting the independent case and trust line animations.

**Tech Stack:** Static HTML, Tailwind CDN, scoped CSS, native ES modules, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-24-hero-composition-design.md`

## Global Constraints

- Use only the colours and the one approved gradient defined in `docs/redesign/COLOR-SYSTEM.md`.
- Preserve the 451 × 460 scene geometry at every breakpoint; scale the scene as a whole instead of moving its elements per breakpoint.
- Retain `#quiz` for the primary CTA and `#contact` for the secondary CTA.
- Do not use video, dependencies, new decorative colours, or a scroll-driven hero animation.
- Verify desktop, tablet, and mobile; use the final static scene for reduced motion.

## Review Focus

- No JavaScript: the full scene is visible by default.
- Reduced motion: no animation runs and the line is fully drawn.
- Mobile and tablet: no scene element receives a breakpoint-specific position.
- CTA anchors remain `#quiz` and `#contact`.
- Both ends and joins of the yellow line remain rounded and inside the scene.

---

### Task 1: Production scene and entrance controller

**Files:**
- Create: `site/assets/hero-animation/hero-light.svg`
- Create: `site/assets/hero-animation/yandex-medallion.png`
- Create: `site/assets/hero-animation/cerebro-medallion.png`
- Create: `site/hero-composition.mjs`
- Create: `site/hero-composition.test.mjs`

**Interfaces:**
- Produces `createHeroCompositionController({ root, reduceMotion, windowObject })`, returning `{ start() }`.
- `root.dataset.heroScene` is `ready`, `playing`, or `complete`.

- [ ] **Step 1: Copy the approved preview assets into production**

```powershell
New-Item -ItemType Directory -Force site/assets/hero-animation
Copy-Item site/assets/hero-animation-preview/hero-light.svg site/assets/hero-animation/hero-light.svg
Copy-Item site/assets/hero-animation-preview/yandex-medallion.png site/assets/hero-animation/yandex-medallion.png
Copy-Item site/assets/hero-animation-preview/cerebro-medallion.png site/assets/hero-animation/cerebro-medallion.png
```

- [ ] **Step 2: Write the failing controller test**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { createHeroCompositionController } from './hero-composition.mjs'

test('plays the scene once on the next frame', () => {
  const root = { dataset: {} }
  let nextFrame
  const controller = createHeroCompositionController({ root, reduceMotion: false, windowObject: { requestAnimationFrame: (callback) => { nextFrame = callback } } })
  controller.start()
  assert.equal(root.dataset.heroScene, 'ready')
  nextFrame()
  assert.equal(root.dataset.heroScene, 'playing')
})

test('shows the final scene immediately for reduced motion', () => {
  const root = { dataset: {} }
  createHeroCompositionController({ root, reduceMotion: true, windowObject: {} }).start()
  assert.equal(root.dataset.heroScene, 'complete')
})
```

- [ ] **Step 3: Verify the test is red**

Run: `node --test site/hero-composition.test.mjs`

Expected: FAIL because the module does not exist.

- [ ] **Step 4: Implement the controller**

```js
export const createHeroCompositionController = ({ root, reduceMotion = false, windowObject = window }) => ({
  start() {
    if (reduceMotion) { root.dataset.heroScene = 'complete'; return }
    root.dataset.heroScene = 'ready'
    windowObject.requestAnimationFrame(() => { root.dataset.heroScene = 'playing' })
  },
})
```

Default CSS must show the complete scene before JavaScript executes.

- [ ] **Step 5: Verify green and commit**

Run: `node --test site/hero-composition.test.mjs`

Expected: PASS, 2 tests.

```powershell
git add site/assets/hero-animation site/hero-composition.mjs site/hero-composition.test.mjs
git commit -m "Add hero composition animation controller"
```

### Task 2: Hero layout, scene CSS, and structural contracts

**Files:**
- Modify: `site/index.html`
- Modify: `site/redesign-contract.test.mjs`
- Modify: `site/hero-animation-preview.test.mjs`

**Interfaces:**
- Consumes the Task 1 assets and `data-hero-scene` values.
- Produces `data-hero-composition`, `data-hero-actions`, and the existing `hero-facts` region.

- [ ] **Step 1: Write failing hero contracts**

```js
test('uses the approved right-side composition and retains hero CTA routes', () => {
  const hero = redesignHtml.match(/<section id="hero"[\s\S]*?<\/section>/u)?.[0] || ''
  assert.match(hero, /data-hero-composition/u)
  assert.match(hero, /yandex-medallion\.png/u)
  assert.match(hero, /cerebro-medallion\.png/u)
  assert.match(hero, /href="#quiz"[^>]*>Получить медиаплан бесплатно/u)
  assert.match(hero, /href="#contact"[^>]*>Обсудить продвижение/u)
  assert.doesNotMatch(hero, /data-hero-line|hero-line-path|joltaya_line2/u)
})

test('keeps the scene geometry invariant below desktop', () => {
  assert.match(redesignHtml, /\.hero-composition\s*\{[^}]*aspect-ratio:\s*451\s*\/\s*460/su)
  const mobileCss = redesignHtml.match(/@media \(max-width: 767px\) \{([\s\S]*?)\n\s*\}/u)?.[1] || ''
  assert.doesNotMatch(mobileCss, /hero-composition-(?:line|yandex|cerebro)/u)
})
```

Extend the preview contract with the production constants: line `top: 4%`, `left: 4%`, `width: 90%`, `height: 90%`; `rotate(21deg)` and `rotate(4.65deg)`; rounded cap and join.

- [ ] **Step 2: Verify red**

Run: `node --test site/redesign-contract.test.mjs site/hero-animation-preview.test.mjs`

Expected: FAIL because the old lower line is still in the production hero.

- [ ] **Step 3: Replace the hero markup**

Remove the old `data-hero-line` SVG, its reserved bottom band, and the scroll-line markup. Use this production hierarchy, retaining all current Russian copy exactly:

```html
<section id="hero" class="hero-gradient relative isolate overflow-hidden text-white">
  <div data-hero-layout class="container-page grid gap-8 pb-12 pt-8 md:gap-10 md:pb-14 md:pt-12 lg:min-h-[720px] lg:grid-cols-12 lg:pt-20">
    <div data-hero-copy class="order-2 lg:order-1 lg:col-span-6">…eyebrow, H1, description…</div>
    <figure data-hero-composition class="hero-composition order-1 lg:order-2 lg:col-span-6" data-hero-scene="complete">…light, source line, two images…</figure>
    <div data-hero-actions class="order-3 flex flex-col gap-2 sm:flex-row lg:col-span-3">…CTA anchors…</div>
    <div id="hero-facts" class="order-4 grid grid-cols-2 lg:col-span-9"></div>
  </div>
</section>
```

At `lg`, text remains left and the composition right. Below `md`, `order-1` puts the whole scene first; CTAs are full-width stacked buttons; facts follow in a compact 2 × 2 grid.

- [ ] **Step 4: Add production scene styles**

Define a `.hero-composition` box with `position: relative`, `width: min(100%, 760px)`, and `aspect-ratio: 451 / 460`. Copy the preview scene values exactly, using classes `.hero-composition-light`, `.hero-composition-line`, `.hero-composition-yandex`, and `.hero-composition-cerebro`; do not override their positions in media queries.

```css
[data-hero-scene="playing"] .hero-composition-light { animation: hero-light-in 440ms cubic-bezier(.2,.8,.2,1) both; }
[data-hero-scene="playing"] .hero-composition-yandex { animation: hero-drop-yandex 720ms 0ms cubic-bezier(.16,1,.3,1) both; }
[data-hero-scene="playing"] .hero-composition-cerebro { animation: hero-drop-cerebro 680ms 0ms cubic-bezier(.16,1,.3,1) both; }
[data-hero-scene="playing"] .hero-composition-line path { animation: hero-draw-line 960ms 860ms cubic-bezier(.55,0,.25,1) both; }
```

The inline line SVG uses `stroke-linecap="round"` and `stroke-linejoin="round"`. In reduced motion, force final opacity/transforms and `stroke-dashoffset: 0`.

- [ ] **Step 5: Verify green and commit**

Run: `node --test site/redesign-contract.test.mjs site/hero-animation-preview.test.mjs`

Expected: PASS.

```powershell
git add site/index.html site/redesign-contract.test.mjs site/hero-animation-preview.test.mjs
git commit -m "Rebuild hero around animated composition"
```

### Task 3: Wire page-load animation, remove scroll motion, and verify

**Files:**
- Modify: `site/script.js`
- Delete: `site/hero-motion.mjs`
- Delete: `site/hero-motion.test.mjs`
- Modify: `site/hero-animation-preview.test.mjs`
- Modify: `PROJECT-CONTEXT.md`

**Interfaces:**
- Consumes `createHeroCompositionController` and `[data-hero-composition]`.
- Produces a one-time hero entrance without a scroll listener.

- [ ] **Step 1: Write failing wiring test**

```js
test('initializes the one-time composition controller and removes retired scroll motion', async () => {
  const script = await readFile(new URL('./script.js', import.meta.url), 'utf8')
  assert.match(script, /createHeroCompositionController/u)
  assert.match(script, /document\.querySelector\('\[data-hero-composition\]'\)/u)
  assert.doesNotMatch(script, /createHeroLineMotionController|hero-line-path|data-hero-line/u)
})
```

- [ ] **Step 2: Verify red**

Run: `node --test site/hero-animation-preview.test.mjs`

Expected: FAIL because `site/script.js` still imports `createHeroLineMotionController`.

- [ ] **Step 3: Wire the new controller and retire old motion**

Replace the old hero import and initialization with:

```js
import { createHeroCompositionController } from './hero-composition.mjs'

const heroComposition = document.querySelector('[data-hero-composition]')
if (heroComposition) createHeroCompositionController({ root: heroComposition, reduceMotion }).start()
```

Delete only `site/hero-motion.mjs` and `site/hero-motion.test.mjs`. Do not change `createPathDrawOnViewController`, because it still draws the case and trust lines.

- [ ] **Step 4: Run focused and full tests**

Run: `node --test site/hero-composition.test.mjs site/hero-animation-preview.test.mjs site/redesign-contract.test.mjs`

Expected: PASS.

Run: `node --test site/*.test.mjs`

Expected: PASS with zero failures.

- [ ] **Step 5: Browser QA**

Use `http://localhost:4173/` and inspect: 1440 px desktop, 768 px tablet, and 390 px mobile. Check the visual sequence after one reload: light → simultaneous medal drops → line; check that no old lower line remains; check both CTA links; and check reduced motion renders the complete static scene. Inspect the console for errors.

- [ ] **Step 6: Update context and commit**

Update `PROJECT-CONTEXT.md` to describe the implemented scene, production assets, page-load animation, and QA result. Then commit:

```powershell
git add site/script.js site/hero-composition.mjs site/hero-composition.test.mjs site/hero-animation-preview.test.mjs site/redesign-contract.test.mjs PROJECT-CONTEXT.md
git rm site/hero-motion.mjs site/hero-motion.test.mjs
git commit -m "Integrate animated hero composition"
```

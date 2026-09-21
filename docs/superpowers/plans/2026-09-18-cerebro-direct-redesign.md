# Cerebro Direct Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify an isolated visual redesign of the existing «Церебро Директ» landing page without changing its hero, copy, offer, prices, section order, or conversion logic.

**Architecture:** Copy the current static Tailwind page into `site-redesign/`, preserve the existing content/data modules, and add focused UI controllers for sticky-header state, mobile-menu locking, reveal-once behavior, and accessible carousels. Keep the original `site/` untouched and validate parity with source-contract tests plus browser checks at desktop, tablet, and smartphone widths.

**Tech Stack:** Semantic HTML, Tailwind CDN utilities, CSS custom properties, native ES modules, Node.js built-in test runner, browser visual QA.

**Spec:** `docs/redesign/REDESIGN-BRIEF.md`

## Global Constraints

- `site/` remains unchanged and runnable.
- Hero markup, composition, copy, animation, and behavior remain unchanged.
- All current copy, prices, cases, reviews, section order, and CTA destinations remain unchanged.
- Palette is limited to `#0C2049`, `#0A238B`, `#C6E2FF`, `#F4F6FA`, `#FFD400` and derived opacity/tints.
- Use Tailwind classes and reusable control/card patterns.
- Preserve keyboard access, focus visibility, form/FAQ behavior, and `prefers-reduced-motion`.
- Verify desktop, tablet, and smartphone layouts with no page-level horizontal overflow.

---

### Task 1: Isolate the redesign and lock the content contract

**Files:**
- Create: `site-redesign/` copied from `site/`
- Create: `site-redesign/redesign-contract.test.mjs`
- Create: `site-redesign/header-behavior.test.mjs`

**Interfaces:**
- Consumes: current `site/index.html`, `site/script.js`, and shared source assets.
- Produces: standalone `site-redesign/index.html`, tests that compare source and redesign content/order, and a testable header controller contract.

- [ ] Copy the source implementation and assets without modifying `site/`.
- [ ] Write contract tests that fail until the redesign includes the dark chapter, service icons, five case image paths, legal-link placeholders, sticky header hooks, scroll-snap carousel, and unchanged hero fragment.
- [ ] Run `node --test site-redesign/*.test.mjs` and confirm the new tests fail for missing redesign behavior.
- [ ] Add the smallest structure required for the tests to pass while preserving the source content.

### Task 2: Build the unified responsive visual system

**Files:**
- Modify: `site-redesign/index.html`
- Modify: `site-redesign/script.js`
- Create: `site-redesign/ui-behavior.mjs`
- Copy and normalize: `site-redesign/assets/service-icons/*.svg`

**Interfaces:**
- Produces: `createStickyHeaderController`, `createMobileMenuController`, and `createRevealOnceController` functions used by `script.js`.

- [ ] Implement the fixed-height sticky header, anchor offsets, mobile body lock, and focus-visible states.
- [ ] Preserve hero markup and render logic byte-for-byte except for the header outside it.
- [ ] Recompose all post-hero sections into the approved light/dark rhythm, including the combined dark problems/service chapter and centered start CTA scene.
- [ ] Replace visible service numbering with the four normalized `currentColor` SVG assets.
- [ ] Add the minimalist light footer with disabled legal placeholders and `#top` link.

### Task 3: Build the case carousel around final image geometry

**Files:**
- Modify: `site-redesign/index.html`
- Modify: `site-redesign/script.js`
- Create: `site-redesign/assets/cases/*.png`

**Interfaces:**
- Case media slot: 4:3 aspect ratio, full card width on mobile, approximately 320×240 CSS pixels on desktop.
- Carousel: native horizontal scrolling and scroll-snap, 400ms programmatic movement, accurate previous/next disabled states.

- [ ] Finalize case card geometry and verify long copy is never clipped.
- [ ] Generate five 4:3 case images with one shared art direction and save production copies in `site-redesign/assets/cases/`.
- [ ] Wire image paths to cases with empty alt text because adjacent headings convey meaning.
- [ ] Verify filtering, arrows, touch scrolling, focus states, and no page overflow.

### Task 4: Implement only approved motion

**Files:**
- Modify: `site-redesign/index.html`
- Modify: `site-redesign/script.js`
- Modify: `site-redesign/ui-behavior.mjs`
- Modify: `site-redesign/before-after-toggle.mjs`

**Interfaces:**
- Uses `--ease-out` and `--ease-in-out` from the brief.
- Reduced motion removes coordinate transforms and keeps content immediately readable.

- [ ] Add 200ms sticky-header background fade without height animation.
- [ ] Add one-time 420ms staggered service-card reveal.
- [ ] Add 260ms before/after disclosure and 500ms start-scene edge media reveal.
- [ ] Add 180ms mobile menu transition and retain existing FAQ/hero motion only.

### Task 5: Verify and document the result

**Files:**
- Create: `docs/qa/redesign-final/*`
- Modify: `PROJECT-CONTEXT.md`

**Interfaces:**
- Produces: test output, desktop/tablet/mobile screenshots, overflow/focus/reduced-motion notes, and a local preview left open for the user.

- [ ] Run original and redesign Node test suites.
- [ ] Compare `site/` against Git and confirm no tracked changes.
- [ ] Check keyboard navigation, FAQ, form validation/error state, before/after disclosure, filters, arrows, sticky header, mobile menu lock, and reduced motion.
- [ ] Capture and inspect desktop 1440×900, tablet 834×1112, and smartphone 390×844 screenshots.
- [ ] Fix every visible layout issue, rerun tests, update `PROJECT-CONTEXT.md`, and leave the redesign preview open.

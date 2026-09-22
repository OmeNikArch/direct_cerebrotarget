# Redesign color system implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Apply the approved color system to `site-redesign/` without changing copy, content structure, behavior, or responsive layout.

**Architecture:** Add a Node test that makes the color rules executable, centralize approved Tailwind tokens and semantic surface classes in `site-redesign/index.html`, then migrate the existing components and sections to those roles.

**Tech Stack:** Static HTML, Tailwind CDN configuration, inline CSS, Node.js built-in test runner.

**Spec:** `docs/redesign/COLOR-SYSTEM.md`

## Global constraints

- Read `AGENTS.md`, `PROJECT-CONTEXT.md`, and the spec before editing.
- Do not alter copy, section order, interactions, IDs, `data-*` attributes, or assets.
- Do not add dependencies, build artifacts, or new colors/gradients outside the spec.
- Verify desktop, tablet, and mobile after the implementation.

## Review focus

- Legacy colors do not remain in Tailwind config, custom styles, or section classes.
- Yellow CTA text is dark; blue and gradient CTA text is white.
- Existing CTA targets and UI interactions continue to work.
- Error and success colors stay functional-only.
- Keyboard focus remains visible and mobile controls remain usable.

### Task 1: Add an executable color contract

**Files:**

- Create: `site-redesign/color-system.test.mjs`
- Test: `site-redesign/color-system.test.mjs`

- [ ] Write a test that reads `index.html`, asserts all approved palette tokens are present, asserts the only branded gradient is `#2F63F5 → #0A238B → #06195F`, rejects legacy values `#06133A`, `#0C2049`, `#C6E2FF`, `#1F7CFF`, `#3C5CDD`, `#D9ECFF`, `#BCDCFF`, `#EDF3FA`, and `#F7F9FD`, and asserts `.button-press:focus-visible` uses `#2F63F5`.
- [ ] Run `node --test site-redesign/color-system.test.mjs`; expect a red failure caused by the legacy palette.
- [ ] Commit the test: `git add site-redesign/color-system.test.mjs` then `git commit -m "test: add redesign color-system contract"`.

### Task 2: Centralize palette tokens and semantic surfaces

**Files:**

- Modify: `site-redesign/index.html:14-80`
- Test: `site-redesign/color-system.test.mjs`

- [ ] Run the color contract again and confirm it is red before editing production code.
- [ ] Replace the existing Tailwind colors with the spec tokens: `brand`, `brand-bright`, `accent`, `paper`, `surface`, `ink`, `ink-muted`, `border`, `blue-soft`, `yellow-soft`, `brand-deep`, `danger`, and `success`.
- [ ] Define semantic CSS: `surface-paper`, `surface-white`, `surface-blue-soft`, `surface-brand`, and the approved `hero-gradient`. Set body to `paper`/`ink`; add a 2 px `brand-bright` focus outline with 4 px offset.
- [ ] Remove the legacy body gradients, `surface-sky`, `surface-night`, old hero gradient, and legacy pattern colors. Preserve radius and motion rules.
- [ ] Run `node --test site-redesign/color-system.test.mjs`; expect PASS.
- [ ] Commit: `git add site-redesign/index.html` then `git commit -m "style: centralize redesign color tokens"`.

### Task 3: Apply roles to existing sections and components

**Files:**

- Modify: `site-redesign/index.html:87-190`
- Modify: `site-redesign/color-system.test.mjs`
- Test: `site-redesign/color-system.test.mjs`, `site-redesign/cta-links.test.mjs`, `site-redesign/ui-behavior.test.mjs`

- [ ] Add a failing test that asserts: hero and contact use `hero-gradient`; fit/process/trust/FAQ use neutral surfaces; quiz/transparency/start use `surface-blue-soft`; problems/conditions/footer use `surface-brand` or `brand-deep`.
- [ ] Run the test; expect it to fail on the current legacy section classes.
- [ ] Migrate classes without changing IDs, attributes, links, copy, grids, or responsive utilities. Use this map: white cards/forms = `surface` plus `border`; primary CTA = `accent` + `ink`; local CTA in soft-blue blocks = `brand` + white; dark cards = `brand-deep` + white; secondary text = `ink-muted` or white 70% on dark surfaces.
- [ ] Keep the external VK button as an explicitly isolated integration-brand exception; do not use its blue anywhere else.
- [ ] Run `node --test site-redesign/color-system.test.mjs site-redesign/cta-links.test.mjs site-redesign/ui-behavior.test.mjs`; expect all pass.
- [ ] Run `node --test site-redesign/*.test.mjs`; expect all pass.
- [ ] Commit: `git add site-redesign/index.html site-redesign/color-system.test.mjs` then `git commit -m "style: apply color system to redesign"`.

### Task 4: Verify visual quality across breakpoints

**Files:**

- Modify: `docs/qa/redesign-final/design-review.md` only if recording a fresh visual QA result.
- Test: browser screenshots and `node --test site-redesign/*.test.mjs`.

- [ ] Capture and inspect desktop 1440 px, tablet 834 px, and mobile 390 px views of the hero, quiz, dark block, cards, price CTA, form, and footer.
- [ ] Confirm: no yellow section backgrounds; no white text on yellow CTAs; no adjacent dark/gradient sections; visible keyboard focus; distinct white cards without heavy shadows; usable mobile controls.
- [ ] Run `node --test site-redesign/*.test.mjs`; expect all pass.
- [ ] Commit only if the QA note changed: `git add docs/qa/redesign-final/design-review.md` then `git commit -m "docs: record color-system visual QA"`.

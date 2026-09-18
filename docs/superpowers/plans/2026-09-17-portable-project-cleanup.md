# Portable Project Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove obsolete local material and leave a compact, tracked project context that makes cross-computer Codex sessions fast to start.

**Architecture:** Keep production files isolated under `site/`; place non-production reference material under `docs/`; use `AGENTS.md` to route Codex to one concise `PROJECT-CONTEXT.md`. Git ignores only machine-local/generated data, so the context travels with the project.

**Tech Stack:** Static HTML, browser-hosted Tailwind CSS, vanilla JavaScript, Node.js built-in test runner, Git.

**Spec:** `docs/superpowers/specs/2026-09-17-portable-project-cleanup-design.md`

## Global Constraints

- Delete only `.npm-cache/` and `выгрузка из Figma/`.
- Do not change landing behavior, content, visual design, dependencies, or production site assets.
- Preserve source/reference material by moving it rather than deleting it.
- Keep `AGENTS.md`, `README.md`, `PROJECT-CONTEXT.md`, and `docs/` versionable.
- Do not include credentials, `.env`, local caches, build output, or IDE state in Git.

---

### Task 1: Remove approved local-only directories

**Files:**
- Delete: `.npm-cache/`
- Delete: `выгрузка из Figma/`

**Interfaces:**
- Consumes: explicit user approval in this conversation.
- Produces: a root with no local cache or obsolete Figma export directory.

- [ ] **Step 1: Verify the exact target directories before deletion**

Run:

```powershell
Get-Item -LiteralPath '.npm-cache', 'выгрузка из Figma' | Select-Object FullName, PSIsContainer
```

Expected: exactly two directories inside the project root.

- [ ] **Step 2: Delete the verified directories**

Run:

```powershell
Remove-Item -LiteralPath '.npm-cache', 'выгрузка из Figma' -Recurse -Force
```

- [ ] **Step 3: Verify deletion**

Run:

```powershell
Test-Path -LiteralPath '.npm-cache'; Test-Path -LiteralPath 'выгрузка из Figma'
```

Expected: `False` and `False`.

### Task 2: Organize retained reference material

**Files:**
- Create: `docs/reference/`
- Create: `docs/qa/`
- Move: `Бриф Лендинг Яндекс Директ.md`
- Move: `Портрет клинта.html`
- Move: `Пример тикущего дизайна ЯД/`
- Move: `design-qa.md`
- Move: `site/qa-reference-desktop-spacing.png`
- Move: `site/qa-reference-hero-manual.png`
- Move: `site/qa-reference-line.png`
- Move: `site/qa-reference-overlap.png`
- Move: `TILDA-BUILD-RULES.md`
- Move: `TILDA-MAP.md`

**Interfaces:**
- Consumes: existing reference and QA files.
- Produces: a root containing only operational project entry points, with design and QA material grouped by purpose.

- [ ] **Step 1: Create destination directories**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'docs/reference', 'docs/qa' | Out-Null
```

- [ ] **Step 2: Move design and research references under `docs/reference/`**

Run:

```powershell
Move-Item -LiteralPath 'Бриф Лендинг Яндекс Директ.md', 'Портрет клинта.html', 'Пример тикущего дизайна ЯД' -Destination 'docs/reference/'
```

- [ ] **Step 3: Move QA notes and visual evidence under `docs/qa/`**

Run:

```powershell
Move-Item -LiteralPath 'design-qa.md' -Destination 'docs/qa/design-qa.md'
Move-Item -LiteralPath 'site/qa-reference-desktop-spacing.png', 'site/qa-reference-hero-manual.png', 'site/qa-reference-line.png', 'site/qa-reference-overlap.png' -Destination 'docs/qa/'
```

- [ ] **Step 4: Archive retired Tilda-process documents without deleting their history**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'docs/archive/tilda' | Out-Null
Move-Item -LiteralPath 'TILDA-BUILD-RULES.md', 'TILDA-MAP.md' -Destination 'docs/archive/tilda/'
```

- [ ] **Step 5: Verify no moved reference or QA file remains at the old location**

Run:

```powershell
Get-ChildItem -Force | Select-Object Name
Get-ChildItem -Force site | Where-Object Name -like 'qa-reference-*'
```

Expected: reference files are absent from the root and the second command produces no output.

### Task 3: Create concise portable project context

**Files:**
- Create: `PROJECT-CONTEXT.md`
- Modify: `AGENTS.md`
- Modify: `README.md`
- Delete: `PROJECT-HANDOFF.md`

**Interfaces:**
- Consumes: current project structure and site test commands.
- Produces: an automatic Codex entry point (`AGENTS.md`) and a human-readable quick start (`README.md`) that both point at a single current-state document.

- [ ] **Step 1: Create `PROJECT-CONTEXT.md` with the compact session context**

Include exactly these sections: purpose; current state; key files; run and test commands; rules for safe changes; next actions; cross-computer checklist. State that Figma and Tilda are not part of the active workflow.

- [ ] **Step 2: Update `AGENTS.md`**

Place a short first rule before implementation constraints: read `PROJECT-CONTEXT.md` at the beginning of substantive work and update it when status or workflow changes. Retain all existing layout, Tailwind, and mobile-verification constraints.

- [ ] **Step 3: Update `README.md`**

Keep the existing project summary, structure, commands, and form contract. Add a link to `PROJECT-CONTEXT.md`; replace the Git-process-only ending with a short cross-computer workflow that tells the reader to clone/copy the project and open the root folder in Codex.

- [ ] **Step 4: Remove obsolete handoff document**

Run:

```powershell
Remove-Item -LiteralPath 'PROJECT-HANDOFF.md' -Force
```

- [ ] **Step 5: Check active documents for stale workflow references**

Run:

```powershell
rg -n -i 'figma|tilda' README.md AGENTS.md PROJECT-CONTEXT.md
```

Expected: only an explicit statement that Figma/Tilda are not active, if retained.

### Task 4: Make portable documentation versionable

**Files:**
- Modify: `.gitignore`

**Interfaces:**
- Consumes: files created and retained in Tasks 2–3.
- Produces: project instructions and documentation visible to Git, while local/generated content remains excluded.

- [ ] **Step 1: Remove ignore rules for durable project documentation**

Delete the `.gitignore` entries that exclude `.agents/`, `AGENTS.md`, `skills-lock.json`, `docs/`, `design-qa.md`, `PROJECT-HANDOFF.md`, `TILDA-*.md`, the old Figma export directory, the brief, and the client portrait. Retain excludes for `.npm-cache/`, `node_modules/`, build output, environment files, logs, editor state, and temporary `site/figma-*` files.

- [ ] **Step 2: Inspect what Git will see**

Run:

```powershell
git status --short
git check-ignore -v AGENTS.md docs\superpowers\specs\2026-09-17-portable-project-cleanup-design.md PROJECT-CONTEXT.md
```

Expected: the first command lists portable documents; the second command emits no matches.

### Task 5: Verify structure and site behavior

**Files:**
- Verify: root structure, `site/`, documentation, test suite.

**Interfaces:**
- Consumes: all prior cleanup tasks.
- Produces: evidence that cleanup did not alter the site and that the transferred folder has a fast, accurate onboarding path.

- [ ] **Step 1: Inspect the final root and documentation map**

Run:

```powershell
Get-ChildItem -Force | Select-Object Mode, Name
rg --files docs | Sort-Object
```

Expected: no cache/Figma export; references and QA material are under `docs/`; `PROJECT-CONTEXT.md` is at root.

- [ ] **Step 2: Run the landing test suite**

Run:

```powershell
node --test site/*.test.mjs
```

Expected: all tests pass.

- [ ] **Step 3: Validate the context entry point**

Run:

```powershell
Get-Content AGENTS.md -TotalCount 12
Get-Content PROJECT-CONTEXT.md
```

Expected: `AGENTS.md` directs a new Codex session to the concise current-state document, which includes startup and test commands.

- [ ] **Step 4: Review final changes**

Run:

```powershell
git status --short
```

Expected: only the intentional cleanup, document restructuring, and configuration changes are present.

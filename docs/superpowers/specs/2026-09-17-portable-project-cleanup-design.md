# Portable project cleanup design

## Goal

Make the landing project easy to move between computers and quick for a new Codex session to understand, without retaining obsolete design-export files or local caches.

## Scope

- Delete only the explicitly approved local-only directories: `.npm-cache/` and `выгрузка из Figma/`.
- Keep the deployable site in `site/` unchanged.
- Consolidate working guidance into a small, tracked set of root documents.
- Remove stale references to the abandoned Figma/Tilda workflow.

## Target root structure

```text
site/                 deployable landing and its assets/tests
docs/                 design history and supporting project records
README.md             human quick start
AGENTS.md             automatic instructions for Codex sessions
PROJECT-CONTEXT.md    concise current project state for Codex
.gitignore            local/generated files only
```

The existing brief, client portrait, visual-reference images, and the current design QA record remain available as project reference material; they are moved under `docs/reference/` or `docs/qa/` so they do not obscure the root directory. No source code or production asset is deleted.

## Session handoff model

`AGENTS.md` retains implementation rules and adds a short instruction to read `PROJECT-CONTEXT.md` before substantive work. `PROJECT-CONTEXT.md` becomes the single concise context entry point: product purpose, current state, commands, source-of-truth files, and next actions. README links to this document for Codex-specific handoff.

All of these documents must be versioned. `.gitignore` therefore stops excluding `AGENTS.md`, `docs/`, and the project handoff/context files. Machine-specific settings, credentials, generated output, dependencies, and caches remain ignored.

## Documentation updates

- Replace the obsolete, long `PROJECT-HANDOFF.md` with the concise `PROJECT-CONTEXT.md` and remove the old file.
- Update README instructions to name the context document and the real static-server/test commands.
- Remove Figma/Tilda references from active handoff documentation. Historical design specifications under `docs/superpowers/` remain as history.

## Verification

1. Confirm the two approved directories no longer exist.
2. Check the root has only the intended working files and folders.
3. Check that the tracked-document rules in `.gitignore` are correct.
4. Run `node --test site/*.test.mjs` to confirm cleanup did not affect the landing.
5. Inspect the context document for no stale Figma/Tilda workflow claims.

## Non-goals

- No visual, content, behavior, or dependency changes to the landing.
- No deletion of production site assets, brief data, or historical design records.
- No repository hosting, remote push, or secret migration.

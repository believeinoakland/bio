# civicos-ui

The CivicOS Layer 3 UI: the client people touch, styled from the design
foundation and wired to the live plane ops. State, contracts, and the next
steps are in `docs/CIVICOS_UI_STATE.md`; read that first.

## Files

- `app.html` — the runtime. Self-contained client for the working and published
  spaces, wired to `op=list`, `op=image`, `op=whoami`, `op=search`,
  `op=publishedmanifest`, and the first write action: `op=select` plus
  `op=release` (per-document from the bundle page, batch from Review, with the
  doctrine's recorded acknowledgment). Inlines `tokens.css` for standalone
  opening.
- `tokens.css` — the canonical design tokens (do not fork the values).
- `worker.template.mjs` — the dev host: serves `app.html` and proxies `/api/*`
  to the plane via a `PLANE` service binding. `__APP_HTML_BASE64__` is filled at
  build. Build and deploy commands are in `docs/CIVICOS_UI_STATE.md`.

## Live (development)

`https://civicos.believeinoakland.workers.dev`. Leave the plane address blank,
then sign in with the administrator password, or paste a `MEMBER_TOKEN` under
"use a token" for read access.

## Not the plane

This is a separate worker so the signed plane and its record stay untouched.
Production folds the UI into `believeinoakland.com/CivicOS` later; this dev
worker is scaffolding.

- `check-semantics.mjs` — build check: the runtime's SEMANTICS table (the one
  source of truth for what every state means, enables, and forbids on screen)
  must cover every state the plane's store gates on, and may invent none. Run
  `node check-semantics.mjs` from this directory; it fails the build on any
  gap in either direction.

- `test/` — the harness suite. `node test/run.mjs` drives the release flow,
  the full document page render, the artifact fetch-and-verify path, seals,
  glossary, navigation restore, and the semantics check. Run it before every
  deploy; the document-page harness exists because a refactor once deleted
  four functions between two anchors and nothing caught it until production.

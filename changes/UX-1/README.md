# UX-1: the app's typefaces come from its own origin

**Branch:** `ux/self-hosted-fonts`, based on `main` at `9f8b69e6`. **Status:** built and tested. It is
waiting for Bob to hand it to BIO development. It is not on `main`.

## The defect

- `civicos-ui/app.html` declares its faces at `/fonts/…`, but the `civicos` worker serves only `/`,
  `/build` and `/api/*`. `bio` held no `.woff2` files.
- So every face returns 404, and the page renders from its "dev convenience only" Google Fonts link.
- That is an outside request on every page load. `tokens.css` says: "Never fetch at runtime: a
  sovereign install must work offline."

## The change

1. OFL faces added in `civicos-ui/fonts/`.
2. A `/fonts/` route added to the worker, with the faces embedded at build.
3. `build-worker.mjs` added.
4. The Google link removed.
5. The serif italic declared.
6. A suite and its negative control added.

## Evidence (2026-09-24)

**Probe.** The same headless Chromium loads each build from `127.0.0.1`, with **every request to
another host blocked and logged** (`probe.mjs`).

| | `main` today | `ux/self-hosted-fonts` |
| --- | --- | --- |
| requests to other hosts | `https://fonts.googleapis.com/css2` (blocked) | **none** |
| `/fonts/*` responses | 404 ×3 | 200 ×4 |
| Serif 4, Serif 4 italic, Sans 3, Code Pro | all fail to load | **all loaded** |

Screenshots: `before-main.png`, `after-ux.png`. In `before-main.png`, main falls back to the system
faces when offline.

**Suites.**
- `self-hosted-fonts.test.mjs`: 19 pass, 0 fail.
- Its control: baseline green. `googlelink`, `noroute` and `missingface` each fail their named arm.
  The tree was verified unchanged by hash afterwards.
- UI harness: 73/73 green, up from 72 on `main`.
- This is the lane's gate: the UI harness and the change's control. BIO's full gate is not run here
  (Bob, 2026-09-24). A first full run, stopped partway, did catch one real finding. The hygiene suite
  flagged `build-worker.mjs` for embedding whatever files sat in `fonts/`. It now embeds the faces
  the page declares (`e2e6cba4`).
- `ux/self-hosted-fonts` @ `e2e6cba4`, pushed. It merges cleanly with `main` @ `9f8b69e6`, and with
  each of the 17 unlanded `land/*` branches that touch `civicos-ui/`, tested as main + that branch +
  UX-1.

## What the handoff to BIO involves

- Rebase onto `main` just before handoff, because live UI rows touch `app.html`. The change there is
  three lines in the head.
- Rebuild and deploy `civicos` with `build-worker.mjs` in place of the inline snippet in
  `CIVICOS_UI_STATE.md`.
- `CIVICOS_UI_STATE.md` gets its prepended log entry at integration. It is BIO's log, so the lane
  does not write it.

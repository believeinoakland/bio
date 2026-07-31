# The work queue

CONDUCT owns this file and is its only writer (BOB hands decompositions to
CONDUCT to enqueue — see `ORCHESTRATION.md`). One section per area. An area is
**ACTIVE** (holds a worker slot; max two active at once) or **DORMANT**
(pre-seeded, promoted when a slot frees). CONDUCT takes the top item whose status
is `queued` and whose depends-on are all `done`, spawns a worker, and on landing
marks it `done`.

Item format:

    ### <ID> · <queued | active | done | blocked>
    scope:            <bounded description of the one piece>
    behind-interface: <I1 | I2 | none — what makes it independent>
    depends-on:       <IDs, or none>
    added:            <date · CONDUCT|BOB>
    landed:           <commit, when done>

---

## CAPTURE — ACTIVE

### CAP-1 · active
scope: Wire `op=pdfstructure` into the `if (op === …)` dispatch in `bio-plane/src/index.mjs` — read a `capture_sha` through the existing `op=capture` byte path, call `extractPdfStructure(bytes)` from `src/pdfstructure.mjs`, return the structure JSON. Unit-test offline. This is the DELEGATION from CONTENT-PDF (`CLAIMS.md`).
behind-interface: I1 (bytes) + I2 (structure, provisional)
depends-on: none (pdfstructure.mjs is on main)
added: 2026-07-31 · CONDUCT
landed:

### CAP-2 · queued
scope: D-109 — drain the task queue on a Durable Object alarm (armed on enqueue, re-armed while `task_queue` is non-empty, self-terminating when it drains), per `kickoffs/CAPTURE.md` item (1). Do NOT drain from the capture path.
behind-interface: none (internal to CAPTURE)
depends-on: none
added: 2026-07-31 · CONDUCT
landed:

### CAP-3 · queued
scope: Make a monitoring tick actually INVOKE the archive fallback (built but idle), per `kickoffs/CAPTURE.md` item (2). Read D-104's resolution before touching the counter.
behind-interface: none
depends-on: none
added: 2026-07-31 · CONDUCT
landed:

## CONTENT-PDF — ACTIVE

### CPDF-1 · active
scope: D-91 phase-2 MEASUREMENT (not the build). Bundle `unpdf` through the plane's esbuild target in a scratch way (do NOT add it to the shipped deps/bundle); measure the bundled size against the 3MB Free-worker limit and current headroom, authoritatively. Measure extraction cost on a representative PDF as a node proxy, clearly labelled as node-not-Worker. Record both in `MEASUREMENTS.md` with date and instrument, and recommend go/no-go on text extraction. Produces a decision input, commits no text extractor.
behind-interface: none (measurement)
depends-on: none
added: 2026-07-31 · CONDUCT
landed:

### CPDF-2 · blocked
scope: If CPDF-1 says go, implement PDF text extraction (glyph→Unicode via `unpdf`) behind the structure output; else record the alternative chosen and why.
behind-interface: I2
depends-on: CPDF-1
added: 2026-07-31 · CONDUCT
landed:

### CPDF-3 · blocked
scope: Live-verify pdfstructure against real captured Oakland PDFs (the agenda→item graph) via `op=pdfstructure`, in a `biosmoke-pdf` scratch namespace; sweep after.
behind-interface: I1
depends-on: CAP-1, a DIST deploy
added: 2026-07-31 · CONDUCT
landed:

## FRAMEWORK — DORMANT

### FW-1 · queued (area dormant)
scope: Confirm or counter the provisional I2 structure interface (`INTERFACES.md`) that CONTENT-PDF produces — this is what turns I2 STABLE. Promote FRAMEWORK to active when a slot frees.
behind-interface: I2
depends-on: none
added: 2026-07-31 · CONDUCT
landed:

## CONTENT-HTML — DORMANT
Not yet carvable; see `kickoffs/CONTENT-HTML.md`. Activate when a slot frees and its scope is cut.

## DIST — DORMANT
Batches releases from a green `main`. No standing queue; activate to cut a release. The deploy step is gated to BOB.

## UI — DORMANT
`civicos-ui/**`; activate per `UI-PLAN.md` when prioritised.

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

### CAP-1 · done
scope: Wire `op=pdfstructure` into the `if (op === …)` dispatch in `bio-plane/src/index.mjs` — read a `capture_sha` through the existing `op=capture` byte path, call `extractPdfStructure(bytes)` from `src/pdfstructure.mjs`, return the structure JSON. Unit-test offline. This is the DELEGATION from CONTENT-PDF (`CLAIMS.md`).
behind-interface: I1 (bytes) + I2 (structure, provisional)
depends-on: none (pdfstructure.mjs is on main)
added: 2026-07-31 · CONDUCT
landed: 2ab62f4 — GET, read-only, mirrors op=capture GET auth; shared captureKey helper (no-op refactor); 29-assertion op test + negative control; full battery green.

### CAP-2 · active
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

### CPDF-1 · done
scope: D-91 phase-2 MEASUREMENT (not the build). Bundle `unpdf` through the plane's esbuild target in a scratch way (do NOT add it to the shipped deps/bundle); measure the bundled size against the 3MB Free-worker limit and current headroom, authoritatively. Measure extraction cost on a representative PDF as a node proxy, clearly labelled as node-not-Worker. Record both in `MEASUREMENTS.md` with date and instrument, and recommend go/no-go on text extraction. Produces a decision input, commits no text extractor.
behind-interface: none (measurement)
depends-on: none
added: 2026-07-31 · CONDUCT
landed: 40eaba6 — unpdf FITS (plane+unpdf ~2.9MB raw / 0.71MB gzip; 2.29MB gzip headroom under the 3MB limit); node-proxy extraction ~0.7–0.9 ms/page. Verdict GO. See MEASUREMENTS.md 2026-07-31.

### CPDF-2 · active
scope: Implement PDF text extraction via `unpdf` (CPDF-1 verdict GO). Read the WHOLE captured bytes (as op=pdfstructure already does) and extract glyph→Unicode text, exposed alongside the structure the extractor emits — EXTEND the I2 output, do not fork it. Wire unpdf so the plane's build inlines it, and RE-MEASURE the integrated built bundle to confirm it stays under the 3MB gzip limit (CPDF-1 measured components separately; the real build must be re-confirmed). unpdf/pdf.js needs the whole document in memory, which is exactly what I1's range reads avoid for large PDFs, so GUARD on size: a document too large for the Worker envelope is recorded text-undetermined (first-class), never silently truncated. The authoritative large-PDF ceiling needs a deployed probe (gated follow-on) — record it as undetermined, do not claim unbounded capability. Tests + negative control. Do NOT deploy (bundle grows ~4.5x; that ships only via a DIST release).
behind-interface: I2
depends-on: CPDF-1 (done)
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

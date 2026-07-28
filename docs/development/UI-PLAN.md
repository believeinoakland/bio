# CivicOS Layer 3 UI: the development plan of record

Written 2026-07-28 at Bob's direction. This is the plan; CIVICOS_UI_STATE.md
is the session log recording how each rung actually went; UI-KICKOFF.md
holds Bob's standing UX principles, which govern every rung here. When a
rung completes, mark it DONE with the date and the state-doc version that
records the work. Update this file whenever scope is added, cut, or
reordered; the plan is only useful if it is true.

## How to read this

Rungs U1 through U6 are DONE and live at
https://civicos.believeinoakland.workers.dev against the signed plane on
biosmoke7 (0.35.0, record of 30 bundles, audit clean). U7 onward is the
remaining work, in intended order, each with its acceptance test and its
dependencies named. The plane and the UI ship separately: plane releases
are signed and byte-verified; UI deploys carry a build id and open tabs
self-announce staleness.

## The ladder

### DONE

- **U1. Foundation.** Design tokens (tokens.css is canonical), the shell
  (masthead, collapsible rail, content pane with contained scrolling),
  token and session login, the civicos worker proxying /api/* to the plane
  over a service binding. DONE 2026-07-27/28, state v1-v10.

- **U2. The record's surfaces.** The record list with identity band, Type
  column, sortable headers, seal-form state indicators; Focuses and
  Projects (single-type, no Type column); Review with selection;
  Monitoring & developments with Last-checked and Next-check columns;
  search: one box ever, origin-scoped with a widen escape, empty-search
  exits to the origin. DONE 2026-07-28, state v15-v25.

- **U3. The document page.** Content-first on four strata (What it says /
  In the case / Trust / The record); the SEMANTICS table as the single
  source of state presentation with a conformance check against the plane
  source; seals carrying the document's own facts (released-by from the
  Session Log, load-bearing-for from reverse citations, monitor last and
  next); the file-type tag; the layered glossary (shared floor plus the
  bundle's own data/glossary.json, a capture-time convention); disclosure
  triangles with Bob's default collapse states; the frozen header with its
  own scroll box; Open-the-document as the tab bar's final link-styled
  entry. DONE 2026-07-28, state v2-v20.

- **U4. Opening the document, verified.** op=capture's GET arm serves
  every part; the viewer fetches with progress, verifies every byte
  against the record's hashes in the browser, opens like a link (tab for
  renderable, native download otherwise), REFUSES mismatched bytes in the
  plane's voice; captured HTML is defanged (scripts, handlers,
  javascript: stripped) and severed from its opener. Proven live on the
  41.5MB budget book. DONE 2026-07-28, state v7-v13.

- **U5. The release flow.** Batch from Review and per-document from the
  page bottom; capability-shaped (session with contribute); typed
  acknowledgment and mitigation, never prefilled; crucial refused from
  batches with the reason shown; refusals rendered verbatim with
  offenders. DONE 2026-07-27/28, state v1-v4.

- **U6. Liveness and honesty about staleness.** Polite polling reconcile
  on the record and Review preserving selections; the build id served at
  /build with open tabs offering their own reload. DONE 2026-07-28, state
  v5, v12. The committed test suite (civicos-ui/test, run bare before
  every deploy) and the semantics conformance check are part of this rung
  and are permanent discipline, not a milestone that ends.

### REMAINING

- **U7. Capture fidelity, viewing side.** Depends on plane release 0.36.0
  implementing CAPTURE-FIDELITY.md (op=acquire subresources, the derived
  script-stripped render companion, data/snapshot-manifest.json). The UI
  resolves manifest placeholders through op=capture with per-part
  verification and renders the whole page in the sandboxed frame.
  ACCEPTANCE: a captured HTML page with stylesheets and images renders in
  the viewer visually faithful to its point of capture, every byte
  verified, scripts absent.

- **U8. The Add surface.** "Add something new" becomes real: acquire by
  locator (authority named, grade shown honestly), review the returned
  provenance, promote into the record as collected. Machine classes
  cannot release; the surface says so. ACCEPTANCE: a member captures a
  live URL end to end from the UI and the new bundle appears collected
  with provenance intact.

- **U9. Triage and case-building.** Dispose on Focuses (surface, elevate,
  defer, dismiss with reasons); cite from a search selection into a
  Project with the note grammar's constraints surfaced before refusal.
  ACCEPTANCE: a Focus moves through a full triage with reasons recorded;
  a Project cites a selection and the document pages show both directions.

- **U10. The crucial path.** The individually co-attested release surface
  for crucial material, which the batch flow deliberately refuses today.
  Design against the plane's attest/ratify ops before building.
  ACCEPTANCE: a crucial collected document reaches verified through the
  UI with the co-attestation recorded in its Session Log.

- **U11. Members & keys.** The members surface: who holds which
  capability, key fingerprints, the doorbell path for new members.
  ACCEPTANCE: a member reads the roster and a new member's request is
  visible and actionable.

- **U12. The published surface (gap G1).** The public, unauthenticated
  reading surface over bio-published: the case file as a narrative with
  interactive story visuals on screen and print as a first-class output
  with the full narrative. The sewer case is the proof piece. This is the
  reason the rest exists. ACCEPTANCE: a member of the public reads the
  sewer case start to finish, checks a hash, and prints it whole.

- **U13. Beyond viewing-MVP on phones.** Interaction parity where it
  makes sense (release remains a considered desktop act unless Bob says
  otherwise). ACCEPTANCE: Bob's phone test finds nothing broken and
  nothing important missing.

- **U14. The hardening pass.** Keyboard and screen-reader coverage,
  performance at 500+ bundles (pagination or virtualization on the
  lists), and the operational loose end: the long-lived Cloudflare deploy
  token in transcripts gets rotated and the session-grant discipline
  extended to UI deploys. ACCEPTANCE: suite green with an axe/keyboard
  audit added, the 500-bundle scratch store scrolls smoothly, the old
  token is dead.

## Standing dependencies and risks

- Plane releases gate U7 (0.36.0) and inform U10 (attest surface). Plane
  release discipline: full 33-test suite, signed, tagged, deployed
  byte-identical, audit clean after.
- The record is the source of truth for every parser the UI grows;
  fixtures mirror real shapes (the v11 lesson) and every app.html patch
  carries an assert (the v24 lesson).
- One session, one deploy discipline: run node test/run.mjs bare, deploy,
  verify /build, push source and docs together.

## Next session kickoff

The next session is plane release 0.36.0 (CAPTURE-FIDELITY.md) followed by
U7. The initial prompt for Bob to paste is kept in SESSION-KICKOFF-UI.md
beside this file, so the session starts with zero reconstruction.

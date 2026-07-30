# CivicOS Layer 3 UI: the development plan of record

Written 2026-07-28 at Bob's direction. This is the plan; CIVICOS_UI_STATE.md
is the session log recording how each rung actually went; UI-KICKOFF.md
holds Bob's standing UX principles, which govern every rung here. When a
rung completes, mark it DONE with the date and the state-doc version that
records the work. Update this file whenever scope is added, cut, or
reordered; the plan is only useful if it is true.

## How to read this

Rungs U1 through U7 are DONE and live at
https://civicos.believeinoakland.workers.dev against the signed plane on
biosmoke7 (0.45.0, record of 30 bundles, audit clean). U8 onward is the
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

- **U7. Capture fidelity, viewing side. DONE, 2026-07-29.** resolveSnapshot
  fetches every manifest part through op=capture BY HASH and verifies it
  before anything reaches the screen; one altered byte refuses the whole
  render, because a page missing a part renders as a different page.
  Subresources inline as data: URIs rather than blob: URLs, which is forced
  rather than stylistic: the frame is sandboxed with neither allow-scripts
  nor allow-same-origin, so it has an opaque origin, and an opaque origin
  cannot read a blob this document minted. Two passes, because a
  stylesheet's own url() targets need addresses before the stylesheet is
  encoded; the CSS rewrite runs on a verified copy at render time so the
  stored stylesheet stays raw. All four link partitions render
  distinguishably and a deferred link warns that following it leaves
  audited content. Harness: test/snapshot-render.test.mjs, 30 assertions,
  building its fixture by running the shipped plane's own
  captureSubresources so it resolves the manifest the plane actually emits.
  Defect it caught: markLinks matched data-bio-href before href, reading the
  address instead of the wrapper.

- **U8. The Add surface. DONE, 2026-07-30.** Acquire by locator with the
  authority named and Grade B stated in the plane's own terms before anything is
  written; the document block appears only for Information, because the @2
  contract's register describes a captured document and a Focus has none.
  Capability-shaped absent-not-greyed: a credential that cannot write gets no
  form rather than one that fails on submit. The continuation is DRIVEN, and when
  the runtime's ceiling will not let it finish, the member chooses between
  recording it as the unfinished capture it is and writing nothing; recording it
  as complete is not on offer. The promoter helpers are the installer's, ported
  rather than reinvented, so the UI is not a fourth differently-shaped writer,
  and test/add-surface.test.mjs runs what it assembles through the plane's own
  checkBundle. ACCEPTANCE MET on live infrastructure: `INFO-2026-0002-legistar-
  calendar`, a 368KB Legistar calendar with 127 supporting files, promoted
  collected with provenance intact, `op=audit` 31/31 clean afterwards.

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

## Who this is for

RULED by Bob, 2026-07-30, and it governs every rung. The primary audience is
NON-TECHNICAL. The purpose of the workflow is to improve a member's productivity
by removing them from logistics and nuance so they interact with the system at a
higher level. Technical complications are recognised and classified by the system,
not surfaced as choices: a per-render artifact of a host's tech stack, an ad slot,
a subrequest ceiling, a hash that moved for mechanical reasons are all the
system's problems. A surface that asks a member to adjudicate one has failed, and
it will feel like honesty while it does. The test suite carries a vocabulary guard
over every member-facing string for this reason.

## Standing dependencies and risks

- Plane releases inform U8 (the Add surface) and U10 (attest surface).
  Plane release discipline: full suite (34 files as of 0.41.0), signed,
  tagged, deployed byte-identical, audit clean after. Deploys go through
  bio-plane/scripts/deploy.mjs, which reports what the API said and
  believes none of it: it reads the module back, hashes it, and compares
  against the signed asset, because a success response can precede a
  rollout that has not happened and a gateway error can sit in front of an
  upload that landed.
- CAPTURE IS NOW MULTI-TICK. A page that exceeds the runtime's subrequest
  ceiling returns complete:false with a continuation session, and U8 must
  drive it to completion rather than presenting a half-captured page as a
  capture. See docs/development/CAPTURE-SCALING.md.
- LINKS, COMPLETENESS AND REUSE ARE NOW SHOWN. Closed 2026-07-30. The document
  page carries the five partitions with the element cited, the verdict and the
  plane's own basis; the unfinished-capture banner with its outstanding count and
  a continuation; the reuse disclosure naming when the source was last seen
  serving each reused part; and the per-reference list of what a capture never
  got, on the refusal a member actually hits. Counts are NAMED, never a ratio:
  connection, held-unclaimed, self-reference, outside the record, inside the
  capture, refused. The self-reference count is not cosmetic, it is a
  correctness requirement, because projectLinks drops a self-edge and a surface
  counting one as a connection claims an edge the plane refuses to make.
- CONTINUATION IS A CACHE REFILL, NOT A REWRITE. RULED by Bob, 2026-07-29.
  Continuing a capture must know what has already been captured; parts may have
  to be obtained from the host again, and that is refilling the cache rather than
  rewriting the record. Three consequences, all implemented and all load-bearing:
  the primary is never re-recorded and the re-fetch serves only as a FENCE (a
  changed primary hash refuses the whole continuation, because that is a source
  change and a monitoring finding); already-recorded parts keep their own records
  with their original fetch dates and their fetched_this_capture flags, so the
  merge takes from the fresh run only what was outstanding; and a recorded part
  whose bytes have changed REFUSES the merge rather than choosing between two
  sets of bytes for one address.
- THE ADDRESS INDEX IS INCOMPLETE BY CONSTRUCTION (D-58). `captured_locators` is
  written only inside the subresource branch of `op=acquire`, so a plainly
  captured document is not a resolvable link target and no verdict about it can
  ever be established. Any further link work rests on this being fixed in the
  plane first.
- MONITORING IS NOW THE PRIMARY CONTEMPORANEITY ROUTE, byte-bracketing an
  opportunistic bonus. RULED by Bob 2026-07-30 on the measurement in D-60: two
  fetches of a Legistar page three seconds apart differ by 31% of their bytes,
  all of it ASP.NET postback state, with the other 68.6% identical. Identical-byte
  bracketing cannot fire for such a page whatever happened to its content, so
  monitoring across the interval, timestamp tokens and archives are load-bearing
  and byte equality is taken when offered rather than built on.
- THE STABLE DIGEST EXISTS IN THE UI AND NOT YET IN THE PLANE (D-60).
  `civicos-ui/volatile.mjs` classifies five families of per-render mechanism and is
  validated both directions against live captures; the plane should import it
  rather than grow a second copy, and monitoring, duplicate detection and the
  contemporaneity comparison should all read the digest it produces.
- BEFORE THAT LANDED, NO CAPTURE HAD ONE (D-60), and the same measurement breaks three
  things: monitoring reports change every tick, contemporaneity's strongest arm
  never fires, and duplicate detection misses re-captures of exactly the pages
  that get re-captured most. Any further work on monitoring, link verdicts or
  duplicate suppression rests on this landing in the plane first.
- A RE-CAPTURE OF ALREADY-HELD BYTES IS THE REGULAR CASE (Bob, 2026-07-30), since
  monitoring exists to look again and the ordinary result of looking is unchanged.
  A confirmation creates an OBSERVATION and never a bundle: `captured_locators`
  advances its interval, which is the evidence the primary route above consumes.
  The Add surface checks both the hash and the address before writing anything.
- AN UNATTENDED WRITER CANNOT REVISE (D-61). `op=lease` stamps `leases.actor` from
  the session and the column is NOT NULL, so the capture-refill path is
  session-only and a daemon cannot complete work a member walked away from.
- The record is the source of truth for every parser the UI grows;
  fixtures mirror real shapes (the v11 lesson) and every app.html patch
  carries an assert (the v24 lesson).
- One session, one deploy discipline: run node test/run.mjs bare, deploy,
  verify /build, push source and docs together.

## Next session kickoff

U9, triage and case-building, is next: dispose on Focuses with reasons, and cite
from a search selection into a Project with the note grammar's constraints
surfaced before refusal. It is the rung that turns a record into a case, and the
link surface now gives it something to cite FROM. Two plane defects found by the
U8 exercise (D-57, D-58) should be fixed in the same session or the one before
it, because both make the link surface tell a member something untrue or
incomplete and neither is fixable in the viewer. The initial prompt for Bob to
paste is kept in SESSION-KICKOFF-UI.md beside this file, so the session starts
with zero reconstruction.

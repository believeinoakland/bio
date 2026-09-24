# The work queue

**The cache of the build plan** (`docs/development/WORK-PIPELINE.md`): the BOB INBOX's undrained entries, then the open
rows IN ORDER. **SCHEDULER owns this file** (`kickoffs/SCHEDULER.md`): it drains the inbox, orders the rows, and marks,
archives and replenishes; **CONDUCT writes one word — a row's `queued` → `running`**, pushed before its worker spawns.
READ WHOLE by every session.

**Statuses.** `queued`: runnable and unclaimed. `running`: a live worker holds an `agent-*` worktree with a claim on the
row's paths — and when none does, the row is UNDETERMINED between `queued` and done-awaiting-integration: read (1) a
`worktree-agent-*` branch whose commits name the item, then (2) the item's block in `CLAIMS.md` (`released:` means it
finished on purpose); only with neither does it fall back to `queued`. `blocked`: cannot run until something outside the
queue moves, and says what. `done` and `superseded` leave for the archive (`node tools/ledger.mjs archive <ID>`). **A
worker reads its own row from `coord` (`node tools/coord.mjs read docs/development/QUEUE.md`; M0-110, corrected by SCHEDULER #14) before it touches anything, and STOPS if the row does not read `running`.**

This file's history until 2026-09-18 — its earlier preambles, the 2026-08-04 handover, the per-area narrative — is in
`docs/archive/ledgers/QUEUE-narrative-2026-09-18.md`; drained inbox entries are in
`docs/archive/ledgers/BOB-INBOX-drained.md`; closed rows in `docs/archive/ledgers/QUEUE-closed.md`. All verbatim; look
them up (`node tools/ledger.mjs find <ID>`), do not read them whole.


## BOB INBOX — append-only. BOB writes here; SCHEDULER drains it (from 2026-09-18; CONDUCT did until then).

BOB appends a designed item, a correction or an order change here, with its intended place; SCHEDULER gates it at its cited design section and its depends-on, places it, and moves the drained entry to `docs/archive/ledgers/BOB-INBOX-drained.md` in the same commit.
- **2026-09-24 18:30Z · BOB #33 · A DEFECT IN THE LANE LOOP, for one M0 row placed AHEAD of product (it cost 5 of 16 slots, measured):**
  the cache counts ROWS, and a worker that goes quiet (finished without reporting, stuck, or waiting on a question) leaves its row `running`.
  Nothing wakes CONDUCT, so the slot is held with nobody working. Measured at 18:22Z: 9 worker sessions RUNNING against 14 rows marked
  running (D-492, M0-173 and REC-212 idle; D-510 queued with no worker). The rule is now in the kickoffs (CONDUCT.md step 4, BOB.md's stall
  probe; land/bob/batch-0924c). **The row builds the instrument, so it does not rest on a lane remembering:** `tools/slots.mjs` reads a
  `list_sessions` listing on stdin (as `occupancy.mjs` does, in both the cloud's `{ccr:{data}}` shape and the bare array) plus coord's
  QUEUE.md. It prints each row marked `running` with its worker's session status, and names every idle-worker row, every queued row with no
  worker, and the count of RUNNING workers against CACHE_ROWS. Exit 1 when any slot is unworked. Accepts when it names D-492, M0-173 and
  REC-212 on a listing and coord of 18:22Z. NEGATIVE CONTROL: match titles loosely, and a `WORKER D-49` session satisfies D-492, failing
  by name.
- **2026-09-24 18:33Z · BOB #33 · CORRECTION to the 18:30Z idle-slot entry, before it is rowed:** CONDUCT #20 read the three sessions that entry
  names (D-492, M0-173, REC-212). None was stalled: each was waiting on its own background gate, which `list_sessions` reports as IDLE. The
  measured gaps were only D-510 (queued, no worker) and one cache slot unfilled. So `tools/slots.mjs` must NOT treat an IDLE status as a stall.
  It names (a) queued rows with no worker session, (b) an open cache slot, and (c) rows marked `running` whose worker has had no update for
  45+ minutes (the listing's `updated_at`), which are REPORTED for a lane to read, never flipped. Accepts when D-510 and the open slot of 18:22Z are
  named, and the three gating sessions are not. Place it after product, not ahead: the cost measured was 2 slots, not 5.
- **2026-09-24 19:14Z · BOB #33 · REC-194's design gap RULED — one RECORD row after REC-194; rule 11's recipient half depends on it:** **`op=publish` names
  the draft it publishes (`draft=`, optional, additive), and at that act the readings taken through that draft BIND to the case it produced.**
  The link is an ACT, recorded with who made it (the publisher) and when, and the case document states it in words ("readings given on draft
  <id>, which <publisher> named as this case's draft at publication"). So a signature covers a link whose author is named, not an inference.
  The owner who signs is signing that stated link. Without `draft=`, REC-194's provisional STANDS: an unbindable reading is counted and
  stated as UNDETERMINED, never named. The row folds this into BIO_Publication_v0_1.md §3 rules 11 and 13, and closes the §9 frontier row
  "a draft bound to the case it produced". Accepts when a recipient's reading on a new case's draft appears in the published case's signed
  list with the link stated, and a publish without `draft=` still reads undetermined. NEGATIVE CONTROL: bind by statement bytes instead of
  the named draft, and a twin case with the same sentence lists the reader, failing by name. I3 additive; the integrator classifies.
  Also: C-82.1 (STATEMENT_ACK_DOCUMENTS_OVER_BOUND) is unreachable after REC-194. Place its retirement as a small row after this one, not in
  REC-194's landing (it moves six DEC-49 floors).
- **2026-09-24 21:05Z · BOB #33 · SUPERSEDES the 18:30Z and 18:33Z idle-slot entries (M0 row `tools/slots.mjs`, now placed AHEAD of product: it cost 7+ of 16 workers at 21:03Z):**
  the signal is `list_sessions`' **status_bucket**, not session status. A row marked `running` whose worker reads COMPLETED or REVIEW_READY is
  FINISHED, so it is FLIPPED. BLOCKED means the worker needs an answer. A row with no live session is read and then flipped or respawned. A queued
  row with no worker is SPAWNED. The tool reads a saved listing (the cloud's `{ccr:{data}}` shape) plus coord's cache, prints those lists and the
  WORKING count, and exits 1 when anything is owed. BOB's prototype is `slots.py` (in the plan-page artifact's files, builder/slots.py.txt);
  port it to node. Accepts when, on the 21:03Z listing, it names D-476, D-518, UI-93, REC-199, REC-200, UI-102 and D-519 as FLIP, UI-99 as ANSWER, and
  D-516 as SPAWN. NEGATIVE CONTROL: read session status in place of the bucket, and the seven FLIPs vanish, failing by name.


## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 16 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). **At most 10 worker sessions are live at once** (Bob, 2026-09-24 ~03:08Z, via BOB #32; until 05:00Z, then 6, and no new spawn from 06:00Z): a `running` row whose worker has FINISHED and awaits integration holds no session, so the cache keeps a few `queued` rows behind the live ten and no slot waits. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### DIST-13 · integrated — 2026-09-24 ~17:45Z by DIST #6 itself (session_01Vi1XTVwxcBBMStifuBasLZ) on BOB #33's instruction; base origin/main 58293bf3; no release. — **THE INSTALLER'S FALLBACK PLANE IS SEVEN RELEASES STALE: `newgroup/dist/newgroup.bundled.mjs` embeds RELEASE_VERSION 0.71.0 while `newgroup/src/release.mjs` carries signed 0.78.0 (verified at d536f834), and nothing guards the bundle's freshness.** Found by D-481's worker. — owner DIST (M0/FLEET for the guard).
order: after DIST-11, with DIST's rows: an unverified fallback that serves an old plane is a correction to the distribution record (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:21Z)
milestone: M8
interface: none.
design: `docs/architecture/BIO_Distribution_v0_1.md` §5 "The installer" and §3 "The release".
depends-on: none.
scope: NARROWED 2026-09-24 06:01Z (SCHEDULER #18): the REBUILD is done (land/dist/newgroup-dist-078 @ cfe2d0cc, on c20-batch17, 0.71.0 → 0.78.0 from newgroup/src at d536f834); what remains is an FL-9-shaped freshness guard asserting the bundle's embedded RELEASE_VERSION, and its source, equal `release.mjs`'s — DIST's caveat: after DIST-9 lands the rebuilt bundle LAGS DIST-9's installer code until rebuilt, which this guard catches.
accepts-when: the guard passes on the rebuilt bundle. NEGATIVE CONTROL: restore the 0.71.0 bundle and the guard fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs DIST`).

### REC-194 · integrated — **AN ACKNOWLEDGEMENT MAY MATCH ANOTHER CASE WHOSE STATEMENT IS BYTE-IDENTICAL: D-150 binds it to the statement's bytes, not to ONE case identity.** Publication §3 rule 13 (folded): *an acknowledgement binds to ONE case identity; it never matches another case whose statement is byte-identical.* — owner RECORD.
order: (held behind REC-193: both edit the statementack code; CONDUCT #20 05:08Z) directly after REC-193, the same block (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 — the `statementack` op's binding narrows to one case; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 (BOB #32's ruling, folded).
depends-on: D-150, REC-193.
scope: an acknowledgement records and is matched by the case identity it was given for; a second case in the project with byte-identical statement text lists none of the first's.; and the DRAFT DOOR matches only the draft's own document/case, never an unsigned edition-1 document of another case with the same statement text (widened by SCHEDULER #18 2026-09-24 on BOB #32's 03:40Z instruction via CONDUCT #20; c18-batch7fix's finding). Extend D-150's suite.
accepts-when: two cases with identical statements, one acknowledged: the other's completeness block lists nobody; and two cases' unsigned edition-1 documents with identical statements: the draft door of one finds none of the other's. NEGATIVE CONTROL: match by statement hash alone, and the "the twin case lists nobody" arm fails by name; match the draft door by statement text across the project, and the draft-door arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (BOB #32's G3; `node tools/mintid.mjs REC`).

### M0-173 · integrated — **A GATE'S VERDICT DEPENDS ON OTHER LANES' TIMING: every unit that runs plancheck reads the MOVING `origin/coord` (`gates.mjs` §3a: *"it reads what plancheck reads, the whole tree and `origin/coord`"*), so a coord write mid-gate can flip it. CONDUCT #20 measured `planning-hygiene.test.mjs` failing once mid-gate at ~17:1xZ and passing 76/0 on a re-run of the identical tree.** — owner M0.
order: at the backlog head: a gate whose verdict depends on timing undermines every train's gate and costs a red round (it cuts gate time, so the lane's law admits it at the head); D-511..D-510 above it wait on the running train, so no security row is delayed (BOB #33, 17:26Z; SCHEDULER #19, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a gate measures ONE tree; *do not change the tree while a gate is running*).
depends-on: none.
scope: the gate reads coord ONCE at its start, pins that commit, and every plancheck-running unit (planning-hygiene among them) reads the pinned snapshot, never the moving `origin/coord`; the gate's record names the pinned coord sha.
accepts-when: a coord write during a gate cannot change any unit's verdict. NEGATIVE CONTROL: with the pin removed, write coord mid-run and the suite's assertion flips by name.
added: 2026-09-24 · SCHEDULER #19 (BOB #33's inbox trigger 17:26Z; `node tools/mintid.mjs M0`).

### DIST-11 · integrated — 2026-09-24 ~17:45Z by DIST #6 itself (session_01Vi1XTVwxcBBMStifuBasLZ) on BOB #33's instruction; base origin/main 58293bf3; no release. — **THE DEPLOY DERIVATION REFUSES A `browser` BINDING (UNKNOWN_BINDING_CLASS), so no instance can hold the `BROWSER` binding D-64's render arm needs.** BOB #32 asked for it (~03:14Z, via CONDUCT #20). — owner DIST.
order: after DIST-9, first of D-64's follow-ons: the binding class must exist before any config names the binding (SCHEDULER #18, 2026-09-24)
milestone: M8
interface: I8 additive — a `browser` binding class; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "There is no collision: rendering is available on the free tier" (Browser Rendering is on every tier, so an optimisation, never a requirement).
depends-on: D-64.
scope: teach the deploy derivation the `browser` class FIRST; then add `"browser": {"binding": "BROWSER"}` to `bio-plane/wrangler.jsonc` and newgroup's config.
accepts-when: a deploy derived with the binding succeeds and a config without it still installs. NEGATIVE CONTROL: drop the class and the derivation refuses UNKNOWN_BINDING_CLASS by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs DIST`).

### D-490 · integrated — **NO RENDERER EXISTS: D-64's render arm answers every `render: true` with 501 RENDER_NO_RENDERER, so a client-rendered source is still captured as its empty shell.** Found by D-64's worker. — owner CAPTURE.
order: after DIST-11, whose binding it runs behind (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:17Z)
milestone: M2
interface: I3 — render answers a capture instead of 501; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "There is no collision: rendering is available on the free tier" and "What must be recorded on a rendered capture".
depends-on: D-64; DIST-11 for live verification.
scope: `@cloudflare/puppeteer` behind `rendererFor(env.BROWSER)`; absent binding keeps the 501, stated.
accepts-when: with a (mocked) binding a render produces D-64's pair. NEGATIVE CONTROL: unbind and the arm answers RENDER_NO_RENDERER by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-491 · integrated — **THE SWEEP CANNOT ASK FOR A RENDER: `capture_requests` has no `render` column, so D-64's sweep deferral is NARROWED, not closed.** Found by D-64's worker. — owner CAPTURE.
order: after D-490 (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:17Z)
milestone: M2
interface: I5 — a `render` column on `capture_requests`; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep".
depends-on: D-64.
scope: carry `render` through captureRequestDrain → `#fireCaptureRequest`, held as RENDER_DEFERRED until a renderer answers.
accepts-when: a render request survives the drain as RENDER_DEFERRED. NEGATIVE CONTROL: drop the column's carry and the arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-472 · integrated — **MONITORING A DRIVE-LINKED DOCUMENT CRIES WOLF ON EVERY TICK: `op=monitor` fetches the bundle's `source.locator` itself (`const locator = fm.source?.locator` → the governed fetch), which is Google's app shell, not the export address, so the comparison runs raw and reads `modified` every time.** Read at the code on `main`. — owner CAPTURE.
order: after D-469, with the head corrections: a monitor that reports change where none happened misleads members every tick (SCHEDULER #17, 2026-09-24; D-351's worker via CONDUCT #19; renumbered from its clone's colliding "D-467")
milestone: M3
interface: none — the monitor's fetch path.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (the monitoring contract), with D-351's Drive export arm.
depends-on: D-351 (finished; rides the train after c19-batch9).
scope: in `op=monitor`, route the locator through `readDriveAddress`, fetch `exportAddress` under the governor, and apply acquire's shell refusal (C-48.5, C-48.7). Extend `bio-plane/test/monitor-assess.test.mjs`.
accepts-when: an unchanged Drive document reads `unchanged` across two ticks. NEGATIVE CONTROL: fetch the raw locator again, and the two-tick arm reads `modified` and fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`, the id CONDUCT #19 named).

### D-511 · integrated — **A LIVE HOLE IN A LANDED FENCE: `op=promote` honours a caller's `replay: true`, so any machine or session can exempt its promotion from the fences D-505 built.** BOB #33 RULED (2026-09-24 17:05Z): *`replay` IS THE SERVER'S WORD* (INVESTIGATIVE-SESSION.md §11 item 5, folded on main e9b21be6). — owner RECORD.
order: at the backlog head: a live hole in a landed fence (BOB #33, 17:05Z: *placed high*; SCHEDULER #18)
milestone: M7
interface: I3 — a refusal where an answer stood; FULL gate.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 "The RUN is an object", item 5 as BOB #33's ruling states it (folded on main e9b21be6).
depends-on: D-505.
scope: in promote's admission, delete a caller's `replay` unless the call is ADMIN class with no session (the class migrate.mjs uses since REC-173); INVERT, never delete, D-505's `risk-tier.test.mjs` §7 arm (ix).
accepts-when: a machine or session sending `replay: true` is refused C-32.19 by name, and the migration suite migrates clean. NEGATIVE CONTROL: drop the class test and arm (ix) fails by name.
added: 2026-09-24 · SCHEDULER #18 (BOB #33 inbox 17:05Z; `node tools/mintid.mjs D`).

### D-510 · integrated — **`promote` TRUSTS THE ENVELOPE'S TYPE OVER THE DOCUMENT'S: `bundles.object_type` and the action_basis/correspondence projection are gated on the caller's `meta.object_type`, while `#projectRow`'s action columns come from the document's own front matter — so a member can promote an ACTION under an envelope saying information: it lands typed information with `action_risk_tier` set and its basis and correspondence never projected.** Found by D-505's worker (finding 3). — owner RECORD.
order: at the backlog head: the record holding an action it does not index as one (CLAUDE.md §2; SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:48Z)
milestone: M7
interface: I3 — a disagreeing envelope refused (or normalised); the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`action` is the impact substrate), with C-2.5 (a document's type is pinned to its id prefix).
depends-on: D-505.
scope: `promote` derives the projected type from the promoted document; an envelope `meta.object_type` that disagrees is refused by name (catalogued, DEC-49), not silently obeyed.
accepts-when: an action promoted under an information envelope is refused (or lands typed action with its basis and correspondence projected). NEGATIVE CONTROL: gate on the envelope again and that arm lands typed information, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### M0-169 · integrated — **TWO DERIVATIONS OF "A FIXTURE'S MODULE CLOSURE": `bio-plane/test/gatedeps.mjs` (M0-154; follows dynamic literals, lexer-blanked) and `civicos-ui/test/refusal-codes.test.mjs` `copyImports` (D-254; static-only, column-anchored).** Found by M0-154's worker. — owner M0 (UI reviews).
order: after M0-168, with the gate instruments (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:50Z) AHEAD of the product rows by Bob's 17:41Z rule: a new import in gates.mjs breaks a hand-copied fixture with a false red (a false gate result costs a round) (SCHEDULER #19, 2026-09-24).
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a fixture derives what it carries; one derivation, not two).
depends-on: M0-154.
scope: one helper with a `dynamic: true|false` mode; refusal-codes reads it.
accepts-when: both callers use the one helper and stay green. NEGATIVE CONTROL: add an import the static mode cannot see and the dynamic-mode arm names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### D-518 · integrated — **`monitor-cadence.test.mjs` FAILS UNDER LOAD: 57/2 in a gate on tree 64bc5e3e while a second full gate ran in the same container, 59/0 alone on the identical tree. Both failures are the third tick ("the key is idempotence, not amnesia": `later.fired` expected [A]; observations 2). `Store#monitorTick` takes the injected now (T1 + 3600000 + 1); the fire goes through `op=acquire` over SELF, and something below it reads the real clock or a wall-clock budget (the host governor's window, or a fetch timeout to the fake Archive), so under load the fire does not land.** Found by DIST #6 (18:52Z). — owner RECORD (the suite with M0).
order: at the backlog head, beside M0-173: a gate whose verdict depends on machine load costs every FULL gate a red round (Bob's 17:41Z rule: a false or flaky gate result goes ahead) (SCHEDULER #19, 2026-09-24)
milestone: M0 (a diagnosis, then its fix)
interface: none unless the fix threads `now` through `op=acquire` (the integrator classifies).
design: `docs/development/VERIFICATION.md` (a suite's verdict must not depend on the instant it starts or the load it runs under), with `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (the monitoring contract).
depends-on: none.
scope: pin the load-sensitive step by driving the third tick with a stalled fake Archive and with the governor's clock frozen, one at a time; then EITHER the fire path takes the tick's injected now (or its budget), OR the suite's fake Archive loses its wall-clock dependence, whichever the pin names; state which.
accepts-when: the suite reads 59/0 with a concurrent full gate running, on three runs (the measured failure it moves: 57/2 under load on 64bc5e3e). NEGATIVE CONTROL: restore the real-clock read the pin names, add an artificial delay, and the third-tick arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (DIST #6's finding; `node tools/mintid.mjs D`).

### M0-178 · integrated — **A `bio-plane/src` CHANGE CAN MAKE THREE BUNDLES STALE (plane, pdf-worker, ocr-worker, per `fleetbundles.test.mjs`), and `kickoffs/WORKER.md` names only the plane's `dist/bio-plane.bundled.mjs`, so a worker following it ships stale member bundles into a red gate.** Found by D-502's worker. — owner M0 (BOB reviews the WORKER.md line).
order: after M0-176, AHEAD of the product rows by Bob's 17:41Z rule: a stale bundle costs a red gate round (SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:04Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a fixture derives what it carries), with FL-10's freshness guard.
depends-on: none.
scope: one `tools/` command that rebuilds every bundle whose manifest names a touched file, derived from `fleetbundles.test.mjs`'s own map; WORKER.md's bundle step names that command instead of the plane's bundle alone.
accepts-when: a `bio-plane/src` edit read by pdf-worker, then the command, leaves `fleetbundles.test.mjs` green (the measured failure it moves: three stale bundles after one src edit). NEGATIVE CONTROL: rebuild only the plane's bundle and fleetbundles names the stale member.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### D-476 · integrated — **A MULTI-PART CAPTURE ALWAYS ANSWERS `existed: false`, EVEN ON A RE-FETCH OF BYTES THE RECORD HOLDS: the per-part write guard cannot see the whole document.** It under-claims (never over-claims), so it follows D-469. — owner CAPTURE.
order: after D-472, with the acquire corrections (SCHEDULER #17, 2026-09-24; D-469's worker via CONDUCT #19)
milestone: M2
interface: I3 — `existed` becomes `null` (stated undetermined) or a whole-document lookup; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (one capture, one home).
depends-on: D-469 (finished; rides the train after c19-batch9).
scope: report `existed: null` with its sentence for a multi-part capture, or compute it by a whole-document register lookup by sha before any write (prefer the lookup where it costs one read).
accepts-when: a re-fetched multi-part capture reads true or null-with-reason, never a false that claims the bytes are new. NEGATIVE CONTROL: restore the per-part answer, and the re-fetch arm reads false and fails by name. Extend `bio-plane/test/acquire.test.mjs`.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### FW-22 · running — **AUDITED FINANCIAL STATEMENTS ARE NOT BUDGETS: BOB #32 ruled (2026-09-24 02:30Z) that an ACFR/CAFR or an agency's audited statements are a separate type, FINANCIAL REPORT, counted apart. D-66's budget sample is recounted with them excluded, and the new class is counted.** — owner FRAMEWORK.
order: directly after D-66: §2's rule that a count comes before any reader; the financial-report reader follows the budget reader and is its own row once these counts justify it (SCHEDULER #18, 2026-09-24)
milestone: M2
interface: none — a census class and a recount.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2, row 5 (BOB #32's FINANCIAL REPORT ruling, folded at 16fe1e7f).
depends-on: D-66.
scope: the census instrument gains FINANCIAL REPORT, judged from bodies; D-66's class and read sample are re-run excluding it, stating stratum and seed.
accepts-when: `MEASUREMENTS.md` carries both counts with intervals, dated with the instrument. NEGATIVE CONTROL: fold the class back into budget and the recount arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs FW`).

### FW-23 · running — **CSV HAS NO FORMAT-REGISTRY ENTRY, so the corpus's CSV files are held and never read.** BOB #32 DESIGNED it (2026-09-24 02:30Z): delimiter and encoding found by signature and RECORDED on the reading, undetermined when they cannot be told; one sheet; row 1 is row 1, a header being a reading, never assumed; cells addressed sheet-cell/sheet-range, 1-based; the capture's grade. Legacy `.xls` (50 keys) stays waiting under OFFICE-FORMATS's legacy ruling. — owner FRAMEWORK.
order: behind D-66, per BOB #32's ruling (SCHEDULER #18, 2026-09-24)
milestone: M2
interface: I2 additive — a `csv` format entry.
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32" (folded at 16fe1e7f), on "The architectural answer: a FORMAT axis".
depends-on: D-66.
scope: the `csv` entry and its reader on the format axis; extend the office-format suites.
accepts-when: a CSV reads as addressed cells with delimiter and encoding recorded. NEGATIVE CONTROL: guess a delimiter where none is determined and the undetermined arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs FW`).

### D-463 · running — **NO CREDENTIAL IS CONFINED TO SCRATCH FOR LIFE: the namespace binds per CALL, so an instrument that omits `store=scratch` addresses the real record (CLAUDE.md §5's stated residue: *a sticky confinement is RECORD's and is NOT built*).** — owner RECORD.
order: after D-462, the last of the namespace guards (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M0 (a guard)
interface: I3/I5 — a per-credential confinement; the integrator mints and classifies the IC.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5, D-325's residue).
depends-on: D-456, D-461.
scope: a credential may be minted confined to `scratch`; every call it makes resolves to scratch whatever it names, and a `store=bio` from it is refused by name.
accepts-when: a confined credential writing without `store=` lands in scratch, and `bio`'s counters are unchanged. NEGATIVE CONTROL: drop the confinement, and that arm moves `bio` and fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-475 · integrated — **THE `/` SETUP PAGE READS `bio`'s GROUP SLUG WHATEVER `store=` SAYS: it is an HTML route, not an op, so D-461's refusal on the bio-pinned ops does not reach it.** Read-only and public, so low priority. Found by D-461's worker. — owner RECORD.
order: behind the namespace guards (D-462, D-463), low: read-only, public, and names no member (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M0 (the namespace guard's last door)
interface: none — the page's read.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5, D-325).
depends-on: D-461 (finished; rides the train after c19-batch9).
scope: pass the store through `publicInstanceGroup`, or refuse `store=scratch` on `/` by name.
accepts-when: `/?store=scratch` reads scratch's slug or is refused by name. NEGATIVE CONTROL: ignore the parameter again, and that arm reads `bio`'s slug and fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### M0-179 · integrated — **`origin/gate-results` HAD ITS HISTORY REWRITTEN (`gates.mjs`: "1d02a4d9 does not descend from the remote tip 78f2412e"), though TREE-SHARING §3a makes it append-only; and `gates.mjs` still REUSES from a tip it does not descend from, failing only the write.** REC-211's worker's measurement at its hour, unverified by CONDUCT (via CONDUCT #20 18:57Z). — owner M0.
correction: 2026-09-24 20:25Z by SCHEDULER #19 (M0-179's worker, via CONDUCT #20): THE REWRITE DID NOT HAPPEN. 78f2412e is an ancestor of the current gate-results tip (223 commits, linear, add-only); 1d02a4d9 was a local commit refused at its own hook and never pushed. The defect was the push guard's message calling every non-zero `merge-base --is-ancestor` a rewrite; the headline stays as what was reported, and this line is the record.
order: at the backlog head, after D-519: a gate that reuses verdicts from a rewritten cache can report green on a record nobody can trace (Bob's 17:41Z rule) (SCHEDULER #19, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/TREE-SHARING.md` §3a (the gate-results branch is append-only), with `docs/development/VERIFICATION.md`.
depends-on: none.
scope: (a) establish which push rewrote the branch (reflog, the pushing session) and restore the descent, stating what was lost; (b) `gates.mjs` refuses REUSE from a gate-results tip its local record does not descend from, by name.
accepts-when: the branch descends again, and a non-descending tip is refused for reuse by name (the measured failure it moves: reuse proceeding past "does not descend"). NEGATIVE CONTROL: plant a non-descending tip in a fixture and the reuse arm refuses it by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-180 · integrated — **`kickoffs/WORKER.md`'s construct-status step does not say a probe reads CODE with comments blanked (since M0-155), so branches cut before e9b21be6 still write probes on comment text: D-507's and D-508's "DEC-49 REGION …" probes drifted at the union (CONDUCT repointed them in batch22).** Found by CONDUCT #20 (18:57Z). — owner M0 (BOB reviews the WORKER.md line).
order: after M0-179, AHEAD of the product rows: each stale branch costs a red round at integration (Bob's 17:41Z rule) (SCHEDULER #19, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a check that cannot fail is worse than none), with M0-155's comment-blanked probes.
depends-on: none.
scope: one line in WORKER.md's construct-status step: probes read code with comments blanked, so point a probe at code, never at a region marker or comment.
accepts-when: the line is on main and names M0-155 (the measured failure it moves: two probes on comment text drifting at batch22's union). NEGATIVE CONTROL: none (prose).
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-183 · integrated — **A WORKER'S /tmp SCRATCHPAD CAN LOSE FILES MID-SESSION (cause not established; REC-194's worker), and `kickoffs/WORKER.md` does not say where durable scratch goes; the practice that held was the harness's `tasks/<id>.output`.** Found by REC-194's worker (F6). — owner M0 (BOB reviews the WORKER.md line).
order: after M0-181, AHEAD of the product rows: a worker losing its own evidence mid-session costs a re-run (Bob's 17:41Z rule) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (measure; do not recall: a figure needs its artifact to survive).
depends-on: none.
scope: one line in WORKER.md beside the name-collision receipt: capture evidence under the harness's task output (or commit it to the worktree), never only in /tmp; state that the vanishing's cause is UNDETERMINED.
accepts-when: the line is on main (the measured failure it moves: REC-194's scratch files vanishing mid-session). NEGATIVE CONTROL: none (prose).
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### D-478 · running — **`pdf-worker` AND `ocr-worker` ACCEPT ANY `store` TOKEN AND ANSWER AN UNKNOWN NAMESPACE WITH NOT_FOUND: nothing is written (IC-237 measured it), but "not found" reads as the capture's ABSENCE when the truth is that the namespace does not exist.** Found by D-462's worker. — owner CONTENT-PDF.
order: last of the namespace guards, low: read-only, no write; placed because *not found* is not *absent* (CLAUDE.md §1) (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M0 (the members' side of the guard)
interface: I6 — a named refusal on the members' routes; the integrator mints and classifies the IC.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5, D-325).
depends-on: D-462 (finished; rides the train after c19-batch9).
scope: the same NAMESPACES set and a NAMESPACE_UNKNOWN refusal in `pdf-worker/src` and `ocr-worker/src`.
accepts-when: `store=biosmoke` is refused NAMESPACE_UNKNOWN by name by both members. NEGATIVE CONTROL: accept the token again, and the arm reads NOT_FOUND and fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### UI-99 · running — **A DEFINITION REVISION'S BASIS AND A DISPOSITION'S VERSION HAVE A PLANE AND NO SURFACE: D-128's revision basis and REC-184's `definition_version` (and its `not recorded`) reach no page.** Found by REC-184's worker. — owner UI.
order: after UI-89, with the surfaces owed to landed plane rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:17Z)
milestone: M4
interface: I3 consumer.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 "The declared flow, and its revisions" (front matter: NOT BUILT, a member surface for a revision's basis).
depends-on: REC-184.
scope: show a revision's basis beside its version, and on a disposition the version it judged, `not recorded` stated as such.
accepts-when: both render against a real-plane suite. NEGATIVE CONTROL: hide `not recorded` and its arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs UI`).

### M0-187 · running — **`surfacing-run.mjs` CANNOT SUPPLY A SURFACING RUN FOR A SECOND DEPLOY TOKEN IN ONE STORE: `openRun` creates its fixture project BY TITLE, so the second token is refused NAME_TAKEN, the wrapper's `.catch(() => null)` swallows it, and the suite reads SURFACE_NO_RUN with the real cause unnamed.** Found by D-511's worker (F1). — owner RECORD (the shared test helper).
order: after M0-181, AHEAD of the product rows: a fixture that hides the cause of a red costs a diagnosis round in every suite that imports it (Bob's 17:41Z rule) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:47Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a refusal is reported by name, never swallowed).
depends-on: none.
scope: make the fixture project's title unique per (token, store), and let the wrapper rethrow any refusal that is not the expected one.
accepts-when: two deploy tokens in one store each get a surfacing run (the measured failure it moves: NAME_TAKEN read as SURFACE_NO_RUN). NEGATIVE CONTROL: restore the shared title and the second-token arm fails naming NAME_TAKEN.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### UI-101 · running — **THE APP OFFERS NO RISK-TIER CONTROL: `civicos-ui/app.html`'s action intake cannot state 1, 2 or 3, while D-483 gave the setup page a chooser (the BOTH-INTAKE-SURFACES convention).** Found by D-483's worker. — owner UI.
order: after UI-99 (UI-100 is cached), with the surfaces owed to landed plane rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:53Z)
milestone: M4
interface: I3 consumer (`vocabularies.risk_tiers`).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`risk_tier`: the words are the plane's; only a member's authored act sets a tier).
depends-on: D-483.
scope: a choice over `vocabularies.risk_tiers` in the app's action intake, unset by default, unset writing undetermined, words taken from the plane.
accepts-when: a chosen tier is written and none chosen writes undetermined, against a real-plane suite. NEGATIVE CONTROL: default the choice to 1 and the unset arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs UI`).

### UI-102 · running — **A GOVERNING-LAWS PROPOSAL HAS A PLANE AND NO SURFACE: REC-195's the `actionlawspropose` op (not yet on main) and `action.governing_laws_proposals` reach no page (`8.governing-laws`: NOT BUILT, a MEMBER SURFACE for the proposal).** — owner UI.
order: after UI-101, with the surfaces owed to landed plane rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 17:11Z)
milestone: M4
interface: I3 consumer (IC-267).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (the governing laws of a records request, D-149).
depends-on: REC-195.
scope: the action page renders each proposal beside the governing-laws list under the plane's OWN `says`; it NEVER offers a proposal as a way to set the list.
accepts-when: proposals render beside the list against a real-plane suite, and no control on the page sets the list from one. NEGATIVE CONTROL: add a "use this" control and the no-setter arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs UI`).

### REC-199 · running — **`op=reviewcopy` DOES NOT ANSWER `newCase`, SO AN EDIT THAT WRITES THE READ BACK LOSES IT.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *op=reviewcopy answers `newCase`.* — owner RECORD.
order: after UI-92 (SCHEDULER #17, 2026-09-23; UI-68's worker)
milestone: M10
interface: I3 additive — one field; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: the field in the answer. Extend the review-copy suite.
accepts-when: a read-then-write round trip keeps `newCase`. NEGATIVE CONTROL: drop the field, and the round-trip arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-200 · integrated — **A REVIEW COPY'S DATE DOES NOT MOVE WHEN A COMMENT MOVES ITS HASH, AND ITS CONTAINER-SIDE STAMP IS UNRULED.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *the container side is stamped by `attestor.member` and `ratified_at`; the copy carries the date of its LAST change, so a comment that moves the hash moves the date.* — owner RECORD.
order: after REC-199 (SCHEDULER #17, 2026-09-23; REC-148's worker)
milestone: M10
interface: I3 — the copy's date; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: the date is the last change's; the container stamp as ruled. Extend the review-copy suite.
accepts-when: a comment moves both the hash and the date. NEGATIVE CONTROL: keep the old date, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### UI-93 · integrated — **A BIAS-DEBT OBLIGATION NAMES A RUN AND THE QUEUE RENDERS NO RUN: D-86 raises an OBLIGATION whose subject is of kind `run`, and `app.html` `queueSubjectHtml` returns "" for it, so the item never says WHICH run.** The DELEGATION RECORD (D-86) -> UI of 2026-09-23 is on coord `CLAIMS.md`. — owner UI.
order: after UI-86, the same queue surface; a correction that D-86's landing exposes (SCHEDULER #17, 2026-09-23; via CONDUCT #18 23:35Z)
milestone: M8
interface: I3 consumer (IC-234).
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class", with `docs/architecture/BIO_Declared_Bias_v0_1.md` (bias debt).
depends-on: D-86 (`integrated` on c17-batch7; verify `#obligationsBiasDebt` on `main` first).
scope: one `queueSubjectHtml` branch naming the run and its context, read from the item and never invented; the item's `recipients` note where the plane states nobody could be named. Extend `civicos-ui/test/notifications.test.mjs`.
accepts-when: a bias-debt item names its run and context. NEGATIVE CONTROL: return "" for `run` again, and the named-run arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### D-519 · running — **THREE SUITES CARRY D-509's LATENT FALSE GREEN: `publish.test.mjs` (~734/736/737), `caseproduction.test.mjs` (~842/849) and `d280-strengthbar.test.mjs` (~467/471) drive `op=strengthbar` with NO group in the payload and read back the literal "believe-in-oakland", green only because each suite's INSTANCE_NAME happens to be that name.** Found by D-509's worker (via CONDUCT #20 18:57Z). — owner RECORD.
order: at the backlog head, beside D-518: an assertion that passes for the wrong reason (Bob's 17:41Z rule: a false gate result goes ahead) (SCHEDULER #19, 2026-09-24)
milestone: M0 (three suites over M7 code)
interface: none.
design: `docs/development/VERIFICATION.md` (an equality that costs nothing to produce is not evidence), with D-509's fix as the precedent.
depends-on: D-509.
scope: name the group in the three payloads (or assert the INSTANCE_NAME binding beside each read); re-run `d280-strengthbar.control.mjs` and `caseproduction.control.mjs`.
accepts-when: each suite's strengthbar read names the group it wrote (the measured failure it moves: a read that stays green under a renamed INSTANCE_NAME). NEGATIVE CONTROL: rename one suite's INSTANCE_NAME and its read fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### M0-181 · running — **`status.mjs`'s `table` PROBE HAS THE AMBIGUITY HOLE M0-160 CLOSED FOR `hit`, AND IT IS LIVE: `content` matches the declaration (schema.mjs ~3273) AND a string argument in store.mjs ~1237 (`.find((x) => x.startsWith("CREATE TABLE IF NOT EXISTS content ("))`), so deleting the declaration would still read BUILT.** Found by M0-160's worker (F2). — owner M0.
order: after M0-180, AHEAD of the product rows: a construct probe that reads BUILT on a string is a false green in the record of what is built (Bob's 17:41Z rule) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:03Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a check that cannot fail is worse than none), with M0-160's ambiguity arm.
depends-on: M0-160.
scope: anchor a table declaration at line start OR immediately after a template backtick (measured: 114 matches over 114 distinct names; a bare `^` loses 9 real declarations); fail any `table` probe matching more than once.
accepts-when: `content` matches once, and 114 declarations still read (the measured failure it moves: a second, string match that would keep a deleted table BUILT). NEGATIVE CONTROL: delete `content`'s declaration in a fixture and the probe reads NOT BUILT by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-182 · running — **47 OF 80 `bio-plane/test/nc-*.mjs` HARNESSES STILL WRITE THEIR PRISTINE COPY INSIDE THE WORKTREE, AND NOTHING GRADES THE CLASS (23 more unclassified, named not scored).** BOB #32 ruled a harness's pristine copy lives outside the worktree. Found by D-492's worker (F2). — owner M0.
order: after M0-188, AHEAD of the product rows (moved 2026-09-24 20:25Z by SCHEDULER #19): 7 in-worktree pens are NOT gitignored (.m0110-harness, .m0109-harness, .m037-harness, .m0100-harness, .m0107-harness, .vf1-control-pristine, .m0111-harness), so the tree is DIRTY while those controls run and a gate on it records nothing (Bob's 17:41Z rule; M0-179's sweep via CONDUCT #20)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a control breaks only the thing), with BOB #32's and BOB #33's pen rulings (M0-172).
depends-on: none.
scope: one helper `controlPen(item)` (`mkdtempSync(join(tmpdir(), "nc-<item>-"))`) beside `test/budget.mjs`; a sweep suite shaped like `budget-sweep.test.mjs` grading each harness IN-WORKTREE, TEMP or MEMORY with a floor; move the 47 to the helper; then drop .gitignore's in-worktree pen lines. M0-172's driver list rides the same helper. FIRST the 7 unignored pens above; M0-179's sweep counts 24 drivers still in-worktree.
accepts-when: the sweep reads 0 IN-WORKTREE (the measured failure it moves: 47 of 80). NEGATIVE CONTROL: point one harness back into the worktree and the sweep names it.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### D-513 · running — **`op=knock`'s TOO_LARGE (two sites) and EMPTY STILL REACH A KNOCKER UNTRANSLATED at the door D-508 catalogued, and `d278-codeless-refusals.test.mjs`'s header calls them "coded already" (true of `reason`, false of the translation).** Found by D-508's worker. — owner RECORD.
order: after D-510, with the product corrections: refusals a member cannot read at a public door, D-507's and D-508's class (SCHEDULER #19, 2026-09-24; via CONDUCT #20 17:47Z)
milestone: M2
interface: I3 additive — three catalogued codes; the catalogue version moves; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, following D-484's single-site shape.
depends-on: D-508.
scope: consolidate each code behind one governed helper (arm F reads them F4 multi-site), then rows in KNOCK_CHECKS; correct the d278 header clause; restate the Roles doc's D-484 F4 figure from this landing's census print (it records "102 -> 100" on its own tree; main read 102 before D-508).
accepts-when: each of the three arrives with its translation, and arm F reads each single-site. NEGATIVE CONTROL: return one code outside the helper and arm F names it multi-site (a behavioural arm cannot see it: `dec49Decorate` translates from the catalogue alone).
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-514 · running — **THREE MORE READER SITES MEASURE RAW LENGTH WHERE D-501 RULED GLYPHS: `index.mjs` ~4519 attributes a whitespace-only page to the `layer` part on `p.text.length` (legistar-73550 p1: 39 characters, 0 glyphs); `mergeTier2Text` (textchain ~1365) and `mergeTier3Text` (index ~4313) refuse a whitespace-only base SAYING "it already holds N decoded character(s)", which is false; `needsTier2` (index ~4086) escalates on raw `counts.chars`.** Found by D-501's worker (F5, F3, F2). — owner CONTENT-PDF.
order: after D-513, with the extraction corrections: two of the three make the record claim what it does not hold, CLAUDE.md §2's worst class (SCHEDULER #19, 2026-09-24; via CONDUCT #20 17:51Z)
milestone: M2
interface: none (`counts.chars` unchanged).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-501's glyph award (M-140).
depends-on: D-501.
scope: count glyphs (non-whitespace code points) at all three sites through D-501's counter. F3 CHANGES BEHAVIOUR, RULED by SCHEDULER #19 as mechanical: a whitespace-only base holds no decoded text, so it takes the tier wholesale and its refusal sentence can no longer be false; BOB #33 was told.
accepts-when: legistar-73550 p1 is not attributed to `layer`; a whitespace-only base takes tier 2 and tier 3; `needsTier2` reads glyphs. NEGATIVE CONTROL: restore raw length at the layer filter and the whitespace-page arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-516 · running — **INSIDE THE ONE-SECOND BAND THE OBSERVATION-LOG READERS PICK A CLASS THEY CANNOT TELL: a subject entering 1-2 s before a level's first row reads `never_looked` or `purged` depending on where the clock second fell (D-500's arm M3).** BOB #33 RULED 2026-09-24 17:58Z (drained to `BOB-INBOX-drained.md`; cite until folded): `observation_log.at` STAYS whole-second; within the band the reader states undetermined. — owner RECORD.
order: after D-514, with the corrections to just-landed work: the record choosing between two claims it cannot tell apart (CLAUDE.md §2) (BOB #33, 17:58Z; SCHEDULER #19, 2026-09-24)
milestone: M8
interface: I3 additive — a published state on a new path; the integrator classifies.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §6 "The readers", with BOB #33's ruling of 17:58Z, which this row FOLDS into §6 beside D-500's named ceiling in the same landing.
depends-on: D-500.
scope: `enteredAfterFirstRow` returns three ways (after, before, within the band); within it the content axis reads `CONTENT_AXIS_UNDETERMINED`, its `why` naming the stored watermark's one-second precision; no column change, no migration.
accepts-when: arm M3's band pair reads undetermined in both readers, and pairs outside the band are unmoved (the measured failure this moves: M3's pair flipping class on the clock second). NEGATIVE CONTROL: collapse the band into a two-way comparison and the band arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (BOB #33 inbox 17:58Z; `node tools/mintid.mjs D`).

### D-517 · running — **ONE READER, TWO WORD-GAP RULES: tier 1's TJ word gap is a hand-picked -100 (0.1 em) while D-502 set the run gap at a measured 0.25 em, a 2.5x disagreement inside one reader.** Found by D-502's worker (M-141). — owner CONTENT-PDF.
order: after D-516, with the extraction corrections: two rules of one reader disagreeing on what a word gap is (SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:04Z)
milestone: M2
interface: none.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-502's measured threshold (M-141).
depends-on: D-502.
scope: measure the TJ displacement distribution over M-141's corpus; re-set the constant from it, or unify the two rules; record the measurement with date and instrument.
accepts-when: the TJ threshold is the measured one, and M-133's agenda glue stays at 5 or below with no word lost (the measured failure it moves: the unmeasured 0.1 em constant). NEGATIVE CONTROL: restore -100 and the measured-threshold arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### REC-213 · running — **`op=reviewcopy`'s LIVE STATEMENT LIST CAN SHOW THE WRITER'S OWN ACKNOWLEDGEMENT AMONG THE SECOND READERS, while the case document now withholds it: a row by its own writer is not a second reading (rule 11), so listing it overclaims.** REC-212's worker (F2). BOB #33 RULED YES, 2026-09-24 19:06Z (cite until folded): withheld AND COUNTED, with the count and its reason ("by the statement's writer") stated beside the list, as the case document does; §6A's "show everything recorded" holds, since nothing recorded is hidden. — owner RECORD.
order: after D-517, with the corrections to just-landed work: a review copy claiming a second reading that is not one (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:57Z and BOB #33 19:06Z)
milestone: M10
interface: I3 — the review copy's list narrows and gains the count; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A with BOB #33's ruling of 19:06Z, which this row FOLDS into §6A in the same landing.
depends-on: REC-212.
scope: pass the draft's `statement_by` as `writer` at reviewCopy's one `#statementAcknowledgements` call; state the withheld count and its reason beside the list.
accepts-when: a writer's own row is absent from the review copy's list and counted beside it (the measured failure it moves: the writer's row listed among second readers). NEGATIVE CONTROL: drop the `writer` argument and the list names the writer, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs REC`).

### M0-176 · running — **`gates.mjs` §2's DOC-FACING DOOR IS NOT PATH-GRANULAR: every doc-facing unit takes ANY `docs/` change, so `calibration.test.mjs` (which genuinely reads `kickoffs/SCHEDULER.md`) still runs on a MEASUREMENTS-only diff after M0-165 removed its false reader edge.** Found by M0-165's worker (M0-165 NARROWED to this). — owner M0.
order: after M0-170, AHEAD of the product rows by Bob's 17:41Z rule: every `docs/` diff runs doc-facing units it does not touch (gate time) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:02Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the gate runs the class the diff measures).
depends-on: M0-165.
scope: a doc-facing unit takes only the `docs/` paths it, or a tool it runs, names; this changes selection estate-wide, so print each unit's before/after on a MEASUREMENTS-only and a kickoff-only diff.
accepts-when: a MEASUREMENTS-only diff no longer selects calibration, and a kickoff diff still does. NEGATIVE CONTROL: restore the whole-`docs/` door and calibration is selected again, by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### UI-103 · running — **THE PUBLISHED CASE PAGE NAMES THE PUBLISHER AS THE STATEMENT'S WRITER: `app.html` ~20591 (page 2) renders "Written by ${c.completeness.author}", while REC-212 split the two acts (`statement_by` wrote it, `author` published it).** The delegation RECORD (REC-212) → UI is on coord `CLAIMS.md`. — owner UI.
order: after UI-102, with the surfaces owed to landed plane rows: a surface that attributes an act to the wrong member (SCHEDULER #19, 2026-09-24; REC-212's worker via CONDUCT #20 18:57Z)
milestone: M10
interface: I3 consumer (REC-212's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 (two acts, two names), with UI-89's three-state render as the precedent.
depends-on: REC-212.
scope: read `statement_by` for who wrote the statement and `author` for who published it; render the three states (list / [] / null) through `completeness.statement_by_stated`.
accepts-when: a case whose statement one member wrote and another published names each for its act, against a real-plane suite (the measured failure it moves: the publisher named as writer). NEGATIVE CONTROL: render `author` as the writer again and the two-acts arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs UI`).

### UI-97 · running — **A MEMBER CANNOT UNDO A MUTE FROM THE APP: `op=queuemute` takes `unmute:true` for `{item}` and for `{case, kinds}`, and no client sends it.** Found by UI-86's worker. — owner UI.
status: running — SPAWNED 2026-09-24 ~21:15Z by SCHEDULER #19 (dispatch, BOB #33 21:10Z) as a SEPARATE CLOUD SESSION titled WORKER UI-97 (SCHEDULER #19), base origin/main 1a7f0bcc0. Falsify rather than believe: a live worker holds the branch land/worker/UI-97; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone.
order: after UI-86's row, the same queue control: a member door the plane already opens (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M8
interface: I3 consumer.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class".
depends-on: UI-86.
scope: in `queueMuteReportHtml`, a per-muted-item "Let this reach me again" sending `{item, unmute:true}`, and a per-case "Unmute" sending `{case, kinds, unmute:true}`; register the repeated control in `member-respect` SETS. Extend `civicos-ui/test/notifications.test.mjs`.
accepts-when: a muted item unmuted from the report reaches the member again. NEGATIVE CONTROL: omit `unmute:true`, and the round-trip arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |

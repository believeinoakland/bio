# acquisition (T23)

**Status** · session_01SPMymkWQC6QTzG6vcgjWn3 · depth 2 · COMPLETE · handled B3

## Completion (ACQUISITION #5)

**Entries applied** (`build/plan/current.md` T23 L3, acquisition):
- **R32 (N492, K1032).** The archive arm (R3) and `archiveLookup` find a memento through capture-sources R37's Memento services (`bio-plane/src/acquisition/index.mjs`, `mementoLookup`, `chooseMemento`). The archive is `WAYBACK_MEMENTO` and its endpoints come from `mementoEndpoints`. The TimeGate is asked first, with `Accept-Datetime` (`acceptDatetime(now)`), and its answer is read with `readMementoAnswer`. When it gives no usable memento, the TimeMap is read (`parseTimeMap`, `timeMapCandidates`) and up to 4 candidates are fetched, newest first. Every request goes through the host governor with `redirect: "manual"`, and the archive's redirects are followed by hand (at most 5 hops). Each memento is fetched in its raw form (the descriptor's `raw`). The row is `mementoRow` over this call's SHA-256 of the bytes received. The choice is `selectCapture`'s, with mementos refused earlier carried in as rows. The hop is `mementoHop`. The document address is the answer's `rel="original"`.
  - On the archive arm, the bytes filed are the very bytes the choice was made over: the chosen memento's response is answered unread, and acquire streams, hashes and stores it once. The lookup hashes the same bytes and keeps them nowhere.
  - Each Memento refusal is answered by name and nothing is filed: `MEMENTO_LINK_MALFORMED`, `MEMENTO_NO_ORIGINAL`, `MEMENTO_NOT_NEGOTIATED`, `MEMENTO_NO_DATETIME`, `MEMENTO_BAD_DATETIME`, `NO_USABLE_CAPTURE`. `ARCHIVE_UNREACHABLE`, `ARCHIVE_REFUSED` and `HOST_COOLING_OFF` are kept as R3 names them.
  - The CDX path (`parseCdx`, `cdxQuery`, `replayLocator`, `archiveHop`) is no longer called; `selectCapture` is the only CDX service still used.
- **R31 (K1126, K1131).** A sweep origin is the in-process `{kind: "sweep", matched_sweep, deeming_actor}` on the capture-request arm.
  - Without a well-formed `captureRequest.scope` it is refused `SWEEP_SCOPE_MISSING` (C-128.1, 400) before anything is fetched.
  - With a scope, every redirect is followed by hand, one governed fetch per hop, and each target is judged first by monitoring R53's in-scope rule. A target out of scope answers `SWEEP_REDIRECT_OUT_OF_SCOPE` (C-128.2, 422) with `target`; nothing at the target is fetched and nothing is filed.
  - capture-requests R38's drain origin (no `kind`) is unchanged. A body's `matchedSweep` is ignored on every arm, so the capture files `{kind: "named_request"}`.
  - The rows are in `SWEEP_SCOPE_CHECKS` (`acquisition/checks.mjs`) and spread into `ACQUISITION_CHECKS`.

**Rows awaiting stamp** (accepted red 7, until T24's L2): C-128.1 `SWEEP_SCOPE_MISSING` and C-128.2 `SWEEP_REDIRECT_OUT_OF_SCOPE`. Both are new.

**Improvements made in my own module:**
- `cancelBody` releases an unread body without awaiting it. An unacknowledged cancellation hung the act.
- On the archive arm, the source's `success` outcome is recorded only once a memento is chosen, so an unusable memento no longer resets the address's fallback eligibility.
- The transport's `resolved` address is now the last hop this call followed, else the runtime's post-redirect URL.

**Deferred, with why:** an empty 200 memento met during a capture ends the archive arm with `NO_USABLE_CAPTURE`; the arm does not go on to an older candidate. Emptiness is known only after the body has been streamed into the capture pipeline, and going back for another candidate would mean restructuring `acquire`'s single fetch. Measured empties were redirects, which are skipped before any body is read.

**Found in other modules (REPORT to BOB):**
- The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from `bio-plane/src/acquisition/`. I regenerated nothing.
- acquisition R29's enumeration of the module's table does not name R31's C-128.1–C-128.2. The wording is BOB's; the test now names both.
- acquisition's Uses still lists the CDX services `parseCdx`, `replayLocator`, `cdxQuery` and `archiveHop`. Only `selectCapture` (and `EMPTY_BODY_DIGEST`, through `mementoRow`) is used now.
- control-plane `inbox-door.test.mjs`:81 (accepted red 9) is still red after capture's merge. Per K1117 it is now control-plane's L11.

**Tests and checks:**
- `node --test bio-plane/test/m/acquisition/`: tests 68, pass 68, fail 0. New files: `memento.test.mjs` (R32) and `sweep-scope.test.mjs` (R31).
- The whole `bio-plane/test/m` (before merging capture): tests 5034, pass 5021, fail 1. The one fail is control-plane `inbox-door.test.mjs`:81, accepted red 9.
- The users after merging `tranche/T23` @ capture's merge (`test/m/acquisition`, `capture`, `capture-requests`, `instance-setup`, `control-plane`, `monitoring`): tests 537, pass 535, fail 1 (the same red 9), todo 1.
- `format`: 87 modules, 86 requirements files; 0 failures.
- `architecture` acquisition: 11 product files, 43 relative imports; 0 failures.
- `coverage` acquisition: 32 of 32 live requirement ids named by a test; 0 failures.
- `ownership` acquisition `tranche/T23`: 9 files changed; 0 failures.

Size (session_01SPMymkWQC6QTzG6vcgjWn3): test runs 12, module lines 1501

## J1 · QUESTION

R31 (sweep scope), two readings needed before I build it; I am building R32 meanwhile.

(1) Which sweep origins R31 binds. Read literally, every sweep-origin acquire without `scope` is refused `SWEEP_SCOPE_MISSING`. But capture-requests' drain today files EVERY request with a sweep origin (capture-requests R38, K287: `captureRequest.origin = {matched_sweep: <target inquiry>, deeming_actor}`, `capture-requests/index.mjs`:732–738), with no `scope`. Literal R31 refuses every drained capture until capture-requests passes a scope it does not have (its target is an inquiry, not a ratified sweep's `sources`). Users broken: `test/m/capture-requests/` (drain), and every live drain.
   Best reading: R31's scope rides the in-process arm only (`captureRequest.scope`, never a body), and binds a sweep origin that names a ratified sweep: one the caller declares as `captureRequest.origin.kind === "sweep"` (monitoring R57's own shape, `{kind: "sweep", matched_sweep: "<bundle>#<id>", deeming_actor}`; capture-requests R45's arm declares it the same way when it lands). The R38 drain origin (no `kind`, the target inquiry as the matched scope, DEC-47) is unchanged and is not R31's. With `scope` given on any in-process call, redirects are held to it (followed by hand, each hop judged by `normalizeAddress` against the prefixes as monitoring R53 defines "in scope").
(2) The body's `matchedSweep` on op=acquire (a member or admin; R16's origin today, tested by `acquire.test.mjs`:401, :425, :692). R31's last sentence says no caller but monitoring and capture-requests' sweep arm sets a sweep origin.
   Best reading: the body's `matchedSweep` is ignored on every arm and the capture files `origin: {kind: "named_request"}`, as R21 already does on the drain arm; I re-word those three assertions to that. (Alternative: refuse it by name; tell me if you want that, and the code's row.)

## J2 · QUESTION

R31's two refusals take catalogue rows (DEC-49; current.md red 7 names acquisition's SWEEP_* rows awaiting stamp), and check families are yours to assign (C-127 went to network-notices, K1119). Best reading, which I am building on: a new family C-128 in acquisition/checks.mjs (SWEEP_SCOPE_CHECKS), C-128.1 SWEEP_SCOPE_MISSING (where: acquire > is-sweep-scope) and C-128.2 SWEEP_REDIRECT_OUT_OF_SCOPE (where: acquire > is-sweep-redirect), each awaiting stamp. Alternative: C-83.9 and C-83.10 in acquire's existing render family (I would not: C-83 is the render arm's). Name the number and I renumber if it differs.

## J3 · REPORT

Users re-tested after merging tranche/T23 @ capture's merge (test/m/acquisition, capture, capture-requests, instance-setup, control-plane, monitoring): 537 tests, 535 pass, 1 fail: control-plane inbox-door.test.mjs:81 (accepted red 9). It is still red after capture's merge, so per K1117 it is now control-plane's L11. No other red. Stale: the plane bundle (bio-plane/dist/bio-plane.bundled.mjs) from bio-plane/src/acquisition/; I regenerated nothing. Requirement wording for you: (a) R29's enumeration of the table does not name R31's C-128.1–C-128.2; (b) Uses still lists parseCdx, replayLocator, cdxQuery and archiveHop, which the archive arm no longer calls (only selectCapture, plus EMPTY_BODY_DIGEST through mementoRow).

## J4 · COMPLETE

acquisition T23 complete; the record (build/jobs/T23/acquisition.md, Completion) is on job/T23/acquisition, merged with tranche/T23. R32: the archive arm and archiveLookup run over Memento, every refusal named and nothing filed. R31: the sweep's scope, with C-128.1 SWEEP_SCOPE_MISSING and C-128.2 SWEEP_REDIRECT_OUT_OF_SCOPE, both new and awaiting stamp (red 7). acquisition tests: 68/68. Whole test/m: 1 red, the accepted red 9. format, architecture, coverage (32/32) and ownership: 0 failures each. Merge order: none.

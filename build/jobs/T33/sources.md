# sources (T33)

**Status** · session_01S93E38cTcZCwGhXxLCywuU · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

T33-22 (R16–R19). I am building on these readings; only (1) blocks my COMPLETE.

1. **`uses` edge.** R17 needs `provenance.captureGrade` (and R16 `provenance.homeOf` to find a capture's home), and requirements' Uses already lists provenance, but `modules.json` gives sources `["record-grammar","record-core","membership","capture"]`, so `architecture.mjs` fails my import. Best reading (K1505 (7)): you add `provenance` (layer 3, before sources) to sources' `uses`. Final uses: record-grammar, record-core, membership, capture, provenance.
2. **Where a capture's `actor` is read (R16).** No service answers it. Best reading: `provenance.homeOf(sha)` gives the home bundle; record-core `readFile(home, "data/provenance.json")` gives the document whose `capture.sha256` is the sha; its `capture.actor` (acquisition R16) is compared with `by` as member ids (`member:x` = `x`). No home, or no such document: `NO_SUCH_CAPTURE`. A null actor (daemon or probe capture): `NOT_YOUR_CAPTURE`.
3. **Rows for R16's codes.** Each refusal carries its row (Provides). Best reading: C-121.7 `MACHINE_CANNOT_MARK`, C-121.8 `NOT_YOUR_CAPTURE`, C-121.9 `NO_SUCH_CAPTURE`, C-121.10 `NO_SERVICE`, in this module's table (R14), with these translations, to be folded into the table under R14:
   - `MACHINE_CANNOT_MARK`: "Only a member, acting for themselves, can mark a result from a paid or account-gated service; no machine, scheduled task or unattended process can. Nothing was written."
   - `NOT_YOUR_CAPTURE`: "Only the member who captured a result can mark it as from their own account on a paid service. Nothing was written."
   - `NO_SUCH_CAPTURE`: "No capture the record holds answers to that digest. Nothing was written."
   - `NO_SERVICE`: "A result from a paid or account-gated service names the service it came from. Name it. Nothing was written."
   Order: `MACHINE_CANNOT_MARK` (any `by` naming no active member: absent, a machine, a daemon, a scheduled consumer, a revoked member), `NO_SERVICE`, `NO_SUCH_CAPTURE` (also a non-64-hex or list `captureSha`: one capture per act), `NOT_YOUR_CAPTURE`.
4. **`terms`.** Optional (null when absent); a non-string or one over 2,000 characters is refused `NO_SERVICE` naming `field: "terms"`; `service` at most 200 characters. Any other field in the call (a query, search terms, other results) is ignored and stored nowhere (R18).
5. **A second mark** of the same capture: an identical one (same service, terms, member) writes nothing and answers `existed: true`; a different one is appended, and `keyedResultOf` answers the latest (R2's supersession on read). The earlier stays.
6. **`grade_cap` when `captureGrade` answers no letter** (doorbell, unrecorded, unruled route: `grade: null` with `ceiling`): one rank below the `ceiling` it names (B → C), the letter a leg on it could at most carry; an authored observation (no ceiling; testimony D): D. A letter: one rank below it, D staying D.
7. **R19's classes.** All `purge: exempt`, `expunge: none`, `derive: stored`. `export: never` for source_entries, source_sight, source_reads, the marks (`source_keyed_marks`) as R19 says, and also for `sources` (it holds the knocker digest) and `source_consents` (its evidence describes the source); `admin-only` for `source_knocks` (R15's receipts, no value). `sight`: `group` for sources and source_knocks; `source` for the rest. `version_chain: true` for the append-only histories (source_entries, source_consents, the marks), else false.
8. The op is `sourcekeyed` (by stamp); `keyedResultOf` is in-process only (people, strength). `affordances` must grade `op=sourcekeyed` (its R40): reported to you, not mine.

## Completion

Change commit `9f1caa2158` on `job/T33/sources`; `tranche/T33` merged at `5cb1cb7bba` (B2: modules.json gives sources `provenance`, K1549).

**Entries applied.** T33-22 (K1449, K1492 (3)), on J1's readings as K1549 accepted them:
- R16 `markKeyedResult({captureSha, service, terms, by})`, `op=sourcekeyed` (by from the stamp): the capture's actor read from its home's `data/provenance.json` (`provenance.homeOf`, record-core `readFile`); refusals in order `MACHINE_CANNOT_MARK` (C-121.7), `NO_SERVICE` (C-121.10, naming `service` or `terms`), `NO_SUCH_CAPTURE` (C-121.9), `NOT_YOUR_CAPTURE` (C-121.8), each writing nothing; appended to the new table `source_keyed_marks` with `by` and the instant; an identical mark again writes nothing.
- R17 `keyedResultOf(captureSha)`: the latest mark, `reproducible_by_public: false`, `grade_cap` one rank below `provenance.captureGrade`'s letter (or its ceiling when it answers none; D for an authored observation; D stays D); null otherwise; never throws.
- R18: one capture per act, no bulk path, every stamp naming no active member refused, no column for a query; the call's other fields are dropped.
- R19: every table declared through `record-core.declareTable` with its classes (`SOURCES_TABLE_CLASSES`), each exempt from purge (R13), `export: never` but `source_knocks` (`admin-only`).
- Final `uses`: record-grammar, record-core, membership, capture, provenance.

**Deferred.** None. BOB's: fold rows C-121.7–C-121.10 into the requirement's table under R14, and strike R16–R19's `not yet met` marks.

**Found in other modules** (reported in COMPLETE):
- `affordances`: `op=sourcekeyed` is ungraded (its R40, R2/R3); its test "R2 R3 R7 R12: N364's ops …" now fails on the new op.
- `control-plane`: its test "R26 (N379, K566): the record store's door dispatches sources' own map …" lists sources' ops exactly and now fails on `sourcekeyed`; `op-declarations` needs a spec for `sourcekeyed` (a member act, by stamp) or the door answers UNKNOWN_OP.
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`; its manifest names `src/sources/`). Not regenerated by me.
- Accepted reds seen, unchanged: case-authoring R30, case-disclosures R21 (K1545).

**Tests and checks** (on `5cb1cb7bba`):
- `node --test test/m/sources/` (in `bio-plane/`): 30 tests, 30 pass, 0 fail.
- Users of sources run: reevaluation 121/121, case-carriage 21/21; case-authoring 121 pass 1 fail (R30, K1545), case-disclosures 47 pass 1 fail (R21, K1545); affordances 166 pass 1 fail, control-plane 158 pass 1 fail (both the new op, above). Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `checks/architecture.mjs … sources`: 12 product files, 32 relative imports; 0 failures.
- `checks/coverage.mjs … sources`: 19 of 19 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … sources tranche/T33`: 7 files changed; 0 failures.

Size (session_01S93E38cTcZCwGhXxLCywuU): test runs 12, module lines 1010

## J2 · COMPLETE

T33-22 applied on K1549's readings: R16–R18 (markKeyedResult, op=sourcekeyed; keyedResultOf with grade_cap; no bulk, never unattended, no search recorded), R19 (declareTable with classes). After merging tranche/T33: sources 30/30; format, architecture, coverage (19/19), ownership (7 files): 0 failures. Final uses: record-grammar, record-core, membership, capture, provenance. REPORT: affordances must grade op=sourcekeyed (its test 'R2 R3 R7 R12: N364's ops' red on it); control-plane's R26 test lists sources' ops exactly (red on sourcekeyed) and op-declarations needs a spec for it. Yours: fold C-121.7–.10 into R14's table, strike R16–R19's marks. Stale: bio-plane/dist/bio-plane.bundled.mjs (not_product). Details in my record's Completion.

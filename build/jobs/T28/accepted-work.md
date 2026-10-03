# accepted-work (T28)

**Status** · session_01Ny1sjsJ9vEJz7rxs28vcCh · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Paths for accepted-work (B1 asks me to name them first). My reading: `paths`: ["bio-plane/src/accepted-work/"]; `tests`: ["bio-plane/test/m/accepted-work/"], as inquiry-grammar and the other L6 modules are laid out. Code in `bio-plane/src/accepted-work/index.mjs` (registerAcceptedWork, acceptedFinding, openFlagsOn, acceptanceWithdrawals, acceptedLegRefusals, the promotion step) and `bio-plane/src/accepted-work/checks.mjs` (C-21.4, C-21.5; R6). Please record them in modules.json on tranche/T28; I carry on reading and merge when you say.

## J2 · QUESTION

R4 needs the held version of the inquiry ("new against the held version, or whose target or target_edition changed"). promotion R39 hands a check `c.head` (type, state, group) but not the held document, and promotion exports no read of it; every module that diffs against the held version (intent, action-plans, inquiry) reads it with `record-core`'s `readFile(bundleId, "bundle.md")`. record-core is not in my Uses. My reading: add `record-core` (layer 2, before 44, so P4 holds) to accepted-work's `uses` in modules.json and to its requirements' Uses line ("`record-core`: `recordOf`, `readFile` (the held `bundle.md`, R4)"). I build on that reading now (`recordOf(host)` by default, injectable as `deps.record`); tell me if you rule otherwise. This does not replace J1.

## J3 · REPORT

B2 applied: tranche/T28 merged (record-core in my uses). The module is written and pushed (`bio-plane/src/accepted-work/index.mjs` 213 lines, `checks.mjs` 20; tests in `bio-plane/test/m/accepted-work/`, 19 tests naming R1–R7). With inquiry-grammar R11 stood in locally (uncommitted, spelled as R11 states it): 19 pass, 0 fail; format, architecture, coverage (7 of 7) and ownership (with the paths edit made locally, uncommitted) 0 failures. My code imports `parseImportedFindingRef` from inquiry-grammar and my fixture `importedFindingRef`, so my tests cannot run on the tranche until inquiry-grammar R11 is in: I wait for your word that it is merged, then merge, re-run against the real R11 and post COMPLETE.

For basis-versions (re B2): R3 is reached per host as `acceptedWorkOf(host, deps).acceptedLegRefusals({legs, viewer})` (the registration it reads is per host, K61, so it is an instance method, as R2's reads are: `acceptedFinding`, `openFlagsOn`, `acceptanceWithdrawals`). It answers `[{check, code, severity: "error", translation, detail, ord, ref, edition}]`; `ord` is a leg's own integer `ord` when it carries one, else its index in `legs`. R4 walks the inquiry's `basis[]` only, as you say. Also for the plane (L11): `acceptedWorkOf(host, {record, promotion})` registers the R39 step when made, so it is made before inquiry's factory; `case-import` calls `registerAcceptedWork("case-import", {finding, openFlags, withdrawals})`, each function synchronous (a promise answer reads as unreadable: promotion's checks run in a synchronous transaction).

## J4 · COMPLETE

**Entries applied.** `build/plan/current.md` (T28) L6, accepted-work, a new module (N522; K1273): R1–R7, after B2 (K1304: paths ruled; `record-core` in my uses) and B3 (K1306: inquiry-grammar merged; tranche/T28 merged into my branch and built against its real R11).
- `bio-plane/src/accepted-work/index.mjs` (220 lines): `acceptedWorkOf(host, deps)` (K61; registers R4's step with promotion R39 when made); `registerAcceptedWork` (R1, both refusals through membership R81); `acceptedFinding`, `openFlagsOn`, `acceptanceWithdrawals` (R2: the registered answer as given; `{absent: true, reason: "accepted_work_absent"}`; `{unreadable: true}` when the function throws, is handed unreadable arguments, or answers a promise, since promotion's checks run in a synchronous transaction); `acceptedLegRefusals` (R3); `check` (R4: the inquiry's `basis[]` only, legs keyed by (ref, `target_edition`) against the held `bundle.md`, so a reorder or an unrelated revision asks nothing; the viewer is the promotion's `author`).
- `bio-plane/src/accepted-work/checks.mjs` (20 lines): `ACCEPTED_WORK_CHECKS` (R6).
- A ref is read trimmed, as inquiry-grammar R11's leg arm reads it (`isRef` trims), so a target padded with spaces cannot pass the form check and skip the acceptance check.

**Catalogue rows added by this job, awaiting stamp** (accepted red 2, next.md S5; T29's promotion stamp): C-21.4 IMPORTED_NOT_ACCEPTED and C-21.5 ACCEPTED_WORK_UNREADABLE, both in `bio-plane/src/accepted-work/checks.mjs`.

**Deferred.** None.

**For BOB (paths).** `modules.json`'s accepted-work entry still has empty `paths` and `tests` on my branch, as B2 says: BOB writes `["bio-plane/src/accepted-work/"]` and `["bio-plane/test/m/accepted-work/"]` in the merge commit. Every check below was run with that edit made locally, uncommitted.

**Found in other modules.** None needing work. For their jobs (already sent in J3): basis-versions reaches R3 as `acceptedWorkOf(host, deps).acceptedLegRefusals({legs, viewer})`, answering `[{check, code, severity, translation, detail, ord, ref, edition}]`; plane makes accepted-work before inquiry; case-import's three registered functions must answer synchronously.

**Tests and checks** (on `job/T28/accepted-work` with tranche/T28 @ K1306 merged):
- `node --test bio-plane/test/m/accepted-work/`: tests 19, pass 19, fail 0.
- `node --test bio-plane/test/m/inquiry-grammar/ bio-plane/test/m/promotion/` (the modules I use that changed this tranche): pass 134, fail 0.
- `node checks/format.mjs .`: 95 modules, 94 requirements files; 0 failures.
- `node checks/architecture.mjs . accepted-work`: 8 product files, 22 relative imports; 0 failures.
- `node checks/coverage.mjs . accepted-work`: 7 of 7 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . accepted-work tranche/T28`: 9 files; 0 failures.
- `bio-plane/test/system/row-census.test.mjs`: C-21.4 and C-21.5 listed awaiting stamp by this record (C-21.3 is inquiry-grammar's record's).

Size (session_01Ny1sjsJ9vEJz7rxs28vcCh): test runs 7, module lines 240

## J5 · REPORT

Correction to J4's census line: with my paths in modules.json, `bio-plane/test/system/row-census.test.mjs` fails R50 with "arrived with no record: C-21.3 IMPORTED_LEG_MALFORMED; C-21.4 IMPORTED_NOT_ACCEPTED; C-21.5 ACCEPTED_WORK_UNREADABLE" (1106 rows against the pin 1103). That suite counts a row as awaiting stamp only when its own `AWAITING_STAMP` list declares it, and that list is in promotion's test file, not mine. This is accepted red 2 (B1). My record names C-21.4 and C-21.5 awaiting stamp (J4), so a declaration added there will verify against it. C-21.3 is inquiry-grammar's.

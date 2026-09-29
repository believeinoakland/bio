# capture (T12)

**Status** · session_0195mhRMLSwyJgRodhjV2CEg · depth 2 · COMPLETE · handled B2

## Completion

**Applied.** N285 (capture's share, B1): R63 `evidenceAbsent(sha, store, extra?)` in `src/capture/ops.mjs`, the one site of "no evidence object is held under a digest". It answers `{status: 404, body}`, the body `{ok: false, reason: "NOT_FOUND", code: "NOT_FOUND", check, translation, sha256, store}` with a caller's `extra` fields beside and never over them (the shape `archiveLookup` already answers, so the control plane's envelope sends it); it writes nothing and never throws (a hostile `extra` is dropped). Its row is in capture's own new table, `src/capture/checks.mjs` `CAPTURE_CHECKS.NOT_FOUND`: **C-118.1** (the evidence store had no family; C-118 is the next free family number, K107 (3), K174), `where` `src/capture/ops.mjs evidenceAbsent > is-evidence-held`, the worded translation. R21's get answers through it, keeping `tokenClass` as its extra. Extraction (R31) can import it from `../capture/ops.mjs`, which it already imports from.

**Deferred.** None of my entry. One flaw in this module left for a wording (below, 2).

**Found (reported to BOB).**
1. The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale: `src/capture/ops.mjs` is one of its inputs, and `src/capture/checks.mjs` is new. Not rebuilt (mechanics §14). The fleet bundles are unaffected (fleetbundles all PASS).
2. capture's own `inboxGet` / `inboxResolve` (`src/capture/index.mjs` ~365, ~370) answer an unknown knock as a bare `NOT_FOUND` with no row: a different condition (no such knock) under the same code, which K275 says is renamed with its own row. R32 names no code for it, so a code and row need a wording (e.g. `NO_SUCH_KNOCK`); the legacy-ui keys would follow. Not changed without that wording.
3. Legacy tests: `bio-plane/test/pdfstructure-op.test.mjs` "identical to op=capture's own 404 body" now fails (28/1; 29/0 on `tranche/T12`): R21's absent body now carries R63's `code`, `check`, `translation`, and op=pdfstructure's does not until extraction's R31 answers through `evidenceAbsent` (layer 4, N285). It passes again then; if not, it is legacy-tests'.
4. DEC-49 guard (`civicos-ui/check-refusal-codes.mjs --strict`), diffed against `tranche/T12` @ c09f40fb8a's tree: no new failure kind; ratchets moved by exactly this job's one family, row and region: families 99→100, rows 783→784, governedSites 494→495, regions 455→456, regionLines 5462→5468, refusalsJudged 857→858, outcomeReturns 257→258, codesChecked 881→883 (legacy-tests' re-pin, layer 11). Arm G's `NOT_FOUND` stays at 7 sites (the old op=capture literal replaced by R63's); the guard files `NOT_FOUND` under progressions' `PROGRESSION_CHECKS.NOT_FOUND` row, a different condition of the same code (K275's rename, progressions' side).
5. `build/requirements/capture.md` R63's "(not yet met: N285)" mark can be struck (BOB's file).

**Tests and checks.**
- `node --test bio-plane/test/m/capture/`: tests 69, pass 69, fail 0 (5 new, `evidence-absent.test.mjs`: R63 ×5, R21 through R63).
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … capture`: 11 product files, 49 relative imports; 0 failures.
- `node checks/coverage.mjs … capture`: 63 of 63 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … capture tranche/T12`: legacy-store 0/0, legacy-index 0/0; 0 failures.
- Also: `bio-plane/test/refusal-wire.test.mjs` 42 pass, 0 fail; `bio-plane/test/fleetbundles.test.mjs` all PASS; `pdfstructure-op.test.mjs` 28/1 (item 3).

Size (session_0195mhRMLSwyJgRodhjV2CEg): test runs 9, module lines 3053

## J1 · REPORT

Found beyond my module (record, Completion 'Found'): (1) plane bundle bio-plane/dist/bio-plane.bundled.mjs stale (src/capture/ops.mjs is an input; src/capture/checks.mjs new); fleet bundles unaffected. (2) capture's own inboxGet/inboxResolve answer an unknown knock as a bare NOT_FOUND with no row, a different condition under the same code (K275): R32 needs a code and row worded (e.g. NO_SUCH_KNOCK); not changed without it. (3) legacy bio-plane/test/pdfstructure-op.test.mjs 'identical to op=capture's own 404 body' fails 28/1 (29/0 on tranche/T12) until extraction's R31 answers through evidenceAbsent in layer 4 (N285); then it passes again. (4) DEC-49 guard: no new failure kind; ratchets moved by this job's one family/row/region: families 99->100, rows 783->784, governedSites 494->495, regions 455->456, regionLines 5462->5468, refusalsJudged 857->858, outcomeReturns 257->258, codesChecked 881->883 (legacy-tests' re-pin). (5) R63's 'not yet met: N285' mark can be struck.

## J2 · COMPLETE

N285 applied: R63 evidenceAbsent(sha, store, extra?) in src/capture/ops.mjs answers {status: 404, body: {ok:false, reason/code NOT_FOUND, check C-118.1, translation, sha256, store, ...extra}}; row CAPTURE_CHECKS.NOT_FOUND in the new src/capture/checks.mjs (C-118, next free family); R21's get answers through it. Tests 69/69; format, architecture, coverage (63/63), ownership: 0 failures. Record: build/jobs/T12/capture.md on job/T12/capture @ bcd0ffc9f8+.

## Completion (B2, K383)

**Applied.** Merged `tranche/T12` first (f955973a80). R32's unknown knock id: `inboxGet` and `inboxResolve` answer through one private helper, `#noSuchKnock` (`src/capture/index.mjs`), `{ok: false, reason/code "NO_SUCH_KNOCK", check "C-118.2", translation, knockId}`, the same answer for the read and for a resolve to any valid status, nothing written; an id that is not a non-empty string is answered the same without a query (`knockId: null`). Row `CAPTURE_CHECKS.NO_SUCH_KNOCK`, C-118.2, `where` `src/capture/index.mjs #noSuchKnock > is-knock-held`, translation "No knock in the inbox answers to this id. Nothing was changed." `BAD_STATUS` is still tried first (unchanged order).

**Found (reported to BOB).**
1. **The 404 does not reach the wire from this module.** `inboxget`/`inboxresolve` go through the Durable Object's generic route, which always answers 200 `{ok: true, result}`, and the control plane passes that status through (`src/index.mjs` ~7120); a store answer carries no status. The status is the control plane's per-op mapping, as it maps `NO_REVIEW_COPY` and `NO_SUCH_BUNDLE` to 404 (`src/index.mjs` ~3513, ~4999): legacy-index maps `NO_SUCH_KNOCK` to 404 for these two ops, or R32's "404" is reworded. Everything else in R32's clause is tested at capture's interface.
2. Legacy `bio-plane/test/doorbell.test.mjs` "unknown knock id says so" (line 508) pins `result.reason === "NOT_FOUND"`: now 71 pass, 1 fail. It reads `NO_SUCH_KNOCK` now (legacy-tests). No UI keys on the inbox's old code (`setup.mjs`'s inbox view, civicos-ui, affordances: none).
3. DEC-49 guard, whole job against `tranche/T12` @ f955973a80's tree: families 99→100, rows 783→785, census 1065→1066, reach 810→811, governedSites 494→496, regions 455→457, regionLines 5462→5473, codesChecked 881→885, outcomeReturns 257→259, refusalsJudged 857→859 (bodyLines, exempt, 7268→7279); arm G's `NOT_FOUND` 7 → 5 sites (the inbox's two gone); no new failure kind.
4. Still standing from J1: the plane bundle is stale (`src/capture/index.mjs` and `ops.mjs` are inputs); `pdfstructure-op.test.mjs` 28/1 until extraction's R31 lands.

**Tests and checks.**
- `node --test bio-plane/test/m/capture/`: tests 70, pass 70, fail 0 (new: "R32 (K383)").
- format: 69 modules, 64 requirements files; 0 failures. architecture: 13 product files, 54 relative imports; 0 failures. coverage: 63 of 63 live ids named; 0 failures. ownership (tranche/T12): legacy-store 0/0, legacy-index 0/0; 0 failures.
- Legacy `test/doorbell.test.mjs`: 71 pass, 1 fail (item 2).

Size (session_0195mhRMLSwyJgRodhjV2CEg, B2): test runs 5, module lines 3075

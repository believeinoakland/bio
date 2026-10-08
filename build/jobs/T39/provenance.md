# provenance (T39)

**Status** · session_01Cwa88YYi7hCLFZzpdk7gAE · depth 2 · COMPLETE · handled B2

## Completion (T39-5, N806)

**Reading set (mechanics §17, K2304).** Measured: requirements 42 KB, code and tests 437 KB, over 300 KB, so step (3). Read whole myself: `build/requirements/provenance.md`; layer 3's contract; `src/provenance/index.mjs` (the file the entry changes, 1,630 lines); `ooxml`'s `ARCHIVE_DEPTH_MAX` (R30, the one used service the entry names); `file-safety/index.mjs`:60–80, 506–521 (the source condition lifted, read only); `plan/draft-T39-N806.md` §2 item 1; K2315, K2333, K2343. A worker read whole the rest of the code (`checks.mjs`, `register-checks.mjs`, `schema.mjs`, `ops.mjs`) and all 17 test files plus the three other `tests` paths, and wrote a summary of about 6 KB, every statement citing file and line: the `captured_locators` schema (`via` NOT NULL DEFAULT 'direct', no CHECK; the `capture_sha` index), the fixture (`world`, `w.st.sql`, `w.snapshot`), the R15 no-write test and the R40 no-place test that list every read service, and the ops and export pins. Nothing it left out mattered: the change adds one read service and one constant, and touches no schema, op, check or write.

**Entry applied.** R62 `fetchedByThisCopy(captureSha) → {fetched, routes, archive}` and the exported `FETCHED_VIAS` (`direct`, `archive.org` via `ARCHIVE_VIA`, `capture-request`), in `index.mjs`. The rule is file-safety's `#sourceOf` with these changes: the depth bound is `ARCHIVE_DEPTH_MAX`, not a literal 3; the capture itself counts in cycle detection; a locator must name a whole index; the locator's digest is lowercased; and a failed read answers `{fetched: false, routes: [], archive: null}`. `archive` is the archive whose answer decided `fetched: true`, else the first well-formed archive an `unpacked` receipt names (R60's order), else null.

**Tests.** New `test/m/provenance/fetched.test.mjs`, 9 tests titled R62. They cover direct, archive.org, capture-request, no via, doorbell, unrecorded, an unruled via, the prefix and case rule, unpacked from a fetched archive and from a member's archive, one receipt sufficing, the depth bound at `ARCHIVE_DEPTH_MAX` and one past it, a two-archive cycle and a self-cycle, nine bad locators, a failed read, and the rule writing nothing. `fetchedByThisCopy` also joins R15's no-write test (`receipts.test.mjs`) and R40's no-place test (`testify.test.mjs`).
- `node --test test/m/provenance/`: tests 120, pass 120, fail 0.
- `test/mk6-bundle-names-no-author.test.mjs` was red on `tranche/T39` before this job: it sent every credential as `token=` in the address, which C-38.10 refuses (`CREDENTIAL_IN_ADDRESS`). The file is one of provenance's `tests` paths, so I fixed it here: its `GET`, `POST` and capture `PUT` now lift `token` into an `Authorization: Bearer` header. No assertion changed. Result: 10 pass, 0 fail.
- `test/publishingproject.mjs` and `test/adoptable-reading.mjs` are helpers, not suites.
- The manifest names no layer tests.

**Checks.** format: 139 modules, 137 requirements files; 0 failures. architecture (provenance): 0 failures. coverage (provenance): 47 of 47 live requirement ids named by a test; 0 failures. ownership (provenance, tranche/T39): 6 files; 0 failures.

**Deferred.** None. R62's `*(not yet met: T39)*` mark is BOB's to strike at the merge.

**Found in other modules.**
1. `file-safety`: `#sourceOf` and its own `FETCHED_VIAS` (`index.mjs`:71, 506–521) now duplicate R62. They are T39-6's to replace with `provenance.fetchedByThisCopy`. Its bound is a literal `path.length >= 3`, not `ARCHIVE_DEPTH_MAX`.
2. `dec149.test.mjs` titles cite `index.mjs` line numbers from T35 (:899 …). Those numbers were already stale before this job and assert nothing.

Size (session_01Cwa88YYi7hCLFZzpdk7gAE): test runs 8, module lines 2770

## J1 · COMPLETE

T39-5 done. R62 fetchedByThisCopy and FETCHED_VIAS are in provenance/index.mjs. The new fetched.test.mjs tests every route START named, and the function also joins R15's no-write test and R40's no-place test. test/m/provenance: 120/0. I also fixed the inherited red mk6-bundle-names-no-author (one of my tests paths): it sent credentials in the address, which C-38.10 refuses; it now uses the Authorization header, 10 pass, 0 fail. Checks: format, architecture, coverage (47/47) and ownership (6 files) each report 0 failures. For file-safety (T39-6): replace #sourceOf and its own FETCHED_VIAS with provenance's; its bound is a literal 3. R62's not-yet-met mark is yours to strike. Record: build/jobs/T39/provenance.md.

## B2 · CHANGE (K2361), applied

R62's answer was already exactly `{fetched, routes, archive}`: the keys in that order, `archive` a bare lowercase digest (a locator's upper-case digest is lowercased), and no wrapper. A new test, "R62: the answer is exactly …", deep-equals literal answers and checks `Object.keys` order for a fetched file, a direct capture, an absent capture and a malformed digest. `test/m/provenance`: tests 121, pass 121, fail 0.

## J3 · COMPLETE

B2 applied. R62's answer already had exactly the shape {fetched, routes, archive}: keys in that order, archive a bare lowercase digest, no wrapper. A new literal deep-equal test also checks the key order. test/m/provenance: 121/0. format, architecture, coverage and ownership each report 0 failures. Record updated.

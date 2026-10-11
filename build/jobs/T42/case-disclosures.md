# case-disclosures (T42)

**Status** · session_011M1X1CKSmsRAQDvUbXrW5e · depth 2 · COMPLETE · handled B1

**Read whole** (the reading set, mechanics §17): `requirements/case-disclosures.md`; layer 8's row of `layers.md`; `plan/current.md`'s T42-23b and rule 4; K2643; `test/m/case-disclosures/carries.test.mjs` and `fixture.mjs`. The rest of the module's code is not touched by this entry. To find the cause I also read, in part, `sources/index.mjs` (`sourcesOf`), `doorbell/index.mjs` (`doorbellOf`), `capture/index.mjs` (`captureOf`, `Capture`'s `acquisition` getter), `acquisition/unpack.mjs` (`acquisitionOf`, its schema) and `plane/store.mjs`'s boot migrate list.

**Applied:**
1. **T42-23b** (K2643; rule 4 (14)). The cause: the fixture built capture as a bare `new Capture(...)`, which is not registered as the host's instance. When R7's read reached `sources.sourceOf`, `sources` built `doorbellOf(host)` lazily, which called `captureOf(host)`. That made a second capture, whose `acquisition` was then reached and created `archive_entries` and `unpack_days` inside the read (159 vs 157). The fixture now builds capture as the host's one instance with `captureOf(host, …)`, as the plane does, and reaches `capture.acquisition` at boot. So everything the read reaches exists before any test's snapshot. The doorbell `sources` builds lazily now sits over that same capture and creates no table. `w.acquisition` is exposed. Nothing was imported outside case-disclosures' `uses`: the architecture check counts test files, so an import of `doorbell` or `acquisition` was tried and dropped.
2. **The negative control**, now explicit in the R7 arm: a world whose `promotion.fact` (asked inside `disclosureBlocks`) creates a table during the same read, and the arm's count sees it (+1).

**Deferred:** none.

**Found in another module (REPORT J1; P9):** `capture`: `captureOf` (`src/capture/index.mjs`:265), on every repeat call for a storage, builds the list `[…, ["acquisition", c.acquisition]]` to compare a caller's supplied deps. That reads `Capture`'s lazy `acquisition` getter even when the caller supplies no acquisition. So any repeat `captureOf(ctx)` (e.g. `doorbellOf`'s, reached from a read through `sources`) builds acquisition's instance and runs its DDL (`archive_entries`, `unpack_days`) inside whatever the caller is doing, possibly a caller's transaction. The read path should not create tables. Suggested fix (capture's): compare acquisition only when `opts.acquisition != null`. In the plane the tables already exist from boot (repeat `captureOf` calls at boot), so the effect is test-visible only, never data-visible.

No generated artifact made stale beyond the plane bundle (rule 4 (10)). `modules.json` edges added: none.

**Tests and checks** (branch at tranche/T42 @ 1f3825651a plus this change):
- case-disclosures (`test/m/case-disclosures/`): `tests 95, pass 95, fail 0` (carries.test.mjs 11/11; red 159 !== 157 before the change).
- Users' suites (P11): case-authoring `tests 181, pass 181, fail 0`. plane `tests 166, pass 166, fail 0`. `system/migrate-released.test.mjs` `tests 1, pass 1, fail 0`. answer-envelope `tests 29, pass 28, fail 1`: the red is `families.test.mjs`:425 (`HELD_EARLIER`), which is rule 4 (6). case-account has no tests yet.
- `format: 147 modules, 146 requirements files; 0 failures`
- `architecture: 17 product files, 102 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 31 of 31 live requirement ids named by a test; 0 failures`
- `ownership: 3 files changed by case-disclosures between tranche/T42 and HEAD; 0 failures`

Size (session_011M1X1CKSmsRAQDvUbXrW5e): test runs 10, module lines 2387

## J1 · REPORT

P9, capture: captureOf (src/capture/index.mjs:265) reads Capture's lazy acquisition getter on every repeat call while comparing supplied deps, even when none is supplied, so a repeat captureOf(ctx) (doorbellOf's, reached from a read through sources) builds acquisition and runs its DDL (archive_entries, unpack_days) inside the caller's read or transaction. Suggested fix (capture's): compare acquisition only when opts.acquisition != null. In the plane the tables exist from boot, so it is test-visible only. Details in my record.

## J2 · COMPLETE

T42-23b complete at the branch head. The fixture builds capture as the host's one instance (captureOf) and reaches its acquisition at boot, so R7's 'no new table' arm measures case-disclosures alone. The arm gains an explicit negative control (a table created inside the read is counted). This clears rule 4 (14). case-disclosures 95/95. Users: case-authoring 181/181, plane 166/166, migrate-released 1/1, answer-envelope 28/29 (families.test.mjs:425, rule 4 (6)). Four checks: 0 failures. Test-only; modules.json edges added: none. REPORT J1: capture's captureOf reaches acquisition on repeat calls.

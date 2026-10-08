# membership (T37)

**Status** · session_01Cp2NRbxdmMxPhCZerTfGF4 · depth 2 · COMPLETE · handled B2

## Completion

**Entry applied: T37-44 (K1185, K2171).** `MODULE_ORDER` (`bio-plane/src/membership/index.mjs`) re-pinned to `build/modules.json`: `image-cover` after `pdf-pixels` in layer 1 (136 ids). Its comment names T37-44. This clears rule 6's red 9.

**Tests changed:**
- `test/m/membership/module-order.test.mjs`: T36-6's test pins `image-cover` between `pdf-pixels` and `pdf-worker` and in layer 1 (`SINCE_T33` gains the triple, and the test's title names T37-44). T33-19a's layer-1 pin leaves it out with the other modules added since T33.
- `test/members.test.mjs`: red on `tranche/T37` before this job. It threw at :66 with 0 of 96 run, from T36-36 (admission R20 and R5; K2166), and was recorded nowhere. I repaired it on my best reading, put to BOB as J1. The credential moves from the address to `Authorization: Bearer`. The arms using the retired shared `MEMBER_TOKEN` are re-pinned to `MEMBER_TOKEN_RETIRED`, with no roster and no cover in the answer. The roster read moves to an ordinary member's session. Now 95/0.

**Users of `MODULE_ORDER`:**
- Turned green: promotion's "R39, R45, R46: … the modules' total order" (`registry.test.mjs`), the sister of red 9.
- Still red: progressions `order.test.mjs`:15 (R41). This is rule 6's red 4, until T37-12, and not mine.
- Provenance R47 and my R79 (`t9-notice-sight-bounds.test.mjs`, `module-order.test.mjs`) are green.

**Found in other modules:** the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` carries the old list. This change stales it, and BOB regenerates it at the layer close (mechanics §14; `not_product`'s artifact).

**Deferred:** nothing.

**Reading set:**
- START's measure: 405 KB. My own measure: requirements 48 KB plus code and tests 586 KB. That is over 300 KB, so I followed path (3).
- Read whole myself: `build/requirements/membership.md`; layer 2's row of `build/layers.md`; plan T37's "Rules at the opening" and entry T37-44; K1185 and K2171; `module-order.test.mjs`; `members.test.mjs`'s parts my repair touched (its header and helpers :1–80, section 3 :540–640); the Purpose of record-core, record-grammar, signatures and test-support (no used service changes).
- My worker read whole `index.mjs` (3,203 lines), `checks.mjs`, `schema.mjs`, `members.test.mjs` and every other file under `test/m/membership/`. Its summary (about 6 KB) cites:
  - the one code reader, `onRevoked`'s `rank` (`index.mjs`:368–375, `indexOf` each time, so no position is hard-coded);
  - `t9-notice-sight-bounds.test.mjs`:185–195, derived from the file;
  - `fixture.mjs`:42.
- Nothing the summary left out mattered.
- The worker also noted, for a later job (not flaws in behaviour): the order comment says "the file's order" while `t9`:187 sorts by layer first, and the two agree because the file is in layer order; `members.test.mjs`'s comments at :61–64 and :332–336 still cite the retired two-administrators rule.

**Tests run (with the change):**
- `test/m/membership/` + `test/members.test.mjs`: 173 pass, 0 fail.
- Every other test naming `MODULE_ORDER`, with promotion's and provenance's suites: 430 tests, 429 pass, 1 fail (red 4). Without the change: 428 pass, 2 fail.
- store-door 38/0; control-plane 180/0; plane `store.test.mjs` 11/0.
- No layer tests are named in the manifest.

**Checks** (process repository):
- `format: 136 modules, 135 requirements files; 0 failures`
- `architecture: 26 product files, 68 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 95 of 95 live requirement ids named by a test; 0 failures`
- `ownership: 4 files changed by membership between tranche/T37 and HEAD; 0 failures`

Size (session_01Cp2NRbxdmMxPhCZerTfGF4): test runs 12, module lines 3,970 (`src/membership/`).

## J1 · QUESTION

`bio-plane/test/members.test.mjs` (my `tests` path) is red on `tranche/T37` before my change: it throws at :66 (0 of 96 run), unrecorded in rule 6 and in T36's close. Cause: T36-36 (admission R20 `CREDENTIAL_IN_ADDRESS`, R5 `MEMBER_TOKEN_RETIRED`; K2166). The suite sent every credential as `token=` in the address, and five arms used the shared `MEMBER_TOKEN`. No membership code is involved.

My best reading, applied in this job (P8: a flaw in my own module's tests); tell me if you want it otherwise:
(1) Transport only: the suite's `GET`/`POST` helpers lift `token=` out of the address into `Authorization: Bearer`. No assertion changes.
(2) The retired-token arms are re-pinned to admission R5's answer, never loosened. "member token cannot create members" now expects `MEMBER_TOKEN_RETIRED`. The D-157 arms "shared MEMBER_TOKEN receives no cover / still reads the handle roster / no cover reaches it" become one arm, "refused the roster, no `result`, no cover in the answer", plus "no cover value reaches it". "Nor can the shared machine credential" with `administer=true` now expects `MEMBER_TOKEN_RETIRED`. The roster read at :544 ("machine member token reads the roster", 2) moves to an ordinary member's session (`M2`), same count.
Result: members 95 pass, 0 fail (96 before: three asserts became two).

## J2 · COMPLETE

T37-44 done: MODULE_ORDER re-pinned (image-cover after pdf-pixels); red 9 and promotion's R39/R45/R46 sister test green; progressions R41 (red 4) stays. members.test.mjs repaired on J1's reading (95/0), J1 still open for your answer. membership 173/0; checks 0 failures. Plane bundle stale (old list), for the layer close. Record: Completion.

# review (T11)

**Status** · session_013upGxpTKBf57ky1i3TdZNR · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Completion (T11, layer 8).** Branch `job/T11/review`, from `tranche/T11` @ fd65ab4d2a; no BOB file changed since.

**Entries applied**
- **N297 (review's share; N242's three-line regions).** The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`) failed three of this module's regions as below its 4-line / 120-character floor: `is-review-unknown-act` (`act`), `is-review-secret` (`#grant`), `is-review-grant-named` (`#revoke`). Each region now carries the condition that governs its refusal, as `is-machine-review` already did (`is-review-secret` and `is-review-grant-named` take in their test; `is-review-unknown-act` is the fall-through after the three dispatches, its marker saying so), with the detail on its own line. No `where`, code, detail or translation changed; the wire is byte-identical. The guard now names no review failure (72 FAIL lines → 70 over the tree).
- **B1's plane shape (K316).** The fixture's `sql.exec` now answers a one-pass cursor (iterable, `next`, `toArray`, `one`), never an array. Shown to bite: with `#one` indexing `exec(...)[0]` the suite goes 5/24; restored, 29/0. The module has no LIKE/GLOB pattern (K313).

**Marks for BOB to strike** (met, and tested at the interface): R26's `(not yet met: K240)`. The three names are exported and pure; `case-authoring` reads `case_drafts` (`draft_id, case_id, params, statement_by`) under `DRAFTS_READ_MAX`, which the R26 test asserts equals `REVIEW_LIST_MAX` (K242); nothing outside `src/review/` writes `case_drafts` (grep for INSERT/UPDATE/DELETE across `bio-plane/src`).

**Deferred:** none.

**Found in other modules (REPORT)**
- **legacy-tests (the guard's floors):** widening these three regions moves the guard's ratchets it pins with slack 0: `regions` floor 434 → measured 436, `regionLines` 5338 → 5350 (the rest of the ratchet figures are other modules'). These floors are legacy-tests' to re-pin; I did not touch them.
- **Own module, noted only:** the two `MINT_EXHAUSTED` answers in `#draft` and `#grant` carry no code or row. The guard does not count them (no refusal row is named), and they are not in N297. If BOB wants them catalogued, that needs a C-87 row, which is a new check row and promotion R34's to stamp.
- Generated artifacts: none made stale by a behaviour change. The bio-plane bundle's bytes do include `src/review/index.mjs`, so its input hash moves: regenerate at layer close.

**Tests and checks**
- `node --test bio-plane/test/m/review/`: tests 29, pass 29, fail 0, todo 0 (every live id R1–R26 named).
- Legacy suites over the module, unchanged and green: reviewcopy, reviewcopy-inband, d448-review-copy-translation, rec213-reviewcopy-writer (each 1/0).
- Layer tests: none (manifest).
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures. `architecture.mjs review`: 8 product files, 30 relative imports; 0 failures. `coverage.mjs review`: 26 of 26 live requirement ids named by a test; 0 failures. `ownership.mjs review tranche/T11`: 4 files changed; legacy-store and legacy-checks 0 lines; 0 failures.

Size (session_013upGxpTKBf57ky1i3TdZNR): test runs 3, module lines 1006

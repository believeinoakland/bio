# strength (T19)

**Status** · session_01SjzXY7cP7WiFCBXg3KiFsc · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

B1's deletion of the catalogue's `STRENGTH_STATES`: confirmed over the repository first, as asked, and `converts.test.mjs`:10 is **not** its last importer. `civicos-ui/check-semantics.mjs`:77 (legacy-tests, layer 11) also imports `STRENGTH_STATES` from `bio-plane/checks/bio-checks.mjs` (with ten other names), and compares it with app.html's copy at :354 and :364. Seventeen `civicos-ui/test/*` suites run that script. Deleting the export would break its module link (`does not provide an export named`) before anything runs. No other importer at HEAD: ratification reads strength's own (K691/K692). The bundles take it only through the plane's source.

My reading: I make every rule-1 re-point and drop the parity arm at `converts.test.mjs`:10, so no strength file imports `bio-checks.mjs`. I **hold** the catalogue's `STRENGTH_STATES` under rule 1 for legacy-tests' importer, record it as found in another module, and do not delete it. The fix is a one-word re-point in `check-semantics.mjs`, to `../bio-plane/src/strength/index.mjs`, in legacy-tests' L11 job. After that, legacy-index or legacy-checks deletes the copy. Once the parity arm is gone, nothing checks that the catalogue's copy agrees with strength's, so the held copy could drift. It has not changed since T7.

Alternative, if you rule it: you widen my write to that one import line. I am going ahead on my reading. This answer does not change what I build next.

## J2 · COMPLETE

Complete at `job/T19/strength` after merging `tranche/T19`, including BASIS-VERSIONS #6 stage one (B3, K813).

**Entries applied (B1, B2, B3):**
- Every rule-1 re-point: no strength file now imports `bio-checks.mjs`.
  - `arithmetic.mjs`: `BASIS_GRADES` comes from record-grammar's `grades.mjs`.
  - `checks.mjs`: `VERSION_STATES` comes from basis-versions (`src/basis-versions/index.mjs`, which exports it after B3).
  - `index.mjs`: `BASIS_GRADES`, `TESTIMONY_GRADE`, `normalizeType`, `OBJECT_TYPES`, `BUNDLE_ID_RE`, `parseFrontmatter` and `isMachineIdentity` come from record-grammar. `VERSION_MACHINE` comes from basis-versions. C-64.1 `GROUP_UNDETERMINED` comes from promotion's `PROMOTION_ROW_CHECKS`, in place of the catalogue's `INSTANCE_GROUP_CHECKS`. PROMOTION #20's copy no longer has strength as a reader; inquiry and instance-setup still read the catalogue's.
- The comments are re-worded: `arithmetic.mjs`:20 (the states are read from here; ratification, R9) and `index.mjs`:11 ("the check catalogue").
- `converts.test.mjs`:10's catalogue parity arm is dropped, and the test's title no longer mentions it.
- The catalogue's `STRENGTH_STATES` is **held**, not deleted (B2, K810): legacy-tests' `civicos-ui/check-semantics.mjs`:77 still imports it.

**Deferred:** nothing of mine.

**Found in another module:**
- legacy-tests: `civicos-ui/check-semantics.mjs`:77 imports `STRENGTH_STATES` (and ten other names) from the catalogue. Seventeen `civicos-ui/test/*` suites run it. It goes red by name when control-plane deletes the catalogue at L11 (K810). Until then, no test checks that the held copy matches strength's.
- ratification: on `tranche/T19` at this job's start, `test/m/ratification/` is 87 pass, 81 fail. Eighty of the failures are `no such table: signers` and one is an assertion. The count is the same with and without this change (checked by stash), so it is not caused by strength; I take it to be ratification's L8 work not yet run in T19.
- No generated artifact is made stale by a job's hand: the plane bundle changes at BOB's layer-close regeneration, as usual.

**Tests and checks:**
- `node --test test/m/strength/`: tests 69, pass 69, fail 0 (before and after the B3 merge).
- `node --test test/m/ratification/` (it imports strength's `STRENGTH_STATES`): pass 87, fail 81, the same as the baseline above.
- `format`: 87 modules, 82 requirements files; 0 failures.
- `architecture strength`: 13 product files, 45 relative imports; 0 failures.
- `coverage strength`: 28 of 28 live requirement ids named by a test; 0 failures.
- `ownership strength tranche/T19`: legacy-store 0 lines added and 0 removed, legacy-checks 0 and 0; 0 failures.

Size (session_01SjzXY7cP7WiFCBXg3KiFsc): test runs 5, module lines 1553

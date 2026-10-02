# promotion (T22)

**Status** · session_01HWFND67AwBJQuXM4beadEA · depth 2 · WORKING · handled B2

## Completion (PROMOTION #23, 2026-10-02)

**Entries applied** (B1 START; B2 CHANGE: `tranche/T22` merged after membership, d0343fd9c7).
- **E1–E5, the stamp.** `CATALOG_VERSION` 1.51.0 → 1.52.0 (`bio-plane/src/gate.mjs`), its note in the previous notes' form. Read by diffing R50's census of the tree (stamp commit 57160de53a, and again on the merged tree d0343fd9c7: the same 1022 rows, de396d62…) against the 1.51.0 fixture (984 rows, b7c43a32…): 42 lines arrived, 4 departed, 11 changed, every one named `awaiting stamp` by a T21 record — provenance C-53.13 (translation); filing-templates C-115.31 and .36 re-keyed, C-115.32, .33, .35, .37, .38 moved (`where`; .33 re-worded), C-125.1–.32 new; filings C-115.41–.43 new, C-115.12, .39, .40 (`where` and translation), .34 (translation), .19 (`where`), .6 and .17 retired; local-facts C-126.1–.5 new. **No row the diff shows is unnamed by a record**, so no QUESTION. Composition: intent's registration ids `["C-2.9"]` (K979). Membership's T22 job moved no row (its merge left the census identical). `ROW_CENSUS` re-pinned: 1022 rows, `de396d62fe1e159f5b7ee5e8c360e119226674fe097e3d4e51a79ff68be11bd1`. `GATE_VERSION`'s form kept (R34).
- **E6, the census.** `row-census.test.mjs` re-pinned to 1.52.0: every `after: "1.51.0"` declaration retired (`AWAITING_STAMP` and `COMPOSITIONS_AWAITING` now empty, each with its re-anchor note), header notes the suite is promotion's since K1006. **New fixture `bio-plane/test/fixtures/row-census-1.52.0.jsonl`** (1022 lines, reproduced by `row-census.mjs` on 57160de53a); **1.51.0 fixture deleted**. Negative control: the suite's in-suite arms (added row, departed row, changed translation, undeclared and unchanged declarations) pass on the stamp; the real-tree arm, run on a scratch worktree of d0343fd9c7 (removed after), `C-59.99 CONTROL_ROW` added to record-core's `RECORD_CORE_CHECKS` → 7 pass 1 fail, `CENSUS MOVED: arrived with no record: C-59.99 CONTROL_ROW`, as declared.
- **D3.** `gate.mjs`' older notes saying a re-pin "is legacy-tests'" (the 16 lines BOB listed, plus their continuations) put in the past tense ("was legacy-tests'", "legacy-tests' then, named"); the `ROW_CENSUS` comment now names the suite as this module's own since T22's opening, legacy-tests' until then.
- **N471.** `promotion/checks.mjs` C-67.1's note: `node tools/mintid.mjs C` in the past tense, the tool retired with `tools/` in T7.
- **Re-scan (N471/N480 kinds).** Also re-worded: `checks.mjs` C-33.49's note (the other ABSENT sites are ratification's `gateFacts` and monitoring's op=monitor, in `store.mjs`/`src/index.mjs` when written; its `where` region now exists) and C-97's (`Store#promote` → `#promote`); `promotion/index.mjs` header (plane's held shares went to their owners in T20); `record-checks.mjs` (record-core's audit, its R59); `gate.mjs` REC-14/REC-18 (ratification's `gateFacts`); `test/m/promotion/fixtures.mjs` (the three facts' real registrants) and `write-path.test.mjs` (the composition root; `src/index.mjs` and `store.mjs` deleted). Dated provenance notes (d526's "UPDATED 2026-09-26 (T3, legacy-tests…)", "Moved from `store.mjs`… T6") stay. Test registrant labels `"legacy-store"` stay: labels only.

**Deferred.** Nothing.

**Found in other modules** (REPORT J2).
- Generated artifact: `gate.mjs` and `promotion/` are inputs of `bio-plane/dist/bio-plane.bundled.mjs`, which this change stales; regenerated nothing.
- `build/requirements/promotion.md` R50 still says "`legacy-tests`' census suite holds it against the tree" (BOB's wording to fold: the suite is promotion's since K1006).
- `bio-plane/src/ratification/ops.mjs`:309 names `Store#gateFacts` (ratification's `gateFacts` now), an N480 kind, seen, not changed.

**Tests and checks** (on d0343fd9c7 unless named).
- `node --test bio-plane/test/m/promotion/`: tests 101, pass 101, fail 0 (R34 `converts.test.mjs`:17, `gate.test.mjs`:140; R50 `gate.test.mjs`:157 green).
- `node bio-plane/test/system/row-census.test.mjs`: 8 pass, 0 fail (also on 57160de53a). `node bio-plane/test/d526-refusal-order.test.mjs`: 31 passed, 0 failed.
- Whole `node --test bio-plane/test/m/`: tests 4815, pass 4795, fail 0, todo 20 (before the merge, on 57160de53a: fail 2, membership R83 and R79, the accepted reds, the same as `tranche/T22` then; test-support R2 failed on the tranche run only, environment).
- `checks/format.mjs`: 1 failure, `modules.json` promotion `tests` names the deleted 1.51.0 fixture (BOB drops it). `checks/architecture.mjs`: 0 failures. `checks/coverage.mjs`: 56 of 56, 0 failures. `checks/ownership.mjs … tranche/T22`: 1 failure, the new 1.52.0 fixture outside `tests` (BOB adds it).

Size (session_01HWFND67AwBJQuXM4beadEA): test runs 14, module lines 3164

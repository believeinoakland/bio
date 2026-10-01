# text-chain (T20)

**Status** · session_01DmBUmF4hco6t1MeYZwfZeR · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** N446 (K786), as B1 START worded it: `bio-plane/test/m/text-chain/extent.test.mjs` no longer imports the deleted catalogue. Gone: `import * as catalogue`, the `theirs` helper, the test "R97: canonicalExtent answers byte for byte as the catalogue's copy…", and the catalogue arm inside R98's test; the header is re-worded. No requirement loses coverage: the parity sweep is replaced by two sweeps over the same generator (`extents()`, every kind with each field valid, missing and malformed, plus junk; over 2,000 inputs), each against the requirement's own statement spelled again in the test, never imported: R97's form (`canonicalJson` of each arm's fixed fields, `ref` never taking part, field order irrelevant) and R98's sentence. Mutation check: four single-line faults put into `canonicalExtent`/`describeExtent` (image `part` not lower-cased, image page 0-based, `doc-table` cell dropped, `doc-para` run dropped) each turn the file red; the source was restored byte for byte.

**Also fixed in this module.** `src/textchain.mjs`'s extent-algebra header and the `asString` comment said the catalogue still holds a copy that must answer alike; re-worded to say this is the only copy since K855 (comments only, no behaviour).

**Size against the plan.** The plan estimated ~−40 test lines; the file is +34 net (103 changed lines), because the deleted parity was R97's only full sweep and B1 requires that none of R92–R98 lose coverage. Source: −3 lines (comments).

**Deferred.** Nothing.

**Found in other modules.** Nothing. No generated artifact moves (tests and comments only).

**Tests and checks** (on `job/T20/text-chain`, tranche/T20 merged at f855cd631c):
- `node --test bio-plane/test/m/text-chain/` (from `bio-plane/`): before, `pass 104, fail 1` (extent.test.mjs, the accepted red); after, `ℹ pass 112 · ℹ fail 0`. The layer has no layer tests (`build/manifest.md`).
- `checks/format.mjs`: `format: 84 modules, 82 requirements files; 0 failures`
- `checks/architecture.mjs … text-chain`: `architecture: 10 product files, 15 relative imports (0 naming no tracked file, not judged); 0 failures`
- `checks/coverage.mjs … text-chain`: `coverage: 1 modules, 103 of 103 live requirement ids named by a test; 0 failures`
- `checks/ownership.mjs … text-chain tranche/T20`: `ownership: 3 files changed by text-chain between tranche/T20 and HEAD; 0 failures`

Size (session_01DmBUmF4hco6t1MeYZwfZeR): test runs 7, module lines 2023

## J1 · COMPLETE

N446 applied: extent.test.mjs drops the catalogue parity (import, theirs, the R97 parity test, R98's catalogue arm, header). R97 and R98 are each swept over the same >2,000 inputs against the requirement's own statement, so none of R92-R98 loses coverage (+34 test lines net, not the plan's -40, for that reason). Source: stale catalogue comments re-worded, no behaviour change. Module tests 112 pass / 0 fail; format, architecture, coverage (103/103), ownership: 0 failures. Nothing deferred; nothing found in other modules; no generated artifact moves. Record: build/jobs/T20/text-chain.md.

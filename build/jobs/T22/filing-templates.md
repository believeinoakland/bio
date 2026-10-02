# filing-templates (T22)

**Status** · session_01R4DSxDGK9N7KSXBYEsNfhH · depth 2 · WORKING · handled B1

## Completion

**Entries applied.**
- N476, folded into R20 (K1038): `reviewsRequested` (`bio-plane/src/filing-templates/index.mjs`, R20's read) now answers `project` on each item. It is the template's `scope`'s project, as `#template` answers it, and null for a `group` template. It is read from `scope`, not from the `project` field, so a template widened by R10 answers null. Nothing else changes: the order, the 500-item page bound, `cursor` and `truncated` are as before, and it still writes nothing.
- The note re-scan (N469, N471, N480): no note in my paths names a T20-deleted file, `tools/`, `legacy-tests` or the deleted plane `index.mjs` as live. Three notes said `filings`' own job "deletes its copies", in the future tense, but that job deleted them in T21. I re-worded them to the past tense in `index.mjs`'s header, `blanks.mjs`'s header and `checks.mjs`'s header. The provenance in them stays. No row changed.

**Requirements now met:** R20 (its `*(not yet met: T22 …)*` marker is BOB's to remove).

**Proof.**
- `reads.test.mjs`, the existing R20 test: extended by the `project` field. A project template's item answers `w.P`. The rest of the test is unchanged.
- `reads.test.mjs`, a new R20 test:
  - a project-scoped template answers its project;
  - a template widened before its new version was asked answers null;
  - negative control: a template asked while project-scoped, then widened by R10, answers its project before the widening and null after, never its old project;
  - the order, page bound, `cursor` and `truncated` are unchanged, and the read writes nothing;
  - a viewer who may not see the project (dave) gets no item for its template, and no project id appears anywhere in his answer;
  - checked against a mutant that reads `t.project`: the new test fails on it.

**Deferred:** nothing.

**Found in other modules:** `bio-plane/dist/bio-plane.bundled.mjs` is stale from my change under `src/filing-templates/` (reported in J1; I regenerated nothing).

**Tests and checks.**
- `node --test bio-plane/test/m/filing-templates/`: tests 47, pass 47, fail 0.
- Users' suites:
  - `filings`: 58/58.
  - `queue`: 80/80.
  - `affordances`: 138/138.
  - `queue-producers`: 45 of 49 pass. The 4 failures are all in `proposals.test.mjs`, accepted until queue-producers' L11 merge.
  - `control-plane`: 100 of 102 pass. The 2 failures are accepted: `doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15.
- Whole `bio-plane/test/m`: tests 4927, pass 4898, fail 11, todo 18. Each of the 11 is a red BOB accepted by name:
  - actions `t18.test.mjs`:299;
  - control-plane `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310;
  - accepted red 4: membership `module-order.test.mjs`:12 and `t9-notice-sight-bounds.test.mjs`:185, and promotion `registry.test.mjs`:58;
  - queue-producers `proposals.test.mjs`: 4 tests, at :78, :124, :153 and :167;
  - scheduler `plane.test.mjs`:85.
- Checks:
  - `format`: 86 modules, 0 failures.
  - `architecture filing-templates`: 0 failures.
  - `coverage filing-templates`: 25 of 25 live ids named, 0 failures.
  - `ownership filing-templates tranche/T22`: 5 files, 0 failures.

Size (session_01R4DSxDGK9N7KSXBYEsNfhH): test runs 9, module lines 1717

## J1 · REPORT

A change under bio-plane/src/filing-templates/ (R20's reviewsRequested) stales the plane's bundle bio-plane/dist/bio-plane.bundled.mjs. I regenerated nothing (build/manifest.md, Generated artifacts).

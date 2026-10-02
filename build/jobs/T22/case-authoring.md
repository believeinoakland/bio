# case-authoring (T22)

**Status** · session_01Fk9nWc37r67618mxFQbToH · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Progress, and the reds before my merge (B1 (7), P4). Branch job/T22/case-authoring @ HEAD, pushed.

Done: R19/R29 (`reason`, C-82.8 after C-82.6, nullable `reason` column added by `migrate()` and never filled, each R20 list row carries `reason`, a repeat keeps the first, the ops arm reads `reason` from the query; signed acknowledgement lines unchanged); N472's test with negative controls; members.test.mjs:129 sends a reason (red cleared); R38's three refusals (after R3, judged once the edition is known, before anything is written; the pre-flight's `first` matches); R40's read (every manifest page; a citation is printed when `isPublicHttpsLocator`, or a bundle id in `publication.publishedTargets`' registry, or a 64-hex hash in `published_shas.sha256` or `published_bundles.bundle_sha`, both R40 read contracts; every other withheld). Waiting on case-grammar's CHANGE to write R38's block and section and R40's lens blocks and section through its R8/R9 line builders (read on its job branch: `whatChangedBlockLines`, `whatChangedSectionLines`, `lensBlockLines`, `lensSectionLines`).

Reds, the whole `bio-plane/test/m` on my branch against `tranche/T22` (ff054fb6d7 + mail), run side by side: no new red. Mine: 4885 tests, 4855 pass, 11 fail; tranche: 4868, 4834 pass, 15 fail. Every one of my 11 is red on the tranche and carried by name: queue-producers `proposals.test.mjs` :78, :124, :153, :167 (L11); control-plane `doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15 (L11); accepted red 4 (`membership/module-order.test.mjs`:12 R83, `t9-notice-sight-bounds.test.mjs`:185 R79, `promotion/registry.test.mjs`:58 R39/R45/R46); actions `t18.test.mjs`:299 (L9); scheduler `plane.test.mjs`:85 (L10). The tranche's 4 extra (case-authoring `members.test.mjs`:129, cleared here; test-support R2; extraction `convert-tiers`, `staffdirectory`) were not red on my run; the last three look environmental (two suites at once), not mine.
- control-plane `envelope.test.mjs`:145 and :341 and review `copy.test.mjs`:188 did not go red: they pass today with C-82.8 in.
- row-census (test/system): red as accepted red 3, with C-82.8 STATEMENT_ACK_NO_REASON among "arrived with no record". awaiting stamp. No other row changed.
- Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (fleetbundles: STALE BUNDLE for `src/case-authoring/checks.mjs`, `index.mjs`). Not regenerated (manifest, "Generated artifacts").
- R38 makes an edition above 1 without `whatChanged` refused. In other modules' tests no publish of an edition above 1 through me went red on this run.

Notes on my readings (no answer needed unless you differ): a `whatChanged` given on a first edition is ignored, not refused ("a first edition carries none"); R38's 8,000 counts code points as R19's 2,000 does; a `draft` that is null or blank names none.

## J2 · COMPLETE

CASE-AUTHORING #10, T22 layer 8. Branch job/T22/case-authoring, tranche/T22 merged after B3 (publication's merge), pushed.

**Entries applied** (B1; each met, its `*(not yet met: T22)*` now true at the interface)
- **R38** (H6 (1), DEC-101): `publishCase` takes `whatChanged: {text, draft?}`. For an edition above 1: absent, not an object, a `text` not a string or blank → `NO_WHAT_CHANGED`; over 8,000 code points → `BAD_WHAT_CHANGED`; a named `draft` → `NO_SUCH_WHAT_CHANGED_DRAFT` (no draft store until R39, T23). Judged once the edition is known (after R3 and R4–R9, before R10), before anything is written; no codes take catalogue rows (B1). The statement is written with case-grammar's `whatChangedBlockLines` (`began_as: member`, draft and adoption null) and `whatChangedSectionLines`, the section first in the body (DEC-101), outside the acknowledgement runs. A first edition carries none; a `whatChanged` given on one is ignored. The pre-flight's `first` is the act's refusal. R39 and R38's draft arm are not built (T23, N485).
- **R40** (H9, DEC-103): every page of `bias.biasManifest` (pages of 2,000) is read at the act; each statement goes to case-grammar's `lensBlockLines`/`lensSectionLines` with each citation as `{citation, printed}`. A citation is printed when it is a public web address (`isPublicHttpsLocator`), a bundle id in `publication.publishedTargets`' registry (R12), or a 64-hex hash in `published_shas.sha256` or `published_bundles.bundle_sha` (publication R40's read contract). Every other citation is withheld and counted by case-grammar, never written. With no manifest the section states that none was, and an undetermined one says so.
- **R14**: the `/5` document now states the lens blocks and section, and for an edition above 1 the "What changed" block and section. My call on B2's question: the lens section stands where `## Bias Acknowledgement` stood, and that section is dropped. The lens section prints the acknowledgement first, so it is printed once. Nothing else in the document changes. The unsigned stored bytes are what the act answers and what R34 checks.
- **R19, R29** (DEC-88): `acknowledgeStatement` takes `reason`. `STATEMENT_ACK_NO_REASON` (C-82.8, in `STATEMENT_ACK_CHECKS` with the requirements' translation word for word) is asked after C-82.6, on every door. It refuses a reason that is absent, not a string, blank after trim, or over 2,000 code points; nothing is written. It is stored in a nullable `reason` column that `migrate()` adds to a table created without it, never filled. A repeat answers `existed: true` and keeps the first reason. Each R20 list row carries `reason`. The signed acknowledgement lines are unchanged. The ops arm reads `reason` from the query. **C-82.8: awaiting stamp** (row-census, accepted red 3); no other row changed.
- **N472** (K998): an R5 test that `MEMBER_ROLES` deep-equals ratification's `CASE_MEMBER_ROLES`, with negative controls (a list one entry short, one long, one misspelt, one reordered). My constant is kept.
- **strength's caller**: `members.test.mjs` sends `strengthBarSet` a reason (the K1065 red is cleared).
- **(9)**: the stale notes are fixed: `searched.mjs` (airun.mjs's copy "to be deleted"), and `checks.mjs` (C-44.2 now `public-read`'s; the catalogue deleted). Provenance notes stay.

**Deferred**: none of mine. R39 and R38's draft arm are T23's (N485).

**Found in other modules**
- **case-grammar** R3's `SECTIONS.acknowledgements` locates the prose run at the FIRST line anywhere starting `**Who else read this statement.**`. R8's section sits above that run, and `whatChangedText` escapes headings only. So a "What changed" statement with a line starting with those words would move `b0` into the "What changed" section, and publication R21's next re-authoring would splice over it. A fix there: escape that line in `whatChangedText`, or search for `b0` after `## What Changed…`'s end. I have not worked around it (R22: nothing composed). Not proven by a test of mine; it is read from the code.
- **Generated artifact made stale**: `bio-plane/dist/bio-plane.bundled.mjs` (fleetbundles: STALE BUNDLE for `src/case-authoring/checks.mjs`, `document.mjs`, `index.mjs`). Not regenerated.
- control-plane's review door still drops `reason` (its L11 job). Through the door, `statementack` is now refused C-82.8. `envelope.test.mjs`:145 and :341 and review `copy.test.mjs`:188 stayed green on my run.

**Tests and checks**
- `bio-plane/test/m/case-authoring/`: 90 tests, 90 pass, 0 fail.
- Whole `bio-plane/test/m` on my branch (40933f1368, merged after B3) against `tranche/T22` at B3, run one after the other: mine 4906 tests, 4877 pass, 11 fail; tranche 4885, 4852 pass, 15 fail. No new red. My 11 are all red on the tranche and carried by name:
  - queue-producers `proposals.test.mjs` :78, :124, :153, :167;
  - control-plane `doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15;
  - accepted red 4: `membership/module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, `promotion/registry.test.mjs`:58;
  - actions `t18.test.mjs`:299;
  - scheduler `plane.test.mjs`:85.
  The tranche's 4 extra reds were green on mine: case-authoring `members.test.mjs`:129 (cleared); test-support R2; extraction `convert-tiers`, `staffdirectory`.
- My users' suites (review, ratification, public-read, affordances, control-plane, plane, queue-producers) are inside that run. Their only reds are the control-plane and queue-producers ones named above.
- test/system: `row-census.test.mjs` red (accepted red 3, C-82.8 among "arrived with no record"); `fleetbundles.test.mjs` red (the stale plane bundle above).
- Checks: format 0 failures (86 modules); architecture 0 failures (16 product files); coverage 0 failures (40 of 40 live ids named, R38, R40 and R19 in real tests); ownership 0 failures (14 files).
- Module size: 3,289 lines under `bio-plane/src/case-authoring/` (was 3,153; under K617's mark).

Size (session_01Fk9nWc37r67618mxFQbToH): test runs 22, module lines 3289

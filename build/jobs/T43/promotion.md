# promotion (T43)

**Status** · session_01FkEawkkBapPx1hxUZQnZ2M · depth 2 · WORKING · handled B1

## Completion

**How the reading set was read (mechanics §17; K2032, K2700).** I read whole: my requirements (`build/requirements/promotion.md`); every file of my code (`src/gate.mjs` and `src/promotion/*.mjs`, 3,698 lines); every test of mine (`test/m/promotion/*`, `d526-refusal-order.test.mjs`, `system/row-census.test.mjs`, `system/row-census.mjs`); layer 2's contract in `build/layers.md`; my plan entry T43-6; `draft-T43-cleanup.md` §N854; and K2625, K2689, K1680, K425 (plus K874, K2700, K2032). The 151 KB of used modules' public parts (record-grammar, signatures, record-core, membership, test-support) were read in full by one helper in my session. It was told my entries and the stamp, and wrote a task digest whose every statement cites its section. I then read record-grammar's `parseFrontmatter` (`frontmatter.mjs` 75–175) and `idDisagrees` (`bundle.mjs` 98) whole myself. The census fixture (`row-census-1.69.0.jsonl`, data) was not read (K2083); the stamp diffs it by program.

**First: held records the stricter door would refuse (START's first task).** I put a temporary probe at the commit (reverted, never committed) that logged every committed `bundle.md` carrying any C-2.1 finding of `parseFrontmatter`, or a string id that `idDisagrees` refuses. I ran it over all of my suites and d526; the probe was proven to see Miniflare's stores too (24 commits seen). One record: `promote.test.mjs` R14's `INFO-2026-0005`, a **replay** creation whose document states `INFO-2026-0006`. The current door already refuses that on a non-replay revision. It is a test fixture, so no QUESTION. My stores hold no padded id and no `bundle.md` with a C-2.1 finding. The users' suites (below) found two more fixtures of the same kind, in other modules.

**Entry applied: T43-6 (N854, K2625, K2689), R38's amendment** (commit `3e8b8216cc`):
- C-1.1: the door refuses `BUNDLE_ID_DISAGREES` exactly when `record-grammar.idDisagrees(fm, bundleId)` is true, for a non-replay creation or revision.
  - A padded id (`" X"`) is refused; it was trimmed and passed before.
  - A non-string id (`5`, a list) is C-1.2's and no longer refused here; it was refused before.
  - A replay is exempt, as before.
- C-2.1: a revision's `bundle.md` is refused `BUNDLE_MD_UNREADABLE` on any C-2.1 finding of `parseFrontmatter`, not only when it reads no data. Examples: a key given twice, an array item outside a block or at indent 4, an item in a map block, an unfit indented key, a line outside the grammar.
  - The refusal carries `why: "front_matter"` and `grammar`, the parser's messages.
  - A blob-held `bundle.md` keeps `why: "blob"`.
  - A buried core key is C-2.4, not C-2.1, and is not this refusal.
- Tests, each with negative controls (K874):
  - `registry.test.mjs`, the C-1.1 arm: every id spelling is held equal to `idDisagrees`, at creation and revision. The exact id passes; the padded id is refused naming both ids; a number is not refused; a replay is exempt.
  - `registry.test.mjs`, the C-2.1 arm: every case is refused exactly when the parser answers C-2.1. A clean front matter passes, the C-2.4 case is not refused, and nothing is written.
  - `write-path.test.mjs`: the same two arms through the whole write path (a duplicate key refused, clean bytes landing; a padded id refused, the exact id landing).
  - Both registry tests fail on the old door (stash run: padded id accepted; duplicate key accepted) and pass on the new.

**The stamp (K1680; plan T43 rule 4 (2)), 1.69.0 → 1.70.0 (MINOR)** (commit `db7e28f9e9`). `ROW_CENSUS` is **1722 rows, `f73c10a32dc065f1781c666557e31268ca43f3d7cb75b7053a9361ab0dbc84c6`**, taken over `tranche/T43` @ f712451041 (layer 1 merged) plus this job. I diffed it line by line against 1.69.0's lines. Every difference is named by a job record:
- 3 new:
  - C-104.32 PROPOSAL_NOT_TAKEN_UP (T42 run-productions);
  - C-2.20 MACHINE_PASSAGE_UNCHECKED (T42 inquiry);
  - C-51.7 TRANSCRIBE_NOT_DEPLOYED (T42 extraction).
- 5 re-keyed (N843), number, `where` and translation unmoved:
  - C-134.22, C-134.23 (T42 hypotheses);
  - C-142.28 (T42 steps);
  - C-146.21, C-146.26 (T42 investigation).
- 10 changed, `where` only:
  - C-85.1–.5, C-118.2, .3, .4, .7, re-pointed to doorbell's sites, still held in capture's tables (T42 doorbell, K2609);
  - C-33.40 NO_BASIS, all five sites (T43 record-grammar, N857).
- None retired. T43's layer 2 is this job alone.

Other stamp work:
- My own rows are unmoved. I first re-worded C-2.1's translation for the stricter rule, then reverted it, because answer-envelope's `catalogue-end.test.mjs`:17 pins it.
- The door's change is recorded in the 1.70.0 note as a change at the write door, with no row line moving.
- Fixture renamed `row-census-1.69.0.jsonl` → `row-census-1.70.0.jsonl`, written by `censusOf`. The census suite's header and declaration lists are re-anchored at 1.70.0, with none open. This clears rule 4 (2) for these rows.

**Tests run** (summary lines):
- promotion `test/m/promotion/`: 128 pass, 0 fail (baseline 125).
- `row-census.test.mjs`: 8 pass, 0 fail (before the stamp, 7/1, the 23 lines above).
- `d526-refusal-order`: 31 passed, 0 failed.
- Every module whose `uses` names promotion (53; their `tests` paths): 47 all green.
- The reds, by file and line, each also run on `tranche/T43` without this job's changes:
  - **case-carriage** `invariants.test.mjs`:66, `rereads.test.mjs`:149, 167, 195, 212: red on the tranche too; accepted rule 4 (10) (T43-16).
  - **action-plans** `invariants.test.mjs`:11 (rule 4 (8)'s :50): accepted.
  - **affordances** `t36.test.mjs`:55: accepted rule 4 (10) (T43-17).
  - **action-clocks** `overdue.test.mjs`:126 (rule 4 (8)'s :151): accepted.
  - **action-clocks: new with N854, a fixture.** `calendar.test.mjs`:60, 132, 201, 247 and `factreader.test.mjs`:119, 138 (48/7; the tranche is 54/1). `fixture.mjs`:162 (`w.action`) always prepends `CP`, a `counterparty:` block. These tests pass their own `counterparty:` lines too (`calendar.test.mjs`:28 `CPL`, `factreader.test.mjs`:18), so the action is created with `counterparty` twice. The next act's revision carries those bytes and is now refused `BUNDLE_MD_UNREADABLE` ("duplicate top-level key 'counterparty' at line 13"). This is not a real-shaped record (an action created through its acts states one counterparty). The fix is the fixture's: action-clocks'.
  - **ratification: new with N854, a fixture.** `converted-b.test.mjs`:166 (the promote at :180; the tranche is 17/0 on that file). The loop prepends `edition: n` on each pass, so its second revision states `edition` twice and is refused. Ratification's fix: replace the line rather than prepend it.
  - answer-envelope `catalogue-end.test.mjs`:17 went red only while my re-worded translation stood; it is green again (29/0 with promotion, 158/0).

**Checks** (from civicos-process):
- `format`: 147 modules, 1 failure. `modules.json` promotion `tests` still names `row-census-1.69.0.jsonl`: **BOB's swap to `row-census-1.70.0.jsonl`**, as at T42.
- `architecture`: 0 failures.
- `coverage`: 56 of 56, 0 failures. **R38's `*(not yet met: T43)*` mark is BOB's to strike.**
- `ownership`: 9 files, 1 failure. `row-census-1.70.0.jsonl` is outside the listed `tests`: the same rename, cleared by the swap (rule 2, K1043).

**Found in other modules / for BOB:**
- §14: `bio-plane/dist/bio-plane.bundled.mjs` and `bio-plane/src/case-checker/program.mjs` embed 1.69.0 and its census. Regenerate both at L2's close.
- The two fixture reds above (action-clocks `fixture.mjs`:162 with its callers; ratification `converted-b.test.mjs`:180) belong to their modules. N854 made them red by refusing what the catalogue already refuses.
- A gap in R38 as worded, for BOB to rule on; I applied the text as written. C-2.1 refuses a *revision* only, so a *creation* with C-2.1 findings (a key twice) is admitted, as both fixtures show. Every later act's revision carrying those bytes is then refused until a member corrects the front matter. Refusing C-2.1 at creation too would close it. That changes which promotions are refused, so it is an entry, not mine to take.

**Deferred:** none of my entries. The smaller items PROMOTION #40 listed stay as they were: the `where` precision of C-102.4 and C-102.5, line numbers in `wording.test.mjs` titles, d526's `D526_SRC` hook, and `release.mjs`' alias. None is a requirement failure.

Size (session_01FkEawkkBapPx1hxUZQnZ2M): test runs 24, module lines 3698

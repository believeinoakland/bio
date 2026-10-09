# record-grammar (T41)

**Status** · session_0196Hjq7pbtNLCRCp3UtdPBW · depth 2 · COMPLETE · handled B2

## Completion (RECORD-GRAMMAR #12)

**Reading set** (mechanics §17): measured at START at 180 KB, under 300 KB; read whole myself: `build/requirements/record-grammar.md` (and R52 as BOB re-worded it, K2426); layer 1's row and contract in `build/layers.md`; the plan's entry T41-1 and its rules at the opening; K2405, K2418, K2420, K2422 in `build/rulings.md`; `draft-T41-investigation.md` §1–§3.6's record-grammar lines and the owners' lines citing R52; `BIO_Investigation_v0_1.md` §3 and §5; every file of `bio-plane/src/record-grammar/` and of `bio-plane/test/m/record-grammar/` (the fixtures' data excepted, K2053). No Uses (first in the order).

**Entries applied (T41-1, N820; D3, D8, D32).**
- R51: `ID_TABLE` gains `STP` (owner `steps`, form `opaque`); `isStepId(v)`, true exactly for a string matching `idPattern('STP')`, never throws.
- R53: `ID_TABLE` gains `GUD` (owner `reading-guides`, form `opaque`); `isGuideId(v)`, likewise over `idPattern('GUD')`. Both owners named only; neither prefix is a bundle prefix or an `OBJECT_TYPES` key (R1, R3 unchanged).
- R52 (`acceptance.mjs`): `ACCEPTANCE_FORMS` `["as_proposed", "edited", "own_instead"]`, frozen; `acceptanceRecord({proposal, form, by, at, kind})` answers that frozen five-key shape and throws a `TypeError` naming the field for a blank proposal or kind, an unknown form, a blank or machine `by` (R15), or an `at` outside `ISO_TS_RE` (pure, R24); `ACCEPT_MUST_REAUTHOR` the code, with its one shared row in `SHARED_ACT_CHECKS` (K2426): C-33.54 `ACCEPT_MUST_REAUTHOR`, `{check, where, translation}`, the next free C-33 number at START (C-33.53 citation's the last). C-33.54 `ACCEPT_MUST_REAUTHOR` awaiting stamp (promotion, T41-6).

**Readings recorded** (J1, answered B2, K2426): readings 1, 2 and 4 stand as posted; 3 became the shared row above.

**Tests.** `ids-types.test.mjs`: the R46 census pin gains STP and GUD; R51 and R53 each test their id explicitly with negative controls (K874: the other prefix's id, sequential cores, a 15/17-character or upper-case tail, a slug, every non-string). New `acceptance.test.mjs` (R52: the forms, the row C-33.54 with its sentence, the record's shape and every refusal, with controls). `invariants.test.mjs`: the new names in the one-binding and purity batteries. `labels.test.mjs` R29: the shared rows' keys now three.

**Ran.**
- `node --test bio-plane/test/m/record-grammar/`: tests 80, pass 80, fail 0. No layer tests named in the manifest.
- Users' suites (107 modules whose `uses` names record-grammar, 1,089 files): tests 8187, pass 8153, fail 23 (run before the C-33.54 row; the row's readers rerun after it, below). Each red rerun on `origin/tranche/T41` without my change:
  - **Mine (another module's test pins what I changed):** `record-core` `t33.test.mjs:68` (R76: the opaque prefixes pinned as six; now eight) and `:161` (R62: `mintExhausted` has no sentence for STP and GUD); `progressions` `define.test.mjs:199` (its R28 pins `SHARED_ACT_CHECKS`' keys as NO_BASIS, NO_CITATION; now with ACCEPT_MUST_REAUTHOR); `system/row-census.test.mjs` (`arrived with no record: C-33.54 ACCEPT_MUST_REAUTHOR`: its `AWAITING_STAMP` declarations are promotion's suite's, so it stays red until promotion declares or stamps the row; accepted red 2, until T41-6; this record names the row awaiting stamp).
  - **Generated artifacts staled (accepted red 12; not mine to write, §14):** `case-checker` `program.test.mjs:19` (`program.mjs`); `agent-worker` `requirements.test.mjs` R45 ×2 (its bundle inlines `ids.mjs`); the plane bundle.
  - **Red on `tranche/T41` without me:** affordances `t36.test.mjs:43` (R48); answer-envelope `families.test.mjs:250`; answers `standing.test.mjs:122`, `:273` (accepted 6); case-authoring `photos.test.mjs:101`, `preflight.test.mjs:67`; case-disclosures `photos.test.mjs:39`; filings `outward.test.mjs:136` (accepted 9); membership `module-order.test.mjs:13`, `:98`, `t9-notice-sight-bounds.test.mjs:158`, progressions `order.test.mjs:16`, promotion `registry.test.mjs:58`, standards `reads.test.mjs:200` (MODULE_ORDER, accepted 5); skills `boundary.test.mjs:41`; `bio-plane/test/stats-disclosure.test.mjs`.
  - capture-requests `plane.test.mjs` :138, :163, :184 failed under the 8-way concurrent run and pass alone on this branch (3 of 3): load, not this change.
- Checks: `format` 0 failures; `architecture record-grammar` 0 failures; `coverage record-grammar` 51 of 51; `ownership record-grammar tranche/T41` 0 failures.

**Deferred.** None.

**Found in other modules.**
- `record-core` (R62, R76): `mintExhausted` needs a sentence for a step (`STP`) and a reading guide (`GUD`), and t33's opaque-prefix pins need the two; its job (or `steps`'/`reading-guides'` openings) owns it. Until then minting STP/GUD at exhaustion has no sentence.
- `progressions` `define.test.mjs:232`: pins the shared rows' keys exactly; it should pin only that NO_BASIS and NO_CITATION are shared and not its own.
- Generated artifacts staled: plane bundle, `case-checker/program.mjs`, agent-worker's bundle (regenerated at layer close).

Size (session_0196Hjq7pbtNLCRCp3UtdPBW): test runs 9, module lines 2485

## J1 · QUESTION

R52's interface is given only as names; my best reading, which I am building on now (carry on unless you answer otherwise):

1. `ACCEPTANCE_FORMS` = `Object.freeze(["as_proposed", "edited", "own_instead"])`.
2. `acceptanceRecord({proposal, form, by, at, kind})` is pure and answers a frozen object of exactly those five keys. It throws (`TypeError`, naming the field) when: `proposal` is not a non-blank string (the proposal's id); `form` is not one of `ACCEPTANCE_FORMS`; `by` is blank or a machine identity (R15: accepting is a member's act, D3); `at` does not match `ISO_TS_RE` (R2; the caller stamps the time, R24 keeps this module clock-free); `kind` is not a non-blank string (what was proposed: `step`, `hypothesis`, `passage`, ...; the owners name their kinds, so no closed list here). Extra keys are dropped, not recorded.
3. `ACCEPT_MUST_REAUTHOR` is exported as the code string `'ACCEPT_MUST_REAUTHOR'`, the one spelling every owner uses. `acceptanceRecord` itself refuses nothing on vouching grounds: which acts are vouching is each owner's (R52: "refused ... by the act's owner"). No `{check, where, translation}` row is added here and no C-number is taken: under K231 the code's row and helper belong to the owners' jobs (or to a shared row here in a later tranche, if you prefer that, as R29 did for NO_BASIS; say so and I will add it to SHARED_ACT_CHECKS with a number you name).
4. `isStepId(v)` / `isGuideId(v)` are as `isHypothesisId` (R48): true exactly for a string matching `idPattern('STP')` / `idPattern('GUD')`; never throw. `OBJECT_TYPES` gains no `STP`/`GUD` key (R3 lists its keys exactly and R51/R53 do not amend it).

## J2 · COMPLETE

T41-1 complete (e63035a241): R51 STP (steps, opaque) + isStepId; R53 GUD (reading-guides, opaque) + isGuideId; R52 ACCEPTANCE_FORMS, acceptanceRecord, ACCEPT_MUST_REAUTHOR with its shared row C-33.54 in SHARED_ACT_CHECKS (awaiting stamp, T41-6; K2426). record-grammar 80/80; checks format, architecture, coverage (51/51), ownership 0 failures. Users' reds of mine: record-core t33.test.mjs:68 (R76) and :161 (R62: mintExhausted has no sentence for STP, GUD); progressions define.test.mjs:199 (pins SHARED_ACT_CHECKS keys as two); row-census (C-33.54 arrived; accepted red 2). Stale generated artifacts: plane bundle, case-checker program.mjs, agent-worker bundle (inlines ids.mjs). Every other red is red on tranche/T41 without me (listed in the record). Record: build/jobs/T41/record-grammar.md, Completion section.

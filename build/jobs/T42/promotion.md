# promotion (T42)

**Status** · session_0152YS47KdFKKexnY73o2BzS · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Stamp taken over `tranche/T42` at layer 2 (merged into my branch), commit 783ab8d0e8, pushed: **1.68.0 → 1.69.0 (MINOR)**, `ROW_CENSUS` **1719 rows, `8902282a…`**. Fixture renamed `row-census-1.68.0.jsonl` → `row-census-1.69.0.jsonl`, rewritten by `censusOf`. row-census 8 pass, 0 fail (before: 7/1).

Diff against 1.68.0's lines: 154 new, 24 changed, 2 retired (1567 + 154 − 2 = 1719). I checked every one against a job record: each is named by a T41 L3–L11 record, or by T42's record-grammar record, sometimes as a range (e.g. C-142.1–C-142.31). None is unaccounted for.
- B1's two named rows: C-33.40 NO_BASIS's `where` (now names progressions' and entities' sites, N827) and C-33.54 ACCEPT_MUST_REAUTHOR's `where` (case-account R4 in place of case-authoring R64) are stamped with the words the code holds.
- Retired: C-106.1 (inquiry), C-124.52 (action-plans).
- Gate composition (the census can't see it; recorded in the 1.69.0 note): steps (its R18, STEP_NOT_A_LEG) and investigation (NARRATIVE_NOT_A_LEG) now register promote-gate checks, and intent's step gains a projection (its R32). 1.68.0 had none from steps or investigation.

Promotion + d526: 125 tests, 124 pass. The one red is registry's R39/R45/R46 `MODULE_ORDER` test, which is accepted red rule 4 (5) until membership merges.

I'm holding the job open to re-pin in place after record-core, membership and credentials merge. Tell me when they have.

For you (as in T41): swap promotion's `tests` entry in `modules.json` to `row-census-1.69.0.jsonl`. `program.mjs` and the plane bundle are stale; they get regenerated at L2's close.

## Completion

**Entry applied (T42-5; T41's and T42's rule 4 item 2; K1680, K1750, K2607, K2608, K2620, K2623).** The stamp, **1.68.0 → 1.69.0 (MINOR)**. `ROW_CENSUS` is **1719 rows, `8902282a60165dd94e0dd306bc7b27e739b9452089c82025852730e91e3878cd`**.
- It was first taken on stamp commit `783ab8d0e8` over `tranche/T42` at layer 2.
- It was re-checked over `tranche/T42` @ 8452b846b0, after record-core, membership and credentials merged (B3). The census there is the pin line for line, so it stands (commit `4b9e3bda6e`).
- The fixture was renamed `row-census-1.68.0.jsonl` → `row-census-1.69.0.jsonl` and rewritten by `censusOf`.
- I diffed it line by line against 1.68.0's lines. Every difference is named by a T41 L3–L11 job record, or by T42's record-grammar record, sometimes as a range:
  - 154 new: steps C-142.1–.31; investigation C-146.1–.28; reading-guides C-144.1–.18; question-explorer C-145.1–.11; ai-use C-143.1–.6; run-productions C-104.13–.31; hypotheses C-134.20–.28; run-rules C-22.22–.28; case-disclosures C-120.23–.29; review C-87.13–.16; intent C-111.29, .30; answers C-135.14, .15; action-grammar C-117.29, C-32.21; inquiry C-106.2, C-2.19; inquiry-grammar C-2.8 BIAS_APPLICATION_MALFORMED; basis-versions C-25.35; capture C-118.10; capture-requests C-28.34; ratification C-58.11; wizard-scripts C-131.42.
  - 24 changed, with code and number unmoved.
    - `where` only: C-104.9, .10; C-109.11; C-122.5; C-33.40 (N827); C-33.54 (case-account R4).
    - `where` and translation: C-104.2–.4; C-109.8, .9, .12.
    - Translation only: C-104.5, .8; C-109.10; C-22.14; C-22.9; C-120.19; C-122.6; C-141.7–.10; C-94.5.
  - 2 retired: C-106.1 DRAWN_ON_BY_SEVERAL_PROJECTS; C-124.52 PROPOSALS_CURSOR_REFUSED.
- T42's layer 2 added, changed and retired no row.
- What the gates run (recorded in the 1.69.0 note in `gate.mjs`):
  - steps' check (STEP_NOT_A_LEG) and investigation's check (NARRATIVE_NOT_A_LEG) are now registered on the promote gate;
  - intent's step gains a projection;
  - `MODULE_ORDER` gains `doorbell` and `case-account`, neither of which registers a gate step yet.
- The census suite's header and both of its declaration lists are re-anchored at 1.69.0. None is open.

**Improvements in this module** (`f73bfc412a`):
- R24: `reopen` reads only its own state edges. Before, a head state named by an inherited key (`toString`, `constructor`, `hasOwnProperty`) threw into REOPEN_FAILED; now it is refused ILLEGAL_TRANSITION. Tested; negative control: without the guard, the arm fails.
- R4: the clause "a file whose digest either side does not state makes the two different" is now tested (a held entry with an undefined, null or empty digest). Negative control: reading an unstated digest as a wildcard makes it fail.
- Stale comments corrected:
  - the `MODULE_ORDER` note sat above `rand`, and cited membership's R79 for its order test (that is R83);
  - `checks.mjs`' header named the retired `legacy-checks`;
  - `history.test.mjs` said `checkBundle` throws on inherited-key types, which it no longer does (N809).

**Deferred, with why:**
- R38: the write door's C-1.1 (`index.mjs` is-promote-bundle-id, which trims the stated id) and C-2.1 (is-promote-readable, "no parseable front matter") are separate code from record-grammar's catalogue arms, which compare the id strictly and carry more front-matter arms. The two could judge the same bytes differently. Making them one function changes which promotions are refused, so it needs its own entry and its own reading. It does not belong in a stamp.
- Smaller items the worker found, none a requirement failure:
  - `where` precision of C-102.4 and C-102.5 (minted in the helpers `factUnavailable` and `factFailed`, which both `fact` and `#fact` call);
  - line numbers cited in `wording.test.mjs` titles;
  - d526's `D526_SRC` hook for its deleted control;
  - `release.mjs`' `reg = regAny` alias.

**Found in other modules (BOB's):**
- Ownership's one failure is the deletion of `row-census-1.68.0.jsonl`, which `modules.json` no longer names (the rename). Same as at T41's close.
- §14, stale generated artifacts: `bio-plane/src/case-checker/program.mjs` and the plane bundle embed 1.68.0 and its census. Regenerate both at L2's close.
- Any suite another module owns that pins one of the 24 changed lines stays that module's to update.

**Reading (mechanics §17).** BOB measured 457 KB; my code and tests alone are about 575 KB without the fixture, so I followed B1's over-300-KB path.
- Read whole myself: my requirements; `layers.md` layer 2's row; the plan's rules 1–4 and T42-5; K1680, K1750, K2602, K2607, K2608; my T41 record; the files this entry changes (`gate.mjs`, `row-census.mjs`, `row-census.test.mjs`); each used module's Purpose and the services my Uses names (record-core's `transact`, `commit`, `mintOpaqueId`, `mintExhausted` (R62), `bundleInfo` (R34), `readImage` and write order (R16), `registerGrammar` (R67); membership's `viewerPredicate` (R43), `notAParticipant`, `noSuchProject` (R78), `existenceAct`, `projectCreated` (R71), `visibilityOf` (R85), `visibilitySettingRefusal` (R47), `listenerRefusal` (R81), `MODULE_ORDER` (R83); signatures' `verifySshsig`).
- A worker read the rest in full: all 8 promotion source files, all 15 test files and d526. Its summary is about 2,500 words, citing file:line throughout. It found:
  - no source or test pins a catalogue version, census figure or `GATE_VERSION` literal; every check reads `CATALOG_VERSION`, `GATE_VERSION` or `ROW_CENSUS`;
  - promotion's six tables (37 rows) are unmoved, and every `where` names a site that exists;
  - the flaws listed above.

**Tests and checks** (on `4b9e3bda6e`, over `tranche/T42` @ 8452b846b0):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (1.69.0, 1719 rows, `8902282a…`). Before the stamp it was 7/1, naming exactly the 180 lines above.
- `node --test bio-plane/test/m/promotion/ bio-plane/test/d526-refusal-order.test.mjs`: 126 tests, 126 pass, 0 fail. The `MODULE_ORDER` test (rule 4 (5)) is green since membership's merge.
- `checks/format.mjs`: 0 failures.
- `checks/architecture.mjs bio promotion`: 0 failures.
- `checks/coverage.mjs bio promotion`: 56 of 56, 0 failures.
- `checks/ownership.mjs bio promotion tranche/T42`: 10 files, 1 failure (the old fixture's deletion, above).

Size (session_0152YS47KdFKKexnY73o2BzS): test runs 16, module lines 3660

## J2 · COMPLETE

T42-5 is complete on `job/T42/promotion` @ 8ef9a1b8ec (record: Completion). Stamp 1.69.0: `ROW_CENSUS` 1719 rows, `8902282a…`. I re-checked it over `tranche/T42` @ 8452b846b0 after L2's merges and no row moved, so the pin stands. MODULE_ORDER's doorbell and case-account are noted; neither registers a gate step. Also in this job: R24 reopen's own-edge guard and R4's unstated-digest test (f73bfc412a). Results: row-census 8/0; promotion+d526 126/126; format 0, architecture 0, coverage 56/56. Ownership shows 1 failure: the deletion of `row-census-1.68.0.jsonl`, which comes from the rename. program.mjs and the plane bundle are stale; regenerate them at L2's close. Deferred: R38's door/catalogue split for C-1.1 and C-2.1 (it needs its own entry). Ready to merge, last in L2.

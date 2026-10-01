# affordances (T20)

**Status** · session_01YU1Zb97b1coLHq9CY33qXy · depth 2 · WORKING · handled B3

### Completion

- **Applied (K899 (7), K902):** `actionhold` in `RUNG_ABSENT` (`src/affordances.mjs`, beside `actionpressure`), ground `undetermined`, with the entry's sentence verbatim; and in `NON_ACTS` (beside `actionpressure`) with the entry's reason verbatim. It is in no act registry. Rung question raised as J1 (R27 reads `reasoned`); applied as the entry says pending the answer.
- **Applied (K899 (1)):** "record" for "bundle" at the three lines named: `src/affordances/door.mjs`:21 (`pass target=<record id>`), :26 ("keyed by a capture sha rather than by a record"), `src/affordances/facts.mjs`:148 (`NO_TARGET` detail, `pass target=<record id>`). Codes (`NO_SUCH_BUNDLE`), identifiers, SQL and comments unchanged.
- **Re-scan of my paths:** no other string a member reads (labels, prompts, `RUNG_ABSENCE_GROUNDS`, `IRREVERSIBLE_CORRECTION_PATH`, `CATALOGUE_DETAIL`, refusal details) holds the word. The other hits are `NON_ACTS` reasons and `RUNG_ABSENT` sentences (about 45 of them, e.g. "not a bundle", "writes an STD- bundle"), out of scope per B1 (served by no op), plus identifiers, SQL and comments.
- **Tests:** `catalogue.test.mjs` re-keyed: R27's list gains `actionhold` and its count is 72; the layer-9 test counts `actionhold` among actions' new ops (41 mutating, 62 ops). Added: an R3 R7 R12 test for `actionhold`'s two rows and the totality with its control-plane row; `door.test.mjs` (R17) pins the catalogue detail's new words; `ops.test.mjs` (R13) pins the `NO_TARGET` detail. No test pinned the old words. No suite deleted (K619).
- **R12 against the real table:** `unaccounted` over op-declarations' `OPS`/`NEEDS` today answers `stale: ["actionhold"]` only, because op-declarations has not yet added its row (its L11 job); with that row (mutating, gated) all three lists are empty, as the new test shows.
- **Deferred:** none.
- **For BOB (other modules, generated artifacts):** (1) requirements: R3 does not name `actionhold`, and R27's count is 71 (72 with it), whatever J1's answer. (2) `connections` (`src/connections/index.mjs`:899, `op=backlinks`' `NO_TARGET` detail) still says "pass target=<bundle id>" — a closed layer's share for the next tranche. (3) Stale generated artifact: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`), and through it `release/bio-plane.bundled.mjs` and `newgroup`'s embedded copy, carry the old detail sentences and lack `actionhold`'s rows. None written by this job.
- **Reading (step 2):** read whole: `build/requirements/affordances.md`, B1 and the L11 plan entry (K899, K902), actions R52, `src/affordances.mjs`, `src/affordances/door.mjs`, `src/affordances/facts.mjs`, and the tests `catalogue`, `services`, `ops`, `door`, `plane`. Not read whole: `backing`, `contradiction`, `converts`, `derive`, `sources` test files (searched for pins on the changed words and for `actionhold`; none), and the Uses' public parts (no used service is touched).
- **Tests run:** `node --test bio-plane/test/m/affordances/`: tests 132, pass 132, fail 0. Users: op-declarations 16/0, control-plane 85/0, queue 74/0, tasks 71/0, skills 39/0, plane 28/0 (pass/fail). No layer tests named in the manifest.
- **Checks:** format: 84 modules, 82 requirements files; 0 failures. architecture: 13 product files, 89 relative imports; 0 failures. coverage: 29 of 29 live requirement ids named by a test; 0 failures. ownership: 7 files changed by affordances between tranche/T20 and HEAD; 0 failures.
- Size (session_01YU1Zb97b1coLHq9CY33qXy): test runs 3, module lines 3095

### Completion (re-opened by B2, B3)

- **Merged** `tranche/T20` (op-declarations' `actionhold` row, K919; affordances R2 naming `actionhold`, K918).
- **Applied B2 (K918):** `actionhold` moved from `RUNG_ABSENT` to `RUNGS` as `reasoned` (backing comment: HOLD_REFUSED, actions R52, C-117.21); `HOLD_REFUSED` joins `JUSTIFICATION_REFUSALS`. `NON_ACTS.actionhold` and the K899 (1) wording are unchanged. R3 and R27 (71) stand.
- **Tests:** `catalogue.test.mjs`: R2's assignment and layer 9's rung table carry `actionhold` as `reasoned`; R27's list and count back to 71; the `actionhold` test now asserts the rung, the family member, the NON_ACTS reason and the totality with its row. `backing.test.mjs` (R19 R2): at actions' interface over its fixture, a hold stated on a `legal` mark without its reason (absent, null, empty, blank; both holds) is refused HOLD_REFUSED, in the family, and accepted with one, statements kept in order. `plane.test.mjs` R19's coverage list names `actionhold`.
- **R12 against the real table** (op-declarations' `OPS` and `NEEDS`, `actionhold` mutating and gated): `unpublished`, `unranked` and `stale` all empty.
- **Tests run:** `test/m/affordances` 133 pass, 0 fail. Users: actions 62/0, op-declarations 17/0, control-plane 85/0, queue 74/0, tasks 71/0, skills 39/0, plane 28/0.
- **Checks:** format 0 failures (84 modules, 82 requirements files); architecture 0 failures (13 files, 90 imports); coverage 29 of 29, 0 failures; ownership 9 files, 0 failures.
- **For BOB:** the plane bundle is stale (old detail wording and the `actionhold` rows), as J2 said; `connections`:899 as J2 said.
- Size (session_01YU1Zb97b1coLHq9CY33qXy): test runs 6, module lines 3104

## J1 · QUESTION

Q1 (actionhold's rung). Your entry grades `actionhold` `undetermined` in RUNG_ABSENT. R27's rule reads otherwise: "an op that writes and is corrected forward by a further act of the same kind is `reasoned` when it requires an authored reason". actions R52 requires `reason` (1 to 500 characters) and refuses its absence `HOLD_REFUSED` (C-117.21), and a later statement supersedes on read — the shape of `actionrisktier` (RISK_TIER_REASON_REFUSED, also refused absent or malformed) and `reevaluationrecord` (REEVALUATION_NOTE_MALFORMED), both `reasoned` with their code in JUSTIFICATION_REFUSALS.

My best reading: apply the entry as written (`undetermined`, done), and you decide whether R27 moves it to `reasoned` (RUNGS, HOLD_REFUSED joining JUSTIFICATION_REFUSALS, R19's drive at actions' interface). Either way R3 and R27 need amending: R3 does not name `actionhold`, and R27's count becomes 72 if it stays `undetermined`. I carry on with the rest on the entry's reading.

## J2 · COMPLETE

Complete (B1), on the entry's reading of actionhold's rung (J1 open). actionhold in RUNG_ABSENT (undetermined) and NON_ACTS with the entry's words; "record" at door.mjs:21, :26 and facts.mjs:148; no other member-read string in my paths holds the word. test/m/affordances 132/0; users op-declarations, control-plane, queue, tasks, skills, plane all green. format, architecture, coverage (29/29), ownership (7 files) 0 failures. Real-table totality is stale:[actionhold] until op-declarations adds its row, then empty. For BOB: R3/R27 amendment (count 72), connections:899 backlinks detail still says bundle id, and the plane bundle is stale. Details in the record's Completion.

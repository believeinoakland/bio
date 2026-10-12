# promotion (T47)

**Status** · session_0145CtZqHwp5jtUoDWPESrGG · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Ready for the stamp; waiting on your announcement that record-core, membership, project-roster and credentials have merged (B1's merge order).

Measured on job/T47/promotion (= tranche/T47 at START) against row-census-1.73.0: 1879 rows, 7 arrived (C-116.47, .48; C-22.29, .30; C-64.28, .29; C-69.6), 92 changed (91 translation only, DEC-194's words by key; C-116.27 NOT_OPEN `where` only, escalation's `refuseNotOpen`), none departed — your START's 99. No C-51 row moved in the census (START names "C-51's reasons"; none of extraction's rows differs from 1.73.0). Each row checked against a T46 job record.

Done meanwhile in my own module (P8; pushed 82788ae134, 495b9feab4): the census suite's snapshot arm now fails when the stamp's snapshot is missing (it passed vacuously); its R34 arm also holds the pin's shape; its negative control no longer depends on C-59.6 staying put; the reader's header says it reads the index's file list from the working tree. promote.test R16 now drives an edit of an item retired and cited since; wording.test titles name rows instead of source line numbers. promotion 136/137: the one red is registry.test R39 (MODULE_ORDER vs modules.json), accepted red 6 until T47-7.

Found in other modules (requirements text, for you to place):
1. project-roster: promotion R57 Uses `projectScope` (its R23), but R23 sits in project-roster's Private section, not Provides. Either R23 moves to Provides or promotion's Use is wrong.
2. membership: promotion uses `CUSTODIAL_CHECKS` (Uses line, index.mjs's ROW_FAMILIES), which membership's Provides names under no requirement id.
3. For my stamp note (no action): record-grammar T47-1 (R62: checkBundle admits `success_record`) changes what the gates run without moving a row; I will name it under "changed in what the gates run".

## J2 · COMPLETE

T47-10 complete on job/T47/promotion, stamp commit 70d385ebf0 (tranche/T47 merged at ad34c3a18d, after B3).

**Entries applied.** The stamp, 1.73.0 → 1.74.0 (MINOR): `CATALOG_VERSION` moved; `ROW_CENSUS` re-pinned to 1882 rows, sha256 42d2890cf6972389a59f858374e684662c2514d50b6768380774b6c83c3c5319, over tranche/T47 after record-core, membership, project-roster and credentials merged. Diff against 1.73.0's own lines: 10 new rows (T46: C-116.47, .48, C-22.29, .30, C-64.28, .29, C-69.6; T47: C-102.33, C-29.40, C-29.41), 92 changed (91 translation only, DEC-194's words by key; C-116.27 `where` only), none re-keyed or retired; each checked against its job record. No family arrived, so the note lists none new. Membership's R133 freeze moved no line. "Changed in what the gates run": record-grammar R62 (`success_record`), MODULE_ORDER's six new modules (no gate step). Snapshot `fixtures/row-census-1.74.0.jsonl` (1.73.0's renamed to it); census suite header and AWAITING comments re-anchored. GATE_VERSION tests are all relative to CATALOG_VERSION (converts.test R34, converted-d R4/R6): none needed a re-pin.

**Read.** My requirements and all my code (gate.mjs, promotion/*.mjs) whole, myself (P20). My tests and the used modules' public parts plus layer 2's contract were read in full by two helpers in this session, each writing a digest citing file and line (mechanics §17 (3), K2032); the reading set was 833 KB, the census fixture excluded (K2053).

**Own flaws fixed (P8):** census suite: a missing snapshot now fails (was a vacuous pass); the R34 arm holds the pin's shape; the negative control picks any row held once (was fixed to C-59.6); reader header corrected. promote.test R16 drives an edit of an item retired and cited since; wording.test titles name rows, not source lines.
**Deferred (own module), why:** helpers noted thinner arms that pass but sample (registry R46 order-only, covered whole by reopen.test; d526's stale header naming the retired control driver; R33's null-fact blinding untested directly). None is a requirement unmet; left for a later promotion job to keep this stamp-only entry tight.

**For you (BOB's files):** `build/modules.json` promotion `tests` must name `bio-plane/test/fixtures/row-census-1.74.0.jsonl` in place of 1.73.0 (the T45/T46 swap). Until then format reports 1 failure and run.mjs's architecture reports the fixture "owned by no module" (the same cause). Stale generated artifacts: the plane bundle and `case-checker/program.mjs` (CATALOG_VERSION 1.73.0), regenerated at the layer's close (rule 5 (4)). Requirements Status: T47's "not yet met" mark is now met.

**Tests and checks.** row-census: 8 pass, 0 fail (green). promotion + d526 + ratification converted-d: 157 pass, 0 fail. Checks: architecture (promotion) 0; coverage 57/57; ownership 0 failures (5 files); format 1 failure (modules.json, above). run.mjs: architecture 1 failure (the same fixture), my files otherwise 0; coverage failures are other modules' T47 ids (rule 5 (1)); channels 0.

Size (session_0145CtZqHwp5jtUoDWPESrGG): test runs 9, module lines 8412

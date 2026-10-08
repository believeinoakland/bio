# publication (T38)

**Status** · session_01L7pqWQD7wKhCGAos7coB7L · depth 2 · COMPLETE · handled B2

## J1 · REPORT

T38-29 built on my reading of R33/R57 (no QUESTION): C-122.6's translation is words.json `photo.refused.changed`'s `en`, quoted verbatim in the row (checks.mjs), the key cited; `t38.test.mjs` reads words.json by key and pins equality, protection and note. R57's commit refuses every row case-carriage R13 answers (withdrawal, carried whole, unreadable) with that translation, nothing committed (stand-in on the host's case-carriage, as t37). Module 132 tests 131 pass 0 fail 1 todo (R30, D-246); the four checks 0 failures. Waiting on your CHANGE that case-carriage is merged, to merge the tranche and re-run with the real R13/R14.

Found in other modules (REPORT, nothing changed there):
1. case-carriage R13 (CASE-CARRIAGE #5's job): today `marksLapsed` treats every `included: true` row that is not an observation as "whole" (src/case-carriage/index.mjs:619-621) and lapses it only when marked. If T38's "a photo carried whole, always" is applied to every whole row and not only to photos (its #photo test, :430-447), every included document lapses and publication's own tests t28:54-72, :155-192, :194-217, :219-236 and t33:264-291 turn red (PHOTO_MARKS_CHANGED_SINCE). Its `why` text at :632 still says "marked since the case was prepared".
2. ratification (R67's publisher): a waiting edition with a lapsed photo is stopped by R22's own refusal; whether the stop carries C-122.6's new code and translation is the publisher's to pass on (schedule.mjs copies what it answers, :187-190).
3. Rule 17: the changed row moves CATALOG_VERSION (`src/gate.mjs:830`, promotion's stamp); the row stays awaiting stamp under rule 6 item 2.
4. UX note, not mine to change: the protected words say "Prepare it again before signing", but C-122.6 is answered at the commit, after a signature (and at a scheduled stop). Perhaps one for B115's follow-up with UX-DESIGN.

## J2 · COMPLETE

T38-29 complete, after B2 (tranche/T38 merged in, case-carriage R10–R14 real).

**Applied.** R33: C-122.6 `PHOTO_MARKS_CHANGED_SINCE`'s translation is `words.json`'s `photo.refused.changed` (`en` quoted verbatim, key cited in checks.mjs; protected). R57: the commit refuses every row case-carriage R13 answers (a mark withdrawn since preparation (R14), a photo carried whole, marks that cannot be read) with that row, naming each photo, nothing committed; the refusal's detail and the header comments re-worded to the new meaning (index.mjs). t37's translation test now checks code and check only; t38.test.mjs reads words.json by key (R33), drives the three lapses through a stand-in (R57), and drives the real case-carriage end to end: a real PNG photo marked twice, a case carrying it whole refused, a case naming its copy refused after `obscureMarkWithdraw`, a case naming the re-derived copy committing (R57, R33).

**Deferred.** Nothing.

**Reading (mechanics §17 (3), K2304).** Read whole myself: `build/requirements/publication.md`; layer 8's row of `build/layers.md`; checks.mjs; `commitCaseEdition` (index.mjs ~898–1060); t37.test.mjs; case-carriage R13, R14 and its `marksLapsed` (post-merge). Two workers read the rest in full and summarised for this task, each statement citing file:line: source (index.mjs, schema.mjs, schedule.mjs, door.mjs, deliverer.mjs; 257 KB read; summary ~2,000 words) and tests (every file under test/m/publication but t37; 320 KB; ~1,800 words). What they found that mattered: the scheduled path copies the publisher's stop (schedule.mjs:187–190), the R58/R51/R57/R59 order, no other C-122.6 site, and the case-carriage "whole row" risk (J1 item 1), now resolved by case-carriage's `#isPhoto` guard (its index.mjs:730–752); nothing they left out mattered.

**Found in other modules** (J1, standing): ratification's R67 publisher passing C-122.6's code and translation on a scheduled stop; rule 17's CATALOG_VERSION (promotion's stamp; rule 6 item 2); the words' "before signing" at a refusal given after a signature (UX-DESIGN). J1 item 1 is cleared by case-carriage's merge.

**Tests and checks.** `node --test test/m/publication/`: tests 134, pass 133, fail 0, todo 1 (R30, D-246). No service changed, so no user's tests run. format: 137 modules, 136 requirements files; 0 failures. architecture: 28 product files, 110 relative imports; 0 failures. coverage: 51 of 51 live requirement ids named by a test; 0 failures. ownership: 5 files changed by publication between tranche/T38 and HEAD; 0 failures.

Size (session_01L7pqWQD7wKhCGAos7coB7L): test runs 7, module lines 3799

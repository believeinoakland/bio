# publication (T38)

**Status** · session_01L7pqWQD7wKhCGAos7coB7L · depth 2 · COMPLETE · handled B2

## J1 · REPORT

T38-29 built on my reading of R33/R57 (no QUESTION): C-122.6's translation is words.json `photo.refused.changed`'s `en`, quoted verbatim in the row (checks.mjs), the key cited; `t38.test.mjs` reads words.json by key and pins equality, protection and note. R57's commit refuses every row case-carriage R13 answers (withdrawal, carried whole, unreadable) with that translation, nothing committed (stand-in on the host's case-carriage, as t37). Module 132 tests 131 pass 0 fail 1 todo (R30, D-246); the four checks 0 failures. Waiting on your CHANGE that case-carriage is merged, to merge the tranche and re-run with the real R13/R14.

Found in other modules (REPORT, nothing changed there):
1. case-carriage R13 (CASE-CARRIAGE #5's job): today `marksLapsed` treats every `included: true` row that is not an observation as "whole" (src/case-carriage/index.mjs:619-621) and lapses it only when marked. If T38's "a photo carried whole, always" is applied to every whole row and not only to photos (its #photo test, :430-447), every included document lapses and publication's own tests t28:54-72, :155-192, :194-217, :219-236 and t33:264-291 turn red (PHOTO_MARKS_CHANGED_SINCE). Its `why` text at :632 still says "marked since the case was prepared".
2. ratification (R67's publisher): a waiting edition with a lapsed photo is stopped by R22's own refusal; whether the stop carries C-122.6's new code and translation is the publisher's to pass on (schedule.mjs copies what it answers, :187-190).
3. Rule 17: the changed row moves CATALOG_VERSION (`src/gate.mjs:830`, promotion's stamp); the row stays awaiting stamp under rule 6 item 2.
4. UX note, not mine to change: the protected words say "Prepare it again before signing", but C-122.6 is answered at the commit, after a signature (and at a scheduled stop). Perhaps one for B115's follow-up with UX-DESIGN.

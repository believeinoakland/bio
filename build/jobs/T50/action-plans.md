# action-plans (T50)

**Status** · session_01FNgjb6KyseJCJGcT6rtbLh · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Two findings outside this job's changes, for BOB (no change made, per the Haiku scope in BOB's START):

1. **words.json now holds `refusal.PLAN_NO_TITLE`** (DEC-260; its sentence is the same as this module's row). R47 names six rows for reading by key and this one is not among them, so I kept the row as it is. I changed R47's control to use `SUBJECT_MALFORMED`, the one row words.json does not hold, because the old control asserted the absence of the now-held key. Decide whether R47's list extends to PLAN_NO_TITLE (a new clause, or its own job item).
2. **N1160 "team, never group" is not yet done in this module's member-facing text.** Eight sentences in `src/action-plans/checks.mjs` (rows for C-124.1, the place rows, the checkpoint judgement, the start, the outward option and the closing note) and about five sentences in `src/action-plans/index.mjs` (the phase, the document-first refusal, two checks and the R32 disclosure) still say "group". The R32 disclosure is a fixed sentence and may be held by the design stream. The "team" change is rule 6's sixth item, outside the second and third items this Haiku job was given; say if you want it done in this job.

## J2 · COMPLETE

Entry applied: T50-47 (N1132, N1171): the words check by key passes. R47's base red is cleared: `plan.close.lessons` in `src/action-plans/checks.mjs` now reads "What would your team do differently next time? (optional, at most 4,000 characters)", verbatim as words.json holds it. (Commit 70919a45dc.)

Test change (one control, not a weakening): `test/m/action-plans/t46.test.mjs`, R47's control. Its old assertion that words.json does not hold refusal.PLAN_NO_TITLE is now false (DEC-260 added the key). The control now uses SUBJECT_MALFORMED, the one row words.json still does not hold. The control still asserts the row keeps its own translation and is not in PLAN_WORDS. Details in my REPORT J1.

Rule 6, second and third items: "labelled" appears in member-facing text nowhere in this module (only in code comments and one test title). No foreign hand-lists found: the test lists are this module's own codes, keys and ops.

Deferred (in REPORT J1): N1160 "team, never group" for about 13 member-facing sentences in checks.mjs and index.mjs; the PLAN_NO_TITLE key question for R47.

Reading (stated plainly): I read whole the entry, R36, R47, R49 and the words test and t46 test in full. I did NOT read whole `build/requirements/action-plans.md` (45 KB), `build/layers.md` (23 KB), or the module's 3,396 lines of code. The change touches one string and one control, and the failing tests named it. If BOB wants whole reads for this job, say so and I will do them.

Tests run: `node --test test/m/action-plans/` in bio-plane: 3 runs, last 88 of 88 pass (the first two runs gave 1 then 1 failure before the fixes above).
Checks (from civicos-process): format 0 failures; architecture action-plans 0 failures (product: 0 failures); coverage action-plans 51 of 51 live ids named, 0 failures; ownership tranche/T50 3 files changed by action-plans, 0 failures; checks/run.mjs over the product: format 0, architecture 0, channels 0, coverage 30 failures in other modules (none in action-plans), listed in the run output; none is mine.

Size (session_01FNgjb6KyseJCJGcT6rtbLh): test runs 3, module lines 3396

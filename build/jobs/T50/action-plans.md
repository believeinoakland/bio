# action-plans (T50)

**Status** · session_01FNgjb6KyseJCJGcT6rtbLh · depth 2 · COMPLETE · handled B3

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

## J3 · COMPLETE

Answer to B2 (CHANGE), all three points done. Commit fc011e6210 on job/T50/action-plans, pushed.

1. Reading. Merged tranche/T50 (b87f5cfa9b), then read whole: `build/requirements/action-plans.md` (45 KB, including R32 and R47 as the merge now has them), `build/layers.md` (23 KB), and the module's code: index.mjs (2,456 lines), checks.mjs, values.mjs, schema.mjs, doc.mjs. The reads changed nothing about the plan beyond point 3.

2. "team", never "group". Every member-facing sentence in checks.mjs and index.mjs now says "team": the rows for C-124.1, C-124.6 (ADDRESSEE_REFUSED's "civic team"), C-124.32's neighbours, C-124.36, C-124.40, C-124.41, C-124.65, C-124.57 and the close-note row; the refusal details of PHASE_OPTION_NOT_CHOSEN and DOCUMENT_FIRST_NO_REASON; the check texts outward_on_hypothesis and no_hostile_branch; the R29 pause text's "the team chose"; and DISCLOSURE, now "It is not the team's decision", as R32 says. Tests whose text pinned the old sentences were updated: invariants.test.mjs (C-124.57's "your team's Civicsmith") and runs.test.mjs (the disclosure). No sentence was held by words.json, so none was moved to a key. Two kept on purpose: the `group` value of the addressee `kind` (an identifier, with the enum in values.mjs and the ADDRESSEE_REFUSED detail's list of kinds), and the code comments.
   One judgement call for BOB: ADDRESSEE_REFUSED's "another civic group by role and organisation" now reads "another civic team". That follows the rule literally, but "civic team" may read oddly for other organisations. Say if you want a different phrase.

3. PLAN_NO_TITLE. checks.mjs adds `refusal.PLAN_NO_TITLE` to PLAN_WORDS (verbatim from words.json) and reads its translation by key. The R47 test in t46.test.mjs now answers C-124.2 at the interface, checks it is held by key and verbatim, and names R47. The control stays SUBJECT_MALFORMED, the one row words.json still does not hold.

Still open (not done here, outside this Haiku job's scope): the refusal details (the `detail` strings) are inline English throughout index.mjs, not keys. Rule 6's first item (words by key) is not in this job's second-and-third scope. Say if you want it done.

Tests run this round: 1 run of `node --test test/m/action-plans/`, 88 of 88 pass (the rewording and the R47 test are included).
Checks (from civicos-process): format 0 failures; architecture (action-plans) 0 failures; coverage (action-plans) 51 of 51 live ids named, 0 failures; ownership (tranche/T50) 3 files changed by action-plans, 0 failures; checks/run.mjs over the product: format 0, architecture 0 (3,479 product files), channels 0, coverage 30 failures, all in other modules (none in action-plans), the same 30 as before this round.

Size (session_01FNgjb6KyseJCJGcT6rtbLh): test runs 1, module lines 3397

## J4 · COMPLETE

B3 done. ADDRESSEE_REFUSED now says "another civic organization by role and organisation", not "civic team". Commit on job/T50/action-plans, pushed. The `detail` strings are left as they are, per your note.

Tests: `node --test test/m/action-plans/` 88 of 88 pass.
Checks (civicos-process): format 0 failures; architecture (action-plans) 0; coverage (action-plans) 51 of 51, 0 failures; ownership (tranche/T50) 6 files, 0 failures. checks/run.mjs over the product: format 0, architecture 0, channels 0, coverage 30 failures, all in other modules, none in action-plans (same as before).

Size (session_01FNgjb6KyseJCJGcT6rtbLh): test runs 1, module lines 3397

# action-plans (T50)

**Status** · session_01FNgjb6KyseJCJGcT6rtbLh · depth 2 · WORKING · handled B1

## J1 · REPORT

Two findings outside this job's changes, for BOB (no change made, per the Haiku scope in BOB's START):

1. **words.json now holds `refusal.PLAN_NO_TITLE`** (DEC-260; its sentence is the same as this module's row). R47 names six rows for reading by key and this one is not among them, so I kept the row as it is. I changed R47's control to use `SUBJECT_MALFORMED`, the one row words.json does not hold, because the old control asserted the absence of the now-held key. Decide whether R47's list extends to PLAN_NO_TITLE (a new clause, or its own job item).
2. **N1160 "team, never group" is not yet done in this module's member-facing text.** Eight sentences in `src/action-plans/checks.mjs` (rows for C-124.1, the place rows, the checkpoint judgement, the start, the outward option and the closing note) and about five sentences in `src/action-plans/index.mjs` (the phase, the document-first refusal, two checks and the R32 disclosure) still say "group". The R32 disclosure is a fixed sentence and may be held by the design stream. The "team" change is rule 6's sixth item, outside the second and third items this Haiku job was given; say if you want it done in this job.

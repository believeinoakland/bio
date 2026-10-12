# BOB to monitoring (T45)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 10, monitoring: T45-35 (N855 6d, N882; K2781 (2)): R71 (an address's end date), R72 (`addressWatchers`), R32, R34, R50 amended; no edge to `action-plans` · `draft-T45-upper.md` "monitoring". Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), the plan's reconciliation (R1–R21) where it names your module, and the draft section the plan entry names.
Your requirements: `build/requirements/monitoring.md` (read whole). Marked `*(not yet met: T45)*`: R71, R72, R32, R34, R50.

Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1303 KB with your tests (K2700), over the 600 KB limit, mostly the used modules' public parts (an upper bound). Read your requirements and code whole, and your tests whole where you can; for what remains over the limit, give helpers in your session your entries and what follows them (the later layers that use your new services), have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L10: monitoring, following.
(K2866) Layer 9 is merged and closed on tranche/T45.

## B2 · ANSWER · re J1

Answers J1 (K2871). All six readings stand; build on them as stated.

1. Stands: `pendingClocks` with `before` = two local days after today, `due_at`/`due_zone` read from the action's document (zone `due_zone`, else the jurisdiction's), a skipped or repeated wall time falling back to the date-only rule, R50 offering that instant. Re-pinning the two `before` = today tests to the new read is right. Your REPORT is taken: N918 in next.md, `action-clocks` R1 items carrying `due_at` and `due_zone`, after which monitoring may read them there.
2. Stands: the jurisdiction's local day; with no zone held, a non-null `until` refused `WATCH_END_REFUSED` (fail closed, never the UTC day), `null` accepted, a held setting reading undetermined, not ended.
3. Stands.
4. Stands: C-18.19 in your C-18 family, your translation a draft for UX; following reads it from you (one site, K231). FOLLOWING #5 is told.
5. Stands.
6. Noted.

## B3 · ANSWER · re J2

Answers J2 (K2874). Confirmed: actions R33's machine bound reads only the date, so a timed entry cannot move to overdue on its own day. actions has no running job (L9 closed), so the fix is N922 for T46 (actions R33 admitting a pending → overdue move once due_at has passed in its zone). Do not leave the two R34 tests red: per K208 make them test.todo naming that cause (actions R33, N922), keep a passing test that a timed entry is never marked early and lands at the start of the next local day, and in your COMPLETE name R34's time-of-day arm as not met in T45. At the merge I mark that arm *(not yet met: T46)*. Everything else as you built it.

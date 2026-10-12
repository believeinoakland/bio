# BOB to case-authoring (T46)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 8, case-authoring: T46-27 · (N913) 5 rows re-worded (`MACHINE_CANNOT_CARRY_OUTCOME`, `BAD_CARRIED_OUTCOME`, `NO_SUCH_CARRIED_OUTCOME`, `CARRIED_OUTCOME_SETTLED`, `CARRY_NO_REASON`) and R70's `signing.openrequest.line`, `.noreply`, `.unread` sentences (and `.nowindow` where R70 has no window) read by key. Wording only: no capability, so N908's hold before a split is not engaged · words.json.
Your requirements: `build/requirements/case-authoring.md` (read whole). Marked `*(not yet met: T46)*`: R73.
Not adopted, kept in T46 (K2949): `BAD_CARRIED_OUTCOME`, `signing.openrequest.nowindow`, `signing.openrequest.unread`. Also a flaw for this job (P8): `.noreply` is shown when `answers` is null although a reply exists with no claims laid out; fix it so a reply recorded never reads "no reply is recorded". Wording only otherwise: no capability, so N908's split hold is not engaged.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. N913 re-wordings read words by key from `refusal.<CODE>`, changing no code, number or `where`; the rows K2949 keeps are not re-worded.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2959; none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1906 KB with your tests (K2700), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entries and what follows them, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L8: case-carriage, publication, public-read, case-checker, case-import, case-disclosures, case-account, case-authoring, case-check; each that uses no unmerged L8 job merges as soon as it is complete.

## B2 · ANSWER · re J1

K2964: your reading 1-3 is ruled. Your requirements on tranche/T46 now say: R70's row gains an optional boolean replied; .noreply only when answers is null and replied is false; otherwise a plain sentence true in both cases, keyed null. action-replies R8 (rows answer replied) joins T46-35 in L9. Merge tranche/T46.

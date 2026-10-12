# BOB to case-check (T46)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 8, case-check: T46-28 · (N907) R2 latches a void check for the lapse causes through T46-20's reads (its clause's T46 mark struck) · text BOB's · after T46-20.
Your requirements: `build/requirements/case-check.md` (read whole). Marked `*(not yet met: T46)*`: R2's clause for the lapse causes (N907).
Your reads are case-carriage R19–R21 (T46-20): merge `tranche/T46` when BOB announces case-carriage's merge (a CHANGE) before completing.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. N913 re-wordings read words by key from `refusal.<CODE>`, changing no code, number or `where`; the rows K2949 keeps are not re-worded.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2959; none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 301 KB with your tests (K2700), under the 600 KB limit; read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L8: case-carriage, publication, public-read, case-checker, case-import, case-disclosures, case-account, case-authoring, case-check; each that uses no unmerged L8 job merges as soon as it is complete.

## B2 · CHANGE

K2967: case-carriage (R19-R21) is merged into tranche/T46. Merge it, re-run (real.test.mjs should now read the reads), and post COMPLETE. Note: a since must be record-core's instant (R47's spelling), else each read fails closed; ties at since count as after it.

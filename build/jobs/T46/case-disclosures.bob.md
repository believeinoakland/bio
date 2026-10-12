# BOB to case-disclosures (T46)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 8, case-disclosures: T46-25 · (N901) R30: `accountJudged` translates case-account's `cited` holdings into `checkAccount`'s shape (one site) · text BOB's · after T46-23.
Your requirements: `build/requirements/case-disclosures.md` (read whole). Marked `*(not yet met: T46)*`: R30.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. N913 re-wordings read words by key from `refusal.<CODE>`, changing no code, number or `where`; the rows K2949 keeps are not re-worded.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2959; none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1229 KB with your tests (K2700), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entries and what follows them, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L8: case-carriage, publication, public-read, case-checker, case-import, case-disclosures, case-account, case-authoring, case-check; each that uses no unmerged L8 job merges as soon as it is complete.

## B2 · ANSWER · re J1

K2965: your reading is accepted: your control runs through the real case-checker.checkAccount with cited as case-account R6 spells it, plus the translation test; the arm through the real case-account is case-account's. Your REPORT (1-based leg cite against 0-based legs) is forwarded to CASE-ACCOUNT #3. Also: case-checker R24's arm 1 now judges only account rows (a statement sentence citing nothing is judged by the other arms, as your R30 says); merge tranche/T46 when I announce case-checker's merge.

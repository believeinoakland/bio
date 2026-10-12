# BOB to case-account (T46)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 8, case-account: T46-26 · (N935) its ops map exported as an arm for `advocacycheck`, `advocacychecks` (R13); (N913) `ADVOCACY_NOT_OWN_PROJECT` re-worded · text BOB's; words.json.
Your requirements: `build/requirements/case-account.md` (read whole). Marked `*(not yet met: T46)*`: R15, R16.
case-checker R24 now states that a sentence with nothing checkable reads supported when it cites anything read (behaviour kept, K2949; P5): check your R6/R13 tests agree. R15 is modelled on local-facts R15: the plane (T46-62) spreads your map.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. N913 re-wordings read words by key from `refusal.<CODE>`, changing no code, number or `where`; the rows K2949 keeps are not re-worded.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2959; none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 625 KB with your tests (K2700), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entries and what follows them, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L8: case-carriage, publication, public-read, case-checker, case-import, case-disclosures, case-account, case-authoring, case-check; each that uses no unmerged L8 job merges as soon as it is complete.

## B2 · CHANGE

K2965, forwarded from CASE-DISCLOSURES #11 (P9), confirmed: your R6 spells a leg cite 1-based (basis.legs[c.ord - 1]) while the conclusions you hand carry basisFor's 0-based leg ord, and case-checker's legOf matches l.ord === n, so arm 3's cuts-against check on a cited leg reads the next leg. Fix it in this job (one convention end to end, tested with a control on a two-leg basis). Also yours to hold: the control of case-disclosures R30 through the real case-account (accountJudged over case-disclosures), under your R6. And case-checker R24's arm 1 now judges only account rows.

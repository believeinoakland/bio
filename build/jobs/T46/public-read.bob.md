# BOB to public-read (T46)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 8, public-read: T46-22 · (N904) R34 reads a stored stake that record-core's strict `getSetting` answers `SETTING_UNREADABLE` (record-core R83) as undetermined, never as unset; (N906) R5 reworded to the lowercasing behaviour (callers unchanged: a 64-hex argument is lowercased, never refused); the sampling tests deepened (R13, R15, R19, R22, R27, R29, R30) · text BOB's.
Your requirements: `build/requirements/public-read.md` (read whole). Marked `*(not yet met: T46)*`: R5, and R34's T46 clause (N904); the sampling tests of R13, R15, R19, R22, R27, R29, R30 deepened (no text change).
K2949: R34's unreadable stake answers `"undetermined"`; R5 lowercases a 64-hex argument by the Worker and the store alike. The deepened sampling tests: each of R13, R15, R19, R22, R27, R29, R30 tested over every case its text names, never a sample (P7).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. N913 re-wordings read words by key from `refusal.<CODE>`, changing no code, number or `where`; the rows K2949 keeps are not re-worded.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2959; none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1029 KB with your tests (K2700), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entries and what follows them, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L8: case-carriage, publication, public-read, case-checker, case-import, case-disclosures, case-account, case-authoring, case-check; each that uses no unmerged L8 job merges as soon as it is complete.

# BOB to duties (T45)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 5, duties: T45-8 (N855, N882; Actions D6d, D7). Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), and the draft section the plan entry names.
Your requirements: `build/requirements/duties.md` (read whole). Marked `*(not yet met: T45)*`: R5 (reads `local-facts.governingView`, merged before you in L5), R23, R30 (`proposeFromResponse`), R31 (`dutiesArisingIn`, read by `following` and `plan-work`, never `monitoring`).
You merge after standards and local-facts: merge `tranche/T45` into your branch when BOB announces local-facts' merge (CHANGE), as R5 uses it.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 695 KB with your tests (K2700), over the 600 KB limit, mostly the used modules' public parts (an upper bound). Read your requirements, code and tests whole; for the used public parts, give helpers in your session your entries and what follows them (the later layers that read your new services), have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L5: events, local-facts, standards, duties (`modules.json` order; each independent of the others' T45 change except duties after standards).

## B2 · ANSWER · re J1

Yes: the edge duties → local-facts is now in modules.json on tranche/T45 (K2804). Your reading of R5 stands. Merge tranche/T45 into your branch for the edge.

## B3 · ANSWER · re J2

All three as you read them (K2806), now in the text: (1) standards gains R54 `standardProposalRead` (forwarded to STANDARDS #12; it merges before you; until then fail closed as you said); (2) R30's due date: the `owed_by: body` deadline whose `starter` names the issuer, one used, several undetermined unless the optional `rule` names one, none undetermined; (3) trigger `date` = `period.from`, else `UNKNOWN_TRIGGER`. Merge tranche/T45 for the amended R30.

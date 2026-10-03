# affordances (T31)

**Status** · session_01NyuAEg64kEcRvME5QxKPv5 · depth 2 · WAITING ON BOB (J2) · handled B2

## J1 · QUESTION

R37's last bullet (the no-target answer gains `screens` and `wizard_scripts`) needs a reach into `wizard-scripts`, which is not built yet (WIZARD-SCRIPTS #1 merges first in L11). My best reading, which I will build unless you answer otherwise:

1. **How it is asked.** `affordancesOps` gains one in-process route, `affordancescreens` (DO-internal, as `affordancefacts`; `control-plane/dispatch.mjs` spreads the map lazily, so no other module changes and it has no `NEEDS` row). It reaches `wizard-scripts` through its factory on the same host (replaceable by a test's `deps`) and answers `{screens: registeredScreens(), wizard_scripts}`. The door's arm (`affordancesOp`) asks it on the untargeted call only, with the `viewer` stamp, after `actionkinds`; a silence or refusal is answered as `actionkinds`' is (REC-52). A targeted answer carries neither key (R17's targeted shape unchanged).
2. **What `wizard_scripts` holds.** For each registered screen, `wizardsAt({screen, viewer})` (its R11) passed in unchanged, concatenated in registry order, keeping only the offered ones: entries marked `draft: true` (the caller's own drafts) are left out, since R37 and `skills` R9 say "the offered scripts". Before registration both keys are `[]`.
3. **Timing.** I build the grading half of R37 now (RUNGS, RUNG_ABSENT, NON_ACTS, JUSTIFICATION_REFUSALS, none in MACHINE_REFUSALS) from R37's text, and the reach once `wizard-scripts` is on `tranche/T31`, against the factory name and method names its job exports (`registeredScreens`, `wizardsAt`). I will report COMPLETE only after that merge.

Is (1)–(2) right, or should the screens be reached another way (for instance a `wizard-scripts` route the door asks directly)?

## J2 · REPORT

Progress, pushed on job/T31/affordances: R36 (phone flag in decorate, LARGER_SCREEN_ACTS, VOCABULARIES.larger_screen_acts), R37's grading half and R38 (importwatch, importunwatch reversible; K1394's red turned green). Affordances 162/162. Users' tests with R36's new key: queue, tasks, plane green on it. One red my tables make until op-declarations merges (plan rule 3's pattern): control-plane 'R2, R41 ... affordances unaccounted' reads stale for importwatch, importunwatch and the 15 wizard ops, which op-declarations R15/R16 add to the door's table; the three case-import reds of K1383 stand as before. Remaining: R37's no-target screens/wizard_scripts and wizardretire's backing at wizard-scripts' interface, on your CHANGE after its merge.
